/* ============================================================================
   AMOR — app.js
   Compartido por todas las páginas: config, luz ambiental, susurros, frases,
   contador de tiempo, toasts y reveal. Sin dependencias, sin build.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.AMOR_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── utilidades ─────────────────────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function daysBetween(a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); }

  function pick(obj, path) {
    return String(path).split(".").reduce(function (o, k) {
      return (o == null ? undefined : o[k]);
    }, obj);
  }

  /* ─── 1. Contador de tiempo juntos ───────────────────────────────────
     Versión corregida: compara FECHAS sin hora, no milisegundos al azar.
     El contador anterior contaba hacia las 00:00 del día 10, así que el
     día del aniversario mensual era justamente el único que decía mal.  */
  function sinceDate() {
    var raw = (CFG.us && CFG.us.since) || "2025-01-01";
    var p = String(raw).split("-").map(Number);
    return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
  }

  function timeTogether() {
    var start = sinceDate();
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (start > today) return null;

    var y = today.getFullYear() - start.getFullYear();
    var m = today.getMonth() - start.getMonth();
    var d = today.getDate() - start.getDate();
    if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }

    var md = (CFG.us && CFG.us.monthDay) || start.getDate();
    var target = new Date(today.getFullYear(), today.getMonth(), md);
    if (target.getMonth() !== today.getMonth() || target.getDate() !== md) {
      /* el día no existe en este mes (ej: día 31 en febrero) */
      target = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    } else if (target < today) {
      target = new Date(today.getFullYear(), today.getMonth() + 1, md);
      if (target.getDate() !== md) target = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    }

    var yearly = new Date(today.getFullYear(), start.getMonth(), start.getDate());
    if (yearly < today) yearly.setFullYear(yearly.getFullYear() + 1);

    return {
      years: y, months: m, days: d,
      totalDays: daysBetween(start, today),
      toMonthly: daysBetween(today, target),
      toYearly: daysBetween(today, yearly),
      isMonthlyToday: daysBetween(today, target) === 0,
      isYearlyToday: daysBetween(today, yearly) === 0
    };
  }

  function renderCounter(root) {
    var t = timeTogether();
    $all("[data-counter]", root).forEach(function (node) {
      var kind = node.getAttribute("data-counter");
      if (!t) { node.textContent = ""; return; }
      if (kind === "years") node.textContent = t.years;
      else if (kind === "months") node.textContent = t.months;
      else if (kind === "days") node.textContent = t.days;
      else if (kind === "total") node.textContent = t.totalDays.toLocaleString("es");
      else if (kind === "sentence") {
        var bits = [];
        if (t.years) bits.push(t.years + (t.years === 1 ? " año" : " años"));
        if (t.months) bits.push(t.months + (t.months === 1 ? " mes" : " meses"));
        bits.push(t.days + (t.days === 1 ? " día" : " días"));
        node.textContent = bits.join(", ") + " ";
      } else if (kind === "monthly") {
        node.textContent = t.isMonthlyToday
          ? "Hoy cumplimos un mes más."
          : "Faltan " + t.toMonthly + (t.toMonthly === 1 ? " día" : " días") + " para el mes que sigue.";
      } else if (kind === "yearly") {
        node.textContent = t.isYearlyToday
          ? "Hoy es nuestro aniversario."
          : "Nuestro aniversario es en " + t.toYearly + " días.";
      }
    });
  }

  /* ─── 2. Capa de luz: el reemplazo de la lluvia matrix ─────────────── */
  function buildLight() {
    if (reduceMotion) return;
    var layer = el("div", "light-layer");
    layer.setAttribute("aria-hidden", "true");
    ["beam beam-a", "beam beam-b", "beam beam-c"].forEach(function (c) {
      layer.appendChild(el("div", c));
    });
    document.body.insertBefore(layer, document.body.firstChild);
  }

  /* ─── 3. Susurros: los apodos subiendo despacio ────────────────────── */
  function buildWhispers() {
    if (reduceMotion) return;
    var names = (CFG.her && CFG.her.petNames) || ["amor"];
    var layer = el("div", "whispers");
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    var MAX = 9;
    function spawn() {
      if (document.hidden) return;
      if (layer.childElementCount > MAX) return;
      var word = names[Math.floor(Math.random() * names.length)];
      var s = el("span", null, Math.random() < 0.45 ? "te amo " + word : word);
      s.style.left = (4 + Math.random() * 88) + "%";
      s.style.fontSize = (0.75 + Math.random() * 1.15) + "rem";
      s.style.animationDuration = (32 + Math.random() * 34) + "s";
      layer.appendChild(s);
      window.setTimeout(function () { if (s.parentNode) s.remove(); }, 72000);
    }

    for (var i = 0; i < 3; i++) spawn();
    window.setInterval(spawn, 5600);
  }

  /* ─── 4. Palabra que rota (los apodos en el título) ────────────────── */
  function mountWordCycle(node, words, interval) {
    if (!node) return;
    var list = (words && words.length) ? words : ["vos"];
    if (list.length === 1) { node.textContent = list[0]; return; }

    node.classList.add("word-cycle");
    node.textContent = "";
    var inner = el("span", null, list[0]);
    node.appendChild(inner);
    var i = 0;

    window.setInterval(function () {
      if (document.hidden) return;
      i = (i + 1) % list.length;
      inner.classList.add("is-out");
      window.setTimeout(function () {
        inner.textContent = list[i];
        inner.classList.remove("is-out");
      }, reduceMotion ? 0 : 900);
    }, interval || 4200);
  }

  /* ─── 5. Frases que aparecen y se van ──────────────────────────────── */
  function mountPhrases(node, phrases, hold) {
    if (!node || !phrases || !phrases.length) return;
    var items = phrases.map(function (p) {
      var n = el("p", "phrase", p);
      node.appendChild(n);
      return n;
    });
    var i = -1;
    function step() {
      if (document.hidden && items.length > 1) return;
      if (i >= 0) items[i].classList.remove("is-in");
      i = (i + 1) % items.length;
      items[i].classList.add("is-in");
    }
    step();
    if (items.length > 1) window.setInterval(step, hold || 7000);
  }

  /* ─── 6. Toasts: el reemplazo de los 14 alert() ────────────────────── */
  var stack;
  function toast(msg, opts) {
    opts = opts || {};
    if (!stack) { stack = el("div", "toast-stack"); document.body.appendChild(stack); }
    var t = el("div", "toast" + (opts.soft ? " toast-soft" : ""));
    t.innerHTML = String(msg);
    t.setAttribute("role", opts.status === "assertive" ? "alert" : "status");
    stack.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("is-in"); });
    window.setTimeout(function () {
      t.classList.remove("is-in");
      window.setTimeout(function () { t.remove(); }, 700);
    }, opts.ms || 4200);
    return t;
  }

  /* ─── 7. Reveal al hacer scroll ────────────────────────────────────── */
  function initReveal() {
    var nodes = $all("[data-reveal]");
    if (!nodes.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (n) {
      var d = n.getAttribute("data-reveal-delay");
      if (d) n.style.setProperty("--reveal-delay", d + "ms");
      io.observe(n);
    });
  }

  /* ─── 8. Contenido desde config ────────────────────────────────────── */
  function bind() {
    var her = CFG.her || {};
    var site = CFG.site || {};
    var us = CFG.us || {};
    var home = CFG.home || {};
    var scope = { her: her, site: site, us: us, home: home, CFG: CFG };

    $all("[data-bind]").forEach(function (n) {
      var v = pick(scope, n.getAttribute("data-bind"));
      if (v != null && v !== "") n.textContent = String(v);
    });

    $all("[data-her-name]").forEach(function (n) {
      n.textContent = (her.showRealName && her.name) ? her.name
        : (her.petNames && her.petNames[0]) || her.name || "vos";
    });

    /* la fecha exacta sólo si él decidió mostrarla */
    if (us.hideExactDate) {
      $all("[data-since]").forEach(function (n) { n.remove(); });
    } else {
      $all("[data-since]").forEach(function (n) {
        n.textContent = sinceDate().toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
      });
    }

    /* enlaces "en construcción": no llevan a ningún lado, avisan */
    $all("[data-soon]").forEach(function (a) {
      a.classList.add("is-soon");
      a.title = "Todavía lo estoy armando";
      a.addEventListener("click", function (e) {
        e.preventDefault();
        toast("Eso todavía está en construcción. Te aviso cuando esté, <b>palabra</b>.");
      });
    });

    /* sólo la portada toma el título de config; las demás conservan el suyo */
    if (site.title && (document.body.getAttribute("data-page") || "") === "index") {
      document.title = site.title + " ♥";
    }
  }

  /* ─── 9. Tarjetas de la portada ────────────────────────────────────── */
  function renderModules() {
    var host = $("#modules");
    if (!host) return;
    host.innerHTML = "";
    (CFG.modules || []).forEach(function (m, i) {
      var card = m.ready ? el("a", "mod-card") : el("div", "mod-card is-soon");
      if (m.ready) card.href = m.href;
      else card.setAttribute("tabindex", "0");

      card.setAttribute("data-reveal", "");
      card.setAttribute("data-reveal-delay", String(i * 110));
      card.appendChild(el("div", "mod-icon", m.icon || "♡"));
      card.appendChild(el("h3", "mod-title", m.title));
      card.appendChild(el("p", "mod-sub", m.subtitle || ""));
      card.appendChild(el("p", "mod-desc", m.desc || ""));
      if (m.ready) card.appendChild(el("span", "mod-arrow", "entrar →"));
      else card.appendChild(el("span", "badge-soon", "en camino"));

      if (!m.ready) {
        var say = function () { toast("<b>" + m.title + "</b> todavía no está listo. Ando trabajando en eso ♡"); };
        card.addEventListener("click", say);
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); say(); }
        });
      }
      host.appendChild(card);
    });
  }

  /* ─── arranque ─────────────────────────────────────────────────────── */
  function boot() {
    document.documentElement.classList.add("js");
    document.body.setAttribute("data-accent", (CFG.site && CFG.site.accent) || "rose");
    buildLight();
    buildWhispers();
    bind();
    renderModules();
    renderCounter();
    initReveal();

    var heroWord = $("#heroWord");
    if (heroWord) mountWordCycle(heroWord, (CFG.her && CFG.her.petNames), 4200);

    var phraseHost = $("#phrases");
    if (phraseHost) mountPhrases(phraseHost, (CFG.home && CFG.home.phrases), 7000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.AMOR = {
    $: $, $all: $all, el: el, toast: toast, reduceMotion: reduceMotion,
    timeTogether: timeTogether, renderCounter: renderCounter,
    mountPhrases: mountPhrases, mountWordCycle: mountWordCycle,
    cfg: CFG, tracks: window.AMOR_TRACKS || []
  };
})();
