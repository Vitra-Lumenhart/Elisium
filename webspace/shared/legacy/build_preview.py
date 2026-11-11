"""Create a timeless portable, single-HTML playtest with original CAD sidecar bytes."""
from pathlib import Path
ROOT=Path(__file__).resolve().parent
page=(ROOT/'index.html').read_text()
for name in ('webspace-channel.js','webspace-portal.js','webspace-screen.js','webspace-bank-desk.js','worlds-runtime.js','webspace-fallback.js'):
    tag=f'<script src="{name}"></script>'
    assert tag in page,name
    page=page.replace(tag,'<script>\n'+(ROOT/name).read_text()+'\n</script>')
sidecars=('garden_fountain_asset.js','courtyard_chandelier_asset.js','correspondents_chair_asset.js')
asset_scripts='\n'.join('<script>\n'+(ROOT/name).read_text()+'\n</script>' for name in sidecars)
assert '<script src="webspace.js"></script>' in page
page=page.replace('<script src="webspace.js"></script>',asset_scripts+'\n<script>\n'+(ROOT/'webspace.js').read_text()+'\n</script>')
assert '<script src=' not in page
path=ROOT.parent/'webspace_preview.html'
path.write_text(page)
print('Wrote',path,len(page),'bytes')
# Optional direct demonstration: same complete source; default landing is published bank entrance.
bank=page
old="const entryHint=Portal.parseArrival(location.search,{validEntries:Object.keys(PORTAL_ENTRIES)});"
assert bank.count(old)==1
bank=bank.replace(old,"const entryHint=Portal.parseArrival(location.search,{validEntries:Object.keys(PORTAL_ENTRIES)})||'gringotts-gerudo';")
old="?entries[tag]:['fortress','throne',0];"
assert bank.count(old)==1
bank=bank.replace(old,"?entries[tag]:['gringotts','arrival',0];")
path2=ROOT.parent/'webspace_bank_preview.html'
path2.write_text(bank)
print('Wrote',path2,len(bank),'bytes')
