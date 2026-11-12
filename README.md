# Star Home — Textiles para tu hogar en Cartagena

Landing de una sola página con el **catálogo 2026** de Star Home: sábanas, cobijas navideñas, cortinas y almohadas. **Sin precios publicados**: cada producto tiene su código (por ejemplo `SB-09`) y un botón **Consultar** que abre WhatsApp con el producto ya escrito. Incluye un administrador para que la dueña cambie productos y fotos sin depender del desarrollador.

**Versión actual: v1.4** (12 nov 2026) · En vivo: <https://star-home-shop.pages.dev> · Historial de cambios: [`CHANGELOG.md`](CHANGELOG.md) · Contexto completo para quien edite: [`CLAUDE.md`](CLAUDE.md)

---

## Zonas editables (cambios a mano en el código)

Casi todo se cambia desde el administrador (`/admin`). En el código solo quedan tres zonas marcadas en `index.html`:

| Zona | Qué cambia | ¿Se repite? |
|---|---|---|
| `ZONA EDITABLE · VERSIÓN` | La etiqueta `v1.4` sobre el titular | Sí: `CHANGELOG.md` y la etiqueta de git |
| `ZONA EDITABLE · TEXTOS` | La nota bajo el catálogo ("Imágenes de referencia… Precios y disponibilidad por WhatsApp") | Sí: `terminos.html` (secciones 2 y 3) |
| `ZONA EDITABLE · CONTACTO` | WhatsApp y ciudad del pie | Sí: `tel:`, botón flotante y "¿Buscas algo más?" (`wa.me`), `js/script.js` (`CONFIG.whatsapp`), `functions/index.js` (`WHATSAPP`), JSON-LD, 404 y páginas legales |

Cómo llegar: abre el archivo, busca `ZONA EDITABLE` con Ctrl+F, cambia solo lo que dice el comentario y guarda.

---

## Características

- **81 productos reales** del catálogo PDF, organizados como el PDF: **Especial Navidad** (cobijas y cortinas navideñas), **Sábanas** (sencilla, doble, queen, king y satinadas de rayas), **Cortinas** (clásicas y jacquard) y **Almohadas**, con filtros por tipo o tamaño.
- **Consultar por WhatsApp** en cada producto: abre el chat con el nombre, el código, la medida y un enlace a la foto.
- **Foto en grande a pantalla completa**, tipo carrusel: se desliza con el dedo o con flechas; el botón "atrás" del celular la cierra. Enlace directo a cada producto: `https://star-home-shop.pages.dev/#p-sb-09`.
- **Mi lista** (estrella ☆ en cada foto): el cliente junta varios diseños y pregunta por todos en un solo mensaje. Se recuerda en el navegador solo si acepta cookies.
- **Descargar catálogo** (PDF de 14 MB) junto al título.
- Identidad de la marca: logo de Star Home, colores del logo (dorado, rosa, crema y negro café) y las letras del catálogo PDF.
- Administrador **Sveltia CMS** en español: productos, fotos (se convierten solas a WebP), secciones, portada, aviso y PDF.
- HTML real en el código fuente (lo leen Google y los bots de IA), sin frameworks ni build step.
- SEO: title, description, canonical, Open Graph, Twitter Card, JSON-LD (WebSite, HomeGoodsStore, FAQPage y lista de productos), sitemap, robots que permite bots de IA y `llms.txt`.
- Páginas legales: privacidad, cookies, términos y políticas de compra con **retracto, garantía, reversión del pago y formulario PQR con número de radicado**.
- Banner de cookies con Aceptar y Rechazar del mismo tamaño; Google Analytics 4 solo después de aceptar.
- Responsive de 280 px (celulares plegables) a TV, accesible (sin violaciones en axe-core), botones de 44–48 px, respeta "reducir movimiento". Lighthouse celular 95/100/100/100.

---

## Estructura

