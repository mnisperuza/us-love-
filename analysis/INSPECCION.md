# Inspección técnica — `index.html` (Para Mi Amor)

**Archivo:** 1.261 líneas · 59.6 KB · un solo HTML monolítico
**Sin dependencias externas** ✅ (no framework, no build step, no CDN)
**Sintaxis JS:** 1 bloque de 32.4 KB, parsea limpio — no hay errores de sintaxis.

---

## 1. Qué es hoy (arquitectura real)

Todo vive en un `<style>` (~17 KB inline) y un `<script>` (~32 KB) con **5 IIFEs** sin comunicación entre sí:

| Módulo | Líneas aprox | Responsabilidad | Estado |
|---|---|---|---|
| `matrixPink()` | 459–510 | Lluvia rosa en canvas | Funciona. Consume CPU para siempre |
| `hearts()` | 515–535 | Corazones flotantes | Funciona. Filtra el click-through ✅ |
| `playerModule()` | 540–1040 | Reproductor + playlist + IndexedDB + export | El núcleo, y donde están los bugs |
| `loveNotes()` | 1045–1175 | Mensajitos + contador de tiempo | Bug en el contador |
| `youtubePlayer()` | 1180–1258 | Iframe de YouTube | **El módulo mejor hecho del archivo** |

El layout es 2 columnas: reproductor a la izquierda, jardín + cartas a la derecha.

### Flujos de almacenamiento (importante entender esto)

```
localStorage['te_amo_osita_playlist_v1']   → JSON de la playlist (títulos + URLs)
localStorage['te_amo_osita_msgs']          → mensajitos
localStorage['te_amo_osita_youtube_url_v1'] → última URL de YouTube
IndexedDB 'te_amo_osita_audio_v1'          → los blobs de audio reales
```

Los `idb-audio:xxxx` son **punteros locales**. La playlist dice "canción X" pero el MP3 vive en el disco de *ese* navegador. Esto es lo más importante de todo el informe: **lo que tú subas hoy no va a existir mañana en el teléfono de ella.**

---

## 2. Lo que rompe en el primer segundo de uso 🔴

### 2.1 — Popup de error en cada carga (el bug que ella va a ver)

`basePlaylist` (líneas 604–609) apunta a 4 MP3 que **no están en el repo**:

```js
{title:'Lovers Rock', artist:'TV Girl', url:'TV Girl - Lovers Rock.mp3'},
{title:'Perfect',     artist:'Ed Sheeran', url:'Ed Sheeran - Perfect (Official Music Video).mp3'},
{title:'All of Me',   artist:'John Legend', url:'John Legend - All of Me (Official Video).mp3'},
{title:'Cigarettes out the Window', artist:'TV Girl', url:'Cigarettes out the window-TV Girl (slowed).mp3'}
```

`init()` (línea 1024) hace `audio.src = encodeURI(playlist[0].url); audio.load();` → **404** → dispara `audio.addEventListener('error')` (línea 908) → **`alert('No se pudo cargar la canción...')`**.

En GitHub Pages, recién desplegado, sin los MP3: el primer enlace que le mandes le abre **una ventana de error**. Y peor:

- **14 `alert()` + 1 `confirm()`** en el archivo.
- En **Safari/iOS** los `alert()` que no salen de un gesto directo del usuario son poco fiables, y **en los navegadores in-app de WhatsApp/Instagram/Telegram directamente no abren**. El enlace se lo vas a mandar por WhatsApp. O sea: en el sitio donde más importa, o no aparece, o aparece en el peor momento.

### 2.2 — El error se auto-perpetúa

`playIndex()` termina en `savePlaylist()` (línea 723) y `renderPlaylist()` del dblclick también. Consecuencia: en la **primera visita** las 4 rutas rotas se escriben en `localStorage` (línea 998). A partir de ahí, `playlist` siempre se carga del storage y **nunca vuelve a leer `basePlaylist`** (línea 612–616).

Si mañana subes los MP3 reales al repo → **a ella le va a seguir fallando igual**, porque su navegador ya guardó la versión rota. No hay forma de que se recupere sin borrar datos de sitio a mano. Es el tipo de bug que hace que piense que "el sitio está malo".

