/**
 * ============================================================================
 * Estrellita House — functions/index.js
 * Cloudflare Pages Function que atiende SOLO la ruta "/" (la página principal).
 *
 * Qué hace:
 *   Toma el index.html estático y, antes de enviarlo al navegador, le inyecta
 *   el catálogo VIVO que la dueña edita desde el administrador (/admin):
 *     - contenido/catalogo.json  → productos, precios, fotos, medidas
 *     - contenido/tienda.json    → colecciones, textos de portada, aviso
 *                                  y modo muestra
 *   Así los productos quedan escritos en el HTML real (view-source), que es
 *   lo que leen Google y los bots de IA, sin build step ni frameworks.
 *
 * De qué depende:
 *   - index.html: elementos con id portada-titulo, portada-subtitulo,
 *     aviso-tienda, catalogo-pestanas, coleccion-desc, catalogo-grid,
 *     catalogo-datos, jsonld-productos y meta[name=robots].
 *   - js/script.js lee #catalogo-datos para el carrito.
 *   Desde v1.3 (11 nov 2026) no hay pago en línea ni domicilios: el pedido
 *   y su total se envían por WhatsApp (ver js/script.js → Pedido).
 *
 * Si algo falla (JSON roto, archivo faltante), devuelve el index.html tal cual
 * (que ya trae una copia del catálogo), así la página NUNCA se cae.
 *
 * Las funciones de render (export) también las usa la herramienta interna con
 * la que se genera esa copia estática, para que ambas versiones sean idénticas.
 * ============================================================================
 */

// ⚠ URL oficial del sitio. Se repite en index.html (canonical, og, JSON-LD),
// sitemap.xml, robots.txt y llms.txt. Si cambia el dominio, cambiarla en TODOS.
export const SITIO_URL = 'https://star-home-shop.pages.dev'; // {POR CONFIRMAR} dominio final

const ROBOTS_INDEXAR = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
const ROBOTS_MUESTRA = 'noindex, nofollow';
const TEXTO_MUESTRA = 'Catálogo de muestra: pronto subimos los productos y precios reales.';

