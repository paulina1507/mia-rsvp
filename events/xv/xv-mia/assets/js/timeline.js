(function () {
  let initialized = false;

  document.addEventListener("event:data:ready", () => {
    if (initialized) return;
    initialized = true;

    const timeline = document.querySelector(".timeline-programa");
    const section = document.getElementById("programa");

    if (!timeline || !section) return;

    let items = [];
    let itemOffsets = [];

    function collectItems() {
      items = [...timeline.querySelectorAll(".item")];
    }

    function calculateOffsets() {
      const sectionTop = section.offsetTop;

      itemOffsets = items.map((item) => ({
        el: item,
        offset: item.offsetTop,
      }));
    }

    function updateProgress() {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      if (rect.bottom <= 0 || rect.top >= vh) return;

      const usableHeight = Math.max(section.scrollHeight - vh * 0.4, 1);

      const scrolled = Math.min(Math.max(vh * 0.4 - rect.top, 0), usableHeight);

      const percent = (scrolled / usableHeight) * 100;

      timeline.style.setProperty(
        "--progress",
        `${Math.min(Math.max(percent, 0), 100)}%`
      );

      const progressPx = (percent / 100) * section.scrollHeight;

      itemOffsets.forEach(({ el, offset }) => {
        if (progressPx >= offset) {
          el.classList.add("lit", "active");
        } else {
          el.classList.remove("lit");
        }
      });
    }

    /* esperar layout estable */
    setTimeout(() => {
      collectItems();
      if (!items.length) return;

      calculateOffsets();
      updateProgress();

      window.addEventListener("scroll", updateProgress);

      window.addEventListener("resize", () => {
        calculateOffsets();
        updateProgress();
      });
    }, 100);
  });
})();
