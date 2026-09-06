from pypdf import PdfReader,PdfWriter
from pypdf.generic import ContentStream,ByteStringObject,TextStringObject,NameObject,DictionaryObject,ArrayObject
from pypdf._cmap import get_encoding
from pathlib import Path
import re
DASHES=set(chr(x) for x in range(0x2010,0x2016))|{'−'}
def font_map(font):
 enc,mapping=get_encoding(font);width=2 if enc in ('utf-16-be','utf-16-le') else 1
 values={}
 if isinstance(enc,dict):
  for k,v in enc.items():
   if isinstance(k,int) and 0<=k<=255:values[bytes([k])]=mapping.get(v,v)
 elif width==2:
  for k,v in mapping.items():
   if isinstance(k,str):
    try:values[k.encode(enc)]=v
    except UnicodeError:pass
 else:
  for i in range(256):values[bytes([i])]=mapping.get(chr(i),chr(i))
 hyphen=next((k for k,v in values.items() if v=='-'),None)
 return width,{k:hyphen for k,v in values.items() if v in DASHES},values
def replace_pdf(source,target):
 r=PdfReader(source);w=PdfWriter();w.clone_document_from_reader(r)
 cache={};seen=set();count=0;fallbacks=0
 def process(stream,res):
  nonlocal count,fallbacks
  fonts=res.get('/Font',DictionaryObject()).get_object();maps={}
  if '/Font' not in res:res[NameObject('/Font')]=fonts
  for name,ref in fonts.items():
   fd=ref.get_object();key=str(ref)
   if key not in cache:cache[key]=font_map(fd)
   maps[str(name)]=cache[key]
  special=NameObject('/NWShortHyphen')
  def ensure_hyphen():
   if special not in fonts:fonts[special]=w._add_object(DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')}))
  active=None;size=None;state=[];out=[];changed=False
  def textops(value):
   nonlocal count,fallbacks,changed
   if active not in maps or not isinstance(value,(ByteStringObject,TextStringObject)):return [([value],b'Tj')]
   width,repl,values=maps[active];raw=value.original_bytes if isinstance(value,TextStringObject) else bytes(value)
   chunks=[];buffer=bytearray()
   for i in range(0,len(raw),width):
    code=raw[i:i+width]
    if code in repl:
     changed=True;count+=1
     if repl[code] is not None:buffer.extend(repl[code])
     else:
      if buffer:chunks.append(([ByteStringObject(bytes(buffer))],b'Tj'));buffer.clear()
      ensure_hyphen();chunks.extend([([special,size],b'Tf'),([ByteStringObject(b'-')],b'Tj'),([NameObject(active),size],b'Tf')]);fallbacks+=1
    else:buffer.extend(code)
   if buffer:chunks.append(([ByteStringObject(bytes(buffer))],b'Tj'))
   return chunks
  for args,op in stream.operations:
   if op==b'BDC' and len(args)>1 and isinstance(args[1],DictionaryObject):
    actual=args[1].get('/ActualText')
    if isinstance(actual,str) and any(c in DASHES for c in actual):
     args[1][NameObject('/ActualText')]=TextStringObject(''.join('-' if c in DASHES else c for c in actual));changed=True
   if op==b'Tf':active=str(args[0]);size=args[1]
   if op==b'q':state.append((active,size))
   if op==b'Q' and state:active,size=state.pop()
   if op in (b'Tj',b"'",b'"'):
    if op==b"'":out.append(([],b'T*'))
    if op==b'"':out.extend([([args[0]],b'Tw'),([args[1]],b'Tc'),([],b'T*')])
    out.extend(textops(args[-1]));continue
   if op==b'TJ':
    for value in args[0]:
     if isinstance(value,(ByteStringObject,TextStringObject)):out.extend(textops(value))
     else:out.append(([ArrayObject([value])],b'TJ'))
    continue
   if op==b'Do':
    obj=res.get('/XObject',{}).get(args[0]);obj=obj.get_object() if obj else None
    if obj and obj.get('/Subtype')=='/Form' and id(obj) not in seen:
     seen.add(id(obj));sub=ContentStream(obj,w)
     if process(sub,obj.get('/Resources',res).get_object()):
      # Encoded streams must be replaced with a decoded stream before writing.
      from pypdf.generic import DecodedStreamObject
      replacement=DecodedStreamObject();replacement.set_data(sub.get_data())
      for k,v in obj.items():
       if k not in ('/Length','/Filter','/DecodeParms'):replacement[k]=v
      res['/XObject'][args[0]]=w._add_object(replacement.flate_encode())
   out.append((args,op))
  if changed:stream.operations=out
  return changed
 for page in w.pages:
  cs=page.get_contents()
  if cs is not None and process(cs,page['/Resources'].get_object()):
   page.replace_contents(cs);page.compress_content_streams()
 info={k:str(v) for k,v in (r.metadata or {}).items() if isinstance(v,str)}
 for k,v in info.items():info[k]=''.join('-' if c in DASHES else c for c in v)
 info.update({'/Author':'Natalie Weber','/Creator':'Natalie Weber','/Producer':'Natalie Weber'})
 w.add_metadata(info)
 if '/Metadata' in w._root_object:del w._root_object['/Metadata']
 target=Path(target);target.parent.mkdir(parents=True,exist_ok=True)
 with target.open('wb') as f:w.write(f)
 return {'dashes':count,'fontFallbacks':fallbacks,'pages':len(w.pages)}
if __name__=='__main__':
 import sys
 print(replace_pdf(sys.argv[1],sys.argv[2]))
