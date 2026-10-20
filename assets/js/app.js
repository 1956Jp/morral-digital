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
const PAGOMOVIL=Object.assign({banco:"Banco Mercantil",codigo:"0105",telefono:"04268901582",cedula:"V-5249473",titular:"Jose de Los Santos Perez Lopez",link:"https://www.mercantilbanco.com/",qr:""},_pago.pagomovil||{});
const PAGOMOVIL_LINK=PAGOMOVIL.link||"";       // botón «Abrir Mercantil» (plataforma/web del banco)
const WHATSAPP=_pago.whatsapp||"584268901582"; // internacional, sin el 0 inicial
const VES_RATE=_pago.vesRate||0;              // respaldo manual si fallan las APIs de tasa (0 = sin respaldo)
const RATE_MIN=+(_pago.vesRateMin||1),RATE_MAX=+(_pago.vesRateMax||10000000); // rango de cordura Bs/USD
const QR_PM=PAGOMOVIL.qr||"";                 // QR opcional del banco
// Cripto (cobro manual por Binance Pay). Solo identificadores PÚBLICOS; nunca claves privadas.
const BINANCE=Object.assign({id:"",email:"",tlf:"",qr:""},_pago.binance||{});
const QR_CRYPTO=BINANCE.qr||"";               // QR opcional de Binance Pay
// Supabase: registro opcional de secciones y solicitudes/aportes (ver config.js,
// db/supabase_secciones.sql y db/supabase_solicitudes.sql). anonKey es PÚBLICA.
const SB=CFG.supabase||{};
const SB_URL=(SB.url||"").replace(/\/+$/,""),SB_KEY=SB.anonKey||"";
const SB_ON=!!(SB_URL&&SB_KEY);
// Entrega gratuita: Edge Function que devuelve URLs firmadas temporales de los
// archivos del bucket privado `libros` (ver supabase/functions/entregar). Ya no
// exige pago: todo el catálogo es gratuito y de dominio público.
const SB_FN_ENTREGAR=SB_URL?`${SB_URL}/functions/v1/entregar`:"";
// EmailJS: correo opcional de descarga gratuita (notifyFree: enlace a la fuente
// y ref. GR). REST/JSON sin librerías, como getRate(). La publicKey es
// PÚBLICA; la protección es el «Allowlist» de orígenes en el panel de EmailJS.
const MAIL=CFG.emailjs||{};
const MAIL_ON=!!(MAIL.publicKey&&MAIL.serviceId);
// Textos y etiquetas editables desde config.js
const TXT=Object.assign({botonComprar:"Añadir",botonGratis:"Leer gratis",botonDescargar:"Descargar",etiquetaMorral:"Añadir a la lista",morralTitulo:"Tu lista de descargas"},_textos);
const ETIQ=Object.assign({card:"Tarjeta",paypal:"PayPal",bank:"Pago Móvil",crypto:"Cripto",zinli:"Zinli"},CFG.etiquetasPago||{});
const METODOS=((CFG.metodosPago&&CFG.metodosPago.length)?CFG.metodosPago:["bank","crypto"]).filter(k=>ETIQ[k]);
// Aportes (donaciones): catálogo gratuito, aportes voluntarios para la tecnología.
const APOR=Object.assign({titulo:"Aportes",intro:"El Morral Digital es gratuito y sin cercas. Si quieres, puedes dejar un aporte voluntario para sostener el desarrollo de la tecnología.",montoMin:1,montoMax:500,montos:[1,3,5,10]},CFG.aportes||{});
let cart=[],cat="Todos",lastMethod="bank",orderCode="",rateCache=null,aporte=0;
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
// Solo se acepta la tasa OFICIAL del BCV. Se descartan las respuestas fuera del
// rango de cordura [RATE_MIN, RATE_MAX] (tasas anómalas del proveedor) en vez de
// mostrarlas. Si ninguna fuente válida responde, usa el respaldo manual o null.
const ok=r=>Number.isFinite(r)&&r>=RATE_MIN&&r<=RATE_MAX;
const cands=[
{url:"https://ve.dolarapi.com/v1/dolares/oficial",fuente:"BCV (oficial)",pick:d=>d.promedio||d.venta||d.compra,fecha:d=>(d.fechaActualizacion||"").slice(0,10)},
{url:"https://ve.dolarapi.com/v1/dolares",fuente:"BCV (oficial)",pick:d=>{const o=Array.isArray(d)?d.find(x=>x.fuente=="oficial"):null;return o&&(o.promedio||o.venta)},fecha:d=>{const o=Array.isArray(d)?d.find(x=>x.fuente=="oficial"):null;return o?(o.fechaActualizacion||"").slice(0,10):""}}];
for(const c of cands){try{const r=await fetch(c.url,{cache:"no-store"});if(!r.ok)continue;const d=await r.json();const rate=+c.pick(d);if(ok(rate)){rateCache={rate,fuente:c.fuente,fecha:c.fecha(d)||""};return rateCache}console.warn("Tasa BCV fuera de rango, ignorada:",rate,"(esperado entre "+RATE_MIN+" y "+RATE_MAX+")")}catch(e){}}
if(ok(VES_RATE)){rateCache={rate:VES_RATE,fuente:"Tasa BCV configurada (respaldo)",fecha:""};return rateCache}
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
wa.href=waLink(`Hola, envío mi comprobante de aporte por Pago Móvil.\nAporte: ${orderCode}\nMonto: ${f(usd)}\nMonto en Bs: ${bs}\nBanco: ${PAGOMOVIL.banco} (${PAGOMOVIL.codigo})`)}
function fillCrypto(){
const wa=document.getElementById("pm-wa");if(!wa)return;
wa.href=waLink(`Hola, envío mi comprobante de aporte en cripto.\nAporte: ${orderCode}\nMonto: ${f(total())} USDT\nBinance ID: ${BINANCE.id}\nCorreo: ${BINANCE.email}`)}
// Envía un correo vía EmailJS (REST/JSON, sin librerías). Silencioso: si falla
// o no hay config, no rompe la confirmación. Límite de EmailJS: 1 envío/segundo.
async function sendMail(tpl,params){
if(!MAIL_ON||!tpl)return false;
try{const r=await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service_id:MAIL.serviceId,template_id:tpl,user_id:MAIL.publicKey,template_params:params})});if(!r.ok){const t=await r.text().catch(()=>"");if(r.status===404||/account not found/i.test(t))console.error("EmailJS: la cuenta (Public Key) no existe o fue desactivada. Revisa config.js → emailjs y el panel de EmailJS.");else if(r.status===400&&/public key is invalid/i.test(t))console.error("EmailJS: Public Key inválida. Revisa config.js → emailjs.publicKey.");else if(r.status===403)console.error("EmailJS: origen no permitido (Allowlist). Añade el dominio del sitio en el panel de EmailJS.");else console.warn("EmailJS",tpl,`HTTP ${r.status}`,t);return false}return true}catch(e){console.warn("EmailJS: fallo de red",tpl,e);return false}}
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
// ==== Descarga directa gratuita (bucket privado → URL firmada temporal) ====
// La Edge Function `entregar` firma el archivo del bucket `libros` sin exigir
// pago (todo el catálogo es de dominio público). Si no hay Edge Function o
// falla, se cae al enlace de la fuente (campo 7) cuando exista.
async function descargar(i){
const b=B[i];if(!b||!b[6]){if(b&&b[7])open(b[7]);return}
closeAll();$("pay").classList.add("show");
$("pm").innerHTML=`<h2>${esc(b[0])}</h2><p class="note">${esc(b[1])} · ${esc(b[2])}</p><p class="note">Preparando la descarga…</p><div id="fe-msg"></div>`;
const msg=document.getElementById("fe-msg");
if(!SB_FN_ENTREGAR){if(b[7]){open(b[7])}else if(msg)msg.innerHTML="<p class='note'>La descarga directa no está configurada.</p>";return}
let url="";
try{const r=await fetch(SB_FN_ENTREGAR,{method:"POST",headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({archivo:b[6]})});const data=await r.json();url=(data&&data.url)||""}catch(e){}
if(url){const a=document.createElement("a");a.href=url;a.download=b[6];a.rel="noopener";document.body.appendChild(a);a.click();a.remove();
if(msg)msg.innerHTML=`<p class="note">Descarga iniciada.</p>${b[7]?`<a class="btn ghost" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box;margin-top:8px" href="${esc(b[7])}" target="_blank" rel="noopener">Ver en la fuente original</a>`:""}`}
else if(b[7]){open(b[7])}
else if(msg)msg.innerHTML="<p class='note'>No se pudo preparar la descarga. Inténtalo más tarde.</p>"}
const open=u=>{const a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()};
// ==== Supabase: catálogo, reseñas y actividad por sección ====
// Mismo estilo que getRate() (REST/PostgREST, sin librerías). Todo es
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
// Escapa los datos del catálogo: `books` viene de Supabase (defensa en
// profundidad ante XSS almacenado si se relaja la escritura o hay error de datos).
// El color se valida a hex o nombre/rgb y se usa solo en style (evita `red;…`).
const colorSafe=c=>{const s=String(c||"").trim();return /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20}|rgba?\([0-9.,\s%]+\)|hsla?\([0-9.,\s%]+\))$/.test(s)?s:"#2f6fb0"};
function draw(){const cs=["Todos",...new Set(B.map(b=>b[2]))];
$("filters").innerHTML=cs.map(c=>`<button class="chip ${c==cat?"on":""}" data-cat="${esc(c)}" onclick="cat=this.dataset.cat;draw()" title="${esc(c)}">${esc(c)}<small>Gratis</small></button>`).join("");
const ord=(a,b)=>a.b[0].localeCompare(b.b[0],"es");
$("grid").innerHTML=B.map((b,i)=>({b,i})).filter(o=>cat=="Todos"||o.b[2]==cat).sort(ord).map(({b,i})=>{
const accion=b[6]?`<button class="btn gratis" onclick="descargar(${i})">${esc(TXT.botonDescargar)}</button>`:(b[7]?`<button class="btn gratis" onclick="freeBook(${i})">${esc(TXT.botonGratis)}</button>`:`<button class="btn gratis" disabled>Próximamente</button>`);
const c=colorSafe(b[4]);
return `<div class="book"><div class="cover" style="--c:${c};border-top:5px solid ${c};background:linear-gradient(150deg,${c}1f,${c}4d)">${IC[b[2]]}<span class="cb">${esc(b[2])}</span><b>${esc(b[0])}</b><small>${esc(b[1])}</small></div><div class="bb"><span class="tag">★ ${esc(b[8]||"Dominio público")} · ${esc(b[2])}</span><p>${esc(b[5])}</p><div class="row"><span class="price gratis">Gratis</span>${accion}</div><button class="btn ghost" style="width:100%;margin-top:8px" onclick="add(${i})" title="${esc(TXT.etiquetaMorral)}">＋ ${esc(TXT.botonComprar)}</button></div></div>`}).join("")}
function add(i){const k=B[i][0];if(cart.includes(k))return;cart.push(k);upd();openCart()}
function rmAt(idx){cart.splice(idx,1);upd()}
const total=()=>aporte;
function upd(){cart=cart.filter(k=>rowOf(k));$("cnt").textContent=cart.length;
$("items").innerHTML=cart.length?cart.map((k,idx)=>{const r=rowOf(k);const i=B.indexOf(r);
const d=r[6]?`<button class="btn gratis" onclick="descargar(${i})">Descargar</button>`:(r[7]?`<button class="btn gratis" onclick="freeBook(${i})">Leer gratis</button>`:"");
return `<div class="item"><span>${esc(r[0])}</span><span class="row" style="gap:8px">${d} <a href="#" onclick="rmAt(${idx});return false">✕</a></span></div>`}).join(""):"<p class='sub'>Tu lista está vacía.</p>";
saveCart()}
function openCart(){closeAll();$("cart").classList.add("show")}
function closeAll(){["cart","pay"].forEach(x=>$(x).classList.remove("show"))}
function checkout(){openAportes()}
// ==== Aportes (donaciones voluntarias): el catálogo es gratuito ====
// Reusa el panel de pago para recibir APORTES destinados a sostener el
// desarrollo tecnológico. No hay pedido ni verificación: es un gesto voluntario.
function aporteSet(v){aporte=+v||0;method(lastMethod)}
function aporteInput(){const e=document.getElementById("ap-monto");if(!e)return;const v=+e.value;if(Number.isFinite(v)&&v>0)aporte=v;method(lastMethod)}
function openAportes(){orderCode=orderCode||newOrder();if(!aporte||aporte<+APOR.montoMin)aporte=+APOR.montoMin||0;closeAll();$("pay").classList.add("show");method(METODOS[0])}
function method(m){if(!METODOS.includes(m))m=METODOS[0];lastMethod=m;const t=ETIQ;
const quick=(APOR.montos||[]).map(v=>`<button type="button" class="chip ${aporte==v?"on":""}" onclick="aporteSet(${v})">$${v}</button>`).join("");
const form={card:`<input placeholder="Nombre en la tarjeta"><input placeholder="Número de tarjeta" inputmode="numeric"><div class="row" style="gap:8px"><input placeholder="MM/AA"><input placeholder="CVC"></div><p class="note">Demo: no se procesa ningún cobro y estos campos no se envían a ningún servidor. Para aportar de verdad usa <b>Pago Móvil</b> o <b>Cripto</b>.</p>`,
zinli:`<p>Aporta con tu tarjeta virtual Zinli.</p><input placeholder="Nombre en la tarjeta"><input placeholder="Número de la tarjeta Zinli" inputmode="numeric"><div class="row" style="gap:8px"><input placeholder="MM/AA"><input placeholder="CVC"></div><p class="note">Demo: no se procesa ningún cobro; el envío se hace desde la app de Zinli.</p>${ZINLI_USER?`<p class="note">«Pide y Recibe»: ${ZINLI_USER}.</p>`:""}`,
paypal:`<p>Aporta con PayPal.</p><a class="btn alt" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${paypalLink(total())}" target="_blank" rel="noopener">Aportar ${f(total())} con PayPal</a><p class="note">Al volver de PayPal, pulsa «Ya aporté».</p>`,bank:`<p>Aporte por <b>Pago Móvil</b> a <b>${PAGOMOVIL.banco}</b> (código ${PAGOMOVIL.codigo}).</p>
<div class="pm-data">
<div class="pm-row"><span>Teléfono</span><b>${PAGOMOVIL.telefono}</b><button type="button" class="btn ghost cpy" onclick="copyText('${PAGOMOVIL.telefono}')">Copiar</button></div>
<div class="pm-row"><span>Cédula</span><b>${PAGOMOVIL.cedula}</b><button type="button" class="btn ghost cpy" onclick="copyText('${PAGOMOVIL.cedula}')">Copiar</button></div>
<div class="pm-row"><span>Titular</span><b>${PAGOMOVIL.titular}</b><button type="button" class="btn ghost cpy" onclick="copyText('${PAGOMOVIL.titular}')">Copiar</button></div>
<div class="pm-row"><span>Monto</span><b id="pm-bs">Calculando…</b><button type="button" class="btn ghost cpy" onclick="copyText(document.getElementById('pm-bs').textContent)">Copiar</button></div>
<div class="pm-row"><span>Concepto</span><b>${orderCode}</b><button type="button" class="btn ghost cpy" onclick="copyText('${orderCode}')">Copiar</button></div>
</div>
<p class="note" id="pm-rate">Consultando la tasa BCV…</p>
${PAGOMOVIL_LINK?`<a class="btn alt" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box;margin-top:10px" href="${PAGOMOVIL_LINK}" target="_blank" rel="noopener">Abrir Mercantil en línea</a>`:""}
${QR_PM?`<img class="pm-qr" src="${QR_PM}" alt="QR de Pago Móvil" onerror="this.remove()">`:""}`,crypto:`<p>Aporte con <b>Binance Pay</b> (USDT/USDC). El importe es 1:1 con los dólares.</p>
<div class="pm-data">
<div class="pm-row"><span>Binance ID</span><b>${BINANCE.id}</b><button type="button" class="btn ghost cpy" onclick="copyText('${BINANCE.id}')">Copiar</button></div>
<div class="pm-row"><span>Correo</span><b>${BINANCE.email}</b><button type="button" class="btn ghost cpy" onclick="copyText('${BINANCE.email}')">Copiar</button></div>
<div class="pm-row"><span>Teléfono</span><b>${BINANCE.tlf}</b><button type="button" class="btn ghost cpy" onclick="copyText('${BINANCE.tlf}')">Copiar</button></div>
<div class="pm-row"><span>Monto</span><b>${f(total())} USDT</b><button type="button" class="btn ghost cpy" onclick="copyText('${total()}')">Copiar</button></div>
<div class="pm-row"><span>Concepto</span><b>${orderCode}</b><button type="button" class="btn ghost cpy" onclick="copyText('${orderCode}')">Copiar</button></div>
</div>
<p class="note">Seguridad: nunca pedimos claves privadas, frases semilla ni códigos 2FA. Verifica el destinatario antes de aportar.</p>
${QR_CRYPTO?`<img class="pm-qr" src="${QR_CRYPTO}" alt="QR de Binance Pay" onerror="this.remove()">`:""}`}[m];
$("pm").innerHTML=`<h2>${esc(APOR.titulo)} · ${f(total())} USD</h2><p class="note">${esc(APOR.intro)}</p>
<div class="row" style="gap:8px;flex-wrap:wrap;margin:10px 0">${quick}<input id="ap-monto" type="number" min="${APOR.montoMin||0}" max="${APOR.montoMax||100000}" step="1" value="${aporte||""}" placeholder="Otro monto (USD)" style="max-width:160px"><button type="button" class="btn ghost" onclick="aporteInput()">Aplicar</button></div>
<div class="tabs">${METODOS.map(k=>`<button class="chip ${k==m?"on":""}" onclick="method('${k}')">${t[k]}</button>`).join("")}</div>
<input type="email" id="em" placeholder="Tu correo (opcional, para agradecerte)">${form}
<button class="btn alt" style="width:100%" onclick="done()">Ya aporté, enviar comprobante</button>
${(m=="bank"||m=="crypto")?`<a class="btn wa" id="pm-wa" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box;margin-top:10px" href="${waLink("Hola, quiero hacer un aporte a El Morral Digital")}" target="_blank" rel="noopener">Enviar comprobante por WhatsApp</a><p class="note" style="margin-top:12px">Los aportes son voluntarios y sostienen el desarrollo de la tecnología.</p>`:`<p class="note" style="margin-top:12px">Modo demostración: no se procesa ningún cobro real.</p>`}`;
if(m=="bank")fillBank();else if(m=="crypto")fillCrypto()}
// Registra el aporte (best-effort) en `solicitudes` con el concepto "Aporte".
async function saveAporte(email){
if(!SB_ON)return;
try{await sbInsert("solicitudes",{email:String(email||""),book_title:"Aporte",source_url:"",code:orderCode})}catch(e){}}
function done(){const raw=($("em")&&$("em").value)||"";const em=esc(raw.includes("@")?raw:"");
const n=orderCode=orderCode||newOrder(),amt=total();
saveAporte(raw).catch(()=>{});
let wa;
if(lastMethod=="bank")wa=waLink(`Hola, envío mi comprobante de aporte por Pago Móvil.\nAporte: ${n}\nMonto: ${f(amt)} USD\nBanco: ${PAGOMOVIL.banco} (${PAGOMOVIL.codigo})`);
else if(lastMethod=="crypto")wa=waLink(`Hola, envío mi comprobante de aporte en cripto (Binance).\nAporte: ${n}\nMonto: ${f(amt)} USDT\nBinance ID: ${BINANCE.id}\nCorreo: ${BINANCE.email}`);
else wa=waLink(`Hola, quiero hacer un aporte a El Morral Digital.\nAporte: ${n}\nMonto: ${f(amt)} USD`);
$("pm").innerHTML=`<h2>¡Gracias, compañero/a!</h2><p>Tu aporte <b>${f(amt)} USD</b> (ref. <b>${n}</b>) ayuda a sostener la tecnología de El Morral Digital.</p><p>Envía el comprobante para confirmarlo.</p><a class="btn wa" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${wa}" target="_blank" rel="noopener">Enviar comprobante por WhatsApp</a>${em?`<p class="note" style="margin-top:12px">Te escribiremos a <b>${em}</b>.</p>`:""}<button class="btn" style="margin-top:10px" onclick="closeAll()">Cerrar</button>`}
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
