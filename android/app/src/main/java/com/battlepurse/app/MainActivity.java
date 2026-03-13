package com.battlepurse.app;

import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Toast;
import android.webkit.JavascriptInterface;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.concurrent.Executor;

public class MainActivity extends BridgeActivity {

    private long lastBackPress = 0;

    private float startX = 0f, startY = 0f;
    private long startTime = 0L;
    private boolean pulling = false;

    private final float EDGE_THRESHOLD = 40f;   // px
    private final float SWIPE_THRESHOLD = 80f;
    private final float PULL_THRESHOLD = 150f;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 🔒 Disable screenshots & screen recording
        getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
        );

        // 🚫 Disable native pull-to-refresh & overscroll
        getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);

        // ✅ Enable JS & storage
        getBridge().getWebView().getSettings().setJavaScriptEnabled(true);
        getBridge().getWebView().getSettings().setDomStorageEnabled(true);

        // 🔍 Disable zoom
        getBridge().getWebView().getSettings().setBuiltInZoomControls(false);
        getBridge().getWebView().getSettings().setDisplayZoomControls(false);

        // 🖐 Expose Biometric to JS
        getBridge().getWebView().addJavascriptInterface(this, "AndroidBiometric");

        // ⚡ Gesture navigation & pull-down reload
        getBridge().getWebView().setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getActionMasked()) {
                    case MotionEvent.ACTION_DOWN:
                        startX = event.getX();
                        startY = event.getY();
                        startTime = System.currentTimeMillis();
                        pulling = false;
                        break;

                    case MotionEvent.ACTION_MOVE:
                        float currentY = event.getY();
                        if (startY < 80 && currentY - startY > 60) {
                            pulling = true; // pull-down detected
                            return true; // block native refresh
                        }
                        break;

                    case MotionEvent.ACTION_UP:
                        float endX = event.getX();
                        float endY = event.getY();
                        float diffX = endX - startX;
                        float diffY = endY - startY;
                        long elapsed = System.currentTimeMillis() - startTime;

                        // ⬇ Pull down → Reload
                        if (pulling && diffY > PULL_THRESHOLD) {
                            getBridge().getWebView().post(() -> getBridge().getWebView().reload());
                            return true;
                        }

                        // ⬅ Swipe from left → Back
                        if (startX < EDGE_THRESHOLD && diffX > SWIPE_THRESHOLD && elapsed < 500) {
                            if (getBridge().getWebView().canGoBack())
                                getBridge().getWebView().goBack();
                            return true;
                        }

                        // ➡ Swipe from right → Forward
                        if (startX > v.getWidth() - EDGE_THRESHOLD && diffX < -SWIPE_THRESHOLD && elapsed < 500) {
                            if (getBridge().getWebView().canGoForward())
                                getBridge().getWebView().goForward();
                            return true;
                        }

                        // ⬆ Swipe up → Home
                        if (startY > v.getHeight() - EDGE_THRESHOLD && diffY < -SWIPE_THRESHOLD && elapsed < 500) {
                            getBridge().getWebView().post(() ->
                                    getBridge().getWebView().loadUrl("https://your-home-page.com"));
                            return true;
                        }

                        // ⬆ Hold → Recents
                        if (startY > v.getHeight() - EDGE_THRESHOLD &&
                                diffY < -30 && diffY > -SWIPE_THRESHOLD &&
                                elapsed > 250) {
                            getBridge().getWebView().post(() ->
                                    getBridge().getWebView().evaluateJavascript("openRecents()", null));
                            return true;
                        }

                        break;
                }
                return false;
            }
        });

        // ⚡ Auto APK update check
        checkAppUpdate();
    }

    @Override
    public void onBackPressed() {
        // WebView navigation
        if (getBridge().getWebView().canGoBack()) {
            getBridge().getWebView().goBack();
            return;
        }

        // Double back to exit
        long now = System.currentTimeMillis();
        if (now - lastBackPress < 2000) {
            finish();
        } else {
            lastBackPress = now;
            Toast.makeText(this, "Press back again to exit", Toast.LENGTH_SHORT).show();
        }
    }

    // Biometric authentication exposed to JS
    @JavascriptInterface
    public void authenticate() {
        Executor executor = ContextCompat.getMainExecutor(this);

        BiometricPrompt biometricPrompt = new BiometricPrompt(
                this,
                executor,
                new BiometricPrompt.AuthenticationCallback() {
                    @Override
                    public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                        runOnUiThread(() -> getBridge().getWebView()
                                .evaluateJavascript("biometricSuccess()", null));
                    }

                    @Override
                    public void onAuthenticationFailed() {
                        runOnUiThread(() -> getBridge().getWebView()
                                .evaluateJavascript("biometricFailed()", null));
                    }

                    @Override
                    public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                        runOnUiThread(() -> getBridge().getWebView()
                                .evaluateJavascript("biometricFailed()", null));
                    }
                }
        );

        BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("BattlePurse Security")
                .setSubtitle("Verify to continue")
                .setAllowedAuthenticators(
                        BiometricManager.Authenticators.BIOMETRIC_STRONG |
                        BiometricManager.Authenticators.DEVICE_CREDENTIAL
                )
                .build();

        biometricPrompt.authenticate(promptInfo);
    }

    // Auto APK update
    private void checkAppUpdate() {
        getBridge().getWebView().post(() ->
            getBridge().getWebView().evaluateJavascript(
                "(async ()=>{" +
                "try{" +
                "const CURRENT_VERSION='1.0.1';" +
                "const res=await fetch('https://battlepurse.online/app-version.json',{cache:'no-store'});" +
                "const data=await res.json();" +
                "if(data.version!==CURRENT_VERSION){if(confirm(data.force?'New update required':'New update available')){window.location.href=data.apkUrl}}" +
                "}catch(e){console.log('Update check skipped');}" +
                "})()", null
            )
        );
    }
}
