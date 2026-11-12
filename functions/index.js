/**
 * ============================================================================
 * Star Home — functions/index.js
 * Cloudflare Pages Function que atiende SOLO la ruta "/" (la página principal).
 *
 * Qué hace:
 *   Toma el index.html estático y, antes de enviarlo al navegador, le inyecta
 *   el catálogo VIVO que la dueña edita desde el administrador (/admin):
 *     - contenido/catalogo.json  → productos (código, nombre, tipo, medida, fotos)
 *     - contenido/tienda.json    → colecciones (pestañas), portada, aviso,
 *                                  catálogo en PDF y modo muestra
 *   Así los productos quedan escritos en el HTML real (view-source), que es
 *   lo que leen Google y los bots de IA, sin build step ni frameworks.
 *
 * Desde v1.4 (12 nov 2026) el catálogo es REAL y SIN PRECIOS: cada tarjeta
 * trae su enlace "Consultar" que abre WhatsApp con el nombre y el código del
 * producto ya escritos (funciona aunque el navegador no cargue el JavaScript).
 * Si algún día un producto trae "precio", se muestra; si no, "Precio por WhatsApp".
 *
 * De qué depende:
 *   - index.html: elementos con id portada-titulo, portada-subtitulo,
 *     portada-catalogo, aviso-tienda, catalogo-pestanas, catalogo-filtros,
 *     coleccion-desc, catalogo-grid, catalogo-datos, jsonld-productos y
 *     meta[name=robots].
 *   - js/script.js lee #catalogo-datos (visor de fotos y "Mi lista").
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
export const TIENDA = 'Star Home';
// ⚠ WhatsApp de la tienda (formato internacional, sin + ni espacios). Se repite en
// index.html (ZONA EDITABLE · CONTACTO y botón flotante), js/script.js
// (CONFIG.whatsapp), 404.html y páginas legales. Si cambia, cambiarlo en TODOS.
export const WHATSAPP = '573008447167';

const ROBOTS_INDEXAR = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
const ROBOTS_MUESTRA = 'noindex, nofollow';
const TEXTO_MUESTRA = 'Catálogo de muestra: pronto subimos los productos reales.';
const MEDIDA_POR_WHATSAPP = 'Medida: consúltala por WhatsApp';

/* ---------------------------------------------------------------------------
   Utilidades: escape de HTML (todo lo que viene del CMS se escapa SIEMPRE,
   aunque lo escriba la dueña), formato de pesos y "slug" para los filtros.
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

// "Cobijas navideñas" → "cobijas-navidenas" (para data-grupo de los filtros)
export function slug(texto) {
  return String(texto || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Ruta de imagen del CMS ("/img/productos/x.webp") → relativa ("img/productos/x.webp")
function rutaRelativa(ruta) {
  return String(ruta || '').replace(/^\/+/, '');
}

/* Mensaje de WhatsApp para preguntar por UN producto. js/script.js usa el
   mismo texto (lo lee del enlace de la tarjeta), así que basta con cambiarlo aquí. */
export function textoConsulta(p, base = SITIO_URL) {
  const detalle = [`Ref. ${p.referencia}`, p.medida ? `Medida: ${p.medida}` : ''].filter(Boolean).join(' · ');
  return [
    `¡Hola, ${TIENDA}! ✨`,
    'Me interesa este producto:',
    `*${p.nombre}*${p.tipo ? ` (${p.tipo})` : ''}`,
    detalle,
    '¿Me confirman precio y disponibilidad? ¡Gracias!',
    `Foto: ${base}/#p-${p.id}`
  ].join('\n');
}

export function enlaceWhatsApp(texto) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

