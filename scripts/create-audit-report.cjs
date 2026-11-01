const fs = require('node:fs');
const { createRequire } = require('node:module');
const { execSync } = require('node:child_process');
const requireGlobal = createRequire(execSync('npm root -g', {encoding:'utf8'}).trim() + '/package.json');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, ImageRun } = requireGlobal('docx');
const navy='1B2A4A', blue='2563EB', gray='E2E8F0';
const date='2026-11-01';
const groups = [
['SEO analysis', '4/10 · live baseline', [
 ['Technical on-page', [
  ['Title and description','Present. Homepage title is “D3 Agency — A little studio. A world of ideas.” It names the brand but not its services.','Needs attention'],
  ['Headings','One H1: “A little studio. A world of ideas.” H2s describe work, the founder and contact. No service-specific pages are linked.','Needs attention'],
  ['Canonical and robots meta','No canonical URL or robots meta in the live HTML. Default indexing is allowed; a missing robots meta is not a noindex error.','Needs attention'],
  ['Crawl files','/robots.txt and /sitemap.xml returned actual HTTP 404 responses. No internal page URLs were discovered beyond homepage fragments.','Needs attention'],
  ['Social previews','og:title and og:description exist. og:url, og:image, og:type and Twitter card metadata are absent.','Missing'],
  ['Mobile and images','Viewport is present. Decorative images have empty alt text, which is appropriate. Image dimensions are provided.','Good'],
  ['HTTPS and links','Homepage returned HTTP 200 over HTTPS. Work links point to Elevora, Mankrruuti and D3CRM. Contact email is visible.','Good'],
 ]],
 ['Content quality', [
  ['Topic coverage','The live homepage explains the independent studio and links real work. It does not explain website automation, product scope, pricing process or typical buying questions.','Needs attention'],
  ['Internal navigation','Header links are #work, #about and #contact. There are no discoverable service detail pages in the homepage or an available sitemap.','Needs attention'],
  ['Freshness','No publication dates are shown. A date is not essential for an evergreen agency homepage. HTTP Last-Modified was 18 October 2026.','Good'],
 ]],
 ['Structured data', [
  ['JSON-LD','No application/ld+json blocks in the live homepage. Add an accurate Organization and WebSite entity, with consistent D3 naming.','Missing'],
 ]],
]],
['GEO analysis', '5/10 · live baseline', [
 ['Experience and trust', [
  ['Founder','Dhruv is named and explains that visitors work directly with him. No credentials are claimed; do not invent any.','Good'],
  ['Proof of work','Three real work links are visible. D3CRM is accurately marked as an in-house product in development. No measured client results are supplied.','Good'],
  ['Contact','A working email link and a CRM-connected enquiry form are present. No phone or office address is claimed. Do not fabricate local business details.','Good'],
  ['Entity clarity','D3 Agency is the current visible brand, while the domain is d3tech.agency. Brand variants and the canonical origin are not declared in structured data.','Needs attention'],
 ]],
 ['Content for AI synthesis', [
  ['Clear service answers','The site is readable HTML, but its “world of ideas” positioning does not directly explain what a founder can hire D3 to build.','Needs attention'],
  ['Factual density','Client names, founder name and product status provide concrete facts. No case-study outcomes or original research are available to support stronger claims.','Needs attention'],
  ['Reference files','/llms.txt and /llm.txt returned 404. These are optional reference formats, not a Google ranking factor or guaranteed AI citation mechanism.','Needs attention'],
 ]],
 ['Technical GEO', [
  ['Readable content','Headings, body copy and project links are server-delivered HTML. Important information does not require JavaScript rendering.','Good'],
  ['Crawler access','Homepage is accessible by ordinary HTTPS fetch. Search fetch tool failed, but a direct HTTP client succeeded. CDN-specific crawler behavior was not tested.','Needs attention'],
  ['Social identity','No verified social profiles were supplied. Do not invent sameAs links or repurpose client URLs as the agency’s profiles.','Needs attention'],
 ]],
]],
['AEO analysis', '3/10 · live baseline', [
 ['Direct answers', [
  ['Question coverage','No FAQ or question-led service explanations were found on the sole discovered page.','Missing'],
  ['Direct definition','The studio is introduced, but there is no concise statement covering websites, web apps and automation for founders and businesses.','Needs attention'],
  ['Process','No explicit discovery, design/build and launch process is explained.','Missing'],
 ]],
 ['Structured answer formats', [
  ['FAQ markup','No FAQPage markup is present. Adding accurate FAQs can improve clarity, but Google retired FAQ rich results in 2026; do not promise them.','Needs attention'],
  ['Special markup','HowTo and Speakable are not appropriate requirements for this agency homepage. No unsupported markup should be added to inflate an audit score.','Good'],
 ]],
 ['Conversational readiness', [
  ['Tone','Copy is brief and conversational. The contact form asks for name, email and message without unnecessary steps.','Good'],
  ['Buying questions','Visitors cannot find direct answers about scope, redesigns, existing-site automation, starting with an idea or how a quote is prepared.','Missing'],
 ]],
]],
];
const priorities = [
 ['High','Canonical origin, complete OG/Twitter metadata and valid raster previews','SEO','Low','Consistent indexing signals and reliable sharing'],
 ['High','Dedicated website, web-app and automation pages with useful answers','SEO / GEO / AEO','Medium','Matches the agency’s actual offer and buyer intent'],
 ['High','Accurate Organization / WebSite entities and visible founder information','SEO / GEO','Low','Connects D3, D3 Agency and D3 Tech to one site'],
 ['High','Sitemap, robots.txt and crawlable internal service links','SEO','Low','Makes all public pages discoverable'],
 ['Medium','Real case-study context and measurable outcomes when available','GEO','Needs owner evidence','Builds trust without fabricated proof'],
 ['Medium','Post-launch Search Console, Bing Webmaster Tools and URL inspection','SEO','Owner access','Verifies indexing and reveals real queries'],
 ['Quick win','Optional llms.txt and requested llm.txt reference alias','GEO','Low','Provides a concise public reference for tools that read it'],
];
const strengths = ['The current site is served as readable HTML over HTTPS.','The studio names the person responsible for delivery and provides direct contact.','Selected work links to real client websites and clearly labels the in-house product.','The existing contact form has accessible inline errors and preserves drafts when requests fail.'];
const changes = ['Updated existing homepage copy for websites, web applications and business automation for founders and businesses.','Preserved the original page structure, stylesheet, fonts, illustrations, animations, project links and CRM form. No new service pages or redesigned sections are included.','Added canonical metadata, Open Graph and Twitter cards, and accurate Organization, WebSite and WebPage data. No FAQ markup is included because the original page has no visible FAQs.','Added a 1200×630 homepage share image, brand logo, touch icon, sitemap.xml, robots.txt, llms.txt and llm.txt.','Deployment, search indexing, browser rendering and live social previews remain to be verified. No ranking or AI citation gains have been measured.'];

