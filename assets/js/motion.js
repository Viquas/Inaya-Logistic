/* Inaya Logistics — smooth scroll + GSAP scroll motion.
   Loads after gsap, ScrollTrigger and lenis. Fully disabled under
   prefers-reduced-motion (native scroll, no transforms). */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger || !window.Lenis) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis smooth scroll, driven by the GSAP ticker ---- */
  var lenis = new Lenis({
    duration: 1.05,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6
  });
  window.__lenis = lenis;

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* Smooth-scroll same-page anchor links (skip link, in-page jumps) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    });
  });

  /* ---- Section heading reveals (additive; .section-head is not
     handled by the IntersectionObserver reveals in main.js) ---- */
  gsap.utils.toArray(".section-head").forEach(function (el) {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%", once: true }
    });
  });

  /* ---- India coverage map: draw routes + reveal cities on scroll ---- */
  var indiaMap = document.querySelector(".india-map");
  if (indiaMap) {
    var routes = indiaMap.querySelectorAll(".india-route");
    routes.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    var nodes = indiaMap.querySelectorAll(".india-city, .india-label, .india-hub");
    gsap.set(nodes, { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: indiaMap, start: "top 78%", once: true } })
      .to(routes, { strokeDashoffset: 0, duration: 1.15, ease: "power2.out", stagger: 0.12 })
      .to(nodes, { opacity: 1, duration: 0.45, stagger: 0.05 }, "-=0.85");
  }

  /* Operations gallery reveal */
  gsap.utils.toArray(".ops-shot").forEach(function (el, i) {
    gsap.from(el, {
      y: 36, opacity: 0, duration: 0.8, ease: "power3.out",
      delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  /* Option 2: navy-duotone operations band parallax */
  var pband = document.querySelector(".photo-band-img");
  if (pband) {
    gsap.to(pband, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: pband.closest(".photo-band"), start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  /* Keep triggers correct after fonts/images settle */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
