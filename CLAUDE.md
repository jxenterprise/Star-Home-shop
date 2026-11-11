# CLAUDE.md — Estrellita House

Contexto para cualquier chat futuro (Claude u otra IA) que vaya a editar este proyecto. Léelo completo antes de tocar código.

## 📌 ESTADO ACTUAL (léelo primero — se actualiza en cada sesión)
_Última actualización: 11 nov 2026._

- **Versión en el código: v1.2** (se ve en la portada sobre el titular). Las etiquetas de git `v1.0`/`v1.2` NO se pudieron subir desde la sesión en la nube (bloqueo 403): las crea JX en GitHub → Releases (ver "VERSIONES"). Historial completo en `CHANGELOG.md`.
- **Sitio en vivo:** `https://star-home-shop.pages.dev` (Cloudflare Pages, producción = rama `main`). Cada rama/PR tiene vista previa en `https://<rama>.star-home-shop.pages.dev` (el bot de Cloudflare la comenta en la PR).
- **Repositorio:** `jxenterprise/Star-Home-shop`. Se trabaja en ramas `claude/…` + PR en borrador hacia `main`; JX fusiona.
- **Sigue en Modo muestra** (catálogo simulado, `noindex`).
- **Pago en línea:** apagado solo porque NO hay llaves de Wompi en Cloudflare (el botón aparece al cargarlas).
- **Lo último que se hizo (v1.2):** revisión en iPhone/Android, dominio corregido, bug de WhatsApp doble, ajustes de móvil, 404, etiqueta de versión y esta documentación. Detalle en el MAPA DEL CÓDIGO.
- **Preguntas abiertas a JX (de la revisión v1.2):**
  1. Imagen para compartir (`og:image`) en JPG como excepción a la regla WebP: las fuentes no coinciden en si WhatsApp muestra WebP siempre. Pendiente su decisión o probar pegando el enlace en un chat.
  2. ¿Ya hay cuenta y llaves de Wompi (pruebas)?
  3. Montar el autenticador de Sveltia (`base_url` en `admin/config.yml`); mientras tanto `/admin` solo entra con token de GitHub.
  4. En 320–390 px el selector de medida se ve cortado ("Sencilla 10…"); al tocarlo se ve completo. No se cambió; JX decide.
  5. En el pie dice "WhatsApp:" pero el enlace es `tel:` (llama). Confirmar si debe abrir el chat.
- **JX va a pedir funciones nuevas** en la próxima sesión: antes de tocar nada, leer este archivo completo y `CHANGELOG.md`.

## Qué es

Landing de una sola página para **Estrellita House**, emprendimiento de la novia de JX en Cartagena (despacha desde Ciudadela La Paz, El Pozón) que vende **sábanas, cortinas, tapetes y decoración de temporada** (Navidad, Halloween y básicos para todo el año).

- Proyecto de JX Company (lleva el crédito "Diseño y desarrollo: JX Company" en el pie).
- Hecho con la skill `skill-jx-landing-pages-2026` (auditoría de 24 puntos).
- Hosting: Cloudflare Pages, en la cuenta de JX (cliente básico). Dominio actual: `star-home-shop.pages.dev` (si llega un dominio propio, cambiarlo en todos los sitios del punto 10 de pendientes). Repositorio: `jxenterprise/Star-Home-shop`, rama `main`.
- Idioma: solo español.

### ⚠ El catálogo actual es SIMULADO

JX pidió material simulado porque el negocio todavía no tiene fotos ni lista de productos. **Todos los productos, fotos (ilustraciones), medidas y precios son de muestra.** Por eso el sitio está en **Modo muestra** (`contenido/tienda.json → "modo_muestra": true`): sale una barra arriba que lo avisa y la página va con `noindex`. Cuando lleguen los productos reales se cargan desde `/admin` y se apaga el Modo muestra (eso cambia solo el robots a `index, follow` y quita la barra).

## Cómo funciona (arquitectura)

