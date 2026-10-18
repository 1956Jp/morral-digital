const IC={
"Bolivariano":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><path d="M26 6l4-3 4 3v32h-8z"/><rect x="18" y="38" width="24" height="5" rx="2"/><rect x="28" y="43" width="4" height="12"/><circle cx="30" cy="57" r="3"/><path d="M50 8l2.4 5 5.6.8-4 4 1 5.4-5-2.7-5 2.7 1-5.4-4-4 5.6-.8z"/></svg>',
"Antiimperialista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><rect x="19" y="26" width="28" height="22" rx="6"/><rect x="19" y="14" width="6.5" height="16" rx="3.2"/><rect x="26.5" y="10" width="6.5" height="19" rx="3.2"/><rect x="34" y="11" width="6.5" height="18" rx="3.2"/><rect x="41" y="15" width="6.5" height="15" rx="3.2"/><rect x="23" y="49" width="20" height="9" rx="2"/></svg>',
"Latinoamericano":'<svg class="ic" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><circle cx="32" cy="32" r="10" fill="currentColor"/><path d="M32 6v10M32 48v10M6 32h10M48 32h10M13.6 13.6l7 7M43.4 43.4l7 7M13.6 50.4l7-7M43.4 20.6l7-7"/></svg>',
"Martiano":'<svg class="ic" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M32 20c-5-5-13-8-22-7v30c9-1 17 2 22 7z"/><path d="M32 20c5-5 13-8 22-7v30c-9-1-17 2-22 7z"/><path d="M32 20v30"/></svg>',
"Zapatista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><path d="M32 12c7 0 12 8 13 18l1 5H18l1-5c1-10 6-18 13-18z"/><rect x="17" y="31" width="30" height="6" rx="3"/><ellipse cx="32" cy="42" rx="27" ry="7"/></svg>',
"Marxista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><rect x="28" y="24" width="8" height="34" rx="4"/><rect x="14" y="8" width="36" height="17" rx="4"/><path d="M50 40l10 10-7 7-10-10z"/></svg>',
"Clásico":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><path d="M32 4 6 19h52z"/><rect x="6" y="19" width="52" height="5"/><rect x="14" y="24" width="4" height="24"/><rect x="25" y="24" width="4" height="24"/><rect x="36" y="24" width="4" height="24"/><rect x="47" y="24" width="4" height="24"/><rect x="8" y="48" width="48" height="5" rx="1"/><rect x="4" y="55" width="56" height="6" rx="2"/></svg>'};
// ==== Configuración central (assets/js/config.js). Si falta, usa respaldo ====
const CFG=(typeof window!=="undefined"&&window.CFG)||{};
const _marca=CFG.marca||{},_textos=CFG.textos||{},_pago=CFG.pago||{};
const PAYPAL_USER=_pago.paypal||"morraldigital";
const ZINLI_USER=_pago.zinli||"";
const paypalLink=a=>`https://paypal.me/${PAYPAL_USER}/${a.toFixed(2)}USD`;
// Pago Móvil (manual, sin backend): datos del cobro y destino del comprobante
const PAGOMOVIL=Object.assign({banco:"Banco Mercantil",codigo:"0105",telefono:"04268901582",cedula:"V-5249473",titular:"Jose de Los Santos Perez Lopez",qr:"assets/img/pagomovil-qr.png"},_pago.pagomovil||{});
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
// Entrega protegida: Edge Function que valida que el pedido esté `paid` y
// devuelve URLs firmadas temporales de los archivos en el bucket privado
// `libros` (ver supabase/functions/entregar y AGENTS.md).
const SB_FN_ENTREGAR=SB_URL?`${SB_URL}/functions/v1/entregar`:"";
// EmailJS: correos opcionales al cerrar un pedido (acuse al cliente y aviso al
// admin). REST/JSON sin librerías, como getRate()/saveOrder(). La publicKey es
// PÚBLICA; la protección es el «Allowlist» de orígenes en el panel de EmailJS.
const MAIL=CFG.emailjs||{};
const MAIL_ON=!!(MAIL.publicKey&&MAIL.serviceId);
// Textos y etiquetas editables desde config.js
const TXT=Object.assign({botonComprar:"COMPRAR",botonGratis:"Leer gratis",etiquetaMorral:"Añadir al morral",morralTitulo:"Tu morral"},_textos);
const ETIQ=Object.assign({card:"Tarjeta",paypal:"PayPal",bank:"Pago Móvil",crypto:"Cripto",zinli:"Zinli"},CFG.etiquetasPago||{});
const METODOS=((CFG.metodosPago&&CFG.metodosPago.length)?CFG.metodosPago:["card","paypal","bank","crypto","zinli"]).filter(k=>ETIQ[k]);
let cart=[],cat="Todos",lastMethod="card",orderCode="",rateCache=null;
const $=i=>document.getElementById(i),f=n=>"$"+n.toFixed(2);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const newOrder=()=>"MD-"+Math.random().toString(36).slice(2,8).toUpperCase();
const newFree=()=>"GR-"+Math.random().toString(36).slice(2,8).toUpperCase();
const bsFmt=n=>new Intl.NumberFormat("es-VE",{style:"currency",currency:"VES",minimumFractionDigits:2}).format(n);
const toBs=(usd,rate)=>usd*rate;
// Morral persistente: guarda los TÍTULOS (id estable) en localStorage, no los
// índices de B (que cambian si Supabase reemplaza el catálogo en loadBooks()).
const CART_KEY="morral-digital:cart:v1";
const rowOf=k=>B.find(b=>b[0]===k);
const cartRows=()=>cart.map(rowOf).filter(Boolean);
const cartTitles=()=>cartRows().map(r=>r[0]);
function saveCart(){try{localStorage.setItem(CART_KEY,JSON.stringify(cart))}catch(e){}}
function loadCart(){try{const a=JSON.parse(localStorage.getItem(CART_KEY)||"[]");return Array.isArray(a)?a.filter(k=>typeof k==="string"&&rowOf(k)):[]}catch(e){return[]}}
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
wa.href=waLink(`Hola, envío mi comprobante de Pago Móvil.\nPedido: ${orderCode}\nLibros: ${cartTitles().join(", ")}\nTotal: ${f(usd)}\nMonto en Bs: ${bs}\nBanco: ${PAGOMOVIL.banco} (${PAGOMOVIL.codigo})`)}
function fillCrypto(){
const wa=document.getElementById("pm-wa");if(!wa)return;
wa.href=waLink(`Hola, envío mi comprobante de pago en cripto.\nPedido: ${orderCode}\nLibros: ${cartTitles().join(", ")}\nTotal: ${f(total())} USDT\nBinance ID: ${BINANCE.id}\nCorreo: ${BINANCE.email}`)}
// Registra el pedido en Supabase (REST/PostgREST, sin librerías). Silencioso: si
// falla o no hay config, no rompe la confirmación. La tabla debe tener RLS de solo-INSERT.
async function saveOrder(correo){
if(!SB_ON||!orderCode||!cart.length)return;
const info=rateCache,usd=total();if(!(usd>0))return;
// Agrupa el carrito por título (hoy la cantidad es siempre 1) y lo envía
// como `p_items` a la función rpc `registrar_pedido`.
const grupos={};
for(const r of cartRows()){const t=r[0];grupos[t]=grupos[t]||{book_title:t,unit_price:+r[3].toFixed(2),quantity:0};grupos[t].quantity++}
const esBanco=lastMethod=="bank";
const row={p_order_code:orderCode,p_customer_email:String(correo||""),p_payment_method:lastMethod,p_currency:"USD",p_total_amount:+usd.toFixed(2),
p_monto_bs:esBanco&&info?+toBs(usd,info.rate).toFixed(2):null,
p_tasa_bs:esBanco&&info?+info.rate.toFixed(4):null,
p_items:Object.values(grupos)};
try{await fetch(`${SB_URL}/rest/v1/rpc/registrar_pedido`,{method:"POST",headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json"},body:JSON.stringify(row)})}catch(e){}}
// Envía un correo vía EmailJS (REST/JSON, sin librerías). Silencioso: si falla
// o no hay config, no rompe la confirmación. Límite de EmailJS: 1 envío/segundo.
async function sendMail(tpl,params){
if(!MAIL_ON||!tpl)return false;
try{const r=await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service_id:MAIL.serviceId,template_id:tpl,user_id:MAIL.publicKey,template_params:params})});if(!r.ok){console.warn("EmailJS",tpl,`HTTP ${r.status}`,await r.text().catch(()=>""));return false}return true}catch(e){console.warn("EmailJS: fallo de red",tpl,e);return false}}
// Avisa al administrador del pedido y manda al cliente un acuse con (opcional)
// sus enlaces. Se separa ~1s para respetar el límite de EmailJS.
async function notifyOrder(correo,codigo){
if(!MAIL_ON)return;
const info=rateCache,usd=total(),banco=lastMethod=="bank";
const base=location.href.replace(/[^/]*$/,"");
// Entrega protegida (bucket privado): el correo NO lleva el archivo ni una
// URL pública. Incluye los títulos comprados y el ENLACE WEB donde se
// descargan («Mis descargas»), con instrucciones y el código del pedido.
const enlaces=MAIL.enviarEnlaces?`<p>Tus libros:</p><ul>${cartTitles().map(t=>`<li>${esc(t)}</li>`).join("")}</ul><p>Descárgalos en la tienda: <a href="${base}">${base}</a><br>Pulsa «Mis descargas» e introduce el código <b>${codigo}</b> y tu correo.</p>`:"";
const params={email:String(correo||""),client_email:String(correo||""),admin_email:MAIL.adminEmail||"",order_code:codigo,metodo:ETIQ[lastMethod]||lastMethod,total:f(usd),moneda:"USD",pago:"1",
monto_bs:banco&&info?bsFmt(toBs(usd,info.rate)):"",tasa_bs:banco&&info?bsFmt(info.rate):"",
items:cartTitles().join(", "),enlaces:enlaces,
whatsapp:waLink(`Hola, sobre el pedido ${codigo} de El Morral Digital`)};
await sendMail(MAIL.templateAdmin,params);
await new Promise(r=>setTimeout(r,1100));
await sendMail(MAIL.templateCliente,params)}
// ==== Descarga gratuita: registra el correo del solicitante y le manda el enlace ====
// Guarda el correo en la tabla `solicitudes` (RLS de solo-INSERT: se consulta
// desde el panel) y envía al solicitante el enlace al libro desde la cuenta del
// administrador (EmailJS). Best-effort: si falta config, no rompe la página.
async function saveSolicitud(email,row,code){
if(!SB_ON)return;
try{await sbInsert("solicitudes",{email:String(email||""),book_title:row[0],source_url:row[7]||"",code:code||""})}catch(e){}}
async function notifyFree(email,row,code){
if(!MAIL_ON||!String(email||"").includes("@"))return false;
const base=location.href.replace(/[^/]*$/,"");
const enlace=row[7]?`<p>Aquí tienes <b>${esc(row[0])}</b>:</p><ul><li><a href="${esc(row[7])}">${esc(row[0])}</a></li></ul>`:`<p>Tienes <b>${esc(row[0])}</b> disponible en la tienda.</p>`;
const params={email:String(email),client_email:String(email),admin_email:MAIL.adminEmail||"",order_code:code||"GR-",metodo:"Descarga gratuita",total:f(0),moneda:"USD",pago:"",
monto_bs:"",tasa_bs:"",items:row[0],
enlaces:`${enlace}<p>Más en la tienda: <a href="${base}">${base}</a></p>`,
whatsapp:waLink(`Hola, sobre el libro ${row[0]} de El Morral Digital`)};
return sendMail(MAIL.templateCliente,params)}
// Formulario de descarga gratuita: pide el correo del solicitante.
function freeBook(i){
const b=B[i];if(!b)return;
closeAll();$("pay").classList.add("show");
const abrir=b[7]?`<a class="btn ghost" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box;margin-top:8px" href="${esc(b[7])}" target="_blank" rel="noopener">Abrir el enlace ahora</a>`:"";
$("pm").innerHTML=`<h2>${esc(b[0])}</h2><p class="note">${esc(b[1])} · ${esc(b[2])}</p><p>Te enviamos el enlace de descarga a tu correo.</p><input type="email" id="fe-em" placeholder="Tu correo"><button class="btn alt" style="width:100%" onclick="freeSend(${i})">Recibir el enlace por correo</button>${abrir}<div id="fe-msg"></div>`}
async function freeSend(i){
const b=B[i];if(!b)return;
const inp=document.getElementById("fe-em"),msg=document.getElementById("fe-msg");
const em=((inp&&inp.value)||"").trim();
if(!em.includes("@")){if(inp)inp.focus();if(msg)msg.innerHTML="<p class='note'>Escribe un correo válido.</p>";return}
const code=newFree();
if(msg)msg.innerHTML="<p class='note'>Enviando…</p>";
saveSolicitud(em,b,code).catch(()=>{});
let enviado=false;try{enviado=await notifyFree(em,b,code)}catch(e){}
if(!msg)return;
const abrir=b[7]?` <a href="${esc(b[7])}" target="_blank" rel="noopener">abrir el enlace ahora</a>`:"";
msg.innerHTML=enviado?`<p class="note">Listo (ref. <b>${esc(code)}</b>). Enviamos el enlace a <b>${esc(em)}</b>.${abrir}</p>`:`<p class="note">No se pudo enviar el correo (ref. <b>${esc(code)}</b>).${abrir}</p>`}
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
$("grid").innerHTML=B.map((b,i)=>({b,i})).filter(o=>cat=="Todos"||o.b[2]==cat).map(({b,i})=>`<div class="book"><div class="cover" style="--c:${b[4]};border-top:5px solid ${b[4]};background:linear-gradient(150deg,${b[4]}1f,${b[4]}4d)">${IC[b[2]]}<span class="cb">${b[2]}</span><b>${b[0]}</b><small>${b[1]}</small></div><div class="bb"><span class="tag">★ ${b[8]||"Dominio público"} · ${b[2]}</span><p>${b[5]}</p><div class="row"><span class="price${b[3]?"":" gratis"}">${b[3]?f(b[3]):"Gratis"}</span>${b[3]?`<button class="btn comprar" onclick="add(${i})" title="${TXT.etiquetaMorral}">${TXT.botonComprar}</button>`:`<button class="btn gratis" onclick="freeBook(${i})">${TXT.botonGratis}</button>`}</div></div></div>`).join("")}
function add(i){const k=B[i][0];if(!B[i][3]||cart.includes(k))return;cart.push(k);upd();openCart()}
function rmAt(idx){cart.splice(idx,1);upd()}
const total=()=>cart.reduce((s,k)=>{const r=rowOf(k);return s+(r?+r[3]:0)},0);
function upd(){cart=cart.filter(k=>rowOf(k));$("cnt").textContent=cart.length;$("items").innerHTML=cart.length?cart.map((k,idx)=>{const r=rowOf(k);return `<div class="item"><span>${r[0]}</span><span>${f(r[3])} <a href="#" onclick="rmAt(${idx});return false">✕</a></span></div>`}).join(""):"<p class='sub'>Tu morral está vacío.</p>";$("tot").textContent=f(total());saveCart()}
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
// ==== Entrega protegida (Fase 2): reclamo de descargas ====
// El pedido nace `pending_review`. Cuando el admin lo marca `paid` en el
// panel de Supabase, el cliente comprueba aquí y recibe URLs firmadas
// temporales (~1 h) generadas por la Edge Function `entregar`, que lee los
// archivos del bucket privado `libros`. Los PDF/EPUB de pago ya no se
// publican en books/ (repo público).
let pendingClaim=null;
function claimStored(){
const cc=document.getElementById("cl-code"),ce=document.getElementById("cl-em");
const code=(cc&&cc.value)||(pendingClaim&&pendingClaim.code)||orderCode;
const email=(ce&&ce.value)||(pendingClaim&&pendingClaim.email)||"";
claim(code,email)}
async function claim(code,email){
const box=document.getElementById("dl");
code=String(code||"").trim().toUpperCase();email=String(email||"").trim();
if(box)box.innerHTML="<p class='note'>Comprobando…</p>";
if(!SB_FN_ENTREGAR){if(box)box.innerHTML="<p class='note'>La entrega no está configurada.</p>";return}
if(!code||!email.includes("@")){if(box)box.innerHTML="<p class='note'>Escribe tu código de pedido y tu correo.</p>";return}
let data;
try{const r=await fetch(SB_FN_ENTREGAR,{method:"POST",headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({order_code:code,email})});data=await r.json()}
catch(e){if(box)box.innerHTML="<p class='note'>No se pudo comprobar. Revisa tu conexión e inténtalo de nuevo.</p>";return}
if(!box)return;
if(data.error==="not_found"){box.innerHTML="<p class='note'>No encontramos ese pedido. Revisa el código y el correo.</p>";return}
if(data.error==="forbidden"){box.innerHTML="<p class='note'>El correo no coincide con el del pedido.</p>";return}
if(data.error){box.innerHTML="<p class='note'>No se pudo comprobar el pedido. Inténtalo más tarde.</p>";return}
if(data.status!=="paid"){box.innerHTML="<p class='note'>Tu pago aún <b>no está verificado</b>. Te avisaremos a tu correo cuando lo confirmemos; podrás descargar aquí cuando esté listo.</p>";return}
const links=(data.links||[]).filter(l=>l.url);
if(!links.length){box.innerHTML="<p class='note'>No hay archivos disponibles para este pedido.</p>";return}
const mins=Math.max(1,Math.round((data.expires_in||3600)/60));
box.innerHTML=`<p class="sub">Tus descargas (enlaces válidos ~${mins} min):</p>`+links.map(l=>l.kind==="external"?`<div class="item"><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title)}</a></div>`:`<div class="item"><a href="${esc(l.url)}" download>${esc(l.title)}</a></div>`).join("")}
function claimBlock(code,email){
pendingClaim={code:code,email:email};
return `<div id="dl" style="margin-top:12px"><button class="btn alt" style="width:100%" onclick="claimStored()">Comprobar y descargar</button><p class="note">Si aún no está verificado, vuelve a intentarlo cuando te avisemos.</p></div>`}
function openClaim(){
closeAll();$("pay").classList.add("show");
$("pm").innerHTML=`<h2>Mis descargas</h2><p class="note">Introduce el código de tu pedido y el correo que usaste. Si tu pago ya fue verificado, aparecerán tus enlaces de descarga.</p><input id="cl-code" placeholder="Código (MD-XXXXXX)" value="${esc(orderCode||"")}"><input type="email" id="cl-em" placeholder="Tu correo"><button class="btn alt" style="width:100%" onclick="claimStored()">Comprobar</button><div id="dl"></div>`}
function done(){const raw=$("em").value;if(!raw.includes("@")){$("em").focus();return}
const n=orderCode=orderCode||newOrder(),em=esc(raw);
saveOrder(raw).catch(()=>{});
notifyOrder(raw,n).catch(()=>{});
if(lastMethod=="bank"){
const wa=waLink(`Hola, pagué por Pago Móvil.\nPedido: ${n}\nLibros: ${cartTitles().join(", ")}\nTotal: ${f(total())}\nBanco: ${PAGOMOVIL.banco} (${PAGOMOVIL.codigo})`);
$("pm").innerHTML=`<h2>Pedido registrado</h2><p>Gracias, compañero/a. Tu pedido <b>${n}</b> quedó <b>pendiente de verificación</b>.</p><p>Envía el comprobante del Pago Móvil y confirmaremos tu pago antes de liberar las descargas.</p><a class="btn wa" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${wa}" target="_blank" rel="noopener">Enviar comprobante por WhatsApp</a>${claimBlock(n,raw)}<p class="note" style="margin-top:12px">Te contactaremos en <b>${em}</b>. Guarda tu código de pedido: <b>${n}</b>.</p><button class="btn" style="margin-top:10px" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`;
return}
if(lastMethod=="crypto"){
const wa=waLink(`Hola, pagué mi pedido en cripto (Binance).\nPedido: ${n}\nLibros: ${cartTitles().join(", ")}\nTotal: ${f(total())} USDT\nBinance ID: ${BINANCE.id}\nCorreo: ${BINANCE.email}`);
$("pm").innerHTML=`<h2>Pedido registrado</h2><p>Gracias, compañero/a. Tu pedido <b>${n}</b> quedó <b>pendiente de verificación</b>.</p><p>Envía el comprobante del pago en cripto (Binance) y confirmaremos tu pago antes de liberar las descargas.</p><a class="btn wa" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${wa}" target="_blank" rel="noopener">Enviar comprobante por WhatsApp</a>${claimBlock(n,raw)}<p class="note" style="margin-top:12px">Te contactaremos en <b>${em}</b>. Guarda tu código de pedido: <b>${n}</b>.</p><button class="btn" style="margin-top:10px" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`;
return}
if(lastMethod=="paypal"||lastMethod=="zinli"){
$("pm").innerHTML=`<h2>Pedido registrado</h2><p>Gracias, compañero/a. Tu pedido <b>${n}</b> quedó <b>pendiente de verificación</b>.</p><p class="note">El pago con ${ETIQ[lastMethod]} no se verifica automáticamente en un sitio estático: confirmaremos el cobro y liberaremos tus descargas.</p>${claimBlock(n,raw)}<p class="note" style="margin-top:12px">Te contactaremos en <b>${em}</b>. Guarda tu código de pedido: <b>${n}</b>.</p><button class="btn" style="margin-top:10px" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`;
return}
$("pm").innerHTML=`<h2>Pedido registrado</h2><p>Gracias, compañero/a. Pedido <b>${n}</b>.</p><p class="note">Modo demostración: la tarjeta no procesa ningún cobro real, así que no hay entrega. Para pagar de verdad usa <b>Pago Móvil</b> o <b>Cripto</b>.</p><button class="btn" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`}
function addRev(e){e.preventDefault();const n=+$("rs").value;const s=Number.isFinite(n)?Math.min(5,Math.max(1,Math.round(n))):5;
const nombre=$("rn").value,comentario=$("rt").value;
if(SB_ON){sbInsert("reviews",{name:nombre,rating:s,comment:comentario,status:"pending"}).then(()=>prependRev(s,comentario,nombre,true)).catch(()=>prependRev(s,comentario,nombre,false));e.target.reset();return}
prependRev(s,comentario,nombre,false);e.target.reset()}
function prependRev(s,comentario,nombre,enviada){
const d=document.createElement("div");d.className="q";
d.innerHTML=`<span class="stars">${"★".repeat(s)}${"☆".repeat(5-s)}</span><br>`;
const p=document.createElement("span");p.textContent=`“${comentario}” — ${nombre}`+(enviada?" (pendiente de moderación)":"");
d.appendChild(p);document.querySelector(".rev").prepend(d)}
hydrate();cart=loadCart();draw();upd();loadBooks();loadRevs();observeSections();
