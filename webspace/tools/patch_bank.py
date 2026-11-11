"""Federation reconciliation: make Gringotts a native stand-alone entry and portal target.
This idempotent patch is preserved for archaeology, but source files are already patched.
"""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
js=R/'shared/legacy/webspace.js'
s=js.read_text()
old="const fallback={world:'fortress',node:'throne',yaw:0,pitch:0,history:[]};"
if old in s:
 s=s.replace(old,"const initialBank=document.documentElement.dataset.startWorld==='gringotts';\nconst fallback={world:initialBank?'gringotts':'fortress',node:initialBank?'arrival':'throne',yaw:0,pitch:0,history:[]};")
 js.write_text(s)
fb=R/'shared/legacy/webspace-fallback.js';s=fb.read_text()
old="const start=Object.prototype.hasOwnProperty.call(entries,tag||'')?entries[tag]:['fortress','throne',0];"
if old in s:
 s=s.replace(old,"const start=Object.prototype.hasOwnProperty.call(entries,tag||'')?entries[tag]:(document.documentElement.dataset.startWorld==='gringotts'?entries['gringotts-gerudo']:['fortress','throne',0]);")
 fb.write_text(s)
