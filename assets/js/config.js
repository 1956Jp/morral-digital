// =====================================================================
//  EL MORRAL DIGITAL — CONFIGURACIÓN CENTRAL
//  ---------------------------------------------------------------------
//  Edita SOLO este archivo para cambiar el sitio (textos, colores,
//  secciones, métodos de pago y datos de cobro). No necesitas tocar
//  app.js salvo que quieras añadir FUNCIONES nuevas.
//
//  Cómo extender:
//   · Textos .......... → `marca` y `textos`
//   · Diseño/colores ... → `colores` (variables CSS) y assets/css/styles.css
//   · Vistas/secciones . → `secciones` (true/false) y `ordenSecciones`
//   · Libros ........... → assets/js/data.js + books/MANIFIESTO.md
//   · Métodos de pago .. → `metodosPago` y `etiquetasPago`
//   · Datos de cobro ... → `pago`
//   · Funciones ........ → añade código en app.js (ver AGENTS.md)
// =====================================================================
window.CFG = {
  // ------------------------------------------------ Marca y textos base
  marca: {
    nombre: "El Morral",
    acento: "Digital",
    titulo: "El Morral Digital — Libros libres para los pueblos",
    lema: "<span class=\"resaltado\">Leer es resistir.</span><br>Un morral lleno de ideas libres.",
    intro: "Librería digital de pensamiento bolivariano, martiano, zapatista, marxista, antiimperialista y latinoamericano. Obras de dominio público: sin patentes, sin cercas, para circular entre los pueblos. Todo el catálogo es gratuito; aceptamos aportes voluntarios para sostener la tecnología.",
    footer: "★ El Morral Digital · Ideas libres para los pueblos · Obras de dominio público"
  },

  // --------------------------------------------------------- Textos
  textos: {
    catalogoTitulo: "Catálogo libre",
    catalogoSub: "Todo el catálogo es gratuito: obras de dominio público y enlaces libres, sin pago ni registro para leer. Descarga directa cuando hay archivo; enlace a la fuente original cuando solo existe en línea. El proyecto se sostiene con aportes voluntarios para su desarrollo tecnológico.",
    catalogoNota: "Nota editorial: publicamos sobre todo obras de dominio público estricto, con archivo y fuente verificados en books/MANIFIESTO.md. Todo título sin archivo y sin fuente comprobable queda retirado del catálogo. Los textos de Fidel Castro, Ho Chi Minh, Che Guevara y Hugo Chávez permanecen en copyright y no se incorporarán. La corriente zapatista contemporánea (EZLN) se ofrece solo como enlace gratuito: Radio Zapatista publica bajo licencia CC BY-NC-SA (sin uso comercial). Los dos tomos de El imperialismo petrolero y la Revolución Venezolana se ofrecen como lectura gratuita con enlace a su fuente, y su retiro del catálogo atenderá cualquier solicitud fundada de sus derechohabientes.",
    resenasTitulo: "Voces contestataria, e insurgentes con morral",
    resenasSub: "Reseñas de lectores · las nuevas se revisan antes de publicarse",
    expansionTitulo: "Hoja de ruta",
    expansionSub: "Así crecerá el Morral",
    morralTitulo: "Tu lista de descargas",
    botonComprar: "Añadir",
    botonGratis: "Leer gratis",
    botonDescargar: "Descargar",
    etiquetaMorral: "Añadir a la lista"
  },

  // ------------------------------------- Colores (variables CSS)
  // Se aplican a :root. Deja en "" o quita una clave para usar el CSS.
  colores: {
    bg: "", card: "", ink: "", mut: "", red: "", gold: "", green: "", line: ""
  },

  // ------------------------------------------- Vistas / secciones
  // Pon en false para ocultar una sección completa. El orden del menú
  // sigue el orden de este objeto.
  secciones: { catalogo: true, resenas: true, expansion: true },
  // Etiquetas del menú superpuesto a cada sección
  nav: { catalogo: "Catálogo", resenas: "Reseñas", expansion: "Expansión" },

  // ---------------------------------------- Aportes (donaciones)
  // El catálogo es 100 % gratuito. Estos métodos solo reciben APORTES
  // voluntarios para sostener el desarrollo tecnológico del proyecto.
  // Pestañas visibles y su orden. Claves válidas: "card", "paypal", "bank", "crypto", "zinli".
  metodosPago: ["bank", "crypto"],
  etiquetasPago: { card: "Tarjeta", paypal: "PayPal", bank: "Pago Móvil", crypto: "Cripto", zinli: "Zinli" },

  // Textos del bloque de aportes
  aportes: {
    titulo: "Aportes",
    intro: "El Morral Digital es gratuito y sin cercas. Si quieres, puedes dejar un aporte voluntario para sostener el desarrollo de la tecnología: hosting, dominio, herramientas y el trabajo de mantenimiento. ¡Gracias, compañero/a!",
    montoMin: 1,          // aporte mínimo sugerido en USD (0 = sin mínimo)
    montoMax: 500,        // tope de cordura del importe en USD
    montos: [1, 3, 5, 10] // botones de importe rápido en USD
  },

  // ------------------------------------------------ Datos de cobro
  pago: {
    paypal: "morraldigital",        // usuario de paypal.me
    zinli: "",                      // teléfono «Pide y Recibe» (opcional)
    whatsapp: "584268901582",       // internacional, sin el 0 inicial
    vesRate: 0,                     // respaldo manual de tasa Bs/USD si falla el BCV (0 = sin respaldo)
    vesRateMin: 1,                  // rango de cordura: se ignoran tasas del BCV fuera de [min, max]
    vesRateMax: 10000000,
    pagomovil: {
      banco: "Banco Mercantil",
      codigo: "0105",
      telefono: "04268901582",
      cedula: "V-5249473",
      titular: "Jose de Los Santos Perez Lopez",
      link: "https://www.mercantilbanco.com/", // web oficial de Mercantil: abre el botón «Abrir Mercantil» del panel
      qr: ""                                    // imagen QR opcional (p. ej. "assets/img/pagomovil-qr.png"); vacío = no se muestra
    },
    // Solo identificadores PÚBLICOS. NUNCA claves privadas, semilla ni 2FA.
    binance: {
      id: "755739247",
      email: "abog.joseperez@gmail.com",
      tlf: "04268901582",
      qr: ""                                    // imagen QR opcional (p. ej. "assets/img/binance-qr.png"); vacío = no se muestra
    }
  },

  // ------------------------------------------------ Secciones (Supabase)
  // Registro opcional de catálogo, reseñas, actividad y solicitudes/aportes.
  // Si `url` o `anonKey` quedan vacíos, se desactiva y el sitio usa los
  // datos locales (data.js y las reseñas de ejemplo). Ejecuta antes el SQL
  // de `db/supabase_secciones.sql` (books/reviews/section_events) y
  // `db/supabase_solicitudes.sql` (descargas gratuitas y aportes); luego
  // carga `db/seed_books.sql`.
  // La `anonKey` es PÚBLICA (va en el navegador): la protección es la
  // política RLS. NUNCA pongas aquí la `service_role` ni ninguna clave privada.
  supabase: {
    url: "https://uzqadthbjhhdhoqlnupn.supabase.co", // https://TU-PROYECTO.supabase.co
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6cWFkdGhiamhoZGhvcWxudXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNDczNDksImV4cCI6MjEwNzcyMzM0OX0.nQNc279PijOU9Bvg5v7232VPaJ_Frb_Oh1l-1smfjIs" // clave anónima pública (NO la service_role)
  },

  // ------------------------------------------------ Correo (EmailJS)
  // Envío opcional del correo de descarga gratuita (notifyFree): el enlace a
  // la fuente del libro, con referencia GR-XXXXXX. El antiguo aviso al
  // administrador ya no se envía (`templateAdmin`/`adminEmail` quedan
  // reservados). Crea tus plantillas en https://dashboard.emailjs.com/ y
  // pega aquí los ID.
  // Si `publicKey` o `serviceId` quedan vacíos, se desactiva y el sitio
  // funciona igual. La `publicKey` es PÚBLICA (va en el navegador): protégela
  // con el «Allowlist» de orígenes en el panel de EmailJS. NUNCA pongas aquí
  // la clave privada (accessToken) ni ninguna credencial secreta.
  emailjs: {
    publicKey: "kTwN8Sthj84cLVIbV",        // Public Key de la cuenta (pública)
    serviceId: "service_0xhzzc5",           // Service ID (service_xxx)
    templateCliente: "template_9a4yync",    // Template ID del acuse/descargas al cliente
    templateAdmin: "template_3w8khjr",      // Template ID del aviso al administrador (hoy sin uso)
    adminEmail: "abogjoseperez014@gmail.com", // tu correo (variable admin_email en notifyFree)
    enviarEnlaces: true     // reservado: el correo de descarga ya no adjunta enlaces de compra
  }
};
