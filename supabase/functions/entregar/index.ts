// =====================================================================
//  EL MORRAL DIGITAL — Edge Function `entregar` (descarga libre)
//  ---------------------------------------------------------------------
//  El catálogo es 100 % gratuito (obras de dominio público). Los archivos
//  viven en el bucket PRIVADO `libros` de Supabase Storage y se entregan
//  con URLs firmadas temporales (~1 h). Ya NO se exige pedido ni pago:
//  esta función solo firma el objeto solicitado.
//    - Recibe { archivo } o { archivos: [...] } (POST JSON).
//    - Valida que el nombre sea simple (sin rutas) y exista en el bucket.
//    - Devuelve { url, expires_in } o { links:[{archivo,url}] }.
//  Desplegar con la CLI:
//    supabase functions deploy entregar
//  (Deno; usa la service_role que Supabase inyecta como variable de
//  entorno: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY. La service_role
//  NUNCA llega al navegador.)
// =====================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BUCKET = "libros";
const EXPIRES = 3600; // segundos de validez de cada enlace firmado

// Nombre de objeto simple: sin barras, sin "../", sin caracteres raros.
const safeName = (s: unknown) => {
  const n = String(s || "").trim();
  return /^[A-Za-z0-9._-]+$/.test(n) ? n : "";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let payload: { archivo?: string; archivos?: string[] };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  const pedidos = Array.isArray(payload.archivos) && payload.archivos.length
    ? payload.archivos.map(safeName).filter(Boolean)
    : [safeName(payload.archivo)].filter(Boolean);

  if (!pedidos.length) return json({ error: "missing_fields" }, 400);
  if (pedidos.length > 20) return json({ error: "too_many" }, 400);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const links: { archivo: string; url: string }[] = [];
  for (const archivo of pedidos) {
    const { data: signed, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(archivo, EXPIRES, { download: archivo });
    if (!error && signed?.signedUrl) links.push({ archivo, url: signed.signedUrl });
  }

  if (!links.length) return json({ error: "not_found" }, 404);
  if (links.length === 1) return json({ url: links[0].url, expires_in: EXPIRES });
  return json({ expires_in: EXPIRES, links });
});
