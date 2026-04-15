document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  const overlay = document.getElementById("envelopeOverlay");
  const envelope = document.querySelector(".envelope");
  const letter = document.querySelector("#envelopeOverlay .letter");
  const seal = document.getElementById("sealButton");

  const musicBtn = document.getElementById("musicToggle");
  const musicIcon = document.getElementById("musicIcon");
  const bgSong = document.getElementById("bgSong");

  let opened = false;
  let musicPlaying = false;

  /* ================= ESTADO INICIAL ================= */

  body.classList.add("lock-scroll");
  body.classList.remove("content-ready");
  body.classList.remove("footer-ready");

  if (musicBtn) {
    musicBtn.style.opacity = "0";
    musicBtn.style.pointerEvents = "none";
  }

  if (!overlay || !envelope || !letter || !seal) return;

  /* ================= APERTURA DEL SOBRE ================= */

  seal.addEventListener("click", () => {
    if (opened) return;
    opened = true;

    /* ================= AUDIO (ARRANQUE INMEDIATO) ================= */
    if (bgSong && musicIcon) {
      bgSong.volume = 0;
      bgSong
        .play()
        .then(() => {
          musicPlaying = true;
          musicIcon.src = "assets/img/pause.svg";

          // fade in suave
          let vol = 0;
          const fade = setInterval(() => {
            vol += 0.05;
            bgSong.volume = Math.min(vol, 1);
            if (vol >= 1) clearInterval(fade);
          }, 80);
        })
        .catch(() => {});
    }

    /* feedback visual del sello */
    seal.classList.add("press");
    setTimeout(() => seal.classList.add("fade-out"), 160);

    /* abrir sobre */
    envelope.classList.add("open");

    /* ================= HERO ================= */
    setTimeout(() => {
      document.getElementById("siteRoot")?.classList.add("hero-ready");
    }, 400);

    /* ================= TEXTO INTRODUCTORIO ================= */
    setTimeout(() => {
      if (window.__EVENT_DATA__) {
        runHeroIntro(window.__EVENT_DATA__);
      }
    }, 1800);

    /* ================= CARTA FULLSCREEN ================= */
    setTimeout(() => {
      letter.classList.add("hero");
      letter.classList.add("unfolded");
    }, 450);

    /* ================= OVERLAY ================= */
    overlay.classList.add("fade-out");
    setTimeout(() => overlay.remove(), 1250);

    /* ================= UI GLOBAL ================= */
    setTimeout(() => {
      body.classList.remove("lock-scroll");

      document.documentElement.style.height = "auto";
      document.body.style.height = "auto";

      requestAnimationFrame(() => {
        body.classList.add("content-ready");
        body.classList.add("footer-ready");

        // 👉 AÑADE ESTA LÍNEA
        window.refreshScrollAnimations?.();

        if (musicBtn) {
          musicBtn.style.opacity = "1";
          musicBtn.style.pointerEvents = "auto";
        }

        requestAnimationFrame(() => {
          window.dispatchEvent(new Event("resize"));
        });
      });
    }, 1400);
  });

  /* ================= BOTÓN DE MÚSICA ================= */

  if (musicBtn && bgSong && musicIcon) {
    musicBtn.addEventListener("click", () => {
      if (musicPlaying) {
        bgSong.pause();
        musicIcon.src = "assets/img/play.svg";
      } else {
        bgSong.play().catch(() => {});
        musicIcon.src = "assets/img/pause.svg";
      }
      musicPlaying = !musicPlaying;
    });
  }
});

/* ================= TEXTO EDITORIAL HERO ================= */

function runHeroIntro(data) {
  const phrase = document.getElementById("openingPhrase");
  if (!phrase) return;

  phrase.textContent =
    data?.opening?.phrase?.text ||
    "Con mucha ilusión, queremos compartir este momento contigo";

  phrase.style.animation = "introFade 3.2s ease forwards";
}
