# CLAUDE.md — Estrellita House

Contexto para cualquier chat futuro (Claude u otra IA) que vaya a editar este proyecto. Léelo completo antes de tocar código.

## 📌 ESTADO ACTUAL (léelo primero — se actualiza en cada sesión)
_Última actualización: 11 nov 2026, 23:40 (hora de Colombia). Lee también "📍 DÓNDE NOS QUEDAMOS", justo debajo._

- **Versión en el código y en producción: v1.3** (subida a `main` el 11 nov 2026 ~23:40 con autorización de JX). La versión se ve en la portada, sobre el titular. Las etiquetas de git `v1.0` (commit `f5f60a1`) y `v1.2` (commit `b9423f3`) ya existen en la carpeta local de JX; falta subirlas (`git push origin v1.0 v1.2`) cuando JX autorice. Desde la sesión en la nube no se pudieron subir (bloqueo 403). Historial completo en `CHANGELOG.md`.
- **Sitio en vivo:** `https://star-home-shop.pages.dev` (Cloudflare Pages, producción = rama `main`). Cada rama/PR tiene vista previa en `https://<rama>.star-home-shop.pages.dev` (el bot de Cloudflare la comenta en la PR).
- **Repositorio:** `jxenterprise/Star-Home-shop`.
- **Flujo de trabajo (desde el 11 nov 2026):** JX trabaja en su carpeta local de VS Code (`…\Landing_Estrellita_House_v1\estrellita-house`), ya conectada a git en la rama `main`, siguiendo a `origin/main`. Los cambios se hacen y se prueban en local; JX los mira en `http://localhost:8788` con `npx wrangler pages dev . --port 8788`, que emula la Function igual que en Cloudflare. **NUNCA se hace commit+push a GitHub sin que JX lo autorice expresamente.** Al autorizar: commit, `git push origin main` (Cloudflare publica en ~30 s) y, si hay versión nueva, su etiqueta. Antes de empezar una sesión: `git fetch` + `git status`, para traer lo que se haya cambiado desde la nube o desde `/admin`, porque el CMS también hace commits en `main`.
- **Sigue en Modo muestra** (catálogo simulado, `noindex`).
- **Venta SOLO por WhatsApp (desde v1.3):** sin pago en línea (Wompi) y sin domicilios. JX lo pidió así porque es un emprendimiento pequeño y por ahora no hacen envíos en todo Cartagena. El código se borró; si vuelve, se recupera desde la etiqueta `v1.2`, corrigiendo antes las fallas de la memoria "wompi-activacion-pendiente".
- **Lo último que se hizo (v1.3):** se quitaron Wompi y los domicilios; el carrito calcula el total y lo manda por WhatsApp con un mensaje ordenado, sin precios repetidos; quitar un producto pide confirmación (ícono de basura azul + ventanita); el botón flotante pasó a azul noche. Detalle en el MAPA DEL CÓDIGO.
- **Próximo paso que anunció JX:** mandará las fotos reales de sábanas, cobijas, cortinas, etc. (las envió la vendedora). Se editan, se convierten a WebP y se hace "el mejor diseño para mostrar y vender".
- **Preguntas abiertas a JX:**
  1. Imagen para compartir (`og:image`) en JPG como excepción a la regla WebP: las fuentes no coinciden en si WhatsApp muestra WebP siempre. Pendiente su decisión o probar pegando el enlace en un chat.
  2. Montar el autenticador de Sveltia (`base_url` en `admin/config.yml`); mientras tanto `/admin` solo entra con token de GitHub.
  3. En 320–390 px el selector de medida se ve cortado ("Sencilla 10…"); al tocarlo se ve completo. No se cambió; JX decide.
  4. En el pie dice "WhatsApp:" pero el enlace es `tel:` (llama). Confirmar si debe abrir el chat.
- **Antes de tocar nada en una sesión nueva:** leer este archivo completo (sobre todo "📍 DÓNDE NOS QUEDAMOS") y `CHANGELOG.md`, y correr `git fetch` + `git status`.

## 📍 DÓNDE NOS QUEDAMOS (bitácora con fecha y hora — hora de Colombia, UTC−5)
_Lo más nuevo arriba. Cada sesión agrega su entrada aquí antes de terminar._

