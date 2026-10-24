#!/usr/bin/env python3
"""Builds the Firefox version of MinWinTidHelper into dist/firefox (and a zip for addons.mozilla.org).

manifest.json is written for Chrome. Firefox needs a few extra fields that Chrome warns about, so
they're added here instead:
- background.scripts: Firefox runs background.js as a background script, not a service worker
- browser_specific_settings.gecko: a fixed add-on id (needed for storage.sync), the minimum
  Firefox version, and a statement that no data is collected

Usage: python3 tools/build-firefox.py
"""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
OUT = DIST / 'firefox'
SKIP = {'.git', '.idea', 'dist', 'tools', '.gitignore'}

shutil.rmtree(OUT, ignore_errors=True)
OUT.mkdir(parents=True)
for item in ROOT.iterdir():
    if item.name in SKIP:
        continue
    if item.is_dir():
        shutil.copytree(item, OUT / item.name)
    else:
        shutil.copy2(item, OUT / item.name)

manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
manifest['background'] = {'scripts': ['background.js']}
manifest['browser_specific_settings'] = {
    'gecko': {
        'id': 'minwintidhelper@ivaruf.github.io',
        'strict_min_version': '128.0',
        'data_collection_permissions': {'required': ['none']},
    }
}
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

zip_base = DIST / f"minwintidhelper-firefox-{manifest['version']}"
zip_path = shutil.make_archive(str(zip_base), 'zip', OUT)
print(f'Firefox build: {OUT}')
print(f'For addons.mozilla.org: {zip_path}')
