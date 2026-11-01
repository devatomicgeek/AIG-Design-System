"""Apply an outlet settings export ZIP to the extracted v3.9 website.
Usage: python tools/apply_brand_update.py fuze-cafe-brand-update.zip
Run from the website root, or supply the full ZIP path.
"""
import sys,json,zipfile,pathlib,html
root=pathlib.Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:sys.exit('Usage: python tools/apply_brand_update.py path/to/outlet-brand-update.zip')
with zipfile.ZipFile(sys.argv[1]) as z:
 if 'data/brand.json' not in z.namelist():sys.exit('Invalid update ZIP')
 data=json.loads(z.read('data/brand.json'));slug=data.get('id','')
 if slug not in [p.name for p in (root/'outlets').iterdir() if p.is_dir()]:sys.exit('Unknown outlet')
 dest=root/'outlets'/slug
 for name in z.namelist():
  if name.endswith('/') or name=='README.txt':continue
  target=(dest/name).resolve()
  if not target.is_relative_to(dest.resolve()):sys.exit('Unsafe archive path')
  target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(name))
 # Update embedded JSON for offline file:// support.
 page=dest/'index.html';text=page.read_text()
 start='<script id="brand-data" type="application/json">';a=text.index(start)+len(start);b=text.index('</script>',a)
 encoded=json.dumps(data,ensure_ascii=False).replace('</','<\\/')
 page.write_text(text[:a]+encoded+text[b:])
 print('Applied brand update:',slug)