```
Dueña edita en /admin (Sveltia CMS)
        │  commit en GitHub
        ▼
contenido/catalogo.json  +  contenido/tienda.json
        │  Cloudflare Pages redespliega (1–2 min)
        ▼
functions/index.js  → en cada visita a "/" toma index.html y le inyecta
                      el catálogo vivo con HTMLRewriter (HTML real en el
                      view-source, sin build step ni frameworks)
        ▼
js/script.js        → pestañas, carrito, pedido por WhatsApp, pago Wompi
        │
        ├─ Pedir por WhatsApp → wa.me con el pedido escrito
        └─ Pagar en línea → POST /api/wompi/firma (functions/api/wompi/firma.js)
                             recalcula el total con el JSON, firma con el
                             secreto de integridad y devuelve la URL del
                             Web Checkout de Wompi
                             ↓ Wompi devuelve a "/?id=<transacción>"
                             GET /api/wompi/transaccion → muestra el resultado
```

- **Copia de respaldo del catálogo:** dentro de `index.html`, entre `<!-- CATALOGO:INICIO -->` y `<!-- CATALOGO:FIN -->` (y en las pestañas, `#catalogo-datos` y `#jsonld-productos`), hay una copia estática generada con el MISMO render de `functions/index.js`. Sirve si la Function falla y para ver la página en local sin emulador. **No se edita a mano.** Si cambias el marcado de las tarjetas en `functions/index.js`, regenera la copia (ver "Herramienta: regenerar la copia" al final).
- **Precios:** la verdad está en `contenido/catalogo.json`. El navegador nunca decide cuánto se cobra: `firma.js` recalcula todo.
- **Domicilio:** `tienda.json → domicilio.modo` = `acordar` (se confirma por WhatsApp; el pago en línea cubre solo productos) o `fijo` (se suma `valor` al total y al cobro en Wompi).

## Estructura de archivos

```
estrellita-house/
├── index.html                 landing (HTML real + copia de respaldo del catálogo)
├── 404.html                   error con el diseño del sitio
├── privacidad.html            política de datos (Ley 1581 de 2012)
├── cookies.html               política de cookies + tabla
├── terminos.html              términos + propiedad intelectual
├── politicas-de-compra.html   compras, domicilios, retracto, garantía, reversión + formulario PQR
├── _headers                   caché de css/js/contenido + cabeceras de seguridad
├── robots.txt                 permite bots de IA; bloquea /admin/ y /api/
├── sitemap.xml                solo "/" (legales con noindex)
├── llms.txt                   mapa del sitio para IA
├── site.webmanifest
├── favicon.ico / favicon.svg / apple-touch-icon.png   (excepción técnica, no WebP)
├── CLAUDE.md / README.md
├── CHANGELOG.md               historial de versiones (v1.0, v1.2…), la más nueva arriba
├── css/styles.css             todo el CSS (variables :root, mobile-first)
├── js/script.js               todo el JS (módulos comentados)
├── img/                       TODO en WebP
│   ├── heroe-sabanas-cortinas-estrellita-house.webp   (LCP, 840×1200)
│   ├── og-estrellita-house-cartagena.webp             (1200×630)
│   ├── logo-estrellita-house.webp                     (600×600, JSON-LD)
│   └── productos/*.webp                               (800×800, simulados)
├── contenido/
│   ├── catalogo.json          productos (lo edita el CMS)
│   └── tienda.json            ajustes (lo edita el CMS)
├── admin/
│   ├── index.html             carga Sveltia CMS desde unpkg
│   └── config.yml             campos del administrador (validado contra el esquema oficial)
└── functions/
    ├── index.js               "/" → inyecta el catálogo vivo (HTMLRewriter)
    └── api/wompi/
        ├── firma.js           POST → total + referencia + firma de integridad + URL de checkout
        └── transaccion.js     GET  → estado de la transacción en Wompi
```

## Dónde editar cada cosa

