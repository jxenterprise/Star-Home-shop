# Estrellita House — Tienda de sábanas, cortinas y tapetes en Cartagena

Landing de una sola página con catálogo por temporadas, carrito y pedido por WhatsApp (con el total calculado), más un administrador para que la dueña cambie productos y precios sin depender del desarrollador.

**Versión actual: v1.3** (11 nov 2026). Próximo paso: catálogo con las fotos reales de la vendedora (ver "📍 DÓNDE NOS QUEDAMOS" en `CLAUDE.md`) · En vivo: <https://star-home-shop.pages.dev> · Historial de cambios: [`CHANGELOG.md`](CHANGELOG.md)

> ⚠ **Catálogo de muestra.** Los productos, fotos y precios actuales son simulados mientras llega el material real. La página está en **Modo muestra**: muestra un aviso arriba y no se indexa en Google. Se apaga desde el administrador.

---

## Zonas editables (cambios a mano en el código)

Casi todo se cambia desde el administrador (`/admin`). En el código solo quedan dos zonas marcadas:

| Zona | Qué cambia | Archivo | ¿Se repite? |
|---|---|---|---|
| `ZONA EDITABLE · TEXTOS` | Nota de precios / IVA | `index.html` | Sí: sección Precios de `terminos.html` |
| `ZONA EDITABLE · CONTACTO` | WhatsApp y ciudad del pie | `index.html` | Sí: `tel:`, botón flotante `wa.me`, `js/script.js` (`CONFIG.whatsapp`), JSON-LD, 404 y páginas legales |

Cómo llegar: abre el archivo, busca `ZONA EDITABLE` con Ctrl+F, cambia solo lo que dice el comentario y guarda. Si el sitio está conectado a GitHub, al guardar el cambio (commit) Cloudflare publica solo en 1–2 minutos.

---

## Características

- Catálogo por colecciones (Navidad, Halloween, Todo el año y las que se creen), con medidas y precio por medida.
- Carrito con cantidades y total; se recuerda en el navegador solo si la persona acepta cookies.
- Venta **solo por WhatsApp**: la persona escribe su nombre y se abre el chat con cada producto, su medida, la cantidad, el valor y el **total** ya escritos. El pago y la entrega se acuerdan por chat. No hay pago en línea ni domicilios (se retiraron en v1.3; ver más abajo cómo volver a tenerlos).
- Administrador **Sveltia CMS** en español: productos, fotos (se convierten solas a WebP), colecciones, portada y aviso.
- HTML real en el código fuente (lo leen Google y los bots de IA), sin frameworks ni build step.
- SEO completo: title, description, canonical, Open Graph, Twitter Card, JSON-LD (WebSite, HomeGoodsStore, FAQPage, productos con Offer), sitemap, robots que permite bots de IA y `llms.txt`.
- Páginas legales: privacidad, cookies, términos y políticas de compra con **retracto, garantía, reversión del pago y formulario PQR con número de radicado**.
- Banner de cookies con Aceptar y Rechazar del mismo tamaño; Google Analytics 4 solo después de aceptar.
- Responsive de 320 px a TV, accesible (sin violaciones en axe-core), 48 px mínimo en botones, respeta "reducir movimiento".

---

## Estructura

```
index.html · 404.html · privacidad.html · cookies.html · terminos.html · politicas-de-compra.html
_headers · robots.txt · sitemap.xml · llms.txt · site.webmanifest
favicon.ico · favicon.svg · apple-touch-icon.png
css/styles.css · js/script.js
img/            (todo WebP; productos en img/productos/)
contenido/      catalogo.json y tienda.json (los edita el administrador)
admin/          index.html y config.yml (Sveltia CMS)
functions/      index.js (catálogo vivo en la página)
CLAUDE.md · README.md
```

---

## Ver la página en tu computador

**Con todo funcionando (catálogo vivo y pago de prueba):** necesitas Node.js 18 o superior.