/* ---------------------------------------------------------------------------
   normalizarDatos: limpia y valida lo que llega del CMS.
   - Descarta productos ocultos (mostrar: false), sin nombre o sin foto.
   - Solo deja colecciones visibles (y productos cuya colección se ve).
   - Arma los grupos (filtros) de cada colección en el orden en que aparecen.
--------------------------------------------------------------------------- */
export function normalizarDatos(catalogo, tienda) {
  const colecciones = (Array.isArray(tienda?.colecciones) ? tienda.colecciones : [])
    .filter((c) => c && c.id && c.mostrar !== false)
    .map((c) => ({ id: String(c.id), nombre: String(c.nombre || c.id), descripcion: String(c.descripcion || '') }));
  const idsColecciones = new Set(colecciones.map((c) => c.id));

  const vistos = new Set();
  const productos = (Array.isArray(catalogo?.productos) ? catalogo.productos : [])
    .filter((p) => p && p.id && p.nombre && p.imagen && p.mostrar !== false)
    .map((p) => {
      const precio = Math.round(Number(p.precio));
      const grupo = String(p.grupo || '').trim();
      return {
        id: String(p.id).toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        referencia: String(p.referencia || '').trim() || String(p.id).toUpperCase(),
        nombre: String(p.nombre).trim(),
        tipo: String(p.tipo || '').trim(),
        coleccion: String(p.coleccion || ''),
        grupo,
        grupoId: slug(grupo) || 'otros',
        medida: String(p.medida || '').trim(),
        precio: Number.isFinite(precio) && precio > 0 ? precio : null,
        imagen: rutaRelativa(p.imagen),
        miniatura: rutaRelativa(p.miniatura) || rutaRelativa(p.imagen),
        alt: String(p.alt || `${p.tipo || ''} ${p.nombre}`).trim(),
        etiqueta: String(p.etiqueta || ''),
        agotado: p.agotado === true
      };
    })
    // un producto cuya colección se ocultó tampoco se muestra; ids repetidos tampoco
    .filter((p) => (!p.coleccion || idsColecciones.has(p.coleccion)) && !vistos.has(p.id) && vistos.add(p.id));

  const inicialPedida = String(tienda?.coleccion_inicial || '');
  const coleccionInicial = colecciones.some((c) => c.id === inicialPedida && productos.some((p) => p.coleccion === c.id))
    ? inicialPedida
    : (colecciones.find((c) => productos.some((p) => p.coleccion === c.id))?.id || 'todas');

  // El PDF del catálogo solo puede ser un archivo .pdf del propio sitio (p. ej.
  // /catalogo/catalogo-star-home-2026.pdf): nada de enlaces externos ni comillas.
  const pdf = String(tienda?.catalogo_pdf || '').trim();
  const catalogoPdf = /^\/[A-Za-z0-9._/-]+\.pdf$/i.test(pdf) && !pdf.includes('..') ? pdf : '';

  return {
    // Si el ajuste falta, se asume Modo muestra (lo prudente: no indexar)
    modoMuestra: tienda?.modo_muestra !== false,
    aviso: {
      mostrar: tienda?.aviso?.mostrar === true,
      texto: String(tienda?.aviso?.texto || '')
    },
    portada: {
      titulo: String(tienda?.portada?.titulo || ''),
      subtitulo: String(tienda?.portada?.subtitulo || '')
    },
    catalogoPdf,
    colecciones,
    coleccionInicial,
    productos
  };
}

/* Grupos (filtros) de una colección, en el orden en que salen sus productos */
export function gruposDe(datos, coleccion) {
  const mapa = new Map();
  datos.productos.filter((p) => p.coleccion === coleccion).forEach((p) => {
    if (!mapa.has(p.grupoId)) mapa.set(p.grupoId, { id: p.grupoId, nombre: p.grupo || 'Otros', n: 0 });
    mapa.get(p.grupoId).n += 1;
  });
  return [...mapa.values()];
}

/* ---------------------------------------------------------------------------
   Íconos (sprite SVG en línea, sin archivos aparte)
--------------------------------------------------------------------------- */
// Los íconos se dibujan UNA vez en el sprite <svg> al inicio del <body> de index.html
// (#i-whatsapp, #i-estrella) y cada tarjeta los reutiliza con <use>: así el HTML pesa
// mucho menos (el ícono de WhatsApp mide casi 2 KB y hay decenas de tarjetas).
export const ICONO_WHATSAPP = '<svg class="boton__icono" aria-hidden="true" focusable="false"><use href="#i-whatsapp"></use></svg>';
// Estrella de 5 puntas (la del logo de Star Home): marca "Agregar a mi lista"
export const ICONO_ESTRELLA = '<svg aria-hidden="true" focusable="false"><use href="#i-estrella"></use></svg>';

