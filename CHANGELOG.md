# Historial de versiones — Star Home (antes "Estrellita House")

Registro de cada entrega del sitio (`https://star-home-shop.pages.dev`).
La más nueva va arriba. Cada versión tiene su etiqueta en git (`git tag vX.Y`)
y el mismo número se muestra en la portada (ZONA EDITABLE · VERSIÓN de `index.html`).
Cómo publicar una versión nueva: ver "Versiones" en `CLAUDE.md`.

---

## v1.4 — 12 nov 2026, 11:15 (hora de Colombia) · Star Home: catálogo real sin precios, logo y colores de la marca

JX mandó las 83 fotos reales (ZIP "Star Home"), el logo de la empresa y su
catálogo en PDF ("Catálogo Star Home 2026"). Pidió: subir los productos SIN
precio (los clientes preguntan por WhatsApp), que se vean bien y se puedan
elegir bien en el celular, el logo de Star Home en la web y en las fotos (donde
estaba el del proveedor, como hizo en su PDF), la web con los colores del logo
y un botón "Descargar catálogo" junto al título.

**Nuevo**
- **La web ahora se llama Star Home** (es la marca del logo; "Estrellita" es la
  dueña). Logo en la cabecera, la portada, el pie, el ícono del celular y la
  imagen que sale al compartir el enlace.
- **81 productos reales** con los nombres y códigos del PDF: 17 cobijas navideñas
  (CB-01 a CB-17), 10 cortinas navideñas (CT-01 a CT-10), 32 sábanas estampadas
  (SB-01 a SB-32: sencilla, doble, queen y king), 9 satinadas de rayas (SB-33 a
  SB-41), 9 cortinas clásicas (CT-11 a CT-19), 3 jacquard (CT-20 a CT-22) y
  almohadas (AL-01). **Sin precios**: cada tarjeta dice "Medida…" y "Consultar".
- **Secciones como el PDF**: Especial Navidad, Sábanas, Cortinas, Almohadas y
  Ver todo, con **filtros** por tipo o tamaño (Cobijas / Cortinas navideñas;
  Sencilla / Doble / Queen / King / Satinadas; Clásicas / Jacquard).
- **Botón "Consultar"** en cada producto: abre WhatsApp con el nombre, el
  código, la medida y un enlace a la foto ya escritos.
- **Visor de fotos a pantalla completa, tipo carrusel**: al tocar una foto se ve
  en grande; se pasa al siguiente diseño deslizando el dedo, con flechas o con
  el teclado; el botón "atrás" del celular lo cierra. Enlace directo a cada
  producto (`/#p-sb-09`).
- **"Mi lista"** (estrella ☆ en cada foto): junta varios diseños y los consulta
  en un solo mensaje de WhatsApp con códigos y cantidades (reemplaza el carrito
  con precios de la v1.3; conserva la confirmación al quitar).
- **"Descargar catálogo (PDF · 14 MB)"** junto al título; el PDF se puede
  cambiar desde el administrador.
- **Colores y letras de la marca**: dorado, rosa y crema del logo con el negro
  café de "Home"; tipografías del PDF (Cormorant Garamond, Montserrat y Great
  Vibes). Bloque "¿Buscas algo más?" y "Cómo pedir" en 3 pasos, como el PDF.
- **Fotos**: tu logo de Star Home va encima del logo del proveedor (ÉVORA,
  VELUNA, Duvellar Home y su teléfono), en el mismo lugar y con el mismo estilo
  que en tu PDF, pero sobre las fotos originales en alta resolución. Todas en
  WebP: foto grande (máx. 1400 px) y miniatura cuadrada (480 px) por producto.

**Cambiado**
- Modo muestra **apagado**: sin barra "Catálogo de muestra" y Google ya puede
  mostrar la página. La barra de arriba ahora anuncia el Especial Navidad 2026.
- Datos para Google: lista de productos sin la ficha "Product" (Google la pide
  con precio y daría error en Search Console).
- Administrador (`/admin`): productos con código, tipo, sección, grupo, medida,
  foto, miniatura y precio OPCIONAL; ajuste "Catálogo en PDF"; archivos de hasta
  25 MB. Validado contra el esquema oficial de Sveltia CMS 0.263.0.
- Páginas legales, 404, `llms.txt`, manifest y textos al día con Star Home y
  con los precios por WhatsApp.

**Revisado**
- 140 pruebas automáticas en 19 pantallas (iPhone SE a 15 Pro Max, Galaxy S8 a
  S24, Fold, Flip, Pixel, Moto G4, iPad, Galaxy Tab, horizontales y
  escritorio): sin desbordes, sin errores en consola, todo el flujo (pestañas,
  filtros, visor, deslizar, atrás, Mi lista, mensajes de WhatsApp, PDF, 404).
- Accesibilidad sin fallas (axe-core) y HTML válido en las 7 páginas.
- Lighthouse en celular: Rendimiento 95, Accesibilidad 100, Buenas prácticas
  100, SEO 100 (escritorio 97/100/100/100).

**Ajuste del 12 nov 2026, 11:55 (revisando la página ya publicada)**
- **Carga más rápido en el celular.** Medida en Cloudflare, la página daba 81/100
  en velocidad (95 en las pruebas). La causa: Cloudflare copiaba mal el enlace a
  las letras de Google y cada visita descargaba una hoja de letras dañada. Ahora
  las tres letras del PDF (los mismos archivos, se ven igual) se guardan en la
  propia web (`/fonts`): ya no hay que conectarse a Google, la dirección IP del
  visitante no se envía a terceros y el texto no "salta" al cargar.
