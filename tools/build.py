#!/usr/bin/env python3
"""Builds the release zips into dist/:

- minwintidhelper-chrome-X.Y.Z.zip: for Chrome and Edge, files in a MinWinTidHelper/ folder
- minwintidhelper-firefox-X.Y.Z.zip: for Firefox and addons.mozilla.org, files at the top level
- dist/firefox/: the Firefox build unpacked, to load in about:debugging

manifest.json is written for Chrome. Firefox needs a few extra fields that Chrome warns about, so
they're added to the Firefox build only:
- background.scripts: Firefox runs background.js as a background script, not a service worker
- browser_specific_settings.gecko: a fixed add-on id (needed for storage.sync), the minimum
  Firefox version, and a statement that no data is collected

Usage: python3 tools/build.py
"""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
SKIP = {'.git', '.github', '.claude', '.idea', 'dist', 'tools', '.gitignore'}


def copy_extension(to):
    shutil.rmtree(to, ignore_errors=True)
    to.mkdir(parents=True)
    for item in ROOT.iterdir():
        if item.name in SKIP:
            continue
        if item.is_dir():
            shutil.copytree(item, to / item.name)
        else:
            shutil.copy2(item, to / item.name)


manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
version = manifest['version']
DIST.mkdir(exist_ok=True)

# Chrome and Edge: as is, inside a MinWinTidHelper/ folder.
staging = DIST / 'chrome-staging'
copy_extension(staging / 'MinWinTidHelper')
chrome_zip = shutil.make_archive(str(DIST / f'minwintidhelper-chrome-{version}'), 'zip', staging)
shutil.rmtree(staging)

# Firefox: with the extra manifest fields, files at the top level.
firefox = DIST / 'firefox'
copy_extension(firefox)
manifest['background'] = {'scripts': ['background.js']}
manifest['browser_specific_settings'] = {
    'gecko': {
        'id': 'minwintidhelper@ivaruf.github.io',
        'strict_min_version': '128.0',
        'data_collection_permissions': {'required': ['none']},
    }
}
(firefox / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
firefox_zip = shutil.make_archive(str(DIST / f'minwintidhelper-firefox-{version}'), 'zip', firefox)

print(f'Chrome/Edge: {chrome_zip}')
print(f'Firefox:     {firefox_zip} (unpacked in {firefox})')
