(()=>{'use strict';
const $=id=>document.getElementById(id), clone=o=>JSON.parse(JSON.stringify(o)), escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=document.body.dataset.brand, base=JSON.parse($('brand-data').textContent);
let state=clone(base); // Bundled assets are the source of truth; Firestore overrides editable settings.
window.DesignCtrlCanEdit=false;
let tab='logos',fontFaces=[];

function toast(s){let t=$('toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function persist(){if(!window.DesignCtrlCanEdit)return;window.DesignCtrlDirty=true;$('saveStatus').textContent='Unsaved changes · Click Save to Firebase';render()}
function pathFor(f){return f?.data||f?.url||(f?.path?'./'+f.path:'')}
function fileName(f){return f.name||'asset'}
function previewFile(files){return (files||[]).find(f=>['PNG','SVG','JPG','JPEG','WEBP','GIF'].includes(f.format))}
function imgFor(files){let f=previewFile(files);return f?`<img src="${escape(pathFor(f))}" alt="" loading="lazy">`:'<span class="help">No image preview</span>'}
function filesMarkup(files){return (files||[]).map(f=>`<a class="file-link" href="${escape(pathFor(f))}" download="${escape(fileName(f))}">↓ ${escape(f.format)}</a>`).join('')}
function fontDownloadMarkup(f){let z=(f.files||[]).filter(x=>x.format==='ZIP');return z.length?filesMarkup(z):filesMarkup(f.files)}
function variation(id){return state.variations.find(x=>x.id===id)||state.variations[0]}
function opts(selected){return state.variations.map(v=>`<option value="${escape(v.id)}" ${selected===v.id?'selected':''}>${escape(v.name)}</option>`).join('')}
const errors=[['stretch','Stretch'],['rotate','Rotate'],['squash','Distort'],['low','Poor contrast'],['shadow','Add effects'],['tint','Change colors']];
function render(){
 $('logoGrid').innerHTML=state.variations.length?state.variations.map(v=>`<article class="logo-card"><div class="logo-art">${imgFor(v.files)}</div><div class="logo-card-info"><h3>${escape(v.name)}</h3><div class="download-row">${filesMarkup(v.files)}</div></div></article>`).join(''):'<div class="empty">No logo assets are available yet.</div>';
 let v=variation(state.safe.variation),safe=state.safe;
 $('safePixels').textContent=`Reference width: ${Number(safe.referenceWidth)||400}px · Top ${Math.round((Number(safe.top)||0)*(Number(safe.referenceWidth)||400)/100)}px · Right ${Math.round((Number(safe.right)||0)*(Number(safe.referenceWidth)||400)/100)}px · Bottom ${Math.round((Number(safe.bottom)||0)*(Number(safe.referenceWidth)||400)/100)}px · Left ${Math.round((Number(safe.left)||0)*(Number(safe.referenceWidth)||400)/100)}px (scales with logo)`;
 $('safeNote').textContent=safe.note||'Clear-space demonstration. Configure the approved measurement in Settings.';
 $('safePreview').innerHTML=v?`<div class="safe-boundary" style="padding:${Number(safe.top)||0}% ${Number(safe.right)||0}% ${Number(safe.bottom)||0}% ${Number(safe.left)||0}%">${imgFor(v.files)}</div>`:'<span class="help">Add a logo variation to show safe space.</span>';
 $('incorrectGrid').innerHTML=errors.map(([style,label])=>{let vv=variation(state.incorrect.perExample?.[style]||state.incorrect.variation);return `<div class="wrong-tile ${style}">${vv?imgFor(vv.files):''}<small>✕ ${label}</small></div>`}).join('');
 $('guidelineNote').textContent=state.guidelineNote||'';
 $('colorGrid').innerHTML=state.colors.length?state.colors.map((c,i)=>`<div class="color-card" data-color="${i}" role="button" tabindex="0"><div class="swatch" style="background:${/^#[0-9a-f]{6}$/i.test(c.hex)?c.hex:'#ddd'}"></div><strong>${escape(c.name)}</strong><small>${escape(c.hex)}</small></div>`).join(''):'<div class="empty">No brand colors added.</div>';
 $('fontGrid').innerHTML=state.fonts.length?state.fonts.map((f,i)=>`<article class="font-card"><small>${escape(f.role)} · ${escape(f.usage||'')}</small><h3>${escape(f.name)}</h3><div class="font-sample" data-font="${i}">Aa Bb Cc Dd</div><div class="font-alphabet" data-font="${i}">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz · 0123456789</div><div class="download-row">${fontDownloadMarkup(f)}</div>${f.files?.length?'':'<p class="help">Font files have not been supplied for a live preview.</p>'}</article>`).join(''):'<div class="empty">No fonts added.</div>';
 $('iconCount').textContent=state.icons.length+' icons';$('downloadAllIcons').disabled=!state.icons.length;
 $('iconGrid').innerHTML=state.icons.length?state.icons.map((ic,i)=>`<div class="icon-card">${imgFor(ic.files)}<button class="mini-button" data-icon-download="${i}" aria-label="Choose icon download format">↓ Download</button></div>`).join(''):'<div class="empty">No icon assets available yet.</div>';
 loadFonts();
}
function loadFonts(){fontFaces.forEach(f=>{try{document.fonts.delete(f)}catch{}});fontFaces=[];state.fonts.forEach((font,i)=>{let f=(font.files||[]).find(x=>/\.(woff2?|ttf|otf)$/i.test(x.name));if(!f)return;try{let face=new FontFace('BrandPreview'+i,`url("${pathFor(f)}")`);face.load().then(loaded=>{document.fonts.add(loaded);fontFaces.push(loaded);document.querySelectorAll(`[data-font="${i}"]`).forEach(el=>el.style.fontFamily='BrandPreview'+i)}).catch(()=>{})}catch{}})}
$('iconGrid').addEventListener('click',e=>{let b=e.target.closest('[data-icon-download]');if(!b)return;let ic=state.icons[Number(b.dataset.iconDownload)];let dlg=$('formatDialog');$('formatChoices').innerHTML=filesMarkup(ic.files)||'No formats uploaded';dlg.showModal()});
$('closeFormat').onclick=()=>$('formatDialog').close();
$('colorGrid').addEventListener('click',e=>{let el=e.target.closest('[data-color]');if(el){let hex=state.colors[Number(el.dataset.color)].hex;navigator.clipboard?.writeText(hex).then(()=>toast('Copied '+hex)).catch(()=>toast(hex))}});
$('colorGrid').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('[data-color]'))e.target.click()});
const tabs=[['logos','Logos'],['safe','Safe Area'],['incorrect','Incorrect Usage'],['colors','Colors'],['fonts','Typography'],['icons','Iconography']];
function open(){renderSettings();$('settingsDialog').showModal()}
$('openSettings').onclick=open;$('closeSettings').onclick=()=>$('settingsDialog').close();$('settingsDialog').addEventListener('click',e=>{if(e.target===$('settingsDialog'))$('settingsDialog').close()});
function field(text,val,attr){return `<label>${escape(text)} <input type="text" ${attr} value="${escape(val)}"></label>`}
function fileChips(files,type,id){return `<div>${(files||[]).map((f,i)=>`<span class="file-chip">${escape(f.format)} <span title="${escape(f.name)}">${escape(f.name.length>22?f.name.slice(0,19)+'…':f.name)}</span></span>`).join('')}</div>`}

function moveButtons(type,id,i,len){return `<button class="mini-button" data-action="move" data-type="${type}" data-id="${escape(id)}" data-dir="-1" ${i===0?'disabled':''}>↑</button><button class="mini-button" data-action="move" data-type="${type}" data-id="${escape(id)}" data-dir="1" ${i===len-1?'disabled':''}>↓</button>`}
function renderSettings(){
 $('settingsTabs').innerHTML=tabs.map(([id,name])=>`<button type="button" class="${tab===id?'active':''}" data-tab="${id}">${name}</button>`).join('');
 let body='';
 if(tab==='logos')body=`<p class="help">Rename and reorder existing logo variations. To add or replace files, update the GitHub website package through ChatGPT.</p>${state.variations.map((v,i)=>`<div class="editor-card"><div class="editor-row">${moveButtons('variations',v.id,i,state.variations.length)}<input type="text" aria-label="Variation name" data-edit="variation-name" data-id="${v.id}" value="${escape(v.name)}"></div><div class="preview">${imgFor(v.files)}</div>${fileChips(v.files,'variations',v.id)}</div>`).join('')}`;
 if(tab==='safe')body=`<div class="editor-card"><h4>Logo clear-space settings</h4><p class="help">Select a logo and set top, right, bottom and left clear-space values as percentages of the displayed logo dimensions. These are editable visual guides, not automatic official measurements.</p><div class="editor-row"><label>Logo variation</label><select data-edit="safe-variation">${opts(state.safe.variation)}</select></div><div class="editor-row"><label>Reference logo width (px)</label><input type="number" min="1" data-edit="safe-referenceWidth" value="${Number(state.safe.referenceWidth)||400}"></div>${['top','right','bottom','left'].map(k=>`<div class="editor-row"><label style="min-width:70px">${k[0].toUpperCase()+k.slice(1)} %</label><input type="number" min="0" max="100" step="1" data-edit="safe-${k}" value="${Number(state.safe[k])||0}"></div>`).join('')}<label>Guideline note</label><textarea data-edit="safe-note">${escape(state.safe.note)}</textarea></div><div class="editor-card"><h4>Official guideline reference</h4><textarea data-edit="guideline-note">${escape(state.guidelineNote||'')}</textarea><p class="help">Use this to record the approved rule. For precise measurements based on logo artwork, consult the official guideline document.</p></div>`;
 if(tab==='incorrect')body=`<div class="editor-card"><h4>Incorrect usage logo selection</h4><p class="help">Choose one default variation for all six examples, or override individual examples.</p><div class="editor-row"><label>Default logo</label><select data-edit="incorrect-default"><option value="">None</option>${opts(state.incorrect.variation)}</select></div>${errors.map(([id,label])=>`<div class="editor-row"><label style="min-width:115px">${label}</label><select data-edit="incorrect-example" data-id="${id}"><option value="">Use default</option>${opts(state.incorrect.perExample?.[id])}</select></div>`).join('')}</div>`;
 if(tab==='colors')body=`<p class="help">Edit the full color name and HEX value. Changes are shared after Save to Firebase.</p>${state.colors.map((c,i)=>`<div class="editor-card color-editor"><div class="editor-row"><strong>Color ${String(i+1).padStart(2,'0')}</strong><span class="grow"></span>${moveButtons('colors',String(i),i,state.colors.length)}<button class="mini-button danger" data-action="delete" data-type="colors" data-id="${i}">✕</button></div><input type="color" class="large-swatch" aria-label="Color picker" data-edit="color-picker" data-index="${i}" value="${/^#[0-9a-f]{6}$/i.test(c.hex)?c.hex:'#888888'}"><label>Color name<input type="text" data-edit="color-name" data-index="${i}" value="${escape(c.name)}"></label><label>HEX code<input type="text" data-edit="color-hex" data-index="${i}" value="${escape(c.hex)}" maxlength="7" spellcheck="false"></label></div>`).join('')}<button class="button" data-action="add-color">+ Add color</button>`;
 if(tab==='fonts')body=`<p class="help">Edit font names, hierarchy, and usage. Font files are managed in the GitHub repository.</p>${state.fonts.map((f,i)=>`<div class="editor-card font-editor"><div class="editor-row"><strong>Font ${String(i+1).padStart(2,'0')}</strong><span class="grow"></span>${moveButtons('fonts',f.id,i,state.fonts.length)}</div><label>Font family<input type="text" data-edit="font-name" data-id="${f.id}" value="${escape(f.name)}"></label><label>Hierarchy<select data-edit="font-role" data-id="${f.id}">${['Primary','Secondary','Tertiary','Supporting'].map(r=>`<option ${r===f.role?'selected':''}>${r}</option>`).join('')}</select></label><label>Usage<input type="text" data-edit="font-usage" data-id="${f.id}" value="${escape(f.usage||'')}" placeholder="Headings, Body, Accent"></label><div class="preview" style="font-size:24px" data-settings-font="${i}">Aa Bb Cc Dd · The quick brown fox</div><div class="download-row">${fontDownloadMarkup(f)}</div></div>`).join('')}`;
 if(tab==='icons')body=`<p class="help">Reorder existing icons. To add or replace icon formats, update the GitHub website package.</p><div class="icon-editor-list">${state.icons.map((ic,i)=>`<div class="editor-card icon-editor"><div class="editor-row"><div class="icon-thumb">${imgFor(ic.files)}</div><span class="grow"></span>${moveButtons('icons',ic.id,i,state.icons.length)}</div><div class="editor-row">${(ic.files||[]).map((f,j)=>`<span class="format-chip">${escape(f.format)} </span>`).join('')}</div></div>`).join('')}</div>`;
 $('settingsBody').innerHTML=body; if(!window.DesignCtrlCanEdit){$('settingsBody').querySelectorAll('input,select,textarea,button[data-action]').forEach(el=>el.disabled=true)} loadSettingsFonts();
}
function loadSettingsFonts(){state.fonts.forEach((f,i)=>{let el=document.querySelector(`[data-settings-font="${i}"]`);if(!el)return;let face=fontFaces.find(x=>x.family==='BrandPreview'+i);if(face)el.style.fontFamily='BrandPreview'+i;else {let f2=(f.files||[]).find(x=>/\.(ttf|otf|woff2?)$/i.test(x.name));if(f2){let ff=new FontFace('SettingsPreview'+i,`url("${pathFor(f2)}")`);ff.load().then(x=>{document.fonts.add(x);el.style.fontFamily='SettingsPreview'+i}).catch(()=>{})}}})}
$('settingsTabs').addEventListener('click',e=>{let b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;renderSettings()}});
function collection(type){return state[type]}
function findItem(type,id){return collection(type).find(x=>x.id===id)}
$('settingsBody').addEventListener('click',e=>{if(!window.DesignCtrlCanEdit)return;let b=e.target.closest('[data-action]');if(!b)return;let a=b.dataset.action,type=b.dataset.type,id=b.dataset.id;
 if(a==='add-color')state.colors.push({name:'New Color',hex:'#888888'});
 if(a==='delete'){if(type!=='colors')return;if(!confirm('Remove this brand color from the shared palette?'))return;state.colors.splice(Number(id),1)}
 if(a==='move'){let arr=collection(type),i=type==='colors'?Number(id):arr.findIndex(x=>x.id===id),j=i+Number(b.dataset.dir);if(j>=0&&j<arr.length)[arr[i],arr[j]]=[arr[j],arr[i]]}
 persist();renderSettings();
});
$('settingsBody').addEventListener('change',e=>{if(!window.DesignCtrlCanEdit)return;let el=e.target,what=el.dataset.edit,id=el.dataset.id,i=Number(el.dataset.index),v=el.value;
 if(what==='variation-name'){let item=findItem('variations',id);if(item)item.name=v}
 if(what==='safe-variation')state.safe.variation=v;
 if(what?.startsWith('safe-')&&what!=='safe-variation'&&what!=='safe-note')state.safe[what.slice(5)]=Math.max(0,Math.min(what==='safe-referenceWidth'?10000:100,Number(v)||0));
 if(what==='safe-note')state.safe.note=v;
 if(what==='guideline-note')state.guidelineNote=v;
 if(what==='incorrect-default')state.incorrect.variation=v;
 if(what==='incorrect-example')state.incorrect.perExample[id]=v;
 if(what==='color-name')state.colors[i].name=v;
 if(what==='color-picker'){if(state.colors[i].hex.toUpperCase()!==v.toUpperCase()&&!confirm('Change this approved brand color from '+state.colors[i].hex+' to '+v.toUpperCase()+'?')){renderSettings();return}state.colors[i].hex=v.toUpperCase()}
 if(what==='color-hex'){if(!/^#[0-9a-f]{6}$/i.test(v)){toast('Enter a valid HEX value like #B87567');return}if(state.colors[i].hex.toUpperCase()!==v.toUpperCase()&&!confirm('Change this approved brand color from '+state.colors[i].hex+' to '+v.toUpperCase()+'?')){renderSettings();return}state.colors[i].hex=v.toUpperCase()}
 if(what?.startsWith('font-')){let f=findItem('fonts',id);if(f)f[what.slice(5)]=v}
 persist();renderSettings();
});
function base64ToBlob(data){let [meta,str]=data.split(',');let mime=(meta.match(/data:([^;]+)/)||[])[1]||'application/octet-stream';let raw=atob(str),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);return new Blob([u],{type:mime})}
async function assetBlob(f){if(f.data)return base64ToBlob(f.data);let r=await fetch(f.url||'./'+f.path);if(!r.ok)throw Error('Missing asset: '+f.path);return r.blob()}
async function zipDownload(z,name){let blob=await z.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}});let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
$('downloadAllIcons').onclick=async()=>{let z=new JSZip();try{for(let [i,ic] of state.icons.entries())for(let f of ic.files)z.file('icon-'+String(i+1).padStart(2,'0')+'/'+f.name,await assetBlob(f));await zipDownload(z,slug+'-icons.zip')}catch(err){toast('ZIP download unavailable: '+err.message)}};
window.DesignCtrl={slug,hasUnsaved:()=>!!window.DesignCtrlDirty,setEditor:allowed=>{window.DesignCtrlCanEdit=allowed;if($('settingsDialog').open)renderSettings()},getState:()=>clone(state),applyRemote:data=>{if(window.DesignCtrlDirty)return;state=clone(data);render();if($('settingsDialog').open)renderSettings()},markSynced:()=>{window.DesignCtrlDirty=false;$('saveStatus').textContent='Saved to Firebase · Synced across devices'},status:msg=>{$('saveStatus').textContent=msg},toast};
render();
})();
