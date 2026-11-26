/**
 * AIDEN MUSIC — Pure Vanilla JS Animations & Interactions
 * Powered by GSAP, ScrollTrigger, CustomEase & Lenis
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. MOTION PREFERENCES & SETUP
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.documentElement.classList.remove("motion-ok");
  }

  if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
    if (typeof CustomEase !== "undefined") {
      gsap.registerPlugin(CustomEase);
      CustomEase.create("drop", "M0,0 C0.12,0.6 0.2,1 1,1");
      CustomEase.create("fader", "M0,0 C0.65,0 0.35,1 1,1");
      CustomEase.create("kick", "M0,0 C0.3,1.4 0.5,1 1,1");
    }
    gsap.defaults({ ease: "drop", duration: 1 });
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.config({ ignoreMobileResize: true });
    }
  }

  // 2. SMOOTH SCROLLING (LENIS)
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
    });

    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
    }
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target, opts = {}) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (lenis) {
      lenis.scrollTo(el ?? 0, {
        offset: 0,
        duration: 1.4,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        ...opts,
      });
    } else if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    } else {
      window.scrollTo({
        top: typeof target === "number" ? target : 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  }

  // 3. TEXT SPLITTING HELPERS
  function splitWords(el) {
    if (!el || el.dataset.split) return el ? el.querySelectorAll(".split-word") : [];
    el.dataset.split = "words";
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="inline-block overflow-hidden"><span class="inline-block split-word">${w}</span></span>`)
      .join(" ");
    return el.querySelectorAll(".split-word");
  }

  function splitChars(el) {
    if (!el || el.dataset.split) return el ? el.querySelectorAll(".split-char") : [];
    el.dataset.split = "chars";
    const text = el.textContent.trim();
    const chars = text.split("");
    el.innerHTML = chars
      .map((c) => (c === " " ? " " : `<span class="inline-block overflow-hidden"><span class="inline-block split-char">${c}</span></span>`))
      .join("");
    return el.querySelectorAll(".split-char");
  }

  // 4. CUSTOM CURSOR
  function initCursor() {
    if (!isFinePointer || prefersReducedMotion) return;

    const ring = document.getElementById("cursor-ring");
    const dot = document.getElementById("cursor-dot");
    const label = document.getElementById("cursor-label");
    if (!ring || !dot || !label) return;

    document.documentElement.classList.add("has-cursor");
    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, opacity: 0 });

    const rx = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });

    const LABELS = {
      view: "View",
      play: "Play",
      explore: "Explore",
      drag: "Drag",
      open: "Open",
      listen: "Listen",
      book: "Book",
    };

    let current = null;
    let shown = false;

    const setState = (mode) => {
      if (mode === current) return;
      current = mode;
      const text = mode && mode !== "hover" ? LABELS[mode] || mode : "";
      label.textContent = text;
      gsap.to(ring, {
        scale: text ? 1 : mode === "hover" ? 0.55 : 0.28,
        backgroundColor: text ? "rgba(255,114,1,1)" : "rgba(255,114,1,0)",
        borderColor: text ? "rgba(255,114,1,1)" : "rgba(255,255,255,0.55)",
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(label, { opacity: text ? 1 : 0, scale: text ? 1 : 0.6, duration: 0.3, overwrite: "auto" });
      gsap.to(dot, { scale: text ? 0 : 1, duration: 0.3, overwrite: "auto" });
    };

    window.addEventListener("pointermove", (e) => {
      if (!shown) {
        shown = true;
        gsap.set([ring, dot], { x: e.clientX, y: e.clientY });
        gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
      }
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);

      const t = e.target;
      if (t.closest("input, textarea, select, iframe")) {
        gsap.to([ring, dot], { opacity: 0, duration: 0.2, overwrite: "auto" });
        current = "__hidden";
        return;
      }
      if (current === "__hidden") gsap.to([ring, dot], { opacity: 1, duration: 0.2 });
      const el = t.closest("[data-cursor]");
      if (el) setState(el.dataset.cursor || "hover");
      else if (t.closest("a, button, [role='button'], label")) setState("hover");
      else setState(null);
    }, { passive: true });

    document.addEventListener("pointerleave", () => {
      shown = false;
      gsap.to([ring, dot], { opacity: 0, duration: 0.3 });
    });

    window.addEventListener("pointerdown", () => gsap.to(ring, { scale: "-=0.08", duration: 0.15 }));
    window.addEventListener("pointerup", () => {
      const m = current;
      current = "__reset";
      setState(m === "__hidden" ? null : m);
    });
  }

  // 5. MAGNETIC ELEMENTS
  function initMagnetic() {
    if (!isFinePointer || prefersReducedMotion) return;

    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.dataset.magneticStrength) || 0.3;
      const inner = el.querySelector(".pill-dot, [data-magnetic-inner]");
      const innerStrength = strength * 0.7;

      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      const ixTo = inner ? gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3.out" }) : null;
      const iyTo = inner ? gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3.out" }) : null;

      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * strength);
        yTo(dy * strength);
        if (ixTo && iyTo) {
          ixTo(dx * innerStrength);
          iyTo(dy * innerStrength);
        }
      });

      el.addEventListener("pointerleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
      });
    });
  }

  // 6. AMBIENT GLOW SYSTEM
  const GLOW_STOPS = {
    home: { xPercent: 0, yPercent: 40, scale: 0.6, opacity: 0 },
    about: { xPercent: 55, yPercent: -25, scale: 1, opacity: 0.45 },
    music: { xPercent: -55, yPercent: 10, scale: 0.9, opacity: 0.35 },
    performances: { xPercent: 0, yPercent: 0, scale: 0.8, opacity: 0 },
    gallery: { xPercent: 50, yPercent: 30, scale: 1.1, opacity: 0.25 },
    videos: { xPercent: -40, yPercent: -20, scale: 1, opacity: 0.4 },
    contact: { xPercent: 0, yPercent: 35, scale: 1.3, opacity: 0.55 },
  };

  function initAmbientGlow() {
    const inner = document.getElementById("ambient-glow-inner");
    if (!inner) return;

    gsap.set(inner, GLOW_STOPS.home);

    Object.entries(GLOW_STOPS).forEach(([id, vars]) => {
      const section = document.getElementById(id);
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        refreshPriority: -1,
        onToggle: (self) => {
          if (self.isActive) {
            gsap.to(inner, { ...vars, duration: 1.8, ease: "fader", overwrite: true });
          }
        },
      });
    });
  }

  // 7. HERO — scroll-expansion wordmark: "AI [photo] DEN"
  // The photo sits in a window inside the wordmark, opens on load, and grows
  // to full bleed while the section is pinned. One render function owns the
  // clip-path so the load animation and the scroll scrub never fight.
  const heroState = { e: 0, v: 0 };
  let heroGeo = null;
  const heroMotion = () => !prefersReducedMotion && document.documentElement.classList.contains("motion-ok");

  function measureHero() {
    const root = document.getElementById("home");
    const stage = root?.querySelector("[data-hero-stage]");
    const win = root?.querySelector("[data-hero-window]");
    if (!stage || !win) return;
    const s = stage.getBoundingClientRect();
    const w = win.getBoundingClientRect();
    heroGeo = {
      t: w.top - s.top,
      r: s.right - w.right,
      b: s.bottom - w.bottom,
      l: w.left - s.left,
      cx: w.left - s.left + w.width / 2,
      W: s.width,
      sx: 0,
      sy: 0,
    };

    // Frame the subject (data-focus, fractions of the image) inside the window:
    // the photo starts scaled down around the subject so the whole head fits,
    // then scale and offset run with the same progress as the clip, ending at
    // the normal full-bleed cover crop. Both move linearly in v and both ends
    // cover the clip, so no edge of the photo can ever show.
    const img = root.querySelector("[data-hero-img]");
    if (!img) return;
    const [fx, fy] = (img.dataset.focus || "0.5 0.5").split(" ").map(Number);
    const iw = img.naturalWidth || +img.getAttribute("width");
    const ih = img.naturalHeight || +img.getAttribute("height");
    const [px, py] = getComputedStyle(img).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
    const k = Math.max(s.width / iw, s.height / ih);
    const rw = iw * k;
    const rh = ih * k;
    const subX = (s.width - rw) * px + fx * rw; // subject, unscaled, in stage coords
    const subY = (s.height - rh) * py + fy * rh;
    heroGeo.subX = subX;
    heroGeo.subY = subY;
    heroGeo.s0 = gsap.utils.clamp(0.2, 1, 1.7 * Math.max(w.width / rw, w.height / rh));
    heroGeo.sx = w.left - s.left + w.width / 2 - subX;
    heroGeo.sy = w.top - s.top + w.height / 2 - subY;
  }

  function renderHeroClip() {
    const media = document.querySelector("[data-hero-media]");
    if (!media || !heroGeo) return;
    const g = heroGeo;
    const { e, v } = heroState;
    const lerp = (a, b, p) => a + (b - a) * p;
    // entrance: a vertical slit at the window centre opens to the window
    const l0 = lerp(g.cx, g.l, e);
    const r0 = lerp(g.W - g.cx, g.r, e);
    // scroll: the window grows to the full stage
    const t = lerp(g.t, 0, v);
    const b = lerp(g.b, 0, v);
    const l = lerp(l0, 0, v);
    const r = lerp(r0, 0, v);
    const rad = lerp(14, 0, v);
    media.style.clipPath = `inset(${t}px ${r}px ${b}px ${l}px round ${rad}px)`;
    const wrap = media.querySelector("[data-hero-imgwrap]");
    const img = media.querySelector("[data-hero-img]");
    if (wrap && img && g.s0) {
      const origin = `${g.subX}px ${g.subY}px`;
      gsap.set(wrap, { x: g.sx * (1 - v), y: g.sy * (1 - v), transformOrigin: origin });
      gsap.set(img, { scale: g.s0 + (1 - g.s0) * v, transformOrigin: origin });
    }
  }

  function playHeroEntrance() {
    const root = document.getElementById("home");
    if (!root) return;
    const ins = root.querySelectorAll("[data-hero-in]");
    const meta = root.querySelectorAll("[data-hero-meta] > *");

    if (!heroMotion()) {
      gsap.from([...meta, ...ins], { opacity: 0, duration: 0.8, stagger: 0.04 });
      return;
    }

    measureHero();
    const tl = gsap.timeline({ defaults: { ease: "drop" } });
    tl.from(root.querySelector("[data-hero-glow]"), { scale: 0.3, opacity: 0, duration: 2.2, ease: "fader" }, 0)
      .from(root.querySelectorAll("[data-hero-letter]"), { yPercent: 112, duration: 1.4, stagger: 0.07 }, 0.1)
      .to(heroState, { e: 1, duration: 1.5, ease: "fader", onUpdate: renderHeroClip }, 0.5)
      .from(root.querySelector("[data-hero-imgwrap]"), { scale: 1.45, duration: 2.1, ease: "fader" }, 0.5)
      .from(meta, { opacity: 0, y: 12, duration: 0.8, stagger: 0.06 }, 0.75)
      .from(ins, { opacity: 0, y: 26, duration: 0.9, stagger: 0.08 }, 0.95);
  }

  function initHero() {
    const root = document.getElementById("home");
    if (!root) return;

    if (heroMotion()) {
      measureHero();
      renderHeroClip();
      document.fonts?.ready.then(() => {
        measureHero();
        renderHeroClip();
      });
      const heroImg = root.querySelector("[data-hero-img]");
      if (heroImg && !heroImg.complete) {
        heroImg.addEventListener("load", () => {
          measureHero();
          renderHeroClip();
        }, { once: true });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => "+=" + Math.round(window.innerHeight * 1.4),
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measureHero();
            renderHeroClip();
          },
        },
      });

      tl.to(heroState, { v: 1, ease: "power1.inOut", duration: 1, onUpdate: renderHeroClip }, 0)
        .to(root.querySelector('[data-hero-half="l"]'), { xPercent: -150, ease: "power1.in", duration: 0.75 }, 0)
        .to(root.querySelector('[data-hero-half="r"]'), { xPercent: 150, ease: "power1.in", duration: 0.75 }, 0)
        .to(root.querySelector("[data-hero-word]"), { opacity: 0, ease: "none", duration: 0.3 }, 0.45)
        .to(root.querySelector("[data-hero-meta]"), { opacity: 0, y: -24, ease: "none", duration: 0.3 }, 0)
        .to(root.querySelector("[data-hero-glow]"), { scale: 1.6, opacity: 0, ease: "none", duration: 0.6 }, 0)
        .to(root.querySelector("[data-hero-shade]"), { opacity: 1, ease: "none", duration: 0.5 }, 0.35)
        .to(root.querySelectorAll("[data-hero-line]"), { y: 0, yPercent: 0, duration: 0.32, stagger: 0.1, ease: "power2.out" }, 0.62);

      // Pointer depth on the wordmark and glow
      if (isFinePointer) {
        const word = root.querySelector("[data-hero-word]");
        const glow = root.querySelector("[data-hero-glow]");
        const wX = gsap.quickTo(word, "x", { duration: 1.1, ease: "power3.out" });
        const wY = gsap.quickTo(word, "y", { duration: 1.1, ease: "power3.out" });
        const gX = gsap.quickTo(glow, "x", { duration: 1.4, ease: "power3.out" });
        const gY = gsap.quickTo(glow, "y", { duration: 1.4, ease: "power3.out" });
        root.addEventListener("pointermove", (e) => {
          const r = root.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          wX(nx * -22);
          wY(ny * -14);
          gX(nx * 90);
          gY(ny * 90);
        });
        root.addEventListener("pointerleave", () => {
          wX(0); wY(0); gX(0); gY(0);
        });
      }
    }

    // Hero Latest Card Carousel
    const LATEST_VIDEOS = [
      { title: "Progressive house reel", date: "21 Oct 2026", shortcode: "DewVkg-qe8s" },
      { title: "Forever grateful reel", date: "13 Oct 2026", shortcode: "DedZAcmKZRO" },
    ];
    let curLatest = 0;
    const descEl = document.getElementById("hero-latest-desc");
    const progEl = document.getElementById("hero-latest-progress");
    const prevBtn = document.getElementById("hero-latest-prev");
    const nextBtn = document.getElementById("hero-latest-next");
    const playBtn = document.getElementById("hero-latest-btn");

    const updateLatest = (idx) => {
      curLatest = (idx + LATEST_VIDEOS.length) % LATEST_VIDEOS.length;
      const item = LATEST_VIDEOS[curLatest];
      if (descEl) descEl.textContent = `${item.title}, ${item.date}. Watch it here without leaving the site.`;
      if (progEl) progEl.style.width = `${((curLatest + 1) / LATEST_VIDEOS.length) * 100}%`;
    };

    prevBtn?.addEventListener("click", () => updateLatest(curLatest - 1));
    nextBtn?.addEventListener("click", () => updateLatest(curLatest + 1));
    playBtn?.addEventListener("click", (e) => {
      openVideo(LATEST_VIDEOS[curLatest].shortcode, LATEST_VIDEOS[curLatest].title, LATEST_VIDEOS[curLatest].date, e);
    });

    // Scroll Cue
    document.getElementById("hero-scroll-cue")?.addEventListener("click", () => scrollToTarget("#about"));
  }

  // 7b. TAPES — two crossing marquees; scroll speed boosts them, scroll direction reverses them
  function initTapes() {
    const wrap = document.querySelector("[data-tapes]");
    const tracks = document.querySelectorAll("[data-tape]");
    if (!wrap || !tracks.length || prefersReducedMotion) return;

    const loops = [...tracks].map((track) => {
      const dir = parseFloat(track.dataset.tape) || 1;
      const tween = gsap.fromTo(
        track,
        { xPercent: dir > 0 ? 0 : -50 },
        { xPercent: dir > 0 ? -50 : 0, ease: "none", duration: 24, repeat: -1 }
      );
      tween.totalTime(tween.duration() * 200); // room to run backwards
      return tween;
    });

    let dir = 1;
    ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        dir = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 220, 6);
        loops.forEach((t) => gsap.to(t, { timeScale: dir * boost, duration: 0.25, overwrite: true }));
      },
    });
    ScrollTrigger.addEventListener("scrollEnd", () => {
      loops.forEach((t) => gsap.to(t, { timeScale: dir, duration: 0.9, overwrite: true }));
    });

    const st = { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true };
    gsap.fromTo(wrap.querySelector(".tape--ember"), { yPercent: 40 }, { yPercent: -40, ease: "none", scrollTrigger: st });
    gsap.fromTo(wrap.querySelector(".tape--bone"), { yPercent: -40 }, { yPercent: 40, ease: "none", scrollTrigger: st });
  }

  // 7c. ZOOM PARALLAX — seven photos scale out at different speeds; the centre one fills the screen
  function initZoom() {
    const root = document.querySelector("[data-zoom]");
    if (!root || !heroMotion()) return;
    const items = root.querySelectorAll("[data-zoom-item]");
    const scales = [4, 5, 6, 5, 6, 8, 9];
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6 },
    });
    items.forEach((item, i) => {
      // the centre photo is laid out full-screen and scaled down, so it stays sharp at the end
      const from = i === 0 ? 0.25 : 1;
      const to = i === 0 ? 1 : scales[i] || 4;
      tl.fromTo(item, { scale: from }, { scale: to, ease: "none", duration: 1 }, 0);
    });
    const caption = root.querySelector("[data-zoom-caption]");
    if (caption) {
      tl.fromTo(caption, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.18 }, 0.8);
    }
  }

  // 7d. HEADING REVEALS — words rise out of a mask (keeps <br> and inline spans intact)
  function splitDeep(el) {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            const outer = document.createElement("span");
            outer.className = "rv-word";
            const inner = document.createElement("span");
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
            out.push(inner);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") {
          walk(n);
        }
      });
    };
    walk(el);
    return out;
  }

  function initHeadingReveals() {
    if (prefersReducedMotion) return;
    document.querySelectorAll("[data-reveal-heading]").forEach((el) => {
      const words = splitDeep(el);
      gsap.from(words, {
        yPercent: 115,
        rotate: 5,
        duration: 1.15,
        stagger: 0.07,
        ease: "drop",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });
  }

  // 7e. VELOCITY SKEW — grids lean into fast scrolling, settle when it stops
  function initVelocitySkew() {
    if (prefersReducedMotion) return;
    const targets = document.querySelectorAll("[data-skew]");
    if (!targets.length) return;
    const setters = [...targets].map((t) => gsap.quickTo(t, "skewY", { duration: 0.6, ease: "power3.out" }));
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const s = gsap.utils.clamp(-4, 4, self.getVelocity() / -450);
        setters.forEach((fn) => fn(s));
      },
    });
    ScrollTrigger.addEventListener("scrollEnd", () => setters.forEach((fn) => fn(0)));
  }

  // 8. ABOUT SECTION ANIMATIONS
  function initAbout() {
    const root = document.getElementById("about");
    if (!root) return;

    // Statement Words Lighting Up on Scroll
    const statementEl = root.querySelector("[data-statement]");
    if (statementEl) {
      const words = splitDeep(statementEl);
      if (!prefersReducedMotion) {
        gsap.from(statementEl.querySelectorAll("[data-chip]"), {
          width: 0,
          marginLeft: 0,
          marginRight: 0,
          ease: "none",
          stagger: 0.3,
          scrollTrigger: { trigger: statementEl, start: "top 80%", end: "center 45%", scrub: 0.6 },
        });
      }
      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: statementEl,
            start: "top 75%",
            end: "bottom 40%",
            scrub: 0.6,
          },
        }
      );
    }

    // Intro & Quote text
    const introEl = root.querySelector("[data-about-intro]");
    if (introEl) {
      const words = splitWords(introEl);
      gsap.from(words, {
        opacity: 0,
        y: 14,
        duration: 0.8,
        stagger: 0.012,
        scrollTrigger: { trigger: introEl, start: "top 88%", once: true },
      });
    }

    const quoteEl = root.querySelector("[data-quote]");
    if (quoteEl) {
      const qWords = splitDeep(quoteEl); // word masks, so lines never break mid-word
      gsap.from(qWords, {
        opacity: 0,
        yPercent: 100,
        duration: 0.8,
        stagger: 0.05,
        scrollTrigger: { trigger: quoteEl, start: "top 88%", once: true },
      });
    }

    // Side label & Brand mark
    gsap.from(root.querySelectorAll("[data-about-side]"), {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      scrollTrigger: { trigger: root, start: "top 75%", once: true },
    });

    // Facts Hairlines & Texts
    const factsEl = root.querySelector("[data-facts]");
    if (factsEl) {
      gsap.from(root.querySelectorAll("[data-fact-line]"), {
        scaleX: 0,
        duration: 1.2,
        ease: "fader",
        stagger: 0.12,
        scrollTrigger: { trigger: factsEl, start: "top 85%", once: true },
      });
      gsap.from(root.querySelectorAll("[data-fact] dt, [data-fact] dd"), {
        opacity: 0,
        y: 14,
        duration: 0.8,
        stagger: 0.06,
        scrollTrigger: { trigger: factsEl, start: "top 85%", once: true },
      });
    }

    if (prefersReducedMotion) return;

    // Portrait photo mask reveal
    const portraitFrame = root.querySelector("[data-portrait]");
    if (portraitFrame) {
      gsap.fromTo(
        portraitFrame,
        { clipPath: "inset(100% 0% 0% 0% round 24px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 24px)",
          duration: 1.6,
          ease: "fader",
          scrollTrigger: { trigger: portraitFrame, start: "top 85%", once: true },
        }
      );
      const img = portraitFrame.querySelector("[data-media-img]");
      if (img) {
        gsap.fromTo(
          img,
          { yPercent: -8, scale: 1.18 },
          {
            yPercent: 8,
            scale: 1.18,
            ease: "none",
            scrollTrigger: { trigger: portraitFrame, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }
    }

    // Quote Card Entrance & 3D Tilt
    const quoteCard = root.querySelector("[data-quote-card]");
    if (quoteCard) {
      gsap.from(quoteCard, {
        scale: 0.85,
        opacity: 0,
        transformOrigin: "100% 100%",
        duration: 1.3,
        scrollTrigger: { trigger: quoteCard, start: "top 90%", once: true },
      });

      if (isFinePointer) {
        gsap.set(quoteCard, { transformPerspective: 900, transformStyle: "preserve-3d" });
        const rx = gsap.quickTo(quoteCard, "rotationX", { duration: 0.8, ease: "power3.out" });
        const ry = gsap.quickTo(quoteCard, "rotationY", { duration: 0.8, ease: "power3.out" });
        quoteCard.addEventListener("pointermove", (e) => {
          const r = quoteCard.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          ry(nx * 10);
          rx(-ny * 10);
        });
        quoteCard.addEventListener("pointerleave", () => {
          rx(0);
          ry(0);
        });
      }
    }
  }

  // 9. MUSIC SECTION ANIMATIONS
  function initMusic() {
    const root = document.getElementById("music");
    if (!root) return;

    // Header hairline animation
    gsap.from(root.querySelector(".hairline"), {
      scaleX: 0,
      duration: 1.6,
      ease: "fader",
      scrollTrigger: { trigger: root, start: "top 80%", once: true },
    });

    // Featured Mix Cover
    const featCover = root.querySelector("[data-feat-cover]");
    if (featCover) {
      gsap.from(featCover, {
        clipPath: "circle(0% at 50% 50%)",
        scale: 1.15,
        duration: 1.6,
        ease: "fader",
        scrollTrigger: { trigger: root.querySelector("#featured-mix"), start: "top 80%", once: true },
      });

      if (!prefersReducedMotion && isFinePointer) {
        const tiltX = gsap.quickTo(featCover, "rotationY", { duration: 0.7, ease: "power3.out" });
        const tiltY = gsap.quickTo(featCover, "rotationX", { duration: 0.7, ease: "power3.out" });
        gsap.set(featCover, { transformPerspective: 900 });
        featCover.addEventListener("pointermove", (e) => {
          const r = featCover.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          tiltX(nx * 7);
          tiltY(-ny * 7);
        });
        featCover.addEventListener("pointerleave", () => {
          tiltX(0);
          tiltY(0);
        });
      }
    }

    gsap.from(root.querySelectorAll("[data-feat-in]"), {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      duration: 1,
      scrollTrigger: { trigger: root.querySelector("#featured-mix"), start: "top 75%", once: true },
    });

    // Accordion Rows
    const triggers = root.querySelectorAll(".accordion-trigger");
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const isExpanded = trigger.getAttribute("aria-expanded") === "true";
        const contentId = trigger.getAttribute("aria-controls");
        const content = document.getElementById(contentId);
        const icon = trigger.querySelector(".accordion-icon");

        // Close other rows
        triggers.forEach((other) => {
          if (other !== trigger) {
            other.setAttribute("aria-expanded", "false");
            const otherContent = document.getElementById(other.getAttribute("aria-controls"));
            if (otherContent) gsap.to(otherContent, { height: 0, duration: 0.4, ease: "power2.inOut" });
            const otherIcon = other.querySelector(".accordion-icon");
            if (otherIcon) otherIcon.classList.remove("!border-bone", "!bg-bone", "!text-black", "-rotate-45");
          }
        });

        // Toggle current row
        if (isExpanded) {
          trigger.setAttribute("aria-expanded", "false");
          gsap.to(content, {
            height: 0,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => ScrollTrigger.refresh(),
          });
          icon?.classList.remove("!border-bone", "!bg-bone", "!text-black", "-rotate-45");
        } else {
          trigger.setAttribute("aria-expanded", "true");
          gsap.set(content, { height: "auto" });
          const autoH = content.offsetHeight;
          gsap.fromTo(
            content,
            { height: 0 },
            {
              height: autoH,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => {
                gsap.set(content, { height: "auto" });
                ScrollTrigger.refresh();
              },
            }
          );
          icon?.classList.add("!border-bone", "!bg-bone", "!text-black", "-rotate-45");
        }
      });
    });
  }

  // 10. PERFORMANCES SECTION
  function initPerformances() {
    const root = document.getElementById("performances");
    const track = document.getElementById("performances-track");
    if (!root || !track) return;

    const mm = gsap.matchMedia();
    mm.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)" }, (ctx) => {
      const overflows = track.scrollWidth > window.innerWidth + 40;

      if (ctx.conditions.desktop && overflows && !prefersReducedMotion) {
        const distance = () => track.scrollWidth - window.innerWidth;

        const scrollTween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        const progressBar = root.querySelector("[data-perf-progress]");
        if (progressBar) {
          gsap.to(progressBar, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }

        const cards = root.querySelectorAll("[data-card]");
        cards.forEach((card, idx) => {
          const onScreen = card.getBoundingClientRect().left < window.innerWidth * 0.9;
          const isLast = idx === cards.length - 1;
          const img = card.querySelector("[data-card-img] [data-media-img]");

          if (img) {
            gsap.fromTo(
              img,
              { xPercent: -10 },
              {
                xPercent: 10,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: scrollTween,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              }
            );
          }

          gsap.from(card.querySelectorAll("[data-card-date], [data-card-title]"), {
            yPercent: 60,
            opacity: 0,
            stagger: 0.1,
            duration: 0.9,
            delay: onScreen ? idx * 0.12 : 0,
            scrollTrigger: onScreen
              ? { trigger: root, start: "top 55%", toggleActions: "play none none reverse" }
              : { trigger: card, containerAnimation: scrollTween, start: "left 85%", toggleActions: "play none none reverse" },
          });

          if (!onScreen && !isLast) {
            gsap.fromTo(
              card,
              { rotate: 3, scale: 0.92 },
              {
                rotate: 0,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: scrollTween,
                  start: "left right",
                  end: "left 60%",
                  scrub: true,
                },
              }
            );
          }
        });
      } else {
        gsap.from(root.querySelectorAll("[data-card]"), {
          y: 60,
          opacity: 0,
          stagger: 0.1,
          duration: 1,
          scrollTrigger: { trigger: track, start: "top 85%", once: true },
        });
      }
    });
  }

  // 11. GALLERY SECTION & LIGHTBOX
  // Built from the gallery markup so the lightbox always matches the tiles.
  const CATEGORY_LABELS = { Afterhours: "Afterhours · Club night", "Low Light": "Low Light · Portrait session", "Bright Side": "Bright Side · Studio smiles", "Open Air": "Open Air · Tents and gardens" };
  const GALLERY_ITEMS = Array.from(document.querySelectorAll("#gallery-grid button[data-gallery-idx]")).map((btn) => {
    const cat = btn.closest("[data-tile]")?.dataset.category || "";
    return {
      src: btn.dataset.full,
      caption: btn.dataset.caption || "",
      credit: btn.dataset.credit || "",
      category: CATEGORY_LABELS[cat] || cat,
    };
  });
  let lbCur = 0;
  let lbOpen = false;

  function initGallery() {
    const root = document.getElementById("gallery");
    const grid = document.getElementById("gallery-grid");
    if (!root || !grid) return;

    // Header hairline
    gsap.from(root.querySelector(".hairline"), {
      scaleX: 0,
      duration: 1.6,
      ease: "fader",
      scrollTrigger: { trigger: root, start: "top 80%", once: true },
    });

    // Tiles entrance
    const tiles = grid.querySelectorAll("[data-tile]");
    ScrollTrigger.batch(tiles, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.fromTo(
          batch,
          { clipPath: "inset(100% 0% 0% 0% round 18px)", y: prefersReducedMotion ? 0 : 60 },
          { clipPath: "inset(0% 0% 0% 0% round 18px)", y: 0, duration: 1.3, ease: "fader", stagger: 0.12, clearProps: "clipPath" }
        ),
    });

    // Category Filter Buttons
    const filterBtns = root.querySelectorAll(".gallery-filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach((b) => {
          const active = b === btn;
          b.setAttribute("aria-pressed", active ? "true" : "false");
          b.className = active
            ? "gallery-filter-btn rounded-full border px-4 py-2 text-[12.5px] transition-colors duration-300 border-bone bg-bone text-black"
            : "gallery-filter-btn rounded-full border px-4 py-2 text-[12.5px] transition-colors duration-300 border-white/15 text-white/75 hover:border-white/40 hover:text-white";
        });

        tiles.forEach((tile) => {
          const matches = cat === "All" || tile.dataset.category === cat;
          if (matches) {
            tile.style.display = "";
            gsap.fromTo(tile, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
          } else {
            tile.style.display = "none";
          }
        });
        ScrollTrigger.refresh();
      });
    });

    // Lightbox modal wiring
    const lbModal = document.getElementById("lightbox-modal");
    const lbClose = document.getElementById("lb-close");
    const lbPrev = document.getElementById("lb-prev");
    const lbNext = document.getElementById("lb-next");
    const lbImg = document.getElementById("lb-image");
    const lbCurEl = document.getElementById("lb-current");
    const lbTotEl = document.getElementById("lb-total");
    const lbCapEl = document.getElementById("lb-caption");
    const lbCatEl = document.getElementById("lb-category");
    const lbCreditEl = document.getElementById("lb-credit");

    if (lbTotEl) lbTotEl.textContent = String(GALLERY_ITEMS.length).padStart(2, "0");

    const updateLb = (idx) => {
      lbCur = (idx + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
      const itm = GALLERY_ITEMS[lbCur];
      if (lbCurEl) lbCurEl.textContent = String(lbCur + 1).padStart(2, "0");
      if (lbCapEl) lbCapEl.textContent = itm.caption;
      if (lbCatEl) lbCatEl.textContent = itm.category;
      if (lbCreditEl) lbCreditEl.textContent = itm.credit;
      if (lbImg) {
        if (!prefersReducedMotion) {
          gsap.fromTo(lbImg, { opacity: 0.4, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
        }
        lbImg.src = itm.src;
        lbImg.alt = itm.caption;
      }
    };

    window.openLightbox = (idx) => {
      lbOpen = true;
      updateLb(idx);
      lbModal.classList.remove("hidden");
      lbModal.classList.add("flex");
      lenis?.stop();
      gsap.fromTo(lbModal, { opacity: 0 }, { opacity: 1, duration: prefersReducedMotion ? 0.01 : 0.4, ease: "power2.out" });
      lbClose?.focus();
    };

    const closeLb = () => {
      if (!lbOpen) return;
      lbOpen = false;
      gsap.to(lbModal, {
        opacity: 0,
        duration: prefersReducedMotion ? 0.01 : 0.3,
        ease: "power2.in",
        onComplete: () => {
          lbModal.classList.add("hidden");
          lbModal.classList.remove("flex");
          lenis?.start();
        },
      });
    };

    lbClose?.addEventListener("click", closeLb);
    lbPrev?.addEventListener("click", () => updateLb(lbCur - 1));
    lbNext?.addEventListener("click", () => updateLb(lbCur + 1));
    lbModal?.addEventListener("click", (e) => {
      if (e.target === lbModal || e.target.id === "lb-stage") closeLb();
    });

    window.addEventListener("keydown", (e) => {
      if (!lbOpen) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") updateLb(lbCur - 1);
      else if (e.key === "ArrowRight") updateLb(lbCur + 1);
    });

    grid.querySelectorAll("button[data-gallery-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.galleryIdx, 10);
        window.openLightbox(idx);
      });
    });
  }

  // 11b. GALLERY CHAPTERS — each chapter tints the section background to its own mood
  function initGalleryChapters() {
    const root = document.getElementById("gallery");
    if (!root) return;
    const chapters = [...root.querySelectorAll("[data-chapter]")];
    const links = [...root.querySelectorAll("[data-chapter-link]")];
    if (!chapters.length) return;

    const INK = "#000000";
    const WHITE = "#ffffff";
    const setActive = (id) => links.forEach((a) => a.classList.toggle("is-active", a.dataset.chapterLink === id));
    const paint = (bg, fg) => {
      document.documentElement.dataset.tone = fg === WHITE ? "dark" : "light";
      return gsap.to(root, {
        backgroundColor: bg,
        color: fg,
        duration: prefersReducedMotion ? 0 : 0.9,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    chapters.forEach((ch, i) => {
      const bg = ch.dataset.bg || INK;
      const fg = ch.dataset.fg || WHITE;
      const enter = () => {
        paint(bg, fg);
        setActive(ch.id);
      };
      ScrollTrigger.create({
        trigger: ch,
        start: "top center",
        end: "bottom center",
        onEnter: enter,
        onEnterBack: enter,
        onLeave: () => {
          if (i === chapters.length - 1) {
            paint(INK, WHITE);
            setActive(null);
          }
        },
        onLeaveBack: () => {
          if (i === 0) {
            paint(INK, WHITE);
            setActive(null);
          }
        },
      });

      if (prefersReducedMotion) return;

      // giant chapter word drifts sideways, alternating direction per chapter
      const word = ch.querySelector("[data-chapter-word]");
      if (word) {
        const dir = i % 2 ? -1 : 1;
        gsap.fromTo(
          word,
          { xPercent: -14 * dir },
          { xPercent: 8 * dir, ease: "none", scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom top", scrub: true } }
        );
        gsap.from(word, {
          yPercent: 60,
          opacity: 0,
          duration: 1.1,
          ease: "drop",
          scrollTrigger: { trigger: ch, start: "top 80%", once: true },
        });
      }

      // red strip: tall portraits ride a wave as you scroll (desktop only)
      const strip = ch.querySelector("[data-strip]");
      if (strip) {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px)", () => {
          strip.querySelectorAll(".gallery-tile > button").forEach((btn, k) => {
            const amp = k % 2 ? 1 : -1;
            gsap.fromTo(
              btn,
              { y: 46 * amp },
              { y: -46 * amp, ease: "none", scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom top", scrub: true } }
            );
          });
        });
      }
    });

    links.forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(a.dataset.chapterLink);
        if (target) scrollToTarget(target, { offset: -110 });
      })
    );
  }

  // 12. VIDEOS SECTION & VIDEO MODAL
  let videoOpen = false;
  function openVideo(shortcode, title, date, e, kind = "reel") {
    const modal = document.getElementById("video-modal");
    const stage = document.getElementById("video-modal-stage");
    const titleEl = document.getElementById("video-modal-title");
    const dateEl = document.getElementById("video-modal-date");
    const extEl = document.getElementById("video-modal-external");
    if (!modal || !stage) return;

    videoOpen = true;
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;

    if (titleEl) titleEl.textContent = title;
    if (dateEl) dateEl.textContent = date;
    if (extEl) extEl.href = `https://www.instagram.com/${kind}/${shortcode}/`;

    stage.innerHTML = `<iframe
      title="${title} on Instagram"
      src="https://www.instagram.com/${kind}/${shortcode}/embed/"
      class="h-[min(82svh,760px)] w-[min(92vw,420px)] rounded-2xl bg-neutral-900 border-0"
      allow="encrypted-media; picture-in-picture; fullscreen"
      loading="lazy"
    ></iframe>`;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    lenis?.stop();

    if (!prefersReducedMotion) {
      gsap.fromTo(
        modal,
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(150vmax at ${x}px ${y}px)`, duration: 0.85, ease: "fader" }
      );
    } else {
      gsap.set(modal, { clipPath: "none" });
      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    }
  }

  function closeVideo() {
    const modal = document.getElementById("video-modal");
    const stage = document.getElementById("video-modal-stage");
    if (!videoOpen || !modal) return;
    videoOpen = false;
    if (stage) stage.innerHTML = "";

    if (!prefersReducedMotion) {
      gsap.to(modal, {
        clipPath: "circle(0px at 50% 50%)",
        duration: 0.5,
        ease: "power3.in",
        onComplete: () => {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
          lenis?.start();
        },
      });
    } else {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      lenis?.start();
    }
  }

  function initVideos() {
    const root = document.getElementById("videos");
    if (!root) return;

    // Velocity-driven skewing marquee
    const band = root.querySelector("[data-marquee]");
    if (band && !prefersReducedMotion) {
      const loop = gsap.to(band, { xPercent: -50, ease: "none", duration: 26, repeat: -1 });
      const skew = gsap.quickTo(band, "skewX", { duration: 0.5, ease: "power3.out" });
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          const dir = self.direction;
          gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 300, 6)), duration: 0.3, overwrite: true });
          skew(gsap.utils.clamp(-12, 12, v / -220));
        },
      });
      ScrollTrigger.addEventListener("scrollEnd", () => {
        gsap.to(loop, { timeScale: loop.timeScale() < 0 ? -1 : 1, duration: 1 });
        skew(0);
      });
    }

    // Cards entrance
    const cards = root.querySelectorAll("[data-video-card]");
    gsap.from(cards, {
      rotationX: prefersReducedMotion ? 0 : -12,
      y: prefersReducedMotion ? 0 : 80,
      opacity: 0,
      transformPerspective: 1000,
      transformOrigin: "50% 100%",
      stagger: 0.15,
      duration: 1.4,
      scrollTrigger: { trigger: root.querySelector("[data-video-grid]"), start: "top 85%", once: true },
    });

    const VIDEOS = [
      { shortcode: "DewVkg-qe8s", title: "Progressive house reel", date: "21 Oct 2026", kind: "reel" },
      { shortcode: "DedZAcmKZRO", title: "Forever grateful", date: "13 Oct 2026", kind: "reel" },
      { shortcode: "DTs2-NwDc73", title: "Adieu's Podcast Series, Episode 2", date: "Jan 2026", kind: "p" },
    ];

    cards.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(btn.dataset.videoIdx, 10) || 0;
        const v = VIDEOS[idx] || VIDEOS[0];
        openVideo(v.shortcode, v.title, v.date, e, v.kind);
      });
    });

    document.getElementById("video-modal-close")?.addEventListener("click", closeVideo);
    document.getElementById("video-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "video-modal") closeVideo();
    });
    window.addEventListener("keydown", (e) => {
      if (videoOpen && e.key === "Escape") closeVideo();
    });
  }

  // 13. BOOKING SECTION
  function initBooking() {
    const root = document.getElementById("contact");
    const form = document.getElementById("booking-form");
    const statusEl = document.getElementById("booking-status");
    if (!root || !form) return;

    // Entrance
    gsap.from(root.querySelectorAll(".booking-chip, [data-field], [data-submit]"), {
      y: 24,
      opacity: 0,
      stagger: 0.05,
      duration: 0.9,
      scrollTrigger: { trigger: form, start: "top 85%", once: true },
    });

    if (!prefersReducedMotion) {
      const fig = root.querySelector("[data-book-figure]");
      if (fig) {
        gsap.fromTo(
          fig,
          { clipPath: "circle(0% at 50% 60%)" },
          { clipPath: "circle(75% at 50% 50%)", duration: 1.8, ease: "fader", scrollTrigger: { trigger: fig, start: "top 85%", once: true } }
        );
      }
    }

    // Chips selection
    const chips = form.querySelectorAll(".booking-chip");
    chips.forEach((label) => {
      const input = label.querySelector("input");
      input.addEventListener("change", () => {
        chips.forEach((c) => {
          const chk = c.querySelector("input").checked;
          c.className = chk
            ? "booking-chip cursor-pointer rounded-full border px-3.5 py-2 text-[12.5px] transition-colors duration-300 border-ember bg-ember text-black"
            : "booking-chip cursor-pointer rounded-full border px-3.5 py-2 text-[12.5px] transition-colors duration-300 border-white/15 text-white/75 hover:border-white/40";
        });
      });
    });

    // Submit
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const type = data.get("type");
      const name = String(data.get("name") || "").trim();
      const date = data.get("date");
      const venue = String(data.get("venue") || "").trim();
      const details = String(data.get("message") || "").trim();

      if (!name || !details) {
        statusEl.className = "mt-4 min-h-[1.5em] text-[13px] text-sand";
        statusEl.textContent = "Please add your name and a few details about the event, then send again.";
        return;
      }

      const text = [
        `Hi Aiden, this is a booking enquiry from your website.`,
        ``,
        `Type: ${type}`,
        `Name: ${name}`,
        date ? `Date: ${date}` : null,
        venue ? `Venue / city: ${venue}` : null,
        ``,
        details,
      ].filter(Boolean).join("\n");

      const waUrl = `https://wa.me/94778703991?text=${encodeURIComponent(text)}`;
      const copying = navigator.clipboard?.writeText(text);
      window.open(waUrl, "_blank", "noopener");
      let copied = false;
      try {
        await copying;
        copied = true;
      } catch {
        copied = false;
      }

      statusEl.className = "mt-4 min-h-[1.5em] text-[13px] text-white/75";
      statusEl.textContent = copied
        ? "WhatsApp opened with your booking message ready to send (also copied to clipboard)."
        : "WhatsApp opened with your booking message ready to send.";
    });
  }

  // 14. NAVIGATION & MOBILE DRAWER
  function initNavigation() {
    const header = document.getElementById("header");
    const navBar = document.getElementById("header-bar");
    const progress = document.getElementById("header-progress");
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const navLinks = document.querySelectorAll("[data-nav-link]");

    if (!header) return;

    // Nav entrance
    gsap.from(header.querySelectorAll("[data-nav-in]"), {
      yPercent: -120,
      opacity: 0,
      duration: 1,
      stagger: 0.05,
      delay: 0.5,
    });

    // Progress bar
    if (progress) {
      gsap.to(progress, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });
    }

    // Scrolled state (soft fade behind the header) + hide on scroll down, show on scroll up
    let menuOpen = false;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        header.dataset.scrolled = y > 80 ? "true" : "false";
        if (!navBar || menuOpen) return;
        const hide = self.direction === 1 && y > window.innerHeight * 0.6;
        gsap.to(navBar, { yPercent: hide ? -140 : 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      },
    });

    // Local time in Negombo
    const clock = document.getElementById("nav-clock");
    if (clock) {
      const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Colombo" });
      const tick = () => {
        clock.textContent = fmt.format(new Date());
      };
      tick();
      setInterval(tick, 15000);
    }

    // Active Section Tracking
    ["home", "about", "music", "performances", "gallery", "contact"].forEach((id) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: (self) => {
          if (self.isActive) {
            navLinks.forEach((link) => {
              const match = link.dataset.navLink === id;
              link.className = `ulink inline-block py-1 text-[12.5px] font-medium transition-colors ${
                match ? "text-white" : "text-white/70 hover:text-white"
              }`;
            });
          }
        },
      });
    });

    // Smooth Anchor Scroll
    document.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", (e) => {
        const hash = link.getAttribute("href");
        if (hash && hash !== "#") {
          e.preventDefault();
          closeMenu();
          scrollToTarget(hash === "#home" ? 0 : hash);
          history.replaceState(null, "", hash);
        }
      });
    });

    // Full-screen menu (all screen sizes)
    const menuLabel = toggleBtn?.querySelector("[data-menu-label]");
    const openMenu = () => {
      menuOpen = true;
      header.dataset.menu = "open";
      gsap.to(navBar, { yPercent: 0, duration: 0.3, overwrite: "auto" });
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.setAttribute("aria-label", "Close menu");
      if (menuLabel) menuLabel.textContent = "Close";
      mobileMenu.classList.remove("invisible");
      mobileMenu.removeAttribute("inert");
      gsap.fromTo(
        mobileMenu,
        { clipPath: "circle(0% at 100% 0%)" },
        { clipPath: "circle(150% at 100% 0%)", duration: 0.9, ease: "fader" }
      );
      gsap.from(mobileMenu.querySelectorAll("[data-menu-link]"), {
        yPercent: 110,
        duration: 0.8,
        stagger: 0.06,
        ease: "drop",
        delay: 0.2,
      });
    };

    const closeMenu = () => {
      if (!menuOpen) return;
      menuOpen = false;
      header.dataset.menu = "closed";
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Open menu");
      if (menuLabel) menuLabel.textContent = "Menu";
      gsap.to(mobileMenu, {
        clipPath: "circle(0% at 100% 0%)",
        duration: 0.6,
        ease: "power3.in",
        onComplete: () => {
          mobileMenu.classList.add("invisible");
          mobileMenu.setAttribute("inert", "");
        },
      });
    };

    toggleBtn?.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
    window.addEventListener("keydown", (e) => {
      if (menuOpen && e.key === "Escape") closeMenu();
    });
  }

  // 15. FOOTER
  function initFooter() {
    const root = document.getElementById("footer");
    if (!root) return;

    const yearEl = document.getElementById("copyright-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    gsap.from(root.querySelectorAll("[data-foot-in]"), {
      y: 30,
      opacity: 0,
      stagger: 0.06,
      duration: 1,
      scrollTrigger: { trigger: root, start: "top 85%", once: true },
    });

    if (!prefersReducedMotion) {
      const letters = root.querySelectorAll("[data-foot-letter]");
      const markEl = root.querySelector("[data-foot-mark]");
      const glow = root.querySelector("[data-foot-glow]");
      if (markEl && letters.length) {
        const st = { trigger: markEl, start: "top bottom", end: "bottom bottom", scrub: 0.6 };
        gsap.fromTo(
          letters,
          { yPercent: 100, rotate: (i) => (i % 2 ? 8 : -8) },
          { yPercent: 0, rotate: 0, stagger: 0.08, ease: "none", scrollTrigger: st }
        );
        if (glow) gsap.fromTo(glow, { yPercent: 60, scale: 0.6 }, { yPercent: 0, scale: 1, ease: "none", scrollTrigger: st });
      }
    }

    document.getElementById("back-to-top")?.addEventListener("click", () => scrollToTarget(0));
  }

  // 16. PRELOADER & APP LAUNCH
  function launchSite() {
    initCursor();
    initMagnetic();
    initHero();
    initTapes();
    initAbout();
    initZoom();
    initHeadingReveals();
    initMusic();
    initPerformances();
    initGallery();
    initGalleryChapters();
    initVideos();
    initBooking();
    initFooter();
    initVelocitySkew();

    const preloader = document.getElementById("preloader");
    const counter = document.getElementById("preloader-counter");
    const bar = document.getElementById("preloader-bar");
    const letters = preloader?.querySelectorAll("[data-preloader-letter]");
    const fadeEls = preloader?.querySelectorAll("[data-preloader-fade]");
    const edge = document.getElementById("preloader-edge");

    if (!preloader) {
      playHeroEntrance();
      initAmbientGlow();
      initNavigation();
      return;
    }

    document.documentElement.style.overflow = "hidden";
    gsap.from(letters, { yPercent: 110, duration: 0.9, stagger: 0.05, ease: "drop" });
    gsap.from(fadeEls, { opacity: 0, duration: 0.6, delay: 0.2 });

    let exited = false;
    const exitPreloader = () => {
      if (exited) return;
      exited = true;
      playHeroEntrance();
      initAmbientGlow();
      initNavigation();

      if (prefersReducedMotion) {
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            preloader.remove();
            document.documentElement.style.overflow = "";
            ScrollTrigger.refresh();
          },
        });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          preloader.remove();
          document.documentElement.style.overflow = "";
          ScrollTrigger.refresh();
        },
      });

      tl.to(letters, { yPercent: -110, duration: 0.6, stagger: 0.035, ease: "power3.in" })
        .to(fadeEls, { opacity: 0, duration: 0.3 }, "<")
        .to(preloader, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "fader" }, "-=0.25")
        .to(edge, { opacity: 1, duration: 0.2 }, "<");
    };

    let prog = { v: 0 };
    gsap.to(prog, {
      v: 100,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => {
        const val = Math.round(prog.v);
        if (counter) counter.textContent = String(val).padStart(3, "0");
        if (bar) gsap.set(bar, { scaleX: val / 100 });
      },
      onComplete: exitPreloader,
    });

    setTimeout(exitPreloader, 4000); // Safety valve
  }

  // Start!
  launchSite();
});
