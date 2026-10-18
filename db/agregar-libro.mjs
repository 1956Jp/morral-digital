#!/usr/bin/env node
// =====================================================================
//  EL MORRAL DIGITAL — agregar libro(s) al catálogo
// ---------------------------------------------------------------------
//  Una sola orden hace todo el papeleo de un libro:
//    · valida la corriente contra los iconos de assets/js/app.js (IC)
//    · añade la fila a assets/js/data.js  (respaldo/semilla, 9 campos)
//    · añade la fila a db/seed_books.sql  (seed de Supabase)
//    · añade la fila a books/MANIFIESTO.md y recalcula los conteos
//    · sube el ?v= de index.html (caché)
//    · imprime el INSERT/UPSERT para Supabase (lo ejecuta si defines
//      SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY en el entorno)
//
//  NO toca archivos salvo con --apply (por defecto es dry-run).
//
//  Uso (un libro):
//    node db/agregar-libro.mjs \
//      --titulo "Política" --autor "Aristóteles" --corriente "Clásico" \
//      --precio 0 --fuente "https://archive.org/details/B091965" \
//      --desc "La política como ciencia; trad. Pedro Simón Abril (†1595). Texto libre." \
//      --color "#a67c2e" --licencia "Dominio público" --anio "322 a.C." \
//      [--archivo ""] [--plazo "—"] [--nota "edición/traductor/año"] [--apply]
//
//  Uso (lote, JSON con un array de objetos con esas claves):
//    node db/agregar-libro.mjs --lote libros.json [--apply]
//
//  Libro de pago: súbelo antes al bucket privado `libros`
//  (ver db/subir_libros.sh) y pasa --archivo nombre.ext (precio > 0).
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = {
  app: path.join(ROOT, "assets/js/app.js"),
  data: path.join(ROOT, "assets/js/data.js"),
  seed: path.join(ROOT, "db/seed_books.sql"),
  manif: path.join(ROOT, "books/MANIFIESTO.md"),
  html: path.join(ROOT, "index.html"),
};

const flag = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? (d ?? "") : (process.argv[i + 1] ?? ""); };
const APPLY = process.argv.includes("--apply");
const die = m => { console.error("Error: " + m); process.exit(2); };

function corrientes() {
  const ic = fs.readFileSync(P.app, "utf8").match(/const IC=\{([\s\S]*?)\};/);
  if (!ic) die("No encuentro el mapa IC en assets/js/app.js");
  return [...ic[1].matchAll(/"([^"]+)":\s*'/g)].map(m => m[1]);
}

function booksFromArgs() {
  const lote = process.argv.indexOf("--lote");
  if (lote !== -1) {
    const p = process.argv[lote + 1];
    if (!p) die("Falta la ruta del JSON tras --lote");
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    if (!Array.isArray(raw)) die("El lote debe ser un array JSON de libros");
    return raw;
  }
  return [{
    titulo: flag("titulo"), autor: flag("autor"), corriente: flag("corriente"),
    precio: Number(flag("precio", "0")), color: flag("color", "#2f6fb0"),
    desc: flag("desc", ""), archivo: flag("archivo", ""), fuente: flag("fuente"),
    licencia: flag("licencia", "Dominio público"), anio: flag("anio", "—"), plazo: flag("plazo", "—"),
    nota: flag("nota", ""),
  }];
}

const norm = b => ({
  titulo: String(b.titulo ?? "").trim(), autor: String(b.autor ?? "").trim(),
  corriente: String(b.corriente ?? "").trim(), precio: Number(b.precio ?? 0),
  color: String(b.color ?? "#2f6fb0"), desc: String(b.desc ?? b.description ?? "").trim(),
  archivo: String(b.archivo ?? b.file ?? "").trim(), fuente: String(b.fuente ?? b.source_url ?? "").trim(),
  licencia: String(b.licencia ?? b.license ?? "Dominio público"), anio: String(b.anio ?? "—"),
  plazo: String(b.plazo ?? "—"), nota: String(b.nota ?? "").trim(),
  verificado: b.verificado || new Date().toISOString().slice(0, 10),
});

