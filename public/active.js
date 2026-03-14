

async function loadActiveMatch() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/active-matches`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log("Active Match Response:", data);

    const box = document.getElementById("activeMatchBox");
    const content = document.getElementById("activeMatchContent");

    if (!box || !content) return;

    // ✅ Correct structure
    const match = data.data;

    if (!match) {
      box.style.display = "none";
      return;
    }

    if (match.status === "completed") {
      box.style.display = "none";
      return;
    }

    box.style.display = "block";

    content.innerHTML = `
      <p><strong>Game:</strong> ${match.game || "-"}</p>
      <p><strong>Mode:</strong> ${match.mode || "-"}</p>
      <p><strong>Type:</strong> ${match.type || "-"}</p>
      <p><strong>Entry Fee:</strong> ₹${match.entryFee || 0}</p>
      <p><strong>Status:</strong> ${match.status || "Pending"}</p>
      <p><strong>Match ID:</strong> ${match.matchNumber || match._id}</p>

      <button class="active-btn" onclick="gotoRoom('${match._id}')">
        View Room
      </button>
    `;
  } catch (err) {
    console.error("Active match error:", err);
  }
}

function gotoRoom(id) {
  window.location.href = `user-room.html?matchId=${id}`;
}

document.addEventListener("DOMContentLoaded", loadActiveMatch);
setInterval(loadActiveMatch, 10000);