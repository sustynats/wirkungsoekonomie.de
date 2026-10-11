"""Python adapter for the header produced by the shared JS renderer.

Templates are deterministic build caches from navigation.json, never a second
authored menu source. Load once per process, then vary only the relative base.
"""
from pathlib import Path
import subprocess
import re
from functools import lru_cache

ROOT=Path(__file__).resolve().parents[2]
@lru_cache(maxsize=2)
def _header(locale):
    return subprocess.check_output(['node',str(ROOT/'scripts/site/render-site-shell.mjs'),'--base={{BASE}}','--locale='+locale],cwd=ROOT,text=True)
def render_site_header(base='',locale='de'):
    return _header(locale).replace('{{BASE}}',base)

def render_site_header_for_source(source):
    """Reuse only the source shell's asset prefix and locale, never its menu."""
    asset=re.search(r'\bsrc=["\']([^"\']*)assets/img/brand/signet\.svg',source)
    if not asset:asset=re.search(r'\bhref=["\']([^"\']*)assets/css/style\.css',source)
    if not asset:raise ValueError('Source shell has no identifiable public asset prefix')
    locale='en' if re.search(r'<html\b[^>]*\blang=["\']en(?:-[^"\']*)?["\']',source) else 'de'
    return render_site_header(asset[1],locale)
