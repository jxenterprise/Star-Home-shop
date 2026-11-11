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
     9. Carrito ............ panel lateral, cantidades, totales
    10. Pedido ............. datos de entrega, WhatsApp o pago con Wompi
    11. RetornoPago ........ resultado al volver de Wompi (?id=…)
    12. PQR ................ formulario con número de radicado (políticas)
    13. Arranque
   Depende de: los id del index.html, functions/api/wompi/* para el pago en
   línea y #catalogo-datos (lo escribe functions/index.js).
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
    clavePedido: 'eh_pedido_wompi_v1',
    claveCompras: 'eh_compras_medidas_v1',
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
   *  navegador bloquea la ventana, navega directo. */
  function abrirWhatsApp(texto) {
    const url = enlaceWhatsApp(texto);
    const ventana = window.open(url, '_blank', 'noopener');
    if (!ventana) window.location.href = url;
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
    function mostrar() {
      if (!banner) return;
      banner.hidden = false;
      requestAnimationFrame(ajustarAltura);
    }
    function ocultar() {
      if (!banner) return;
      banner.hidden = true;
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
      borrar(clave) {
        memoria.delete(clave);
        if (hayLocal) { try { localStorage.removeItem(clave); } catch (e) { /* nada */ } }
      },
      // Al aceptar: lo que estaba en memoria pasa al navegador
      volcar() {
        if (!permitido()) return;
        memoria.forEach((v, k) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* nada */ } });
      },
      // Al rechazar: se borra del navegador (queda en memoria mientras la página siga abierta)
      limpiarNavegador() {
        if (!hayLocal) return;
        [CONFIG.claveCarrito, CONFIG.clavePedido, CONFIG.claveCompras].forEach((k) => { try { localStorage.removeItem(k); } catch (e) { /* nada */ } });
      }
    };
  })();

  /* ==========================================================================
     5. ANALITICA (Google Analytics 4)
     No carga nada si el ID sigue en {POR CONFIRMAR} o si no hay consentimiento.
     Eventos: clic_whatsapp, clic_telefono, add_to_cart, begin_checkout,
     pedido_whatsapp, purchase (pago aprobado) y envio_formulario (PQR).
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
    const datos = { productos: [], colecciones: [], domicilio: { modo: 'acordar', valor: 0, texto: '' }, pagoEnLinea: true };
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
     9. CARRITO — panel lateral con productos, cantidades y totales.
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
    const subtotal = () => detalle().reduce((s, l) => s + l.total, 0);
    const valorDomicilio = () => (Catalogo.datos.domicilio.modo === 'fijo' ? Catalogo.datos.domicilio.valor : 0);
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
    function vaciar() { lineas = []; guardar(); pintar(); }

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
            <button type="button" class="item__quitar" data-accion="quitar" data-i="${i}">Quitar</button>
          </div>
        </li>`).join('');
      const sub = subtotal();
      const dom = valorDomicilio();
      $('#carrito-subtotal').textContent = formatoCOP(sub);
      $('#carrito-domicilio').textContent = Catalogo.datos.domicilio.modo === 'fijo' ? formatoCOP(dom) : 'Se confirma por WhatsApp';
      $('#carrito-total').innerHTML = Catalogo.datos.domicilio.modo === 'fijo'
        ? formatoCOP(sub + dom)
        : `${formatoCOP(sub)} <span class="resumen__extra">+ domicilio</span>`;
      const botonWompi = $('#boton-wompi');
      if (botonWompi) botonWompi.hidden = !Catalogo.datos.pagoEnLinea;
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
      panel.addEventListener('click', (e) => {
        const b = e.target.closest('[data-accion]');
        if (b) {
          const i = Number(b.dataset.i);
          if (b.dataset.accion === 'mas') cambiar(i, 1);
          if (b.dataset.accion === 'menos') cambiar(i, -1);
          if (b.dataset.accion === 'quitar') quitar(i);
        }
        if (e.target.closest('[data-cerrar-carrito]')) cerrar();
      });
    }

    return { iniciar, agregar, abrir, cerrar, vaciar, detalle, subtotal, valorDomicilio, lineas: () => lineas.slice(), pintar };
  })();

  /* ==========================================================================
     10. PEDIDO — valida los datos de entrega y sigue el camino elegido:
       · Pedir por WhatsApp: arma el mensaje con todo el pedido y abre el chat.
       · Pagar en línea: pide al servidor la firma de Wompi (el precio se
         recalcula allá con el catálogo, nunca se confía en el navegador)
         y lleva a la página de pago de Wompi.
     ========================================================================== */
  const Pedido = (() => {
    const form = $('#form-pedido');
    const estado = $('#pedido-estado');
    const campos = ['nombre', 'celular', 'barrio', 'direccion', 'correo', 'autorizo'];
    let metodoElegido = 'whatsapp';

    function avisar(texto, esError) {
      if (!estado) return;
      estado.textContent = texto;
      estado.classList.toggle('es-error', Boolean(esError));
    }

    function leer() {
      const f = new FormData(form);
      const valor = (k) => String(f.get(k) || '').trim().replace(/\s+/g, ' ');
      return {
        nombre: valor('nombre'),
        celular: valor('celular').replace(/\D/g, ''),
        barrio: valor('barrio'),
        direccion: valor('direccion'),
        indicaciones: valor('indicaciones'),
        correo: valor('correo'),
        autorizo: $('#pedido-autorizo').checked
      };
    }

    function validar(d) {
      const errores = {};
      let celular = d.celular;
      if (celular.length === 12 && celular.startsWith('57')) celular = celular.slice(2);
      if (d.nombre.length < 3) errores.nombre = 'Escribe tu nombre y apellido.';
      if (!/^3\d{9}$/.test(celular)) errores.celular = 'Escribe un celular de 10 dígitos que empiece por 3.';
      if (d.barrio.length < 3) errores.barrio = 'Escribe tu barrio.';
      if (d.direccion.length < 5) errores.direccion = 'Escribe la dirección completa.';
      if (d.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo)) errores.correo = 'Revisa el correo o déjalo vacío.';
      if (!d.autorizo) errores.autorizo = 'Para enviar el pedido necesitamos tu autorización.';
      return { errores, datos: { ...d, celular } };
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

    // Texto del pedido para WhatsApp (se usa también tras pagar en línea)
    function textoPedido(d, { encabezado, referencia } = {}) {
      const lineas = Carrito.detalle();
      const sub = Carrito.subtotal();
      const fijo = Catalogo.datos.domicilio.modo === 'fijo';
      const partes = [
        encabezado || `Hola ${CONFIG.tienda}, quiero hacer este pedido:`,
        '',
        ...lineas.map((l) => `• ${l.n} × ${l.producto.nombre} (${l.variante.nombre}): ${formatoCOP(l.total)}`),
        '',
        `Subtotal: ${formatoCOP(sub)}`,
        `Domicilio: ${fijo ? formatoCOP(Carrito.valorDomicilio()) : 'por confirmar según mi barrio'}`,
        `Total: ${fijo ? formatoCOP(sub + Carrito.valorDomicilio()) : `${formatoCOP(sub)} + domicilio`}`
      ];
      if (referencia) partes.push(`Referencia de pago Wompi: ${referencia}`);
      if (d) {
        partes.push('', 'Mis datos de entrega:', `Nombre: ${d.nombre}`, `Celular: ${d.celular}`, `Barrio: ${d.barrio}`, `Dirección: ${d.direccion}`);
        if (d.indicaciones) partes.push(`Indicaciones: ${d.indicaciones}`);
      }
      return partes.join('\n');
    }

    function itemsGA() {
      return Carrito.detalle().map((l) => ({ item_id: l.id, item_name: l.producto.nombre, item_variant: l.variante.nombre, price: l.variante.precio, quantity: l.n }));
    }

    function pedirPorWhatsApp(d) {
      Analitica.medir('pedido_whatsapp', { currency: 'COP', value: Carrito.subtotal(), items: itemsGA() });
      const url = abrirWhatsApp(textoPedido(d));
      if (estado) {
        estado.classList.remove('es-error');
        estado.innerHTML = `Abrimos WhatsApp con tu pedido. Envía el mensaje para confirmarlo. <a href="${escapar(url)}" target="_blank" rel="noopener">¿No se abrió? Toca aquí.</a>`;
      }
    }

    async function pagarEnLinea(d) {
      const boton = $('#boton-wompi');
      if (!Catalogo.datos.pagoEnLinea) { avisar('El pago en línea está pausado por ahora. Puedes pedir por WhatsApp.', true); return; }
      if (boton) boton.disabled = true;
      avisar('Preparando tu pago seguro con Wompi…');
      try {
        const respuesta = await fetch('/api/wompi/firma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            items: Carrito.lineas().map((l) => ({ id: l.id, variante: l.v, cantidad: l.n })),
            cliente: { nombre: d.nombre, celular: d.celular, barrio: d.barrio, direccion: d.direccion, indicaciones: d.indicaciones, correo: d.correo }
          })
        });
        let resultado = {};
        try { resultado = await respuesta.json(); } catch (e) { resultado = {}; }
        if (!respuesta.ok || !resultado.url) throw new Error(resultado.mensaje || 'No pudimos iniciar el pago en línea.');
        // Se guarda el pedido para armar el mensaje de entrega al volver (solo con consentimiento)
        Almacen.guardar(CONFIG.clavePedido, { referencia: resultado.referencia, total: resultado.total, texto: textoPedido(d, { encabezado: `Hola ${CONFIG.tienda}, ya pagué en línea este pedido:`, referencia: resultado.referencia }), fecha: Date.now() });
        Analitica.medir('begin_checkout', { currency: 'COP', value: resultado.total, payment_type: 'wompi', items: itemsGA() });
        window.location.href = resultado.url;
      } catch (error) {
        avisar(`${error.message} Mientras tanto, puedes pedir por WhatsApp.`, true);
        if (boton) boton.disabled = false;
      }
    }

    function iniciar() {
      if (!form) return;
      $$('button[type="submit"]', form).forEach((b) => b.addEventListener('click', () => { metodoElegido = b.dataset.metodo || 'whatsapp'; }));
      form.addEventListener('input', (e) => {
        const nombre = e.target.name;
        if (nombre && campos.includes(nombre)) {
          const p = $(`#error-${nombre}`);
          if (p && p.textContent) { p.textContent = ''; e.target.setAttribute('aria-invalid', 'false'); }
        }
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const metodo = (e.submitter && e.submitter.dataset.metodo) || metodoElegido;
        if (!Carrito.lineas().length) return;
        const { errores, datos } = validar(leer());
        mostrarErrores(errores);
        if (Object.keys(errores).length) { avisar('Revisa los datos marcados en rojo.', true); return; }
        avisar('');
        if (metodo === 'wompi') pagarEnLinea(datos);
        else pedirPorWhatsApp(datos);
      });
    }

    return { iniciar, textoPedido };
  })();

  /* ==========================================================================
     11. RETORNO DEL PAGO — Wompi devuelve a la página con ?id=<transacción>.
     Se consulta el estado en /api/wompi/transaccion y se muestra el resultado.
     Ojo: esto es informativo. Antes de despachar, la dueña confirma en el
     panel de Wompi que la transacción quedó APROBADA.
     ========================================================================== */
  const RetornoPago = (() => {
    const fondo = $('#pago-fondo');
    const iconos = {
      ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
      no: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>',
      espera: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
    };
    let reintentos = 0;

    function pintar(tipo, titulo, texto, acciones) {
      const icono = $('#pago-icono');
      icono.className = `modal__icono ${tipo}`;
      icono.innerHTML = iconos[tipo] || '';
      $('#pago-titulo').textContent = titulo;
      $('#pago-texto').textContent = texto;
      const caja = $('#pago-acciones');
      caja.innerHTML = '';
      acciones.forEach(({ texto: t, clase, accion, href }) => {
        const el = document.createElement(href ? 'a' : 'button');
        el.className = `boton ${clase} boton--ancho`;
        el.textContent = t;
        if (href) { el.href = href; el.target = '_blank'; el.rel = 'noopener'; }
        else el.type = 'button';
        if (accion) el.addEventListener('click', accion);
        caja.appendChild(el);
      });
      const primero = $('button, a', caja);
      if (primero) primero.focus();
    }
    function abrir() {
      fondo.hidden = false;
      document.body.classList.add('sin-scroll', 'modal-abierto');
    }
    function cerrar() {
      fondo.hidden = true;
      document.body.classList.remove('sin-scroll', 'modal-abierto');
    }

    async function consultar(id) {
      pintar('espera', 'Consultando tu pago…', 'Un momento, estamos revisando el estado de tu pago con Wompi.', []);
      let res = null;
      try {
        const r = await fetch(`/api/wompi/transaccion?id=${encodeURIComponent(id)}`, { headers: { Accept: 'application/json' } });
        res = await r.json();
        if (!r.ok) throw new Error('consulta');
      } catch (e) {
        pintar('no', 'No pudimos confirmar el pago aquí', `Si Wompi te mostró el pago como aprobado, escríbenos con este número de transacción: ${id}.`, [
          { texto: 'Escribir por WhatsApp', clase: 'boton--principal', href: enlaceWhatsApp(`Hola ${CONFIG.tienda}, hice un pago en línea y quiero confirmarlo. Número de transacción: ${id}`) },
          { texto: 'Cerrar', clase: 'boton--secundario', accion: cerrar }
        ]);
        return;
      }
      const pendiente = Almacen.leer(CONFIG.clavePedido);
      const mismo = pendiente && pendiente.referencia === res.referencia;
      if (res.estado === 'APPROVED') {
        const texto = mismo ? pendiente.texto : `Hola ${CONFIG.tienda}, ya pagué en línea. Referencia: ${res.referencia}. Quiero coordinar la entrega.`;
        medirCompra(res);
        Carrito.vaciar();
        Almacen.borrar(CONFIG.clavePedido);
        pintar('ok', '¡Pago aprobado!', `Tu pago de ${formatoCOP(res.total)} quedó aprobado. Referencia ${res.referencia}. Escríbenos para coordinar la entrega.`, [
          { texto: 'Coordinar la entrega por WhatsApp', clase: 'boton--principal', href: enlaceWhatsApp(texto) },
          { texto: 'Seguir mirando', clase: 'boton--secundario', accion: cerrar }
        ]);
      } else if (res.estado === 'PENDING') {
        pintar('espera', 'Tu pago está en proceso', 'Algunos medios, como PSE, tardan unos minutos en confirmar. Lo revisamos de nuevo en un momento.', [
          { texto: 'Consultar de nuevo', clase: 'boton--principal', accion: () => consultar(id) },
          { texto: 'Escribir por WhatsApp', clase: 'boton--secundario', href: enlaceWhatsApp(`Hola ${CONFIG.tienda}, mi pago en línea quedó en proceso. Referencia: ${res.referencia}`) }
        ]);
        if (reintentos < 3) { reintentos += 1; setTimeout(() => { if (!fondo.hidden) consultar(id); }, 6000); }
      } else {
        pintar('no', 'El pago no se completó', 'Wompi no aprobó el pago. Tu carrito sigue guardado: puedes intentarlo de nuevo o pedir por WhatsApp.', [
          { texto: 'Volver al carrito', clase: 'boton--principal', accion: () => { cerrar(); Carrito.abrir(); } },
          { texto: 'Cerrar', clase: 'boton--secundario', accion: cerrar }
        ]);
      }
    }

    // purchase se mide una sola vez por transacción
    function medirCompra(res) {
      const ya = Almacen.leer(CONFIG.claveCompras) || [];
      if (ya.includes(res.referencia)) return;
      Analitica.medir('purchase', { transaction_id: res.referencia, currency: 'COP', value: res.total, payment_type: res.metodo || 'wompi' });
      Almacen.guardar(CONFIG.claveCompras, ya.concat(res.referencia).slice(-20));
    }

    function iniciar() {
      if (!fondo) return;
      const parametros = new URLSearchParams(window.location.search);
      const id = parametros.get('id');
      if (!id || !/^[A-Za-z0-9_-]{4,80}$/.test(id)) return;
      // Limpia la URL para que al recargar no vuelva a abrir la ventana
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
      fondo.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrar();
        atraparFoco(fondo, e);
      });
      abrir();
      consultar(id);
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
  Carrito.iniciar();
  Pedido.iniciar();
  RetornoPago.iniciar();
  iniciarPQR();

  $$('[data-anio]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  $$('[data-medir]').forEach((el) => el.addEventListener('click', () => Analitica.medir(el.dataset.medir, { ubicacion: el.className || 'enlace' })));
})();
