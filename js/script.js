/* ============================================================================
   Star Home — js/script.js
   Todo el JavaScript del sitio (landing, páginas legales y 404). Vanilla, sin
   librerías. Cada módulo revisa si su HTML existe antes de arrancar, así el
   mismo archivo sirve en todas las páginas sin errores en consola.

   Módulos (en orden):
     1. CONFIG ............ datos que se configuran a mano (WhatsApp, GA4)
     2. Utilidades ......... $, escape de texto, WhatsApp, foco
     3. Consentimiento ..... banner de cookies (Aceptar / Rechazar)
     4. Almacen ............ guarda "Mi lista" SOLO si la persona aceptó
     5. Analitica .......... GA4, que solo carga tras aceptar cookies
     6. Toast .............. aviso corto "Agregado a tu lista"
     7. Menu ............... hamburguesa en ≤900px
     8. Catalogo ........... pestañas, filtros (tipo/tamaño) y clics de tarjetas
     9. Visor .............. foto en grande a pantalla completa, tipo carrusel
    10. Lista .............. "Mi lista": diseños marcados con la estrella
    11. Pedido ............. nombre + autorización y consulta de la lista por WhatsApp
    12. PQR ................ formulario con número de radicado (políticas)
    13. Arranque
   Depende de: los id del index.html y #catalogo-datos (lo escribe
   functions/index.js). Desde v1.4 el catálogo es real y SIN PRECIOS: cada
   producto se consulta por WhatsApp (botón "Consultar" de la tarjeta, que es
   un enlace real armado en el servidor) o en grupo desde "Mi lista".
   ========================================================================== */
