#!/usr/bin/env python3
"""Bumps the version in manifest.json (and the copy on line 2 of content.js).

Usage: python3 tools/bump-version.py patch|minor|major
Prints "version=X.Y.Z", which the release workflow reads as a step output.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'manifest.json'
CONTENT = ROOT / 'content.js'

part = sys.argv[1] if len(sys.argv) > 1 else ''
if part not in ('patch', 'minor', 'major'):
    sys.exit(__doc__)

manifest = MANIFEST.read_text(encoding='utf-8')
match = re.search(r'"version":\s*"(\d+)\.(\d+)\.(\d+)"', manifest)
if not match:
    sys.exit('Fant ikke "version": "X.Y.Z" i manifest.json')
major, minor, patch = map(int, match.groups())

if part == 'major':
    major, minor, patch = major + 1, 0, 0
elif part == 'minor':
    minor, patch = minor + 1, 0
else:
    patch += 1
version = f'{major}.{minor}.{patch}'

# Replace only the version text, so the rest of the file keeps its formatting.
MANIFEST.write_text(manifest[: match.start()] + f'"version": "{version}"' + manifest[match.end():], encoding='utf-8')

content = CONTENT.read_text(encoding='utf-8')
content, count = re.subn(r'^let version = "[^"]*";', f'let version = "{version}";', content, count=1, flags=re.M)
if count != 1:
    sys.exit('Fant ikke `let version = "...";` i content.js')
CONTENT.write_text(content, encoding='utf-8')

print(f'version={version}')
