fetch("assets/js/evento.json")
  .then((res) => res.json())
  .then((data) => {
    window.__EVENT_DATA__ = data; // 👈 AGREGAR ESTA LÍNEA

    // ================= INVITADO (API o DEMO) =================
    const invitadoDemo = {
      nombre: "Familia Pérez",
      pases: 4,
      mesa: 8,
    };

    // Si la API ya definió __INVITADO__, se usa.
    // Si no, usamos el demo.
    window.__INVITADO__ = window.__INVITADO__ ?? invitadoDemo;

    /* ================= INVITADO ================= */

    document.querySelectorAll(".rsvp-guest-name").forEach((el) => {
      el.textContent = window.__INVITADO__.nombre || "";
    });
    /* ================= 🔧 HELPERS ================= */

    const isEnabled = (obj) => obj?.enabled !== false;

    const removeSection = (id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el && value !== undefined && value !== null) {
        el.textContent = value;
      }
    };

    const setHTML = (id, value) => {
      const el = document.getElementById(id);
      if (el && value !== undefined && value !== null) {
        el.innerHTML = value;
      }
    };

    /* ================= META ================= */

    if (data.meta?.title) document.title = data.meta.title;
    if (data.meta?.lang) document.documentElement.lang = data.meta.lang;

    if (data.meta?.favicon) {
      let link =
        document.querySelector("link[rel='icon']") ||
        document.createElement("link");
      link.rel = "icon";
      link.href = `assets/img/${data.meta.favicon}`;
      document.head.appendChild(link);
    }

    /* ================= LOGO ================= */

    /* ================= LOGO ================= */

    const logoEl = document.querySelector(".logo");

    if (logoEl && data.logo) {
      // TEXTO + IMAGEN
      if (data.logo.type === "text-image") {
        logoEl.innerHTML = `
      <span class="logo-text">${data.logo.value}</span>
      <img src="assets/img/${data.logo.img}" class="logo-img" />
    `;
      }

      // SOLO TEXTO
      else if (data.logo.type === "text") {
        logoEl.textContent = data.logo.value;
      }

      // SOLO IMAGEN
      else if (data.logo.type === "image") {
        logoEl.innerHTML = `
      <img src="assets/img/${data.logo.img}" class="logo-img" />
    `;
      }
    }

    /* ================= AUDIO ================= */

    const audio = document.getElementById("bgSong");
    const musicToggle = document.getElementById("musicToggle");
    const musicIcon = document.getElementById("musicIcon");

    if (audio && isEnabled(data.audio)) {
      audio.src = `assets/audio/${data.audio.src}`;
      audio.loop = data.audio.loop ?? true;
      audio.volume = data.audio.volume ?? 1;

      if (musicIcon && data.audio.icons?.play) {
        musicIcon.src = `assets/img/${data.audio.icons.play}`;
      }

      if (musicToggle && musicIcon) {
        musicToggle.addEventListener("click", () => {
          if (audio.paused) {
            audio.play().catch(() => {});
            musicIcon.src = `assets/img/${data.audio.icons.pause}`;
          } else {
            audio.pause();
            musicIcon.src = `assets/img/${data.audio.icons.play}`;
          }
        });
      }
    }

    /* ================= NAVBAR ================= */

    const navMenu = document.getElementById("navMenu");

    if (navMenu && isEnabled(data.navbar)) {
      navMenu.innerHTML = "";

      data.navbar.items.forEach((item) => {
        if (!item.href || !item.label) return;

        const targetId = item.href.replace("#", "");
        if (data[targetId]?.enabled === false) return;

        navMenu.insertAdjacentHTML(
          "beforeend",
          `<li><a href="${item.href}">${item.label}</a></li>`,
        );
      });
    }

    /* ================= HERO ================= */

    if (isEnabled(data.hero)) {
      const hero = data.hero;

      const heroNamesEl = document.getElementById("hero-names");

      if (hero.names?.festejada) {
        const texto = hero.names.festejada || "";

        const partes = texto.trim().split(" ");

        const titulo = partes.slice(0, 2).join(" ");
        const nombre = partes.slice(2).join(" ");

        heroNamesEl.innerHTML = `
  <span class="hero-title">${titulo}</span>
  <span class="hero-name">${nombre}</span>
`;
        setTimeout(() => {
          heroNamesEl.innerHTML = `
    <span class="hero-title">${titulo}</span>
    <span class="hero-name">${nombre}</span>
  `;
        }, 50);
      } else if (hero.names?.novia && hero.names?.novio) {
        heroNamesEl.textContent = `${hero.names.novia} & ${hero.names.novio}`;
      }

      const heroBg = document.querySelector(".hero-bg");
      if (heroBg && data.media?.hero_background) {
        heroBg.style.backgroundImage = `url('assets/img/${data.media.hero_background}')`;
      }

      const labels = hero.countdown_labels;
      if (labels) {
        setText("label-dias", labels.dias);
        setText("label-horas", labels.horas);
        setText("label-minutos", labels.minutos);
        setText("label-segundos", labels.segundos || "Segundos");
      }
    } else {
      removeSection("inicio");
    }

    /* ================= PRESENTACIÓN ================= */

    if (isEnabled(data.presentacion)) {
      const p = data.presentacion;

      setText("titulo-presentacion", p.titulo);
      setText("nombres-presentacion", p.nombres);
      setText("frase-presentacion", p.frase);

      const padresNoviaEl = document.getElementById("padres-novia");
      const padresNovioEl = document.getElementById("padres-novio");

      const labelPadresNoviaEl = document.getElementById("label-padres-novia");
      const labelPadresNovioEl = document.getElementById("label-padres-novio");

      /* ===== XV ===== */
      if (p.padres?.festejada) {
        setHTML("padres-novia", p.padres.festejada.join("<br>"));
        setText("label-padres-novia", p.labels?.padres || "Mis Padres");

        padresNovioEl?.closest(".arco-grupo")?.remove();

        if (p.padrinos?.length) {
          const html = p.padrinos
            .map((pad) => {
              if (typeof pad === "string") return `<div>${pad}</div>`;

              if (pad.rol) {
                return `
          <div class="padrino-item">
            <h4 class="padrino-rol">${pad.rol}</h4>
            <span class="padrino-nombre">${pad.nombre}</span>
          </div>
        `;
              }

              return `<div class="padrino-item">${pad.nombre}</div>`;
            })
            .join("");

          setHTML("padrinos", html);
          setText("label-padrinos", p.labels?.padrinos || "Mis Padrinos");
        }
      } else {
        /* ===== BODA ===== */
        setHTML("padres-novia", p.padres?.novia?.join("<br>") || "");
        setHTML("padres-novio", p.padres?.novio?.join("<br>") || "");

        setText("label-padres-novia", p.labels?.padres_novia || "");
        setText("label-padres-novio", p.labels?.padres_novio || "");
      }

      setText("texto-final-presentacion", p.texto_final || "");

      const img = document.querySelector(".arco-img img");
      if (img && data.media?.presentacion) {
        img.src = `assets/img/${data.media.presentacion}`;
      }
    } else {
      removeSection("presentacion");
    }

    /* ================= UBICACIÓN ================= */

    if (isEnabled(data.ubicacion)) {
      const u = data.ubicacion;
      setText("ubicacion-titulo", u.titulo);

      const fechaGeneralEl = document.getElementById("ubicacion-fecha-general");

      if (fechaGeneralEl && data.evento?.fecha) {
        const fecha = new Date(data.evento.fecha);

        const dia = fecha.toLocaleDateString("es-MX", {
          weekday: "long",
        });

        const fechaBonita = fecha.toLocaleDateString("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const hora = fecha.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        });

        fechaGeneralEl.innerHTML = `
    <div class="fecha-wrapper">
      <span class="fecha-dia">${dia}</span>
      <span class="fecha-completa">${fechaBonita}</span>
    </div>
  `;
      }

      const lista = document.getElementById("ubicacion-lista");
      lista.innerHTML = "";

      u.lugares
        .filter((l) => isEnabled(l) && l.lugar && l.hora)
        .forEach((lugar) => {
          lista.insertAdjacentHTML(
            "beforeend",
            `
            <div class="ubicacion-card reveal">
              <h3 class="ubicacion-subtitle">${lugar.tipo}</h3>
              <div class="ubicacion-hora">${lugar.hora}</div>
              <div class="ubicacion-lugar">${lugar.lugar}</div>
              ${
                lugar.direccion?.length
                  ? `<div class="ubicacion-direccion">${lugar.direccion.join(
                      "<br>",
                    )}</div>`
                  : ""
              }
              ${
                lugar.mapa
                  ? `<a href="${lugar.mapa}" target="_blank" class="btn-ubicacion">VER UBICACIÓN</a>`
                  : ""
              }
            </div>
          `,
          );
        });
    } else {
      removeSection("ubicacion");
    }

    /* ================= PROGRAMA ================= */

    if (isEnabled(data.programa)) {
      const programa = data.programa;
      setText("programa-titulo", programa.titulo);

      const timeline = document.getElementById("timeline-programa");
      timeline.innerHTML = "";

      programa.items.forEach((item, index) => {
        const lado = index % 2 === 0 ? "left" : "right";

        timeline.insertAdjacentHTML(
          "beforeend",
          `
          <div class="item ${lado} reveal reveal-${lado}">
            <img class="icon" src="assets/img/${item.icono}">
            <div class="hora">${item.hora}</div>
            <div class="texto">${item.texto}</div>
          </div>
        `,
        );
      });
    } else {
      removeSection("programa");
    }

    /* ================= VESTIMENTA ================= */

    if (isEnabled(data.vestimenta)) {
      const v = data.vestimenta;

      setText("vestimenta-titulo", v.titulo);

      // Icono
      const icon = document.getElementById("vestimenta-icon");
      if (icon && data.media?.vestimenta_icon) {
        icon.src = `assets/img/${data.media.vestimenta_icon}`;
      }

      // 👉 LABELS
      setText("vestimenta-label-mujeres", v.labels?.mujeres || "Mujeres");
      setText("vestimenta-label-hombres", v.labels?.hombres || "Hombres");

      // 👉 CONTENIDO
      setHTML("vestimenta-formal", v.formal || "");
      setText("vestimenta-nota", v.nota || "");
      setHTML("vestimenta-mujeres", v.mujeres || "");
      setHTML("vestimenta-hombres", v.hombres || "");

      // 👉 BOTÓN PINTEREST
      const inspoBtn = document.getElementById("vestimenta-inspo");

      if (inspoBtn && v.inspo?.url) {
        inspoBtn.href = v.inspo.url;
        inspoBtn.textContent = v.inspo.text || "Ver inspiración";
        inspoBtn.style.display = "inline-flex";
      } else if (inspoBtn) {
        inspoBtn.style.display = "none";
      }
    } else {
      removeSection("vestimenta");
    }
    /* ================= REGALOS ================= */

    if (isEnabled(data.regalos)) {
      const r = data.regalos;
      setText("regalos-titulo", r.titulo);
      setHTML("regalos-desc", r.descripcion);

      const cont = document.getElementById("regalos-inner");
      cont.innerHTML = "";

      r.items.forEach((item) => {
        cont.insertAdjacentHTML(
          "beforeend",
          `
          <div class="regalo-item reveal">
            <img src="assets/img/${item.icono}" class="regalo-icon">
            <p class="regalo-label">${item.label}</p>
          </div>
        `,
        );
      });
    } else {
      removeSection("regalos");
    }

    /* ================= GALERÍA ================= */

    if (isEnabled(data.galeria)) {
      const g = data.galeria;
      setText("galeria-titulo", g.titulo);

      const track = document.getElementById("carousel-track");
      track.innerHTML = "";

      (data.media?.galeria || []).forEach((img) => {
        track.insertAdjacentHTML(
          "beforeend",
          `<img src="assets/img/${img}" class="carousel-img">`,
        );
      });
    } else {
      removeSection("galeria");
    }

    /* ================= RSVP ================= */

    if (isEnabled(data.rsvp)) {
      const rsvp = data.rsvp;
      const modoWhatsApp =
        rsvp?.pase?.enabled === false &&
        rsvp?.mesa?.enabled === false &&
        rsvp?.qr?.enabled === false;
      if (modoWhatsApp) {
        document.querySelectorAll(".rsvp-guest-name").forEach((el) => {
          el.style.display = "none";
        });
        const label = document.getElementById("rsvpNombreLabel");
        if (label) label.style.display = "block";
      }
      const form = document.getElementById("rsvp-form");

      if (form) {
        setText("rsvp-form-title", rsvp.titulo || "");
        form.querySelector(".rsvp-text").innerHTML = rsvp.texto || "";
        let nota = rsvp.nota || "";

        if (rsvp.fecha_limite) {
          const fecha = new Date(rsvp.fecha_limite + "T00:00:00");

          const fechaBonita = fecha.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          nota = nota.replace("{{fecha_limite}}", fechaBonita);
        }

        form.querySelector(".rsvp-note").innerHTML = nota;
        form.querySelector(".rsvp-btn.yes").textContent =
          rsvp.botones?.si || "";
        form.querySelector(".rsvp-btn.no").textContent = rsvp.botones?.no || "";
      }
      if (modoWhatsApp) {
        const btnYes = document.querySelector(".rsvp-btn.yes");
        const btnNo = document.querySelector(".rsvp-btn.no");

        const telefono = rsvp.telefono;

        const enviarWhatsApp = (confirmacion) => {
          const inputNombre = document.getElementById("rsvpNombreInput");

          let nombre = inputNombre?.value?.trim();

          if (!nombre) {
            alert("Por favor escribe tu nombre 😊");
            return;
          }

          const limpiarNombre = (n) => n.replace(/^Familia\s+/i, "");
          const nombreLimpio = limpiarNombre(nombre);

          const nombreEvento =
            window.__EVENT_DATA__?.evento?.host?.nombre || "";

          const mensajeBase =
            confirmacion === "Sí asistiré"
              ? `Hola, con gusto asistiré a los XV años de ${nombreEvento}.`
              : `Hola, lamentablemente no podré acompañarles en los XV años de ${nombreEvento}.`;
          const mensaje = `${mensajeBase}

Invitado: ${nombreLimpio}`;

          const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

          window.open(url, "_blank");
        };
        btnYes?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          enviarWhatsApp("Sí asistiré");
        });

        btnNo?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          enviarWhatsApp("No podré asistir");
        });
      }
      const passLabel = document.getElementById("rsvpPassLabel");
      const passValue = document.getElementById("rsvpPassValue");
      const tableLabel = document.getElementById("rsvpTableLabel");
      const tableValue = document.getElementById("rsvpTableValue");

      if (rsvp.pase?.enabled !== false && passLabel && passValue) {
        passLabel.textContent = rsvp.pase.label || "Pase para";
        passValue.textContent = `${window.__INVITADO__.pases ?? rsvp.pase.cantidad ?? 0} personas`;
      } else {
        passLabel?.closest(".rsvp-pass-item")?.remove();
      }

      if (rsvp.mesa?.enabled !== false && tableLabel && tableValue) {
        tableLabel.textContent = rsvp.mesa.label || "Mesa asignada";
        tableValue.textContent = `Mesa ${window.__INVITADO__.mesa ?? rsvp.mesa.numero ?? "-"}`;
      } else {
        tableLabel?.closest(".rsvp-pass-item")?.remove();
      }

      const passInfo = document.querySelector(".rsvp-pass-info");
      if (passInfo && !rsvp.pase?.enabled && !rsvp.mesa?.enabled) {
        passInfo.remove();
      }

      const nombreWrapper = document.getElementById("rsvpNombreWrapper");

      const ocultarInputNombre =
        rsvp.pase?.enabled === true || rsvp.mesa?.enabled === true;

      if (ocultarInputNombre) {
        nombreWrapper?.remove();
      }
      const rsvpNames = document.getElementById("rsvp-names");
      const rsvpFinalTitle = document.getElementById("rsvp-final-title");
      const rsvpFinalText = document.getElementById("rsvp-final-text");

      if (rsvp.final) {
        if (rsvpFinalTitle)
          rsvpFinalTitle.textContent = rsvp.final.titulo || "";
        if (rsvpFinalText) rsvpFinalText.textContent = rsvp.final.texto || "";
        if (rsvpNames) rsvpNames.textContent = rsvp.final.firma || "";
      }
    } else {
      removeSection("rsvp");
    }

    /* ================= FOOTER ================= */

    if (data.footer?.enabled !== false) {
      const footer = document.getElementById("footer-text");
      if (footer && data.footer?.text) {
        footer.innerHTML = data.footer.text;
      }
    }

    /* ================= EDITORIAL TEXTS ================= */

    applyEditorialTexts(data.editorial);

    /* ================= EVENT READY ================= */

    document.dispatchEvent(new Event("event:data:ready"));
    window.refreshScrollAnimations?.();
  })
  .catch((err) => {
    console.error("Error cargando evento.json:", err);
  });

/* ================= EDITORIAL ENGINE ================= */

function applyEditorialTexts(editorial) {
  if (!editorial) return;

  document.querySelectorAll("[data-editorial]").forEach((el) => {
    const key = el.dataset.editorial;
    const cfg = editorial[key];

    if (!cfg || !cfg.enabled || !cfg.text) {
      el.remove();
      return;
    }

    el.textContent = cfg.text;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
  });
}
