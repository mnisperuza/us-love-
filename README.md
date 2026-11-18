# La casita de Amor — sitio

Un sitio de 4 páginas, estático, **sin frameworks, sin build, sin dependencias**.
Se edita tocando dos archivos de texto y se sube a GitHub Pages.

Estética: beige cinematográfico, luz suave que se mueve lento, grano de película,
acento rosa mate. Adentro: la música vive en su propio módulo (`musica.html`).

---

## 1. Qué hay acá

```
sitio/
├── index.html          ← portada: título con apodos que rotan, frases, cartas, tarjetas
├── musica.html         ← ★ el reproductor, ahora como módulo aparte
├── fotos.html          ← "en construcción" (acá va el álbum después)
├── cartas.html         ← "en construcción"
├── 404.html            ← página de error con estilo propio
├── config.js           ← ★★ TUS TEXTOS, APODOS, FECHA. Todo el día a día está acá
├── tracks.js           ← ★★ TU PLAYLIST
├── manifest.webmanifest    ← "agregar a pantalla de inicio"
├── robots.txt · .nojekyll
└── assets/
    ├── css/base.css        ← sistema de diseño (colores, luz, grano, tipografía)
    ├── css/index.css
    ├── css/musica.css
    ├── css/soon.css
    ├── js/app.js           ← luz, susurros, frases, contador, toasts
    ├── js/player.js        ← reproductor
    ├── js/soon.js
    ├── img/                ← favicon.svg, iconos PNG, og-cover.jpg
    └── audio/              ← solo cosas tuyas (notas de voz, covers)

.github/workflows/deploy.yml   ← publica solo, en cada push
```

---