/* ---------------------------------------------------------------------------
   renderTarjetas: HTML de las tarjetas de producto del catálogo.
   Cada tarjeta lleva data-coleccion y data-grupo para que el CSS/JS filtre.
   - La foto es un botón que abre el visor a pantalla completa (js/script.js).
   - La estrella agrega o quita el producto de "Mi lista".
   - "Consultar" es un enlace real a WhatsApp (sirve sin JavaScript).
--------------------------------------------------------------------------- */
export function renderTarjetas(datos) {
  if (!datos.productos.length) {
    return '<p class="catalogo__vacio">Estamos preparando la próxima colección. Escríbenos por WhatsApp y te contamos qué hay disponible.</p>';
  }
  const e = escaparHTML;
  return datos.productos.map((p) => {
    const etiqueta = p.agotado
      ? '<span class="etiqueta-colgante etiqueta-colgante--agotado">Agotado</span>'
      : (p.etiqueta ? `<span class="etiqueta-colgante">${e(p.etiqueta)}</span>` : '');
    const coincide = datos.coleccionInicial === 'todas' || p.coleccion === datos.coleccionInicial;
    const medida = p.medida
      ? `<p class="producto__medida">${e(p.medida)}</p>`
      : `<p class="producto__medida producto__medida--consultar">${MEDIDA_POR_WHATSAPP}</p>`;
    const precio = p.precio ? `<p class="producto__precio">${formatoCOP(p.precio)}</p>` : '';
    const consultar = p.agotado
      ? '<span class="boton boton--consultar boton--apagado" aria-disabled="true">Agotado</span>'
      : `<a class="boton boton--consultar" href="${e(enlaceWhatsApp(textoConsulta(p)))}" target="_blank" rel="noopener" data-consultar="${p.id}">${ICONO_WHATSAPP}Consultar<span class="sr-only"> ${e(p.nombre)} por WhatsApp</span></a>`;
    return `
      <article class="producto${coincide ? ' coincide' : ''}${p.agotado ? ' producto--agotado' : ''}" id="p-${p.id}" data-id="${p.id}" data-coleccion="${e(p.coleccion)}" data-grupo="${e(p.grupoId)}">
        <div class="producto__foto">
          <button type="button" class="producto__ver" data-ver="${p.id}" aria-label="Ver en grande: ${e(p.nombre)}, referencia ${e(p.referencia)}">
            <img src="${e(p.miniatura)}" alt="${e(p.alt)}" width="480" height="480" loading="lazy" decoding="async">
          </button>
          ${etiqueta}
          <button type="button" class="producto__estrella" data-lista="${p.id}" aria-pressed="false" aria-label="Agregar ${e(p.nombre)} (${e(p.referencia)}) a mi lista" title="Agregar a mi lista">${ICONO_ESTRELLA}</button>
        </div>
        <div class="producto__info">
          <p class="producto__ref">Ref. ${e(p.referencia)}</p>
          <h3 class="producto__nombre">${e(p.nombre)}</h3>
          ${p.tipo ? `<p class="producto__tipo">${e(p.tipo)}</p>` : ''}
          ${medida}
          ${precio}
          ${consultar}
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

/* renderFiltros: los grupos de la colección inicial (Cobijas / Cortinas,
   Sencilla / Doble / Queen…). Si la colección tiene un solo grupo, no hay filtros. */
export function renderFiltros(datos, coleccion = datos.coleccionInicial) {
  const grupos = coleccion === 'todas' ? [] : gruposDe(datos, coleccion);
  if (grupos.length < 2) return '';
  const total = grupos.reduce((s, g) => s + g.n, 0);
  const boton = (id, nombre, n, activo) => `<button type="button" class="filtro" data-grupo="${escaparHTML(id)}" aria-pressed="${activo}">${escaparHTML(nombre)} <span class="filtro__n">${n}</span></button>`;
  return [boton('todos', 'Todo', total, true), ...grupos.map((g) => boton(g.id, g.nombre, g.n, false))].join('\n');
}

/* Texto que describe la colección activa (debajo de las pestañas) */
export function descripcionInicial(datos) {
  if (datos.coleccionInicial === 'todas') return 'Todos los diseños disponibles.';
  return datos.colecciones.find((c) => c.id === datos.coleccionInicial)?.descripcion || '';
}

/* Datos que necesita el navegador (js/script.js): visor, filtros y "Mi lista" */
export function renderDatosCliente(datos) {
  const json = JSON.stringify({
    colecciones: datos.colecciones,
    productos: datos.productos.map((p) => ({
      id: p.id, referencia: p.referencia, nombre: p.nombre, tipo: p.tipo,
      coleccion: p.coleccion, grupo: p.grupo, grupoId: p.grupoId, medida: p.medida,
      precio: p.precio, imagen: p.imagen, miniatura: p.miniatura, alt: p.alt, agotado: p.agotado
    }))
  });
  // Evita que un texto del CMS cierre la etiqueta <script> antes de tiempo
  return json.replace(/</g, '\\u003c');
}

/* JSON-LD de los productos. Sin precios, Google NO acepta "Product" (pide
   offers con price, review o aggregateRating y marca error en Search Console),
   así que va una lista simple: ItemList → ListItem con nombre, foto y enlace. */
export function renderJsonLdProductos(datos, base = SITIO_URL) {
  const lista = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Catálogo de ${TIENDA}`,
    numberOfItems: datos.productos.length,
    itemListElement: datos.productos.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${p.nombre}${p.tipo ? ` · ${p.tipo}` : ''} (Ref. ${p.referencia})`,
      url: `${base}/#p-${p.id}`,
      image: `${base}/${p.imagen}`
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

// 15003940 → "14 MB" (para el botón "Descargar catálogo")
export function tamanoLegible(bytes) {
  const n = Number(bytes) || 0;
  if (n <= 0) return '';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${Math.round(n / (1024 * 1024))} MB`;
}

/* ---------------------------------------------------------------------------
   Lectura de los archivos estáticos del propio sitio
--------------------------------------------------------------------------- */
async function leerJSON(context, ruta) {
  const url = new URL(ruta, context.request.url);
  const r = await context.env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }));
  if (!r.ok) throw new Error(`No se pudo leer ${ruta}: ${r.status}`);
  return r.json();
}

// Tamaño del PDF del catálogo (para mostrarlo en el botón "PDF · 14 MB").
// En Cloudflare Pages el HEAD no trae el tamaño y el Range no se respeta, así
// que se pide el archivo, se lee "content-length" y se corta la descarga.
// Se guarda en memoria del servidor: solo la primera visita de cada instancia
// lo mide (al cambiar el PDF hay un despliegue nuevo y se vuelve a medir).
// Si no se puede medir, el botón conserva el texto que trae index.html.
const pesosPdf = new Map();
async function tamanoArchivo(context, ruta) {
  if (pesosPdf.has(ruta)) return pesosPdf.get(ruta);
  try {
    const url = new URL(ruta, context.request.url).toString();
    const r = await context.env.ASSETS.fetch(new Request(url, { method: 'GET' }));
    const total = Number(r.headers.get('content-length')) || 0;
    if (r.body) await r.body.cancel();
    if (r.ok && total > 1) { pesosPdf.set(ruta, total); return total; }
    return 0;
  } catch (e) {
    return 0;
  }
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
  const pesoPdf = datos.catalogoPdf ? tamanoLegible(await tamanoArchivo(context, datos.catalogoPdf)) : '';

  const html = (contenido) => ({ element(el) { el.setInnerContent(contenido, { html: true }); } });
  const texto = (contenido) => ({ element(el) { if (contenido) el.setInnerContent(contenido); } });
  const aviso = textoAviso(datos);
  const filtros = renderFiltros(datos);

  const transformada = new HTMLRewriter()
    .on('meta[name="robots"]', { element(el) { el.setAttribute('content', robotsPara(datos)); } })
    .on('#portada-titulo', texto(datos.portada.titulo))
    .on('#portada-subtitulo', texto(datos.portada.subtitulo))
    .on('#portada-catalogo', {
      element(el) {
        if (!datos.catalogoPdf) { el.setAttribute('hidden', ''); return; }
        el.removeAttribute('hidden');
        el.setAttribute('href', datos.catalogoPdf); // ya validada: solo /…/*.pdf
      }
    })
    // Si no se pudo medir el PDF, se deja la etiqueta que ya trae index.html ("PDF · 14 MB")
    .on('#portada-catalogo-peso', texto(pesoPdf ? `PDF · ${pesoPdf}` : ''))
    .on('#aviso-tienda', {
      element(el) {
        if (aviso) { el.removeAttribute('hidden'); el.setInnerContent(`<p>${escaparHTML(aviso)}</p>`, { html: true }); }
        else el.setAttribute('hidden', '');
      }
    })
    .on('#catalogo-pestanas', html(renderPestanas(datos)))
    .on('#catalogo-filtros', {
      element(el) {
        el.setInnerContent(filtros, { html: true });
        if (filtros) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
      }
    })
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