| Qué | Dónde | Quién |
|---|---|---|
| Productos, fotos, medidas, precios, agotado, ocultar | `/admin` → Productos (`contenido/catalogo.json`) | La dueña |
| Colecciones/pestañas y cuál se ve primero | `/admin` → Ajustes de la tienda | La dueña |
| Título y subtítulo de la portada | `/admin` → Ajustes → Portada | La dueña |
| Barra de aviso / Modo muestra | `/admin` → Ajustes | La dueña o JX |
| Domicilio (acordar o fijo) y pausar pago en línea | `/admin` → Ajustes | La dueña |
| Número de WhatsApp | ZONA CONTACTO de `index.html` + ver "⚠ SE REPITE EN" | JX |
| Nota de IVA | ZONA TEXTOS de `index.html` | JX |
| Textos de "Cómo comprar", domicilios, preguntas | `index.html` (y FAQPage del `<head>`) | JX |
| Textos legales | generador de páginas (ver abajo) o directamente en cada `.html` | JX |
| GA4 (Measurement ID) | `js/script.js` → `CONFIG.ga4` | JX |
| Llaves de Wompi | Cloudflare Pages → Settings → Environment variables | JX |
| Repositorio y autenticador del CMS | `admin/config.yml` → `backend` | JX |

## {POR CONFIRMAR} pendientes

1. **Nombre exacto del negocio** (JX dijo "más o menos Estrellita House").
2. **Catálogo real:** productos, fotos, medidas y precios (todo lo actual es simulado).
3. **IVA:** si los precios lo incluyen o si el negocio no es responsable de IVA (nota en `index.html` y `terminos.html`).
4. **Datos legales del responsable:** nombre completo o razón social, cédula o NIT, dirección para notificaciones y correo (privacidad, términos y políticas de compra; el art. 50 de la Ley 1480 los exige a quien vende en línea).
5. **Medios de pago aceptados por WhatsApp** (Nequi, transferencia, efectivo contra entrega…).
6. **Tiempo de entrega** y si el domicilio será por barrio o fijo.
7. **Política de cambios** (plazo y condiciones).
8. **Término de garantía** anunciado (si no se anuncia, la ley fija 1 año).
9. **Measurement ID de GA4** (`CONFIG.ga4`; mientras sea `G-XXXXXXXXXX` no se carga nada).
10. **Dominio final** (canonical, og, JSON-LD, sitemap, robots, llms, `SITIO_URL` en `functions/index.js`, `site_url` en `admin/config.yml`).
11. **Repositorio de GitHub** y **URL del autenticador** de Sveltia (`admin/config.yml`).
12. **Cuenta de Wompi a nombre del negocio** y sus llaves (primero de pruebas, luego producción).
13. **Redes sociales** (Instagram/Facebook) para el pie y `sameAs` del JSON-LD.
14. **Horario de atención** por WhatsApp (para `openingHoursSpecification`).
15. Confirmar que se puede mostrar **Ciudadela La Paz** como punto de despacho.

## Decisiones tomadas (y por qué)

- **Landing de una página** (lo pidió JX) con catálogo, carrito y CMS: el catálogo vive en JSON y se inyecta en el servidor para cumplir "HTML real en el view-source" sin build step.
- **CMS git-based: Sveltia CMS** (JX eligió CMS git-based). Se escogió Sveltia sobre Decap porque convierte las fotos a **WebP al subirlas** (regla de JX) y tiene la interfaz en español de Colombia (`es-CO`). El `config.yml` se validó contra el esquema JSON oficial del paquete `@sveltia/cms@0.254.0`.
- **Pago:** "las dos opciones" (WhatsApp o Wompi), como eligió JX. Wompi por **Web Checkout** (redirección a `checkout.wompi.co/p/`): no carga scripts de terceros en la página. Firma de integridad SHA-256 de `referencia + centavos + COP + secreto`, calculada SOLO en el servidor.
- **El botón "Pedir por WhatsApp" del carrito** es parte del pedido (lleva el detalle armado), no un botón de contacto extra; el único botón de WhatsApp de contacto es el flotante.
- **Sin mapa:** el negocio no tiene local abierto al público; se reemplazó por la sección "Domicilios en Cartagena".
- **Cookies estrictas:** nada de GA4 ni carrito guardado hasta que la persona acepte. Si rechaza, el carrito vive en memoria (se pierde al recargar).
- **Diseño Modo 2 (libre)**, porque JX eligió "Dame lo mejor". No se usó el Diseño JX.
- **Modo muestra con noindex** mientras el catálogo sea simulado, para no indexar productos y precios de mentira.
- **Fotos de producto = ilustraciones SVG convertidas a WebP**, hechas para el proyecto (sin licencias de terceros).

