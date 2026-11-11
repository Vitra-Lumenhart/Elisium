#!/usr/bin/env python3
"""Extract the exact embedded Garden JavaScript from the single-file beta.
Standard-library only. Does not alter the input or contact the network.

Usage:
  python3 tools/extract_chuzhoy_runtime.py [input.html] [output.js]
"""
import base64
import gzip
import pathlib
import re
import sys

src = pathlib.Path(sys.argv[1] if len(sys.argv)>1 else "worlds/chuzhoy/garden_native.html")
out = pathlib.Path(sys.argv[2] if len(sys.argv)>2 else "worlds/chuzhoy/src/integrated-runtime.js")
html = src.read_text(encoding="utf-8")
start = html.index("const b64=")
end = html.index("async function boot", start)
encoded = "".join(re.findall(r"'([A-Za-z0-9+/=]+)'", html[start:end]))
if not encoded:
    raise RuntimeError("The Garden gzip payload was not found")
runtime = gzip.decompress(base64.b64decode(encoded))
if b"requestAnimationFrame(frame)" not in runtime:
    raise RuntimeError("The embedded Garden runtime is incomplete")
out.parent.mkdir(parents=True,exist_ok=True)
out.write_bytes(runtime)
print(f"Recovered {len(runtime)} source bytes into {out}")
