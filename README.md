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

**Dos reglas para no romper nada:**
- No muevas archivos de lugar ni cambies sus nombres.
- Todo lo que quieras decirle está en `config.js`. Todo lo que quieras escuchar está en `tracks.js`.

---

## 2. Subirlo a GitHub (5 minutos)

1. Creá un repo nuevo (puede ser privado → Pages funciona igual en repos privados de cuenta gratuita, pero verifica en Settings).
2. Arrastrá **el contenido de `sitio/`** a la raíz del repo, más la carpeta `.github/`.
   (Si subís la carpeta `sitio` como tal, el sitio queda en `…/sitio/`. Funciona, pero es más lindo en la raíz.)
3. Settings → **Pages** → Source: **GitHub Actions**. Ya está: el workflow de `.github/workflows/deploy.yml` se encarga del resto en cada push.

> Si preferís el método viejo: Source = *Deploy from a branch* → rama `main` → carpeta `/ (root)`.
> Con `.nojekyll` incluido, no hay sorpresas con guiones bajos ni puntos.

Cuando termine el build vas a tener `https://TU-USUARIO.github.io/TU-REPO/`.

### Un paso importante después de publicar
En los 4 HTML (`index`, `musica`, `fotos`, `cartas`) buscá esta línea y reemplazala con tu URL real:

```html
<link rel="canonical" href="https://TU-USUARIO.github.io/TU-REPO/" />
<meta property="og:url" content="https://TU-USUARIO.github.io/TU-REPO/" />
```

Sin eso, **WhatsApp no muestra la imagen en el preview del enlace**. Es lo que hace que el link se vea como un regalo y no como una URL gris.

---

## 3. Tu día a día

### Cambiar textos, apodos o la fecha → `config.js`

```js
her: {
  petNames: ["Amor", "Bebe", "Osita", "Juli"],   // rotan en el título Y flotan en el fondo
  greeting: "Para mi",
  showRealName: false
},
us:   { since: "2025-04-10", monthDay: 10, hideExactDate: true },
home: { phrases: ["frase 1", "frase 2"], letter: "la carta grande" }
```

| Querés | Tocás |
|---|---|
| Cambiar el apodo del título | `her.petNames` |
| Cambiar las frases que rotan | `home.phrases` |
| Cambiar la carta | `home.letter` |
| Cambiar la fecha | `us.since` y `us.monthDay` |
| Ocultar/mostrar la fecha exacta | `us.hideExactDate` |
| Usar su nombre real | `her.showRealName: true` |
| Sacar el "en construcción" de Fotos | `modules[].ready: true` |
| Cambiar el color de acento | `site.accent`: `"rose"`, `"amber"` o `"plum"` |

Si algo se rompe, se rompe solo `config.js`: subí la versión anterior y listo.

### Agregar una canción → `tracks.js`

Copiá un bloque `{ … }` y pegalo al final (con una coma antes).
Para YouTube: abrí la canción, mirá la dirección `youtube.com/watch?v=D0HmxaBceQg`,
y lo que va después de `v=` son los 11 caracteres del `youtubeId`.

```js
{
  title: "Lovers Rock",
  artist: "TV Girl",
  type: "youtube",
  youtubeId: "D0HmxaBceQg",       // ← lo ideal
  youtubeUrl: "https://www.youtube.com/watch?v=…",  // alcanza con esto también
  note: "Esta es la de la cocina, a oscuras, bailando mal.",   // se ve en la lista
  duration: "3:20"
}
```

`note` es la mejor parte: es una línea tuya sobre esa canción. Vale más que la canción.

### Fotos y cartas (cuando quieras)

Hoy son páginas "en construcción". Para hacerlas reales:
1. Creá `fotos.html` / `cartas.html` de verdad (sacá el `soon.js` de esa página).
2. Poné `ready: true` en `config.js` → `modules`.
3. Las imágenes van en `assets/img/`.

Dale aviso cuando quieras que te arme alguna de las dos.

---

## 4. Música: por qué NO hay MP3 en el repo

Es la decisión más importante del proyecto, así que va explícito:

- **Subir canciones con copyright a GitHub es material para un DMCA. Y una takedown no tumba el archivo: puede tumbar el repo entero**, y con él todo el sitio. El descargo de autoría del README viejo no te protege ante GitHub.
- **Pages tiene techo**: ~1 GB de sitio y **100 GB de tráfico/mes** ([docs oficiales](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)). Cuatro MP3 son ~40 MB; un álbum de 30, un problema.
- El embed de YouTube **no descarga nada, no ocupa nada, y es legal**: sonás el player oficial, con la calidad de YouTube.

Lo que sí podés guardar en `assets/audio/`: **cosas tuyas**. Notas de voz, un cover mal cantado, el audio de un video. Para esas:

```js
{ title: "Nota de voz", artist: "para vos", type: "local",
  src: "assets/audio/nota-voz.m4a", note: "Grabada a las 3am, por eso se escucha el ventilador." }
```

Formato recomendado: `.m4a` (AAC) a 96–128 kbps ≈ 1 MB por minuto.
Los `type: "local"` y `"stream"` son los que muestran barra de progreso real, tiempo y volumen.

---

## 5. Privacidad: lo que me pediste ("solo nosotros dos")

**GitHub Pages no puede tener contraseña.** Punto. Todo lo que subís es público para quien tenga la URL, y el repo, si es público, está indexado.

Lo que hiciste ya está cubierto: `hideExactDate: true`, `showRealName: false`, `robots.txt` con `Disallow: /`, y `<meta name="robots" content="noindex">` en cada página. **Eso es oficioso, no una garantía**: le pide a Google que no lo indexe, no lo impide.

