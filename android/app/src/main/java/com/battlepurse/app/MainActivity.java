package com.battlepurse.app;

import android.os.Bundle;
import android.webkit.JavascriptInterface;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.concurrent.Executor;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Expose to JS
        bridge.getWebView().addJavascriptInterface(this, "AndroidBiometric");
    }

    @JavascriptInterface
    public void authenticate() {
        Executor executor = ContextCompat.getMainExecutor(this);

        BiometricPrompt biometricPrompt = new BiometricPrompt(
                this,
                executor,
                new BiometricPrompt.AuthenticationCallback() {

                    @Override
                    public void onAuthenticationSucceeded(
                            @NonNull BiometricPrompt.AuthenticationResult result) {
                        runOnUiThread(() ->
                                bridge.getWebView()
                                        .evaluateJavascript("biometricSuccess()", null)
                        );
                    }

                    @Override
                    public void onAuthenticationFailed() {
                        runOnUiThread(() ->
                                bridge.getWebView()
                                        .evaluateJavascript("biometricFailed()", null)
                        );
                    }

                    @Override
                    public void onAuthenticationError(
                            int errorCode,
                            @NonNull CharSequence errString) {
                        runOnUiThread(() ->
                                bridge.getWebView()
                                        .evaluateJavascript("biometricFailed()", null)
                        );
                    }
                }
        );

        BiometricPrompt.PromptInfo promptInfo =
                new BiometricPrompt.PromptInfo.Builder()
                        .setTitle("BattlePurse Security")
                        .setSubtitle("Verify to continue")
                        .setAllowedAuthenticators(
                                BiometricManager.Authenticators.BIOMETRIC_STRONG |
                                BiometricManager.Authenticators.DEVICE_CREDENTIAL
                        )
                        .build();

        biometricPrompt.authenticate(promptInfo);
    }
}
