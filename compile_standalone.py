# -*- coding: utf-8 -*-
"""
Compilador de dashboard_standalone.html con paridad absoluta 100%
Inyecta style.css en <style> y script.js en <script>, manteniendo CDN KaTeX, Tailwind y Chart.js.
Utiliza slicing directo para evitar corrupción de escapes regex (\n, \t, etc.).
"""
import re

def compile_standalone():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Reemplazo seguro de style.css mediante slicing directo (CERO corrupción)
    m_css = re.search(r'<link\s+rel=["\']stylesheet["\']\s+href=["\']\./style\.css(?:\?[^"\']*)?["\']\s*>', html)
    if m_css:
        html = html[:m_css.start()] + f'<style>\n{css}\n</style>' + html[m_css.end():]
    else:
        raise ValueError("No se encontró el link de style.css en index.html")

    # Reemplazo seguro de script.js mediante slicing directo (CERO corrupción)
    m_js = re.search(r'<script\s+src=["\']\./script\.js(?:\?[^"\']*)?["\']\s*></script>', html)
    if m_js:
        html = html[:m_js.start()] + f'<script>\n{js}\n</script>' + html[m_js.end():]
    else:
        raise ValueError("No se encontró el script de script.js en index.html")

    with open('dashboard_standalone.html', 'w', encoding='utf-8') as f:
        f.write(html)

    print('dashboard_standalone.html compilado exitosamente y de forma 100% segura. Longitud:', len(html))

if __name__ == '__main__':
    compile_standalone()
