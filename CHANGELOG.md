# Historial de versiones — Estrellita House

Registro de cada entrega del sitio (`https://star-home-shop.pages.dev`).
La más nueva va arriba. Cada versión tiene su etiqueta en git (`git tag vX.Y`)
y el mismo número se muestra en la portada (ZONA EDITABLE · VERSIÓN de `index.html`).
Cómo publicar una versión nueva: ver "Versiones" en `CLAUDE.md`.

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
