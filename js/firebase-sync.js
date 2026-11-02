import {firebaseConfig} from './firebase-config.js';
const $=id=>document.getElementById(id), ctrl=window.DesignCtrl;
if(ctrl){
 const login=$('cloudLogin'), save=$('cloudSave'), identity=$('cloudIdentity');
 save.disabled=true; login.disabled=true;
 try {
  const [{initializeApp},{getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut},{getFirestore,doc,onSnapshot,getDoc,setDoc,serverTimestamp}]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
   import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
  ]);
  const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
  const brandDoc=doc(db,'outlets',ctrl.slug);let admin=false,busy=false,connected=false;
  function controls(){login.disabled=false;save.disabled=!admin||busy||!connected;login.textContent=auth.currentUser?'Sign out':'Admin sign in';ctrl.setEditor(admin)}
  onAuthStateChanged(auth,async user=>{
   admin=false;controls();
   if(user){try{const d=await getDoc(doc(db,'admins',user.uid));admin=d.exists()&&d.data().role==='admin'}catch(err){console.warn('Admin lookup:',err)}}
   identity.textContent=user?user.email+(admin?' · Administrator':' · Read-only · UID: '+user.uid):'Public view · Sign in to edit';
   controls();
  });
  login.onclick=async()=>{try{if(auth.currentUser){await signOut(auth)}else{await signInWithPopup(auth,new GoogleAuthProvider())}}catch(err){ctrl.toast('Google sign-in failed: '+err.message);identity.textContent='Sign-in error: '+err.code}};
  // Only editable metadata is stored in Firestore. GitHub remains the sole asset source.
  const editable=data=>({
   colors:data.colors,
   safe:data.safe,
   incorrect:data.incorrect,
   guidelineNote:data.guidelineNote||'',
   variationOrder:data.variations.map(v=>({id:v.id,name:v.name})),
   fontSettings:data.fonts.map(f=>({id:f.id,name:f.name,role:f.role,usage:f.usage})),
   iconOrder:data.icons.map(ic=>ic.id)
  });
  const merge=(local,remote)=>{
   const d=structuredClone(local);
   if(Array.isArray(remote.colors))d.colors=remote.colors;
   if(remote.safe)d.safe=remote.safe;
   if(remote.incorrect)d.incorrect=remote.incorrect;
   if(typeof remote.guidelineNote==='string')d.guidelineNote=remote.guidelineNote;
   if(Array.isArray(remote.variationOrder)){
    const m=new Map(d.variations.map(v=>[v.id,v]));
    d.variations=remote.variationOrder.map(v=>{let orig=m.get(v.id);if(!orig)return null;m.delete(v.id);return {...orig,name:v.name||orig.name}}).filter(Boolean).concat([...m.values()]);
   }
   if(Array.isArray(remote.fontSettings)){
    const m=new Map(d.fonts.map(f=>[f.id,f]));
    d.fonts=remote.fontSettings.map(f=>{let orig=m.get(f.id);if(!orig)return null;m.delete(f.id);return {...orig,name:f.name||orig.name,role:f.role||orig.role,usage:f.usage??orig.usage}}).filter(Boolean).concat([...m.values()]);
   }
   if(Array.isArray(remote.iconOrder)){
    const m=new Map(d.icons.map(i=>[i.id,i]));
    d.icons=remote.iconOrder.map(id=>{let orig=m.get(id);m.delete(id);return orig}).filter(Boolean).concat([...m.values()]);
   }
   return d;
  };
  // Use immutable bundled file paths as the base even when Firestore data changes.
  const original=ctrl.getState();
  onSnapshot(brandDoc,snap=>{
   connected=true;controls();
   if(snap.exists()&&snap.data().settings){ctrl.applyRemote(merge(original,snap.data().settings));if(!window.DesignCtrlDirty)ctrl.status('Firebase connected · Shared settings loaded')}
   else if(!window.DesignCtrlDirty)ctrl.status('Firebase connected · No published settings yet');
  },err=>{connected=false;controls();ctrl.status('Firestore read failed: '+err.message);ctrl.toast('Unable to load shared settings')});
  save.onclick=async()=>{
   if(!admin||busy||!connected)return;busy=true;controls();ctrl.status('Saving shared settings…');
   try{await setDoc(brandDoc,{settings:editable(ctrl.getState()),updatedAt:serverTimestamp(),updatedBy:auth.currentUser.uid});
    window.DesignCtrlDirty=false;ctrl.markSynced();ctrl.toast('Saved to Firestore · Refresh another device to verify');
   }catch(err){ctrl.status('Save failed: '+err.message);ctrl.toast('Save failed: '+err.message)}
   finally{busy=false;controls()}
  };
  controls();
 }catch(err){identity.textContent='Firebase failed to load: '+err.message;console.error(err)}
}
