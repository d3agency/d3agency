"""Verify the actual production output, including discovery and sharing contracts."""
import json
import re
import struct
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote

root = Path('dist')
origin = 'https://d3tech.agency'
paths = ['/']
class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags = []; self.ids = []; self.jsons = []; self.script = None
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs); self.tags.append((tag, attrs))
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag == 'script' and attrs.get('type') == 'application/ld+json': self.script = ''
    def handle_data(self, data):
        if self.script is not None: self.script += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            self.jsons.append(json.loads(self.script)); self.script = None

pages = {p: Page((root / p.lstrip('/') / 'index.html').read_text()) for p in paths}
titles = set(); descriptions = set(); cards = set()
for path, page in pages.items():
    assert len(page.ids) == len(set(page.ids)), f'Duplicate IDs: {path}'
    assert sum(t == 'h1' for t, a in page.tags) == 1, path
    metas = {a.get('property', a.get('name')): a.get('content') for t, a in page.tags if t == 'meta'}
    canonical = [a['href'] for t,a in page.tags if t == 'link' and a.get('rel') == 'canonical']
    assert canonical == [origin + path], path
    assert metas['og:url'] == origin + path
    assert metas['twitter:card'] == 'summary_large_image'
    assert metas['og:site_name'] == 'D3 Agency'
    assert 'noindex' not in metas['robots']
    assert 90 <= len(metas['description']) <= 180, (path, len(metas['description']))
    assert metas['description'] not in descriptions; descriptions.add(metas['description'])
    assert metas['og:title'] not in titles; titles.add(metas['og:title'])
    assert metas['og:image'] == metas['twitter:image']
    image = urlparse(metas['og:image']); assert image.scheme == 'https' and image.netloc == 'd3tech.agency'
    data = (root / image.path.lstrip('/')).read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', data[16:24]) == (1200,630)
    cards.add(image.path)
    graph = page.jsons[0]['@graph']; types = {item['@type'] for item in graph}
    assert {'Organization','WebSite','WebPage'} <= types
    website = next(item for item in graph if item['@type'] == 'WebSite')
    assert {'D3','D3 Tech'} <= set(website['alternateName'])
    if path not in ['/', '/about/']: assert {'Service','BreadcrumbList','FAQPage'} <= types
    source = (root / path.lstrip('/') / 'index.html').read_text()
    if path == '/':
        faq_page = next(item for item in graph if item['@type'] == 'FAQPage')
        visible_items = sum(t == 'details' and 'faq-item' in a.get('class', '').split() for t, a in page.tags)
        assert visible_items and len(faq_page['mainEntity']) == visible_items, (len(faq_page['mainEntity']), visible_items)
        offers = next(item for item in graph if item['@type'] == 'Organization')['makesOffer']
        assert len(offers) == 3 and all(o['itemOffered']['@type'] == 'Service' for o in offers)
        assert sum(t == 'article' and 'service' in a.get('class', '').split() for t, a in page.tags) == 3
    for item in graph:
        if item['@type'] == 'FAQPage':
            for question in item['mainEntity']:
                assert question['name'] in source, (path, question['name'])
                # Parse text to compare HTML entities and punctuation correctly.
                visible = re.sub('<[^>]+>', '', source[source.index('<body'):])
                from html import unescape
                assert question['acceptedAnswer']['text'] in unescape(visible)
    for tag, attrs in page.tags:
        for attr in (['href'] if tag in ['a','link'] else ['src'] if tag in ['script','img'] else []):
            value = attrs.get(attr, '')
            parsed = urlparse(value)
            if parsed.scheme or parsed.netloc: continue
            target = parsed.path
            if not target: target = path
            elif not target.startswith('/'): target = path + target
            target = unquote(target)
            if target.endswith('/'):
                assert target in pages, (path, value)
                if parsed.fragment: assert unquote(parsed.fragment) in pages[target].ids, (path,value)
            else: assert (root / target.lstrip('/')).is_file(), (path,value)
assert len(cards) == 1
xml = ET.parse(root / 'sitemap.xml'); ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
assert {n.text for n in xml.findall('s:url/s:loc',ns)} == {origin+p for p in paths}
assert all(re.fullmatch(r'\d{4}-\d{2}-\d{2}', n.text) for n in xml.findall('s:url/s:lastmod',ns))
robots=(root/'robots.txt').read_text()
assert 'User-agent: *\nAllow: /' in robots and 'Sitemap: '+origin+'/sitemap.xml' in robots
assert (root/'llm.txt').read_text() == (root/'llms.txt').read_text()
print('Verified built homepage: canonical URLs, metadata, PNG cards, schema, internal links, anchors and crawl files.')
