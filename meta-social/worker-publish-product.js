/**
 * AKARI Electro & Home — Worker de publicación automática
 * Cuando se carga un producto nuevo en el admin, este Worker lo publica
 * en la página de Facebook y en la cuenta de Instagram vinculada.
 *
 * Requiere 3 secrets (nunca van en el front, solo acá):
 *   - META_ACCESS_TOKEN     Token de acceso de la Página (o de sistema)
 *   - FB_PAGE_ID            ID numérico de tu página de Facebook
 *   - IG_BUSINESS_ID        ID de tu cuenta de Instagram profesional
 *
 * Deploy:
 *   npm i -g wrangler
 *   wrangler login
 *   cd meta-social
 *   wrangler secret put META_ACCESS_TOKEN
 *   wrangler secret put FB_PAGE_ID
 *   wrangler secret put IG_BUSINESS_ID
 *   wrangler deploy
 *
 * La URL resultante se pega en:
 *   Admin → Tienda → Redes sociales → "Worker de publicación automática"
 */

const GRAPH_VERSION = "v21.0";
const ALLOWED_ORIGIN = "*"; // reemplazar por tu dominio real en producción

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método no permitido" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    try {
      const body = await request.json();
      const { title, price, image_url, product_url, category } = body;

      if (!title || !image_url) {
        return new Response(JSON.stringify({ error: "Falta título o imagen del producto" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const priceText = price ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(price) : "";
      const caption = [
        `🆕 ${title}`,
        priceText ? `💰 ${priceText}` : null,
        category ? `📦 ${category}` : null,
        product_url ? `👉 ${product_url}` : null,
        "#AKARI #ElectroYHome",
      ].filter(Boolean).join("\n");

      const results = { facebook: null, instagram: null };

      // ---------- Facebook: publicar foto con caption en la Página ----------
      try {
        const fbRes = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/${env.FB_PAGE_ID}/photos`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: image_url,
              caption,
              access_token: env.META_ACCESS_TOKEN,
            }),
          }
        );
        const fbData = await fbRes.json();
        results.facebook = fbRes.ok ? { ok: true, post_id: fbData.post_id || fbData.id } : { ok: false, error: fbData.error?.message || "Error desconocido" };
      } catch (e) {
        results.facebook = { ok: false, error: String(e) };
      }

      // ---------- Instagram: crear contenedor de media y publicarlo ----------
      try {
        const createRes = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/${env.IG_BUSINESS_ID}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url,
              caption,
              access_token: env.META_ACCESS_TOKEN,
            }),
          }
        );
        const createData = await createRes.json();
        if (!createRes.ok || !createData.id) {
          results.instagram = { ok: false, error: createData.error?.message || "No se pudo crear el contenedor de media" };
        } else {
          const publishRes = await fetch(
            `https://graph.facebook.com/${GRAPH_VERSION}/${env.IG_BUSINESS_ID}/media_publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creation_id: createData.id,
                access_token: env.META_ACCESS_TOKEN,
              }),
            }
          );
          const publishData = await publishRes.json();
          results.instagram = publishRes.ok
            ? { ok: true, post_id: publishData.id }
            : { ok: false, error: publishData.error?.message || "No se pudo publicar" };
        }
      } catch (e) {
        results.instagram = { ok: false, error: String(e) };
      }

      const anyOk = results.facebook?.ok || results.instagram?.ok;
      return new Response(JSON.stringify({ success: anyOk, results }), {
        status: anyOk ? 200 : 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Error interno", detail: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