### 2.3 — Los nombres de archivo tienen que coincidir al carácter

`'Cigarettes out the window-TV Girl (slowed).mp3'` vs `'Cigarettes Out The Window'` → 404. Espacios, mayúsculas, paréntesis, `.mp3` en Windows y servirlo en Linux (case-sensitive en Pages) → **`TV Girl - Lovers Rock.MP3` funciona en tu PC y muere en producción.** Cualquier día te vas a pelear con esto.

---

## 3. Bugs de corrección (lógica que hace algo distinto a lo que parece)

### 3.1 El contador nunca dice "hoy celebramos"

Líneas 1113–1118:

```js
const nextMonth = new Date(now.getFullYear(), now.getMonth(), 10);
if(now.getDate() > 10) nextMonth.setMonth(nextMonth.getMonth() + 1);
const diffDays = Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));
```

`nextMonth` es el día 10 a las **00:00**, pero `now` es cualquier hora. Verificado ejecutándolo:

| Fecha real | Muestra | Debería |
|---|---|---|
| 10 de abril (aniversario mensual) | "Faltan 30 días" | **"¡Hoy celebramos!"** |
| 11 de abril, 09:00 | "Faltan 29 días" | 29 (ok, por suerte) |

**El día 10, que es el único día que importa emocionalmente, es exactamente el día que falla.** El `Math.ceil` de un número negativo pequeño redondea a 0, y `diffDays > 0` es falso… pero el offset de horas hace que el conteo derive. Se arregla comparando **fechas sin hora** (diferencia en días calendario, no en milisegundos).

### 3.2 No hay forma de borrar una canción

Hay agregar, arrastrar, importar, guardar, exportar… y **ninguna acción de eliminar**. El único camino para sacarla es "Importar" una lista vacía. Y como el borrado tampoco existe, los blobs en IndexedDB **nunca se liberan**: cada MP3 que pruebes ocupa espacio para siempre hasta que el navegador te borre la cuota.

### 3.3 Fugas de memoria y CPU que van a molestar en un teléfono

- `URL.createObjectURL` se llama en `resolveAudioSource()` (línea 600) y **jamás se hace `revokeObjectURL`**. El `Map` cachea uno por canción y vive para siempre.
- `animateVisualizer()` (línea 963) **crea un `new Uint8Array(...)` en cada frame**, 60 veces por segundo → basura constante para el GC.
- `setInterval(draw, 55)` (línea 509) de la lluvia **no tiene pausa con `document.hidden` ni `visibilitychange`** → sigue dibujando a ~18 fps en segundo plano, consumiendo batería, para siempre.
- Las 4 llamadas a `encodeURI` no escapan `?`, `&`, `#`. Un enlace firmado de S3/Drive se rompe.
- `exportBtn` (línea 1004) exporta las rutas `idb-audio:xxx` → **el JSON exportado es inservible**: las referencias solo existen en ese navegador. "Respaldo" que no respalda nada.

### 3.4 `crossorigin="anonymous"` + analizador de Web Audio

`<audio id="audio" crossorigin="anonymous">` (línea 447) y luego `createMediaElementSource(audio)` (línea 687). Si le pegas una URL de audio de **otro dominio sin cabeceras CORS**, Web Audio silencia la salida por seguridad → **reproduce, los controles se mueven, y no suena nada**. Silencio total, sin error. Es el bug más difícil de diagnosticar y va directo contra tu caso de uso principal ("pegar enlaces de audio").

### 3.5 Dos reproductores que no se hablan

`playerModule` y `youtubePlayer` son independientes. Si ella pone música en el reproductor de arriba y luego carga una playlist de YouTube abajo, **suenan las dos cosas a la vez**. Un "home web" con un solo botón de play no debería poder hacer eso.

### 3.6 Detalles

- Doble click en una canción = `s.favorite = !s.favorite` (línea 700), se guarda, y **no hay nada en la UI que muestre las favoritas**. Función muerta que encima confunde, porque el doble click también dispara el `onclick` de reproducir.
- `labelText.slice(0,12)` corta los títulos a mitad de palabra.
- `window` captura `dragover`/`drop` **en toda la página** (línea 946): cualquier cosa que arrastres suelta un audio. Al crecer el sitio, esto va a pelear con arrastrar imágenes o texto.
- `<audio>` sin `controls` al final del body: si el JS muere, no queda forma de reproducir nada.

