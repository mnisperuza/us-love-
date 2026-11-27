/* =============================================================
   FOTOS — Animación ASCII de un ramo de flores que florece
   ============================================================= */

(function () {
  const canvas = document.getElementById("asciiBouquet");
  const replayBtn = document.getElementById("replayBloom");
  if (!canvas) return;

  const W = 54;
  const H = 25;

  // Definición de las flores del ramo (posición x, y de la cabeza, tipo y retraso)
  const flowers = [
    { x: 27, y: 5,  type: "rose",  delay: 14 }, // Centro arriba
    { x: 17, y: 7,  type: "blush", delay: 18 }, // Izquierda arriba
    { x: 37, y: 7,  type: "gold",  delay: 20 }, // Derecha arriba
    { x: 11, y: 11, type: "lav",   delay: 24 }, // Extremo izquierdo
    { x: 43, y: 11, type: "rose",  delay: 26 }, // Extremo derecho
    { x: 22, y: 10, type: "gold",  delay: 22 }, // Centro-izq
    { x: 32, y: 10, type: "blush", delay: 23 }, // Centro-der
  ];

  // Punto donde se atan los tallos (el moño)
  const knotX = 27;
  const knotY = 19;

  let tick = 0;
  let timer = null;

  function createGrid() {
    return Array.from({ length: H }, () =>
      Array.from({ length: W }, () => ({ ch: " ", cls: "" }))
    );
  }

  function setCell(grid, x, y, ch, cls) {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || xi >= W || yi < 0 || yi >= H) return;
    grid[yi][xi] = { ch, cls };
  }

  function drawText(grid, x, y, text, cls) {
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== " ") {
        setCell(grid, x + i, y, text[i], cls);
      }
    }
  }

  // Dibuja un tallo desde el nudo hacia la flor según el progreso (0..1)
  function drawStem(grid, fx, fy, progress, sway) {
    const steps = 16;
    const maxStep = Math.floor(steps * progress);
    for (let i = 0; i <= maxStep; i++) {
      const t = i / steps;
      const sx = knotX + (fx + sway - knotX) * t;
      const sy = knotY + (fy - knotY) * t;
      let ch = "|";
      if (fx < knotX - 3) ch = "/";
      else if (fx > knotX + 3) ch = "\\";
      setCell(grid, sx, sy, ch, "c-stem");

      // Hojitas a mitad del tallo
      if (i === 7 && progress > 0.55) {
        setCell(grid, sx - 1, sy, "~", "c-leaf");
        setCell(grid, sx + 1, sy, "~", "c-leaf");
      }
    }
  }

  // Dibuja un tulipán según su etapa de florecimiento (0..3)
  function drawFlower(grid, x, y, type, stage) {
    const cls =
      type === "rose"
        ? "c-rose"
        : type === "blush"
        ? "c-blush"
        : type === "gold"
        ? "c-gold"
        : "c-lav";

    if (stage === 0) {
      setCell(grid, x, y, ".", "c-bud");
    } else if (stage === 1) {
      drawText(grid, x, y - 1, "^", "c-leaf");
      drawText(grid, x, y, "()", cls);
    } else if (stage === 2) {
      drawText(grid, x - 1, y - 2, "^^^", cls);
      drawText(grid, x - 1, y - 1, "(|)", cls);
      drawText(grid, x - 1, y, "\\_/", "c-leaf");
    } else {
      drawText(grid, x - 2, y - 3, ".^.^.", cls);
      drawText(grid, x - 2, y - 2, "(|♥|)", cls);
      drawText(grid, x - 2, y - 1, " \\_/ ", cls);
      drawText(grid, x - 1, y, "\\|/", "c-leaf");
    }
  }

  // Dibuja el moño y la base del ramo
  function drawRibbon(grid, progress) {
    if (progress < 0.15) return;
    drawText(grid, knotX - 2, knotY, "\\___/", "c-paper");
    drawText(grid, knotX - 3, knotY + 1, "(>♥<)", "c-ribbon");
    drawText(grid, knotX - 2, knotY + 2, "/   \\", "c-ribbon");
    drawText(grid, knotX - 1, knotY + 3, "| |", "c-stem");
  }

  // Destellos suaves alrededor cuando ya floreció
  function drawSparkles(grid, t) {
    if (t < 36) return;
    const spots = [
      [6, 4], [47, 5], [9, 15], [44, 15], [27, 1], [15, 2], [39, 2]
    ];
    spots.forEach(([sx, sy], idx) => {
      const phase = (t + idx * 5) % 24;
      if (phase < 10) {
        setCell(grid, sx, sy, phase % 2 === 0 ? "*" : "·", "c-spark");
      }
    });
  }

  function escapeHtml(ch) {
    if (ch === "&") return "&amp;";
    if (ch === "<") return "&lt;";
    if (ch === ">") return "&gt;";
    return ch;
  }

  function render() {
    const grid = createGrid();

    // Brisa suave una vez que empieza a crecer
    const sway = tick > 25 ? Math.sin(tick * 0.08) * 0.8 : 0;

    // 1. Tallos
    flowers.forEach((f, idx) => {
      const stemProgress = Math.min(1, Math.max(0, (tick - idx * 1.2) / 14));
      if (stemProgress > 0) {
        drawStem(grid, f.x, f.y, stemProgress, sway * (f.y < 8 ? 1 : 0.5));
      }
    });

    // 2. Moño y papel
    drawRibbon(grid, tick / 15);

    // 3. Flores floreciendo
    flowers.forEach((f) => {
      if (tick >= f.delay) {
        const age = tick - f.delay;
        let stage = 0;
        if (age > 12) stage = 3;
        else if (age > 7) stage = 2;
        else if (age > 3) stage = 1;
        drawFlower(grid, f.x + sway * 0.7, f.y, f.type, stage);
      }
    });

    // 4. Destellos
    drawSparkles(grid, tick);

    // Convertir a HTML con spans por color
    let html = "";
    for (let y = 0; y < H; y++) {
      let row = "";
      let currentCls = "";
      for (let x = 0; x < W; x++) {
        const cell = grid[y][x];
        if (cell.cls !== currentCls) {
          if (currentCls) row += "</span>";
          if (cell.cls) row += `<span class="${cell.cls}">`;
          currentCls = cell.cls;
        }
        row += escapeHtml(cell.ch);
      }
      if (currentCls) row += "</span>";
      html += row + "\n";
    }

    canvas.innerHTML = html;
    tick++;
  }

  function start() {
    if (timer) clearInterval(timer);
    tick = 0;
    render();
    timer = setInterval(render, 110);
  }

  if (replayBtn) {
    replayBtn.addEventListener("click", start);
  }

  start();
})();
