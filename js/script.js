/* ============================================================================
   Estrellita House — js/script.js
   Todo el JavaScript del sitio (landing, páginas legales y 404). Vanilla, sin
   librerías. Cada módulo revisa si su HTML existe antes de arrancar, así el
   mismo archivo sirve en todas las páginas sin errores en consola.

   Módulos (en orden):
     1. CONFIG ............ datos que se configuran a mano (WhatsApp, GA4)
     2. Utilidades ......... $, formato de pesos, escape de texto
     3. Consentimiento ..... banner de cookies (Aceptar / Rechazar)
     4. Almacen ............ guarda el carrito SOLO si la persona aceptó
     5. Analitica .......... GA4, que solo carga tras aceptar cookies
     6. Toast .............. aviso corto "Agregado al carrito"
     7. Menu ............... hamburguesa en ≤900px
     8. Catalogo ........... pestañas de colección, medidas y precios
     9. Carrito ............ panel lateral, cantidades y total
    10. Pedido ............. nombre + autorización y envío del pedido por WhatsApp
    11. PQR ................ formulario con número de radicado (políticas)
    12. Arranque
   Depende de: los id del index.html y #catalogo-datos (lo escribe
   functions/index.js). Desde v1.3 no hay pago en línea ni domicilios:
   todo el pedido, con su total, se envía por WhatsApp.
   ========================================================================== */
