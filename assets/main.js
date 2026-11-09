(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else window.scrollTo({ top: target === 0 ? 0 : target.offsetTop, behavior: "auto" });
    });
  });

  /* ---------- Text splitting ---------- */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
    return $$(".w", el);
  }
  function splitLines(el) {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p) => `<span class="line"><span class="line__inner">${p.trim()}</span></span>`).join("");
    return $$(".line__inner", el);
  }

  /* ---------- i18n ---------- */
  const scrollBuilt = [];
  function applyLang(lang) {
    const dict = window.I18N[lang] || window.I18N.pt;
    root.lang = lang === "en" ? "en" : "pt-BR";
    $$("[data-i18n]").forEach((el) => { if (dict[el.dataset.i18n] != null) el.textContent = dict[el.dataset.i18n]; });
    $$("[data-i18n-html]").forEach((el) => { if (dict[el.dataset.i18nHtml] != null) el.innerHTML = dict[el.dataset.i18nHtml]; });
    store.set("lang", lang);
  }
  const initialLang = store.get("lang") || "pt";
  applyLang(initialLang);

  $("[data-lang-toggle]").addEventListener("click", () => {
    const next = root.lang === "en" ? "pt" : "en";
    gsap.to("main, .footer", {
      opacity: 0, duration: reduce ? 0 : 0.25, ease: "power2.in",
      onComplete: () => {
        applyLang(next);
        buildTextAnimations(true);
        ScrollTrigger.refresh();
        gsap.to("main, .footer", { opacity: 1, duration: reduce ? 0 : 0.45, ease: "power2.out" });
      }
    });
  });

  /* ---------- Theme ---------- */
  $("[data-theme-toggle]").addEventListener("click", () => {
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    store.set("theme", next);
    $('meta[name="theme-color"]').content = next === "dark" ? "#000000" : "#f5f5f7";
  });

  /* ---------- Clock + year ---------- */
  const clock = $("[data-clock]");
  const fmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 15000);
  $("[data-year]").textContent = new Date().getFullYear();

  /* ---------- Text animations (rebuilt on language change) ---------- */
  function buildTextAnimations(isRebuild) {
    scrollBuilt.splice(0).forEach((st) => st.kill());

    // Manifesto: words light up as you scroll through the paragraph.
    const words = splitWords($("[data-split-words]"));
    if (!reduce) {
      const tw = gsap.to(words, {
        opacity: 1, ease: "none", stagger: 0.1,
        scrollTrigger: { trigger: ".manifesto__text", start: "top 80%", end: "bottom 45%", scrub: 0.6 }
      });
      scrollBuilt.push(tw.scrollTrigger);
    }

    // Section titles: lines rise from a mask.
    $$(".reveal-lines").forEach((el) => {
      const lines = splitLines(el);
      if (reduce) return;
      if (isRebuild && el.dataset.revealed) return;
      gsap.set(lines, { yPercent: 110 });
      const st = ScrollTrigger.create({
        trigger: el, start: "top 85%", once: true,
        onEnter: () => { el.dataset.revealed = "1"; gsap.to(lines, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.09 }); }
      });
      scrollBuilt.push(st);
    });

    // Contact title.
    const contactLines = $$(".contact__title .line__inner");
    const ct = $(".contact__title");
    if (!reduce && !(isRebuild && ct.dataset.revealed)) {
      gsap.set(contactLines, { yPercent: 110 });
      scrollBuilt.push(ScrollTrigger.create({
        trigger: ct, start: "top 80%", once: true,
        onEnter: () => { ct.dataset.revealed = "1"; gsap.to(contactLines, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.1 }); }
      }));
    }
  }
  buildTextAnimations(false);

  if (!reduce) {
    /* ---------- Fade-up reveals ---------- */
    $$(".reveal").forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    $$(".manifesto .eyebrow, .section-head .eyebrow, .contact .eyebrow").forEach((el) => {
      gsap.from(el, { opacity: 0, y: 12, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });

    /* ---------- Hero parallax ---------- */
    gsap.to(".hero__title", { yPercent: -18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__foot", { opacity: 0, y: -40, ease: "none", scrollTrigger: { trigger: ".hero", start: "20% top", end: "70% top", scrub: true } });
    gsap.to(".hero__orb", { yPercent: 35, scale: 1.25, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    /* ---------- Marquee (speeds up and reverses with scroll) ---------- */
    const track = $(".marquee__track");
    track.appendChild(track.firstElementChild.cloneNode(true));
    let x = 0, dir = -1, speed = 0.6;
    const rowW = () => track.firstElementChild.offsetWidth;
    gsap.ticker.add(() => {
      const v = lenis ? lenis.velocity : 0;
      if (v) dir = v > 0 ? -1 : 1;
      x += dir * (speed + Math.min(Math.abs(v) * 0.35, 14));
      const w = rowW();
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });

    /* ---------- Count-up stats ---------- */
    $$("[data-count]").forEach((el) => {
      const end = +el.dataset.count;
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: () => gsap.to(obj, { v: end, duration: 1.6, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString(root.lang); } })
      });
    });

    /* ---------- Project cards: stack + image parallax ---------- */
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const cards = $$(".card");
      cards.forEach((card, i) => {
        const inner = $(".card__inner", card);
        gsap.from($$(".card__meta > *", card), {
          y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.06,
          scrollTrigger: { trigger: card, start: "top 70%", once: true }
        });
        const next = cards[i + 1];
        if (next) {
          gsap.fromTo(inner, { scale: 1, filter: "brightness(1)" }, {
            scale: 0.92, filter: "brightness(0.82)", ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true }
          });
        }
      });
    });
    mm.add("(max-width: 900px)", () => {
      $$(".card__inner").forEach((el) => gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } }));
    });
    $$(".frame__img img").forEach((img) => {
      gsap.fromTo(img, { yPercent: 0 }, { yPercent: -9, ease: "none", scrollTrigger: { trigger: img.closest(".card"), start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* ---------- Nav: glass after hero, hide on scroll down ---------- */
    const nav = $(".nav");
    ScrollTrigger.create({
      start: 40, end: "max",
      onUpdate: (self) => {
        nav.classList.toggle("is-scrolled", self.scroll() > 40);
        nav.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > window.innerHeight * 0.8);
      }
    });

    /* ---------- Cursor + magnetic buttons ---------- */
    if (finePointer) {
      const cursor = $(".cursor");
      const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
      const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
      window.addEventListener("pointermove", (e) => { cursor.style.opacity = 1; cx(e.clientX); cy(e.clientY); }, { passive: true });
      document.addEventListener("pointerleave", () => { cursor.style.opacity = 0; });
      $$("[data-cursor]").forEach((el) => {
        el.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
        el.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
      });
      $$("a:not([data-cursor]), button").forEach((el) => {
        el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
        el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
      });
      $$("[data-magnetic]").forEach((el) => {
        const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
        const my = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          mx((e.clientX - r.left - r.width / 2) * 0.3);
          my((e.clientY - r.top - r.height / 2) * 0.4);
        });
        el.addEventListener("pointerleave", () => { mx(0); my(0); });
      });
    }
  }

  /* ---------- Page-load sequence ---------- */
  const heroLines = $$(".hero__title .line__inner");
  function intro() {
    root.classList.remove("is-loading");
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }
  if (reduce) {
    $(".loader").remove();
    intro();
    return;
  }
  gsap.set(heroLines, { yPercent: 115 });
  gsap.set([".hero__eyebrow", ".hero__foot"], { opacity: 0, y: 20 });
  gsap.set(".hero__orb", { scale: 0.6, opacity: 0 });
  gsap.set(".nav", { yPercent: -100 });

  const counter = { v: 0 };
  const count = $(".loader__count");
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const tl = gsap.timeline({ paused: true });
  tl.fromTo(".loader__name span", { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 }, 0)
    .to(counter, { v: 100, duration: 1.6, ease: "power3.inOut", onUpdate: () => { count.textContent = Math.round(counter.v); } }, 0)
    .to(".loader__bar span", { scaleX: 1, duration: 1.6, ease: "power3.inOut" }, 0)
    .to(".loader__inner, .loader__bar", { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" }, 1.75)
    .to(".loader", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, 2.0)
    .to(heroLines, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.1 }, 2.55)
    .to(".hero__orb", { scale: 1, opacity: 0.55, duration: 2.2, ease: "expo.out" }, 2.4)
    .to(".hero__eyebrow", { opacity: 1, y: 0, duration: 1, ease: "expo.out" }, 2.75)
    .to(".hero__foot", { opacity: 1, y: 0, duration: 1, ease: "expo.out" }, 2.9)
    .to(".nav", { yPercent: 0, duration: 1, ease: "expo.out" }, 2.9)
    .add(() => { gsap.set(".nav", { clearProps: "transform" }); $(".loader").remove(); intro(); }, 3.9);
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(() => tl.play());
})();
