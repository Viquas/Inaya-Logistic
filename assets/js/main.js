document.documentElement.classList.add("js");

const toggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector(".nav-links");

if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage || (currentPage === "" && href === "index.html")) {
    link.classList.add("active");
  }
});

const form = document.querySelector("[data-contact-form]");
const message = document.querySelector("[data-form-message]");

if (form && message) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    message.classList.add("show");
    message.textContent = "Thanks. Your enquiry is ready to send. Please call 9513179242 for the fastest response.";
    form.reset();
  });
}

const revealTargets = document.querySelectorAll(
  ".service-card, .fleet-card, .industry-card, .feature-row, .metric, .white-panel, .blue-panel, .red-panel, " +
  ".tl-item, .statement, .model-card, .leader-card, .body-card"
);

if ("IntersectionObserver" in window) {
  revealTargets.forEach((target) => target.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealTargets.forEach((target, index) => {
    target.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
    observer.observe(target);
  });

  const coverageMap = document.querySelector(".coverage-map");
  if (coverageMap) {
    const mapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            mapObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    mapObserver.observe(coverageMap);
  }
}

const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (motionOK && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

/* Animated number counters — fires when the stat band enters view */
const counters = document.querySelectorAll("[data-count]");

if (counters.length) {
  const runCount = (el) => {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const prefix = el.getAttribute("data-prefix") || "";

    if (!motionOK) {
      el.textContent = `${prefix}${target}${suffix}`;
      return;
    }

    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(target * eased);
      el.textContent = `${prefix}${value}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => countObserver.observe(el));
  } else {
    counters.forEach(runCount);
  }
}