(() => {
  'use strict';

  /* ==========================================================================
     1. CONFIG — lo único que se edita a mano aquí
     ⚠ whatsapp se repite en index.html (ZONA EDITABLE · CONTACTO), en
     functions/index.js (WHATSAPP), en 404 y en las páginas legales.
     ========================================================================== */
  const CONFIG = {
    tienda: 'Star Home',
    whatsapp: '573008447167',      // formato internacional, sin + ni espacios
    ga4: 'G-XXXXXXXXXX',           // {POR CONFIRMAR} Measurement ID de Google Analytics 4
    // La clave del consentimiento viene de cuando la web se llamaba Estrellita
    // House: se deja igual para no volver a preguntarle a quien ya decidió.
    claveConsentimiento: 'eh_consentimiento_v1',
    claveLista: 'sh_lista_v1',
    // Claves viejas (pago en línea hasta v1.2 y carrito con precios hasta v1.3):
    // se borran del navegador al cargar.
    clavesViejas: ['eh_pedido_wompi_v1', 'eh_compras_medidas_v1', 'eh_carrito_v1'],
    maxCantidad: 20
  };

  /* ==========================================================================
     2. UTILIDADES
     ========================================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const formatoCOP = (n) => '$' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const escapar = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enlaceWhatsApp = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
  const MEDIDA_POR_WHATSAPP = 'Medida: consúltala por WhatsApp';

  /** Abre WhatsApp en otra pestaña (en el celular abre la app). Si el
   *  navegador bloquea la ventana, navega directo.
   *  Ojo: NO pasar 'noopener' a window.open: con esa opción el navegador
   *  siempre devuelve null y el código creía que estaba bloqueada, así que
   *  abría WhatsApp dos veces y la pestaña de la tienda se iba a WhatsApp
   *  (corregido el 11 nov 2026). Se corta el vínculo con opener a mano. */
  function abrirWhatsApp(texto) {
    const url = enlaceWhatsApp(texto);
    const ventana = window.open(url, '_blank');
    if (ventana) { try { ventana.opener = null; } catch (e) { /* nada */ } }
    else window.location.href = url;
    return url;
  }

  /** Mantiene el foco dentro de un panel ("Mi lista") mientras está abierto,
   *  para quien navega con teclado o lector de pantalla. */
  function atraparFoco(panel, evento) {
    if (evento.key !== 'Tab') return;
    const enfocables = $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', panel)
      .filter((el) => el.offsetParent !== null);
    if (!enfocables.length) return;
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    if (evento.shiftKey && document.activeElement === primero) { evento.preventDefault(); ultimo.focus(); }
    else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primero.focus(); }
  }

  /** ¿El toque cayó FUERA de la tarjeta de un <dialog>? (en su fondo oscuro).
   *  Hace falta porque e.target === dialogo también es cierto en su relleno. */
  function toqueFuera(dialogo, e) {
    const r = dialogo.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  }

  /* ==========================================================================
     3. CONSENTIMIENTO (banner de cookies)
     Colombia (Ley 1581 de 2012 y criterio de la SIC): nada de analítica ni
     almacenamiento de la lista hasta que la persona acepte. Aceptar y
     Rechazar pesan lo mismo. La decisión se guarda (es lo mínimo necesario
     para respetarla) y se puede cambiar con "Configurar cookies" del pie.
     ========================================================================== */
  const Consentimiento = (() => {
    let estado = null;
    try { estado = localStorage.getItem(CONFIG.claveConsentimiento); } catch (e) { estado = null; }
    const banner = $('#cookies');
    const oyentes = [];

    // Sube el botón de WhatsApp y el toast para que el banner no los tape
    function ajustarAltura() {
      const alto = banner && !banner.hidden ? banner.offsetHeight + 16 : 0;
      document.documentElement.style.setProperty('--alto-cookies', `${alto}px`);
    }
    // body.cookies-abierto: en pantallas chicas el CSS esconde el botón flotante
    // de WhatsApp mientras el banner está abierto (si no, queda encima del titular)
    function mostrar() {
      if (!banner) return;
      banner.hidden = false;
      document.body.classList.add('cookies-abierto');
      requestAnimationFrame(ajustarAltura);
    }
    function ocultar() {
      if (!banner) return;
      banner.hidden = true;
      document.body.classList.remove('cookies-abierto');
      ajustarAltura();
    }
    function decidir(valor) {
      estado = valor;
      try { localStorage.setItem(CONFIG.claveConsentimiento, valor); } catch (e) { /* navegador sin almacenamiento */ }
      ocultar();
      oyentes.forEach((fn) => fn(valor));
    }
    function iniciar() {
      $$('[data-abrir-cookies]').forEach((b) => b.addEventListener('click', mostrar));
      if (!banner) return;
      $$('[data-consentimiento]', banner).forEach((b) => b.addEventListener('click', () => decidir(b.dataset.consentimiento)));
      window.addEventListener('resize', ajustarAltura);
      if (estado !== 'aceptado' && estado !== 'rechazado') mostrar();
    }
    return { estado: () => estado, iniciar, alCambiar: (fn) => oyentes.push(fn) };
  })();

  /* ==========================================================================
     4. ALMACEN — guarda "Mi lista" en el navegador SOLO con consentimiento.
     Sin consentimiento todo vive en memoria (se pierde al recargar).
     ========================================================================== */
  const Almacen = (() => {
    const memoria = new Map();
    const hayLocal = (() => {
      try { localStorage.setItem('__sh', '1'); localStorage.removeItem('__sh'); return true; } catch (e) { return false; }
    })();
    const permitido = () => hayLocal && Consentimiento.estado() === 'aceptado';
    if (hayLocal) CONFIG.clavesViejas.forEach((k) => { try { localStorage.removeItem(k); } catch (e) { /* nada */ } });
    return {
      leer(clave) {
        if (permitido()) {
          try { const v = localStorage.getItem(clave); if (v) return JSON.parse(v); } catch (e) { /* dato dañado */ }
        }
        return memoria.has(clave) ? memoria.get(clave) : null;
      },
      guardar(clave, valor) {
        memoria.set(clave, valor);
        if (permitido()) { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin espacio */ } }
      },
      // Al aceptar: lo que estaba en memoria pasa al navegador
      volcar() {
        if (!permitido()) return;
        memoria.forEach((v, k) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* nada */ } });
      },
      // Al rechazar: se borra del navegador (queda en memoria mientras la página siga abierta)
      limpiarNavegador() {
        if (!hayLocal) return;
        [CONFIG.claveLista].forEach((k) => { try { localStorage.removeItem(k); } catch (e) { /* nada */ } });
      }
    };
  })();

  /* ==========================================================================
     5. ANALITICA (Google Analytics 4)
     No carga nada si el ID sigue en {POR CONFIRMAR} o si no hay consentimiento.
     Eventos: consulta_whatsapp (botón Consultar), agregar_lista, ver_foto,
     lista_whatsapp (consultar la lista), descarga_catalogo, clic_whatsapp,
     clic_telefono y envio_formulario (PQR).
     ========================================================================== */
  const Analitica = (() => {
    const valido = /^G-[A-Z0-9]{6,}$/.test(CONFIG.ga4) && CONFIG.ga4 !== 'G-XXXXXXXXXX';
    let cargado = false;
    function cargar() {
      if (!valido || cargado) return;
      cargado = true;
      window[`ga-disable-${CONFIG.ga4}`] = false;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', CONFIG.ga4);
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.ga4)}`;
      document.head.appendChild(s);
    }
    function desactivar() {
      if (!valido) return;
      window[`ga-disable-${CONFIG.ga4}`] = true;
      // Borra las cookies _ga que ya se hubieran creado
      const partes = location.hostname.split('.');
      const dominios = ['', location.hostname, `.${partes.slice(-2).join('.')}`, `.${partes.slice(-3).join('.')}`];
      document.cookie.split(';').map((c) => c.trim().split('=')[0]).filter((n) => /^_ga/.test(n)).forEach((nombre) => {
        dominios.forEach((d) => { document.cookie = `${nombre}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`; });
      });
    }
    function medir(evento, parametros = {}) {
      if (cargado && typeof window.gtag === 'function' && Consentimiento.estado() === 'aceptado') {
        window.gtag('event', evento, parametros);
      }
    }
    return { cargar, desactivar, medir };
  })();

  /* ==========================================================================
     6. TOAST — aviso corto con una acción opcional
     ========================================================================== */
  const Toast = (() => {
    const nodo = $('#toast');
    let temporizador = null;
    function mostrar(mensaje, textoAccion, accion) {
      if (!nodo) return;
      nodo.innerHTML = '';
      const texto = document.createElement('span');
      texto.textContent = mensaje;
      nodo.appendChild(texto);
      if (textoAccion && accion) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = textoAccion;
        b.addEventListener('click', () => { ocultar(); accion(); });
        nodo.appendChild(b);
      }
      nodo.hidden = false;
      nodo.style.animation = 'none';
      void nodo.offsetWidth; // reinicia la animación de entrada
      nodo.style.animation = '';
      clearTimeout(temporizador);
      temporizador = setTimeout(ocultar, 4000);
    }
    function ocultar() { if (nodo) nodo.hidden = true; }
    return { mostrar, ocultar };
  })();

  /* ==========================================================================
     7. MENU — hamburguesa en pantallas de 900px o menos
     ========================================================================== */
  function iniciarMenu() {
    const boton = $('#boton-menu');
    const menu = $('#menu');
    if (!boton || !menu) return;
    const cerrar = () => {
      menu.classList.remove('abierto');
      boton.setAttribute('aria-expanded', 'false');
      boton.setAttribute('aria-label', 'Abrir el menú');
    };
    boton.addEventListener('click', () => {
      const abierto = menu.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', String(abierto));
      boton.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú');
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) cerrar(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('abierto')) { cerrar(); boton.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('abierto') && !e.target.closest('#menu, #boton-menu')) cerrar();
    });
    const escritorio = window.matchMedia('(min-width: 901px)');
    const alCambiar = (m) => { if (m.matches) cerrar(); };
    if (escritorio.addEventListener) escritorio.addEventListener('change', alCambiar);
  }

  /* ==========================================================================
     8. CATALOGO — lee los datos que dejó el servidor en #catalogo-datos y
     maneja las pestañas (secciones), los filtros por tipo o tamaño y los
     clics de las tarjetas (foto → visor, estrella → lista, Consultar → mide).
     El filtro visible lo hace el CSS: .producto sin .coincide se esconde.
     ========================================================================== */
  const Catalogo = (() => {
    const datos = { productos: [], colecciones: [] };
    const nodo = $('#catalogo-datos');
    if (nodo) {
      try { Object.assign(datos, JSON.parse(nodo.textContent || '{}')); } catch (e) { /* sin datos: catálogo vacío */ }
    }
    if (!Array.isArray(datos.productos)) datos.productos = [];
    if (!Array.isArray(datos.colecciones)) datos.colecciones = [];
    const porId = new Map(datos.productos.map((p) => [p.id, p]));
    const producto = (id) => porId.get(id) || null;

    const grid = $('#catalogo-grid');
    const contPestanas = $('#catalogo-pestanas');
    const contFiltros = $('#catalogo-filtros');
    const descripcion = $('#coleccion-desc');
    let coleccion = grid ? grid.dataset.filtro || 'todas' : 'todas';
    let grupo = 'todos';
    const pestanas = contPestanas ? $$('[role="tab"]', contPestanas) : [];

    // Grupos (Cobijas / Cortinas, Sencilla / Doble…) de una colección, en orden
    function gruposDe(idColeccion) {
      const mapa = new Map();
      datos.productos.filter((p) => p.coleccion === idColeccion).forEach((p) => {
        if (!mapa.has(p.grupoId)) mapa.set(p.grupoId, { id: p.grupoId, nombre: p.grupo || 'Otros', n: 0 });
        mapa.get(p.grupoId).n += 1;
      });
      return [...mapa.values()];
    }

    function pintarFiltros() {
      if (!contFiltros) return;
      const grupos = coleccion === 'todas' ? [] : gruposDe(coleccion);
      if (grupos.length < 2) { contFiltros.innerHTML = ''; contFiltros.hidden = true; return; }
      const total = grupos.reduce((s, g) => s + g.n, 0);
      const boton = (id, nombre, n) => `<button type="button" class="filtro" data-grupo="${escapar(id)}" aria-pressed="${id === grupo}">${escapar(nombre)} <span class="filtro__n">${n}</span></button>`;
      contFiltros.innerHTML = [boton('todos', 'Todo', total), ...grupos.map((g) => boton(g.id, g.nombre, g.n))].join('');
      contFiltros.hidden = false;
    }

    function textoDescripcion() {
      if (coleccion === 'todas') return 'Todos los diseños disponibles.';
      return (datos.colecciones.find((c) => c.id === coleccion) || {}).descripcion || '';
    }

    // Marca con .coincide las tarjetas que se ven (pestaña + filtro) y las anima
    function aplicar(animar) {
      if (!grid) return;
      grid.dataset.filtro = coleccion;
      let orden = 0;
      $$('.producto', grid).forEach((tarjeta) => {
        const coincide = (coleccion === 'todas' || tarjeta.dataset.coleccion === coleccion)
          && (grupo === 'todos' || tarjeta.dataset.grupo === grupo);
        tarjeta.classList.toggle('coincide', coincide);
        tarjeta.classList.remove('entra');
        if (coincide && animar && orden < 12) {
          void tarjeta.offsetWidth; // reinicia la animación
          tarjeta.style.setProperty('--i', String(orden));
          tarjeta.classList.add('entra');
        }
        if (coincide) orden += 1;
      });
      if (descripcion) descripcion.textContent = textoDescripcion();
    }

    function activarPestana(pestana, enfocar) {
      coleccion = pestana.dataset.coleccion;
      grupo = 'todos';
      pestanas.forEach((p) => {
        const elegida = p === pestana;
        p.setAttribute('aria-selected', String(elegida));
        p.tabIndex = elegida ? 0 : -1;
      });
      if (grid) grid.setAttribute('aria-labelledby', pestana.id);
      pintarFiltros();
      aplicar(true);
      if (enfocar) pestana.focus();
    }

    function elegirGrupo(id) {
      grupo = id;
      if (contFiltros) $$('.filtro', contFiltros).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.grupo === id)));
      aplicar(true);
    }

    // Ids de los productos que se ven ahora, en el orden de la página (para el visor)
    function visibles() {
      if (!grid) return [];
      return $$('.producto', grid).filter((t) => t.offsetParent !== null || t.classList.contains('coincide')).map((t) => t.dataset.id);
    }

    // Deja a la vista un producto (para los enlaces directos /#p-<id>): cambia a
    // su pestaña si hace falta y quita el filtro.
    function mostrarProducto(id) {
      const p = producto(id);
      if (!p) return false;
      const dentro = (coleccion === 'todas' || p.coleccion === coleccion) && (grupo === 'todos' || p.grupoId === grupo);
      if (!dentro) {
        const pestana = pestanas.find((b) => b.dataset.coleccion === p.coleccion) || pestanas.find((b) => b.dataset.coleccion === 'todas');
        if (pestana) activarPestana(pestana, false);
      }
      return true;
    }

    function iniciar() {
      if (!grid) return;
      pintarFiltros();
      pestanas.forEach((p) => p.addEventListener('click', () => activarPestana(p)));
      // Teclado: flechas, Inicio y Fin (patrón de pestañas accesibles)
      if (contPestanas) {
        contPestanas.addEventListener('keydown', (e) => {
          const i = pestanas.indexOf(document.activeElement);
          if (i < 0) return;
          const mapa = { ArrowRight: (i + 1) % pestanas.length, ArrowLeft: (i - 1 + pestanas.length) % pestanas.length, Home: 0, End: pestanas.length - 1 };
          if (e.key in mapa) { e.preventDefault(); activarPestana(pestanas[mapa[e.key]], true); }
        });
      }
      if (contFiltros) {
        contFiltros.addEventListener('click', (e) => {
          const b = e.target.closest('.filtro');
          if (b) elegirGrupo(b.dataset.grupo);
        });
      }
      // Clics de las tarjetas (delegados en el grid)
      grid.addEventListener('click', (e) => {
        const ver = e.target.closest('[data-ver]');
        if (ver) { Visor.abrir(ver.dataset.ver, ver); return; }
        const estrella = e.target.closest('[data-lista]');
        if (estrella) { Lista.alternar(estrella.dataset.lista); return; }
        const consultar = e.target.closest('[data-consultar]');
        if (consultar) {
          const p = producto(consultar.dataset.consultar);
          if (p) Analitica.medir('consulta_whatsapp', { item_id: p.referencia, item_name: p.nombre, ubicacion: 'tarjeta' });
        }
      });
    }

    return { datos, producto, visibles, mostrarProducto, iniciar };
  })();

  /* ==========================================================================
     9. VISOR — la foto del producto en grande, a pantalla completa, tipo
     carrusel: se pasa al siguiente diseño deslizando el dedo, con las flechas
     de la pantalla o con las del teclado. Recorre los productos que se ven en
     el catálogo (pestaña y filtro activos).
     · Usa <dialog> nativo: atrapa el foco y Escape lo cierra solo.
     · Agrega una entrada al historial (#p-<id>): el botón "atrás" del celular
       cierra el visor en vez de salirse de la página.
     · Enlace directo: /#p-cb-01 abre el visor en ese producto (lo trae el
       mensaje de WhatsApp de "Consultar", para que la tienda vea la foto).
     ========================================================================== */
  const Visor = (() => {
    const dialogo = $('#visor');
    const foto = $('#visor-foto');
    let ids = [];
    let indice = 0;
    let origen = null;          // elemento que abrió el visor (vuelve el foco ahí)
    let conHistoria = false;    // ¿se agregó una entrada al historial al abrir?
    const disponible = Boolean(dialogo && typeof dialogo.showModal === 'function' && foto);

    function idActual() { return ids[indice]; }

    function hashDe(id) { return `#p-${id}`; }

    function pintar() {
      const p = Catalogo.producto(idActual());
      if (!p) return;
      foto.classList.remove('visor__foto--lista');
      foto.onload = () => foto.classList.add('visor__foto--lista');
      foto.src = p.imagen;
      foto.alt = p.alt || p.nombre;
      if (foto.complete) foto.classList.add('visor__foto--lista');
      $('#visor-ref').textContent = `Ref. ${p.referencia}`;
      $('#visor-nombre').textContent = p.nombre;
      $('#visor-detalle').textContent = [p.tipo, p.medida || MEDIDA_POR_WHATSAPP, p.precio ? formatoCOP(p.precio) : ''].filter(Boolean).join(' · ');
      $('#visor-contador').textContent = `${indice + 1} de ${ids.length}`;
      // El botón Consultar usa el MISMO enlace de la tarjeta (armado en el servidor)
      const consultar = $('#visor-consultar');
      const enlaceTarjeta = $(`#p-${CSS.escape(p.id)} [data-consultar]`);
      consultar.hidden = Boolean(p.agotado);
      consultar.href = enlaceTarjeta ? enlaceTarjeta.href : enlaceWhatsApp(`¡Hola, ${CONFIG.tienda}! ✨\nMe interesa este producto:\n*${p.nombre}* (${p.tipo})\nRef. ${p.referencia}\n¿Me confirman precio y disponibilidad? ¡Gracias!`);
      pintarEstrella();
      // Flechas: se esconden si solo hay un producto
      $$('.visor__flecha', dialogo).forEach((b) => { b.hidden = ids.length < 2; });
      // Precarga las fotos vecinas para que el carrusel vaya fluido
      [indice - 1, indice + 1].forEach((i) => {
        const vecino = Catalogo.producto(ids[(i + ids.length) % ids.length]);
        if (vecino) { const im = new Image(); im.src = vecino.imagen; }
      });
      if (conHistoria) history.replaceState({ visor: true }, '', hashDe(p.id));
    }

    // Botón "Agregar a mi lista" del visor (refleja si ya está en la lista)
    function pintarEstrella() {
      if (!disponible || !dialogo.open) return;
      const p = Catalogo.producto(idActual());
      const boton = $('#visor-lista');
      if (!p || !boton) return;
      const enLista = Lista.tiene(p.id);
      boton.hidden = Boolean(p.agotado);
      boton.setAttribute('aria-pressed', String(enLista));
      $('#visor-lista-texto').textContent = enLista ? 'En mi lista' : 'Agregar a mi lista';
    }

    function mover(paso) {
      if (ids.length < 2) return;
      indice = (indice + paso + ids.length) % ids.length;
      foto.classList.remove('visor__foto--entra-izq', 'visor__foto--entra-der');
      void foto.offsetWidth;
      foto.classList.add(paso > 0 ? 'visor__foto--entra-der' : 'visor__foto--entra-izq');
      pintar();
    }

    function abrir(id, boton, opciones = {}) {
      if (!disponible) return;
      if (!Catalogo.producto(id)) return;
      ids = Catalogo.visibles();
      if (!ids.includes(id)) ids = Catalogo.datos.productos.map((p) => p.id);
      indice = Math.max(0, ids.indexOf(id));
      origen = boton || null;
      if (!dialogo.open) {
        dialogo.showModal();
        document.body.classList.add('visor-abierto');
        // Entrada en el historial: así "atrás" cierra el visor
        conHistoria = opciones.historia !== false;
        if (conHistoria) history.pushState({ visor: true }, '', hashDe(id));
      }
      pintar();
      $('[data-visor="cerrar"]', dialogo).focus();
      const p = Catalogo.producto(id);
      Analitica.medir('ver_foto', { item_id: p.referencia, item_name: p.nombre });
    }

    function cerrar() { if (disponible && dialogo.open) dialogo.close(); }

    function alCerrar() {
      document.body.classList.remove('visor-abierto');
      const idCerrado = idActual();
      if (conHistoria && history.state && history.state.visor) {
        conHistoria = false;
        history.back(); // quita el #p-<id> que puso el visor
      } else if (/^#p-/.test(location.hash)) {
        history.replaceState(history.state, '', location.pathname + location.search);
      }
      conHistoria = false;
      // Devuelve el foco a la tarjeta de donde se abrió (o a la del producto que se estaba viendo)
      const destino = origen && document.contains(origen) ? origen : $(`#p-${CSS.escape(idCerrado || '')} [data-ver]`);
      if (destino) destino.focus({ preventScroll: true });
      origen = null;
    }

    function iniciar() {
      if (!disponible) return;
      dialogo.addEventListener('close', alCerrar);
      dialogo.addEventListener('click', (e) => {
        const b = e.target.closest('[data-visor]');
        if (b) {
          if (b.dataset.visor === 'cerrar') cerrar();
          if (b.dataset.visor === 'anterior') mover(-1);
          if (b.dataset.visor === 'siguiente') mover(1);
          return;
        }
        if (e.target === dialogo && toqueFuera(dialogo, e)) cerrar();
      });
      dialogo.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
      });
      $('#visor-lista').addEventListener('click', () => Lista.alternar(idActual()));
      $('#visor-consultar').addEventListener('click', () => {
        const p = Catalogo.producto(idActual());
        if (p) Analitica.medir('consulta_whatsapp', { item_id: p.referencia, item_name: p.nombre, ubicacion: 'visor' });
      });

      // Deslizar con el dedo (o el mouse) sobre la foto
      const escena = $('#visor-escena');
      let inicio = null;
      escena.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        inicio = { x: e.clientX, y: e.clientY };
      });
      escena.addEventListener('pointerup', (e) => {
        if (!inicio) return;
        const dx = e.clientX - inicio.x;
        const dy = e.clientY - inicio.y;
        inicio = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) mover(dx < 0 ? 1 : -1);
      });
      escena.addEventListener('pointercancel', () => { inicio = null; });

      // Botón "atrás" del celular o del navegador: cierra el visor
      window.addEventListener('popstate', () => {
        if (dialogo.open && !(history.state && history.state.visor)) {
          conHistoria = false;
          dialogo.close();
        }
      });

      // Enlace directo /#p-<id>: abre el visor en ese producto, al cargar la
      // página o si el # cambia con la página ya abierta (p. ej. un enlace a otro producto)
      function abrirDesdeEnlace() {
        const m = location.hash.match(/^#p-([a-z0-9_-]+)$/i);
        if (!m || dialogo.open) return;
        const id = m[1].toLowerCase();
        if (!Catalogo.mostrarProducto(id)) return;
        requestAnimationFrame(() => {
          const tarjeta = $(`#p-${CSS.escape(id)}`);
          if (tarjeta) tarjeta.scrollIntoView({ block: 'center' });
          abrir(id, tarjeta ? $('[data-ver]', tarjeta) : null, { historia: false });
        });
      }
      abrirDesdeEnlace();
      window.addEventListener('hashchange', abrirDesdeEnlace);
    }

    return { abrir, cerrar, iniciar, pintarEstrella, abierto: () => disponible && dialogo.open };
  })();

  /* ==========================================================================
     10. LISTA — "Mi lista": los diseños que el cliente marca con la estrella.
     Cada línea guarda { id, n: cantidad }. SIN PRECIOS (v1.4): sirve para
     preguntar por varios productos en un solo mensaje de WhatsApp.
     Al cargar se cruza con el catálogo vivo: si un producto ya no existe o se
     agotó, sale de la lista.
     El panel conserva los id/clases "carrito" de versiones anteriores
     (#carrito, #abrir-carrito, .carrito__…) para no romper los estilos.
     ========================================================================== */
  const Lista = (() => {
    const panel = $('#carrito');
    const fondo = $('#carrito-fondo');
    const botonAbrir = $('#abrir-carrito');
    const contador = $('#carrito-n');
    let lineas = [];
    let ultimoFoco = null;

    function reconciliar() {
      const vistos = new Set();
      lineas = (Array.isArray(lineas) ? lineas : [])
        .filter((l) => {
          const p = l && Catalogo.producto(l.id);
          if (!p || p.agotado || vistos.has(l.id)) return false;
          vistos.add(l.id);
          return true;
        })
        .map((l) => ({ id: l.id, n: Math.min(CONFIG.maxCantidad, Math.max(1, Math.round(l.n) || 1)) }));
    }
    function guardar() { Almacen.guardar(CONFIG.claveLista, lineas); }
    function detalle() { return lineas.map((l) => ({ ...l, producto: Catalogo.producto(l.id) })); }
    const tiene = (id) => lineas.some((l) => l.id === id);
    const unidades = () => lineas.reduce((s, l) => s + l.n, 0);

    // Estrellas de las tarjetas: llenas si el producto está en la lista
    function pintarEstrellas() {
      $$('[data-lista]').forEach((b) => {
        const p = Catalogo.producto(b.dataset.lista);
        if (!p) return;
        const en = tiene(p.id);
        b.setAttribute('aria-pressed', String(en));
        b.setAttribute('aria-label', `${en ? 'Quitar' : 'Agregar'} ${p.nombre} (${p.referencia}) ${en ? 'de' : 'a'} mi lista`);
        b.title = en ? 'Quitar de mi lista' : 'Agregar a mi lista';
      });
      Visor.pintarEstrella();
    }

    function saltarContador() {
      if (!contador) return;
      contador.classList.remove('salta');
      void contador.offsetWidth;
      contador.classList.add('salta');
    }

    // Estrella (tarjeta o visor): agrega o quita el producto
    function alternar(id) {
      const p = Catalogo.producto(id);
      if (!p || p.agotado) return;
      const i = lineas.findIndex((l) => l.id === id);
      // Dentro del visor el aviso quedaría detrás de la foto: ahí basta con el
      // botón, que cambia a "En mi lista"
      const avisar = !Visor.abierto();
      if (i >= 0) {
        lineas.splice(i, 1);
        guardar();
        pintar();
        if (avisar) Toast.mostrar(`Quitado de tu lista: ${p.nombre}`);
        return;
      }
      lineas.push({ id, n: 1 });
      guardar();
      pintar();
      saltarContador();
      if (avisar) Toast.mostrar(`Agregado a tu lista: ${p.nombre}`, 'Ver lista', abrir);
      Analitica.medir('agregar_lista', { item_id: p.referencia, item_name: p.nombre });
    }
    function cambiar(indice, delta) {
      const l = lineas[indice];
      if (!l) return;
      l.n = Math.min(CONFIG.maxCantidad, l.n + delta);
      if (l.n < 1) lineas.splice(indice, 1);
      guardar();
      pintar();
    }
    function quitar(indice) {
      lineas.splice(indice, 1);
      guardar();
      pintar();
      const siguiente = $('.item button', panel) || $('#cerrar-carrito');
      if (siguiente) siguiente.focus();
    }

    /* Confirmación antes de sacar un producto de la lista (basura o "−" con 1
       unidad): así un toque por error no borra nada. Usa <dialog> nativo
       (#confirmar-quitar, fuera de #carrito para que su Escape no cierre la
       lista): showModal() atrapa el foco y Escape cancela solo. Si el
       navegador es tan viejo que no tiene <dialog>, usa confirm(). */
    const dialogo = $('#confirmar-quitar');
    let porQuitar = null;   // índice de la línea que espera confirmación
    let origen = null;      // botón que abrió la pregunta (vuelve el foco ahí si cancelan)

    function pedirConfirmacion(indice, boton) {
      const l = detalle()[indice];
      if (!l || !l.producto) return;
      const descripcion = `${l.producto.nombre} · Ref. ${l.producto.referencia}${l.n > 1 ? ` · ${l.n} unidades` : ''}`;
      if (!dialogo || typeof dialogo.showModal !== 'function') {
        if (window.confirm(`¿Quitar de tu lista? ${descripcion}`)) quitar(indice);
        return;
      }
      porQuitar = indice;
      origen = boton || null;
      $('#confirmar-texto', dialogo).textContent = descripcion;
      const foto = $('#confirmar-foto', dialogo);
      if (foto) foto.src = l.producto.miniatura || l.producto.imagen;
      dialogo.returnValue = '';
      dialogo.showModal();
      $('[data-confirmar="no"]', dialogo).focus(); // lo seguro queda enfocado
    }

    function iniciarConfirmacion() {
      if (!dialogo || typeof dialogo.showModal !== 'function') return;
      dialogo.addEventListener('click', (e) => {
        const b = e.target.closest('[data-confirmar]');
        if (b) dialogo.close(b.dataset.confirmar);
        else if (e.target === dialogo && toqueFuera(dialogo, e)) dialogo.close('no');
      });
      dialogo.addEventListener('close', () => {
        const indice = porQuitar;
        porQuitar = null;
        if (dialogo.returnValue === 'si' && indice !== null) quitar(indice);
        else if (origen && document.contains(origen)) origen.focus();
        origen = null;
      });
    }

    // Dibuja la lista, el resumen, el contador de la cabecera y las estrellas
    function pintar() {
      const total = unidades();
      if (contador) contador.textContent = String(lineas.length);
      const textoLector = $('#carrito-n-texto'); // lo que oye el lector de pantalla
      if (textoLector) textoLector.textContent = lineas.length ? `, ${lineas.length} ${lineas.length === 1 ? 'producto' : 'productos'}` : ', vacía';
      pintarEstrellas();
      if (!panel) return;
      const lista = $('#carrito-lista');
      const vacio = $('#carrito-vacio');
      const resumen = $('#carrito-resumen');
      const form = $('#form-pedido');
      const hay = lineas.length > 0;
      vacio.hidden = hay;
      resumen.hidden = !hay;
      form.hidden = !hay;
      lista.innerHTML = detalle().map((l, i) => {
        const p = l.producto;
        const detalleTexto = [p.tipo, p.medida].filter(Boolean).join(' · ');
        return `
        <li class="item">
          <img class="item__foto" src="${escapar(p.miniatura || p.imagen)}" alt="" width="68" height="68" loading="lazy">
          <div>
            <p class="item__ref">Ref. ${escapar(p.referencia)}</p>
            <p class="item__nombre">${escapar(p.nombre)}</p>
            ${detalleTexto ? `<p class="item__variante">${escapar(detalleTexto)}</p>` : ''}
            <div class="item__fila">
              <div class="cantidad" role="group" aria-label="Cantidad de ${escapar(p.nombre)}">
                <button type="button" data-accion="menos" data-i="${i}" aria-label="Quitar una unidad">−</button>
                <output aria-live="polite">${l.n}</output>
                <button type="button" data-accion="mas" data-i="${i}" aria-label="Agregar una unidad"${l.n >= CONFIG.maxCantidad ? ' disabled' : ''}>+</button>
              </div>
              ${p.precio ? `<span class="item__precio">${formatoCOP(p.precio * l.n)}</span>` : ''}
            </div>
            <button type="button" class="item__quitar" data-accion="quitar" data-i="${i}" aria-label="Quitar ${escapar(p.nombre)} de mi lista" title="Quitar de mi lista">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/></svg>
            </button>
          </div>
        </li>`;
      }).join('');
      const productos = `${lineas.length} ${lineas.length === 1 ? 'producto' : 'productos'}`;
      $('#carrito-total').textContent = total > lineas.length ? `${productos} · ${total} unidades` : productos;
    }

    function abrir() {
      if (!panel) return;
      Visor.cerrar();
      ultimoFoco = document.activeElement;
      panel.hidden = false;
      fondo.hidden = false;
      document.body.classList.add('sin-scroll', 'carrito-abierto');
      if (botonAbrir) botonAbrir.setAttribute('aria-expanded', 'true');
      Toast.ocultar();
      $('#cerrar-carrito').focus();
    }
    function cerrar() {
      if (!panel || panel.hidden) return;
      panel.hidden = true;
      fondo.hidden = true;
      document.body.classList.remove('sin-scroll', 'carrito-abierto');
      if (botonAbrir) botonAbrir.setAttribute('aria-expanded', 'false');
      if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
    }

    function iniciar() {
      lineas = Almacen.leer(CONFIG.claveLista) || [];
      reconciliar();
      pintar();
      if (!panel) return;
      if (botonAbrir) botonAbrir.addEventListener('click', abrir);
      $('#cerrar-carrito').addEventListener('click', cerrar);
      fondo.addEventListener('click', cerrar);
      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrar();
        atraparFoco(panel, e);
      });
      iniciarConfirmacion();
      panel.addEventListener('click', (e) => {
        const b = e.target.closest('[data-accion]');
        if (b) {
          const i = Number(b.dataset.i);
          if (b.dataset.accion === 'mas') cambiar(i, 1);
          // "−" con 1 unidad también saca el producto: pide confirmación igual que la basura
          if (b.dataset.accion === 'menos') { if (lineas[i] && lineas[i].n <= 1) pedirConfirmacion(i, b); else cambiar(i, -1); }
          if (b.dataset.accion === 'quitar') pedirConfirmacion(i, b);
        }
        if (e.target.closest('[data-cerrar-carrito]')) cerrar();
      });
    }

    return { iniciar, alternar, abrir, tiene, detalle, lineas: () => lineas.slice() };
  })();

  /* ==========================================================================
     11. PEDIDO — consultar "Mi lista" por WhatsApp. Valida el nombre y la
     autorización de datos, arma el mensaje con cada producto (nombre, tipo,
     código, medida y cantidad) y abre el chat de la tienda con todo escrito.
     La tienda responde con precios y disponibilidad; el pago y la entrega se
     acuerdan en ese chat.
     ========================================================================== */
  const Pedido = (() => {
    const form = $('#form-pedido');
    const estado = $('#pedido-estado');
    const campos = ['nombre', 'autorizo'];

    function avisar(texto, esError) {
      if (!estado) return;
      estado.textContent = texto;
      estado.classList.toggle('es-error', Boolean(esError));
    }

    function leer() {
      const f = new FormData(form);
      return {
        nombre: String(f.get('nombre') || '').trim().replace(/\s+/g, ' '),
        autorizo: $('#pedido-autorizo').checked
      };
    }

    function validar(d) {
      const errores = {};
      if (d.nombre.length < 3) errores.nombre = 'Escribe tu nombre y apellido.';
      if (!d.autorizo) errores.autorizo = 'Para enviar la consulta necesitamos tu autorización.';
      return errores;
    }

    function mostrarErrores(errores) {
      campos.forEach((c) => {
        const p = $(`#error-${c}`);
        const input = $(`#pedido-${c}`);
        if (p) p.textContent = errores[c] || '';
        if (input) input.setAttribute('aria-invalid', errores[c] ? 'true' : 'false');
      });
      const primero = campos.find((c) => errores[c]);
      if (primero) { const el = $(`#pedido-${primero}`); if (el) el.focus(); }
    }

    /* Mensaje de WhatsApp (v1.4, sin precios): cada producto en su bloque, con
       el nombre en negrita (*texto* es negrita en WhatsApp), su tipo, código,
       medida y cantidad. Con varios productos van numerados. */
    function textoPedido(d) {
      const lineas = Lista.detalle();
      const varios = lineas.length > 1;
      const bloques = lineas.map((l, i) => {
        const p = l.producto;
        const datos = [`Ref. ${p.referencia}`, p.medida ? `Medida: ${p.medida}` : '', l.n > 1 ? `Cantidad: ${l.n}` : ''].filter(Boolean).join(' · ');
        return [`${varios ? `${i + 1}. ` : ''}*${p.nombre}*${p.tipo ? ` (${p.tipo})` : ''}`, datos].join('\n');
      });
      return [
        `¡Hola, ${CONFIG.tienda}! ✨`,
        varios ? 'Me interesan estos productos:' : 'Me interesa este producto:',
        '',
        bloques.join('\n\n'),
        '',
        `A nombre de: ${d.nombre}`,
        '¿Me confirman precio y disponibilidad? ¡Gracias!'
      ].join('\n');
    }

    function enviar(d) {
      Analitica.medir('lista_whatsapp', {
        items: Lista.detalle().map((l) => ({ item_id: l.producto.referencia, item_name: l.producto.nombre, quantity: l.n }))
      });
      const url = abrirWhatsApp(textoPedido(d));
      if (estado) {
        estado.classList.remove('es-error');
        estado.innerHTML = `Abrimos WhatsApp con tu lista. Envía el mensaje para que te respondamos. <a href="${escapar(url)}" target="_blank" rel="noopener">¿No se abrió? Toca aquí.</a>`;
      }
    }

    function iniciar() {
      if (!form) return;
      // Al corregir un campo se borra su mensaje de error
      form.addEventListener('input', (e) => {
        const nombre = e.target.name;
        if (nombre && campos.includes(nombre)) {
          const p = $(`#error-${nombre}`);
          if (p && p.textContent) { p.textContent = ''; e.target.setAttribute('aria-invalid', 'false'); }
        }
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!Lista.lineas().length) return;
        const d = leer();
        const errores = validar(d);
        mostrarErrores(errores);
        if (Object.keys(errores).length) { avisar('Revisa los datos marcados en rojo.', true); return; }
        avisar('');
        enviar(d);
      });
    }

    return { iniciar };
  })();

  /* ==========================================================================
     12. PQR — formulario de peticiones, quejas, reclamos, retracto, garantía y
     reversión del pago (politicas-de-compra.html). Genera un número de
     radicado con fecha y hora y lo envía por WhatsApp para dejar registro.
     ========================================================================== */
  function iniciarPQR() {
    const form = $('#form-pqr');
    if (!form) return;
    const salida = $('#pqr-resultado');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const v = (k) => String(f.get(k) || '').trim();
      const errores = {};
      if (!v('tipo')) errores.tipo = 'Elige el tipo de solicitud.';
      if (v('nombre').length < 3) errores.nombre = 'Escribe tu nombre completo.';
      const celular = v('celular').replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
      if (!/^3\d{9}$/.test(celular)) errores.celular = 'Escribe un celular de 10 dígitos que empiece por 3.';
      if (v('detalle').length < 10) errores.detalle = 'Cuéntanos qué pasó (mínimo 10 caracteres).';
      if (!$('#pqr-autorizo').checked) errores.autorizo = 'Necesitamos tu autorización para atender la solicitud.';
      ['tipo', 'nombre', 'celular', 'detalle', 'autorizo'].forEach((c) => {
        const p = $(`#error-pqr-${c}`);
        const input = $(`#pqr-${c}`);
        if (p) p.textContent = errores[c] || '';
        if (input) input.setAttribute('aria-invalid', errores[c] ? 'true' : 'false');
      });
      const primero = Object.keys(errores)[0];
      if (primero) { const el = $(`#pqr-${primero}`); if (el) el.focus(); return; }

      const ahora = new Date();
      const dos = (n) => String(n).padStart(2, '0');
      const azar = Math.random().toString(36).slice(2, 6).toUpperCase();
      const radicado = `PQR-${ahora.getFullYear()}${dos(ahora.getMonth() + 1)}${dos(ahora.getDate())}-${dos(ahora.getHours())}${dos(ahora.getMinutes())}-${azar}`;
      const fecha = ahora.toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
      const texto = [
        `Hola ${CONFIG.tienda}, envío esta solicitud:`,
        `Radicado: ${radicado}`,
        `Fecha y hora: ${fecha}`,
        `Tipo: ${v('tipo')}`,
        `Nombre: ${v('nombre')}`,
        `Celular: ${celular}`,
        v('pedido') ? `Pedido o referencia: ${v('pedido')}` : '',
        `Detalle: ${v('detalle')}`
      ].filter(Boolean).join('\n');
      salida.hidden = false;
      salida.innerHTML = `
        <p>Tu número de radicado es <strong>${escapar(radicado)}</strong>. Guárdalo para hacer seguimiento.</p>
        <p>Fecha y hora de la solicitud: ${escapar(fecha)}</p>
        <p>Para que quede registrada, envíala por WhatsApp con el botón de abajo. Te respondemos por ese mismo chat.</p>
        <a class="boton boton--principal" href="${escapar(enlaceWhatsApp(texto))}" target="_blank" rel="noopener">Enviar la solicitud por WhatsApp</a>`;
      salida.focus();
      Analitica.medir('envio_formulario', { formulario: 'pqr', tipo: v('tipo') });
    });
  }

  /* ==========================================================================
     13. ARRANQUE (el script va con defer: el HTML ya está listo)
     ========================================================================== */
  Consentimiento.iniciar();
  if (Consentimiento.estado() === 'aceptado') Analitica.cargar();
  Consentimiento.alCambiar((valor) => {
    if (valor === 'aceptado') { Analitica.cargar(); Almacen.volcar(); }
    else { Analitica.desactivar(); Almacen.limpiarNavegador(); }
  });

  iniciarMenu();
  Catalogo.iniciar();
  Lista.iniciar();
  Visor.iniciar();
  Pedido.iniciar();
  iniciarPQR();

  /* Enlaces internos (#coleccion, #como-pedir, #preguntas…): las tarjetas del
     catálogo se dibujan solo al acercarse (content-visibility en el CSS) y cambian
     de alto al dibujarse, así que el desplazamiento suave quedaba corrido. Antes
     de que el navegador calcule el destino se dibujan todas una vez (clase
     .dibujar-todo); desde ahí el navegador recuerda sus altos reales. */
  document.addEventListener('click', (e) => {
    const enlace = e.target.closest('a[href^="#"]');
    const grid = $('#catalogo-grid');
    if (enlace && enlace.getAttribute('href').length > 1 && grid) grid.classList.add('dibujar-todo');
  }, true);

  $$('[data-anio]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  $$('[data-medir]').forEach((el) => el.addEventListener('click', () => Analitica.medir(el.dataset.medir, { ubicacion: el.className || 'enlace' })));
})();