```
index.html · 404.html · privacidad.html · cookies.html · terminos.html · politicas-de-compra.html
_headers · robots.txt · sitemap.xml · llms.txt · site.webmanifest
favicon.ico · favicon.svg · apple-touch-icon.png
css/styles.css · js/script.js
img/            todo WebP: logo en 3 tamaños, imagen para compartir y productos en img/productos/
                (foto grande <ref>-<nombre>.webp + miniatura <ref>-<nombre>-mini.webp)
catalogo/       catalogo-star-home-2026.pdf (botón "Descargar catálogo")
contenido/      catalogo.json y tienda.json (los edita el administrador)
admin/          index.html y config.yml (Sveltia CMS)
functions/      index.js (catálogo vivo en la página)
CLAUDE.md · README.md · CHANGELOG.md
```

---

## Ver la página en tu computador

**Con todo funcionando (catálogo vivo):** necesitas Node.js 18 o superior.

```bash
npx wrangler pages dev . --port 8788
```

Abre `http://localhost:8788`.

**Solo para mirar el diseño:** abre `index.html` directamente o usa `python3 -m http.server 8000`. Se ve la copia de respaldo del catálogo (idéntica a la del servidor).

---

## Publicar en Cloudflare Pages

Ya está conectado: cada cambio que llega a la rama `main` de GitHub (desde VS Code, desde Claude o desde `/admin`) se publica solo en ~30 s a 2 min.

Si hubiera que crearlo de nuevo: **Cloudflare → Workers & Pages → Create → Pages → Connect to Git**, elige el repositorio, Framework preset **None**, Build command y Build output **vacíos** (la raíz). Cloudflare detecta solo la carpeta `functions/`. No necesita variables de entorno.

Google: verifica la página en **Google Search Console** y envía `sitemap.xml` (la página ya es indexable). No borres nunca el archivo de verificación de Google.

### Dominio propio (cuando lo compren)

Cambiar la URL `https://star-home-shop.pages.dev` en: `index.html` (canonical, og:url, og:image, twitter:image y JSON-LD), canonical de las páginas legales, `sitemap.xml`, `robots.txt`, `llms.txt`, `functions/index.js` (`SITIO_URL`) y `admin/config.yml` (`site_url`). Luego crear `functions/_middleware.js` con la redirección 301 del `.pages.dev` al dominio nuevo (nunca `_redirects` con `/*`).

---

## Administrador (`/admin`) — guía para la dueña

**Entrar:** ve a `https://star-home-shop.pages.dev/admin` e inicia sesión con tu cuenta de GitHub (JX te agrega como colaboradora del repositorio).

**Agregar un producto:** *Productos* → *Agregar producto* → llena:
- **Código de referencia** (ej. `SB-42`: CB cobijas, CT cortinas, SB sábanas, AL almohadas),
- **Nombre del diseño** y **Tipo** (ej. "Sábana estampada"),
- **Sección** (Especial Navidad, Sábanas…) y **Grupo** (el filtro: Sencilla, Doble, Queen, King, Satinadas de rayas, Clásicas…; escríbelo igual que en los demás productos de ese grupo),
- **Medida** (opcional; si la dejas vacía sale "Medida: consúltala por WhatsApp"),
- **Foto** (y, si quieres, una **foto pequeña cuadrada**) y "Qué se ve en la foto".

Guarda. En 1–2 minutos sale en la página.

**Precio:** déjalo **vacío** (se da por WhatsApp). Si algún día lo llenas, se muestra en la tarjeta.

**Agotado u oculto:** marca *Agotado* (se ve pero no se puede consultar) o apaga *Mostrar en la página* (desaparece sin borrarlo).

**Orden:** arrastra los productos en la lista; ese es el orden en la página.

**Secciones:** *Ajustes de la tienda* → *Secciones (pestañas)*. Crea una nueva (código sin tildes ni espacios, por ejemplo `san-valentin`) y elige cuál se ve primero.

**Portada, aviso y PDF:** en *Ajustes* cambias el título grande, el texto de abajo, la barra de aviso de arriba y el **Catálogo en PDF** del botón "Descargar catálogo" (máx. 25 MB).

**Modo muestra:** está apagado (catálogo real). Encenderlo pone la barra "Catálogo de muestra" y esconde la página de Google.

> Las fotos que subas desde el administrador se convierten solas a WebP, pero no les pone el logo de Star Home ni crea la miniatura: si quieres que queden igual a las de la v1.4 (con el logo encima del del proveedor), pídeselo a JX/Claude (está explicado en `CLAUDE.md` → "Herramienta: fotos nuevas con el logo de Star Home").