```bash
cd estrellita-house
npx wrangler pages dev .
```

Abre la dirección que aparece (normalmente `http://localhost:8788`).

**Solo para mirar el diseño:** `python3 -m http.server 8000` dentro de la carpeta y abre `http://localhost:8000`. Se ve la copia de respaldo del catálogo y el botón "Pagar en línea" avisa que no está activo.

---

## Publicar en Cloudflare Pages (paso a paso)

1. **GitHub:** crea un repositorio (por ejemplo `estrellita-house`) y sube todos los archivos de esta carpeta.
2. **Cloudflare → Workers & Pages → Create → Pages → Connect to Git** y elige el repositorio.
   - Framework preset: **None**.
   - Build command: **vacío**.
   - Build output directory: **vacío** (la raíz del proyecto).
   - Cloudflare detecta solo la carpeta `functions/`.
3. **Variables de entorno** (Settings → Environment variables), en *Production* con las llaves de producción y en *Preview* con las de pruebas:
   - `WOMPI_PUBLIC_KEY`
   - `WOMPI_INTEGRITY_SECRET` (márcala como cifrada / *Encrypt*)
4. Guarda y despliega. La dirección será `https://<nombre-del-proyecto>.pages.dev`. Si el nombre no es `estrellita-house`, cambia la URL en todos los lugares de la sección **Dominio** de abajo.
5. Sitio nuevo: verifica la propiedad en **Google Search Console** y envía `sitemap.xml` cuando apagues el Modo muestra. No borres nunca el archivo de verificación de Google.

### Dominio propio (cuando lo compren)

Cambiar la URL `https://star-home-shop.pages.dev` en: `index.html` (canonical, og:url, og:image, twitter:image y JSON-LD), canonical de las páginas legales, `sitemap.xml`, `robots.txt`, `llms.txt`, `functions/index.js` (`SITIO_URL`) y `admin/config.yml` (`site_url`). Luego crear `functions/_middleware.js` con la redirección 301 del `.pages.dev` al dominio nuevo (nunca `_redirects` con `/*`).

---

## Administrador (`/admin`) — guía para la dueña

**Entrar:** ve a `https://tu-pagina/admin` e inicia sesión con tu cuenta de GitHub (es gratis; JX te agrega como colaboradora del repositorio).

**Agregar un producto:** *Productos* → *Agregar producto* → llena nombre, colección, tipo, descripción corta, foto, "Qué se ve en la foto" y al menos una medida con su precio (en pesos, sin puntos: `84900`). Guarda. En 1–2 minutos sale en la página.

**Cambiar un precio:** abre el producto → *Medidas y precios* → cambia el número → Guardar.

**Agotado u oculto:** marca *Agotado* (se ve pero no se puede comprar) o apaga *Mostrar en la página* (desaparece sin borrarlo).

**Orden:** arrastra los productos en la lista; ese es el orden en la página.

**Temporadas:** *Ajustes de la tienda* → *Colecciones*. Crea una nueva (código sin tildes ni espacios, por ejemplo `san-valentin`), y elige cuál se ve primero en *Colección que se ve primero*.

**Portada y aviso:** en *Ajustes* cambias el título grande, el texto de abajo y la barra de aviso de arriba.

**Modo muestra:** apágalo cuando estén los productos y precios reales. Así desaparece el aviso y Google puede mostrar la página.

### Configurar el inicio de sesión (lo hace JX una sola vez)

