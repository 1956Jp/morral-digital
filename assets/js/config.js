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
    lema: "Leer es resistir.<br>Un morral lleno de ideas libres.",
    intro: "Librería digital de pensamiento bolivariano, martiano, zapatista, marxista, antiimperialista y latinoamericano. Obras de dominio público: sin patentes, sin cercas, para circular entre los pueblos.",
    footer: "★ El Morral Digital · Ideas libres para los pueblos · Obras de dominio público"
  },

  // --------------------------------------------------------- Textos
  textos: {
    catalogoTitulo: "Catálogo libre",
    catalogoSub: "Obras de dominio público: bolivariano, martiano, zapatista, marxista, antiimperialista y latinoamericano. Cada libro cuesta entre $1 y $2 USD: un aporte solidario que sostiene la biblioteca, no una renta sobre las ideas.",
    catalogoNota: "Nota editorial: solo publicamos obras de dominio público estricto, con la fuente y la licencia registradas en books/MANIFIESTO.md. Los textos de Fidel Castro, Ho Chi Minh, Che Guevara y Hugo Chávez permanecen en copyright y no se incorporarán. La corriente zapatista contemporánea (EZLN) se ofrece solo como enlace gratuito: Radio Zapatista publica bajo licencia CC BY-NC-SA (sin uso comercial).",
    resenasTitulo: "Voces del morral",
    resenasSub: "Reseñas de lectores",
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

  // ------------------------------------------------ Pedidos (Supabase)
  // Registro opcional de pedidos. Si `url` o `anonKey` quedan vacíos, se
  // desactiva y el sitio funciona igual. La `anonKey` es PÚBLICA (va en el
  // navegador): protégela con una política RLS de solo-INSERT en la tabla
  // (ver README). NUNCA pongas aquí la `service_role` ni ninguna clave privada.
  supabase: {
    url: "",            // https://TU-PROYECTO.supabase.co
    anonKey: "",        // clave anónima pública (NO la service_role)
    tabla: "pedidos"
  }
};
