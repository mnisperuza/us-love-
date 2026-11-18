/* =============================================================
   AMOR — LA PLAYLIST
   -------------------------------------------------------------
   Cada canción es un bloque entre { }. Copiá uno y pegalo abajo
   para agregar una canción nueva.

   CÓMO PONER UNA CANCIÓN DE YOUTUBE:
     1. Abrí la canción en YouTube.
     2. Mirá la dirección:  youtube.com/watch?v=D0HmxaBceQg
     3. Lo que va después de  v=  (11 letras/números) es el "id".
     4. Pegalo en youtubeId.
   Listo. El audio NO se aloja acá, así que no hay problema legal
   ni se llena el repo.

   CAMPOS:
     title       el título que se ve
     artist      quién canta
     youtubeId   el id de arriba  ← dejalo vacío "" si no lo sabés
     youtubeUrl  link completo (opcional, sirve de respaldo y para "buscar")
     note        una línea tuya sobre esa canción (opcional, se ve al seleccionarla)
     type        "youtube" (recomendado) | "local" (un archivo del repo) | "stream" (url directa a mp3)
     src         sólo para type "local": ej "assets/audio/mi-grabacion.m4a"
     youtubeList sólo si querés que suene una playlist completa de YouTube
   ============================================================= */

window.AMOR_TRACKS = [

  {
    title: "Lovers Rock",
    artist: "TV Girl",
    type: "youtube",
    youtubeId: "",
    youtubeUrl: "https://www.youtube.com/watch?v=qBSVKDH9HQc",
    note: "La primera que te mandé y no entendiste.",
    duration: "3:20"
  },

   {
    title: "Perfect",
    artist: "Ed sheeran",
    type: "local",
    src: "assets/audio/Perfect.mp3",
    note: "Un clásico muy nuestro bebe.",
    duration: "4:41"
  },

  {
    title: "All of Me",
    artist: "John Legend",
    type: "youtube",
    youtubeId: "",
    youtubeUrl: "https://www.youtube.com/watch?v=QfgJQUiQFes",
    note: "Una de tus peticiones",
    duration: "4:29"
  },

  {
    title: "Cigarettes Out The Window (slowed)",
    artist: "TV Girl",
    type: "youtube",
    youtubeId: "",
    youtubeUrl: "https://www.youtube.com/watch?v=_eACTXi1DTc",
    note: "Es un pick raro, pero me parecio linda hace 1 año.",
    duration: "3:36"
  },

  {
    title: "Virgen",
    artist: "Adolescent Orquesta",
    type: "youtube",
    youtubeId: "",
    youtubeUrl: "https://www.youtube.com/watch?v=XlybbEh8q_U",
    note: "Un pick miooo.",
    duration: "4:30"
  }

  /* --- Ejemplo de algo tuyo, guardado en el repo (carpeta assets/audio) ---
  ,{
    title: "Nota de voz",
    artist: "para vos",
    type: "local",
    src: "assets/audio/nota-voz.m4a",
    note: "Grabada a las 3am, por eso se escucha el ventilador.",
    duration: "0:42"
  }
  ------------------------------------------------------------------------- */
];
