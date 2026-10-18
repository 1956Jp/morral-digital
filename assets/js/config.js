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
    intro: "Librería digital de pensamiento bolivariano, martiano, zapatista, marxista, antiimperialista y latinoamericano. Obras de dominio público: sin patentes, sin cercas, para circular entre los pueblos.",
    footer: "★ El Morral Digital · Ideas libres para los pueblos · Obras de dominio público"
  },

  // --------------------------------------------------------- Textos
  textos: {
    catalogoTitulo: "Catálogo libre",
    catalogoSub: "Obras de dominio público y enlaces libres. Seis títulos se sostienen con un aporte solidario: $1,50 USD por Ariel y Facundo, y $1 USD por El porvenir de la América Latina, La República Argentina y el caso de Venezuela, Noli me tángere y El Filibusterismo; los demás son enlaces gratuitos a su fuente original.",
    catalogoNota: "Nota editorial: solo publicamos obras de dominio público estricto, con archivo y fuente verificados en books/MANIFIESTO.md. Todo título sin archivo y sin fuente comprobable queda retirado del catálogo. Los textos de Fidel Castro, Ho Chi Minh, Che Guevara y Hugo Chávez permanecen en copyright y no se incorporarán. La corriente zapatista contemporánea (EZLN) se ofrece solo como enlace gratuito: Radio Zapatista publica bajo licencia CC BY-NC-SA (sin uso comercial).",
    resenasTitulo: "Voces contestataria, e insurgentes con morral",
    resenasSub: "Reseñas de lectores · las nuevas se revisan antes de publicarse",
    expansionTitulo: "Hoja de ruta",
    expansionSub: "Así crecerá el Morral",
    morralTitulo: "Tu morral",
    botonComprar: "COMPRAR",
    botonGratis: "Leer gratis",
    etiquetaMorral: "Añadir al morral"
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

  // --------------------------------------------- Métodos de pago
  // Pestañas visibles y su orden. Quita las que no uses.
  // Claves válidas: "card", "paypal", "bank", "crypto", "zinli".
  metodosPago: ["card", "paypal", "bank", "crypto", "zinli"],
  etiquetasPago: { card: "Tarjeta", paypal: "PayPal", bank: "Pago Móvil", crypto: "Cripto", zinli: "Zinli" },

  // ------------------------------------------------ Datos de cobro
  pago: {
    paypal: "morraldigital",        // usuario de paypal.me
    zinli: "",                      // teléfono «Pide y Recibe» (opcional)
    whatsapp: "584268901582",       // internacional, sin el 0 inicial
    vesRate: 0,                     // respaldo de tasa Bs/USD si fallan las APIs (0 = sin respaldo)
    pagomovil: {
      banco: "Banco Digital de los Trabajadores",
      codigo: "0175",
      telefono: "04268901582",
      cedula: "V-5249473",
      titular: "Jose de Los Santos Perez Lopez",
      qr: "assets/img/pagomovil-qr.png"   // opcional; si no existe, no se muestra
    },
    // Solo identificadores PÚBLICOS. NUNCA claves privadas, semilla ni 2FA.
    binance: {
      id: "755739247",
      email: "abog.joseperez@gmail.com",
      tlf: "04268901582",
      qr: "assets/img/binance-qr.png"     // opcional
    }
  },

  // ------------------------------------------------ Secciones (Supabase)
  // Registro opcional de pedidos, catálogo, reseñas y actividad por sección.
  // Si `url` o `anonKey` quedan vacíos, se desactiva y el sitio usa los
  // datos locales (data.js y las reseñas de ejemplo). Ejecuta antes el SQL
  // de `db/supabase_pedidos.sql` (pedidos) y `db/supabase_secciones.sql`
  // (books/reviews/section_events); luego carga `db/seed_books.sql`.
  // La `anonKey` es PÚBLICA (va en el navegador): la protección es la
  // política RLS. NUNCA pongas aquí la `service_role` ni ninguna clave privada.
  supabase: {
    url: "https://uzqadthbjhhdhoqlnupn.supabase.co", // https://TU-PROYECTO.supabase.co
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6cWFkdGhiamhoZGhvcWxudXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNDczNDksImV4cCI6MjEwNzcyMzM0OX0.nQNc279PijOU9Bvg5v7232VPaJ_Frb_Oh1l-1smfjIs" // clave anónima pública (NO la service_role)
  },

  // ------------------------------------------------ Correo (EmailJS)
  // Envío opcional de correos al cerrar un pedido: un ACUSE + agradecimiento
  // al cliente (con sus enlaces, si `enviarEnlaces` es true) y un AVISO de
  // pago al administrador con el tipo de producto solicitado. Crea tus
  // plantillas en https://dashboard.emailjs.com/ y pega aquí los ID.
  // Si `publicKey` o `serviceId` quedan vacíos, se desactiva y el sitio
  // funciona igual. La `publicKey` es PÚBLICA (va en el navegador): protégela
  // con el «Allowlist» de orígenes en el panel de EmailJS. NUNCA pongas aquí
  // la clave privada (accessToken) ni ninguna credencial secreta.
  emailjs: {
    // MODO TEST: deja estos 3 campos vacíos y todo sigue desactivado.
    // Para activarlos: pega aquí abajo los ID reales de tu dashboard.
    publicKey: "kTwN8Sthj84cLVIbV", // Public Key de la cuenta (pública)
    serviceId: "service_1bsj1mi",          // TODO → pega el Service ID (service_xxx)
    templateCliente: "template_9a4yync",    // TODO → pega el Template ID del acuse al cliente (tpl_xxx)
    templateAdmin: "template_3w8khjr",      // TODO → pega el Template ID del aviso a ti (tpl_xxx)
    adminEmail: "abogjoseperez014@gmail.com", // tu correo de administrador (recibe el aviso de pago)
    enviarEnlaces: true     // true = el correo al cliente incluye instrucciones para reclamar en «Mis descargas»
  }
};
