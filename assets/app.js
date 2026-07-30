const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const cards = document.querySelectorAll(".project-card");
const previews = document.querySelectorAll(".project-preview iframe[data-src]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  cards.forEach((card) => observer.observe(card));
} else {
  cards.forEach((card) => card.classList.add("is-visible"));
}

const loadPreview = (frame) => {
  if (!frame.dataset.src || frame.getAttribute("src")) return;

  frame.addEventListener(
    "load",
    () => frame.classList.add("is-loaded"),
    { once: true }
  );
  frame.src = frame.dataset.src;
};

if ("IntersectionObserver" in window) {
  const previewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadPreview(entry.target);
          previewObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "500px 0px", threshold: 0 }
  );

  previews.forEach((frame) => previewObserver.observe(frame));
} else {
  previews.forEach(loadPreview);
}
