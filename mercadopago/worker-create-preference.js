/**
 * AKARI Electro & Home — Cloudflare Worker
 * Crea una preferencia de pago en Mercado Pago y devuelve el init_point.
 *
 * El Access Token de Mercado Pago se guarda como *secret* del Worker
 * (variable de entorno MP_ACCESS_TOKEN), nunca en el front.
 *
 * Deploy:
 *   npm i -g wrangler
 *   wrangler login
 *   wrangler secret put MP_ACCESS_TOKEN   (pegar el Access Token de MP)
 *   wrangler deploy
 *
 * La URL resultante (https://<worker>.workers.dev) se pega en:
 *   Admin → Pagos → URL del Worker
 */

const ALLOWED_ORIGIN = "*"; // reemplazar por tu dominio en producción, ej: "https://www.akarielectrohome.com"

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
      const items = Array.isArray(body.items) ? body.items : [];
      const orderRef = body.order_ref || `AK-${Date.now()}`;

      if (!items.length) {
        return new Response(JSON.stringify({ error: "Carrito vacío" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const preference = {
        items: items.map((i) => ({
          title: String(i.title || "Producto").slice(0, 120),
          quantity: Number(i.quantity || 1),
          unit_price: Number(i.unit_price || 0),
          currency_id: "ARS",
        })),
        external_reference: orderRef,
        back_urls: {
          success: body.success_url || "",
          failure: body.failure_url || "",
          pending: body.pending_url || "",
        },
        auto_return: "approved",
      };

      const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preference),
      });

      const data = await mpRes.json();

      if (!mpRes.ok) {
        return new Response(JSON.stringify({ error: "Error de Mercado Pago", detail: data }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(
        JSON.stringify({
          init_point: data.init_point,
          sandbox_init_point: data.sandbox_init_point,
          preference_id: data.id,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: "Error interno", detail: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