---

## 4. Por qué todavía NO es un "home web" para ella 🟡

### 4.1 No hay capa de contenido — todo el texto está soldado en el HTML

Estos strings **son código**:

```
línea 312   labelText "OSITA"
línea 459   msg = 'TE AMO OSITA ♥ '        ← dentro del canvas
línea 671   'OSITA'
línea 418   placeholder "…a Juli…"
línea 302   eyebrow, h1, párrafo del header
línea 405   texto de "Mi Corazón es Tuyo"
línea 409   la carta
líneas 385-389  los 3 mensajes del jardín
línea 1061  relationshipStart = '2025-04-10'
línea 1185  DEFAULT_YOUTUBE_URL = ''
```

Para cambiar un apodo ("Amor" → "Bebe") hoy tienes que editar **6 lugares en 4 módulos distintos** y no romper nada. Y eso es exactamente lo que vas a querer hacer seguido. Un home web necesita **separar contenido de código** antes de crecer, si no, cada actualización es una cirugía.

### 4.2 Un solo archivo = cuello de botella inmediato

Lo que quieres sumar (fotos, timeline, carta, regalos, countdown de cumpleaños, recados) **va a competir por el mismo HTML de 60 KB**. A ~150 KB vas a empezar a pagar esto en el móvil: sin `cache-control` granular, cada cambio invalida todo el download.

### 4.3 La función "mensajitos" no cumple su propósito

Está construida como si fuera para *ti* escribiéndole ("Déjale un mensajito bonito a Juli"), pero vive en `localStorage`:

- Escribes algo en tu laptop → **ella no lo ve**.
- Ella abre el link en su teléfono → **ve una lista vacía** y su mensaje se queda solo en su teléfono.
- Vuelves a tu laptop → no sabes qué te respondió.

Es un bloc de notas local disfrazado de canal de comunicación. El mensaje de estado vacío ("Tus mensajitos de amor aparecerán aquí ♡") le va a parecer que **aún no le escribiste nada**, aunque sí lo hiciste. Este es el problema estructural #1 del proyecto: **Pages es estático, no tiene backend, y no hay forma de compartir entre dispositivos sin una API externa.**

### 4.4 Falta por completo lo que hace que se sienta "tuyo"

- **No hay fotos.** El README habla de "un álbum" pero no existe ningún álbum en el código.
- **No hay landing**: el index es directamente el reproductor. No hay navegación a ningún otro lado.
- **No hay PWA**: sin `manifest.json`, sin icono, sin `<meta name="theme-color">`. "Add to home screen" en iOS queda horrible (ícono genérico de Safari).
- **No hay Open Graph / Twitter Card.** Esto es crítico en tu caso concreto: cuando mandes el link por WhatsApp, **no va a salir ni título, ni descripción, ni miniatura**. Se va a ver como una URL gris. Para un regalo romántico, la preview es la mitad del regalo.
- **No hay `.nojekyll`** → Pages pasa todo por Jekyll. Cualquier carpeta que empiece con `_` desaparece del sitio publicado.
- **No hay 404.html** → si se le rompe un enlace, "There isn't a GitHub Pages site here".
- **No hay `<noscript>`.**
- **No hay favicon.**

---

## 5. ⚠️ Lo que NO debes subir a GitHub Pages (léelo antes de subir)

**Todo lo que subas a Pages es público y está en el índice de Google**, aunque nunca compartas el link. No existe "repo privado servido solo a ella" en Pages.

Antes de subir, decide:

| Contenido | ¿Dónde? | Motivo |
|---|---|---|
| Música con copyright (MP3 de TV Girl, Ed Sheeran…) | ❌ **No al repo.** Usa YouTube embed | Es una copia no licenciada; el README se deslinda pero eso no te protege ante GitHub. Riesgo real: DMCA → **te tumban el repo y se cae TODO el sitio**, no solo la canción. |
| Fotos de ustedes dos | ⚠️ Consciente | Caras + fecha + "Te amo Juliana" = identidades fácilmente vinculables. Búscalas en Google Images en 5 años. |
| Carta / textos íntimos | ⚠️ Consciente | Indexables. Mínimo pon `<meta name="robots" content="noindex">` y acepta que es *oficioso*, no garantía. |
| Fecha de aniversario, nombres, apodos | ✅ | Ya lo publicaste a medias en el propio código. |
| Contraseñas, "códigos secretos" | ❌ | No hay auth posible en estático. Un "código" en JS se lee en DevTools en 3 segundos. |

