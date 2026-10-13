# D3 Agency

A responsive, light-only landing page for Dhruv's independent digital studio. Built with HTML, CSS, Vite, and a locally bundled Paper mesh-gradient shader. Fonts are self-hosted.

```sh
npm install
npm run dev
npm run build
```

Deploy the generated `dist/` directory to any static host. Contact links open an email to `dhruvdabhi101@gmail.com`. Project links open the client site and D3CRM. The hero uses a generated cloud-sky background, and the footer features a generated ASCII-style hilltop town illustration. Both assets are optimized WebP files in `public/`. See `ASSET-PROMPTS.md` for their generation briefs.

Shader animation respects reduced-motion preferences and falls back to a CSS gradient without WebGL. Paper Shaders: https://shaders.paper.design/ (Apache-2.0).
