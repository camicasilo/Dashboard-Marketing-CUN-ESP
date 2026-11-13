# -*- coding: utf-8 -*-
"""
Compilador de dashboard_standalone.html con paridad absoluta 100%
Inyecta style.css en <style> y script.js en <script>, manteniendo CDN KaTeX, Tailwind y Chart.js.
"""

def compile_standalone():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Reemplazo de style.css
    css_target = '<link rel="stylesheet" href="./style.css">'
    assert css_target in html, 'CSS target not found in index.html'
    inlined_css = f'<style>\n{css}\n</style>'
    html = html.replace(css_target, inlined_css, 1)

    # Reemplazo de script.js
    js_target = '<script src="./script.js"></script>'
    assert js_target in html, 'JS target not found in index.html'
    inlined_js = f'<script>\n{js}\n</script>'
    html = html.replace(js_target, inlined_js, 1)

    with open('dashboard_standalone.html', 'w', encoding='utf-8') as f:
        f.write(html)

    print('dashboard_standalone.html compiled successfully! Length:', len(html))

if __name__ == '__main__':
    compile_standalone()
