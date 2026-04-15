(function () {
  let observer;

  function revealElement(el) {
    el.classList.add("visible");
  }

  function createObserver() {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          revealElement(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      },
    );
  }

  function observeElement(el) {
    if (el.classList.contains("visible")) return;

    observer.observe(el);
  }

  function scanReveals(root = document) {
    root
      .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom")
      .forEach(observeElement);
  }

  function init() {
    createObserver();

    // elementos iniciales
    scanReveals();

    // detectar contenido dinámico
    const mutation = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;

          if (
            node.matches?.(".reveal, .reveal-left, .reveal-right, .reveal-zoom")
          ) {
            observeElement(node);
          }

          scanReveals(node);
        });
      });
    });

    mutation.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".section-arco").forEach((section) => {

    const elements = section.querySelectorAll(".reveal");
    let visibleIndex = 0;

    elements.forEach((el) => {

      if (
        el.closest(".timeline-programa") ||
        el.closest(".carousel") ||
        el.tagName === "BUTTON"
      ) return;

      el.style.setProperty("--delay", `${visibleIndex * 120}ms`);

      if (
        el.classList.contains("reveal-left") ||
        el.classList.contains("reveal-right") ||
        el.classList.contains("reveal-zoom")
      ) {
        visibleIndex++;
        return;
      }

      if (el.tagName === "H1" || el.tagName === "H2") {
        el.classList.add("reveal-zoom");
        visibleIndex++;
        return;
      }

      if (el.tagName === "IMG") {
        el.classList.add("reveal-zoom");
        visibleIndex++;
        return;
      }

      el.classList.add(
        visibleIndex % 2 === 0 ? "reveal-left" : "reveal-right"
      );

      visibleIndex++;

    });

  });

});