Tres caminos reales, de menos a más:

**A) Quedarse así (Pages puro) — la que recomendé primero.**
El nombre real y la fecha no aparecen, la URL no la adivina nadie, y no está en Google.
Para un regalo entre dos personas, en la práctica alcanza. Riesgo residual: si alguien comparte el link, entra.

**B) Cloudflare Pages + Access con PIN por email — la respuesta a "solo 2 personas", gratis.**
No es Pages, es Cloudflare Pages, pero **sigue leyendo el mismo repo de GitHub** y se despliega solo igual.
- Zero Trust plan Free: hasta 50 usuarios, $0. ([precios](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/))
- Configurás una Access policy con login **One-time PIN** ([docs](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)): el visitante escribe su email, Cloudflare le manda un código, y **solo pasan las 2 direcciones que vos autorices** (la tuya y la de ella).
- No necesita que ella cree ninguna cuenta, ni app, ni contraseña. Le llega un mail con un código. Es lo más cercano a "solo nosotros dos" sin pagar ni montar un backend.
- El sitio deja de ser indexable por definición, y la imagen de preview de WhatsApp se ve afectada (el bot no pasa el login), así que el link se ve simple. Ese es el precio honesto.

**C) Cifrar el contenido en el navegador (AES-GCM con WebCrypto).**
Publicás ciphertext y la clave es una frase que solo ustedes dos saben. Suena elegante y funciona — `crypto.subtle` anda en Pages porque es HTTPS — pero la clave va a estar en un repo o en un archivo que se comparte, y una frase de humano se rompe offline. Solo vale si la clave es aleatoria y la pasan por un canal seguro. No te lo recomiendo como primera opción.

**D) Lo que NO funciona gratis:**
- Netlify: protección por contraseña es solo en plan Pro ($20/mes). [referencia](https://www.localcan.com/blog/password-protect-prototype-link)
- Vercel: Password Protection no está en el plan Hobby. [referencia](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/password-protection)
- Un "código secreto" escrito en JavaScript: se lee en DevTools en 3 segundos. Falsa seguridad, no lo hagas.

**E) Lo que no se puede hacer en estático: que ella te escriba.**
Los mensajitos del sitio viejo vivían en `localStorage`: lo que ella escribía se quedaba en su teléfono y nunca te llegaba. Por eso **esa función no fue migrada**. Para mensajes de dos direcciones hace falta un backend (Supabase free, un Google Form, o un gist que vos editás). Si la querés de verdad, te la armo con Supabase, pero es un paso aparte.

---

## 6. Qué se corrigió respecto del archivo original

Del diagnóstico completo (`analysis/INSPECCION.md`), lo bloqueante:

| Problema viejo | Ahora |
|---|---|
| 4 MP3 inexistentes → **popup de error en cada carga** | Nada pasa hasta que ella toca play. Cero alert. |
| La playlist rota se **autoperpetuaba** en localStorage | La lista viene de `tracks.js`, siempre la correcta |
| 14 `alert()` que en WhatsApp/iOS **no abren** | 100% toasts suaves, con `role="alert"` |
| Nombres de archivo exactos (mayúsculas, espacios) | Desapareció la clase de problema: no hay archivos que coincidir |
| El contador **nunca decía "hoy celebramos"** el día 10 | Compara fechas sin hora; verificado |
| **No había forma de borrar una canción** | La lista la definís vos; borrar un bloque = borrar la canción |
| `crossorigin` + Web Audio → **audio silencioso** con enlaces externos | Sin `createMediaElementSource`: el riesgo no existe |
| **Dos reproductores sonando a la vez** | Uno solo activo; al cambiar, el anterior se destruye |
| Fugas: `Uint8Array`/frame, lluvia infinita en background, `createObjectURL` sin revoke | Capa de luz en CSS (GPU), sin intervalos infinitos |
| `prefers-reduced-motion` no apagaba la animación | Apaga luz, susurros y toda animación |
| Playlist con `div onclick`, inaccesible | `<button>` reales, foco, `aria-current` |
| Todo el texto soldado al HTML | `config.js` |
| Sin preview en WhatsApp | Open Graph + `og:image` + canonical |
| Sin `.nojekyll`, 404 ni manifest | Los tres |

---

## 7. Lo que todavía falta (honesto)

- **`assets/img/og-cover.jpg` es una imagen provisoria de 1 MB.** Reemplazala por una foto tuya (no hace falta que salgan ustedes dos: sirve una textura, un atardecer, una mesa). Objetivo: 1200×630, menos de 300 KB. Si preferís, te la diseño en SVG y pesa 4 KB.
- **No hay service worker**, así que no funciona offline de verdad (en avión no carga). Es el siguiente paso si querés que ande sin señal.
- **Los iconos PNG son geométricos**, hechos con un script (`make-icons.py`). Si querés algo con tipografía o una foto, se cambian en un minuto.
- `fotos.html` y `cartas.html` son placeholders con gracia, no secciones reales.
- Falta el toque final de los videos: algunos de YouTube no permiten embebido. Si uno no abre, el enlace de "abrir en YouTube" está al lado.

---

## 8. Verificación

El sitio está testeado en Node con jsdom (los scripts quedan afuera del repo, están en `.gitignore`):
- `smoke-test.js`: levanta las 5 páginas, ejecuta el JS, exige **cero errores**. → ✓
- `interaction-test.js`: clicks, teclado, pausas, saltos, canción rota, audio local, XSS en títulos. → **68/68 ✓**

Para probarlo en tu PC: abrí `sitio/index.html` doble click. Funciona directo, sin server,
porque los datos son `.js` y no `fetch()`.