### 11 nov 2026, 23:40 — v1.3 subida a GitHub (`main`) · SIGUIENTE: fotos reales de la vendedora
- **Estado al cerrar:** la v1.3 quedó subida a `main` con autorización de JX, así que Cloudflare la publica sola en `star-home-shop.pages.dev`. Las etiquetas `v1.0`, `v1.2` y `v1.3` también quedaron subidas. Si alguna falla, ver la última línea de esta entrada.
- **Lo que JX va a mandar en la próxima sesión:** las **fotos reales que le mandó la vendedora**: sábanas, **cobijas**, cortinas y demás productos. Pidió "editar bien chévere esas fotos y hacer el mejor diseño de todos para mostrar y vender".
- **Plan para esa sesión (en orden):**
  1. Recibir las fotos y guardarlas en una carpeta de trabajo fuera del proyecto (scratchpad). Nunca meter JPG/PNG/HEIC al proyecto.
  2. Pedirle a JX, por cada producto: nombre, colección (Navidad, Halloween, Todo el año o una nueva), medidas y precio de cada medida, y si alguno lleva etiqueta (Nuevo, Oferta…). Sin precios no se apaga el Modo muestra.
  3. Editar las fotos: recorte cuadrado 1:1, centradas, luz y color parejos, fondo limpio y coherente con `--lino`, sin marcas de agua ni logos de la vendedora. Exportar a **WebP** de 1600 px de máximo (la tarjeta muestra 800×800), nombres descriptivos en minúscula con guiones (p. ej. `img/productos/cobija-...-navidad.webp`) y `alt` que describa lo que se ve.
  4. Agregar **"Cobijas"** a `admin/config.yml` → `categoria` → `options` (hoy no existe) y crear los productos en `contenido/catalogo.json`, desde `/admin` o a mano con el mismo formato; borrar los productos simulados que ya no apliquen. Regenerar la copia de respaldo del catálogo (herramienta al final de este archivo).
  5. Diseño "para mostrar y vender": proponerle a JX ideas ANTES de construir, siempre con este mismo diseño (ver REGLA DE DISEÑO). Por ejemplo: varias fotos por producto con galería o deslizador, ver la foto en grande al tocarla, fotos de ambiente en la portada o una sección de destacados. Preguntar cuáles quiere.
  6. Cuando los productos y precios sean reales: apagar el **Modo muestra** (quita la barra "Catálogo de muestra" y permite que Google indexe).
  7. Probar en celulares (iPhone SE, iPhone 13, Galaxy S24) y en escritorio, mostrarle a JX en `http://localhost:8788` y subir SOLO cuando lo autorice. Será la **v1.4**.
- **Preguntas abiertas que siguen vigentes:** ver la lista en "📌 ESTADO ACTUAL".
- Si el push o las etiquetas no subieron, revisar con `git status` y `git ls-remote --tags origin`.

### 11 nov 2026, 23:37 — v1.3 (parte 2): mensaje de WhatsApp, confirmar al quitar e ícono de basura
- JX vio que en el mensaje de WhatsApp el precio salía repetido. Nuevo formato en `js/script.js → Pedido.textoPedido`: ver MAPA DEL CÓDIGO, entrada "v1.3 (parte 2)".
- JX pidió que al quitar un producto del carrito se pregunte antes. Se hizo con un `<dialog>` de confirmación que también sale con "−" cuando queda 1 unidad.
- JX pidió cambiar el enlace "Quitar" por un **ícono de basura azul**.
- La vista previa de la página de WhatsApp (`api.whatsapp.com`) muestra el texto pegado en una sola línea: es así en esa página. En el chat sí salen los saltos de línea y las negritas.

### 11 nov 2026, tarde-noche — v1.3 (parte 1): solo WhatsApp
- Se quitaron Wompi y los domicilios, y el botón flotante pasó a azul. Ver la entrada v1.3 del MAPA DEL CÓDIGO.

### 11 nov 2026, tarde — carpeta local conectada a GitHub
- La carpeta local de VS Code de JX era idéntica a la v1.0. Se conectó a git (`main` → `origin/main`) y se trajo la v1.2. Desde ahí se trabaja en local y se sube SOLO con autorización de JX.

### 11 nov 2026, ~18:00–18:35 — v1.2 (sesión en la nube)
- Revisión móvil en vivo, dominio corregido y bug de WhatsApp doble. Se fusionó la PR #1 a `main` (~18:30) y quedó publicada.

### 29 oct 2026 — v1.0
- Entrega inicial (catálogo simulado, Modo muestra).

