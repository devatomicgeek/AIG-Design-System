/* Works on GitHub Pages and local file:// pages. */
(function(){
  var key='design-system-theme-v3';
  function stored(){try{return localStorage.getItem(key)}catch(e){return null}}
  function save(value){try{localStorage.setItem(key,value)}catch(e){}}
  function apply(mode){
    document.documentElement.setAttribute('data-theme',mode);
    var button=document.querySelector('.theme-toggle');
    if(button){button.textContent=mode==='dark'?'☀':'☾';button.setAttribute('aria-label','Switch to '+(mode==='dark'?'light':'dark')+' mode');button.setAttribute('aria-pressed',String(mode==='dark'))}
  }
  apply(stored()==='dark'?'dark':'light');
  document.addEventListener('DOMContentLoaded',function(){
    apply(stored()==='dark'?'dark':'light');
    var button=document.querySelector('.theme-toggle');
    if(button)button.addEventListener('click',function(){var next=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';save(next);apply(next)});
  });
})();
