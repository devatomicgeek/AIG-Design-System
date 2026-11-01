(()=>{'use strict';
const $=id=>document.getElementById(id), clone=o=>JSON.parse(JSON.stringify(o)), escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=document.body.dataset.brand, base=JSON.parse($('brand-data').textContent), key='design-system-v39-'+slug;
let state;try{state=JSON.parse(localStorage.getItem(key))||clone(base)}catch{state=clone(base)}
let tab='logos',objectUrls=[],fontFaces=[];
const pending=new Map();const uid=()=>('item-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7));
function toast(s){let t=$('toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function persist(){try{localStorage.setItem(key,JSON.stringify(state));$('saveStatus').textContent='Changes saved locally · Export ZIP to publish'}catch{$('saveStatus').textContent='Browser storage full · Export ZIP to preserve changes';toast('Browser storage full; export your changes.')}render()}
function pathFor(f){return f?.data|| (f?.path?'./'+f.path:'')}
function fileName(f){return f.name||'asset'}
function previewFile(files){return (files||[]).find(f=>['PNG','SVG','JPG','JPEG','WEBP','GIF'].includes(f.format))}
function imgFor(files){let f=previewFile(files);return f?`<img src="${escape(pathFor(f))}" alt="" loading="lazy">`:'<span class="help">No image preview</span>'}
function downloadFile(f){let a=document.createElement('a');a.href=pathFor(f);a.download=fileName(f);document.body.append(a);a.click();a.remove()}
function filesMarkup(files){return (files||[]).map(f=>`<a class="file-link" href="${escape(pathFor(f))}" download="${escape(fileName(f))}">↓ ${escape(f.format)}</a>`).join('')}
function variation(id){return state.variations.find(x=>x.id===id)||state.variations[0]}
function opts(selected){return state.variations.map(v=>`<option value="${escape(v.id)}" ${selected===v.id?'selected':''}>${escape(v.name)}</option>`).join('')}
const errors=[['stretch','Stretch'],['rotate','Rotate'],['squash','Distort'],['low','Poor contrast'],['shadow','Add effects'],['tint','Change colors']];
function render(){
 $('logoGrid').innerHTML=state.variations.length?state.variations.map(v=>`<article class="logo-card"><div class="logo-art">${imgFor(v.files)}</div><div class="logo-card-info"><h3>${escape(v.name)}</h3><div class="download-row">${filesMarkup(v.files)}</div></div></article>`).join(''):'<div class="empty">No logos uploaded. Open Settings to add a variation.</div>';
 let v=variation(state.safe.variation),safe=state.safe;
 $('safeNote').textContent=safe.note||'Clear-space demonstration. Configure the approved measurement in Settings.';
 $('safePreview').innerHTML=v?`<div class="safe-boundary" style="padding:${Number(safe.top)||0}% ${Number(safe.right)||0}% ${Number(safe.bottom)||0}% ${Number(safe.left)||0}%">${imgFor(v.files)}</div>`:'<span class="help">Add a logo variation to show safe space.</span>';
 $('incorrectGrid').innerHTML=errors.map(([style,label])=>{let vv=variation(state.incorrect.perExample?.[style]||state.incorrect.variation);return `<div class="wrong-tile ${style}">${vv?imgFor(vv.files):''}<small>✕ ${label}</small></div>`}).join('');
 $('guidelineNote').textContent=state.guidelineNote||'';
 $('colorGrid').innerHTML=state.colors.length?state.colors.map((c,i)=>`<div class="color-card" data-color="${i}" role="button" tabindex="0"><div class="swatch" style="background:${/^#[0-9a-f]{6}$/i.test(c.hex)?c.hex:'#ddd'}"></div><strong>${escape(c.name)}</strong><small>${escape(c.hex)}</small></div>`).join(''):'<div class="empty">No brand colors added.</div>';
 $('fontGrid').innerHTML=state.fonts.length?state.fonts.map((f,i)=>`<article class="font-card"><small>${escape(f.role)} · ${escape(f.usage||'')}</small><h3>${escape(f.name)}</h3><div class="font-sample" data-font="${i}">Aa Bb Cc Dd</div><div class="font-alphabet" data-font="${i}">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz · 0123456789</div><div class="download-row">${filesMarkup(f.files)}</div>${f.files?.length?'':'<p class="help">Font files not supplied. Upload files in Settings for an accurate preview.</p>'}</article>`).join(''):'<div class="empty">No fonts added.</div>';
 $('iconCount').textContent=state.icons.length+' icons';$('downloadAllIcons').disabled=!state.icons.length;
 $('iconGrid').innerHTML=state.icons.length?state.icons.map((ic,i)=>`<div class="icon-card">${imgFor(ic.files)}<div class="download-row">${filesMarkup(ic.files)}</div></div>`).join(''):'<div class="empty">No icon assets uploaded.</div>';
 loadFonts();
}
function loadFonts(){fontFaces.forEach(f=>{try{document.fonts.delete(f)}catch{}});fontFaces=[];state.fonts.forEach((font,i)=>{let f=(font.files||[]).find(x=>/\.(woff2?|ttf|otf)$/i.test(x.name));if(!f)return;try{let face=new FontFace('BrandPreview'+i,`url("${pathFor(f)}")`);face.load().then(loaded=>{document.fonts.add(loaded);fontFaces.push(loaded);document.querySelectorAll(`[data-font="${i}"]`).forEach(el=>el.style.fontFamily='BrandPreview'+i)}).catch(()=>{})}catch{}})}
$('colorGrid').addEventListener('click',e=>{let el=e.target.closest('[data-color]');if(el){let hex=state.colors[Number(el.dataset.color)].hex;navigator.clipboard?.writeText(hex).then(()=>toast('Copied '+hex)).catch(()=>toast(hex))}});
$('colorGrid').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('[data-color]'))e.target.click()});
const tabs=[['logos','Logos'],['safe','Safe Area'],['incorrect','Incorrect Usage'],['colors','Colors'],['fonts','Typography'],['icons','Iconography']];
function open(){renderSettings();$('settingsDialog').showModal()}
$('openSettings').onclick=open;$('closeSettings').onclick=()=>$('settingsDialog').close();$('settingsDialog').addEventListener('click',e=>{if(e.target===$('settingsDialog'))$('settingsDialog').close()});
function field(text,val,attr){return `<label>${escape(text)} <input type="text" ${attr} value="${escape(val)}"></label>`}
function fileChips(files,type,id){return `<div>${(files||[]).map((f,i)=>`<span class="file-chip">${escape(f.format)} <span title="${escape(f.name)}">${escape(f.name.length>22?f.name.slice(0,19)+'…':f.name)}</span><button data-action="remove-file" data-type="${type}" data-id="${escape(id)}" data-index="${i}" aria-label="Remove file">✕</button></span>`).join('')}</div>`}
function uploadLabel(type,id,accept,multiple=true){return `<label class="upload">+ Upload files<input type="file" data-upload="${type}" data-id="${escape(id)}" accept="${accept}" ${multiple?'multiple':''}></label>`}
function moveButtons(type,id,i,len){return `<button class="mini-button" data-action="move" data-type="${type}" data-id="${escape(id)}" data-dir="-1" ${i===0?'disabled':''}>↑</button><button class="mini-button" data-action="move" data-type="${type}" data-id="${escape(id)}" data-dir="1" ${i===len-1?'disabled':''}>↓</button>`}
function renderSettings(){
 $('settingsTabs').innerHTML=tabs.map(([id,name])=>`<button type="button" class="${tab===id?'active':''}" data-tab="${id}">${name}</button>`).join('');
 let body='';
 if(tab==='logos')body=`<p class="help">Create a named variation, then add any combination of PNG, JPG, SVG, PDF or AI files. The first available image is used as its preview.</p>${state.variations.map((v,i)=>`<div class="editor-card"><div class="editor-row">${moveButtons('variations',v.id,i,state.variations.length)}<input type="text" aria-label="Variation name" data-edit="variation-name" data-id="${v.id}" value="${escape(v.name)}"><button class="mini-button danger" data-action="delete" data-type="variations" data-id="${v.id}">Delete variation</button></div><div class="preview">${imgFor(v.files)}</div>${fileChips(v.files,'variations',v.id)}${uploadLabel('variations',v.id,'.png,.jpg,.jpeg,.svg,.pdf,.ai,.webp')}</div>`).join('')}<div class="editor-card"><h4>New logo variation</h4><div class="editor-row"><input id="newVariation" type="text" placeholder="e.g. Horizontal Logo"><button class="button" data-action="add-variation">+ Create variation</button></div></div>`;
 if(tab==='safe')body=`<div class="editor-card"><h4>Logo clear-space settings</h4><p class="help">Select a logo and set top, right, bottom and left clear-space values as percentages of the displayed logo dimensions. These are editable visual guides, not automatic official measurements.</p><div class="editor-row"><label>Logo variation</label><select data-edit="safe-variation">${opts(state.safe.variation)}</select></div>${['top','right','bottom','left'].map(k=>`<div class="editor-row"><label style="min-width:70px">${k[0].toUpperCase()+k.slice(1)} %</label><input type="number" min="0" max="100" step="1" data-edit="safe-${k}" value="${Number(state.safe[k])||0}"></div>`).join('')}<label>Guideline note</label><textarea data-edit="safe-note">${escape(state.safe.note)}</textarea></div><div class="editor-card"><h4>Official guideline reference</h4><textarea data-edit="guideline-note">${escape(state.guidelineNote||'')}</textarea><p class="help">Use this to record the approved rule. For precise measurements based on logo artwork, consult the official guideline document.</p></div>`;
 if(tab==='incorrect')body=`<div class="editor-card"><h4>Incorrect usage logo selection</h4><p class="help">Choose one default variation for all six examples, or override individual examples.</p><div class="editor-row"><label>Default logo</label><select data-edit="incorrect-default"><option value="">None</option>${opts(state.incorrect.variation)}</select></div>${errors.map(([id,label])=>`<div class="editor-row"><label style="min-width:115px">${label}</label><select data-edit="incorrect-example" data-id="${id}"><option value="">Use default</option>${opts(state.incorrect.perExample?.[id])}</select></div>`).join('')}</div>`;
 if(tab==='colors')body=`<p class="help">Add, name, edit, reorder or remove brand colors. HEX values must be six-digit codes.</p>${state.colors.map((c,i)=>`<div class="editor-card"><div class="editor-row">${moveButtons('colors',String(i),i,state.colors.length)}<input type="color" data-edit="color-picker" data-index="${i}" value="${/^#[0-9a-f]{6}$/i.test(c.hex)?c.hex:'#888888'}"><input type="text" aria-label="Color name" data-edit="color-name" data-index="${i}" value="${escape(c.name)}"><input type="text" aria-label="HEX value" data-edit="color-hex" data-index="${i}" value="${escape(c.hex)}"><button class="mini-button danger" data-action="delete" data-type="colors" data-id="${i}">✕</button></div></div>`).join('')}<button class="button" data-action="add-color">+ Add color</button>`;
 if(tab==='fonts')body=`<p class="help">Upload individual font files or ZIP archives. Font files are extracted in your browser and loaded for live specimens. Reorder families and set Primary, Secondary, Tertiary or Supporting hierarchy.</p>${state.fonts.map((f,i)=>`<div class="editor-card"><div class="editor-row">${moveButtons('fonts',f.id,i,state.fonts.length)}<input type="text" data-edit="font-name" data-id="${f.id}" value="${escape(f.name)}" aria-label="Font family"><select data-edit="font-role" data-id="${f.id}">${['Primary','Secondary','Tertiary','Supporting'].map(r=>`<option ${r===f.role?'selected':''}>${r}</option>`).join('')}</select><button class="mini-button danger" data-action="delete" data-type="fonts" data-id="${f.id}">Delete</button></div><div class="editor-row"><label>Usage</label><input type="text" data-edit="font-usage" data-id="${f.id}" value="${escape(f.usage||'')}" placeholder="Headings, Body, Accent"></div><div class="preview" style="font-size:24px" data-settings-font="${i}">Aa Bb Cc Dd · The quick brown fox</div>${fileChips(f.files,'fonts',f.id)}${uploadLabel('fonts',f.id,'.ttf,.otf,.woff,.woff2,.zip')}</div>`).join('')}<button class="button" data-action="add-font">+ Add font family</button>`;
 if(tab==='icons')body=`<p class="help">Upload one or multiple icons, rearrange them with arrows, replace or delete them. Icon names are never displayed on the public page.</p><div class="editor-card">${uploadLabel('new-icons','new','.png,.jpg,.jpeg,.svg,.webp,.pdf,.ai')}</div><div class="icon-grid">${state.icons.map((ic,i)=>`<div class="editor-card" style="margin:0;min-width:0"><div class="preview">${imgFor(ic.files)}</div><div class="editor-row">${moveButtons('icons',ic.id,i,state.icons.length)}<button class="mini-button danger" data-action="delete" data-type="icons" data-id="${ic.id}">✕</button></div>${fileChips(ic.files,'icons',ic.id)}${uploadLabel('icons',ic.id,'.png,.jpg,.jpeg,.svg,.webp,.pdf,.ai')}</div>`).join('')}</div>`;
 $('settingsBody').innerHTML=body;loadSettingsFonts();
}
function loadSettingsFonts(){state.fonts.forEach((f,i)=>{let el=document.querySelector(`[data-settings-font="${i}"]`);if(!el)return;let face=fontFaces.find(x=>x.family==='BrandPreview'+i);if(face)el.style.fontFamily='BrandPreview'+i;else {let f2=(f.files||[]).find(x=>/\.(ttf|otf|woff2?)$/i.test(x.name));if(f2){let ff=new FontFace('SettingsPreview'+i,`url("${pathFor(f2)}")`);ff.load().then(x=>{document.fonts.add(x);el.style.fontFamily='SettingsPreview'+i}).catch(()=>{})}}})}
$('settingsTabs').addEventListener('click',e=>{let b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;renderSettings()}});
function collection(type){return state[type]}
function findItem(type,id){return collection(type).find(x=>x.id===id)}
$('settingsBody').addEventListener('click',e=>{let b=e.target.closest('[data-action]');if(!b)return;let a=b.dataset.action,type=b.dataset.type,id=b.dataset.id;
 if(a==='add-variation'){let name=$('newVariation').value.trim();if(!name){toast('Enter a variation name');return}state.variations.push({id:uid(),name,files:[]})}
 if(a==='add-color')state.colors.push({name:'New Color',hex:'#888888'});
 if(a==='add-font')state.fonts.push({id:uid(),name:'New Font Family',role:'Supporting',usage:'',files:[]});
 if(a==='delete'){if(!confirm('Remove this item and its files from this outlet?'))return;if(type==='colors')state.colors.splice(Number(id),1);else state[type]=state[type].filter(x=>x.id!==id)}
 if(a==='move'){let arr=collection(type),i=type==='colors'?Number(id):arr.findIndex(x=>x.id===id),j=i+Number(b.dataset.dir);if(j>=0&&j<arr.length)[arr[i],arr[j]]=[arr[j],arr[i]]}
 if(a==='remove-file'){let item=findItem(type,id);if(!item)return;let f=item.files[Number(b.dataset.index)];if(!confirm('Remove '+f.name+'?'))return;item.files.splice(Number(b.dataset.index),1)}
 persist();renderSettings();
});
$('settingsBody').addEventListener('change',e=>{let el=e.target,what=el.dataset.edit,id=el.dataset.id,i=Number(el.dataset.index),v=el.value;
 if(what==='variation-name'){let item=findItem('variations',id);if(item)item.name=v}
 if(what==='safe-variation')state.safe.variation=v;
 if(what?.startsWith('safe-')&&what!=='safe-variation'&&what!=='safe-note')state.safe[what.slice(5)]=Math.max(0,Math.min(100,Number(v)||0));
 if(what==='safe-note')state.safe.note=v;
 if(what==='guideline-note')state.guidelineNote=v;
 if(what==='incorrect-default')state.incorrect.variation=v;
 if(what==='incorrect-example')state.incorrect.perExample[id]=v;
 if(what==='color-name')state.colors[i].name=v;
 if(what==='color-picker')state.colors[i].hex=v.toUpperCase();
 if(what==='color-hex'){if(!/^#[0-9a-f]{6}$/i.test(v)){toast('Enter a valid HEX value like #B87567');return}state.colors[i].hex=v.toUpperCase()}
 if(what?.startsWith('font-')){let f=findItem('fonts',id);if(f)f[what.slice(5)]=v}
 persist();renderSettings();
});
async function addFiles(type,id,files){if(!files.length)return;
 let entries=[];
 for(let file of files){if(file.name.toLowerCase().endsWith('.zip')&&type==='fonts'){
  try{let z=await JSZip.loadAsync(file);for(let [name,item] of Object.entries(z.files)){if(item.dir||!(/\.(ttf|otf|woff2?)$/i.test(name)))continue;let blob=await item.async('blob');entries.push(new File([blob],name.split('/').pop(),{type:'application/octet-stream'}))}}catch{toast('Could not read font ZIP')}continue}
 entries.push(file)}
 for(let f of entries){let ext=f.name.split('.').pop().toUpperCase();if(!['PNG','JPG','JPEG','SVG','WEBP','PDF','AI','TTF','OTF','WOFF','WOFF2'].includes(ext))continue;
 let target;if(type==='new-icons'){target={id:uid(),files:[]};state.icons.push(target)}else target=findItem(type,id);if(!target)continue;
 let reader=new FileReader();let data=await new Promise((resolve,reject)=>{reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(f)});
 let folder=type==='variations'?'logos/'+target.id:type==='fonts'?'fonts/'+target.id:'icons/'+target.id;
 let item={name:f.name,format:ext,path:'assets/'+folder+'/'+f.name,data};
 let old=target.files.findIndex(x=>x.format===ext&&type==='variations');
 if(old>=0){if(!confirm('Replace existing '+ext+' file in '+target.name+'?'))continue;target.files.splice(old,1)}
 target.files.push(item);
 }
 persist();renderSettings();toast('Files added. Export changes ZIP to publish.')
}
$('settingsBody').addEventListener('change',e=>{let el=e.target;if(el.dataset.upload){addFiles(el.dataset.upload,el.dataset.id,Array.from(el.files)).catch(err=>toast('Upload failed: '+err.message))}});
function base64ToBlob(data){let [meta,str]=data.split(',');let mime=(meta.match(/data:([^;]+)/)||[])[1]||'application/octet-stream';let raw=atob(str),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);return new Blob([u],{type:mime})}
async function assetBlob(f){if(f.data)return base64ToBlob(f.data);let r=await fetch('./'+f.path);if(!r.ok)throw Error('Missing asset: '+f.path);return r.blob()}
async function zipDownload(z,name){let blob=await z.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}});let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
$('downloadAllIcons').onclick=async()=>{let z=new JSZip();try{for(let [i,ic] of state.icons.entries())for(let f of ic.files)z.file('icon-'+String(i+1).padStart(2,'0')+'/'+f.name,await assetBlob(f));await zipDownload(z,slug+'-icons.zip')}catch(err){toast('ZIP download unavailable: '+err.message)}};
$('exportPackage').onclick=async()=>{let z=new JSZip(),data=clone(state);try{for(let group of ['variations','fonts','icons'])for(let item of data[group])for(let f of item.files){if(f.data)z.file(f.path,base64ToBlob(f.data));delete f.data}z.file('data/brand.json',JSON.stringify(data,null,2));z.file('README.txt','Design System v3.9 - '+slug+'\nUse tools/apply_brand_update.py on the extracted website folder to apply this exported ZIP.\nLocal browser edits are not published automatically.\n');await zipDownload(z,slug+'-brand-update.zip');toast('Exported. Apply package to publish changes.')}catch(err){toast('Export failed: '+err.message)}};
$('importPackage').onclick=()=>$('importFile').click();
$('importFile').onchange=async e=>{let file=e.target.files[0];if(!file)return;try{let z=await JSZip.loadAsync(file),entry=z.file('data/brand.json');if(!entry)throw Error('Not a brand update ZIP');let d=JSON.parse(await entry.async('string'));if(d.id!==slug)throw Error('This package belongs to '+d.id);for(let group of ['variations','fonts','icons'])for(let item of d[group])for(let f of item.files){let ent=z.file(f.path);if(ent){let blob=await ent.async('blob');f.data=await new Promise((resolve,reject)=>{let r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)})}}state=d;persist();renderSettings();toast('Imported '+slug+' settings')}catch(err){toast('Import failed: '+err.message)}e.target.value=''};
render();
})();