## 🖼️ REGLA DE IMÁGENES — SIEMPRE WebP
Todas las imágenes de este proyecto van en **WebP**, sin excepción. Cualquier foto nueva que JX entregue (JPG, PNG, HEIC, capturas, lo que sea) se **convierte a WebP de inmediato** antes de meterla al proyecto, conservando resolución y calidad originales, y se guarda en `img/`. Nunca dejar JPG/PNG en el proyecto ni entregar copias de respaldo en otros formatos.
**Única excepción técnica**: `favicon` (`.ico`/`.png`/`.svg`) y `apple-touch-icon.png`, porque ningún navegador soporta favicons en WebP.

> En este proyecto el administrador también cumple la regla: `admin/config.yml → media_libraries.default.config.transformations.raster_image.format: webp` convierte cada foto que suba la dueña.

## 🎨 REGLA DE DISEÑO — TODO LO NUEVO USA ESTE MISMO DISEÑO
Cualquier sección, componente, botón o página que se agregue a futuro debe usar **exactamente** el diseño de esta web: mismos colores, mismas tipografías, mismos tamaños, radios, sombras y espaciados, y los mismos patrones de componente que ya existen. **Nunca un diseño distinto.** Si algo no alcanza con lo que hay, preguntarle a JX antes de inventar.

**Ficha de diseño de este proyecto:**
- Paleta (variables `:root` de `css/styles.css`):
  - `--noche: #1C2541` marca: titulares, botones principales, pie
  - `--noche-700: #26325A` hover de botones oscuros · `--noche-600: #34447A` bordes activos y foco
  - `--estrella: #F2C14E` acento: estrella del logo, etiquetas, contador del carrito · `--estrella-suave: #FBEFCB`
  - `--algodon: #F3F5F9` fondo de secciones alternas · `--blanco: #FFFFFF` · `--lino: #E9EDF4` fondo de fotos de producto
  - `--hilo: #D6DCE7` bordes finos
  - `--tinta: #222A43` texto · `--tinta-2: #4E5775` secundario · `--tinta-3: #646C8A` notas
  - `--whatsapp: #1DA851` (verde oscurecido para contraste) · `--whatsapp-texto: #136B37` · `--exito: #1F6B4D` · `--error: #A3262E`
- Tipografías: **Fraunces** (títulos, 500–600, serif suave) y **Manrope** (texto, 400–700). Google Fonts, carga no bloqueante.
- Escala: h1 portada `clamp(2.35rem, 1.45rem + 3.9vw, 4.4rem)`; h2 `clamp(1.75rem, 1.3rem + 1.8vw, 2.6rem)`; cuerpo 1rem/1.6; precios 1.15rem 800 con cifras tabulares.
- Radios: `--radio-s: 10px` (campos), `--radio-m: 16px` (tarjetas), `--radio-l: 24px` (bloques), botones `999px` (píldora).
- Sombras: `--sombra-1` suave para elevar; `--sombra-2` para paneles flotantes (carrito, modal, cookies). Sin brillos ni neones.
- Patrones de componente:
  - Botones píldora de 48 px mínimo: `.boton--principal` (noche), `.boton--secundario` (borde noche), `.boton--whatsapp` (borde verde), `.boton--agregar`.
  - Tarjeta de producto: foto cuadrada sobre `--lino`, nombre en Fraunces, descripción de 3 líneas, bloque inferior alineado (precio + medida + botón).
  - **Etiqueta colgante** (forma de marquilla con ojal) en amarillo estrella para "Nuevo", "Últimos días"…; en noche para "Agotado".
  - Pestañas píldora con contador; la activa en noche con contador amarillo.
  - **Costura punteada** (borde `2px dashed var(--hilo)`) solo para unir pasos que son secuencia.
  - Secciones alternan blanco / algodón; pie en noche.
