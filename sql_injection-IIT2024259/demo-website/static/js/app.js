// Toggle between VULNERABLE and SECURE backend query modes.
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("toggle-mode-btn");
  if (!btn) return;

  let busy = false;

  btn.addEventListener("click", async () => {
    if (busy) return;

    busy = true;
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Switching…";

    try {
      const res = await fetch("/toggle-mode", { method: "POST" });
      if (!res.ok) throw new Error("mode switch failed");
      window.location.reload();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = original;
      busy = false;
    }
  });
});
