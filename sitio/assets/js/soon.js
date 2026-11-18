/* ============================================================================
   AMOR — soon.js
   Página provisional para los módulos que todavía no están hechos.
   Cuando termines una sección de verdad, borrá este <script> de esa página.
   ========================================================================== */
(function () {
  "use strict";
  var A = window.AMOR;
  if (!A) return;

  var page = document.body.getAttribute("data-page");
  var mods = A.cfg.modules || [];
  function findMod(titleWord) {
    for (var i = 0; i < mods.length; i++) {
      if (String(mods[i].href).indexOf(page + ".") === 0 ||
          String(mods[i].title).toLowerCase().indexOf(titleWord) === 0) return mods[i];
    }
    return {};
  }
  var mod = findMod(page) || {};

  var host = A.$("#soonBody");
  if (!host) return;

  var box = A.el("div", "soon");
  box.setAttribute("data-reveal", "");
  box.appendChild(A.el("div", "soon-mark", mod.icon || "♡"));
  var h = A.el("h2", "soon-title", "Todavía estoy armando ");
  h.appendChild(A.el("em", null, mod.title || "esto"));
  box.appendChild(h);
  box.appendChild(A.el("p", "soon-text", mod.desc || "Vuelve en unos días."));

  var p = A.el("p", "soon-hint");
  p.innerHTML = 'Mientras tanto, <a class="link-under" href="musica.html">las canciones ya están listas ♫</a>';
  box.appendChild(p);

  var counter = A.el("p", "soon-counter");
  counter.innerHTML = '<span data-counter="total"></span> días juntando material.';
  box.appendChild(counter);

  host.appendChild(box);
  A.renderCounter();
  A.$all("[data-reveal]").forEach(function (n) { n.classList.add("is-visible"); });
})();