## Qué es

Landing de una sola página para **Estrellita House**, emprendimiento de la novia de JX en Cartagena (Ciudadela La Paz, El Pozón; por ahora sin domicilios: todo se coordina por WhatsApp) que vende **sábanas, cortinas, tapetes y decoración de temporada** (Navidad, Halloween y básicos para todo el año).

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
js/script.js        → pestañas, carrito (suma el total) y pedido
        │
        └─ Enviar pedido por WhatsApp → wa.me con cada producto, su medida,
                                       cantidad, valor, el TOTAL y el nombre
                                       (pago y entrega se acuerdan en el chat)
```

- **Copia de respaldo del catálogo:** dentro de `index.html`, entre `<!-- CATALOGO:INICIO -->` y `<!-- CATALOGO:FIN -->` (y en las pestañas, `#catalogo-datos` y `#jsonld-productos`), hay una copia estática generada con el MISMO render de `functions/index.js`. Sirve si la Function falla y para ver la página en local sin emulador. **No se edita a mano.** Si cambias el marcado de las tarjetas en `functions/index.js`, regenera la copia (ver "Herramienta: regenerar la copia" al final).
- **Precios:** la verdad está en `contenido/catalogo.json`. El total del carrito es informativo: el precio final se confirma por WhatsApp (no hay cobro en línea).
- **Sin pago en línea ni domicilios desde v1.3** (ver ESTADO ACTUAL).

## Estructura de archivos

```
estrellita-house/
├── index.html                 landing (HTML real + copia de respaldo del catálogo)
├── 404.html                   error con el diseño del sitio
├── privacidad.html            política de datos (Ley 1581 de 2012)
├── cookies.html               política de cookies + tabla
├── terminos.html              términos + propiedad intelectual
├── politicas-de-compra.html   compras, entregas, retracto, garantía, reversión + formulario PQR
├── _headers                   caché de css/js/contenido + cabeceras de seguridad
├── robots.txt                 permite bots de IA; bloquea /admin/
├── sitemap.xml                solo "/" (legales con noindex)
├── llms.txt                   mapa del sitio para IA
├── site.webmanifest
├── favicon.ico / favicon.svg / apple-touch-icon.png   (excepción técnica, no WebP)
├── CLAUDE.md / README.md
├── .gitignore                 .wrangler/, node_modules/, .dev.vars
├── CHANGELOG.md               historial de versiones (v1.0, v1.2, v1.3…), la más nueva arriba
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
    └── index.js               "/" → inyecta el catálogo vivo (HTMLRewriter)
```

## Dónde editar cada cosa

| Qué | Dónde | Quién |
|---|---|---|
| Productos, fotos, medidas, precios, agotado, ocultar | `/admin` → Productos (`contenido/catalogo.json`) | La dueña |
| Colecciones/pestañas y cuál se ve primero | `/admin` → Ajustes de la tienda | La dueña |
| Título y subtítulo de la portada | `/admin` → Ajustes → Portada | La dueña |
| Barra de aviso / Modo muestra | `/admin` → Ajustes | La dueña o JX |
| Número de WhatsApp | ZONA CONTACTO de `index.html` + ver "⚠ SE REPITE EN" | JX |
| Nota de IVA | ZONA TEXTOS de `index.html` | JX |
| Textos de "Cómo comprar", carrito y preguntas | `index.html` (y FAQPage del `<head>`) | JX |
| Textos legales | generador de páginas (ver abajo) o directamente en cada `.html` | JX |
| GA4 (Measurement ID) | `js/script.js` → `CONFIG.ga4` | JX |
| Repositorio y autenticador del CMS | `admin/config.yml` → `backend` | JX |

## {POR CONFIRMAR} pendientes

