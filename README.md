# D3 Agency

A responsive, light-only landing page for Dhruv's independent digital studio. Built with HTML, CSS, Vite, and a locally bundled Paper mesh-gradient shader. Fonts are self-hosted.

```sh
npm install
npm run dev
npm run build
```

Deploy the generated `dist/` directory to any static host. Contact links open an email to `dhruvdabhi101@gmail.com`. Project links open the client site and D3CRM. The hero uses a generated cloud-sky background, and the footer features a generated ASCII-style hilltop town illustration. Both assets are optimized WebP files in `public/`. See `ASSET-PROMPTS.md` for their generation briefs.

Shader animation respects reduced-motion preferences and falls back to a CSS gradient without WebGL. Paper Shaders: https://shaders.paper.design/ (Apache-2.0).

## Contact form

“Say hello” and the hero button scroll to the contact form. It submits `name`, `email`, `message`, `_gotcha`, and the permitted `_context` metadata directly to the existing d3CRM form. Its browser key is publishable. The CRM schema and origin settings are unchanged.

Inputs use native browser editing and autocomplete. Name and message are limited to 120 and 3000 characters. Errors appear beside the fields and the status is announced to assistive technology. Submission disables only the send button; errors preserve the draft, and edits made while sending survive a successful response. No cookies or storage are used for attribution.

### Testing

- Run `npm test` for mocked submission checks: validation, payload/context constraints, duplicate prevention, 201/202 success, 422 inline errors, configuration errors, rate limits, network failures, timeouts, and edits during submission. These tests never contact d3CRM.
- Run `npm run build`, then open the site and select “Say hello”. Check keyboard navigation, typing, selection, cut/paste, undo, and multiline messages on desktop and mobile. Pressing Send with empty fields should show inline errors without sending a request.
- Use d3CRM’s `/api/v1/forms/contact-form-ce9edd40/verify` endpoint for a connection check with the same headers and payload. This checks Live status, key, schema, and origin rules without creating a lead or sending notifications. Run it from the website’s origin to exercise browser CORS. The visitor form always posts to `/submissions`.
- A genuine message submitted on the website should show success and appear in the d3CRM Inbox. Live test enquiries require approval; none were sent during implementation.

## Search metadata and crawler files

The original page layout, stylesheet and animations are retained. Copy in `index.html` describes websites, web applications and business automation for founders and businesses. `content/site.js` supplies the homepage title, description and canonical origin, `https://d3tech.agency`. The public brand is D3 Agency; D3 and D3 Tech are alternate names.

`npm run build` generates metadata, Organization/WebSite/WebPage JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt` and the requested `llm.txt` alias. Only the actual homepage is listed in the sitemap. There is no hidden FAQ markup or invented contact information. Open Graph and Twitter previews use a checked-in 1200×630 PNG. These references and metadata do not guarantee rankings or AI citations.

Run `npm test`, `npm run build` and `npm run check:seo`. The SEO check verifies the built HTML, canonical URL, structured data, image dimensions, local assets, anchors and crawl files. See `deploy/README.md` for production and Search Console checks.
