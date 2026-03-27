# Disorder Frontend

Frontend en Vite + React para Disorder Underground Shop, conectado con WordPress mediante GraphQL.

## Variables de entorno

Parte de `.env.example` y ajusta estos valores para desarrollo y despliegue:

- `VITE_WORDPRESS_GRAPHQL_URL`: endpoint GraphQL de WordPress.
- `VITE_SITE_URL`: dominio publico final del frontend.
- `VITE_FRONTEND_URL`: URL local o alternativa del frontend.
- `VITE_WHATSAPP_NUMBER`: numero para el boton flotante.
- `VITE_WHATSAPP_MESSAGE`: mensaje por defecto para WhatsApp.
- `VITE_CONTACT_EMAIL`: email de contacto mostrado en el footer.

## Comandos

- `npm run dev`: levanta el entorno local.
- `npm run generate:sitemap`: genera `public/sitemap.xml` y `public/robots.txt`.
- `npm run build`: genera sitemap, compila TypeScript y construye Vite.
- `npm run preview`: sirve la build localmente.

## Preparacion de despliegue

El proyecto ya incluye:

- `sitemap.xml` y `robots.txt` generados automaticamente antes de cada build.
- pagina HTML de mapa del sitio en `/mapa-del-sitio`.
- boton flotante de WhatsApp configurable por entorno.
- metadatos SEO ampliados con canonical, Open Graph y Twitter Cards.
- division por rutas mediante `lazy()` para reducir la carga inicial.

## Nota de build

Si `npm run build` falla, revisa primero la generacion de tipos GraphQL y la configuracion de TypeScript del archivo generado `src/api/graphql/generated.ts`.