1. **Nombre exacto del negocio** (JX dijo "más o menos Estrellita House").
2. **Catálogo real:** productos, fotos, medidas y precios (todo lo actual es simulado).
3. **IVA:** si los precios lo incluyen o si el negocio no es responsable de IVA (nota en `index.html` y `terminos.html`).
4. **Datos legales del responsable:** nombre completo o razón social, cédula o NIT, dirección para notificaciones y correo (privacidad, términos y políticas de compra; el art. 50 de la Ley 1480 los exige a quien vende en línea).
5. **Medios de pago aceptados por WhatsApp** (Nequi, transferencia, efectivo contra entrega…).
6. **Forma y tiempo de entrega** (hoy se acuerdan por WhatsApp; cuando haya domicilios se vuelven a agregar).
7. **Política de cambios** (plazo y condiciones).
8. **Término de garantía** anunciado (si no se anuncia, la ley fija 1 año).
9. **Measurement ID de GA4** (`CONFIG.ga4`; mientras sea `G-XXXXXXXXXX` no se carga nada).
10. **Dominio final** (canonical, og, JSON-LD, sitemap, robots, llms, `SITIO_URL` en `functions/index.js`, `site_url` en `admin/config.yml`).
11. **URL del autenticador** de Sveltia (`admin/config.yml`; el repositorio ya está).
12. ~~Cuenta de Wompi~~: el pago en línea se retiró en v1.3.
13. **Redes sociales** (Instagram/Facebook) para el pie y `sameAs` del JSON-LD.
14. **Horario de atención** por WhatsApp (para `openingHoursSpecification`).
15. ~~Ciudadela La Paz como punto de despacho~~: ya no se muestra en la página (v1.3).

## Decisiones tomadas (y por qué)

- **Landing de una página** (lo pidió JX) con catálogo, carrito y CMS: el catálogo vive en JSON y se inyecta en el servidor para cumplir "HTML real en el view-source" sin build step.
- **CMS git-based: Sveltia CMS** (JX eligió CMS git-based). Se escogió Sveltia sobre Decap porque convierte las fotos a **WebP al subirlas** (regla de JX) y tiene la interfaz en español de Colombia (`es-CO`). El `config.yml` se validó contra el esquema JSON oficial del paquete `@sveltia/cms@0.254.0`.
- **Pago (v1.3, 11 nov 2026): SOLO WhatsApp.** JX pidió quitar Wompi ("es apenas un mini emprendimiento") y los domicilios (por ahora no cubren todo Cartagena). Antes (v1.0–v1.2) era "las dos opciones" (WhatsApp o Wompi), como eligió JX al inicio. Wompi por **Web Checkout** (redirección a `checkout.wompi.co/p/`): no carga scripts de terceros en la página. Firma de integridad SHA-256 de `referencia + centavos + COP + secreto`, calculada SOLO en el servidor.
- **El botón "Enviar pedido por WhatsApp" del carrito** es parte del pedido (lleva el detalle armado), no un botón de contacto extra; el único botón de WhatsApp de contacto es el flotante.
- **Sin mapa:** el negocio no tiene local abierto al público. Hasta v1.2 lo reemplazaba la sección "Domicilios en Cartagena", que se quitó en v1.3.
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
  - `--error: #A3262E` (errores de formularios). **WhatsApp NO usa verde** (decisión de JX, v1.3): el botón flotante y el del carrito van en `--noche`.
- Tipografías: **Fraunces** (títulos, 500–600, serif suave) y **Manrope** (texto, 400–700). Google Fonts, carga no bloqueante.
- Escala: h1 portada `clamp(2.35rem, 1.45rem + 3.9vw, 4.4rem)`; h2 `clamp(1.75rem, 1.3rem + 1.8vw, 2.6rem)`; cuerpo 1rem/1.6; precios 1.15rem 800 con cifras tabulares.
- Radios: `--radio-s: 10px` (campos), `--radio-m: 16px` (tarjetas), `--radio-l: 24px` (bloques), botones `999px` (píldora).
- Sombras: `--sombra-1` suave para elevar; `--sombra-2` para paneles flotantes (carrito, cookies). Sin brillos ni neones.
- Patrones de componente:
  - Botones píldora de 48 px mínimo: `.boton--principal` (noche), `.boton--secundario` (borde noche), `.boton--agregar`; un ícono dentro de un botón lleva `.boton__icono` (toma el color del texto).
  - Botón flotante de WhatsApp: círculo `--noche` con anillo blanco.
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

Productos, precios, colecciones, portada y aviso **no** llevan zona: viven en `contenido/*.json` (CMS). La región `CATALOGO:INICIO/FIN` es una copia automática, no una zona editable.

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