### Configurar el inicio de sesión (lo hace JX una sola vez)

1. Despliega el autenticador oficial **Sveltia CMS Authenticator** en Cloudflare Workers (botón "Deploy to Cloudflare Workers" en `github.com/sveltia/sveltia-cms-auth`). Te da una URL `https://sveltia-cms-auth.<tu-subdominio>.workers.dev`.
2. En GitHub → Settings → Developer settings → **OAuth Apps → New**: callback `https://sveltia-cms-auth.<tu-subdominio>.workers.dev/callback`. Genera el *Client secret*.
3. En el Worker agrega las variables `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (cifrada) y `ALLOWED_DOMAINS` (el dominio de la página).
4. En `admin/config.yml` pon la URL del Worker en `base_url:` (el repositorio ya está).
5. Agrega a la dueña como colaboradora del repositorio en GitHub.

Mientras tanto se puede entrar con un token personal de GitHub (opción *Sign in with token* del administrador).

---

## Pago en línea y domicilios (retirados en v1.3)

La tienda vende **solo por WhatsApp**. El código del pago en línea con **Wompi** y el de **domicilios** se borró en la v1.3, pero sigue en GitHub en la etiqueta **`v1.2`** por si se vuelve a necesitar.

---

## Google Analytics 4 (ver de dónde llegan las visitas)

1. Crea una propiedad en `analytics.google.com` y copia el **ID de medición** (`G-XXXXXXXXXX`).
2. Pégalo en `js/script.js` → `CONFIG.ga4`.
3. Solo se activa si la persona acepta cookies.

Eventos que verás en **Informes → Interacción → Eventos**: `consulta_whatsapp` (tocó Consultar), `ver_foto` (abrió una foto en grande), `agregar_lista`, `lista_whatsapp` (consultó su lista), `descarga_catalogo` (descargó el PDF), `clic_whatsapp`, `clic_telefono` y `envio_formulario` (PQR).

---

## Ficha de Google (Google Business Profile)

Hace que el negocio aparezca en Google Maps y en búsquedas como "sábanas en Cartagena":

- Reclamar y verificar la ficha de **Star Home** y enlazar esta página.
- Como no hay local abierto al público, configurarla como negocio que **atiende en una zona** (Cartagena) sin mostrar dirección.
- Usar exactamente el mismo nombre y teléfono que la página (coherencia NAP).
- Subir fotos reales, el logo, categoría correcta y horario de atención.

---

## Copias de seguridad

- Todo el historial vive en GitHub: cada cambio del administrador es un commit. Para descargar una copia: **Code → Download ZIP**.
- Cloudflare guarda los despliegues anteriores: en *Deployments* puedes volver a una versión anterior con un clic.
- Cada entrega tiene su etiqueta en GitHub (`v1.0`, `v1.2`, `v1.3`, `v1.4`): en **Tags** se descarga el ZIP exacto de esa versión.

---

## Propiedad

El código fuente y el contenido de esta página son **propiedad de Star Home**. Se entregan todos los archivos sin minificar. Las fotos de producto son del proveedor (con el logo de Star Home encima, por decisión de la tienda): conviene tener su autorización.
**Dominio y hosting:** por ser cliente básico, el sitio está en la cuenta de Cloudflare de JX Company. Para transferirlo: se pasa el repositorio de GitHub a la cuenta de la dueña (*Settings → Transfer*), se crea el proyecto de Pages en su cuenta de Cloudflare conectado a ese repositorio y se mueve el dominio.
**Credenciales a entregar** cuando existan: Cloudflare, dominio, GitHub, GA4 y Search Console.

---

## Pendientes `{POR CONFIRMAR}`

Ver la lista completa en `CLAUDE.md`. Resumen: IVA, datos legales del responsable, medios de pago por WhatsApp, forma y tiempo de entrega, cambios, garantía, ID de GA4, autenticador del CMS, redes sociales, horario, permiso del proveedor para las fotos y medidas reales de cortinas, satinadas y almohadas.

> Los textos legales son una base profesional, no asesoría legal. Deben revisarlos un abogado.

---

Diseño y desarrollo: **JX Company**.