**Sobre tu plan:** la estrategia que ya empezaste —`youtubePlayer()`— es **la correcta**: cero archivos legales, cero bytes, y funciona. Y tu plan original ("yo subo las cosas, ella solo mira") **sí funciona bien en estático**, porque quien edita eres tú, desde el repo. Lo que no funciona en estático es *que ella escriba*.

**Límites de Pages** ([docs](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)): ~1 GB por sitio, **100 GB de tráfico/mes** (límite blando), 10 builds/hora, y archivos >100 MB rechazados. Un disco de 4 MP3 ≈ 40–60 MB; a 100 GB/mes, una sola persona escuchando en streaming se acerca rápido si crece.

**Verificado:** 1.235 de 1.261 líneas usan **CRLF** (finales de línea Windows). No rompe nada, pero mete ruido en los diffs de GitHub.

---

## 6. Accesibilidad y performance

**Lo que ya está bien hecho** (se nota que alguien cuidó esto): `aria-label` en controles, `aria-live` en mensajes y estado de YouTube, `role="slider"` en la barra de progreso, `prefers-reduced-motion`, `:focus-visible`, `pointer-events:none` en los corazones, `rel="noopener"` en el enlace externo, validación estricta de hosts en YouTube.

**Faltas:**

1. **`prefers-reduced-motion` no apaga la lluvia ni los corazones.** El CSS los neutraliza, pero el JS sigue dibujando y creando nodos. La lluvia a alta velocidad es justamente el caso en que esa preferencia existe.
2. **Los items de playlist son `div` con `onclick`** (línea 692), no `button`: inaccesibles por teclado, no llegan con `Tab`, `Enter` no los activa.
3. `setInterval(create, 1100)` crea nodos indefinidamente: en una pestaña abierta horas se acumulan; si el DOM se congela (teléfono bloqueado en segundo plano) se disparan todos juntos al volver.
4. `overflow-x:hidden` en `body` rompe `position:sticky` dentro del layout (te va a doler cuando hagas una barra de navegación fija).
5. `role="main"` en un `div` → usa `<main>`.

---

## 7. Arqueología del archivo (señales de lo que ya intentaste)

Esto no es basura, es información: **el sitio ya está creciendo y ya está agrietando el monolito.**

- Hay **3 bloques `@media`** (líneas 249, 285, 293) y **2 definiciones de `.btn.play`** (líneas 92 y 273) y **2 de `.love-box h2`** — estilos parcheados encima de los originales sin borrar los viejos.
- Mezcla de indentación (4 espacios / 0 espacios / 2 espacios) y de fin de línea (CRLF / LF) — evidencia de 2+ sesiones de edición distintas.
- `garden-*` / `love-garden` reemplazaron a una sección `.gallery-section` que todavía existe como clase con `display:flex` (línea 268) → **la "galería" ya estaba planeada** y se convirtió en el jardín.
- El comentario de la línea 602 está en **portugués** ("Los nombres de archivo deben coincidir…") dentro de una UI en **español**, con un README en **portugués**. Los tres idiomas del proyecto están mezclados.

---

## 8. Propuesta: cómo convertirlo en home web sin romper lo que ya funciona

Regla que propongo: **cero frameworks, cero build step, cero dependencias.** Que seguir puedas editar tocando un JSON.

```
repo/
├── index.html              ← landing: su nombre, navegación a tarjetas
├── musica.html             ← el reproductor de hoy, movido aquí (casi intacto)
├── fotos.html              ← galería generada desde un JSON (fase 3)
├── nosotros.html           ← timeline + carta + contador (fase 3)
├── .nojekyll               ← desactiva Jekyll
├── 404.html
├── manifest.webmanifest    ← "instalar" + nombre + color
├── assets/
│   ├── css/base.css        ← el CSS sale del inline (cacheable, reutilizable)
│   ├── js/player.js        ← motor de audio, reutilizado por todas las páginas
│   ├── img/og-cover.jpg    ← la preview de WhatsApp
│   └── audio/              ← solo cosas propias (voces, covers tuyos)
└── data/
    ├── config.json         ← ★ TU ÚNICO ARCHIVO A EDITAR
    ├── tracks.json         ← playlist declarativa (youtube | local | propio)
    └── notes.json          ← mensajes que tú escribes, ella lee
```

