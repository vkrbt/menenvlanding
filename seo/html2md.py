#!/usr/bin/env python3
"""Извлекает статью из blog/<slug>.html в Markdown-черновик drafts/writing/<slug>.md.
Сохраняет метаданные во фронтматтере для последующей обратной сборки HTML.
Использование: python3 seo/html2md.py blog/<slug>.html [out_dir]
"""
import re, sys, os, html as htmllib

def inline(s):
    s = re.sub(r'<a\s+href="([^"]+)"[^>]*>(.*?)</a>', lambda m: f'[{re.sub(r"<[^>]+>","",m.group(2))}]({m.group(1)})', s, flags=re.S)
    s = re.sub(r'<(strong|b)>(.*?)</\1>', r'**\2**', s, flags=re.S)
    s = re.sub(r'<(em|i)>(.*?)</\1>', r'_\2_', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    s = htmllib.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()

def get(rx, s, d=''):
    m = re.search(rx, s, re.S); return m.group(1).strip() if m else d

def main():
    path = sys.argv[1]
    out_dir = sys.argv[2] if len(sys.argv) > 2 else 'drafts/writing'
    os.makedirs(out_dir, exist_ok=True)
    h = open(path, encoding='utf-8').read()
    slug = os.path.splitext(os.path.basename(path))[0]

    title = inline(get(r'<title>(.*?)</title>', h))
    desc = get(r'<meta name="description" content="([^"]*)"', h)
    canon = get(r'<link rel="canonical" href="([^"]*)"', h)
    ogtitle = get(r'<meta property="og:title" content="([^"]*)"', h)
    published = get(r'"datePublished":\s*"([^"]+)"', h)
    modified = get(r'"dateModified":\s*"([^"]+)"', h)
    tag = inline(get(r'class="article__meta">\s*<span>(.*?)</span>', h))
    metas = re.findall(r'<span>(.*?)</span>', get(r'<div class="article__meta">(.*?)</div>', h))
    author_line = inline(metas[0]) if metas else ''
    date_line = inline(metas[1]) if len(metas) > 1 else ''
    read_line = inline(metas[2]) if len(metas) > 2 else ''

    main_html = get(r'<main class="article">(.*?)</main>', h)
    # тело: от article__meta close до article__cta / faq / note
    body = main_html
    # Удаляем хлебные крошки, h1, meta-блок
    body = re.sub(r'<nav class="article__breadcrumbs".*?</nav>', '', body, flags=re.S)
    body = re.sub(r'<h1 class="article__title">.*?</h1>', '', body, flags=re.S)
    body = re.sub(r'<div class="article__meta">.*?</div>', '', body, flags=re.S)

    out = []
    # Итерируем блоки верхнего уровня
    # Разбиваем на CTA/FAQ/NOTE/RELATED секции
    cta = get(r'<div class="article__cta">(.*?)</div>', body)
    faq_block = get(r'<div class="article__faq">(.*?)</div>\s*</div>', body) or get(r'<div class="article__faq">(.*)', body)
    note = get(r'<div class="article__note">(.*?)</div>', body)
    related = get(r'<div class="article__related">(.*?)</div>', body)

    # Прозаическая часть = до первого спец-блока
    cut = len(body)
    for marker in ['<div class="article__cta">', '<h2 id="faq"', '<div class="article__note">', '<div class="article__related">']:
        i = body.find(marker)
        if i != -1: cut = min(cut, i)
    prose = body[:cut]

    # Конвертируем h2/h3/p/ul/ol в прозе
    def conv_block(seg):
        res = []
        for m in re.finditer(r'<(h2|h3|p|ul|ol)([^>]*)>(.*?)</\1>', seg, re.S):
            tag_, attr, inner = m.group(1), m.group(2), m.group(3)
            if tag_ == 'h2':
                res.append('## ' + inline(inner))
            elif tag_ == 'h3':
                res.append('### ' + inline(inner))
            elif tag_ == 'p':
                res.append(inline(inner))
            elif tag_ in ('ul', 'ol'):
                items = re.findall(r'<li>(.*?)</li>', inner, re.S)
                for k, it in enumerate(items, 1):
                    pref = '- ' if tag_ == 'ul' else f'{k}. '
                    res.append(pref + inline(it))
        return res

    out += conv_block(prose)

    if cta:
        out.append('\n<!-- CTA -->')
        ch = inline(get(r'<h3>(.*?)</h3>', cta))
        cp = inline(get(r'<h3>.*?</h3>\s*<p>(.*?)</p>', cta))
        chint = inline(get(r'class="article__cta-hint">(.*?)</p>', cta))
        if ch: out.append('**' + ch + '**')
        if cp: out.append(cp)
        if chint: out.append('_' + chint + '_')

    if faq_block:
        out.append('\n## Частые вопросы')
        pairs = re.findall(r'<h3>(.*?)</h3>\s*<p>(.*?)</p>', faq_block, re.S)
        for q, a in pairs:
            out.append('### ' + inline(q))
            out.append(inline(a))

    if note:
        out.append('\n<!-- NOTE -->')
        for p in re.findall(r'<p>(.*?)</p>', note, re.S):
            out.append('> ' + inline(p))

    if related:
        out.append('\n## Читать дальше')
        for a in re.findall(r'<li><a href="([^"]+)">(.*?)</a></li>', related, re.S):
            out.append(f'- [{inline(a[1])}]({a[0]})')

    fm = [
        '---',
        f'slug: {slug}',
        f'title: {title}',
        f'og_title: {ogtitle}',
        f'description: {desc}',
        f'canonical: {canon}',
        f'tag: {tag}',
        f'author_line: {author_line}',
        f'date_line: {date_line}',
        f'read_line: {read_line}',
        f'date_published: {published}',
        f'date_modified: {modified}',
        'status: extracted',
        '---',
        '',
    ]
    md = '\n'.join(fm) + '\n\n'.join(out) + '\n'
    md = re.sub(r'\n{3,}', '\n\n', md)
    open(os.path.join(out_dir, slug + '.md'), 'w', encoding='utf-8').write(md)
    print(f'{slug}.md')

if __name__ == '__main__':
    main()
