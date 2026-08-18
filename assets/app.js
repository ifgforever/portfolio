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

// Contact form submit -- posts to /api/contact (a Pages Function in this
// repo) and renders the result into the same notice elements the old
// Formspree widget used, so the markup and styles didn't have to change.
const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const submitButton = contactForm.querySelector("[data-fs-submit-btn]");
  const successNotice = contactForm.querySelector(".form-notice--success");
  const failureNotice = contactForm.querySelector(".form-notice--error");
  const fallbackError =
    "Something went wrong sending your note. Email info@risendust.com and I’ll take it from there.";

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    successNotice.textContent = "";
    failureNotice.textContent = "";
    if (!contactForm.reportValidity()) return;
    submitButton.disabled = true;
    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        contactForm.reset();
        successNotice.textContent =
          "Thanks — your note is on its way. I read every message and reply within one business day.";
      } else {
        failureNotice.textContent = data.error || fallbackError;
      }
    } catch {
      failureNotice.textContent = fallbackError;
    } finally {
      submitButton.disabled = false;
    }
  });
}
