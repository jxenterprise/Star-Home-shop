# CLAUDE.md — Star Home (antes "Estrellita House")

Contexto para cualquier chat futuro (Claude u otra IA) que vaya a editar este proyecto. Léelo completo antes de tocar código.

## 📌 ESTADO ACTUAL (léelo primero — se actualiza en cada sesión)
_Última actualización: 12 nov 2026, 11:55 (hora de Colombia). Lee también "📍 DÓNDE NOS QUEDAMOS", justo debajo._

- **Marca: STAR HOME** (desde v1.4). Es el nombre del logo de la empresa (foto `1.jpeg` del ZIP y portada del PDF). "Estrellita" es la dueña (la novia de JX); "Estrellita House" fue un nombre provisional de v1.0–v1.3. En el código quedan nombres internos viejos a propósito: claves del navegador `eh_consentimiento_v1` (para no volver a preguntar las cookies) y los id/clases `carrito` del panel "Mi lista".
- **Versión en el código y en producción: v1.4** (catálogo real sin precios, logo y colores de la marca) + su **ajuste del mediodía** (PR #3): letras propias en `/fonts` y logo de la portada visible desde el primer instante. Se ve en la portada sobre el titular. Historial en `CHANGELOG.md`.
- **Letras propias (desde el ajuste de v1.4):** Cormorant Garamond, Montserrat y Great Vibes se sirven desde `/fonts` con `@font-face` (inicio de `css/styles.css`) y se precargan en el `<head>`. Ya NO se usa Google Fonts. Si algún día se vuelve a poner un enlace con `&` en un `<link rel="preload|preconnect">`, va con `&` SIN escapar: Cloudflare copia ese `href` tal cual a la cabecera `Link` (ver bitácora).
- **Sitio en vivo:** `https://star-home-shop.pages.dev` (Cloudflare Pages, producción = rama `main`). Cada rama/PR tiene vista previa en `https://<rama>.star-home-shop.pages.dev`.
- **Repositorio:** `jxenterprise/Star-Home-shop`.
- **Flujo de trabajo:** JX trabaja a veces en su carpeta local de VS Code (rama `main`) y a veces con Claude en la nube (rama `claude/…` + PR + fusión a `main`). **NUNCA se sube a GitHub sin que JX lo autorice expresamente** (en esta sesión lo autorizó: "subes a github y push y cloudflare despliegue"). Antes de empezar: `git fetch` + `git status`, porque el CMS (`/admin`) y otras sesiones también hacen commits en `main`. En la nube el push de etiquetas (`git push origin vX.Y`) está bloqueado: las crea JX en GitHub → Releases.
- **Catálogo REAL desde v1.4:** 81 productos con los nombres y códigos del PDF de JX, **SIN PRECIOS** (pedido de la dueña: los clientes preguntan por WhatsApp). Modo muestra **apagado** → Google indexa la página.
- **Venta SOLO por WhatsApp** (desde v1.3): sin pago en línea ni domicilios. Cada producto tiene su botón "Consultar" (WhatsApp con nombre + código + enlace a la foto) y "Mi lista" junta varios.
- **Logo de Star Home sobre el logo del proveedor** en 59 fotos (ÉVORA, VELUNA y Duvellar Home con su teléfono 311 273 4641), por decisión de JX y tal como lo hizo él en su PDF. Recomendación dada a JX: confirmar con el proveedor que está de acuerdo o pedirle fotos sin marca.
- **Preguntas abiertas a JX:**
  1. Imagen para compartir (`og:image`) en JPG como excepción a la regla WebP: las fuentes no coinciden en si WhatsApp muestra WebP siempre. Probar pegando el enlace en un chat.
  2. Autenticador de Sveltia (`base_url` en `admin/config.yml`); mientras tanto `/admin` solo entra con token de GitHub.
  3. En el pie dice "WhatsApp:" pero el enlace es `tel:` (llama). ¿Debe abrir el chat?
  4. Datos legales del responsable, IVA, medios de pago y entregas (ver pendientes).
- **Antes de tocar nada en una sesión nueva:** leer este archivo completo (sobre todo "📍 DÓNDE NOS QUEDAMOS") y `CHANGELOG.md`, y correr `git fetch` + `git status`.

## 📍 DÓNDE NOS QUEDAMOS (bitácora con fecha y hora — hora de Colombia, UTC−5)
_Lo más nuevo arriba. Cada sesión agrega su entrada aquí antes de terminar._

### 12 nov 2026, 11:15–11:55 — v1.4 (ajuste): revisión en producción, cabecera `Link` rota y letras propias
- **Qué pasó:** al medir producción después de fusionar la PR #2, Lighthouse celular dio **81** (95 en local; FCP 2,9 s, LCP 4,2 s). Causa: Cloudflare Pages arma sola la cabecera HTTP `Link` (Early Hints) con los `<link rel="preload|preconnect">` del HTML, copiando el `href` TAL CUAL, sin convertir `&amp;` en `&`. Cada visita pedía una hoja de Google Fonts rota (solo Cormorant, 5,8 KB de más, prioridad máxima) y Chrome avisaba "preloaded but not used". La batería de pruebas no lo veía porque solo contaba errores de consola; ahora también cuenta los avisos (`warning`).
- **Qué se hizo:** letras propias en `/fonts` (los mismos archivos de Google, idénticos byte a byte, mismos pesos: se ven igual) con precarga; fuera las 2 conexiones a Google (y "Google Fonts" de `cookies.html`); el logo de la portada (elemento LCP) ahora entra desde 40 % de opacidad y sin retraso.
- **Resultado en la vista previa real de Cloudflare:** celular **95–99**/100/100 (FCP 1,0 s, LCP 2,0–2,2 s, CLS 0), escritorio **100**/100/100 (SEO 69 solo por el `noindex` de las vistas previas); 140/140 pruebas; anclas a 84 px exactos. Capturas local contra producción en iPhone 13: 0 píxeles distintos.
- **SIGUIENTE:** lo mismo de la entrada de abajo (JX dijo que después hablan de cosas nuevas). PR #3 → `main` con autorización de JX ("subes a github y push y cloudflare despliegue"; "no pares hasta terminar y quede todo perfecto"). La etiqueta `v1.4` la crea JX en GitHub → Releases sobre el último commit de `main`.

### 12 nov 2026, 00:20–11:15 — v1.4: Star Home, catálogo real sin precios (sesión en la nube)
- **Qué mandó JX:** ZIP "Star Home" con 83 fotos (81 productos + el logo `1.jpeg` + una repetida: `25.png` y `26` son la misma) y su PDF "Catálogo Star Home 2026" (41 páginas, 14 MB) con nombres, códigos y secciones. Pidió: productos SIN precio (la dueña quiere que pregunten por WhatsApp), "que se vean bien y se puedan seleccionar bien" (carrusel o lo mejor), el logo de Star Home en la web y en las fotos "ahí mismo donde está el otro logo" (como en su PDF), la web con los colores del logo y un botón "Descargar catálogo" junto al título.
- **Qué se hizo:** todo lo de la entrada v1.4 del MAPA DEL CÓDIGO y del `CHANGELOG.md`: marca Star Home, 81 productos con códigos del PDF, pestañas + filtros como el PDF, botón Consultar, visor a pantalla completa tipo carrusel, "Mi lista", botón Descargar catálogo, paleta y letras del logo/PDF, Modo muestra apagado, CMS nuevo, legales al día.
- **Fotos:** se usaron las ORIGINALES del ZIP en alta y se les puso el logo de Star Home exactamente donde JX lo puso en su PDF (se detectó la posición comparando cada foto del PDF con su original). Ver "Herramienta: fotos nuevas con el logo".
- **Preguntas que JX no contestó** (decidido así, fácil de cambiar): Modo muestra apagado (Google indexa); "Mi lista" + botón directo (se dejaron los dos).
- **Pruebas:** 140 comprobaciones en 19 pantallas + axe + html-validate + Lighthouse (celular 95/100/100/100, escritorio 97/100/100/100). Detalle en el MAPA DEL CÓDIGO.
- **SIGUIENTE:** JX dijo que después hablan de cosas nuevas. Ideas propuestas en el mensaje final de la sesión (ver también "Recordatorios").

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

Landing de una sola página para **Star Home** ("Textiles para tu hogar"), el emprendimiento de Estrellita (la novia de JX) en Cartagena (Ciudadela La Paz, El Pozón; sin domicilios por ahora: todo se coordina por WhatsApp). Vende **sábanas** (estampadas sencilla, doble, queen y king, y satinadas de rayas), **cobijas navideñas**, **cortinas** (navideñas, clásicas y jacquard) y **almohadas**.

- Proyecto de JX Company (lleva el crédito "Diseño y desarrollo: JX Company" en el pie).
- Hecho con la skill `skill-jx-landing-pages-2026` (auditoría de 24 puntos).
- Hosting: Cloudflare Pages, en la cuenta de JX (cliente básico). Dominio actual: `star-home-shop.pages.dev` (si llega un dominio propio, cambiarlo en todos los sitios del punto 10 de pendientes). Repositorio: `jxenterprise/Star-Home-shop`, rama `main`.
- Idioma: solo español.

### Catálogo REAL y SIN PRECIOS (desde v1.4)

Los 81 productos salen del PDF de JX ("Catálogo Star Home 2026"), con sus códigos de referencia: **CB** cobijas, **CT** cortinas, **SB** sábanas, **AL** almohadas. La dueña NO quiere publicar precios: cada tarjeta dice "Medida…" (o "Medida: consúltala por WhatsApp") y el botón **Consultar** abre WhatsApp con el producto ya escrito. El campo `precio` existe en el CMS como OPCIONAL: si algún día se llena, se muestra en la tarjeta, el visor y la lista. El Modo muestra está apagado (`tienda.json → "modo_muestra": false`).

## Cómo funciona (arquitectura)

```
Dueña edita en /admin (Sveltia CMS)
        │  commit en GitHub
        ▼
contenido/catalogo.json  +  contenido/tienda.json   (+ catalogo/*.pdf)
        │  Cloudflare Pages redespliega (1–2 min)
        ▼
functions/index.js  → en cada visita a "/" toma index.html y le inyecta el
                      catálogo vivo con HTMLRewriter: pestañas, filtros,
                      tarjetas (con su enlace "Consultar" de WhatsApp ya
                      armado), datos para el JS, JSON-LD, portada, aviso,
                      botón del PDF y robots. HTML real, sin build step.
        ▼
js/script.js        → pestañas y filtros, visor de fotos (carrusel), "Mi lista"
        │
        ├─ Consultar (tarjeta o visor) → wa.me con *Nombre* (tipo), Ref., medida
        │                                y "Foto: …/#p-<id>" (enlace real, sirve sin JS)
        └─ Mi lista → wa.me con todos los productos, códigos, cantidades y el
                      nombre del cliente (pide autorización de datos)
```

- **Copia de respaldo del catálogo:** dentro de `index.html`, entre `<!-- PESTANAS:INICIO/FIN -->`, `<!-- FILTROS:INICIO/FIN -->` y `<!-- CATALOGO:INICIO/FIN -->` (y en `#catalogo-datos` y `#jsonld-productos`), hay una copia estática generada con el MISMO render de `functions/index.js`. Sirve si la Function falla y para ver la página en local sin emulador. **No se edita a mano**: si cambias `contenido/*.json` a mano o el render de `functions/index.js`, regenera la copia (herramienta al final).
- **Enlace directo a un producto:** `https://star-home-shop.pages.dev/#p-<id>` (p. ej. `#p-sb-09`) abre el visor en ese producto. Lo trae el mensaje de "Consultar" para que la tienda vea la foto.
- **Sin precios, sin pago en línea y sin domicilios** (ver ESTADO ACTUAL).

## Estructura de archivos

```
Star-Home-shop/
├── index.html                 landing (HTML real + copia de respaldo del catálogo)
├── 404.html                   error con el diseño del sitio (rutas absolutas)
├── privacidad.html            política de datos (Ley 1581 de 2012)
├── cookies.html               política de cookies + tabla (eh_consentimiento_v1, sh_lista_v1)
├── terminos.html              términos + propiedad intelectual (precios por WhatsApp)
├── politicas-de-compra.html   compras, entregas, retracto, garantía, reversión + formulario PQR
├── _headers                   caché (css/js/contenido sin caché; img 1 día; PDF 1 hora; fonts 1 año) + seguridad
├── robots.txt                 permite bots de IA; bloquea /admin/
├── sitemap.xml                solo "/" (legales con noindex)
├── llms.txt                   mapa del sitio para IA
├── site.webmanifest
├── favicon.ico / favicon.svg  estrella dorada sobre café (excepción técnica, no WebP)
├── apple-touch-icon.png       logo de Star Home 180×180 (excepción técnica)
├── CLAUDE.md / README.md / CHANGELOG.md
├── .gitignore                 .wrangler/, node_modules/, .dev.vars
├── css/styles.css             todo el CSS (@font-face + variables :root, mobile-first, 16 bloques)
├── js/script.js               todo el JS (módulos comentados)
├── fonts/                     letras propias woff2, subconjunto latin (Cormorant Garamond v21,
│                              Montserrat v31, Great Vibes v21) + LICENCIAS.txt (SIL OFL 1.1)
├── catalogo/
│   └── catalogo-star-home-2026.pdf     el PDF de JX (14 MB) del botón "Descargar catálogo"
├── img/                       TODO en WebP
│   ├── logo-star-home.webp              (1000×1000, portada en pantallas grandes)
│   ├── logo-star-home-600.webp          (600×600, portada en celular = LCP; JSON-LD)
│   ├── logo-star-home-132.webp          (132×132, cabecera y pie)
│   ├── og-star-home-cartagena.webp      (1200×630, vista previa al compartir)
│   └── productos/<ref>-<nombre>.webp       foto grande (máx. 1400 px, visor)
│       productos/<ref>-<nombre>-mini.webp  miniatura cuadrada 480×480 (tarjeta)
├── contenido/
│   ├── catalogo.json          81 productos (lo edita el CMS)
│   └── tienda.json            ajustes (lo edita el CMS)
├── admin/
│   ├── index.html             carga Sveltia CMS desde unpkg
│   └── config.yml             campos del administrador (validado contra el esquema oficial 0.263.0)
└── functions/
    └── index.js               "/" → inyecta el catálogo vivo (HTMLRewriter)
```

## Dónde editar cada cosa

| Qué | Dónde | Quién |
|---|---|---|
| Productos: código, nombre, tipo, sección, grupo/filtro, medida, fotos, etiqueta, agotado, ocultar, precio (opcional) | `/admin` → Productos (`contenido/catalogo.json`) | La dueña |
| Secciones/pestañas, su descripción y cuál se ve primero | `/admin` → Ajustes de la tienda | La dueña |
| Título y subtítulo de la portada | `/admin` → Ajustes → Portada | La dueña |
| Barra de aviso / Modo muestra | `/admin` → Ajustes | La dueña o JX |
| PDF del botón "Descargar catálogo" | `/admin` → Ajustes → Catálogo en PDF (o reemplazar `catalogo/catalogo-star-home-2026.pdf`) | La dueña o JX |
| Número de WhatsApp | ZONA CONTACTO de `index.html` + ver "⚠ SE REPITE EN" | JX |
| Nota bajo el catálogo (fotos de referencia / precios) | ZONA TEXTOS de `index.html` | JX |
| Mensaje de "Consultar" | `functions/index.js → textoConsulta` (el visor reutiliza el enlace de la tarjeta) | JX |
| Mensaje de "Mi lista" | `js/script.js → Pedido.textoPedido` | JX |
| Textos de "Cómo pedir", "¿Buscas algo más?" y preguntas | `index.html` (y FAQPage del `<head>`) | JX |
| Textos legales | directamente en cada `.html` | JX |
| GA4 (Measurement ID) | `js/script.js` → `CONFIG.ga4` | JX |
| Repositorio y autenticador del CMS | `admin/config.yml` → `backend` | JX |
| Letras (tipografías) | archivos en `fonts/` + `@font-face` al inicio de `css/styles.css` + precargas del `<head>` de las 6 páginas (el nombre del archivo debe coincidir en los tres sitios; si cambia la letra, nombre nuevo por la caché de 1 año) | JX |

## {POR CONFIRMAR} pendientes

1. ~~Nombre exacto del negocio~~: **Star Home** (v1.4).
2. ~~Catálogo real~~: 81 productos del PDF (v1.4), sin precios por decisión de la dueña.
3. **IVA:** si los precios incluyen IVA o si el negocio no es responsable de IVA (`terminos.html`, sección Precios).
4. **Datos legales del responsable:** nombre completo o razón social, cédula o NIT, dirección para notificaciones y correo (privacidad, términos y políticas de compra; el art. 50 de la Ley 1480 los exige a quien vende en línea).
5. **Medios de pago aceptados por WhatsApp** (Nequi, transferencia, efectivo contra entrega…).
6. **Forma y tiempo de entrega** (hoy se acuerdan por WhatsApp).
7. **Política de cambios** (plazo y condiciones).
8. **Término de garantía** anunciado (si no se anuncia, la ley fija 1 año).
9. **Measurement ID de GA4** (`CONFIG.ga4`; mientras sea `G-XXXXXXXXXX` no se carga nada).
10. **Dominio final** (canonical, og, JSON-LD, sitemap, robots, llms, `SITIO_URL` en `functions/index.js`, `site_url` en `admin/config.yml`).
11. **URL del autenticador** de Sveltia (`admin/config.yml`; el repositorio ya está).
12. ~~Cuenta de Wompi~~: el pago en línea se retiró en v1.3.
13. **Redes sociales** (Instagram/Facebook/TikTok) para el pie y `sameAs` del JSON-LD.
14. **Horario de atención** por WhatsApp (para `openingHoursSpecification`).
15. ~~Ciudadela La Paz como punto de despacho~~: no se muestra en la página (v1.3).
16. **Permiso del proveedor** (Duvellar Home, ÉVORA, VELUNA) para usar sus fotos con el logo de Star Home encima, o fotos sin marca.
17. **Medidas reales** de cortinas, satinadas y almohadas (hoy dicen "consúltala por WhatsApp").

## Decisiones tomadas (y por qué)

- **Landing de una página** (lo pidió JX) con catálogo, carrito y CMS: el catálogo vive en JSON y se inyecta en el servidor para cumplir "HTML real en el view-source" sin build step.
- **CMS git-based: Sveltia CMS** (JX eligió CMS git-based). Se escogió Sveltia sobre Decap porque convierte las fotos a **WebP al subirlas** (regla de JX) y tiene la interfaz en español de Colombia (`es-CO`). El `config.yml` se validó contra el esquema JSON oficial del paquete `@sveltia/cms@0.254.0`.
- **Pago (v1.3, 11 nov 2026): SOLO WhatsApp.** JX pidió quitar Wompi ("es apenas un mini emprendimiento") y los domicilios (por ahora no cubren todo Cartagena). Antes (v1.0–v1.2) era "las dos opciones" (WhatsApp o Wompi), como eligió JX al inicio. Wompi por **Web Checkout** (redirección a `checkout.wompi.co/p/`): no carga scripts de terceros en la página. Firma de integridad SHA-256 de `referencia + centavos + COP + secreto`, calculada SOLO en el servidor.
- **El botón "Enviar pedido por WhatsApp" del carrito** es parte del pedido (lleva el detalle armado), no un botón de contacto extra; el único botón de WhatsApp de contacto es el flotante.
- **Sin mapa:** el negocio no tiene local abierto al público. Hasta v1.2 lo reemplazaba la sección "Domicilios en Cartagena", que se quitó en v1.3.
- **Cookies estrictas:** nada de GA4 ni carrito guardado hasta que la persona acepte. Si rechaza, el carrito vive en memoria (se pierde al recargar).
- **Diseño Modo 2 (libre)**, porque JX eligió "Dame lo mejor". No se usó el Diseño JX.
- **Modo muestra con noindex** mientras el catálogo fue simulado (v1.0–v1.3). Apagado en v1.4 con el catálogo real.
- ~~Fotos de producto = ilustraciones SVG~~ (v1.0–v1.3): reemplazadas por las fotos reales en v1.4.
- **v1.4 — Nombre Star Home** (12 nov 2026): JX dijo que el logo de la empresa es el de Star Home ("ese es el logo") y su PDF se llama así. Se renombró todo; "Estrellita" es la dueña.
- **v1.4 — Sin precios:** la dueña no quiere publicarlos ("que los clientes vayan directamente a preguntarles"). Botón "Consultar" por producto (como el botón verde del PDF) + "Mi lista" para varios (JX había pedido poder "seleccionarlas bien"). El precio quedó OPCIONAL en el CMS por si cambian de idea.
- **v1.4 — Sin JSON-LD "Product":** Google exige precio (o reseñas) en "Product" y marcaría error en Search Console; se publica un `ItemList` de `ListItem` (nombre, foto y enlace).
- **v1.4 — Logo de Star Home encima del logo del proveedor:** lo pidió JX y así lo hizo en su PDF. Primero se le explicó que esas marcas (y el teléfono del proveedor) son del proveedor y que lo ideal es su permiso o fotos sin marca; JX decidió ponerlo. Se replicó su mismo estilo sobre las fotos ORIGINALES en alta (no se borró nada a mano: el logo tapa el del proveedor, igual que en el PDF).
- **v1.4 — Colores y letras del logo/PDF:** JX pidió "la web con los mismos colores del logo". Se tomaron también las tipografías de su PDF para que web y catálogo se vean iguales.
- **v1.4 — WhatsApp sigue sin verde** (decisión de JX en v1.3): botones "Consultar" y flotante en el café de la marca (`--marca`), el flotante con anillo dorado. El PDF sí usa verde; la web no.
- **v1.4 — Modo muestra apagado** (Google indexa): los productos ya son reales. JX no contestó esa pregunta; se apaga y prende desde `/admin` → Ajustes.
- **v1.4 (ajuste) — Letras propias en `/fonts`, no Google Fonts** (12 nov 2026): (1) la cabecera `Link` que arma Cloudflare con el `&amp;` sin decodificar pedía una hoja de letras rota en cada visita; (2) son dos conexiones menos en el celular (`fonts.googleapis.com` y `fonts.gstatic.com`); (3) privacidad: la IP del visitante ya no va a Google (se quitó de `cookies.html`); (4) con precarga casi nunca se ve el cambio de letra (CLS 0). Son los mismos archivos que entregaba Google (licencia SIL OFL 1.1, que permite alojarlos). En la portada se precargan las 3 DESPUÉS del logo y el CSS: con HTTP/2 y HTTP/3, Cloudflare entrega primero el logo.
- **v1.4 (ajuste) — Logo de la portada desde 40 % de opacidad, sin retraso:** es el elemento LCP; si empieza invisible, Chrome no lo cuenta hasta que aparece y la carga medida se corre ~0,3 s.
- **v1.4 — `content-visibility` en las tarjetas:** las que están fuera de pantalla no se dibujan (Lighthouse celular 93–95 → 95–97). Efecto secundario arreglado: al tocar un enlace interno se dibujan todas antes de desplazarse (clase `.dibujar-todo`), si no, el menú aterrizaba corrido.


## 🖼️ REGLA DE IMÁGENES — SIEMPRE WebP
Todas las imágenes de este proyecto van en **WebP**, sin excepción. Cualquier foto nueva que JX entregue (JPG, PNG, HEIC, capturas, lo que sea) se **convierte a WebP de inmediato** antes de meterla al proyecto, conservando resolución y calidad originales, y se guarda en `img/`. Nunca dejar JPG/PNG en el proyecto ni entregar copias de respaldo en otros formatos.
**Única excepción técnica**: `favicon` (`.ico`/`.png`/`.svg`) y `apple-touch-icon.png`, porque ningún navegador soporta favicons en WebP.

> En este proyecto el administrador también cumple la regla: `admin/config.yml → media_libraries.default.config.transformations.raster_image.format: webp` convierte cada foto que suba la dueña.
> **Fotos de producto (v1.4):** cada producto tiene foto grande (`<ref>-<nombre>.webp`, máx. 1400 px, calidad 82, para el visor) y miniatura cuadrada (`<ref>-<nombre>-mini.webp`, 480×480, calidad 72, para la tarjeta). Las fotos horizontales (almohadas) llevan la miniatura completa sobre blanco en vez de recortada. El PDF del catálogo no es imagen: va tal cual en `catalogo/`.

## 🎨 REGLA DE DISEÑO — TODO LO NUEVO USA ESTE MISMO DISEÑO
Cualquier sección, componente, botón o página que se agregue a futuro debe usar **exactamente** el diseño de esta web: mismos colores, mismas tipografías, mismos tamaños, radios, sombras y espaciados, y los mismos patrones de componente que ya existen. **Nunca un diseño distinto.** Si algo no alcanza con lo que hay, preguntarle a JX antes de inventar.

**Ficha de diseño de este proyecto (v1.4 — identidad Star Home: colores del logo + letras del PDF):**
- Paleta (variables `:root` de `css/styles.css`; contrastes medidos ≥ 4.5:1 en las de texto):
  - `--marca: #2A1E1C` negro café (la palabra "Home" del logo): titulares, botones principales, pie, aviso
  - `--marca-700: #3B2B28` hover · `--marca-600: #5A4440` foco
  - `--oro: #C9A24E` dorado del logo SOLO decorativo (estrellas, filetes) · `--oro-claro: #E3C27A` contadores y texto sobre el pie · `--oro-suave: #F6ECD8` fondos · `--oro-texto: #8A6421` texto dorado pequeño (códigos REF., antetítulos)
  - `--rosa: #E8B4BE` rosa del moño SOLO decorativo · `--rosa-suave: #F8ECEE` fondos de sección · `--rosa-texto: #A0475D` notas ("Medida: consúltala por WhatsApp")
  - `--crema: #FBF7F3` fondo general · `--blanco: #FFFFFF` · `--lino: #F3ECE6` fondo de fotos · `--hilo: #E7DAD3` bordes
  - `--tinta: #33272A` texto · `--tinta-2: #5E4F4C` secundario · `--tinta-3: #6F605C` notas · `--error: #A3262E`
  - **WhatsApp NO usa verde** (decisión de JX, v1.3): botones en `--marca`.
- Tipografías (las del PDF): **Cormorant Garamond** 500–700 (títulos, nombres de producto), **Montserrat** 400–700 (texto, botones, etiquetas en mayúsculas espaciadas) y **Great Vibes** (letra cursiva SOLO de adorno: lema "Textiles para tu hogar", "¿Buscas algo más?", lema del pie). Servidas desde `/fonts` (antes Google Fonts) con `@font-face` y precarga; mismos pesos.
- Escala: h1 portada `clamp(2.45rem, 1.55rem + 3.9vw, 4.5rem)`; h2 `clamp(2.1rem, 1.55rem + 2.2vw, 3.2rem)`; cuerpo 1rem/1.65; nombre en tarjeta 1.28rem (1.06–1.14 en celulares chicos).
- Radios: `--radio-s: 10px`, `--radio-m: 16px` (tarjetas), `--radio-l: 24px` (bloques), botones `999px` (píldora).
- Sombras: `--sombra-1` suave, `--sombra-2` paneles flotantes, `--sombra-oro` marco del logo. Sin brillos ni neones.
- Patrones de componente:
  - Botones píldora de 48 px mínimo (44–46 px dentro de tarjetas): `.boton--principal` (café), `.boton--secundario` (borde café), `.boton--consultar` (tarjeta), `.boton--descarga` (PDF, con `.boton__nota` "PDF · 14 MB"), `.boton--estrella` (visor, dorado al estar en la lista). Íconos con `.boton__icono` y el sprite `#i-whatsapp` / `#i-estrella`.
  - **Antetítulo dorado** `.seccion__antetitulo` ("✦ CATÁLOGO 2026") sobre cada h2.
  - **Tarjeta de producto:** foto cuadrada sobre `--lino` (botón que abre el visor) con la estrella de "Mi lista" en la esquina; debajo REF. dorado, nombre en Cormorant, tipo, medida (o nota rosada) y "Consultar" abajo alineado.
  - **Pestañas** píldora (activa en café con contador dorado) y **filtros** píldora suaves (el elegido en `--oro-suave` con borde dorado).
  - **Visor** a pantalla completa fondo café oscuro, foto centrada, flechas redondas, ficha blanca abajo (celular) o a la derecha (escritorio y celular horizontal).
  - **Etiqueta colgante** (marquilla con ojal) en `--oro-claro`; "Agotado" en `--marca`.
  - **Marco del logo** de la portada: blanco, filete dorado, radio 26 px, `--sombra-oro`, y sello rosado "Catálogo 2026 · Especial Navidad".
  - **Costura punteada** (`2px dashed var(--hilo)`) solo para unir los pasos de "Cómo pedir".
  - Fondos: portada rosa→crema, catálogo crema, "Cómo pedir" rosa suave, preguntas blanco, pie café con detalles dorados. Botón flotante café con anillo dorado.
- Movimiento: entrada animada de la portada al cargar + animaciones que responden a acciones (tarjetas al filtrar, estrella, visor, lista, toast). Respeta `prefers-reduced-motion`.
- Modo de diseño: identidad de la marca del cliente (logo y PDF de Star Home), sobre la base del Modo 2 de v1.0.

## 🗂️ ÍNDICE DE ZONAS EDITABLES
En este proyecto casi todo el contenido cambiante se edita desde el CMS (`/admin`). En `index.html` quedan solo tres zonas:

| Zona | Qué contiene | ¿Se repite? |
|---|---|---|
| `ZONA EDITABLE · TEXTOS` | Nota bajo el catálogo ("Imágenes de referencia… Precios y disponibilidad por WhatsApp") | `terminos.html` (secciones 2 y 3) |
| `ZONA EDITABLE · VERSIÓN` | Etiqueta `vX.Y` sobre el titular de la portada | `CHANGELOG.md` y la etiqueta de git (`git tag vX.Y`) |
| `ZONA EDITABLE · CONTACTO` | WhatsApp/teléfono y ciudad del pie | `href tel:`, botón flotante `wa.me`, botón "¿Buscas algo más?", `js/script.js` (`CONFIG.whatsapp`), `functions/index.js` (`WHATSAPP`), JSON-LD `telephone`, 404 y páginas legales |

Productos, secciones, portada, aviso y PDF **no** llevan zona: viven en `contenido/*.json` (CMS). Las regiones `PESTANAS`, `FILTROS` y `CATALOGO` (`INICIO/FIN`) son copias automáticas, no zonas editables.

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

### 12 nov 2026, 11:15 — v1.4 · Star Home: catálogo real sin precios, visor, Mi lista, logo y colores de la marca
Pedido de JX: fotos reales (ZIP) + PDF "Catálogo Star Home 2026"; sin precios; que se vean bien y se puedan elegir en el celular; logo de la empresa en la web y encima del logo del proveedor en las fotos; colores del logo; botón "Descargar catálogo" junto al título.
- **Datos (`contenido/catalogo.json`):** 81 productos `{ id: "cb-01", referencia: "CB-01", nombre, tipo, coleccion, grupo, medida, imagen, miniatura, alt, etiqueta, agotado, mostrar }` (+ `precio` opcional). Orden y nombres = PDF. Medidas: CB-07…CB-17 "190 × 215 cm" (letrero de la foto), sábanas estampadas "Tamaño sencilla/doble/queen/king", el resto vacío ("Medida: consúltala por WhatsApp"). Mapa ref → foto del ZIP: CB-01…17 = fotos 2…18; CT-01…10 = 29…38; SB-01…32 = 52…83; SB-33…41 = 43…51; CT-11…19 = 19, 202, 21…25, 27, 28 (la 26 es igual a la 25); CT-20…22 = 39…41; AL-01 = 42; la 1 es el logo.
- **`contenido/tienda.json`:** `modo_muestra: false`; aviso "✦ Especial Navidad 2026: cobijas y cortinas navideñas ✦"; portada; `catalogo_pdf: "/catalogo/catalogo-star-home-2026.pdf"`; colecciones `navidad` (Especial Navidad), `sabanas`, `cortinas`, `almohadas`; inicial `navidad`.
- **`functions/index.js` (reescrito):** constantes `SITIO_URL`, `TIENDA`, `WHATSAPP` (⚠ número repetido). `normalizarDatos` (producto sin variantes: referencia, tipo, grupo + `grupoId` = `slug(grupo)`, medida, `precio` opcional, imagen + miniatura; descarta ids repetidos; valida `catalogo_pdf` = ruta `/…/*.pdf` del sitio). `gruposDe`, `renderFiltros` (si la colección tiene ≥2 grupos), `renderTarjetas` (foto = `<button class="producto__ver" data-ver>`, estrella `.producto__estrella[data-lista][aria-pressed]`, REF., nombre, tipo, medida, precio opcional, "Consultar" = `<a class="boton boton--consultar" data-consultar href="wa.me…">` armado con `textoConsulta`), `renderDatosCliente`, `renderJsonLdProductos` (ItemList de ListItem, SIN Product), `tamanoLegible` + `tamanoArchivo` (peso del PDF: en Cloudflare el HEAD no trae tamaño y el Range no se respeta, así que pide el archivo, lee `content-length` y corta la descarga; se guarda en memoria por instancia (`pesosPdf`), así que solo la primera visita tras cada despliegue lo mide; si falla, queda el texto "PDF · 14 MB" de index.html). HTMLRewriter: robots, portada, `#portada-catalogo` (href o hidden), `#portada-catalogo-peso`, aviso, pestañas, `#catalogo-filtros` (o hidden), descripción, grid, datos y JSON-LD. Íconos por sprite (`ICONO_WHATSAPP`/`ICONO_ESTRELLA` = `<svg><use href="#i-…">`): el HTML bajó de 336 KB a 234 KB (26 KB comprimido).
- **`index.html` (reescrito):** sprite `<svg class="sprite">` con `#i-whatsapp` y `#i-estrella` al inicio del body; aviso; cabecera con `img.marca__logo` + "Star Home", menú (Catálogo, Cómo pedir, Preguntas) y botón "Mi lista" (`#abrir-carrito`, estrella + contador `#carrito-n`); portada (versión, lema `.portada__lema` en Great Vibes, h1/sub del CMS, `.portada__categorias`, "Ver el catálogo" + `#portada-catalogo` con `download` y `#portada-catalogo-peso`, logo en `.portada__marco` con srcset 600/1000 y `.portada__sello`); catálogo (`.seccion__antetitulo`, pestañas, `#catalogo-filtros`, descripción, grid, ZONA TEXTOS, bloque `.buscas`); "Cómo pedir" (`#como-pedir`, 3 pasos); preguntas (6, iguales al FAQPage); pie con logo y lema; panel "Mi lista" (`#carrito`, sin precios, nombre + autorización, "Consultar mi lista por WhatsApp"); `<dialog id="confirmar-quitar">`; `<dialog class="visor" id="visor">` (contador, cerrar, `#visor-escena` con flechas y `#visor-foto`, ficha con `#visor-ref`, `#visor-nombre`, `#visor-detalle`, `#visor-consultar`, `#visor-lista`); toast; cookies; `#catalogo-datos`.
- **`js/script.js`:** `CONFIG.tienda = 'Star Home'`, `claveLista: 'sh_lista_v1'` (se borra la vieja `eh_carrito_v1`). **Catalogo:** pestañas + filtros (`pintarFiltros`, `aplicar` marca `.coincide` por colección y `data-grupo`), `visibles()` (ids en pantalla, para el visor), `mostrarProducto(id)` (cambia a su pestaña), clics delegados del grid (foto → Visor, estrella → Lista, Consultar → GA4). **Visor:** `<dialog>` con `showModal`; `abrir(id)` recorre `Catalogo.visibles()`; flechas, teclado ←/→, deslizar (pointerdown/up, > 45 px horizontal); `history.pushState` con `#p-<id>` al abrir y `replaceState` al moverse: el "atrás" del celular lo cierra (`popstate`); enlace directo `#p-<id>` al cargar y en `hashchange`; precarga las fotos vecinas; el botón Consultar usa el `href` de la tarjeta. **Lista** (antes Carrito): líneas `{id, n}`, `alternar(id)` (estrella), cantidades, basura con confirmación, estrellas sincronizadas (`aria-pressed` y nombre accesible), sin toast cuando el visor está abierto. **Pedido:** mensaje "Me interesan estos productos:" con `*Nombre* (tipo)` + `Ref. · Medida · Cantidad`, "A nombre de:" y "¿Me confirman precio y disponibilidad?". **Enlaces internos:** clic en `a[href^="#"]` pone `.dibujar-todo` en el grid (ver CSS). Eventos GA4: `consulta_whatsapp`, `agregar_lista`, `ver_foto`, `lista_whatsapp`, `descarga_catalogo`, `clic_whatsapp`, `clic_telefono`, `envio_formulario`.
- **`css/styles.css` (reescrito, 16 bloques):** paleta y tipografías de la marca (ver REGLA DE DISEÑO); bloque 12 nuevo = visor; `.filtro`, `.producto__estrella`, `.producto__ref`, `.boton--consultar`, `.boton--descarga`, `.buscas`, `.portada__marco`, `.portada__sello`, `.portada__categorias`. `.producto { content-visibility: auto; contain-intrinsic-size: auto 350px }` (440 px ≥600, 465 px ≥901, 445 px ≥1200) y `.catalogo.dibujar-todo .producto { content-visibility: visible }`. Responsive: ≤330 (Fold: sin ícono en Consultar, categorías en 2 líneas, cabecera más chica), ≤380, ≤480, ≤500, ≥600, ≥768 (pasos en 3 columnas con costura horizontal), ≥901 (visor con ficha a la derecha), ≥1200, ≥1440 y `max-height: 520px` (celular horizontal: visor en 2 columnas). `.portada__grid` con `minmax(0, 1fr)` y `.portada__texto { min-width: 0 }` (en 280 px la columna se pasaba).
- **`admin/config.yml`:** producto con referencia (patrón `^[A-Z]{2,4}-[0-9]{2,3}$`), nombre, tipo, coleccion (relación), grupo, medida, precio opcional, imagen, miniatura opcional, alt, etiqueta (+ "Especial Navidad"), agotado, mostrar; ajustes con `catalogo_pdf` (widget `file`, `media_folder: /catalogo`); `max_file_size` 25 MB. Validado con ajv contra `schema/sveltia-cms.json` de `@sveltia/cms@0.263.0`.
- **Imágenes:** `img/logo-star-home{,-600,-132}.webp`, `img/og-star-home-cartagena.webp` (hecha con HTML + Playwright y pasada a WebP), 81 × 2 fotos en `img/productos/`, `favicon.svg`/`.ico` (estrella dorada sobre café), `apple-touch-icon.png` (logo). Se borraron las 11 ilustraciones simuladas, el héroe, el og y el logo de Estrellita.
- **Legales, 404 y otros:** marca Star Home, logo en cabecera y pie, fuentes nuevas, textos de precios por WhatsApp (términos 2, 3 y 4; políticas 1), tabla de cookies con `sh_lista_v1`, fechas 12 nov 2026; `site.webmanifest`, `llms.txt`, `robots.txt`, `sitemap.xml` (lastmod 2026-11-12), `_headers` (`/img/*` 1 día, `/catalogo/*` 1 hora), `admin/index.html`.
- **Pruebas v1.4 (wrangler 4.160 local):**
  - 140 comprobaciones automáticas (Playwright) en 19 pantallas: iPhone SE, 12 Mini, 13, 15 Pro Max; Galaxy S8, S9+, S24, A55, Z Fold 6 Cover, Z Flip 6; Pixel 7; Moto G4; 280 px; iPhone 13 y Galaxy S24 horizontales; iPad Mini; Galaxy Tab S4; escritorio 1366 y 1920. Sin desbordes (incluidos elementos recortados por `overflow: hidden`), sin textos cortados, sin errores de consola ni de red.
  - Flujo completo en iPhone SE, Galaxy S24 y escritorio: conteos de pestañas y filtros (27/17/10, 41/8/15/5/4/9, 12/9/3, 1, 81), mensaje de "Consultar", estrella, visor (flechas, teclado, deslizar, atrás, Escape y foco), "Mi lista" (cantidades, confirmación al quitar, validación, mensaje sin precios, WhatsApp una sola vez), lista recordada solo con cookies aceptadas, enlaces directos (página nueva y cambio de `#`), PDF, 404 y legales.
  - Los enlaces del menú aterrizan a 84 px exactos. axe-core sin violaciones (inicio, visor, Mi lista, 4 legales y 404). html-validate sin errores (7 páginas, también la salida del servidor). La copia de respaldo funciona sola (`file://`).
  - Lighthouse celular 95/100/100/100 (LCP 2,4 s, TBT ~150–190 ms, CLS 0) y escritorio 97/100/100/100.
  - **Vista previa real de Cloudflare** (rama `claude/cool-newton-ux61it`, PR #2): las mismas 140 comprobaciones dan TODO OK y los enlaces del menú aterrizan exactos. Lighthouse ahí da SEO 69 solo porque Cloudflare pone `x-robots-tag: noindex` a las vistas previas (en producción no).

### 12 nov 2026, 11:55 — v1.4 (ajuste) · Letras propias en /fonts y fuera la cabecera `Link` rota
Revisión de producción tras fusionar la PR #2 (Lighthouse celular 81). PR #3.
- **`fonts/`** (nuevo): `cormorant-garamond-v21-latin.woff2` (variable 300–700), `montserrat-v31-latin.woff2` (variable 100–900) y `great-vibes-v21-latin.woff2`, bajados de Google Fonts (subconjunto latin, mismo MD5 que sirve Google) + `LICENCIAS.txt` (copyright de cada una + texto de la SIL OFL 1.1).
- **`css/styles.css`:** bloque 1 = "Tipografías propias y variables": 3 `@font-face` con `font-display: swap`, el `unicode-range` latin de Google y los MISMOS pesos que pedía la web (Cormorant `500 700`, Montserrat `400 700`, Great Vibes `400`), para que pesos fuera de rango (p. ej. 800 en `.portada__version`) se vean igual que antes. Rutas `../fonts/…` (sirven también con `file://`). Portada: `.portada__arte > *` sin `animation-delay` y `@keyframes aparecer-arte` desde `opacity: .4`.
- **`<head>` de las 6 páginas:** fuera los `preconnect`, el `preload as=style`, la hoja con `media="print" onload` y el `<noscript>` de Google. En su lugar `<link rel="preload" as="font" type="font/woff2" href="fonts/…" crossorigin>`: las 3 en `index.html` (después del logo y el CSS) y Cormorant + Montserrat en las legales y la 404 (esta con rutas `/fonts/…`). Los `<link>` con `crossorigin` o `fetchpriority` no generan cabecera `Link` en Cloudflare: ahora la página no lleva ninguna.
- **`_headers`:** `/fonts/*` → `Cache-Control: public, max-age=31536000, immutable`.
- **`cookies.html`:** fuera la viñeta "Google Fonts" de "Servicios de terceros que no ponen cookies aquí".
- **Pruebas:**
  - `fuentes2.js` (6 páginas, local y vista previa): 0 peticiones a Google, cada `.woff2` una sola vez (la precarga se reutiliza), las 3 caras `loaded`, sin avisos.
  - Batería v1.4 (ahora también falla con avisos de consola): 140/140 en local y en la vista previa.
  - Anclas a 84 px exactos; html-validate sin errores (7 archivos).
  - Capturas local contra producción: iPhone 13 portada y términos 0 píxeles distintos; en escritorio, alturas idénticas al milésimo de píxel.
  - Lighthouse en la vista previa: celular 99/95/97 en 3 corridas (FCP 1,0 s, LCP 2,0–2,2 s, CLS 0) y escritorio 100.
  - En local (wrangler sirve HTTP/1.1) Lighthouse simula el logo y las letras compartiendo ancho de banda y da LCP ~2,8 s; en Cloudflare (HTTP/2 y HTTP/3) no pasa. Para medir velocidad, usar la vista previa o producción, no el local.

## 🏷️ VERSIONES (cómo publicar una nueva)
Numeración `vMAYOR.MENOR`: sube MENOR en cada entrega de arreglos o funciones; MAYOR solo con un cambio grande (rediseño, catálogo real con dominio propio, etc.). Historial: v1.0 (29 oct 2026, entrega inicial) → v1.2 (11 nov 2026, revisión móvil; no hubo v1.1 publicada) → v1.3 (11 nov 2026, solo WhatsApp) → v1.4 (12 nov 2026, Star Home: catálogo real sin precios).

Al cerrar una entrega:
1. Cambiar el número en la ZONA EDITABLE · VERSIÓN de `index.html` (y nada más del HTML).
2. Agregar la entrega ARRIBA en `CHANGELOG.md` (fecha, qué se arregló, qué es nuevo).
3. Actualizar "📌 ESTADO ACTUAL" y sumar la entrada en "🧭 MAPA DEL CÓDIGO" de este archivo.
4. Cuando JX AUTORICE: en local, commit en `main` y `git push origin main`; en la nube, commit en la rama `claude/…`, push, PR hacia `main` y fusionarla (Cloudflare publica `main` en ~30 s). Ver "Flujo de trabajo" en ESTADO ACTUAL.
5. Etiqueta: `git tag -a vX.Y -m "…"` sobre el commit de la entrega y `git push origin vX.Y`. Si la PR se fusiona con "squash", mover la etiqueta al commit de `main` (`git tag -fa vX.Y <commit> && git push -f origin vX.Y`). En GitHub → Releases se puede crear la versión a partir de la etiqueta con el texto del CHANGELOG.
   ⚠ Desde las sesiones de Claude en la nube el push de etiquetas está BLOQUEADO (403 del proxy: solo se puede subir la rama de trabajo). En ese caso las crea JX en GitHub → **Releases → Draft a new release → Choose a tag** (escribir `vX.Y`, "Create new tag on publish"), con destino `main` después de fusionar la PR, y pega el texto de esa versión del CHANGELOG. `v1.0` va sobre el commit `f5f60a1` ("Add files via upload"; en el selector de destino → *Recent commits*).

## Herramienta: regenerar la copia de respaldo del catálogo
Si cambias `contenido/*.json` a mano o el render de `functions/index.js`, actualiza la copia estática de `index.html` (pestañas, filtros, tarjetas, datos, JSON-LD y robots). Crea FUERA del proyecto un archivo `copia.mjs` con este contenido y ejecútalo con Node 18+: `node copia.mjs /ruta/al/proyecto`.

```js
// Regenera la copia de respaldo del catálogo dentro de index.html con el MISMO
// render de functions/index.js (v1.4: incluye los filtros por tipo/tamaño).
// Uso: node copia.mjs /ruta/al/proyecto
import fs from 'node:fs/promises';
const RAIZ = process.argv[2] || '/ruta/a/star-home';
const f = await import(`${RAIZ}/functions/index.js`);
const datos = f.normalizarDatos(
  JSON.parse(await fs.readFile(`${RAIZ}/contenido/catalogo.json`, 'utf8')),
  JSON.parse(await fs.readFile(`${RAIZ}/contenido/tienda.json`, 'utf8')));
let h = await fs.readFile(`${RAIZ}/index.html`, 'utf8');
const r = (re, v) => {
  if (!re.test(h)) throw new Error(`No encontré en index.html: ${re}`);
  h = h.replace(re, v);
};
const filtros = f.renderFiltros(datos);
r(/<!-- PESTANAS:INICIO -->[\s\S]*?<!-- PESTANAS:FIN -->/, `<!-- PESTANAS:INICIO -->\n${f.renderPestanas(datos)}\n<!-- PESTANAS:FIN -->`);
r(/<!-- FILTROS:INICIO -->[\s\S]*?<!-- FILTROS:FIN -->/, `<!-- FILTROS:INICIO -->\n${filtros}\n<!-- FILTROS:FIN -->`);
r(/<div class="filtros" id="catalogo-filtros"( hidden)? role="group"/, `<div class="filtros" id="catalogo-filtros"${filtros ? '' : ' hidden'} role="group"`);
r(/<!-- CATALOGO:INICIO -->[\s\S]*?<!-- CATALOGO:FIN -->/, `<!-- CATALOGO:INICIO -->${f.renderTarjetas(datos)}\n        <!-- CATALOGO:FIN -->`);
r(/(<p class="pestanas__desc" id="coleccion-desc" aria-live="polite">)[\s\S]*?(<\/p>)/, `$1${f.escaparHTML(f.descripcionInicial(datos))}$2`);
r(/(<div class="catalogo" id="catalogo-grid") data-filtro="[^"]*" role="tabpanel" aria-labelledby="[^"]*">/, `$1 data-filtro="${datos.coleccionInicial}" role="tabpanel" aria-labelledby="pestana-${datos.coleccionInicial}">`);
r(/(<script type="application\/json" id="catalogo-datos">)[\s\S]*?(<\/script>)/, `$1${f.renderDatosCliente(datos)}$2`);
r(/(<script type="application\/ld\+json" id="jsonld-productos">)[\s\S]*?(<\/script>)/, `$1${f.renderJsonLdProductos(datos)}$2`);
r(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${f.robotsPara(datos)}">`);
await fs.writeFile(`${RAIZ}/index.html`, h);
console.log('Copia regenerada:', datos.productos.length, 'productos ·', datos.colecciones.length, 'colecciones · filtros iniciales:', filtros ? 'sí' : 'no');
```

## Herramienta: fotos nuevas con el logo de Star Home
Así se hicieron las fotos de la v1.4 (Python 3 + Pillow + numpy), por si llegan más productos con el logo de un proveedor:
1. Trabajar SIEMPRE fuera del proyecto (scratchpad). Al proyecto solo entra WebP.
2. Si JX manda su PDF con el logo ya puesto: extraer sus imágenes (`pdfimages -j -p catalogo.pdf im`), relacionarlas con las fotos originales por orden de página y comparar cada una con su original reducida al mismo tamaño (diferencia por canal > 40 con desenfoque 1.2 px; caja por percentiles 1–99 y crecer el borde hasta 8 % donde la diferencia > 14 cubra más de la mitad de la fila/columna). Esa caja, escalada a la foto original, es donde va el logo.
3. Estilo del parche (el de JX): si la caja es casi cuadrada (±6 %), el logo `1.jpeg` redimensionado a la caja con borde blanco de 1,2 % del lado; si es ancha, fondo blanco + panel crema `#FAF5EF` + filete dorado `#B09662` y el logo cuadrado centrado a todo el alto.
4. Exportar: foto grande máx. 1400 px WebP calidad 82 (`<ref>-<nombre>.webp`) y miniatura 480×480 WebP calidad 72 (`<ref>-<nombre>-mini.webp`; recorte cuadrado centrado, o completa sobre blanco si la foto es horizontal).
5. Revisar con una hoja de control (resultado | PDF) que no se asome nada del logo del proveedor.
Si la dueña sube una foto desde `/admin`, el CMS solo la pasa a WebP (1600 px): no le pone el logo ni hace la miniatura (la tarjeta usa la foto grande si no hay miniatura).

## Recordatorios para JX
- Los textos legales son una base profesional, **no asesoría legal**: deben revisarlos un abogado.
- **Google ya puede indexar la página (v1.4):** verificarla en Google Search Console y enviar el `sitemap.xml`. Nunca borrar el archivo de verificación de Google.
- Recomendar a la dueña reclamar su ficha de **Google Business Profile** como **Star Home** (negocio que atiende en Cartagena, sin dirección pública) y mantener el NAP idéntico (nombre, teléfono).
- **Fotos del proveedor:** confirmar con Duvellar Home, ÉVORA y VELUNA que están de acuerdo con usar sus fotos con el logo de Star Home, o pedirles fotos sin marca (se cambian desde `/admin`).
- **Si cambia el PDF del catálogo:** subirlo desde `/admin` → Ajustes → Catálogo en PDF (máx. 25 MB). El botón muestra el peso solo si Cloudflare lo informa; si no, queda el texto "PDF · 14 MB" de `index.html` (cambiarlo a mano si el PDF nuevo pesa distinto).
- Correr PageSpeed Insights (pagespeed.web.dev) tras cada despliegue grande. v1.4 con letras propias, en la vista previa de Cloudflare: celular 95–99, escritorio 100 (Accesibilidad y Buenas prácticas 100; SEO 100 en producción).
