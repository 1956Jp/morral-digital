// =====================================================================
//  EL MORRAL DIGITAL — Edge Function `entregar` (Fase 2)
//  ---------------------------------------------------------------------
//  Entrega protegida de los libros de pago. Los archivos viven en el
//  bucket PRIVADO `libros` de Supabase Storage (ya no en books/, que es
//  público en el repo). Esta función:
//    1. Recibe { order_code, email } (POST JSON).
//    2. Busca el pedido con la service_role y comprueba que el correo
//       coincida (evita enumerar códigos ajenos).
//    3. Si el pedido está `paid`, firma URLs temporales (~1 h) de sus
//       archivos; si no, no entrega nada.
//  Desplegar con la CLI:
//    supabase functions deploy entregar
//  (Deno; usa la service_role que Supabase inyecta como variable de
//  entorno: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let payload: { order_code?: string; email?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  const code = String(payload.order_code || "").trim().toUpperCase();
  const email = String(payload.email || "").trim().toLowerCase();
  if (!code || !email) return json({ error: "missing_fields" }, 400);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: order, error } = await supabase
    .from("orders")
    .select("id,status,customer_email,order_items(book_title,quantity)")
    .eq("order_code", code)
    .maybeSingle();

  if (error) return json({ error: "lookup_failed" }, 500);
  if (!order) return json({ error: "not_found" }, 404);
  if (String(order.customer_email || "").toLowerCase() !== email) {
    return json({ error: "forbidden" }, 403);
  }

  // Pago aún no verificado: no se entrega nada (ni se revela el contenido).
  if (order.status !== "paid") return json({ status: order.status, links: [] });

  const items = (order as any).order_items || [];
  const titles: string[] = items.map((i: any) => i.book_title);

  const { data: books, error: berr } = await supabase
    .from("books")
    .select("title,file,source_url")
    .in("title", titles);
  if (berr) return json({ error: "books_failed" }, 500);

  const byTitle = new Map<string, any>((books || []).map((b: any) => [b.title, b]));

  const links: any[] = [];
  for (const t of titles) {
    const b = byTitle.get(t);
    if (b && b.file) {
      const { data: signed, error: serr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(b.file, EXPIRES, { download: b.file });
      if (!serr && signed?.signedUrl) links.push({ title: t, url: signed.signedUrl, kind: "file" });
      else links.push({ title: t, url: "", kind: "none" });
    } else if (b && b.source_url) {
      links.push({ title: t, url: b.source_url, kind: "external" });
    } else {
      links.push({ title: t, url: "", kind: "none" });
    }
  }

  return json({ status: "paid", expires_in: EXPIRES, links });
});
