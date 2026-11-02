import {firebaseConfig} from './firebase-config.js';
const $=id=>document.getElementById(id);
const ctrl=window.DesignCtrl;
if(ctrl){
 const login=$('cloudLogin'),save=$('cloudSave'),identity=$('cloudIdentity');
 const configured=firebaseConfig.apiKey&&!firebaseConfig.apiKey.startsWith('REPLACE_');
 if(!configured){identity.textContent='Firebase setup required · See README';save.disabled=true;login.disabled=true}
 else{
  try{
   const [{initializeApp},{getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut},{getFirestore,doc,onSnapshot,getDoc,setDoc,serverTimestamp},{getStorage,ref,uploadBytes,getDownloadURL}]=await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js')
   ]);
   const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
   const brandDoc=doc(db,'brands',ctrl.slug);
   let admin=false,loading=false;
   function controls(){save.disabled=!admin||loading;login.textContent=auth.currentUser?'Sign out':'Admin sign in'}
   onAuthStateChanged(auth,async user=>{
    admin=false;
    if(user){try{admin=(await getDoc(doc(db,'admins',user.uid))).exists()}catch(err){console.warn('Admin check failed',err)}}
    identity.textContent=user?(user.email+(admin?' · Editor':' · Read-only')):'Public view · Sign in to edit';controls();
   });
   login.onclick=async()=>{try{if(auth.currentUser){await signOut(auth);return}await signInWithPopup(auth,new GoogleAuthProvider())}catch(err){ctrl.toast('Sign-in failed: '+err.message)}};
   onSnapshot(brandDoc,snapshot=>{if(snapshot.exists()){
    let data=snapshot.data().content;
    if(data){ctrl.applyRemote(data);if(!window.DesignCtrlDirty)ctrl.status('Firebase connected · Live updates enabled')}
   }else if(!window.DesignCtrlDirty){ctrl.status('Firebase connected · Publish initial brand data to share')}},err=>{ctrl.status('Firebase read failed: '+err.message)});
   const decode=data=>{let [meta,payload]=data.split(',');let binary=atob(payload),arr=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)arr[i]=binary.charCodeAt(i);return new Blob([arr],{type:(meta.match(/data:([^;]+)/)||[])[1]||'application/octet-stream'})};
   save.onclick=async()=>{
    if(!admin||loading)return;
    loading=true;controls();let data=ctrl.getState();
    try{
     ctrl.status('Uploading assets to Firebase Storage…');
     for(let group of ['variations','fonts','icons'])for(let item of data[group]||[])for(let f of item.files||[]){
      if(!f.data)continue;
      let objectPath='brands/'+ctrl.slug+'/'+group+'/'+item.id+'/'+Date.now()+'-'+crypto.randomUUID()+'/'+f.name.replace(/[^a-zA-Z0-9._-]/g,'_');
      let objectRef=ref(storage,objectPath);
      await uploadBytes(objectRef,decode(f.data),{contentType:(f.data.match(/^data:([^;]+)/)||[])[1]||'application/octet-stream'});
      f.url=await getDownloadURL(objectRef);f.storagePath=objectPath;delete f.data;
     }
     ctrl.status('Publishing shared brand settings…');
     await setDoc(brandDoc,{content:data,updatedAt:serverTimestamp(),updatedBy:auth.currentUser.uid});
     // Replace local data URLs with remote URLs after successful publish.
     window.DesignCtrlDirty=false;ctrl.applyRemote(data);ctrl.markSynced();ctrl.toast('Saved to Firebase · Coworkers will see the update');
    }catch(err){ctrl.status('Save failed · '+err.message);ctrl.toast('Firebase save failed: '+err.message)}finally{loading=false;controls()}
   };
   controls();
  }catch(err){identity.textContent='Firebase initialization failed';save.disabled=true;console.error(err)}
 }
}