(() => {
  'use strict';

  /* ==========================================================================
     1. CONFIG — lo único que se edita a mano aquí
     ⚠ whatsapp se repite en index.html (ZONA EDITABLE · CONTACTO), 404 y legales.
     ========================================================================== */
  const CONFIG = {
    tienda: 'Estrellita House',
    whatsapp: '573008447167',      // formato internacional, sin + ni espacios
    ga4: 'G-XXXXXXXXXX',           // {POR CONFIRMAR} Measurement ID de Google Analytics 4
    claveConsentimiento: 'eh_consentimiento_v1',
    claveCarrito: 'eh_carrito_v1',
    // Claves que usaba el pago en línea (hasta v1.2): se borran del navegador al cargar
    clavesViejas: ['eh_pedido_wompi_v1', 'eh_compras_medidas_v1'],
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

  /** Mantiene el foco dentro de un panel (carrito, ventana de pago) mientras
   *  está abierto, para quien navega con teclado o lector de pantalla. */
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

  /* ==========================================================================
     3. CONSENTIMIENTO (banner de cookies)
     Colombia (Ley 1581 de 2012 y criterio de la SIC): nada de analítica ni
     almacenamiento del carrito hasta que la persona acepte. Aceptar y
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
     4. ALMACEN — guarda el carrito en el navegador SOLO con consentimiento.
     Sin consentimiento todo vive en memoria (se pierde al recargar).
     ========================================================================== */
  const Almacen = (() => {
    const memoria = new Map();
    const hayLocal = (() => {
      try { localStorage.setItem('__eh', '1'); localStorage.removeItem('__eh'); return true; } catch (e) { return false; }
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
        [CONFIG.claveCarrito].forEach((k) => { try { localStorage.removeItem(k); } catch (e) { /* nada */ } });
      }
    };
  })();

  /* ==========================================================================
     5. ANALITICA (Google Analytics 4)
     No carga nada si el ID sigue en {POR CONFIRMAR} o si no hay consentimiento.
     Eventos: clic_whatsapp, clic_telefono, add_to_cart, pedido_whatsapp y
     envio_formulario (PQR).
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
     8. CATALOGO — lee los datos que dejó el servidor en #catalogo-datos,
     maneja las pestañas de colección y el cambio de medida/precio.
     ========================================================================== */
  const Catalogo = (() => {
    const datos = { productos: [], colecciones: [] };
    const nodo = $('#catalogo-datos');
    if (nodo) {
      try { Object.assign(datos, JSON.parse(nodo.textContent || '{}')); } catch (e) { /* sin datos: el carrito queda vacío */ }
    }
    const porId = new Map(datos.productos.map((p) => [p.id, p]));
    const producto = (id) => porId.get(id) || null;

    function iniciarPestanas() {
      const contenedor = $('#catalogo-pestanas');
      const grid = $('#catalogo-grid');
      const descripcion = $('#coleccion-desc');
      if (!contenedor || !grid) return;
      const pestanas = $$('[role="tab"]', contenedor);

      function activar(pestana, enfocar) {
        const id = pestana.dataset.coleccion;
        pestanas.forEach((p) => {
          const elegida = p === pestana;
          p.setAttribute('aria-selected', String(elegida));
          p.tabIndex = elegida ? 0 : -1;
        });
        grid.dataset.filtro = id;
        grid.setAttribute('aria-labelledby', pestana.id);
        let orden = 0;
        $$('.producto', grid).forEach((tarjeta) => {
          const coincide = id === 'todas' || tarjeta.dataset.coleccion === id;
          tarjeta.classList.toggle('coincide', coincide);
          tarjeta.classList.remove('entra');
          if (coincide) {
            void tarjeta.offsetWidth; // reinicia la animación
            tarjeta.style.setProperty('--i', String(orden++));
            tarjeta.classList.add('entra');
          }
        });
        if (descripcion) {
          descripcion.textContent = id === 'todas'
            ? 'Todos los diseños disponibles.'
            : ((datos.colecciones.find((c) => c.id === id) || {}).descripcion || '');
        }
        if (enfocar) pestana.focus();
      }

      pestanas.forEach((p) => p.addEventListener('click', () => activar(p)));
      // Teclado: flechas, Inicio y Fin (patrón de pestañas accesibles)
      contenedor.addEventListener('keydown', (e) => {
        const i = pestanas.indexOf(document.activeElement);
        if (i < 0) return;
        const mapa = { ArrowRight: (i + 1) % pestanas.length, ArrowLeft: (i - 1 + pestanas.length) % pestanas.length, Home: 0, End: pestanas.length - 1 };
        if (e.key in mapa) { e.preventDefault(); activar(pestanas[mapa[e.key]], true); }
      });
    }

    function iniciarTarjetas() {
      $$('.producto__compra').forEach((form) => {
        const id = form.dataset.producto;
        const selector = $('select[name="variante"]', form);
        const precio = form.closest('.producto') ? $('[data-precio-visible]', form.closest('.producto')) : null;
        if (selector && precio) {
          selector.addEventListener('change', () => {
            const p = producto(id);
            const v = p && p.variantes[Number(selector.value)];
            if (v) precio.textContent = formatoCOP(v.precio);
          });
        }
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const p = producto(id);
          if (!p || p.agotado) return;
          const campo = selector || $('input[name="variante"]', form);
          Carrito.agregar(id, Number(campo ? campo.value : 0) || 0, 1);
        });
      });
    }

    return { datos, producto, iniciar() { iniciarPestanas(); iniciarTarjetas(); } };
  })();

  /* ==========================================================================
     9. CARRITO — panel lateral con productos, cantidades y el total del pedido.
     Cada línea guarda { id, v: índice de la medida, n: cantidad }.
     Al cargar se cruza con el catálogo vivo: si un producto o medida ya no
     existe o se agotó, sale del carrito; los precios siempre son los actuales.
     ========================================================================== */
  const Carrito = (() => {
    const panel = $('#carrito');
    const fondo = $('#carrito-fondo');
    const botonAbrir = $('#abrir-carrito');
    const contador = $('#carrito-n');
    let lineas = [];
    let ultimoFoco = null;

    function reconciliar() {
      lineas = lineas
        .filter((l) => {
          const p = Catalogo.producto(l.id);
          return p && !p.agotado && p.variantes[l.v];
        })
        .map((l) => ({ id: l.id, v: l.v, n: Math.min(CONFIG.maxCantidad, Math.max(1, Math.round(l.n) || 1)) }));
    }
    function guardar() { Almacen.guardar(CONFIG.claveCarrito, lineas); }
    function detalle() {
      return lineas.map((l) => {
        const p = Catalogo.producto(l.id);
        const v = p.variantes[l.v];
        return { ...l, producto: p, variante: v, total: v.precio * l.n };
      });
    }
    const totalPedido = () => detalle().reduce((s, l) => s + l.total, 0);
    const unidades = () => lineas.reduce((s, l) => s + l.n, 0);

    function agregar(id, v, n) {
      const p = Catalogo.producto(id);
      if (!p || !p.variantes[v]) return;
      const existente = lineas.find((l) => l.id === id && l.v === v);
      if (existente) existente.n = Math.min(CONFIG.maxCantidad, existente.n + n);
      else lineas.push({ id, v, n });
      guardar();
      pintar();
      if (contador) {
        contador.classList.remove('salta');
        void contador.offsetWidth;
        contador.classList.add('salta');
      }
      Toast.mostrar(`Agregado: ${p.nombre}`, 'Ver carrito', abrir);
      Analitica.medir('add_to_cart', {
        currency: 'COP',
        value: p.variantes[v].precio * n,
        items: [{ item_id: id, item_name: p.nombre, item_variant: p.variantes[v].nombre, price: p.variantes[v].precio, quantity: n }]
      });
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

    /* Confirmación antes de sacar un producto del carrito (botón "Quitar" o
       "−" con 1 unidad): así un toque por error no borra nada. Usa <dialog>
       nativo (#confirmar-quitar, fuera de #carrito para que su Escape no
       cierre el carrito): showModal() atrapa el foco y Escape cancela solo.
       Si el navegador es tan viejo que no tiene <dialog>, usa confirm(). */
    const dialogo = $('#confirmar-quitar');
    let porQuitar = null;   // índice de la línea que espera confirmación
    let origen = null;      // botón que abrió la pregunta (vuelve el foco ahí si cancelan)

    function pedirConfirmacion(indice, boton) {
      const l = detalle()[indice];
      if (!l) return;
      const descripcion = `${l.producto.nombre} · ${l.variante.nombre}${l.n > 1 ? ` · ${l.n} unidades` : ''}`;
      if (!dialogo || typeof dialogo.showModal !== 'function') {
        if (window.confirm(`¿Quitar del carrito? ${descripcion}`)) quitar(indice);
        return;
      }
      porQuitar = indice;
      origen = boton || null;
      $('#confirmar-texto', dialogo).textContent = descripcion;
      const foto = $('#confirmar-foto', dialogo);
      if (foto) foto.src = l.producto.imagen;
      dialogo.returnValue = '';
      dialogo.showModal();
      $('[data-confirmar="no"]', dialogo).focus(); // lo seguro queda enfocado
    }

    function iniciarConfirmacion() {
      if (!dialogo || typeof dialogo.showModal !== 'function') return;
      dialogo.addEventListener('click', (e) => {
        const b = e.target.closest('[data-confirmar]');
        if (b) dialogo.close(b.dataset.confirmar);
        else if (e.target === dialogo) {
          // El <dialog> también es el objetivo del clic en su relleno blanco: solo
          // se cancela si el toque cae FUERA de la tarjeta (en el fondo oscuro)
          const r = dialogo.getBoundingClientRect();
          const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
          if (fuera) dialogo.close('no');
        }
      });
      dialogo.addEventListener('close', () => {
        const indice = porQuitar;
        porQuitar = null;
        if (dialogo.returnValue === 'si' && indice !== null) quitar(indice);
        else if (origen && document.contains(origen)) origen.focus();
        origen = null;
      });
    }
    // Dibuja la lista, el resumen y el contador de la cabecera
    function pintar() {
      const total = unidades();
      if (contador) contador.textContent = String(total);
      const textoLector = $('#carrito-n-texto'); // lo que oye el lector de pantalla
      if (textoLector) textoLector.textContent = total ? `, ${total} ${total === 1 ? 'producto' : 'productos'}` : ', vacío';
      if (!panel) return;
      const lista = $('#carrito-lista');
      const vacio = $('#carrito-vacio');
      const resumen = $('#carrito-resumen');
      const form = $('#form-pedido');
      const hay = lineas.length > 0;
      vacio.hidden = hay;
      resumen.hidden = !hay;
      form.hidden = !hay;
      lista.innerHTML = detalle().map((l, i) => `
        <li class="item">
          <img class="item__foto" src="${escapar(l.producto.imagen)}" alt="" width="68" height="68" loading="lazy">
          <div>
            <p class="item__nombre">${escapar(l.producto.nombre)}</p>
            <p class="item__variante">${escapar(l.variante.nombre)} · ${formatoCOP(l.variante.precio)} c/u</p>
            <div class="item__fila">
              <div class="cantidad" role="group" aria-label="Cantidad de ${escapar(l.producto.nombre)}">
                <button type="button" data-accion="menos" data-i="${i}" aria-label="Quitar una unidad">−</button>
                <output aria-live="polite">${l.n}</output>
                <button type="button" data-accion="mas" data-i="${i}" aria-label="Agregar una unidad"${l.n >= CONFIG.maxCantidad ? ' disabled' : ''}>+</button>
              </div>
              <span class="item__precio">${formatoCOP(l.total)}</span>
            </div>
            <button type="button" class="item__quitar" data-accion="quitar" data-i="${i}" aria-label="Quitar ${escapar(l.producto.nombre)} del carrito" title="Quitar del carrito">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/></svg>
            </button>
          </div>
        </li>`).join('');
      $('#carrito-total').textContent = formatoCOP(totalPedido());
    }

    function abrir() {
      if (!panel) return;
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
      const guardado = Almacen.leer(CONFIG.claveCarrito);
      lineas = Array.isArray(guardado) ? guardado : [];
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
          // "−" con 1 unidad también saca el producto: pide confirmación igual que "Quitar"
          if (b.dataset.accion === 'menos') { if (lineas[i] && lineas[i].n <= 1) pedirConfirmacion(i, b); else cambiar(i, -1); }
          if (b.dataset.accion === 'quitar') pedirConfirmacion(i, b);
        }
        if (e.target.closest('[data-cerrar-carrito]')) cerrar();
      });
    }

    return { iniciar, agregar, abrir, detalle, totalPedido, lineas: () => lineas.slice() };
  })();

  /* ==========================================================================
     10. PEDIDO — todo se hace por WhatsApp (desde v1.3 no hay pago en línea
     ni domicilios). Valida el nombre y la autorización de datos, arma el
     mensaje con cada producto (medida, cantidad y valor) y el TOTAL, y abre
     el chat de la tienda con el mensaje ya escrito. El pago y la entrega se
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
      if (!d.autorizo) errores.autorizo = 'Para enviar el pedido necesitamos tu autorización.';
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

    /* Mensaje de WhatsApp (v1.3): cada producto en su bloque, con el nombre en
       negrita (*texto* es negrita en WhatsApp), y el total al final. Para no
       repetir precios:
       · Un solo producto: no lleva precio propio, solo el Total (y el valor
         por unidad si pidió varias).
       · Varios productos: cada uno lleva su valor y abajo va el Total. */
    function textoPedido(d) {
      const lineas = Carrito.detalle();
      const unidades = lineas.reduce((s, l) => s + l.n, 0);
      const variosProductos = lineas.length > 1;
      const bloques = lineas.map((l, i) => {
        const r = [`${variosProductos ? `${i + 1}. ` : ''}*${l.producto.nombre}*`, `Medida: ${l.variante.nombre}`];
        if (variosProductos) {
          r.push(l.n > 1
            ? `Cantidad: ${l.n} × ${formatoCOP(l.variante.precio)} = ${formatoCOP(l.total)}`
            : `Precio: ${formatoCOP(l.total)}`);
        } else if (l.n > 1) {
          r.push(`Cantidad: ${l.n} (${formatoCOP(l.variante.precio)} c/u)`);
        }
        return r.join('\n');
      });
      return [
        `¡Hola, ${CONFIG.tienda}! ✨`,
        'Quiero hacer este pedido:',
        '',
        bloques.join('\n\n'),
        '',
        `*Total: ${formatoCOP(Carrito.totalPedido())}*${unidades > 1 ? ` (${unidades} unidades)` : ''}`,
        '',
        `A nombre de: ${d.nombre}`,
        '¿Me confirman disponibilidad, forma de pago y entrega? ¡Gracias!'
      ].join('\n');
    }

    function enviar(d) {
      Analitica.medir('pedido_whatsapp', {
        currency: 'COP',
        value: Carrito.totalPedido(),
        items: Carrito.detalle().map((l) => ({ item_id: l.id, item_name: l.producto.nombre, item_variant: l.variante.nombre, price: l.variante.precio, quantity: l.n }))
      });
      const url = abrirWhatsApp(textoPedido(d));
      if (estado) {
        estado.classList.remove('es-error');
        estado.innerHTML = `Abrimos WhatsApp con tu pedido. Envía el mensaje para confirmarlo. <a href="${escapar(url)}" target="_blank" rel="noopener">¿No se abrió? Toca aquí.</a>`;
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
        if (!Carrito.lineas().length) return;
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
     11. PQR — formulario de peticiones, quejas, reclamos, retracto, garantía y
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
     12. ARRANQUE (el script va con defer: el HTML ya está listo)
     ========================================================================== */
  Consentimiento.iniciar();
  if (Consentimiento.estado() === 'aceptado') Analitica.cargar();
  Consentimiento.alCambiar((valor) => {
    if (valor === 'aceptado') { Analitica.cargar(); Almacen.volcar(); }
    else { Analitica.desactivar(); Almacen.limpiarNavegador(); }
  });

  iniciarMenu();
  Catalogo.iniciar();
  Carrito.iniciar();
  Pedido.iniciar();
  iniciarPQR();

  $$('[data-anio]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  $$('[data-medir]').forEach((el) => el.addEventListener('click', () => Analitica.medir(el.dataset.medir, { ubicacion: el.className || 'enlace' })));
})();
