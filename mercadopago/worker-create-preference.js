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
      };

      // back_urls + auto_return son opcionales para Mercado Pago, pero si se
      // envían, TIENEN que ser URLs absolutas válidas (http/https) — si no,
      // la API rechaza la preferencia entera con un 400. Por eso solo los
      // agregamos cuando el llamador realmente mandó una success_url válida.
      const isValidUrl = (u) => {
        try { const parsed = new URL(u); return parsed.protocol === "http:" || parsed.protocol === "https:"; }
        catch { return false; }
      };
      if (isValidUrl(body.success_url)) {
        preference.back_urls = {
          success: body.success_url,
          failure: isValidUrl(body.failure_url) ? body.failure_url : body.success_url,
          pending: isValidUrl(body.pending_url) ? body.pending_url : body.success_url,
        };
        preference.auto_return = "approved";
      }

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
        const reason =
          (Array.isArray(data.cause) && data.cause[0]?.description) ||
          data.message ||
          data.error ||
          "Mercado Pago rechazó la preferencia de pago.";
        return new Response(JSON.stringify({ error: reason, detail: data }), {
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
