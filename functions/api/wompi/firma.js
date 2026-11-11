/**
 * ============================================================================
 * Estrellita House — functions/api/wompi/firma.js   (POST /api/wompi/firma)
 *
 * Qué hace:
 *   Recibe el carrito (ids, medidas y cantidades) y los datos de entrega,
 *   RECALCULA el total con los precios de contenido/catalogo.json (nunca se
 *   confía en precios que lleguen del navegador), crea una referencia única,
 *   calcula la firma de integridad de Wompi con el secreto que vive SOLO en el
 *   servidor y devuelve la URL del Web Checkout de Wompi lista para abrir.
 *
 * Firma de integridad (documentación de Wompi, "Widget & Checkout Web"):
 *   SHA-256 en hexadecimal de  <Referencia><Monto en centavos><Moneda><Secreto>
 *
 * Variables de entorno (Cloudflare Pages → Settings → Environment variables):
 *   WOMPI_PUBLIC_KEY        pub_test_… (pruebas) o pub_prod_… (producción)
 *   WOMPI_INTEGRITY_SECRET  test_integrity_… o prod_integrity_…  (cifrada)
 *   Sin estas variables el endpoint responde 503 y la página ofrece WhatsApp.
 *
 * De qué depende: contenido/catalogo.json y contenido/tienda.json (CMS),
 * y js/script.js (módulo Pedido) que llama a este endpoint.
 * ============================================================================
 */

const CHECKOUT_WOMPI = 'https://checkout.wompi.co/p/';
const MONEDA = 'COP';

// Envía la dirección a Wompi para que aparezca en el panel del comercio.
// Si en pruebas el checkout de Wompi rechazara estos campos, poner en false.
const ENVIAR_DIRECCION_A_WOMPI = true;

const json = (cuerpo, estado = 200) => new Response(JSON.stringify(cuerpo), {
  status: estado,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

async function leerJSON(context, ruta) {
  const url = new URL(ruta, context.request.url);
  const r = await context.env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }));
  if (!r.ok) throw new Error(`No se pudo leer ${ruta}`);
  return r.json();
}

async function sha256Hex(texto) {
  const datos = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Referencia legible y única: EH-AAAAMMDD-HHMMSS-XXXXXX (hora de Colombia)
function crearReferencia() {
  const ahora = new Date(Date.now() - 5 * 60 * 60 * 1000);
  const dos = (n) => String(n).padStart(2, '0');
  const fecha = `${ahora.getUTCFullYear()}${dos(ahora.getUTCMonth() + 1)}${dos(ahora.getUTCDate())}`;
  const hora = `${dos(ahora.getUTCHours())}${dos(ahora.getUTCMinutes())}${dos(ahora.getUTCSeconds())}`;
  const azar = Array.from(crypto.getRandomValues(new Uint8Array(4))).map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 6).toUpperCase();
  return `EH-${fecha}-${hora}-${azar}`;
}

const texto = (v, max) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

