(function () {
  let initialized = false;
  let invitado = null;

  async function cargarInvitado() {
    const codigo = window.CODIGO_INVITADO || "";

    if (!codigo) {
      console.error("No se recibió código de invitado");
      return null;
}

    try {
      const res = await fetch(
        `${window.API_BASE}/invitado.php?codigo=${encodeURIComponent(codigo)}`,
      );

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Respuesta inválida de invitado.php:", text);
        return null;
      }

      if (!data.ok || !data.data) {
        console.error(data.message || "Invitado no encontrado");
        return null;
      }

      return data.data;
    } catch (error) {
      console.error("Error al cargar invitado:", error);
      return null;
    }
  }

  async function enviarRSVP(asistencia) {
    if (!invitado) return null;

    const payload = {
      id_evento: invitado.id_evento,
      id_invitado: invitado.id_invitado,
      asistencia: asistencia,
      cantidad_confirmada: asistencia === "si" ? invitado.pases || 1 : 0,
      mensaje: "",
    };

    try {
      const res = await fetch(`${window.API_BASE}/rsvp.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Respuesta inválida de rsvp.php:", text);
        alert("La API devolvió una respuesta inválida");
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error al enviar RSVP:", error);
      return null;
    }
  }

  function pintarInvitado() {
    if (!invitado) return;

    window.__INVITADO__ = {
      nombre: invitado.nombre || "",
      pases: invitado.pases || 0,
      mesa: invitado.numero_mesa || invitado.mesa || "-",
    };

    document.querySelectorAll(".rsvp-guest-name").forEach((el) => {
      el.textContent = window.__INVITADO__.nombre || "";
    });

    const passValue = document.getElementById("rsvpPassValue");
    const tableValue = document.getElementById("rsvpTableValue");

    if (passValue) {
      const pases = window.__INVITADO__.pases ?? 0;
      passValue.textContent = `${pases} ${pases === 1 ? "persona" : "personas"}`;
    }

    if (tableValue) {
      tableValue.textContent = `Mesa ${window.__INVITADO__.mesa ?? "-"}`;
    }
  }

  function mostrarFinal(asistencia) {
    const formBox = document.getElementById("rsvp-form");
    const finalBox = document.getElementById("rsvp-final");
    const finalText = document.getElementById("rsvp-final-text");
    const finalTitle = document.getElementById("rsvp-final-title");

    if (formBox) formBox.style.display = "none";
    if (finalBox) finalBox.style.display = "block";

    const data = window.__EVENT_DATA__?.rsvp?.final || {};

    if (asistencia === "si") {
      // ✅ comportamiento normal
      if (finalText) {
        finalText.textContent =
          data.texto_si ||
          data.texto ||
          "¡Nos llena de alegría contar contigo! <br>Hemos reservado tu lugar para celebrar juntos este día tan especial.";
      }
    } else {
      // ❌ MODO LIMPIO (NO ASISTE)

      // 🔥 quitar título "Gracias por confirmar"
      if (finalTitle) finalTitle.remove();

      // 🔥 quitar nombre + "Invitación para"
      document
        .querySelectorAll(".rsvp-guest-name")
        .forEach((el) => el.remove());

      // 🔥 quitar pases
      document.querySelectorAll(".rsvp-pass-info").forEach((el) => el.remove());

      // 🔥 texto limpio
      if (finalText) {
        finalText.innerHTML = data.texto_no || "Gracias por avisarnos <br>Aunque no puedas acompañarnos te llevamos en el corazón en este día tan importante.";
      }
    }

    if (finalBox) {
      finalBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function initRSVP() {
    if (initialized) return;
    initialized = true;

    const formBox = document.getElementById("rsvp-form");
    const btnYes = document.getElementById("btnAsisteSi");
    const btnNo = document.getElementById("btnAsisteNo");

    if (!formBox || !btnYes || !btnNo) {
      console.warn("No se encontró la estructura RSVP en esta plantilla");
      return;
    }

    invitado = await cargarInvitado();

    if (!invitado) {
      formBox.innerHTML =
        "<p>No se pudo cargar la información del invitado.</p>";
      return;
    }

    pintarInvitado();

    if (
      invitado.estado_invitado === "confirmado" ||
      invitado.estado_invitado === "rechazado"
    ) {
      mostrarFinal(invitado.estado_invitado === "confirmado" ? "si" : "no");
      return;
    }

    btnYes.addEventListener("click", async function () {
      btnYes.disabled = true;
      btnNo.disabled = true;

      const respuesta = await enviarRSVP("si");

      if (!respuesta || !respuesta.ok) {
        alert(
          (respuesta && respuesta.message) ||
            "No se pudo registrar la confirmación",
        );
        btnYes.disabled = false;
        btnNo.disabled = false;
        return;
      }

      invitado.estado_invitado = "confirmado";
      mostrarFinal("si");
    });

    btnNo.addEventListener("click", async function () {
      btnYes.disabled = true;
      btnNo.disabled = true;

      const respuesta = await enviarRSVP("no");

      if (!respuesta || !respuesta.ok) {
        alert(
          (respuesta && respuesta.message) ||
            "No se pudo registrar la respuesta",
        );
        btnYes.disabled = false;
        btnNo.disabled = false;
        return;
      }

      invitado.estado_invitado = "rechazado";
      mostrarFinal("no");
    });
  }

  if (window.__EVENT_DATA__) {
    initRSVP();
  } else {
    document.addEventListener("event:data:ready", initRSVP);
  }
})();