/* ---------------------------------------------------------------------------
   Utilidades: escape de HTML (todo lo que viene del CMS se escapa SIEMPRE,
   aunque lo escriba la dueña) y formato de pesos colombianos.
--------------------------------------------------------------------------- */
export function escaparHTML(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatoCOP(numero) {
  const n = Math.round(Number(numero) || 0);
  return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Ruta de imagen del CMS ("/img/productos/x.webp") → relativa ("img/productos/x.webp")
function rutaRelativa(ruta) {
  return String(ruta || '').replace(/^\/+/, '');
}

/* ---------------------------------------------------------------------------
   normalizarDatos: limpia y valida lo que llega del CMS.
   - Descarta productos ocultos (mostrar: false) o sin variantes válidas.
   - Solo deja colecciones visibles.
   - Devuelve todo listo para pintar.
--------------------------------------------------------------------------- */
export function normalizarDatos(catalogo, tienda) {
  const colecciones = (Array.isArray(tienda?.colecciones) ? tienda.colecciones : [])
    .filter((c) => c && c.id && c.mostrar !== false)
    .map((c) => ({ id: String(c.id), nombre: String(c.nombre || c.id), descripcion: String(c.descripcion || '') }));
  const idsColecciones = new Set(colecciones.map((c) => c.id));

  const productos = (Array.isArray(catalogo?.productos) ? catalogo.productos : [])
    .filter((p) => p && p.id && p.nombre && p.mostrar !== false)
    .map((p) => ({
      id: String(p.id).replace(/[^A-Za-z0-9_-]/g, '-'),
      nombre: String(p.nombre),
      coleccion: String(p.coleccion || ''),
      categoria: String(p.categoria || ''),
      descripcion: String(p.descripcion || ''),
      imagen: rutaRelativa(p.imagen),
      alt: String(p.alt || p.nombre),
      etiqueta: String(p.etiqueta || ''),
      agotado: p.agotado === true,
      variantes: (Array.isArray(p.variantes) ? p.variantes : [])
        .map((v) => ({ nombre: String(v?.nombre || ''), precio: Math.round(Number(v?.precio)) }))
        .filter((v) => v.nombre && Number.isFinite(v.precio) && v.precio > 0)
    }))
    .filter((p) => p.variantes.length > 0)
    // un producto cuya colección se ocultó tampoco se muestra
    .filter((p) => !p.coleccion || idsColecciones.has(p.coleccion));

  const inicialPedida = String(tienda?.coleccion_inicial || '');
  const coleccionInicial = colecciones.some((c) => c.id === inicialPedida && productos.some((p) => p.coleccion === c.id))
    ? inicialPedida
    : (colecciones.find((c) => productos.some((p) => p.coleccion === c.id))?.id || 'todas');

  return {
    modoMuestra: tienda?.modo_muestra !== false,
    aviso: {
      mostrar: tienda?.aviso?.mostrar === true,
      texto: String(tienda?.aviso?.texto || '')
    },
    portada: {
      titulo: String(tienda?.portada?.titulo || ''),
      subtitulo: String(tienda?.portada?.subtitulo || '')
    },
    colecciones,
    coleccionInicial,
    productos
  };
}

/* ---------------------------------------------------------------------------
   renderTarjetas: HTML de las tarjetas de producto del catálogo.
   Cada tarjeta lleva data-coleccion para que el CSS/JS filtre por pestaña.
--------------------------------------------------------------------------- */
export function renderTarjetas(datos) {
  if (!datos.productos.length) {
    return '<p class="catalogo__vacio">Estamos preparando la próxima colección. Escríbenos por WhatsApp y te contamos qué hay disponible.</p>';
  }
  return datos.productos.map((p) => {
    const e = escaparHTML;
    const primera = p.variantes[0];
    const idSelect = `medida-${p.id}`;
    const etiqueta = p.agotado
      ? '<span class="etiqueta-colgante etiqueta-colgante--agotado">Agotado</span>'
      : (p.etiqueta ? `<span class="etiqueta-colgante">${e(p.etiqueta)}</span>` : '');
    // Con varias medidas: selector. Con una sola: la medida en una caja fija
    // del mismo alto, para que todas las tarjetas de la fila queden alineadas.
    const selector = p.variantes.length > 1
      ? `<label class="producto__medida-label" for="${idSelect}">Medida</label>
            <select class="producto__medida" id="${idSelect}" name="variante"${p.agotado ? ' disabled' : ''}>
              ${p.variantes.map((v, i) => `<option value="${i}" data-precio="${v.precio}">${e(v.nombre)}</option>`).join('\n              ')}
            </select>`
      : `<span class="producto__medida-label">Medida</span>
            <p class="producto__medida producto__medida--fija" title="${e(primera.nombre)}">${e(primera.nombre)}</p>
            <input type="hidden" name="variante" value="0">`;
    const coincide = datos.coleccionInicial === 'todas' || p.coleccion === datos.coleccionInicial;
    return `
      <article class="producto${coincide ? ' coincide' : ''}${p.agotado ? ' producto--agotado' : ''}" id="producto-${p.id}" data-id="${p.id}" data-coleccion="${e(p.coleccion)}">
        <div class="producto__foto">
          <img src="${e(p.imagen)}" alt="${e(p.alt)}" width="800" height="800" loading="lazy" decoding="async">
          ${etiqueta}
        </div>
        <div class="producto__info">
          <h3 class="producto__nombre">${e(p.nombre)}</h3>
          <p class="producto__desc">${e(p.descripcion)}</p>
          <form class="producto__compra" data-producto="${p.id}">
            <p class="producto__precio" data-precio-visible>${formatoCOP(primera.precio)}</p>
            ${selector}
            <button type="submit" class="boton boton--agregar"${p.agotado ? ' disabled' : ''}>${p.agotado ? 'Agotado' : 'Agregar <span class="boton__extra">al carrito</span>'}</button>
          </form>
        </div>
      </article>`;
  }).join('\n');
}

/* renderPestanas: botones de colección con el número de productos de cada una */
export function renderPestanas(datos) {
  const cuenta = (id) => datos.productos.filter((p) => p.coleccion === id).length;
  const conProductos = datos.colecciones.filter((c) => cuenta(c.id) > 0);
  const boton = (id, nombre, n) => {
    const activa = id === datos.coleccionInicial;
    return `<button type="button" class="pestana" role="tab" id="pestana-${escaparHTML(id)}" data-coleccion="${escaparHTML(id)}" aria-selected="${activa}" aria-controls="catalogo-grid" tabindex="${activa ? '0' : '-1'}">${escaparHTML(nombre)} <span class="pestana__n">${n}</span></button>`;
  };
  return [
    ...conProductos.map((c) => boton(c.id, c.nombre, cuenta(c.id))),
    boton('todas', 'Ver todo', datos.productos.length)
  ].join('\n');
}

/* Texto que describe la colección activa (debajo de las pestañas) */
export function descripcionInicial(datos) {
  if (datos.coleccionInicial === 'todas') return 'Todos los diseños disponibles.';
  return datos.colecciones.find((c) => c.id === datos.coleccionInicial)?.descripcion || '';
}

/* Datos mínimos que necesita el carrito en el navegador (js/script.js) */
export function renderDatosCliente(datos) {
  const json = JSON.stringify({
    colecciones: datos.colecciones,
    productos: datos.productos.map((p) => ({
      id: p.id, nombre: p.nombre, coleccion: p.coleccion, imagen: p.imagen,
      agotado: p.agotado, variantes: p.variantes
    }))
  });
  // Evita que un texto del CMS cierre la etiqueta <script> antes de tiempo
  return json.replace(/</g, '\\u003c');
}

/* JSON-LD de productos: ItemList → Product → offers → Offer (nunca invertido) */
export function renderJsonLdProductos(datos, base = SITIO_URL) {
  const lista = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catálogo de Estrellita House',
    itemListElement: datos.productos.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        '@id': `${base}/#producto-${p.id}`,
        name: p.nombre,
        description: p.descripcion,
        image: `${base}/${p.imagen}`,
        category: p.categoria || undefined,
        offers: p.variantes.map((v) => ({
          '@type': 'Offer',
          name: v.nombre,
          price: String(v.precio),
          priceCurrency: 'COP',
          availability: p.agotado ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          url: `${base}/#producto-${p.id}`,
          seller: { '@id': `${base}/#tienda` }
        }))
      }
    }))
  };
  return JSON.stringify(lista).replace(/</g, '\\u003c');
}