const q = v => `'${String(v).replace(/'/g, "''")}'`;
const dataRow = b => `[${[b.titulo, b.autor, b.corriente, b.precio, b.color, b.desc, b.archivo, b.fuente, b.licencia]
  .map((v, i) => (i === 3 ? String(v) : JSON.stringify(v))).join(",")}]`;
const sqlValues = (b, sort) =>
  `  (${q(b.titulo)}, ${q(b.autor)}, ${q(b.corriente)}, ${b.precio}, ${q(b.color)},\n` +
  `   ${q(b.desc)},\n   ${q(b.archivo)}, ${q(b.fuente)}, ${q(b.licencia)}, ${sort}, true)`;
const manifRow = b =>
  `| ${b.titulo} | ${b.autor} | ${b.anio} | ${b.plazo} | ${b.corriente} | ${b.archivo ? `\`${b.archivo}\`` : "— (enlace)"} | ${b.fuente.replace(/^https?:\/\//, "")}${b.nota ? " — " + b.nota : ""} | ${b.licencia} | ${b.verificado} |`;

const addToData = (s, rows) => {
  const m = s.match(/\]\s*;\s*$/);
  if (!m) die("No encuentro el cierre `];` en data.js");
  return s.slice(0, m.index) + ",\n" + rows.join(",\n") + "\n];\n";
};
const nextSort = seed => {
  const nums = [...seed.matchAll(/,\s*(\d+),\s*(?:true|false)\)/g)].map(m => +m[1]);
  return (nums.length ? Math.max(...nums) : -1) + 1;
};
const addToSeed = (s, vals) => {
  const a = "\non conflict (title) do update set";
  if (!s.includes(a)) die("No encuentro `on conflict` en seed_books.sql");
  return s.replace(a, ",\n" + vals.join(",\n") + a);
};
const addToManifiesto = (s, rows) => {
  const i = s.indexOf("\n> El catálogo publica");
  if (i === -1) die("No encuentro el bloque de conteos en MANIFIESTO.md");
  const antes = s.slice(0, i).replace(/\n+$/, "") + "\n";
  return antes + rows.join("\n") + "\n\n" + s.slice(i).replace(/^\n+/, "");
};
const bumpVersion = s => {
  const v = [...s.matchAll(/\?v=(\d+)/g)].map(m => +m[1]);
  return v.length ? s.replace(/\?v=\d+/g, `?v=${Math.max(...v) + 1}`) : s;
};
const recalcCounts = (s, dataSrc) => {
  const rows = parseB(dataSrc);
  const total = rows.length, conArchivo = rows.filter(r => r[6]).length, enlace = total - conArchivo;
  return s
    .replace(/\*\*\d+ títulos\*\*/, `**${total} títulos**`)
    .replace(/\d+ con archivo/, `${conArchivo} con archivo`)
    .replace(/y \d+ que son solo enlace/, `y ${enlace} que son solo enlace`);
};
const upsertSQL = (books, seed) => {
  const s0 = nextSort(seed);
  return `insert into public.books\n  (title, author, corriente, price, color, description, file, source_url, license, sort_order, active)\nvalues\n`
    + books.map((b, i) => sqlValues(b, s0 + i)).join(",\n")
    + `\non conflict (title) do update set\n  author = excluded.author, corriente = excluded.corriente, price = excluded.price,\n  color = excluded.color, description = excluded.description, file = excluded.file,\n  source_url = excluded.source_url, license = excluded.license,\n  sort_order = excluded.sort_order, active = excluded.active;`;
};
const parseB = dataSrc => {
  const inner = dataSrc.match(/const B=\[([\s\S]*?)\]\s*;/);
  if (!inner) die("No encuentro el array B en data.js");
  return new Function("return [" + inner[1] + "]")();
};
const existingTitles = dataSrc => parseB(dataSrc).map(r => r[0]);
const setCorrientesComment = (s, ic) => s.replace(/^\/\/ Corrientes:.*$/m, "// Corrientes: " + ic.join(", "));