- Movimiento: una sola entrada animada (portada al cargar) + animaciones que responden a acciones (carrito, pestañas, toast). Respeta `prefers-reduced-motion`.
- Modo de diseño usado: **2 — diseño libre** (JX eligió "Dame lo mejor").

## 🗂️ ÍNDICE DE ZONAS EDITABLES
En este proyecto casi todo el contenido cambiante se edita desde el CMS (`/admin`). En `index.html` quedan solo tres zonas:

| Zona | Qué contiene | ¿Se repite? |
|---|---|---|
| `ZONA EDITABLE · TEXTOS` | Nota de precios / IVA bajo el catálogo | `terminos.html` (sección Precios) |
| `ZONA EDITABLE · VERSIÓN` | Etiqueta `vX.Y` sobre el titular de la portada | `CHANGELOG.md` y la etiqueta de git (`git tag vX.Y`) |
| `ZONA EDITABLE · CONTACTO` | WhatsApp/teléfono y ciudad del pie | `href tel:`, botón flotante `wa.me`, `js/script.js` (`CONFIG.whatsapp`), JSON-LD `telephone`, 404 y páginas legales |

Productos, precios, colecciones, portada, aviso y domicilio **no** llevan zona: viven en `contenido/*.json` (CMS). La región `CATALOGO:INICIO/FIN` es una copia automática, no una zona editable.

## 🧭 MAPA DEL CÓDIGO
_Registro de todo el código. Se suma, nunca se borra lo anterior._

