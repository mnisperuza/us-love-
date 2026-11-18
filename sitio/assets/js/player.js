/* ============================================================================
   AMOR — player.js
   Reproductor de "La música". 3 tipos de fuente: youtube | local | stream.
   Un solo reproductor activo a la vez (se apaga el anterior antes de encender
   el nuevo) y ningún alert(): todo avisa con toasts suaves.
   ========================================================================== */
(function () {
  "use strict";

  var A = window.AMOR;
  if (!A) return;

  var CFG = A.cfg || {};
  var PCFG = CFG.player || {};
  var TRACKS = (window.AMOR_TRACKS || []).filter(function (t) { return t && t.title; });
  var LS_KEY = "amor_last_track_v1";
  var YT_ID = /^[A-Za-z0-9_-]{11}$/;

  /* ─── nodos ─────────────────────────────────────────────────────────── */
  var listEl   = A.$("#trackList");
  var nowTitle = A.$("#nowTitle");
  var nowArtist= A.$("#nowArtist");
  var nowNote  = A.$("#nowNote");
  var emptyHint= A.$("#emptyHint");
  var ytSearch = A.$("#ytSearch");
  var cover    = A.$("#cover");
  var coverNum = A.$("#coverNumber");
  var ytHost   = A.$("#ytHost");
  var playBtn  = A.$("#playBtn");
  var prevBtn  = A.$("#prevBtn");
  var nextBtn  = A.$("#nextBtn");
  var seekRow  = A.$("#seekRow");
  var utilRow  = A.$("#utilRow");
  var seek     = A.$("#seek");
  var seekFill = A.$("#seekFill");
  var seekDot  = A.$("#seekDot");
  var curTime  = A.$("#curTime");
  var durTime  = A.$("#durTime");
  var vol      = A.$("#volume");
  var shuffleBtn = A.$("#shuffleBtn");
  var repeatBtn  = A.$("#repeatBtn");
  var shuffleAll = A.$("#shuffleAllBtn");
  var openSource = A.$("#openSource");
  var audio      = A.$("#audio");
  var body       = document.body;

  var current = -1;
  var playing = false;
  var shuffle = false;
  var repeat  = false;

  /* ─── helpers ───────────────────────────────────────────────────────── */
  function pad(n) { return String(n).padStart(2, "0"); }

  function fmt(s) {
    if (!s || isNaN(s) || !isFinite(s)) return "0:00";
    var m = Math.floor(s / 60);
    return m + ":" + pad(Math.floor(s % 60));
  }

  function videoId(t) {
    if (t.youtubeId && YT_ID.test(t.youtubeId)) return t.youtubeId;
    if (t.youtubeUrl) {
      var m = String(t.youtubeUrl).match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
              String(t.youtubeUrl).match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
              String(t.youtubeUrl).match(/\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
    return null;
  }

  function playlistId(t) {
    if (t.youtubeList) return String(t.youtubeList).replace(/[^A-Za-z0-9_-]/g, "");
    if (t.youtubeUrl) {
      var m = String(t.youtubeUrl).match(/[?&]list=([A-Za-z0-9_-]+)/);
      if (m) return m[1];
    }
    return null;
  }

  function sourceOf(t) { return t.type || (t.src ? "local" : "youtube"); }

  function ytWatchUrl(t) {
    var id = videoId(t);
    if (id) return "https://www.youtube.com/watch?v=" + id;
    if (t.youtubeUrl && /^https?:\/\//.test(t.youtubeUrl)) return t.youtubeUrl;
    return null;
  }

  function searchUrl(t) {
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent((t.title || "") + " " + (t.artist || ""));
  }

  /* Monta la URL de embebido. Sin clave de API, sin descargas. */
  function embedUrl(t, autoplay) {
    var id = videoId(t);
    var list = playlistId(t);
    var q = ["rel=0", "modestbranding=1", "color=white", "playsinline=1",
             "autoplay=" + (autoplay ? 1 : 0), "hl=es"];
    if (location.protocol === "http:" || location.protocol === "https:") {
      q.push("origin=" + encodeURIComponent(location.origin));
    }
    if (id && list) { q.push("list=" + list); return "https://www.youtube.com/embed/" + id + "?" + q.join("&"); }
    if (id)         { return "https://www.youtube.com/embed/" + id + "?" + q.join("&"); }
    if (list)       { return "https://www.youtube.com/embed/videoseries?list=" + list + "&" + q.join("&"); }
    return null;
  }

  /* ─── fuente de YouTube ─────────────────────────────────────────────── */
  function mountYoutube(t, autoplay) {
    var url = embedUrl(t, autoplay);
    if (!url) return false;
    ytHost.innerHTML =
      '<iframe class="embed" src="' + url + '" title="' + esc(t.title) + ' en YouTube" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'allowfullscreen loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    return true;
  }

  function killYoutube() { ytHost.innerHTML = ""; }
  function killAudio() { audio.pause(); audio.removeAttribute("src"); audio.load(); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ─── apagar todo (un solo reproductor activo, siempre) ─────────────── */
  function stopAll() {
    killYoutube();
    killAudio();
    setPlaying(false);
  }

  function setPlaying(on) {
    playing = !!on;
    body.setAttribute("data-playing", on ? "yes" : "no");
    playBtn.setAttribute("aria-label", on ? "Pausar" : "Reproducir");
    playBtn.title = on ? "Pausar" : "Reproducir";
    markActive();
  }

  /* ─── UI de "suena ahora" ───────────────────────────────────────────── */
  function paint() {
    var t = TRACKS[current];
    if (!t) {
      nowTitle.textContent = "Elegí una canción";
      nowArtist.textContent = "—";
      nowNote.hidden = true;
      emptyHint.hidden = true;
      coverNum.textContent = "00";
      body.setAttribute("data-source", "none");
      seekRow.hidden = true;
      utilRow.hidden = true;
      return;
    }

    var kind = sourceOf(t);
    nowTitle.textContent = t.title;
    nowArtist.textContent = t.artist || "";
    nowNote.textContent = t.note || "";
    nowNote.hidden = !t.note;
    coverNum.textContent = pad(current + 1);

    /* sin enlace usable → le ofrecemos búsqueda en vez de nada */
    var unresolvable = !videoId(t) && !playlistId(t) && !(t.src && (kind === "local" || kind === "stream"));
    if (ytSearch) ytSearch.setAttribute("href", searchUrl(t));
    emptyHint.hidden = !unresolvable;
    if (!unresolvable && emptyHint.parentNode) emptyHint.hidden = true;

    /* controles que sólo aplican a audio propio */
    var native = kind === "local" || kind === "stream";
    seekRow.hidden = !native;
    utilRow.hidden = !native;
    body.setAttribute("data-source", kind);

    var watch = ytWatchUrl(t);
    if (watch) { openSource.href = watch; openSource.hidden = false; }
    else { openSource.hidden = true; }

    markActive();
  }

  function markActive() {
    A.$all(".track", listEl).forEach(function (li, i) {
      var isNow = i === current;
      li.classList.toggle("is-current", isNow);
      li.classList.toggle("is-playing", isNow && playing);
      var btn = li.querySelector("button");
      if (btn) {
        if (isNow) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
      }
    });
  }

  /* ─── reproducir ────────────────────────────────────────────────────── */
  function select(i, autoplay) {
    if (i < 0 || i >= TRACKS.length) return;
    current = i;
    stopAll();
    paint();
    remember();
    if (autoplay) resume(autoplay);
  }

  function resume(autoplay) {
    var t = TRACKS[current];
    if (!t) return;
    var kind = sourceOf(t);

    if (kind === "youtube") {
      if (!mountYoutube(t, autoplay !== false)) {
        /* sin fuente no hay reproductor: salimos ANTES de decir que suena */
        body.setAttribute("data-source", "unavailable");
        setPlaying(false);
        A.toast("Esta canción todavía no tiene enlace. <b>Avisame</b> y la agrego.", { status: "assertive", ms: 5200 });
        return;
      }
      setPlaying(true);
      return;
    }

    audio.src = t.src;
    audio.volume = Number(vol.value || 0.85);
    var p = audio.play();
    if (p && p.then) {
      p.then(function () { setPlaying(true); })
       .catch(function () {
         /* autoplay bloqueado: la dejamos cargada y que ella toque play */
         setPlaying(false);
         if (autoplay) A.toast("Tocá <b>play</b> para que arranque ♡", { soft: true });
       });
    }
  }

  function toggle() {
    if (current < 0) { select(TRACKS.length ? firstPlayable() : -1, true); return; }
    var kind = sourceOf(TRACKS[current]);

    if (kind === "youtube") {
      if (playing) { stopAll(); }              /* pausa = sacamos el reproductor */
      else { resume(true); }
      return;
    }
    if (audio.paused) { audio.play().then(function(){ setPlaying(true); }).catch(function(){}); }
    else { audio.pause(); setPlaying(false); }
  }

  function firstPlayable() {
    var start = 0;
    try {
      var saved = parseInt(localStorage.getItem(LS_KEY), 10);
      if (!isNaN(saved) && saved >= 0 && saved < TRACKS.length) start = saved;
    } catch (e) {}
    return start;
  }

  function remember() {
    if (!PCFG.rememberLastSong) return;
    try { localStorage.setItem(LS_KEY, String(current)); } catch (e) {}
  }

  function step(dir) {
    if (!TRACKS.length) return;
    if (shuffle && dir > 0) {
      var n = current;
      if (TRACKS.length > 1) while (n === current) n = Math.floor(Math.random() * TRACKS.length);
      select(n, true);
      return;
    }
    select((current + dir + TRACKS.length) % TRACKS.length, true);
  }

  /* ─── lista ─────────────────────────────────────────────────────────── */
  function renderList() {
    listEl.innerHTML = "";
    TRACKS.forEach(function (t, i) {
      var li = A.el("li", "track");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "track-btn";

      var num = A.el("span", "track-num");
      num.innerHTML = '<i class="n">' + pad(i + 1) + '</i>' +
                      '<i class="eq eq-mini"><b></b><b></b><b></b></i>';

      var meta = A.el("div", "track-meta");
      meta.appendChild(A.el("span", "track-name", t.title));
      meta.appendChild(A.el("span", "track-by", t.artist || ""));

      var right = A.el("div", "track-right");
      if (t.note) right.appendChild(A.el("span", "track-note-dot", "♡"));
      right.appendChild(A.el("span", "track-dur", t.duration || (sourceOf(t) === "youtube" ? "yt" : "·")));

      b.append(num, meta, right);
      b.addEventListener("click", function () {
        if (i === current && playing) { toggle(); return; }
        select(i, true);
      });
      li.appendChild(b);

      if (t.note) {
        var note = A.el("p", "track-note", t.note);
        li.appendChild(note);
      }
      listEl.appendChild(li);
    });

    var countEl = A.$("#trackCount");
    if (countEl) {
      countEl.textContent = TRACKS.length + (TRACKS.length === 1 ? " canción" : " canciones") +
        " — una por cada cosa que no sé decirte en persona.";
    }
  }

  /* ─── progreso / eventos de audio nativo ────────────────────────────── */
  audio.addEventListener("timeupdate", function () {
    if (!audio.duration || !isFinite(audio.duration)) return;
    var pct = audio.currentTime / audio.duration;
    seekFill.style.width = (pct * 100) + "%";
    seekDot.style.left = (pct * 100) + "%";
    curTime.textContent = fmt(audio.currentTime);
    durTime.textContent = fmt(audio.duration);
    seek.setAttribute("aria-valuenow", Math.round(pct * 100));
    seek.setAttribute("aria-valuetext", fmt(audio.currentTime) + " de " + fmt(audio.duration));
  });

  audio.addEventListener("ended", function () {
    if (repeat) { audio.currentTime = 0; audio.play().catch(function(){}); return; }
    step(1);
  });

  audio.addEventListener("play", function () { setPlaying(true); });
  audio.addEventListener("pause", function () { setPlaying(false); });

  audio.addEventListener("error", function () {
    if (!audio.getAttribute("src")) return;
    var t = TRACKS[current];
    setPlaying(false);
    A.toast("No pude cargar <b>" + esc(t && t.title) + "</b>. Puede que falte el archivo en la carpeta.", { status: "assertive", ms: 6000 });
  });

  /* buscar arrastrando o tocando */
  function seekFrom(e) {
    if (!audio.duration) return;
    var r = seek.getBoundingClientRect();
    var x = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX);
    var pct = Math.max(0, Math.min(1, (x - r.left) / r.width));
    audio.currentTime = pct * audio.duration;
    seekFill.style.width = (pct * 100) + "%";
    seekDot.style.left = (pct * 100) + "%";
  }
  var dragging = false;
  seek.addEventListener("pointerdown", function (e) { dragging = true; seek.setPointerCapture(e.pointerId); seekFrom(e); });
  seek.addEventListener("pointermove", function (e) { if (dragging) seekFrom(e); });
  seek.addEventListener("pointerup", function () { dragging = false; });
  seek.addEventListener("keydown", function (e) {
    if (!audio.duration) return;
    if (e.key === "ArrowRight") { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); e.preventDefault(); }
    if (e.key === "ArrowLeft")  { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
  });

  vol.addEventListener("input", function () { audio.volume = Number(vol.value); });

  /* ─── botones ───────────────────────────────────────────────────────── */
  playBtn.addEventListener("click", toggle);
  prevBtn.addEventListener("click", function () { step(-1); });
  nextBtn.addEventListener("click", function () { step(1); });

  shuffleBtn.addEventListener("click", function () {
    shuffle = !shuffle;
    shuffleBtn.setAttribute("aria-pressed", String(shuffle));
    shuffleBtn.classList.toggle("is-on", shuffle);
  });
  repeatBtn.addEventListener("click", function () {
    repeat = !repeat;
    repeatBtn.setAttribute("aria-pressed", String(repeat));
    repeatBtn.classList.toggle("is-on", repeat);
  });
  if (shuffleAll) shuffleAll.addEventListener("click", function () {
    if (!TRACKS.length) return;
    var n = current;
    if (TRACKS.length > 1) while (n === current) n = Math.floor(Math.random() * TRACKS.length);
    select(n, true);
  });

  /* teclado global */
  window.addEventListener("keydown", function (e) {
    var tag = document.activeElement && document.activeElement.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (e.code === "Space") { e.preventDefault(); toggle(); return; }
    /* con audio propio, las flechas corren el tiempo; con YouTube cambian de tema */
    var native = seekRow && !seekRow.hidden;
    if (native && tag !== "input") return;              /* el foco se encarga */
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  });

  /* ─── arranque: cargar sin reproducir (cero popups, cero autoplay) ─── */
  renderList();
  vol.value = PCFG.volumeDefault != null ? PCFG.volumeDefault : 0.85;
  audio.volume = Number(vol.value);
  if (TRACKS.length) select(firstPlayable(), false);
  else {
    paint();
    listEl.innerHTML = "";
    var li = A.el("li", "track");
    li.appendChild(A.el("p", "muted small", "Todavía no agregué canciones a tracks.js"));
    listEl.appendChild(li);
  }
})();