- El logo de la portada se ve desde el primer instante (antes empezaba invisible
  y Google lo contaba tarde).
- Política de cookies: se quitó "Google Fonts" de los servicios de terceros.
- Resultado en la vista previa de Cloudflare: celular 95–99 (antes 81),
  escritorio 100, y las 140 pruebas en orden.

---

## v1.3 — 11 nov 2026, 23:40 (hora de Colombia) · Solo WhatsApp (sin pago en línea ni domicilios)

Estrellita House es un emprendimiento pequeño: por ahora todo se vende por
WhatsApp y todavía no hay envíos a domicilio en todo Cartagena.

**Quitado**
- **Pago en línea con Wompi**: botón "Pagar en línea", ventana de resultado
  del pago y las funciones del servidor (`functions/api/wompi/`).
- **Domicilios**: la sección "Domicilios y pagos", el valor del domicilio en
  el carrito y los ajustes de domicilio y pago del administrador.
- Datos que ya no hacen falta en el carrito: celular, barrio, dirección,
  indicaciones y correo.

**Cambiado**
- **Carrito**: suma el **total** y pide solo el nombre. El botón "Enviar
  pedido por WhatsApp" abre el chat con cada producto (medida, cantidad y
  valor) y el total ya escritos. El pago y la entrega se acuerdan en el chat.
- **Botón flotante de WhatsApp**: ahora es azul noche, el color de la marca,
  con un anillo blanco para que se vea también sobre el pie.
- **Mensaje de WhatsApp más claro y sin precios repetidos**: cada producto
  en su bloque, con el nombre en negrita y la medida. Con un solo producto el
  valor sale una sola vez, en el Total; con varios, cada uno lleva su valor y
  al final va el Total con las unidades. Cierra con el nombre del cliente y la
  pregunta "¿Me confirman disponibilidad, forma de pago y entrega?".
- **Quitar del carrito pide confirmación**: el enlace "Quitar" se cambió por
  un ícono de basura azul. Al tocarlo, o al tocar "−" con 1 unidad, sale una
  ventanita "¿Quitar este producto?" con foto, nombre y medida, y los botones
  Cancelar / Sí, quitar. Nada se borra por un toque accidental.
- Textos de portada, "Cómo comprar", preguntas frecuentes, pie, SEO y páginas
  legales (compras, privacidad, términos y cookies) acordes a la venta por
  WhatsApp. El enlace legal ahora dice "Compras, entregas y devoluciones".

> Nada se pierde: el pago en línea y los domicilios siguen en la versión
> `v1.2` de GitHub, por si se vuelven a necesitar.

---

## v1.2 — 11 nov 2026 · Revisión en vivo y arreglos de móvil

Primera revisión con la web ya publicada en Cloudflare Pages, probada con
perfiles reales de iPhone (SE, 12 mini, 13, 15 Pro Max), Android (Galaxy S8,
S9+, S24, A55, Z Flip, Z Fold, Pixel 7, Moto G4), tablets (iPad Mini, Galaxy Tab)
y en horizontal. Sin desbordes ni errores de consola en ninguno.

**Arreglado**
- **Dominio:** todo apuntaba a `estrellita-house.pages.dev`, que no existe:
  la vista previa al compartir el enlace por WhatsApp salía sin imagen y el
  canonical, el JSON-LD, el sitemap, robots y llms apuntaban a otra web.
  Ahora todo usa `https://star-home-shop.pages.dev`.
- **Pedir por WhatsApp:** se abría WhatsApp dos veces y la pestaña de la
  tienda se iba a WhatsApp (con cookies rechazadas se perdía el carrito).
  Causa: `window.open(..., 'noopener')` siempre devuelve `null`.
- **Pagar en línea:** el botón ya no aparece mientras falten las llaves de
  Wompi en Cloudflare (antes el cliente lo tocaba y salía error). Aparece
  solo cuando se configuren `WOMPI_PUBLIC_KEY` y `WOMPI_INTEGRITY_SECRET`.
- **Celulares:** el botón flotante de WhatsApp ya no tapa el crédito del pie
  ni el titular (se esconde mientras el aviso de cookies está abierto en
  pantallas chicas); aviso de cookies más compacto en teléfonos de 320–380 px;
  contenido fuera del notch/isla en iPhone horizontal; enlaces del pie de 44 px.
- **404:** salía sin estilos en enlaces rotos profundos (`/a/b/c`).
- **Administrador:** `admin/config.yml` apunta al repositorio real
  `jxenterprise/Star-Home-shop`.

> No hubo una v1.1 publicada: por pedido de JX esta revisión se numeró
> directamente como v1.2.

**Nuevo**
- Etiqueta de versión (`v1.2`) sobre el titular de la portada.
- `CHANGELOG.md` (este archivo) y sección "Versiones" en `CLAUDE.md`.

---

## v1.0 — 29 oct 2026 · Entrega inicial

Landing de una página con catálogo por temporadas (Navidad, Halloween, Todo
el año), carrito, pedido por WhatsApp, pago en línea con Wompi (Web Checkout),
administrador Sveltia CMS en `/admin`, catálogo inyectado en el servidor con
una Cloudflare Pages Function, páginas legales (privacidad, cookies, términos,
políticas de compra con formulario PQR), 404 propia, banner de cookies y
GA4 con consentimiento. Catálogo SIMULADO en Modo muestra (`noindex`).