### 29 oct 2026 — v1.0 · Versión 1 (entrega inicial)
- **`index.html`** — secciones: aviso (`#aviso-tienda`, aside), cabecera sticky con menú y botón de carrito, portada (`#portada-titulo`/`#portada-subtitulo`, imagen LCP), colección (`#catalogo-pestanas`, `#coleccion-desc`, `#catalogo-grid` con `data-filtro`), cómo comprar (4 pasos), domicilios y pagos (`#domicilio-texto`), preguntas (details/summary + FAQPage en el `<head>`), pie (crédito JX con formato exacto), botón flotante de WhatsApp (dentro del `<footer>` por accesibilidad, fijo por CSS), carrito (`#carrito`, role=dialog), modal de pago (`#pago-fondo`), toast, banner de cookies, `#catalogo-datos` (JSON para el carrito). Depende de los id que usan `functions/index.js` y `js/script.js`.
- **`css/styles.css`** — 16 bloques numerados (ver encabezado). El filtro de pestañas es `.catalogo:not([data-filtro="todas"]) .producto:not(.coincide) { display: none }`: el servidor marca `.coincide` en la colección inicial y el JS la mueve; funciona con colecciones nuevas sin tocar CSS.
- **`js/script.js`** — IIFE con módulos: CONFIG, Consentimiento (banner), Almacen (localStorage solo con consentimiento), Analitica (GA4 con eventos `add_to_cart`, `begin_checkout`, `purchase`, `pedido_whatsapp`, `clic_whatsapp`, `clic_telefono`, `envio_formulario`), Toast, Menu, Catalogo (lee `#catalogo-datos`, pestañas accesibles con flechas), Carrito (líneas `{id, v, n}`, reconcilia con el catálogo vivo, foco atrapado), Pedido (validación, mensaje de WhatsApp, POST a `/api/wompi/firma`), RetornoPago (lee `?id=`, consulta `/api/wompi/transaccion`, estados APPROVED/PENDING/DECLINED/ERROR), PQR (radicado `PQR-AAAAMMDD-HHMM-XXXX` + WhatsApp).
- **`functions/index.js`** — `onRequest` para "/": lee los dos JSON por `env.ASSETS`, normaliza (`normalizarDatos`), y con HTMLRewriter cambia robots, portada, aviso, pestañas, descripción, tarjetas, datos del carrito, JSON-LD de productos y texto de domicilio. Todo texto del CMS se escapa. Si falla, devuelve el HTML estático. Exporta las funciones de render (también las usa la herramienta de la copia de respaldo). `SITIO_URL` se repite con el dominio.
- **`functions/api/wompi/firma.js`** — `onRequestPost`: valida llaves (pruebas vs producción), tamaño, ítems (cantidad 1–20, máx. 30 líneas, agrupa repetidos), disponibilidad y colección visible; suma domicilio si es fijo; referencia `EH-AAAAMMDD-HHMMSS-XXXXXX` (hora Colombia); firma SHA-256; arma la URL del Web Checkout con datos del cliente y dirección de envío. `ENVIAR_DIRECCION_A_WOMPI` permite apagar el envío de dirección si Wompi lo rechazara en pruebas.
- **`functions/api/wompi/transaccion.js`** — `onRequestGet`: consulta `GET /v1/transactions/{id}` en `sandbox.wompi.co` o `production.wompi.co` según la llave; solo devuelve referencias `EH-`.
- **`admin/config.yml`** — dos singletons: Productos (lista con uuid, nombre, colección por relación, tipo, descripción, foto, alt, medidas y precios, etiqueta, agotado, mostrar) y Ajustes (modo muestra, aviso, portada, colecciones, colección inicial, domicilio, pago en línea). Fotos a WebP 1600 px.
- **Accesibilidad aplicada:** el botón del carrito toma su nombre del texto ("Carrito" + `#carrito-n-texto` solo para lector de pantalla; en ≤500px "Carrito" se oculta a la vista pero se sigue leyendo); el aviso superior es un `<aside>` con etiqueta; el botón flotante de WhatsApp vive dentro del `<footer>` para quedar en un landmark; el carrito es `<div role="dialog">` con foco atrapado; en ≤360px el botón dice "Agregar" y el resto ("al carrito") queda solo para lector.
- **Pruebas hechas:** emulador oficial de Cloudflare Pages (wrangler 4.156): inyección del catálogo con datos modificados, firma verificada con SHA-256 independiente, errores de validación, domicilio fijo, 404 propia y cabeceras de `_headers`; prueba de punta a punta del flujo en escritorio y móvil (24 verificaciones cada una, consola limpia); axe-core sin violaciones en todas las páginas y estados (carrito, menú, toast, banner); html-validate sin errores; `admin/config.yml` válido contra el esquema oficial de Sveltia; sin desbordes en 17 anchos de 320 a 1920 px; Lighthouse local: Accesibilidad 100, SEO 100 con el Modo muestra apagado (69 mientras está en noindex, a propósito).

