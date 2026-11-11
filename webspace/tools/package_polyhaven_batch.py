#!/usr/bin/env python3
"""Download and verify all current 1K Poly Haven donor models as ONE archive.

No Poly Haven account, API key, Blender or commercial license required.
The archive contains original .gltf geometry, companion .bin files and the
textures named by the Poly Haven API. Its mapping covers H01-H24 using 20
distinct upstream models. Does NOT claim fantasy-object integration.

Usage:
  python3 tools/package_polyhaven_batch.py
  python3 tools/package_polyhaven_batch.py --output dist/Kilns-CC0-snapshot.zip
"""
from __future__ import annotations
import argparse
import hashlib
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
UA = 'Webspace-Kilns-CC0-Archive/1.0 (+https://github.com/Vitra-Lumenhart/Webspace)'
ALLOWED_API = 'https://api.polyhaven.com/'
ALLOWED_FILES_HOST = 'dl.polyhaven.org'
assert ROOT.exists()

def get_bytes(url: str, *, binary: bool = False) -> bytes:
    parts = urllib.parse.urlsplit(url)
    if parts.scheme != 'https' or (parts.netloc != ALLOWED_FILES_HOST if binary else not url.startswith(ALLOWED_API)):
        raise RuntimeError('Refusing a download from a foreign host: ' + url)
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent':UA,'Accept':'application/json' if not binary else '*/*'})
            with urllib.request.urlopen(req, timeout=100) as response:
                return response.read()
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 * (attempt+1))
    raise AssertionError('unreachable')

def get_json(url: str):
    return json.loads(get_bytes(url))

def check_file(record, content, name):
    if not isinstance(record,dict) or not re.fullmatch(r'[0-9a-f]{32}',record.get('md5','')):
        raise ValueError('Missing MD5 for '+name)
    if record.get('size') is not None and len(content)!=int(record['size']):
        raise ValueError('Wrong file length for '+name)
    digest=hashlib.md5(content).hexdigest()
    if digest != record['md5']:
        raise ValueError('Hash mismatch for '+name)
    return {'path':name, 'bytes':len(content), 'md5':digest, 'sha256':hashlib.sha256(content).hexdigest()}

def relative(name):
    p=pathlib.PurePosixPath(name)
    if p.is_absolute() or '..' in p.parts or '\\' in name or name.startswith('.'):
        raise ValueError('Unsafe asset include path: '+name)
    return str(p)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',default='dist/Kilns_PolyHaven_1k_20sources_24objects.zip')
    parser.add_argument('--ids',default='',help='Optional comma-separated H-object subset; omit for the complete archive')
    args=parser.parse_args()
    output=ROOT/args.output
    output.parent.mkdir(parents=True,exist_ok=True)
    rows=json.loads((ROOT/'assets/kilns/OBJECTS.json').read_text())['objects']
    requested={x.strip().upper() for x in args.ids.split(',') if x.strip()}
    if requested:
        available={x['id'] for x in rows}
        if not requested<=available: raise ValueError('Unknown Kilns object IDs: '+str(requested-available))
        rows=[x for x in rows if x['id'] in requested]
    byslug={}
    for o in rows:
        slug=o['polyhaven_url'].split('/a/')[-1]
        if not re.fullmatch(r'[A-Za-z0-9_-]+',slug): raise ValueError(slug)
        byslug.setdefault(slug,[]).append(o['id'])
    manifest={
      'schema':'webspace/kilns-polyhaven-1k-snapshot/1',
      'license':'CC0 (Poly Haven originals; Webspace world scripts are separately licensed)',
      'source':'https://api.polyhaven.com',
      'purpose':'Archive one complete original 1K glTF donor set for each of the 24 Kilns instruments.',
      'note':'Physical component donors, not 24 finished fantasy objects or a furnished 3D interior.',
      'authors_and_provenance':{},
      'object_mapping':{o['id']:{'title':o['name'],'polyhaven_url':o['polyhaven_url'],'fit':o['fit']} for o in rows}
    }
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=3) as z:
        for i,(slug,object_ids) in enumerate(byslug.items(),start=1):
            info=get_json(ALLOWED_API+'info/'+slug)
            files=get_json(ALLOWED_API+'files/'+slug)
            rec=files.get('gltf',{}).get('1k',{}).get('gltf')
            if not rec or not rec.get('include'):raise ValueError('No 1K glTF for '+slug)
            includes=rec['include']
            zroot='sources/'+slug+'/'
            basename=relative(urllib.parse.urlsplit(rec['url']).path.split('/')[-1])
            original=get_bytes(rec['url'],binary=True)
            checked=[check_file(rec,original,zroot+basename)]
            gltf=json.loads(original.decode('utf-8'))
            uris=[x.get('uri') for k in ['buffers','images'] for x in gltf.get(k,[]) if x.get('uri') and not x['uri'].startswith('data:')]
            unknown=[p for p in uris if p not in includes]
            if unknown: raise ValueError(slug+' missing URI dependencies: '+str(unknown))
            z.writestr(zroot+basename,original)
            for path,file in sorted(includes.items()):
                pathname=relative(path)
                blob=get_bytes(file['url'],binary=True)
                checked.append(check_file(file,blob,zroot+pathname))
                z.writestr(zroot+pathname,blob)
            manifest['authors_and_provenance'][slug]={
                'source_url':'https://polyhaven.com/a/'+slug,
                'api_files_hash':info.get('files_hash'),
                'authors':info.get('authors',{}),
                'original_geometry':zroot+basename,
                'resolution':'1k',
                'assigned_objects':object_ids,
                'files':checked
            }
            print(f'[{i}/{len(byslug)}] {slug}: {len(checked)} verified components; mapped to {",".join(object_ids)}',flush=True)
        z.writestr('MANIFEST.json',json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
        z.writestr('README.txt','Webspace Kilns: 24 object roles, 20 unique CC0 Poly Haven original 1K glTF component sets.\n'
                   'These are original human-made Poly Haven artist models, unmodified apart from packaging.\n'
                   'See MANIFEST.json for every source URL, MD5, SHA256 and author.\n'
                   'They are not finished Kilns fantasy objects or authored interactions.\n'
                   'Use the interactive Kilns webspace to view current artist files live; this archive is a fixed snapshot.\n')
    print('ARCHIVE_CREATED',str(output),'BYTES',output.stat().st_size,'MODELS',len(byslug),'MAPPINGS',len(rows),flush=True)

if __name__=='__main__':main()
