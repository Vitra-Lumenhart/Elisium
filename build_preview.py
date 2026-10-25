#!/usr/bin/env python3
"""Assemble a real offline, single-file preview; project files remain modular."""
from pathlib import Path
import base64
root=Path(__file__).parent
html=(root/'index.html').read_text()
css=(root/'style.css').read_text()
js=(root/'engine.js').read_text()
for character in ('aslan','tash'):
    png=root/'assets'/f'{character}_triptych.png'
    uri='data:image/png;base64,'+base64.b64encode(png.read_bytes()).decode('ascii')
    js=js.replace('assets/'+character+'_triptych.png',uri)
assert "src:'data:image/png;base64," in js
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="engine.js"></script>','<script>'+js+'</script>')
target=root/'elisium_webspace_preview.html'
target.write_text(html)
print(target,round(target.stat().st_size/1024),'KiB')