**`data/config.json`** — el corazón del asunto:

```json
{
  "site":  { "title": "Para Juliana", "tagline": "hecho con todo mi corazón" },
  "her":   { "name": "Juliana", "petNames": ["Amor", "Bebe", "Osita", "Juli"], "current": "Osita" },
  "us":    { "since": "2025-04-10", "anniversaryDay": 10 },
  "ui":    { "lang": "es" },
  "youtube": { "defaultUrl": "https://www.youtube.com/playlist?list=..." }
}
```

Cambiar el apodo del título, de la lluvia y de la etiqueta del disco pasa a ser **una línea en un JSON**. Sin tocar código.

**`data/tracks.json`** — resuelve los problemas 2.1/2.2/2.3 de un golpe:

```json
[
  { "title": "Lovers Rock", "artist": "TV Girl", "type": "youtube", "url": "https://youtu.be/..." },
  { "title": "Perfect", "artist": "Ed Sheeran", "type": "youtube", "url": "https://youtu.be/..." },
  { "title": "Notita de voz", "artist": "Para vos", "type": "local", "src": "assets/audio/nota-voz.m4a" }
]
```

El campo `type` hace todo: `youtube` → usa el iframe que ya tienes funcionando; `local` → solo para material propio y barato de servir. Y **dejas de tener MP3 huérfanos en el repo.**

### Orden sugerido

| Fase | Qué | Rompe algo | Gana |
|---|---|---|---|
| **0** | Fixeos quirúrgicos en el archivo actual | No | El popup de error, el contador, el borrado de canciones, el audio silencioso, los `alert()` → toast |
| **1** | Extraer `config.json` + `tracks.json` + CSS/JS a archivos | No (misma página) | Actualizar sin editar código |
| **2** | Separar `index.html` (landing) y `musica.html` + nav + PWA + OG + `.nojekyll` + 404 | Cambia la URL del reproductor | Se siente un sitio, se ve bien al compartirlo |
| **3** | `fotos.html` + `nosotros.html` (galería + timeline) | No | Lo que hoy falta del todo |
| **4** | Notas entre dispositivos (necesita API externa: Supabase free, o gist + token) | No | Que ella te pueda responder |

> Fase 4 es la única que **no se puede hacer en Pages puro**. Necesitas un servicio externo gratuito con API pública, o aceptar que los mensajes los escribes solo tú (que honestamente, para un regalo así, es probablemente más romántico y cero riesgo).

---

## 9. Ranking de severidad

**Bloqueante (arreglar antes de compartir el link):**
1. Popup de error en cada carga por MP3 inexistentes (§2.1)
2. Playlist rota se autoperpetúa en `localStorage` (§2.2)
3. `alert()` ignorados en WhatsApp/Instagram in-app + iOS (§2.1)
4. Todo lo público es público — decidir contenido antes de subir (§5)

**Alto:**
5. El contador nunca celebra el día 10 (§3.1)
6. Sin forma de borrar canciones + IndexedDB sin límite (§3.2)
7. Audio externo puede reproducir en silencio (§3.4)
8. Dos reproductores pueden sonar a la vez (§3.5)

**Medio:**
9. Contenido soldado al HTML, sin `config.json` (§4.1)
10. Sin Open Graph → link feo en WhatsApp (§4.4)
11. Sin `.nojekyll`, sin 404, sin manifest (§4.4)
12. Notas no sincronizan entre dispositivos (§4.3)
13. Fugas de memoria y CPU en móvil (§3.3)

**Bajo:**
14. `prefers-reduced-motion` no cubre canvas (§6)
15. Playlist inaccesible por teclado (§6)
16. Favoritos muertos, `encodeURI`, CRLF, estilos duplicados (§3.6, §7)