1. Despliega el autenticador oficial **Sveltia CMS Authenticator** en Cloudflare Workers (botón "Deploy to Cloudflare Workers" en `github.com/sveltia/sveltia-cms-auth`). Te da una URL `https://sveltia-cms-auth.<tu-subdominio>.workers.dev`.
2. En GitHub → Settings → Developer settings → **OAuth Apps → New**: callback `https://sveltia-cms-auth.<tu-subdominio>.workers.dev/callback`. Genera el *Client secret*.
3. En el Worker agrega las variables `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (cifrada) y `ALLOWED_DOMAINS` (el dominio de la página).
4. En `admin/config.yml` pon el repositorio real en `repo:` y la URL del Worker en `base_url:`.
5. Agrega a la dueña como colaboradora del repositorio en GitHub.

Mientras tanto se puede entrar con un token personal de GitHub (opción *Sign in with token* del administrador).

---

## Pago en línea y domicilios (retirados en v1.3)

Desde la v1.3 (11 nov 2026) la tienda vende **solo por WhatsApp**: es un emprendimiento pequeño y por ahora no hace domicilios en todo Cartagena. El código del pago en línea con **Wompi** (Web Checkout con firma de integridad, `functions/api/wompi/`) y el del **domicilio** (fijo o por barrio, desde el administrador) se borraron, pero siguen guardados en GitHub en la etiqueta **`v1.2`**. Para volver a tenerlos se recuperan desde esa versión; antes de activar Wompi hay que corregir las fallas anotadas en la memoria de JX/Claude (la consulta de la transacción necesita la llave privada, entre otras).

---

## Google Analytics 4 (ver de dónde llegan las visitas)

1. Crea una propiedad en `analytics.google.com` y copia el **ID de medición** (`G-XXXXXXXXXX`).
2. Pégalo en `js/script.js` → `CONFIG.ga4`.
3. Solo se activa si la persona acepta cookies.

Qué mirar: en **Informes → Adquisición** ves de dónde llega la gente (Google, Instagram, WhatsApp, directo). En **Informes → Interacción → Eventos**: `clic_whatsapp`, `add_to_cart` (agregó al carrito), `begin_checkout` (fue a pagar), `purchase` (pago aprobado), `pedido_whatsapp` (envió el pedido por chat) y `envio_formulario` (PQR).

---

## Ficha de Google (Google Business Profile)

La ficha de Google hace que el negocio aparezca en Google Maps y en búsquedas como "sábanas en Cartagena". Recomendado:

- Reclamar y verificar la ficha de **Estrellita House** y enlazar esta página.
- Como no hay local abierto al público, configurarla como negocio que **atiende en una zona** (Cartagena) sin mostrar dirección.
- Usar exactamente el mismo nombre y teléfono que la página (coherencia NAP).
- Subir fotos reales, categoría correcta y horario de atención.

---

## Copias de seguridad

- Todo el historial vive en GitHub: cada cambio del administrador es un commit. Para descargar una copia: **Code → Download ZIP**.
- Cloudflare guarda los despliegues anteriores: en *Deployments* puedes volver a una versión anterior con un clic.
- Cada entrega tiene su etiqueta en GitHub (`v1.0`, `v1.2`…): en **Tags** se descarga el ZIP exacto de esa versión. Qué cambió en cada una está en `CHANGELOG.md`.

---

## Propiedad

El código fuente y el contenido de esta página son **propiedad de Estrellita House**. Se entregan todos los archivos sin minificar.
**Dominio y hosting:** por ser cliente básico, el sitio está en la cuenta de Cloudflare de JX Company. Para transferirlo: se pasa el repositorio de GitHub a la cuenta de la dueña (*Settings → Transfer*), se crea el proyecto de Pages en su cuenta de Cloudflare conectado a ese repositorio, se copian las variables de Wompi y se mueve el dominio.
**Credenciales a entregar** cuando existan: Cloudflare, dominio, GitHub, GA4 y Search Console.

---

## Pendientes `{POR CONFIRMAR}`

Ver la lista completa en `CLAUDE.md`. Resumen: nombre exacto, catálogo real, IVA, datos legales del responsable, medios de pago por WhatsApp, forma y tiempo de entrega, cambios, garantía, ID de GA4, autenticador del CMS, redes sociales y horario.

> Los textos legales son una base profesional, no asesoría legal. Deben revisarlos un abogado antes de publicar con productos reales.

---

Diseño y desarrollo: **JX Company**.
