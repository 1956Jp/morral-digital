const IC={
"Bolivariano":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><path d="M26 6l4-3 4 3v32h-8z"/><rect x="18" y="38" width="24" height="5" rx="2"/><rect x="28" y="43" width="4" height="12"/><circle cx="30" cy="57" r="3"/><path d="M50 8l2.4 5 5.6.8-4 4 1 5.4-5-2.7-5 2.7 1-5.4-4-4 5.6-.8z"/></svg>',
"Antiimperialista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><rect x="19" y="26" width="28" height="22" rx="6"/><rect x="19" y="14" width="6.5" height="16" rx="3.2"/><rect x="26.5" y="10" width="6.5" height="19" rx="3.2"/><rect x="34" y="11" width="6.5" height="18" rx="3.2"/><rect x="41" y="15" width="6.5" height="15" rx="3.2"/><rect x="23" y="49" width="20" height="9" rx="2"/></svg>',
"Latinoamericano":'<svg class="ic" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><circle cx="32" cy="32" r="10" fill="currentColor"/><path d="M32 6v10M32 48v10M6 32h10M48 32h10M13.6 13.6l7 7M43.4 43.4l7 7M13.6 50.4l7-7M43.4 20.6l7-7"/></svg>',
"Martiano":'<svg class="ic" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M32 20c-5-5-13-8-22-7v30c9-1 17 2 22 7z"/><path d="M32 20c5-5 13-8 22-7v30c-9-1-17 2-22 7z"/><path d="M32 20v30"/></svg>',
"Zapatista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><path d="M32 12c7 0 12 8 13 18l1 5H18l1-5c1-10 6-18 13-18z"/><rect x="17" y="31" width="30" height="6" rx="3"/><ellipse cx="32" cy="42" rx="27" ry="7"/></svg>',
"Marxista":'<svg class="ic" viewBox="0 0 64 64" fill="currentColor"><rect x="28" y="24" width="8" height="34" rx="4"/><rect x="14" y="8" width="36" height="17" rx="4"/><path d="M50 40l10 10-7 7-10-10z"/></svg>'};
const PAYPAL_USER="morraldigital";
const paypalLink=a=>`https://paypal.me/${PAYPAL_USER}/${a.toFixed(2)}USD`;
let cart=[],cat="Todos",lastMethod="card";
const $=i=>document.getElementById(i),f=n=>"$"+n.toFixed(2);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function draw(){const cs=["Todos",...new Set(B.map(b=>b[2]))];
$("filters").innerHTML=cs.map(c=>`<button class="chip ${c==cat?"on":""}" onclick="cat='${c}';draw()">${c}</button>`).join("");
$("grid").innerHTML=B.map((b,i)=>({b,i})).filter(o=>cat=="Todos"||o.b[2]==cat).map(({b,i})=>`<div class="book"><div class="cover" style="--c:${b[4]};border-top:5px solid ${b[4]};background:linear-gradient(150deg,${b[4]}1f,${b[4]}4d)">${IC[b[2]]}<span class="cb">${b[2]}</span><b>${b[0]}</b><small>${b[1]}</small></div><div class="bb"><span class="tag">★ ${b[8]||"Dominio público"} · ${b[2]}</span><p>${b[5]}</p><div class="row"><span class="price">${b[3]?f(b[3]):"Gratis"}</span>${b[3]?`<button class="btn" onclick="add(${i})">Al morral</button>`:`<a class="btn" href="${b[7]}" target="_blank" rel="noopener">Leer gratis</a>`}</div></div></div>`).join("")}
function add(i){if(!B[i][3]||cart.includes(i))return;cart.push(i);upd();openCart()}
function rm(i){cart=cart.filter(x=>x!=i);upd()}
const total=()=>cart.reduce((s,i)=>s+B[i][3],0);
function upd(){$("cnt").textContent=cart.length;$("items").innerHTML=cart.length?cart.map(i=>`<div class="item"><span>${B[i][0]}</span><span>${f(B[i][3])} <a href="#" onclick="rm(${i});return false">✕</a></span></div>`).join(""):"<p class='sub'>Tu morral está vacío.</p>";$("tot").textContent=f(total())}
function openCart(){closeAll();$("cart").classList.add("show")}
function closeAll(){["cart","pay"].forEach(x=>$(x).classList.remove("show"))}
function checkout(){if(!cart.length)return;closeAll();$("pay").classList.add("show");method("card")}
function method(m){lastMethod=m;const t={card:"Tarjeta",paypal:"PayPal",bank:"Transferencia / Pago móvil",crypto:"Cripto"};
const form={card:`<input placeholder="Nombre en la tarjeta"><input placeholder="Número de tarjeta" inputmode="numeric"><div class="row" style="gap:8px"><input placeholder="MM/AA"><input placeholder="CVC"></div>`,
paypal:`<p>Serás redirigido a PayPal para completar el pago.</p><a class="btn alt" style="display:block;width:100%;text-align:center;text-decoration:none;box-sizing:border-box" href="${paypalLink(total())}" target="_blank" rel="noopener">Pagar ${f(total())} con PayPal</a><p class="note">Al volver de PayPal, pulsa «Ya pagué» para ver tus descargas.</p>`,bank:`<p>Te mostraremos los datos bancarios y el código de referencia de tu pedido.</p>`,crypto:`<p>Paga en USDT o BTC. Se generará una dirección de pago única.</p>`}[m];
$("pm").innerHTML=`<h2>Pagar ${f(total())}</h2><div class="tabs">${Object.keys(t).map(k=>`<button class="chip ${k==m?"on":""}" onclick="method('${k}')">${t[k]}</button>`).join("")}</div>
<input type="email" id="em" placeholder="Correo para recibir tus libros" required>${form}
<button class="btn alt" style="width:100%" onclick="done()">${m=="paypal"?"Ya pagué, mostrar descargas":"Confirmar pago"}</button>
<p class="note" style="margin-top:12px">Modo demostración: no se procesa ningún cobro real. El pago con PayPal abre paypal.me/${PAYPAL_USER}; para entregar los archivos solo tras el cobro hace falta un servidor propio (webhook).</p>`}
function done(){if(!$("em").value.includes("@")){$("em").focus();return}
const n="MD-"+Math.random().toString(36).slice(2,8).toUpperCase();
const d=cart.map(i=>B[i][6]?`<div class="item"><a href="books/${B[i][6]}" download>${B[i][0]}</a></div>`:`<div class="item"><span>${B[i][0]}</span><small> en preparación</small></div>`).join("");
$("pm").innerHTML=`<h2>¡Gracias, compañero/a!</h2><p>Pedido <b>${n}</b> confirmado. Enviaremos tus libros a <b>${esc($("em").value)}</b>.</p>${lastMethod=="paypal"?`<p class="note">El pago con PayPal no se verifica automáticamente en un sitio estático; si hubo algún problema, escríbenos.</p>`:""}${d?`<p class="sub">Tus descargas:</p>${d}`:""}<button class="btn" onclick="cart=[];upd();closeAll()">Seguir leyendo</button>`}
function addRev(e){e.preventDefault();const s=+$("rs").value;
const d=document.createElement("div");d.className="q";d.innerHTML=`<span class="stars">${"★".repeat(s)}${"☆".repeat(5-s)}</span><br>`;
const p=document.createElement("span");p.textContent=`“${$("rt").value}” — ${$("rn").value}`;d.appendChild(p);
document.querySelector(".rev").prepend(d);e.target.reset()}
draw();upd();
