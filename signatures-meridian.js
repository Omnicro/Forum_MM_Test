/* Mythic Méridian — un module JS et une feuille CSS pour toutes les signatures. */
(function(){
  if(!/^(mythicmeridian\.forumactif\.com|sosiessontsecstest\.forumactif\.com|127\.0\.0\.1)$/.test(location.hostname)||location.pathname.indexOf('/admin')===0||document.getElementById('mm-signatures-css'))return;
  var css=document.createElement('link');
  css.id='mm-signatures-css';css.rel='stylesheet';
  css.href='https://cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@65e3a45b6f87b90150e05703cee805188764133b/signatures-meridian.css';
  document.head.appendChild(css);
})();
/* Dimensions naturelles des GIFs, dans une composition de 190 px texte compris. */
(function(){
  if(!/^(mythicmeridian\.forumactif\.com|sosiessontsecstest\.forumactif\.com|127\.0\.0\.1)$/.test(location.hostname)||location.pathname.indexOf('/admin')===0||window.mmw26HeightReady)return;
  window.mmw26HeightReady=true;
  function init(){
    var signatures=Array.prototype.slice.call(document.querySelectorAll('.mmw26'));
    if(!signatures.length)return;
    var queued=false;
    function set(el,prop,value){if(el.style.getPropertyValue(prop)!==value)el.style.setProperty(prop,value);}
    function fit(sig){
      var scene=sig.querySelector('.mmw26-scene'),copy=sig.querySelector('.mmw26-copy'),tree=sig.querySelector('.mmw26-tree');
      if(!scene||!copy||!tree)return;
      var controls=Array.prototype.reduce.call(sig.querySelectorAll('.mmw26-pause,.mmw26-motion'),function(h,e){return h+e.offsetHeight;},0);
      var treeWidth=tree.getBoundingClientRect().width;
      // Une citation exceptionnellement longue reste entière au lieu d'être coupée.
      set(sig,'height',Math.max(190,Math.ceil(copy.getBoundingClientRect().height+controls+4+Math.max(100,treeWidth+20)))+'px');
      var cs=getComputedStyle(scene),rect=scene.getBoundingClientRect();
      var innerWidth=rect.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
      var innerHeight=rect.height-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
      var photos=Array.prototype.slice.call(scene.querySelectorAll('.mmw26-photo'));
      var portrait=sig.classList.contains('mmw26-portrait');
      var square=sig.classList.contains('mmw26-dair')&&!portrait;
      var gap=parseFloat(getComputedStyle(sig).getPropertyValue('--mmw-gap'))||0;
      var available=photos.length===2?(innerWidth-gap)/2:innerWidth-treeWidth-10;
      photos.forEach(function(photo){
        var img=photo.querySelector('img');
        if(!img||!img.naturalWidth||!img.naturalHeight)return;
        var ratio=square?1:img.naturalWidth/img.naturalHeight;
        var width=Math.max(1,Math.min(available,Math.max(1,innerHeight)*ratio));
        var value=(Math.floor(width*100)/100)+'px';
        set(photo,'width',value);set(photo,'flex','0 0 '+value);
      });
      if(photos.length===1){
        var width=photos[0].getBoundingClientRect().width;
        var right=sig.classList.contains('mmw26-entrelacs');
        var offset=portrait?(width+10)/2:right?width/2-17:width/2-20;
        set(sig,'--mmw-tree-x','calc(50% '+(right?'+':'-')+' '+offset.toFixed(2)+'px)');
        if(portrait)set(photos[0],'left',((right?-1:1)*(treeWidth+10)/2)+'px');
      }
    }
    function update(){queued=false;signatures.forEach(fit);}
    function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
    var observer=window.ResizeObserver?new ResizeObserver(schedule):null;
    signatures.forEach(function(sig){
      if(observer){observer.observe(sig);var copy=sig.querySelector('.mmw26-copy');if(copy)observer.observe(copy);}
      Array.prototype.forEach.call(sig.querySelectorAll('.mmw26-photo img'),function(img){img.addEventListener('load',schedule);});
    });
    window.addEventListener('resize',schedule,{passive:true});
    var css=document.getElementById('mm-signatures-css');if(css)css.addEventListener('load',schedule);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule);
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
