import { readFileSync, writeFileSync } from 'node:fs';
import { site } from '../content/site.js';
const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const url = `${site.origin}/`;
const image = `${site.origin}/og/home.png`;
const organization = `${url}#organization`;
const alternateName = ['D3', 'D3 Tech', 'd3tech', 'D3 Tech Agency'];
const knowsAbout = ['website design', 'web development', 'web applications', 'MVP development', 'business automation', 'CRM integration'];
const graph = [
  { '@type': 'Organization', '@id': organization, name: site.name, alternateName, description: site.description, slogan: 'Your next idea. Built to work.', knowsAbout, url, email: site.email, logo: { '@type': 'ImageObject', url: `${site.origin}/logo.png`, width: 512, height: 512 }, founder: { '@type': 'Person', name: 'Dhruv' }, makesOffer: site.services.map(({ name, description }) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description, provider: { '@id': organization } } })) },
  { '@type': 'WebSite', '@id': `${url}#website`, url, name: site.name, alternateName, publisher: { '@id': organization }, inLanguage: 'en' },
  { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: site.title, description: site.description, isPartOf: { '@id': `${url}#website` }, about: { '@id': organization }, primaryImageOfPage: { '@type': 'ImageObject', url: image } },
  { '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: site.faqs.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
];
const meta = `<title>${esc(site.title)}</title>
<meta name="description" content="${esc(site.description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(site.title)}">
<meta property="og:description" content="${esc(site.description)}">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="D3 Agency. Websites, web apps and automation for founders and businesses.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(site.title)}">
<meta name="twitter:description" content="${esc(site.description)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="D3 Agency. Your next idea. Built to work.">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>`;
const fill = (source, name, content) => {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  if (!source.includes(start) || !source.includes(end)) throw new Error(`Homepage ${name} markers are missing.`);
  return source.replace(new RegExp(`${start}[\\s\\S]*?${end}`), () => `${start}\n${content}\n${end}`);
};
const services = `<div class="service-list">\n${site.services.map(({ name, description }, index) => `<article class="service" data-reveal><span class="service-number">${String(index + 1).padStart(2, '0')}</span><h3>${esc(name)}</h3><p>${esc(description)}</p></article>`).join('\n')}\n</div>`;
const faq = `<div class="faq-list" data-reveal>\n${site.faqs.map(({ question, answer }, index) => `<details class="faq-item"${index === 0 ? ' open' : ''}><summary><h3>${esc(question)}</h3><span class="faq-icon" aria-hidden="true"></span></summary><p>${esc(answer)}</p></details>`).join('\n')}\n</div>`;
let source = readFileSync('index.html', 'utf8');
source = fill(source, 'seo', meta);
source = fill(source, 'services', services);
source = fill(source, 'faq', faq);
writeFileSync('index.html', source);
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`);
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`);
const faqText = site.faqs.map(({ question, answer }) => `### ${question}\n${answer}`).join('\n\n');
const llms = `# D3 Agency\n\n> D3 Agency is Dhruv’s independent studio for custom websites, web applications and business automation for founders and businesses.\n\nCanonical website: ${url}\nAlternate brand names: D3, D3 Tech, D3 Tech Agency, d3tech.\nContact: ${site.email}\n\n## Services\n- Custom website design and development.\n- Web applications and MVPs for founders.\n- Business automation, enquiry forms, CRM connections and workflow integrations.\n\n## Studio and work\n- [About Dhruv and D3 Agency](${url}#about)\n- [Selected work](${url}#work): Elevora Talent Partners, Mankrruuti Design Studio and the in-house D3CRM project.\n- [Project enquiries](${url}#contact)\n- [Sitemap](${site.origin}/sitemap.xml)\n\n## Frequently asked questions\n${faqText}\n\nPricing and timelines are discussed after understanding the project scope. No guaranteed search rankings or measured client results are claimed.\n`;
writeFileSync('public/llms.txt', llms);
writeFileSync('public/llm.txt', llms);
console.log('Generated homepage metadata, sitemap, robots and AI reference files. Original UI retained.');