### 11 nov 2026 — v1.2 · Revisión en vivo (star-home-shop.pages.dev) y arreglos de móvil
Revisado con perfiles reales de iPhone SE/12 mini/13/15 Pro Max, Galaxy S8/S9+/S24/A55/Z Flip/Z Fold, Pixel 7, Moto G4, iPad Mini, Galaxy Tab y horizontal: sin desbordes ni errores de consola. Arreglado:
- **Dominio:** todo apuntaba a `estrellita-house.pages.dev` (no existe): canonical, og:image (la vista previa al compartir por WhatsApp salía sin imagen), JSON-LD, sitemap, robots, llms, `SITIO_URL` y `site_url`. Ahora `https://star-home-shop.pages.dev`.
- **`admin/config.yml`:** `backend.repo` ahora es `jxenterprise/Star-Home-shop` (antes un marcador).
- **Bug WhatsApp (`js/script.js → abrirWhatsApp`):** `window.open(url, '_blank', 'noopener')` SIEMPRE devuelve `null`, así que el código creía que estaba bloqueado: abría WhatsApp dos veces y la pestaña de la tienda se iba a WhatsApp (con cookies rechazadas se perdía el carrito). Ahora abre sin `noopener` y corta `opener` a mano.
- **Pago en línea sin llaves:** `functions/index.js → wompiConfigurado(env)` apaga `pagoEnLinea` si faltan `WOMPI_PUBLIC_KEY`/`WOMPI_INTEGRITY_SECRET`: el botón "Pagar en línea" no sale y la ayuda del carrito habla solo de WhatsApp. Aparece solo cuando se carguen las llaves en Cloudflare.
- **CSS:** `.contenedor`, aviso, menú móvil, carrito y cookies respetan `env(safe-area-inset-left/right)` (iPhone en horizontal, notch/isla); `.pie` con 96 px abajo en ≤900px para que el botón flotante no tape el crédito JX; `body.cookies-abierto` esconde el botón flotante mientras el banner está abierto en ≤600px de ancho o ≤520px de alto; banner de cookies con botones lado a lado también en ≤380px; enlaces del pie de 44 px de alto; `.boton--agregar` con `gap: .3em`.
- **`404.html`:** rutas absolutas (`/css/…`, `/js/…`, `/privacidad`…): en URLs profundas (`/a/b/c`) salía sin estilos.

- **Etiqueta de versión (v1.2):** `index.html` → `<p class="portada__version">` (ZONA EDITABLE · VERSIÓN, FUERA del `h1` porque el `h1` lo reescribe `functions/index.js`); `css/styles.css` → `.portada__version` (píldora `--estrella-suave` + estrella del logo, en el bloque 6) y retraso de animación para el 4.º hijo de `.portada__texto`. Nuevo `CHANGELOG.md`.
- **Pruebas v1.2:** wrangler 4.160 local (sin llaves de Wompi → botón oculto; con llaves `pub_test_`/`test_integrity_` falsas → botón visible y `/api/wompi/firma` firma bien) + Playwright con 6 perfiles (iPhone SE, iPhone 13, Galaxy S24, Pixel 7, iPhone 13 horizontal, iPad Mini): WhatsApp se abre una sola vez y la tienda se queda, sin desbordes, consola limpia, 404 profunda con estilos. Repetido en la vista previa de Cloudflare de la rama: todo OK. La copia de respaldo del catálogo se regeneró y coincide con el render del servidor. Ojo: Chromium no reproduce el notch de iPhone; lo de `safe-area` conviene mirarlo en un iPhone real.

## 🏷️ VERSIONES (cómo publicar una nueva)
Numeración `vMAYOR.MENOR`: sube MENOR en cada entrega de arreglos o funciones; MAYOR solo con un cambio grande (rediseño, catálogo real con dominio propio, etc.). Historial: v1.0 (29 oct 2026, entrega inicial) → v1.2 (11 nov 2026, revisión móvil; no hubo v1.1 publicada).