/* Texto de la barra de aviso superior: el de muestra manda sobre el normal */
export function textoAviso(datos) {
  if (datos.modoMuestra) return TEXTO_MUESTRA;
  if (datos.aviso.mostrar && datos.aviso.texto.trim()) return datos.aviso.texto.trim();
  return '';
}

export function robotsPara(datos) {
  return datos.modoMuestra ? ROBOTS_MUESTRA : ROBOTS_INDEXAR;
}

/* ---------------------------------------------------------------------------
   Lectura de los JSON del CMS desde los archivos estáticos del propio sitio
--------------------------------------------------------------------------- */
async function leerJSON(context, ruta) {
  const url = new URL(ruta, context.request.url);
  const r = await context.env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }));
  if (!r.ok) throw new Error(`No se pudo leer ${ruta}: ${r.status}`);
  return r.json();
}

/* ---------------------------------------------------------------------------
   Manejador de la ruta "/"
--------------------------------------------------------------------------- */
export async function onRequest(context) {
  const respuesta = await context.next();
  const tipo = respuesta.headers.get('content-type') || '';
  if (context.request.method !== 'GET' || !respuesta.ok || !tipo.includes('text/html')) return respuesta;

  let datos;
  try {
    const [catalogo, tienda] = await Promise.all([
      leerJSON(context, '/contenido/catalogo.json'),
      leerJSON(context, '/contenido/tienda.json')
    ]);
    datos = normalizarDatos(catalogo, tienda);
  } catch (error) {
    console.error('Catálogo no disponible, se sirve la copia estática:', error);
    return respuesta;
  }

  const html = (contenido) => ({ element(el) { el.setInnerContent(contenido, { html: true }); } });
  const texto = (contenido) => ({ element(el) { if (contenido) el.setInnerContent(contenido); } });
  const aviso = textoAviso(datos);

  const transformada = new HTMLRewriter()
    .on('meta[name="robots"]', { element(el) { el.setAttribute('content', robotsPara(datos)); } })
    .on('#portada-titulo', texto(datos.portada.titulo))
    .on('#portada-subtitulo', texto(datos.portada.subtitulo))
    .on('#aviso-tienda', {
      element(el) {
        if (aviso) { el.removeAttribute('hidden'); el.setInnerContent(`<p>${escaparHTML(aviso)}</p>`, { html: true }); }
        else el.setAttribute('hidden', '');
      }
    })
    .on('#catalogo-pestanas', html(renderPestanas(datos)))
    .on('#coleccion-desc', texto(descripcionInicial(datos)))
    .on('#catalogo-grid', {
      element(el) {
        el.setAttribute('data-filtro', datos.coleccionInicial);
        el.setAttribute('aria-labelledby', `pestana-${datos.coleccionInicial}`);
        el.setInnerContent(renderTarjetas(datos), { html: true });
      }
    })
    .on('#catalogo-datos', html(renderDatosCliente(datos)))
    .on('#jsonld-productos', html(renderJsonLdProductos(datos)))
    .transform(respuesta);

  // Cabeceras de seguridad básicas (el archivo _headers no aplica a respuestas de Functions)
  const salida = new Response(transformada.body, transformada);
  salida.headers.set('X-Content-Type-Options', 'nosniff');
  salida.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  salida.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  salida.headers.set('Cache-Control', 'no-cache');
  return salida;
}
