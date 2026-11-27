/* =============================================================
   AMOR — CONFIGURACIÓN
   -------------------------------------------------------------
   Este es el ÚNICO archivo que necesitás tocar para cambiar
   textos, apodos, fechas o lo que se muestra.
   No sabés programar y no importa: sólo cambiá lo que está
   entre comillas. Después guardá y subí el archivo a GitHub.

   ⚠️ Cuidado con borrar las comillas o las comas.
      Si algo se rompe, se rompe SOLO este archivo — borrá lo que
      cambiaste y volvé a subirlo. El resto del sitio sigue andando.
   ============================================================= */

window.AMOR_CONFIG = {

  /* ---------- El sitio ---------- */
  site: {
    title: "Para tí",                 // pestaña del navegador
    shortTitle: "para tí",            // firma chica arriba a la izquierda
    tagline: "hecho con todo mi corazón",
    description: "Una casita en internet, hecha a mano, sólo para tí.",  // preview en WhatsApp
    accent: "rose"                     // "rose" | "amber" | "plum"  → color de acento
  },

  /* ---------- Ella ---------- */
  her: {
    name: "Juliana",                        // nombre real (sólo se muestra si abajo ponés true)
    petNames: ["Amor", "Bebe", "Osita", "Juli", "Mor", "Diosa", "Reina"],  // rotan en el título y flotan en el fondo
    greeting: "Para mi",               // primera línea del título gigante
    showRealName: false                // false = el nombre real NUNCA aparece en pantalla
  },

  /* ---------- Ustedes ---------- */
  us: {
    since: "2025-04-10",               // fecha de inicio: AAAA-MM-DD
    monthDay: 10,                      // día del mes que celebran
    hideExactDate: true,               // true = se oculta la fecha exacta, sólo se ve CUÁNTO tiempo llevan
    signedBy: "Tu osito Polar" // firma al pie de la carta
  },

  /* ---------- Portada ---------- */
  home: {
    eyebrow: "una cosita que te hice",
    intro: "Acá encontrás las canciones que me recuerdan a tí, y algunas cositas más que voy a ir sumando. Esta página ha tomado bastante tiempo, la hice yo, y de verdad la hice, a mano, lleva en desarrollo desde nuestro 1 año y 4 mes :3",
    /* Frases que van apareciendo y desapareciendo despacio.
       Agregá o borrá líneas a gusto. Cuanto más personales, mejor. */
    phrases: [
      "Si pudiera elegir de nuevo, volvería a encontrarte en cada vida.",
      "Gracias por hacer que lo cotidiano se sienta como algo mágico.",
      "Me haces sonreír incluso cuando no estás.",
      "Mi lugar favorito es a tu lado.",
      "Te amo más de lo que las palabras pueden decir."
    ],
    /* El texto de la carta grande de la portada */
    letter: "Si pudiera elegir de nuevo, volvería a encontrarte en cada vida. Gracias por hacer que lo cotidiano se sienta como algo mágico."
  },

  /* ---------- Módulos (las tarjetas de la portada) ----------
     ready: true   → la tarjeta es un enlace y entra a la página
     ready: false  → la tarjeta se ve "en construcción"
     href:  el nombre del archivo HTML, sin la carpeta               */
  modules: [
    {
      href: "musica.html",
      icon: "♫",
      title: "La música",
      subtitle: "nuestra banda sonora mixta",
      desc: "Las canciones que te dedico, listas para sonar, aunque se que no eres tan fan de las otras, gosela.",
      ready: true
    },
    {
      href: "fotos.html",
      icon: "✿",
      title: "Las fotos",
      subtitle: "nosotros dos bebe",
      desc: "El álbum que todavía estoy armando, que te dije hace ratito bebe.",
      ready: true
    },
    {
      href: "cartas.html",
      icon: "✉",
      title: "Las cartas",
      subtitle: "lo que no te digo",
      desc: "Cosas que se me ocurren de madrugada, ya no necesitarás ese grupo de whatsapp.",
      ready: true
    }
  ],

  /* ---------- Reproductor ---------- */
  player: {
    rememberLastSong: true,            // vuelve a la última canción que sonó
    volumeDefault: 0.85                // 0 = mudo, 1 = fuerte
  }
};