Al cerrar una entrega:
1. Cambiar el número en la ZONA EDITABLE · VERSIÓN de `index.html` (y nada más del HTML).
2. Agregar la entrega ARRIBA en `CHANGELOG.md` (fecha, qué se arregló, qué es nuevo).
3. Actualizar "📌 ESTADO ACTUAL" y sumar la entrada en "🧭 MAPA DEL CÓDIGO" de este archivo.
4. Commit, push de la rama y PR hacia `main`.
5. Etiqueta: `git tag -a vX.Y -m "…"` sobre el commit de la entrega y `git push origin vX.Y`. Si la PR se fusiona con "squash", mover la etiqueta al commit de `main` (`git tag -fa vX.Y <commit> && git push -f origin vX.Y`). En GitHub → Releases se puede crear la versión a partir de la etiqueta con el texto del CHANGELOG.
   ⚠ Desde las sesiones de Claude en la nube el push de etiquetas está BLOQUEADO (403 del proxy: solo se puede subir la rama de trabajo). En ese caso las crea JX en GitHub → **Releases → Draft a new release → Choose a tag** (escribir `vX.Y`, "Create new tag on publish"), con destino `main` después de fusionar la PR, y pega el texto de esa versión del CHANGELOG. `v1.0` va sobre el commit `f5f60a1` ("Add files via upload"; en el selector de destino → *Recent commits*).

## Herramienta: regenerar la copia de respaldo del catálogo
Si cambias el render de las tarjetas o los JSON y quieres actualizar la copia estática de `index.html`, crea fuera del proyecto un archivo `copia.mjs` con este contenido y ejecútalo con Node 18+ (`node copia.mjs`), ajustando `RAIZ`:

```js
import fs from 'node:fs/promises';
const RAIZ = '/ruta/a/estrellita-house';
const f = await import(`${RAIZ}/functions/index.js`);
const datos = f.normalizarDatos(
  JSON.parse(await fs.readFile(`${RAIZ}/contenido/catalogo.json`, 'utf8')),
  JSON.parse(await fs.readFile(`${RAIZ}/contenido/tienda.json`, 'utf8')));
let h = await fs.readFile(`${RAIZ}/index.html`, 'utf8');
const r = (re, v) => { h = h.replace(re, v); };
r(/<!-- PESTANAS:INICIO -->[\s\S]*?<!-- PESTANAS:FIN -->/, `<!-- PESTANAS:INICIO -->\n${f.renderPestanas(datos)}\n<!-- PESTANAS:FIN -->`);
r(/<!-- CATALOGO:INICIO -->[\s\S]*?<!-- CATALOGO:FIN -->/, `<!-- CATALOGO:INICIO -->${f.renderTarjetas(datos)}\n        <!-- CATALOGO:FIN -->`);
r(/(<p class="pestanas__desc" id="coleccion-desc" aria-live="polite">)[\s\S]*?(<\/p>)/, `$1${f.escaparHTML(f.descripcionInicial(datos))}$2`);
r(/(<div class="catalogo" id="catalogo-grid") data-filtro="[^"]*" role="tabpanel" aria-labelledby="[^"]*">/, `$1 data-filtro="${datos.coleccionInicial}" role="tabpanel" aria-labelledby="pestana-${datos.coleccionInicial}">`);
r(/(<script type="application\/json" id="catalogo-datos">)[\s\S]*?(<\/script>)/, `$1${f.renderDatosCliente(datos)}$2`);
r(/(<script type="application\/ld\+json" id="jsonld-productos">)[\s\S]*?(<\/script>)/, `$1${f.renderJsonLdProductos(datos)}$2`);
r(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${f.robotsPara(datos)}">`);
await fs.writeFile(`${RAIZ}/index.html`, h);
```

## Recordatorios para JX
- Los textos legales son una base profesional, **no asesoría legal**: deben revisarlos un abogado antes de publicar con productos reales.
- Antes de despachar un pedido pagado en línea, confirmar en el panel de Wompi que la transacción está **APROBADA** (la página es informativa; Wompi recomienda validar por su panel o webhooks).
- Sitio nuevo: verificar en Google Search Console y enviar el `sitemap.xml` cuando se apague el Modo muestra. Nunca borrar el archivo de verificación de Google.
- Recomendar a la dueña reclamar su ficha de Google Business Profile y mantener el NAP idéntico (nombre, teléfono; sin dirección pública si no hay local).
- Correr PageSpeed Insights tras el despliegue (en local: LCP 0,2 s escritorio / 0,8 s móvil simulado, CLS 0,003–0,019, TBT 0 ms).