### 11 nov 2026 — v1.3 · Solo WhatsApp: fuera el pago en línea (Wompi) y los domicilios
Pedido de JX: "es apenas un mini emprendimiento": todo el pedido (con sus cálculos) va por WhatsApp; el botón flotante de WhatsApp en el azul de la web, no verde; por ahora no hay envíos a domicilio en todo Cartagena. El código se BORRÓ, no se apagó: para recuperarlo, sacarlo de la etiqueta `v1.2`.
- **Borrado:** `functions/api/wompi/` completo (`firma.js`, `transaccion.js`); en `index.html` la sección "Domicilios y pagos" (`#domicilios`, `#domicilio-texto`), su enlace del menú, la ventana de resultado del pago (`#pago-fondo`), el botón "Pagar en línea" (`#boton-wompi`), las filas Subtotal/Domicilio del carrito y los campos celular, barrio, dirección, indicaciones y correo; en `js/script.js` el módulo RetornoPago, `pagarEnLinea`, `valorDomicilio`, `vaciar`, `Almacen.borrar`, las claves `clavePedido`/`claveCompras` y los eventos GA4 `begin_checkout`/`purchase`; en `functions/index.js` `wompiConfigurado`, `datos.domicilio`, `datos.pagoEnLinea` y el reemplazo de `#domicilio-texto`; en `contenido/tienda.json` y `admin/config.yml` los ajustes `domicilio` y `pago_en_linea`; en el CSS el bloque 9 (Domicilios y pagos), la ventana `.modal*`, `.boton--whatsapp`, `.resumen__extra` y las variables `--whatsapp`, `--whatsapp-texto` y `--exito` (el CSS quedó con 15 bloques).
- **Carrito y pedido:** el resumen muestra solo el **Total** (`Carrito.totalPedido()`) y la nota `.resumen__nota` ("El pago y la entrega los acordamos contigo por WhatsApp"). El formulario pide solo **nombre** + casilla de autorización; el botón es `.boton--principal` con el ícono `.boton__icono` (toma el color del texto) y dice "Enviar pedido por WhatsApp". Mensaje que se envía: un renglón `• N × Producto (Medida): $valor` por línea, `Total: $X` y `Mi nombre: …`. Al cargar se borran del navegador las claves viejas `eh_pedido_wompi_v1` y `eh_compras_medidas_v1` (`CONFIG.clavesViejas`).
- **Botón flotante (`.wa-flotante`):** fondo `--noche` + anillo blanco de 3 px (`box-shadow`), para que se vea también sobre el pie, que es del mismo azul; hover `--noche-700`.
- **Textos:** portada, meta description, og, twitter, JSON-LD (sin `paymentAccepted`; preguntas nuevas: ¿Cómo hago mi pedido?, ¿Cómo puedo pagar?, ¿Cómo recibo mi pedido?, ¿Puedo devolver un producto?), pasos 3 y 4 de "Cómo comprar", preguntas frecuentes, pie ("Pedidos por WhatsApp"), `llms.txt`, `site.webmanifest`, `robots.txt` (sin `/api/`). El enlace legal ahora dice "Compras, entregas y devoluciones".
- **Legales (fecha 11 nov 2026):** políticas de compra (cómo comprar por WhatsApp, medios de pago por chat, sección "3. Entregas" en vez de "Domicilios"; la reversión del pago se mantiene por si pagan con un instrumento electrónico), privacidad (datos: nombre + lo que se escriba por WhatsApp; sin Wompi ni domiciliario), términos (pedidos y pagos solo por WhatsApp) y cookies (sin las dos claves de Wompi).
- **Diseño:** "Preguntas" pasó a fondo blanco para seguir alternando con "Cómo comprar" (algodón), que quedó justo antes al salir Domicilios.
- **Pruebas v1.3 (parte 1):** wrangler 4 local + playwright-core con el Chrome de JX (iPhone SE, iPhone 13, Galaxy S24, escritorio): ningún rastro de Wompi/domicilio en el HTML ni en las legales, botón flotante `rgb(28, 37, 65)`, total correcto ($84.900 × 2 + $32.900 = $202.700), mensaje de WhatsApp correcto, valida nombre y autorización, la tienda se queda abierta, `/api/wompi/firma` ya no responde, sin desbordes y consola limpia.