(async () => {
  const ic = corrientes();
  const data0 = fs.readFileSync(P.data, "utf8");
  let books;
  try { books = booksFromArgs().map(norm); } catch (e) { die("JSON inválido: " + e.message); }

  const existentes = new Set(existingTitles(data0));
  const vistos = new Set();
  for (const b of books) {
    for (const k of ["titulo", "autor", "corriente", "fuente"]) if (!b[k]) die(`Falta \`${k}\` en ${JSON.stringify({ titulo: b.titulo })}`);
    if (b.precio < 0 || Number.isNaN(b.precio)) die(`Precio inválido en "${b.titulo}"`);
    if (!ic.includes(b.corriente)) die(`Corriente "${b.corriente}" no está en IC de app.js. Añade el SVG del icono primero. Iconos: ${ic.join(", ")}`);
    if (existentes.has(b.titulo)) die(`Ya existe en data.js: "${b.titulo}" (no se duplica).`);
    if (vistos.has(b.titulo)) die(`Título repetido en el lote: "${b.titulo}".`);
    vistos.add(b.titulo);
    if (b.precio > 0 && !b.archivo) console.warn(`⚠ "${b.titulo}": precio > 0 sin archivo (súbelo al bucket privado y pasa --archivo).`);
  }

  const data = setCorrientesComment(addToData(data0, books.map(dataRow)), ic);
  const seed0 = fs.readFileSync(P.seed, "utf8");
  const s0 = nextSort(seed0);
  const seed = addToSeed(seed0, books.map((b, i) => sqlValues(b, s0 + i)));
  const manif = recalcCounts(addToManifiesto(fs.readFileSync(P.manif, "utf8"), books.map(manifRow)), data);
  const html = bumpVersion(fs.readFileSync(P.html, "utf8"));
  const sql = upsertSQL(books, seed0);

  console.log(`Libro(s): ${books.map(b => `${b.titulo} [${b.corriente}] ${b.precio ? "$" + b.precio : "gratis"}`).join(" | ")}`);
  console.log(`Corrientes con icono: ${ic.join(", ")}`);
  console.log("\n--- data.js (fila nueva) ---\n" + books.map(dataRow).join("\n"));
  console.log("\n--- MANIFIESTO.md (fila nueva) ---\n" + books.map(manifRow).join("\n"));
  console.log("\n--- index.html --- " + (html.match(/\?v=\d+/)?.[0] || "?v= n/a"));
  console.log("\n--- SQL Supabase ---\n" + sql);

  if (!APPLY) { console.log("\n(dry-run) Añade --apply para escribir data.js, seed_books.sql, MANIFIESTO.md e index.html."); return; }

  fs.writeFileSync(P.data, data); fs.writeFileSync(P.seed, seed);
  fs.writeFileSync(P.manif, manif); fs.writeFileSync(P.html, html);
  console.log("\n✔ Escrito: assets/js/data.js, db/seed_books.sql, books/MANIFIESTO.md, index.html");

  const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (SB_URL && KEY) {
    const rows = books.map((b, i) => ({ title: b.titulo, author: b.autor, corriente: b.corriente, price: b.precio, color: b.color, description: b.desc, file: b.archivo, source_url: b.fuente, license: b.licencia, sort_order: s0 + i, active: true }));
    const r = await fetch(`${SB_URL}/rest/v1/books?on_conflict=title`, { method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) }).catch(() => null);
    console.log(r && r.ok ? "→ Supabase: aplicado (upsert en `books`)." : `→ Supabase: fallo${r ? " (" + r.status + ")" : ""}; pega el SQL de arriba en el SQL Editor.`);
  } else {
    console.log("(i) Pega el SQL de arriba en Supabase → SQL Editor. (O define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para autoaplicarlo.)");
  }
})();
