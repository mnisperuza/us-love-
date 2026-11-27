/* =============================================================
   CARTAS — Renderizado, filtros y mensaje al azar
   ============================================================= */

(function () {
  const list = Array.isArray(window.CARTAS) ? window.CARTAS : [];
  const grid = document.getElementById("cartasGrid");
  const filterWrap = document.getElementById("cartasFilters");
  const spotlightText = document.getElementById("spotlightText");
  const randomBtn = document.getElementById("randomCartaBtn");

  if (!grid || !list.length) return;

  const TAG_LABELS = {
    todas: "Todas",
    madrugada: "Madrugada",
    cotidiano: "Cotidiano",
    ternura: "Ternura",
    promesa: "Promesas",
    sonrisa: "Sonrisas"
  };

  let activeTag = "todas";
  let lastRandomIdx = -1;

  function pickRandom() {
    if (!spotlightText || !list.length) return;
    let idx = Math.floor(Math.random() * list.length);
    if (list.length > 1 && idx === lastRandomIdx) {
      idx = (idx + 1) % list.length;
    }
    lastRandomIdx = idx;
    const item = list[idx];
    spotlightText.textContent = `“${item.text}”`;
  }

  function renderFilters() {
    if (!filterWrap) return;
    const tags = ["todas", "madrugada", "cotidiano", "ternura", "promesa", "sonrisa"];
    filterWrap.innerHTML = "";
    tags.forEach((tag) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-pill" + (tag === activeTag ? " is-active" : "");
      btn.textContent = TAG_LABELS[tag] || tag;
      btn.addEventListener("click", () => {
        activeTag = tag;
        renderFilters();
        renderGrid();
      });
      filterWrap.appendChild(btn);
    });
  }

  function renderGrid() {
    grid.innerHTML = "";
    list.forEach((item, index) => {
      if (activeTag !== "todas" && item.tag !== activeTag) return;

      const card = document.createElement("article");
      card.className = "carta-card";

      const p = document.createElement("p");
      p.className = "carta-body";
      p.textContent = item.text;

      const meta = document.createElement("div");
      meta.className = "carta-meta";

      const num = document.createElement("span");
      num.textContent = `#${String(index + 1).padStart(2, "0")}`;

      const tag = document.createElement("span");
      tag.textContent = TAG_LABELS[item.tag] || item.tag;

      meta.appendChild(num);
      meta.appendChild(tag);
      card.appendChild(p);
      card.appendChild(meta);
      grid.appendChild(card);
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", pickRandom);
  }

  pickRandom();
  renderFilters();
  renderGrid();
})();
