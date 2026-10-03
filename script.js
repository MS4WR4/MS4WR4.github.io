const PRM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

$("#year").textContent = new Date().getFullYear();

// ---------- typed roles ----------
(function typed() {
  const el = $("#typed");
  const roles = [
    "ctf player @ 0TR4C3",
    "challenge author — 36 challenges",
    "main organizer of Click2Trace CTF",
    "dfir · mobile · reverse · crypto",
    "cybersecurity engineering student",
  ];
  if (PRM) { el.textContent = roles[0]; return; }
  let r = 0, c = 0, del = false;
  (function tick() {
    const word = roles[r];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1800); }
    if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 30 : 65);
  })();
})();

// ---------- nav: scrolled state, progress bar, active link, mobile menu ----------
(function nav() {
  const nav = $("#nav"), bar = $("#progress"), burger = $("#burger");
  const links = $$(".nav-links a");
  const sections = links.map(a => $(a.getAttribute("href"))).filter(Boolean);

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    let current = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s.id; });
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  links.forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", false);
  }));
})();

// ---------- mouse spotlight ----------
(function spotlight() {
  if (PRM || matchMedia("(hover: none)").matches) return;
  const s = $("#spotlight");
  addEventListener("mousemove", e => {
    s.style.setProperty("--mx", e.clientX + "px");
    s.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });
})();

// ---------- matrix rain ----------
(function matrix() {
  if (PRM) return;
  const canvas = $("#matrix"), ctx = canvas.getContext("2d");
  const size = 15;
  const glyphs = "01アイウエオカキクケコサシスセソタチツテト$#%&*<>MS4WR4".split("");
  let W, H, drops;
  function resize() {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    drops = Array(Math.floor(W / size)).fill(0).map(() => Math.random() * -60);
  }
  resize();
  addEventListener("resize", resize);
  (function draw() {
    ctx.fillStyle = "rgba(7,7,7,0.09)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = size + "px monospace";
    drops.forEach((d, i) => {
      const ch = glyphs[(Math.random() * glyphs.length) | 0];
      ctx.fillStyle = Math.random() > 0.97 ? "#fff" : "rgba(255,45,45,0.9)";
      ctx.fillText(ch, i * size, d * size);
      if (d * size > H && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.45;
    });
    requestAnimationFrame(draw);
  })();
})();

// ---------- reveal on scroll (staggered within each parent) ----------
(function reveal() {
  const items = $$(".reveal");
  if (PRM || !("IntersectionObserver" in window)) { items.forEach(i => i.classList.add("in")); return; }
  items.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains("reveal"));
    el.style.transitionDelay = Math.min(sibs.indexOf(el), 8) * 70 + "ms";
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.addEventListener("transitionend", () => { e.target.style.transitionDelay = ""; }, { once: true });
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  items.forEach(i => io.observe(i));
})();

// ---------- stat counters ----------
(function counters() {
  const nums = $$(".stat .num");
  const fmt = n => n.toLocaleString("en-US");
  if (PRM || !("IntersectionObserver" in window)) { nums.forEach(n => n.textContent = fmt(+n.dataset.count)); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, t0 = performance.now();
      (function frame(t) {
        const p = Math.min((t - t0) / 1600, 1);
        el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(frame);
      })(t0);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

// ---------- competition filters ----------
(function filters() {
  const btns = $$(".filter"), cards = $$(".comp");
  btns.forEach(b => b.addEventListener("click", () => {
    btns.forEach(x => x.classList.toggle("active", x === b));
    const f = b.dataset.filter;
    cards.forEach(c => {
      const show = f === "all" || c.dataset.tags.split(" ").includes(f);
      c.classList.toggle("hide", !show);
      c.classList.add("in");
    });
  }));
})();

// ---------- 3D tilt on cards ----------
(function tilt() {
  if (PRM || matchMedia("(hover: none)").matches) return;
  $$(".comp, .tile, .skill").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-3px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
})();

// ---------- copy email ----------
(function copyEmail() {
  const btn = $("#copyEmail");
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
      btn.textContent = "copied ✓";
    } catch {
      location.href = "mailto:" + btn.dataset.email;
      return;
    }
    setTimeout(() => { btn.textContent = "copy email"; }, 1800);
  });
})();
