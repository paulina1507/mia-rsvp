(function () {
  let initialized = false;

  document.addEventListener("event:data:ready", () => {
    if (initialized) return;
    initialized = true;

    const data = window.__EVENT_DATA__;
    if (!data) return;

    // compatible con tu nuevo esquema
    const fechaEvento = data.evento?.fecha || data.hero?.fecha_evento;
    if (!fechaEvento) return;

    const targetDate = new Date(fechaEvento);
    if (isNaN(targetDate)) return;

    const diasEl = document.getElementById("dias");
    const horasEl = document.getElementById("horas");
    const minutosEl = document.getElementById("minutos");
    const segundosEl = document.getElementById("segundos");

    if (!diasEl || !horasEl || !minutosEl || !segundosEl) return;

    function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        diasEl.textContent = "00";
        horasEl.textContent = "00";
        minutosEl.textContent = "00";
        segundosEl.textContent = "00";
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      diasEl.textContent = String(days).padStart(2, "0");
      horasEl.textContent = String(hours).padStart(2, "0");
      minutosEl.textContent = String(minutes).padStart(2, "0");
      segundosEl.textContent = String(seconds).padStart(2, "0");
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  });
})();