### 11 nov 2026, 23:37 — v1.3 (parte 2) · Mensaje de WhatsApp, confirmar al quitar e ícono de basura
- **Mensaje (`js/script.js → Pedido.textoPedido`):** empieza con `¡Hola, Estrellita House! ✨` / `Quiero hacer este pedido:`. Cada producto va en su bloque: `*Nombre*` (negrita de WhatsApp) y `Medida: …`. Con **un solo producto** no lleva precio propio: solo el `*Total*`, más `Cantidad: n ($X c/u)` si son varias unidades. Con **varios productos** van numerados (`1.`, `2.`…) y cada uno lleva `Precio: $X` o `Cantidad: n × $unit = $sub`. Cierra con `*Total: $X*` (más `(N unidades)` si son más de 1), `A nombre de: …` y "¿Me confirman disponibilidad, forma de pago y entrega? ¡Gracias!". La vista previa de `api.whatsapp.com` muestra el texto en una sola línea; en el chat sí salen los saltos y las negritas.
- **Confirmar al quitar:** `index.html` → `<dialog class="confirmar" id="confirmar-quitar">`, FUERA de `#carrito` para que su Escape no cierre el carrito. Tiene foto `#confirmar-foto`, título "¿Quitar este producto?", texto `#confirmar-texto` (nombre · medida · unidades) y los botones `data-confirmar="no"` (Cancelar, enfocado al abrir) y `data-confirmar="si"`. JS en `Carrito`: `pedirConfirmacion(indice, boton)` abre con `showModal()`; `iniciarConfirmacion()` cierra con los botones o al tocar el fondo oscuro, que se reconoce por coordenadas FUERA de `getBoundingClientRect()` porque `e.target === dialogo` también es cierto en su relleno blanco. En el evento `close` borra solo si `returnValue === 'si'`; si no, devuelve el foco al botón de origen. Si el navegador no tiene `<dialog>`, usa `window.confirm`. Pregunta con el ícono de basura y con "−" cuando la línea tiene 1 unidad; con más unidades "−" resta sin preguntar. CSS `.confirmar*` y `::backdrop` en el bloque 11; en ≤380 px los botones se apilan.
- **Ícono de basura:** `.item__quitar` es un botón de 44×44 px con un SVG de basura en `--noche`, en la esquina superior derecha de cada producto (`.item { position: relative }`; `.item__nombre` y `.item__variante` con `padding-right: 40px`). Se llama "Quitar <producto> del carrito" para lectores de pantalla; hover `--algodon`.
- **Revisión con 3 agentes en navegador real** (accesibilidad, celulares con el dedo y mensaje de WhatsApp en 5 casos):
  - Todo bien: foco, Escape, árbol de accesibilidad, doble toque, sumas y codificación.
  - El único problema real fue el toque dentro de la tarjeta blanca, que la cerraba. Quedó arreglado y se volvió a probar en iPhone SE, iPhone 13 y Galaxy S24.
  - La prueba general (4 dispositivos + legales + 404) da TODO OK.
  - **Menor, sin cambiar:** si el nombre del cliente lleva asteriscos (`*Test*`), WhatsApp lo pone en negrita. Es inofensivo.

## 🏷️ VERSIONES (cómo publicar una nueva)
Numeración `vMAYOR.MENOR`: sube MENOR en cada entrega de arreglos o funciones; MAYOR solo con un cambio grande (rediseño, catálogo real con dominio propio, etc.). Historial: v1.0 (29 oct 2026, entrega inicial) → v1.2 (11 nov 2026, revisión móvil; no hubo v1.1 publicada) → v1.3 (11 nov 2026, solo WhatsApp; en local hasta que JX autorice subirla).

Al cerrar una entrega:
1. Cambiar el número en la ZONA EDITABLE · VERSIÓN de `index.html` (y nada más del HTML).
2. Agregar la entrega ARRIBA en `CHANGELOG.md` (fecha, qué se arregló, qué es nuevo).
3. Actualizar "📌 ESTADO ACTUAL" y sumar la entrada en "🧭 MAPA DEL CÓDIGO" de este archivo.
4. Cuando JX AUTORICE: commit en `main` local y `git push origin main` (ver "Flujo de trabajo" arriba).
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
- Sitio nuevo: verificar en Google Search Console y enviar el `sitemap.xml` cuando se apague el Modo muestra. Nunca borrar el archivo de verificación de Google.
- Recomendar a la dueña reclamar su ficha de Google Business Profile y mantener el NAP idéntico (nombre, teléfono; sin dirección pública si no hay local).
- Correr PageSpeed Insights tras el despliegue (en local: LCP 0,2 s escritorio / 0,8 s móvil simulado, CLS 0,003–0,019, TBT 0 ms).