const sources = [
 ['Live homepage','https://d3tech.agency/'],
 ['Google AI optimization guide','https://developers.google.com/search/docs/fundamentals/ai-optimization-guide'],
 ['Google site names','https://developers.google.com/search/docs/appearance/site-names'],
 ['Google documentation updates','https://developers.google.com/search/updates'],
 ['Open Graph protocol','https://ogp.me/'],
];
const report={domain:'d3tech.agency',date,scores:[['SEO','4/10','Needs work'],['GEO','5/10','On track'],['AEO','3/10','Needs work']],groups,priorities,strengths,changes,sources};
fs.mkdirSync('reports',{recursive:true}); fs.writeFileSync('reports/audit-data.json',JSON.stringify(report,null,2));
const p=(text,opts={})=>new Paragraph({children:[new TextRun({text,...(opts.run||{})})],spacing:{after:160},...opts});
const h=(text,level=1)=>p(text,{heading:level===1?HeadingLevel.HEADING_1:HeadingLevel.HEADING_2,spacing:{before:240,after:180}});
function table(headers,rows,widths) {
 const all=[headers,...rows];return new Table({width:{size:9360,type:WidthType.DXA},columnWidths:widths,
 rows:all.map((row,i)=>new TableRow({cantSplit:true,tableHeader:i===0,children:row.map((text,j)=>new TableCell({width:{size:widths[j],type:WidthType.DXA},shading:{type:ShadingType.CLEAR,fill:i===0?navy:(i%2?'F8F9FA':'FFFFFF')},margins:{top:100,bottom:100,left:120,right:120},children:[p(text,{spacing:{after:0},run:{color:i===0?'FFFFFF':'1E293B',bold:i===0,size:i===0?20:19}})]}))}))});
}
const cover=[new Paragraph({children:[new ImageRun({type:'png',data:fs.readFileSync('reports/cover.png'),transformation:{width:816,height:1056},floating:{horizontalPosition:{relative:'page',offset:0},verticalPosition:{relative:'page',offset:0},behindDocument:true}})]})];
const body=[h('Executive summary'),p('D3 has a credible starting point: a named founder, real project links and readable HTML. Search and sharing foundations are incomplete, and the content does not explain the agency’s intended website, web-app and automation offer. The most useful improvement is a clear brand entity supported by dedicated service pages and direct answers to buying questions. This report records the live baseline before the local content update; it does not claim measured ranking gains.'),table(['Dimension','Score','Status','Key takeaway'],[['SEO','4/10','Needs work','Complete metadata, discovery files and service pages.'],['GEO','5/10','On track','Retain real proof and make the brand and services explicit.'],['AEO','3/10','Needs work','Answer specific buying questions in visible HTML.'],['Combined','12/30','','Editorial audit scores, not measured search performance.']],[1300,800,1500,5760]),h('Pages audited'),table(['URL','Type','Observed result'],[['https://d3tech.agency/','Homepage','200; all internal links are homepage fragments.'],['/robots.txt','Crawl file','404'],['/sitemap.xml','Sitemap','404'],['/llms.txt','AI reference','404'],['/llm.txt','Requested alias','404']],[3600,1800,3960]),p('Discovery covered every meaningful internal URL found in the fetched homepage. There were no separate internal content pages in its navigation or body, and no sitemap was available. This is not a claim that undiscoverable URLs cannot exist.'),p('Limits: no Search Console or Bing account access, backlink data, field Core Web Vitals, browser rendering or verified crawler-specific logs. The browser control host was unavailable. Direct HTTPS fetch succeeded even though the search fetch tool could not open this domain.')];
for(const [name,score,sections] of groups){body.push(h(name),p(score));for(const [name,rows]of sections)body.push(h(name,2),table(['Signal','Evidence and recommendation','Status'],rows,[1800,5760,1800]));}
body.push(h('Priority recommendations'),table(['Priority','Issue','Dimension','Effort','Impact'],priorities,[1000,3100,1300,1400,2560]),h('What is working well'),...strengths.map(x=>p('• '+x)),h('Prepared implementation'),...changes.map(x=>p('• '+x)),h('Launch and measurement'),p('Deploy the built dist directory to the existing host and verify the homepage, image and text files over production HTTPS. Confirm the preferred domain and redirect supported aliases. Submit the sitemap in Google Search Console and Bing Webmaster Tools; inspect the homepage for indexing. Review real query impressions and clicks, including D3, D3 Agency and D3 Tech, after crawlers have revisited. Ranking for the broad term D3 cannot be guaranteed. Build recognition through consistent public profiles, relevant mentions and documented client work.'),h('Glossary'),p('SEO helps search engines discover, understand and serve useful pages. GEO describes visibility in answers synthesized by AI services. AEO describes making content easy to use as a direct answer. The same crawlable, accurate, useful content supports all three. Optional AI reference files and schema do not guarantee visibility.'),h('Sources'),...sources.map(([name,url])=>p(name+'\n'+url)));
const doc = new Document({creator:'D3 Agency',title:'D3 Agency SEO GEO AEO audit',styles:{default:{document:{run:{font:'Arial',size:22,color:'1E293B'},paragraph:{spacing:{after:160}}}},paragraphStyles:[{id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',run:{font:'Arial',size:48,bold:true,color:navy},paragraph:{keepNext:true}},{id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',run:{font:'Arial',size:36,bold:true,color:navy},paragraph:{keepNext:true}}]},sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440}}},children:cover},{properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440}}},headers:{default:new Header({children:[p('d3tech.agency                                      SEO / GEO / AEO Audit Report',{run:{size:18,color:navy},border:{bottom:{color:navy,size:8,style:BorderStyle.SINGLE}}})]})},footers:{default:new Footer({children:[new Paragraph({border:{top:{color:gray,size:4,style:BorderStyle.SINGLE}},children:[new TextRun({text:'D3 Agency · Audit workflow by Alex Labat                         ',font:'Arial',size:18,color:'64748B'}),new TextRun({children:[PageNumber.CURRENT],size:18})]})]})},children:body}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(`reports/seo-audit-d3tech-agency-${date}.docx`,b);console.log('DOCX report written; structured report data saved.');});
