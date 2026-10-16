const IC={
"Bolivariano":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><path d="M26 6l4-3 4 3v32h-8z"/><rect x="18" y="38" width="24" height="5" rx="2"/><rect x="28" y="43" width="4" height="12"/><circle cx="30" cy="57" r="3"/><path d="M50 8l2.4 5 5.6.8-4 4 1 5.4-5-2.7-5 2.7 1-5.4-4-4 5.6-.8z"/></svg>',
"Antiimperialista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><rect x="19" y="26" width="28" height="22" rx="6"/><rect x="19" y="14" width="6.5" height="16" rx="3.2"/><rect x="26.5" y="10" width="6.5" height="19" rx="3.2"/><rect x="34" y="11" width="6.5" height="18" rx="3.2"/><rect x="41" y="15" width="6.5" height="15" rx="3.2"/><rect x="23" y="49" width="20" height="9" rx="2"/></svg>',
"Latinoamericano":'<svg class="ic" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><circle cx="32" cy="32" r="10" fill="currentColor"/><path d="M32 6v10M32 48v10M6 32h10M48 32h10M13.6 13.6l7 7M43.4 43.4l7 7M13.6 50.4l7-7M43.4 20.6l7-7"/></svg>',
"Martiano":'<svg class="ic" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M32 20c-5-5-13-8-22-7v30c9-1 17 2 22 7z"/><path d="M32 20c5-5 13-8 22-7v30c-9-1-17 2-22 7z"/><path d="M32 20v30"/></svg>',
"Zapatista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><path d="M32 12c7 0 12 8 13 18l1 5H18l1-5c1-10 6-18 13-18z"/><rect x="17" y="31" width="30" height="6" rx="3"/><ellipse cx="32" cy="42" rx="27" ry="7"/></svg>',
"Marxista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><rect x="28" y="24" width="8" height="34" rx="4"/><rect x="14" y="8" width="36" height="17" rx="4"/><path d="M50 40l10 10-7 7-10-10z"/></svg>'};
// ==== Configuración central (assets/js/config.js). Si falta, usa respaldo ====
const CFG=(typeof window!=="undefined"&&window.CFG)||{};
const _marca=CFG.marca||{},_textos=CFG.textos||{},_pago=CFG.pago||{};
const PAYPAL_USER=_pago.paypal||"morraldigital";
const ZINLI_USER=_pago.zinli||"";
const paypalLink=a=>`https://paypal.me/${PAYPAL_USER}/${a.toFixed(2)}USD`;
// Pago Móvil (manual, sin backend): datos del cobro y destino del comprobante
const PAGOMOVIL=Object.assign({banco:"Banco Digital de los Trabajadores",codigo:"0175",telefono:"04268901582",cedula:"V-5249473",titular:"Jose de Los Santos Perez Lopez",qr:"assets/img/pagomovil-qr.png"},_pago.pagomovil||{});
const WHATSAPP=_pago.whatsapp||"584268901582"; // internacional, sin el 0 inicial
const VES_RATE=_pago.vesRate||0;              // respaldo si fallan las APIs de tasa (0 = sin respaldo)
const QR_PM=PAGOMOVIL.qr||"";                 // QR opcional del banco
// Cripto (cobro manual por Binance Pay). Solo identificadores PÚBLICOS; nunca claves privadas.
const BINANCE=Object.assign({id:"",email:"",tlf:"",qr:""},_pago.binance||{});
const QR_CRYPTO=BINANCE.qr||"";               // QR opcional de Binance Pay
// Supabase: registro opcional de pedidos (ver config.js, db/supabase_pedidos.sql y
// README). Se llama a la función rpc `registrar_pedido`. anonKey es PÚBLICA.
const SB=CFG.supabase||{};
const SB_URL=(SB.url||"").replace(/\/+$/,""),SB_KEY=SB.anonKey||"";
const SB_ON=!!(SB_URL&&SB_KEY);
// Textos y etiquetas editables desde config.js
const TXT=Object.assign({botonComprar:"COMPRAR",botonGratis:"Leer gratis",etiquetaMorral:"Añadir al morral",morralTitulo:"Tu morral"},_textos);
const ETIQ=Object.assign({card:"Tarjeta",paypal:"PayPal",bank:"Pago Móvil",crypto:"Cripto",zinli:"Zinli"},CFG.etiquetasPago||{});
const METODOS=((CFG.metodosPago&&CFG.metodosPago.length)?CFG.metodosPago:["card","paypal","bank","crypto","zinli"]).filter(k=>ETIQ[k]);
let cart=[],cat="Todos",lastMethod="card",orderCode="",rateCache=null;
const $=i=>document.getElementById(i),f=n=>"$"+n.toFixed(2);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const newOrder=()=>"MD-"+Math.random().toString(36).slice(2,8).toUpperCase();
const bsFmt=n=>new Intl.NumberFormat("es-VE",{style:"currency",currency:"VES",minimumFractionDigits:2}).format(n);
const toBs=(usd,rate)=>usd*rate;
async function getRate(){
if(rateCache)return rateCache;
const cands=[
{url:"https://ve.dolarapi.com/v1/dolares/oficial",fuente:"BCV (oficial)",pick:d=>d.promedio||d.venta||d.compra,fecha:d=>(d.fechaActualizacion||"").slice(0,10)},
{url:"https://ve.dolarapi.com/v1/dolares",fuente:"BCV (oficial)",pick:d=>{const o=Array.isArray(d)?d.find(x=>x.fuente=="oficial"):null;return o&&(o.promedio||o.venta)},fecha:d=>{const o=Array.isArray(d)?d.find(x=>x.fuente=="oficial"):null;return o?(o.fechaActualizacion||"").slice(0,10):""}}];
for(const c of cands){try{const r=await fetch(c.url,{cache:"no-store"});if(!r.ok)continue;const d=await r.json();const rate=+c.pick(d);if(rate>0){rateCache={rate,fuente:c.fuente,fecha:c.fecha(d)||""};return rateCache}}catch(e){}}
if(VES_RATE>0){rateCache={rate:VES_RATE,fuente:"Tasa referencial (local)",fecha:""};return rateCache}
return null}
function waLink(msg){return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`}
function copyText(s){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).catch(()=>{})}else{const t=document.createElement("textarea");t.value=s;document.body.appendChild(t);t.select();try{document.execCommand("copy")}catch(e){}t.remove()}}
async function fillBank(){
const el=document.getElementById("pm-bs");if(!el)return;
const info=await getRate();
if(!document.getElementById("pm-bs"))return;
const usd=total();
if(info){el.textContent=bsFmt(toBs(usd,info.rate));const rt=document.getElementById("pm-rate");if(rt)rt.textContent=`1 USD = ${bsFmt(info.rate)} · ${info.fuente}${info.fecha?" · "+info.fecha:""}`}
else{el.textContent="tasa no disponible"}
const wa=document.getElementById("pm-wa");if(!wa)return;
const rate=info?info.rate:0;
const bs=rate?`${bsFmt(toBs(usd,rate))} (tasa ${bsFmt(rate)})`:"monto en Bs a confirmar";
wa.href=waLink(`Hola, envío mi comprobante de Pago Móvil.\nPedido: ${orderCode}\nLibros: ${cart.map(i=>B[i][0]).join(", ")}\nTotal: ${f(usd)}\nMonto en Bs: ${bs}\nBanco: ${PAGOMOVIL.banco} (${PAGOMOVIL.codigo})`)}
function fillCrypto(){
const wa=document.getElementById("pm-wa");if(!wa)return;
wa.href=waLink(`Hola, envío mi comprobante de pago en cripto.\nPedido: ${orderCode}\nLibros: ${cart.map(i=>B[i][0]).join(", ")}\nTotal: ${f(total())} USDT\nBinance ID: ${BINANCE.id}\nCorreo: ${BINANCE.email}`)}
// Registra el pedido en Supabase (REST/PostgREST, sin librerías). Silencioso: si
// falla o no hay config, no rompe la confirmación. La tabla debe tener RLS de solo-INSERT.
async function saveOrder(correo){
if(!SB_ON||!orderCode||!cart.length)return;
const info=rateCache,usd=total();if(!(usd>0))return;
// Agrupa el carrito por título (hoy la cantidad es siempre 1) y lo envía
// como `p_items` a la función rpc `registrar_pedido`.
const grupos={};
for(const i of cart){const t=B[i][0];grupos[t]=grupos[t]||{book_title:t,unit_price:+B[i][3].toFixed(2),quantity:0};grupos[t].quantity++}
const esBanco=lastMethod=="bank";
const row={p_order_code:orderCode,p_customer_email:String(correo||""),p_payment_method:lastMethod,p_currency:"USD",p_total_amount:+usd.toFixed(2),
p_monto_bs:esBanco&&info?+toBs(usd,info.rate).toFixed(2):null,
p_tasa_bs:esBanco&&info?+info.rate.toFixed(4):null,
p_items:Object.values(grupos)};
try{await fetch(`${SB_URL}/rest/v1/rpc/registrar_pedido`,{method:"POST",headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json"},body:JSON.stringify(row)})}catch(e){}}
// ==== Supabase: catálogo, reseñas y actividad por sección ====
// Mismo estilo que saveOrder (REST/PostgREST, sin librerías). Todo es
// best-effort: si no hay config o la red falla, el sitio usa los datos
// locales (data.js y las reseñas de ejemplo) y sigue funcionando.
async function sbGet(path){
const r=await fetch(`${SB_URL}/rest/v1/${path}`,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});
if(!r.ok)throw new Error("supabase "+r.status);
return r.json()}
async function sbInsert(table,row){
const r=await fetch(`${SB_URL}/rest/v1/${table}`,{method:"POST",headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(row)});
if(!r.ok)throw new Error("supabase "+r.status);
return true}
// Catálogo: si Supabase tiene filas activas, sustituye las de data.js
// (que queda como respaldo/semilla). Mantiene el array posicional de 9
// campos que usan draw(), add() y done().
async function loadBooks(){
if(!SB_ON)return;
try{
const rows=await sbGet("books?select=title,author,corriente,price,color,description,file,source_url,license&active=eq.true&order=sort_order.asc");
if(!Array.isArray(rows)||!rows.length)return;
const mapped=rows.map(r=>[r.title,r.author,r.corriente,+r.price||0,r.color||"#2f6fb0",r.description||"",r.file||"",r.source_url||"",r.license||""]);
B.length=0;mapped.forEach(x=>B.push(x));
cat="Todos";draw();upd();
}catch(e){}}
// Reseñas: lee las aprobadas y reemplaza los ejemplos del HTML.
async function loadRevs(){
if(!SB_ON)return;
const cont=document.querySelector(".rev");if(!cont)return;
try{
const rows=await sbGet("reviews?select=name,rating,comment&status=eq.approved&order=created_at.desc&limit=30");
if(!Array.isArray(rows)||!rows.length)return;
cont.innerHTML=rows.map(r=>{const s=Math.min(5,Math.max(1,Math.round(+r.rating||5)));
return `<div class="q"><span class="stars">${"★".repeat(s)}${"☆".repeat(5-s)}</span><br>“${esc(r.comment)}” <br><small>— ${esc(r.name)}</small></div>`}).join("");
}catch(e){}}
// Actividad por sección: `click` en el menú y `view` al entrar en
// pantalla (una vez por carga). Solo se registra si hay Supabase.
function logSection(seccion,evento){
if(!SB_ON)return;
sbInsert("section_events",{section:seccion,event:evento}).catch(()=>{})}
function observeSections(){
["catalogo","resenas","expansion"].forEach(k=>{const a=document.getElementById("nav-"+k);if(a)a.addEventListener("click",()=>logSection(k,"click"))});
if(typeof IntersectionObserver==="undefined")return;
const visto={};
const io=new IntersectionObserver(es=>{es.forEach(en=>{const k=en.target.id;if(en.isIntersecting&&!visto[k]){visto[k]=1;logSection(k,"view");io.unobserve(en.target)}})},{threshold:.35});
["catalogo","resenas","expansion"].forEach(k=>{const s=document.getElementById(k);if(s)io.observe(s)})}
// ==== Hidratación desde config.js: textos, colores y secciones visibles ====
function applyTheme(){const c=CFG.colores||{},map={bg:"--bg",card:"--card",ink:"--ink",mut:"--mut",red:"--red",gold:"--gold",green:"--green",line:"--line"};for(const k in map){if(c[k])document.documentElement.style.setProperty(map[k],c[k])}}
function toggleSections(){const s=CFG.secciones||{};["catalogo","resenas","expansion"].forEach(k=>{const sec=document.getElementById(k);if(sec)sec.style.display=(s[k]===false)?"none":""})}
function hydrate(){
const m=_marca,t=_textos,n=CFG.nav||{},set=(id,v,html)=>{const e=$(id);if(!e||v==null)return;if(html)e.innerHTML=v;else e.textContent=v};
if(m.titulo)document.title=m.titulo;
set("brand","★ "+esc(m.nombre||"El Morral")+" <span>"+esc(m.acento||"")+"</span>",true);
set("hero-title",m.lema,true);set("hero-intro",m.intro);
set("cat-title",t.catalogoTitulo);set("cat-sub",t.catalogoSub);set("cat-note",t.catalogoNota,true);
set("rev-title",t.resenasTitulo);set("rev-sub",t.resenasSub);
set("exp-title",t.expansionTitulo);set("exp-sub",t.expansionSub);
set("morral-title",t.morralTitulo);set("foot",m.footer);
set("nav-catalogo",n.catalogo);set("nav-resenas",n.resenas);set("nav-expansion",n.expansion);
applyTheme();toggleSections()}
function draw(){const cs=["Todos",...new Set(B.map(b=>b[2]))];
$("filters").innerHTML=cs.map(c=>`<button class="chip ${c==cat?"on":""}" onclick="cat='${c}';draw()">${c}</button>`).join("");
$("grid").innerHTML=B.map((b,i)=>({b,i})).filter(o=>cat=="Todos"||o.b[2]==cat).map(({b,i})=>`<div class="book"><div class="cover" style="--c:${b[4]};border-top:5px solid ${b[4]};background:linear-gradient(150deg,${b[4]}1f,${b[4]}4d)">${IC[b[2]]}<span class="cb">${b[2]}</span><b>${b[0]}</b><small>${b[1]}</small></div><div class="bb"><span class="tag">★ ${b[8]||"Dominio público"} · ${b[2]}</span><p>${b[5]}</p><div class="row"><span class="price">${b[3]?f(b[3]):"Gratis"}</span>${b[3]?`<button class="btn" onclick="add(${i})" title="${TXT.etiquetaMorral}">${TXT.botonComprar}</button>`:`<a class="btn" href="${b[7]}" target="_blank" rel="noopener">${TXT.botonGratis}</a>`}</div></div></div>`).join("")}
function add(i){if(!B[i][3]||cart.includes(i))return;cart.push(i);upd();openCart()}
function rm(i){cart=cart.filter(x=>x!=i);upd()}
const total=()=>cart.reduce((s,i)=>s+B[i][3],0);
function upd(){$("cnt").textContent=cart.length;$("items").innerHTML=cart.length?cart.map(i=>`<div class="item"><span>${B[i][0]}</span><span>${f(B[i][3])} <a href="#" onclick="rm(${i});return false">✕</a></span></div>`).join(""):"<p class='sub'>Tu morral está vacío.</p>";$("tot").textContent=f(total())}
function openCart(){closeAll();$("cart").classList.add("show")}
function closeAll(){["cart","pay"].forEach(x=>$(x).classList.remove("show"))}
function checkout(){if(!cart.length)return;orderCode=newOrder();closeAll();$("pay").classList.add("show");method(METODOS[0])}
function method(m){if(!METODOS.includes(m))m=METODOS[0];lastMethod=m;const t=ETIQ;
const form={card:`<input placeholder="Nombre en la tarjeta"><input placeholder="Número de tarjeta" inputmode="numeric"><div class="row" style="gap:8px"><input placeholder="MM/AA"><input placeholder="CVC"></div><p class="note">Demo: no se procesa ningún cobro y estos campos no se envían a ningún servidor. Para pagar de verdad usa <b>Pago Móvil</b> o <b>Cripto</b>.</p>`,
zinli:`<p>Paga con tu tarjeta virtual Zinli (prepaga, en $USD).</p><input placeholder="Nombre en la tarjeta"><input placeholder="Número de la tarjeta Zinli" inputmode="numeric"><div class="row" style="gap:8px"><input placeholder="MM/AA"><input placeholder="CVC"></div><p class="note">Demo: no se procesa ningún cobro y estos campos no se envían a ningún servidor; el envío se hace desde la app de Zinli, no desde aquí.</p><p class="note">Recibe con tu Zinli desde la app: añade una tarjeta y transfiere el importe al número de «Pide y Recibe»${ZINLI_USER?` (${ZINLI_USER})`:""}.</p>`,
paypal:`<p>Serás redirigido a PayPal para completar el pago.</p><a class="btn alt" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${paypalLink(total())}" target="_blank" rel="noopener">Pagar ${f(total())} con PayPal</a><p class="note">Al volver de PayPal, pulsa «Ya pagué» para ver tus descargas.</p>`,bank:`<p>Pago Móvil a <b>${PAGOMOVIL.banco}</b> (código ${PAGOMOVIL.codigo}).</p>
<div class="pm-data">
<div class="pm-row"><span>Teléfono</span><b>${PAGOMOVIL.telefono}</b><button type="button" class="btn ghost cpy" onclick="copyText('${PAGOMOVIL.telefono}')">Copiar</button></div>
<div class="pm-row"><span>Cédula</span><b>${PAGOMOVIL.cedula}</b><button type="button" class="btn ghost cpy" onclick="copyText('${PAGOMOVIL.cedula}')">Copiar</button></div>
<div class="pm-row"><span>Titular</span><b>${PAGOMOVIL.titular}</b><button type="button" class="btn ghost cpy" onclick="copyText('${PAGOMOVIL.titular}')">Copiar</button></div>
<div class="pm-row"><span>Monto</span><b id="pm-bs">Calculando…</b><button type="button" class="btn ghost cpy" onclick="copyText(document.getElementById('pm-bs').textContent)">Copiar</button></div>
<div class="pm-row"><span>Concepto</span><b>${orderCode}</b><button type="button" class="btn ghost cpy" onclick="copyText('${orderCode}')">Copiar</button></div>
</div>
<p class="note" id="pm-rate">Consultando la tasa BCV…</p>
<img class="pm-qr" src="${QR_PM}" alt="QR de Pago Móvil" onerror="this.remove()">`,crypto:`<p>Paga con <b>Binance Pay</b> (USDT/USDC). El importe es 1:1 con el total en USD.</p>
<div class="pm-data">
<div class="pm-row"><span>Binance ID</span><b>${BINANCE.id}</b><button type="button" class="btn ghost cpy" onclick="copyText('${BINANCE.id}')">Copiar</button></div>
<div class="pm-row"><span>Correo</span><b>${BINANCE.email}</b><button type="button" class="btn ghost cpy" onclick="copyText('${BINANCE.email}')">Copiar</button></div>
<div class="pm-row"><span>Teléfono</span><b>${BINANCE.tlf}</b><button type="button" class="btn ghost cpy" onclick="copyText('${BINANCE.tlf}')">Copiar</button></div>
<div class="pm-row"><span>Monto</span><b>${f(total())} USDT</b><button type="button" class="btn ghost cpy" onclick="copyText('${total()}')">Copiar</button></div>
<div class="pm-row"><span>Concepto</span><b>${orderCode}</b><button type="button" class="btn ghost cpy" onclick="copyText('${orderCode}')">Copiar</button></div>
</div>
<p class="note">Seguridad: nunca pedimos claves privadas, frases semilla ni códigos 2FA. Verifica el destinatario antes de pagar.</p>
<img class="pm-qr" src="${QR_CRYPTO}" alt="QR de Binance Pay" onerror="this.remove()">`}[m];
$("pm").innerHTML=`<h2>Pagar ${f(total())}</h2><div class="tabs">${METODOS.map(k=>`<button class="chip ${k==m?"on":""}" onclick="method('${k}')">${t[k]}</button>`).join("")}</div>
<input type="email" id="em" placeholder="Correo para recibir tus libros" required>${form}
<button class="btn alt" style="width:100%" onclick="done()">${(m=="bank"||m=="crypto")?"Ya pagué, enviar comprobante":(m=="paypal"||m=="zinli"?"Ya pagué, mostrar descargas":"Confirmar pago")}</button>
${(m=="bank"||m=="crypto")?`<a class="btn wa" id="pm-wa" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box;margin-top:10px" href="${waLink("Hola, quiero pagar el pedido "+orderCode)}" target="_blank" rel="noopener">Enviar comprobante por WhatsApp</a><p class="note" style="margin-top:12px">Cobro manual: tu pedido queda <b>pendiente de verificación</b> hasta confirmar el comprobante.</p>`:`<p class="note" style="margin-top:12px">Modo demostración: no se procesa ningún cobro real. El pago con PayPal abre paypal.me/${PAYPAL_USER}; para entregar los archivos solo tras el cobro hace falta un servidor propio (webhook).</p>`}`;
if(m=="bank")fillBank();else if(m=="crypto")fillCrypto()}
function done(){const raw=$("em").value;if(!raw.includes("@")){$("em").focus();return}
const n=orderCode||newOrder(),em=esc(raw);
saveOrder(raw);
if(lastMethod=="bank"){
const wa=waLink(`Hola, pagué por Pago Móvil.\nPedido: ${n}\nLibros: ${cart.map(i=>B[i][0]).join(", ")}\nTotal: ${f(total())}\nBanco: ${PAGOMOVIL.banco} (${PAGOMOVIL.codigo})`);
$("pm").innerHTML=`<h2>Pedido registrado</h2><p>Gracias, compañero/a. Tu pedido <b>${n}</b> quedó <b>pendiente de verificación</b>.</p><p>Envía el comprobante del Pago Móvil y confirmaremos tu pago antes de liberar las descargas.</p><a class="btn wa" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${wa}" target="_blank" rel="noopener">Enviar comprobante por WhatsApp</a><p class="note" style="margin-top:12px">Te contactaremos en <b>${em}</b>. Guarda tu código de pedido: <b>${n}</b>.</p><button class="btn" style="margin-top:10px" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`;
return}
if(lastMethod=="crypto"){
const wa=waLink(`Hola, pagué mi pedido en cripto (Binance).\nPedido: ${n}\nLibros: ${cart.map(i=>B[i][0]).join(", ")}\nTotal: ${f(total())} USDT\nBinance ID: ${BINANCE.id}\nCorreo: ${BINANCE.email}`);
$("pm").innerHTML=`<h2>Pedido registrado</h2><p>Gracias, compañero/a. Tu pedido <b>${n}</b> quedó <b>pendiente de verificación</b>.</p><p>Envía el comprobante del pago en cripto (Binance) y confirmaremos tu pago antes de liberar las descargas.</p><a class="btn wa" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${wa}" target="_blank" rel="noopener">Enviar comprobante por WhatsApp</a><p class="note" style="margin-top:12px">Te contactaremos en <b>${em}</b>. Guarda tu código de pedido: <b>${n}</b>.</p><button class="btn" style="margin-top:10px" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`;
return}
const d=cart.map(i=>B[i][6]?`<div class="item"><a href="books/${B[i][6]}" download>${B[i][0]}</a></div>`:`<div class="item"><span>${B[i][0]}</span><small> en preparación</small></div>`).join("");
$("pm").innerHTML=`<h2>¡Gracias, compañero/a!</h2><p>Pedido <b>${n}</b> confirmado. Enviaremos tus libros a <b>${em}</b>.</p>${lastMethod=="paypal"?`<p class="note">El pago con PayPal no se verifica automáticamente en un sitio estático; si hubo algún problema, escríbenos.</p>`:lastMethod=="zinli"?`<p class="note">El pago con Zinli es una demo: recibe el importe por «Pide y Recibe» y confirma aquí el pedido. El archivo queda descargable igualmente.</p>`:""}${d?`<p class="sub">Tus descargas:</p>${d}`:""}<button class="btn" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`}
function addRev(e){e.preventDefault();const n=+$("rs").value;const s=Number.isFinite(n)?Math.min(5,Math.max(1,Math.round(n))):5;
const nombre=$("rn").value,comentario=$("rt").value;
if(SB_ON){sbInsert("reviews",{name:nombre,rating:s,comment:comentario,status:"pending"}).then(()=>prependRev(s,comentario,nombre,true)).catch(()=>prependRev(s,comentario,nombre,false));e.target.reset();return}
prependRev(s,comentario,nombre,false);e.target.reset()}
function prependRev(s,comentario,nombre,enviada){
const d=document.createElement("div");d.className="q";
d.innerHTML=`<span class="stars">${"★".repeat(s)}${"☆".repeat(5-s)}</span><br>`;
const p=document.createElement("span");p.textContent=`“${comentario}” — ${nombre}`+(enviada?" (pendiente de moderación)":"");
d.appendChild(p);document.querySelector(".rev").prepend(d)}
hydrate();draw();upd();loadBooks();loadRevs();observeSections();
