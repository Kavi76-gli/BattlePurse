document.addEventListener("DOMContentLoaded", () => {

  /* ==========================
     1️⃣ AUTO APK UPDATE
  ========================== */
  async function checkAppUpdate() {
  try {
    // 🚫 Skip update check on localhost
    if (
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1"
    ) {
      console.log("Local mode: update check skipped");
      return;
    }

    const CURRENT_VERSION = "1.0.2";
    const res = await fetch("https://battlepurse.online/app-version.json", {
      cache: "no-store"
    });

    if (!res.ok) throw new Error("Network error");

    const data = await res.json();

    if (data.version !== CURRENT_VERSION) {
      const ask = data.force
        ? "⚠️ Update required to continue."
        : "New update available. Download now?";

      if (confirm(ask)) {
        location.href = data.apkUrl;
      } else if (data.force) {
        alert("You must update to continue.");
        location.reload();
      }
    }
  } catch (err) {
    // ❗ silent in production
    console.log("Update check skipped:", err.message);
  }
}



  /* ==========================
     2️⃣ BOTTOM NAVIGATION
  ========================== */
  const navItems = document.querySelectorAll(".nav-item");
  const indicator = document.querySelector(".active-indicator");
  const currentPage = location.pathname.split("/").pop() || "gamezone.html";

  navItems.forEach(item => {
    const page = item.dataset.page;

    if (page === currentPage) {
      item.classList.add("active");
      moveIndicator(item);
    }

    item.addEventListener("click", () => window.location.href = page);
  });

  function moveIndicator(item) {
    if (!indicator) return;
    indicator.style.transform = `translateX(${item.offsetLeft}px)`;
    indicator.style.width = `${item.offsetWidth}px`;
  }


  /* ==========================
     3️⃣ PAGE HISTORY / RECENTS
  ========================== */
  let visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");

  if (!visitedPages.includes(currentPage)) {
    visitedPages.push(currentPage);
    if (visitedPages.length > 10) visitedPages.shift();
    localStorage.setItem("visitedPages", JSON.stringify(visitedPages));
  }

  function openRecents() {
    if (document.getElementById("recentsModal")) return;

    const modal = document.createElement("div");
    modal.id = "recentsModal";
    modal.style.cssText = `
      position:fixed; inset:0;
      background:rgba(0,0,0,.95);
      z-index:9999;
      color:#00eaff;
      padding:20px;
      overflow:auto;
      display:flex;
      flex-direction:column;
      align-items:center;
    `;
    modal.innerHTML = `<h2 style="text-align:center">Recent Pages</h2>`;

    visitedPages.slice().reverse().forEach(p => {
      const btn = document.createElement("div");
      btn.textContent = p;
      btn.style.cssText = `
        padding:14px;
        margin:10px 0;
        background:#020b1a;
        border:1px solid #00eaff;
        border-radius:12px;
        text-align:center;
        cursor:pointer;
      `;
      btn.onclick = () => location.href = p;
      modal.appendChild(btn);
    });

    const close = document.createElement("div");
    close.textContent = "✕ Close";
    close.style.cssText = `
      position:fixed;
      top:15px;
      right:15px;
      padding:8px 14px;
      background:#ff0044;
      border-radius:8px;
      cursor:pointer;
    `;
    close.onclick = () => modal.remove();
    modal.appendChild(close);

    document.body.appendChild(modal);
  }


  /* ==========================
     4️⃣ GESTURE NAVIGATION & PULL-REFRESH
  ========================== */
  let startX = 0, startY = 0, currentY = 0;
  let startTime = 0, pulling = false;

  const EDGE = 40, SWIPE = 80, PULL_THRESHOLD = 120;

  // Pull-down indicator
  const pullIndicator = document.createElement("div");
  pullIndicator.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%;
    height: 0;
    background: linear-gradient(90deg, #00bfff, #00eaff);
    z-index: 9999;
    transition: height 0.2s ease;
  `;
  document.body.appendChild(pullIndicator);

  document.addEventListener("touchstart", e => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    currentY = startY;
    startTime = Date.now();
    pulling = false;
  });

  document.addEventListener("touchmove", e => {
    currentY = e.touches[0].clientY;
    const diffY = currentY - startY;

    if (startY < 100 && diffY > 30) {
      pulling = true;
      e.preventDefault();
      pullIndicator.style.height = Math.min(diffY, PULL_THRESHOLD) + "px";
    }
  }, { passive: false });

  document.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;
    const elapsed = Date.now() - startTime;

    // ⬇ Pull down → Reload
    if (pulling && diffY >= PULL_THRESHOLD) {
      pullIndicator.style.height = "100%";
      setTimeout(() => location.reload(), 300);
      return;
    } else {
      pullIndicator.style.height = "0";
    }

    // ⬅ Swipe left → Back
    if (startX < EDGE && diffX > SWIPE && elapsed < 500) {
      history.back();
      return;
    }

    // ➡ Swipe right → Forward
    if (startX > innerWidth - EDGE && diffX < -SWIPE && elapsed < 500) {
      history.forward();
      return;
    }

    // ⬆ Swipe up → Home
    if (startY > innerHeight - EDGE && diffY < -SWIPE && elapsed < 500) {
      location.href = "gamezone.html";
      return;
    }

    // ⬆ Hold swipe → Recents
    if (startY > innerHeight - EDGE && diffY < -30 && diffY > -SWIPE && elapsed > 250) {
      openRecents();
      return;
    }
  });


  /* ==========================
     5️⃣ AUTO-HIDE NAV ON SCROLL
  ========================== */
  let lastScroll = window.scrollY;
  const sysNav = document.querySelector(".bottom-nav");

  window.addEventListener("scroll", () => {
    if (!sysNav) return;
    if (window.scrollY > lastScroll + 10) sysNav.classList.add("hide");
    else if (window.scrollY < lastScroll - 10) sysNav.classList.remove("hide");
    lastScroll = window.scrollY;
  });

  // Prevent native overscroll
  document.body.style.overscrollBehavior = "none";
  document.documentElement.style.overscrollBehavior = "none";

});
/* ==========================
     ACTIVE NAV
  ========================== */
  const current = location.pathname.split("/").pop();
  document.querySelectorAll(".nav-item").forEach(item => {
    if (item.dataset.page === current) {
      item.classList.add("active");
    }
  });

  /* ==========================
     MENU TOGGLE
  ========================== */
 function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  menu.classList.toggle("open");
}
function goPage(page) {
  if(page) {
    window.location.href = page;
  }
}

