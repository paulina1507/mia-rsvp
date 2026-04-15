(function () {
  let initialized = false;

  document.addEventListener("event:data:ready", () => {
    if (initialized) return;
    initialized = true;

    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      navToggle.classList.toggle("active");
    });

    /* cerrar menú al hacer click en link */
    navMenu.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      navMenu.classList.remove("open");
      navToggle.classList.remove("active");
    });
  });
})();
