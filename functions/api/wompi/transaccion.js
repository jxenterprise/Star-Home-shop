/**
 * ============================================================================
 * Estrellita House — functions/api/wompi/transaccion.js
 * GET /api/wompi/transaccion?id=<id de transacción que Wompi pone en la URL>
 *
 * Qué hace:
 *   Consulta en la API de Wompi el estado de una transacción
 *   (GET /v1/transactions/{id}, autenticado con la llave pública) y devuelve
 *   solo lo necesario para mostrarle el resultado al comprador.
 *   Estados posibles de Wompi: APPROVED, PENDING, DECLINED, VOIDED, ERROR.
 *
 * Importante: Wompi indica que la redirección es informativa. La dueña debe
 * confirmar en su panel de Wompi que la transacción quedó APROBADA antes de
 * despachar (ver README, sección "Pagos con Wompi").
 *
 * Depende de: variable WOMPI_PUBLIC_KEY y js/script.js (módulo RetornoPago).
 * ============================================================================
 */

const API = {
  pruebas: 'https://sandbox.wompi.co/v1',
  produccion: 'https://production.wompi.co/v1'
};

const json = (cuerpo, estado = 200) => new Response(JSON.stringify(cuerpo), {
  status: estado,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[A-Za-z0-9_-]{4,80}$/.test(id)) return json({ mensaje: 'Transacción no válida.' }, 400);

  const llavePublica = String(env.WOMPI_PUBLIC_KEY || '').trim();
  if (!llavePublica) return json({ mensaje: 'El pago en línea todavía no está activo.' }, 503);
  const base = llavePublica.startsWith('pub_test_') ? API.pruebas : API.produccion;

  let respuesta;
  try {
    respuesta = await fetch(`${base}/transactions/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${llavePublica}`, Accept: 'application/json' }
    });
  } catch (e) {
    return json({ mensaje: 'No pudimos comunicarnos con Wompi.' }, 502);
  }
  if (respuesta.status === 404) return json({ mensaje: 'No encontramos esa transacción.' }, 404);
  if (!respuesta.ok) return json({ mensaje: 'Wompi no respondió como esperábamos.' }, 502);

  let datos;
  try { datos = (await respuesta.json())?.data; } catch (e) { datos = null; }
  // Solo transacciones creadas por esta tienda (referencias EH-…)
  if (!datos || typeof datos.reference !== 'string' || !datos.reference.startsWith('EH-')) {
    return json({ mensaje: 'No encontramos esa transacción.' }, 404);
  }

  return json({
    estado: String(datos.status || 'ERROR'),
    referencia: datos.reference,
    total: Math.round(Number(datos.amount_in_cents || 0) / 100),
    metodo: String(datos.payment_method_type || '')
  });
}