function validarCliente(c = {}) {
  const cliente = {
    nombre: texto(c.nombre, 80),
    celular: String(c.celular ?? '').replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, ''),
    barrio: texto(c.barrio, 60),
    direccion: texto(c.direccion, 120),
    indicaciones: texto(c.indicaciones, 140),
    correo: texto(c.correo, 100)
  };
  if (cliente.nombre.length < 3) return { error: 'Falta el nombre.' };
  if (!/^3\d{9}$/.test(cliente.celular)) return { error: 'El celular no es válido.' };
  if (cliente.barrio.length < 3) return { error: 'Falta el barrio.' };
  if (cliente.direccion.length < 5) return { error: 'Falta la dirección.' };
  if (cliente.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cliente.correo)) return { error: 'El correo no es válido.' };
  return { cliente };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Configuración de Wompi
  const llavePublica = String(env.WOMPI_PUBLIC_KEY || '').trim();
  const secreto = String(env.WOMPI_INTEGRITY_SECRET || '').trim();
  if (!llavePublica || !secreto) {
    return json({ mensaje: 'El pago en línea todavía no está activo.' }, 503);
  }
  const esPrueba = llavePublica.startsWith('pub_test_');
  if ((esPrueba && !secreto.startsWith('test_integrity_')) || (!esPrueba && !secreto.startsWith('prod_integrity_'))) {
    console.error('Las llaves de Wompi no corresponden al mismo ambiente (pruebas/producción).');
    return json({ mensaje: 'El pago en línea tiene un problema de configuración.' }, 500);
  }

  // 2. Cuerpo de la petición (máx. 16 KB)
  let pedido;
  try {
    const cuerpo = await request.text();
    if (cuerpo.length > 16000) return json({ mensaje: 'El pedido es demasiado grande.' }, 413);
    pedido = JSON.parse(cuerpo);
  } catch (e) {
    return json({ mensaje: 'No entendimos el pedido.' }, 400);
  }

  // 3. Catálogo y ajustes vivos del CMS
  let catalogo; let tienda;
  try {
    [catalogo, tienda] = await Promise.all([
      leerJSON(context, '/contenido/catalogo.json'),
      leerJSON(context, '/contenido/tienda.json')
    ]);
  } catch (e) {
    return json({ mensaje: 'El catálogo no está disponible en este momento.' }, 503);
  }
  if (tienda?.pago_en_linea === false) {
    return json({ mensaje: 'El pago en línea está pausado por ahora.' }, 503);
  }

  // 4. Productos: precio y disponibilidad SIEMPRE desde el catálogo
  const visibles = new Set((tienda?.colecciones || []).filter((c) => c && c.mostrar !== false).map((c) => String(c.id)));
  const porId = new Map((catalogo?.productos || []).map((p) => [String(p.id), p]));
  const items = Array.isArray(pedido?.items) ? pedido.items : [];
  if (!items.length || items.length > 30) return json({ mensaje: 'El carrito está vacío o es demasiado grande.' }, 400);

  const agrupados = new Map();
  for (const it of items) {
    const id = String(it?.id ?? '');
    const variante = Number(it?.variante);
    const cantidad = Number(it?.cantidad);
    if (!Number.isInteger(variante) || variante < 0 || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
      return json({ mensaje: 'Hay una cantidad o medida no válida en el carrito.' }, 400);
    }
    const clave = `${id}|${variante}`;
    agrupados.set(clave, Math.min(20, (agrupados.get(clave) || 0) + cantidad));
  }

  let total = 0;
  for (const [clave, cantidad] of agrupados) {
    const [id, v] = clave.split('|');
    const p = porId.get(id);
    const variante = p && Array.isArray(p.variantes) ? p.variantes[Number(v)] : null;
    const precio = Math.round(Number(variante?.precio));
    const coleccionOk = !p?.coleccion || visibles.has(String(p.coleccion));
    if (!p || p.mostrar === false || p.agotado === true || !coleccionOk || !variante || !Number.isFinite(precio) || precio <= 0) {
      return json({ mensaje: 'Un producto del carrito ya no está disponible. Actualiza la página y revisa tu carrito.' }, 409);
    }
    total += precio * cantidad;
  }

  // Domicilio: solo se cobra en línea si la tienda definió un valor fijo
  if (tienda?.domicilio?.modo === 'fijo') {
    total += Math.max(0, Math.round(Number(tienda.domicilio.valor) || 0));
  }
  if (total <= 0) return json({ mensaje: 'El total del pedido no es válido.' }, 400);

  // 5. Datos de entrega
  const { cliente, error } = validarCliente(pedido?.cliente);
  if (error) return json({ mensaje: error }, 400);

  // 6. Referencia + firma de integridad
  const referencia = crearReferencia();
  const montoCentavos = total * 100;
  const firma = await sha256Hex(`${referencia}${montoCentavos}${MONEDA}${secreto}`);

  // 7. URL del Web Checkout de Wompi
  const origen = new URL(request.url).origin;
  const p = new URLSearchParams();
  p.set('public-key', llavePublica);
  p.set('currency', MONEDA);
  p.set('amount-in-cents', String(montoCentavos));
  p.set('reference', referencia);
  p.set('signature:integrity', firma);
  p.set('redirect-url', `${origen}/`);
  p.set('customer-data:full-name', cliente.nombre);
  p.set('customer-data:phone-number', cliente.celular);
  p.set('customer-data:phone-number-prefix', '+57');
  if (cliente.correo) p.set('customer-data:email', cliente.correo);
  if (ENVIAR_DIRECCION_A_WOMPI) {
    p.set('shipping-address:address-line-1', `${cliente.direccion}, ${cliente.barrio}`.slice(0, 120));
    if (cliente.indicaciones) p.set('shipping-address:address-line-2', cliente.indicaciones);
    p.set('shipping-address:city', 'Cartagena');
    p.set('shipping-address:region', 'Bolívar');
    p.set('shipping-address:country', 'CO');
    p.set('shipping-address:phone-number', cliente.celular);
    p.set('shipping-address:name', cliente.nombre);
  }

  return json({ url: `${CHECKOUT_WOMPI}?${p.toString()}`, referencia, total, pruebas: esPrueba });
}

