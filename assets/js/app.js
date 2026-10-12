const IC={
"Bolivariano":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><path d="M26 6l4-3 4 3v32h-8z"/><rect x="18" y="38" width="24" height="5" rx="2"/><rect x="28" y="43" width="4" height="12"/><circle cx="30" cy="57" r="3"/><path d="M50 8l2.4 5 5.6.8-4 4 1 5.4-5-2.7-5 2.7 1-5.4-4-4 5.6-.8z"/></svg>',
"Antiimperialista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><rect x="19" y="26" width="28" height="22" rx="6"/><rect x="19" y="14" width="6.5" height="16" rx="3.2"/><rect x="26.5" y="10" width="6.5" height="19" rx="3.2"/><rect x="34" y="11" width="6.5" height="18" rx="3.2"/><rect x="41" y="15" width="6.5" height="15" rx="3.2"/><rect x="23" y="49" width="20" height="9" rx="2"/></svg>',
"Latinoamericano":'<svg class="ic" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><circle cx="32" cy="32" r="10" fill="currentColor"/><path d="M32 6v10M32 48v10M6 32h10M48 32h10M13.6 13.6l7 7M43.4 43.4l7 7M13.6 50.4l7-7M43.4 20.6l7-7"/></svg>',
"Martiano":'<svg class="ic" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M32 20c-5-5-13-8-22-7v30c9-1 17 2 22 7z"/><path d="M32 20c5-5 13-8 22-7v30c-9-1-17 2-22 7z"/><path d="M32 20v30"/></svg>',
"Zapatista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><path d="M32 12c7 0 12 8 13 18l1 5H18l1-5c1-10 6-18 13-18z"/><rect x="17" y="31" width="30" height="6" rx="3"/><ellipse cx="32" cy="42" rx="27" ry="7"/></svg>',
"Marxista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><rect x="28" y="24" width="8" height="34" rx="4"/><rect x="14" y="8" width="36" height="17" rx="4"/><path d="M50 40l10 10-7 7-10-10z"/></svg>'};
const PAYPAL_USER="morraldigital";
const ZINLI_USER="";
const paypalLink=a=>`https://paypal.me/${PAYPAL_USER}/${a.toFixed(2)}USD`;
// Pago Móvil (manual, sin backend): datos del cobro y destino del comprobante
const PAGOMOVIL={banco:"Banco Digital de los Trabajadores",codigo:"0175",telefono:"04268901582",cedula:"V-5249473",titular:"Jose de Los Santos Perez Lopez"};
const WHATSAPP="584268901582"; // internacional, sin el 0 inicial
const VES_RATE=0;              // respaldo si fallan las APIs de tasa (0 = sin respaldo)
const QR_PM="assets/img/pagomovil-qr.png"; // QR opcional del banco
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
function draw(){const cs=["Todos",...new Set(B.map(b=>b[2]))];
$("filters").innerHTML=cs.map(c=>`<button class="chip ${c==cat?"on":""}" onclick="cat='${c}';draw()">${c}</button>`).join("");
$("grid").innerHTML=B.map((b,i)=>({b,i})).filter(o=>cat=="Todos"||o.b[2]==cat).map(({b,i})=>`<div class="book"><div class="cover" style="--c:${b[4]};border-top:5px solid ${b[4]};background:linear-gradient(150deg,${b[4]}1f,${b[4]}4d)">${IC[b[2]]}<span class="cb">${b[2]}</span><b>${b[0]}</b><small>${b[1]}</small></div><div class="bb"><span class="tag">★ ${b[8]||"Dominio público"} · ${b[2]}</span><p>${b[5]}</p><div class="row"><span class="price">${b[3]?f(b[3]):"Gratis"}</span>${b[3]?`<button class="btn" onclick="add(${i})">Al morral</button>`:`<a class="btn" href="${b[7]}" target="_blank" rel="noopener">Leer gratis</a>`}</div></div></div>`).join("")}
function add(i){if(!B[i][3]||cart.includes(i))return;cart.push(i);upd();openCart()}
function rm(i){cart=cart.filter(x=>x!=i);upd()}
const total=()=>cart.reduce((s,i)=>s+B[i][3],0);
function upd(){$("cnt").textContent=cart.length;$("items").innerHTML=cart.length?cart.map(i=>`<div class="item"><span>${B[i][0]}</span><span>${f(B[i][3])} <a href="#" onclick="rm(${i});return false">✕</a></span></div>`).join(""):"<p class='sub'>Tu morral está vacío.</p>";$("tot").textContent=f(total())}
function openCart(){closeAll();$("cart").classList.add("show")}
function closeAll(){["cart","pay"].forEach(x=>$(x).classList.remove("show"))}
function checkout(){if(!cart.length)return;orderCode=newOrder();closeAll();$("pay").classList.add("show");method("card")}
function method(m){lastMethod=m;const t={card:"Tarjeta",zinli:"Zinli",paypal:"PayPal",bank:"Pago Móvil",crypto:"Cripto"};
const form={card:`<input placeholder="Nombre en la tarjeta"><input placeholder="Número de tarjeta" inputmode="numeric"><div class="row" style="gap:8px"><input placeholder="MM/AA"><input placeholder="CVC"></div>`,
zinli:`<p>Paga con tu tarjeta virtual Zinli (prepaga, en $USD).</p><input placeholder="Nombre en la tarjeta"><input placeholder="Número de la tarjeta Zinli" inputmode="numeric"><div class="row" style="gap:8px"><input placeholder="MM/AA"><input placeholder="CVC"></div><p class="note">Recibe con tu Zinli desde la app: añade una tarjeta y transfiere el importe al número de «Pide y Recibe»${ZINLI_USER?` (${ZINLI_USER})`:""}.</p>`,
paypal:`<p>Serás redirigido a PayPal para completar el pago.</p><a class="btn alt" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${paypalLink(total())}" target="_blank" rel="noopener">Pagar ${f(total())} con PayPal</a><p class="note">Al volver de PayPal, pulsa «Ya pagué» para ver tus descargas.</p>`,bank:`<p>Pago Móvil a <b>${PAGOMOVIL.banco}</b> (código ${PAGOMOVIL.codigo}).</p>
<div class="pm-data">
<div class="pm-row"><span>Teléfono</span><b>${PAGOMOVIL.telefono}</b><button type="button" class="btn ghost cpy" onclick="copyText('${PAGOMOVIL.telefono}')">Copiar</button></div>
<div class="pm-row"><span>Cédula</span><b>${PAGOMOVIL.cedula}</b><button type="button" class="btn ghost cpy" onclick="copyText('${PAGOMOVIL.cedula}')">Copiar</button></div>
<div class="pm-row"><span>Titular</span><b>${PAGOMOVIL.titular}</b><button type="button" class="btn ghost cpy" onclick="copyText('${PAGOMOVIL.titular}')">Copiar</button></div>
<div class="pm-row"><span>Monto</span><b id="pm-bs">Calculando…</b><button type="button" class="btn ghost cpy" onclick="copyText(document.getElementById('pm-bs').textContent)">Copiar</button></div>
<div class="pm-row"><span>Concepto</span><b>${orderCode}</b><button type="button" class="btn ghost cpy" onclick="copyText('${orderCode}')">Copiar</button></div>
</div>
<p class="note" id="pm-rate">Consultando la tasa BCV…</p>
<img class="pm-qr" src="${QR_PM}" alt="QR de Pago Móvil" onerror="this.remove()">`,crypto:`<p>Paga en USDT o BTC. Se generará una dirección de pago única.</p>`}[m];
$("pm").innerHTML=`<h2>Pagar ${f(total())}</h2><div class="tabs">${Object.keys(t).map(k=>`<button class="chip ${k==m?"on":""}" onclick="method('${k}')">${t[k]}</button>`).join("")}</div>
<input type="email" id="em" placeholder="Correo para recibir tus libros" required>${form}
<button class="btn alt" style="width:100%" onclick="done()">${m=="bank"?"Ya pagué, enviar comprobante":(m=="paypal"||m=="zinli"?"Ya pagué, mostrar descargas":"Confirmar pago")}</button>
${m=="bank"?`<a class="btn wa" id="pm-wa" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box;margin-top:10px" href="${waLink("Hola, quiero pagar el pedido "+orderCode)}" target="_blank" rel="noopener">Enviar comprobante por WhatsApp</a><p class="note" style="margin-top:12px">Pago móvil manual: tu pedido queda <b>pendiente de verificación</b> hasta confirmar el comprobante.</p>`:`<p class="note" style="margin-top:12px">Modo demostración: no se procesa ningún cobro real. El pago con PayPal abre paypal.me/${PAYPAL_USER}; para entregar los archivos solo tras el cobro hace falta un servidor propio (webhook).</p>`}`;
if(m=="bank")fillBank()}
function done(){if(!$("em").value.includes("@")){$("em").focus();return}
const n=orderCode||newOrder(),em=esc($("em").value);
if(lastMethod=="bank"){
const wa=waLink(`Hola, pagué por Pago Móvil.\nPedido: ${n}\nLibros: ${cart.map(i=>B[i][0]).join(", ")}\nTotal: ${f(total())}\nBanco: ${PAGOMOVIL.banco} (${PAGOMOVIL.codigo})`);
$("pm").innerHTML=`<h2>Pedido registrado</h2><p>Gracias, compañero/a. Tu pedido <b>${n}</b> quedó <b>pendiente de verificación</b>.</p><p>Envía el comprobante del Pago Móvil y confirmaremos tu pago antes de liberar las descargas.</p><a class="btn wa" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${wa}" target="_blank" rel="noopener">Enviar comprobante por WhatsApp</a><p class="note" style="margin-top:12px">Te contactaremos en <b>${em}</b>. Guarda tu código de pedido: <b>${n}</b>.</p><button class="btn" style="margin-top:10px" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`;
return}
const d=cart.map(i=>B[i][6]?`<div class="item"><a href="books/${B[i][6]}" download>${B[i][0]}</a></div>`:`<div class="item"><span>${B[i][0]}</span><small> en preparación</small></div>`).join("");
$("pm").innerHTML=`<h2>¡Gracias, compañero/a!</h2><p>Pedido <b>${n}</b> confirmado. Enviaremos tus libros a <b>${em}</b>.</p>${lastMethod=="paypal"?`<p class="note">El pago con PayPal no se verifica automáticamente en un sitio estático; si hubo algún problema, escríbenos.</p>`:lastMethod=="zinli"?`<p class="note">El pago con Zinli es una demo: recibe el importe por «Pide y Recibe» y confirma aquí el pedido. El archivo queda descargable igualmente.</p>`:""}${d?`<p class="sub">Tus descargas:</p>${d}`:""}<button class="btn" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`}
function addRev(e){e.preventDefault();const s=+$("rs").value;
const d=document.createElement("div");d.className="q";d.innerHTML=`<span class="stars">${"★".repeat(s)}${"☆".repeat(5-s)}</span><br>`;
const p=document.createElement("span");p.textContent=`“${$("rt").value}” — ${$("rn").value}`;d.appendChild(p);
document.querySelector(".rev").prepend(d);e.target.reset()}
draw();upd();
