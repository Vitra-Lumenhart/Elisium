#!/usr/bin/env python3
"""Browse the Kilns Poly Haven bank and use the hash-checking batch importer.

  python3 assets/kilns/acquire_polyhaven.py --list
  python3 assets/kilns/acquire_polyhaven.py --download
  python3 assets/kilns/acquire_polyhaven.py --download --ids H07,H14

Official API /files provides .gltf + companion .bin + textures, NOT a single
standalone GLB. The current packager downloads and verifies every component
in one ZIP; running it does not modify or publish the game or source catalog.
"""
import argparse, json, pathlib, subprocess, sys
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[1]
p=argparse.ArgumentParser()
p.add_argument('--list',action='store_true')
p.add_argument('--download',action='store_true')
p.add_argument('--ids',default='')
args=p.parse_args()
objects=json.loads((HERE/'OBJECTS.json').read_text())['objects']
ids={v.strip().upper() for v in args.ids.split(',') if v.strip()}
for row in objects:
    if ids and row['id'] not in ids: continue
    print(f"{row['id']}: {row['name']} — {row['polyhaven_url']} (fit: {row['fit']})")
if args.download:
    cmd=[sys.executable,str(ROOT/'tools/package_polyhaven_batch.py')]
    if ids:
        cmd.extend(['--ids',','.join(sorted(ids)),'--output','dist/Kilns_PolyHaven_selected.zip'])
    raise SystemExit(subprocess.call(cmd,cwd=ROOT))
