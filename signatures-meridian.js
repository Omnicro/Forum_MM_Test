/* Mythic Méridian — signatures complètes et blocs courts, un seul JavaScript. */
(function(){
  'use strict';
  if(!/^(mythicmeridian\.forumactif\.com|sosiessontsecstest\.forumactif\.com|127\.0\.0\.1|localhost)$/.test(location.hostname)||location.pathname.indexOf('/admin')===0||window.mmSignatureShortReady)return;
  window.mmSignatureShortReady=true;
  document.documentElement.setAttribute('data-mm-signatures','initializing');
  var templates={"orbite":{"prefix":"mms26","html":"<div class=\"mms26 mms26-orbite\" style=--mms-accent:#5A968D tabindex=0><div class=mms26-sky><div class=mms26-orbit></div><div class=mms26-moon><img class=mms26-photo src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt loading=lazy></div><div class=mms26-satellite><img class=mms26-photo src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt loading=lazy></div><span class=mms26-star aria-hidden=true>✦</span></div><div class=mms26-orbit-text><span class=mms26-kicker>Entre ombre et lumière</span><span class=mms26-name>Personnage</span><span class=mms26-quote>Chaque histoire laisse une empreinte.</span><div class=mms26-credit><span>Le personnage écrit en</span><b>#5A968D</b></div></div></div>"},"eclipse":{"prefix":"mmo26","html":"<div class=\"mmo26 mmo26-eclipse\" style=--mmo-accent:#5A968D><div class=mmo26-layout><div class=mmo26-sky><i class=mmo26-ring></i><i class=\"mmo26-ring mmo26-r2\"></i><i class=\"mmo26-ring mmo26-r3\"></i><div class=mmo26-core><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt></div><div class=mmo26-guest><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt></div><i class=mmo26-spark aria-hidden=true>✦</i></div><div class=mmo26-text><span class=mmo26-eyebrow>Entre ombre et lumière</span><span class=mmo26-name>Personnage</span><span class=mmo26-quote>Chaque histoire laisse une empreinte.</span><span class=mmo26-credit>Le personnage écrit en <b>#5A968D</b></span></div></div></div>"},"orrery":{"prefix":"mmo26","html":"<div class=\"mmo26 mmo26-orrery\" style=--mmo-accent:#5A968D><div class=mmo26-layout><div class=mmo26-sky><i class=mmo26-ring></i><i class=\"mmo26-ring mmo26-r2\"></i><i class=\"mmo26-ring mmo26-r3\"></i><div class=mmo26-core><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt></div><div class=mmo26-guest><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt></div><i class=mmo26-spark aria-hidden=true>✦</i></div><div class=mmo26-text><span class=mmo26-eyebrow>Entre ombre et lumière</span><span class=mmo26-name>Personnage</span><span class=mmo26-quote>Chaque histoire laisse une empreinte.</span><span class=mmo26-credit>Le personnage écrit en <b>#5A968D</b></span></div></div></div>"},"nocturne":{"prefix":"mms26","html":"<div class=\"mms26 mms26-nocturne\" style=--mms-accent:#5A968D tabindex=0><div class=mms26-stage><span class=mms26-kicker>Entre ombre et lumière</span><div class=mms26-film><img class=mms26-photo src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt loading=lazy><img class=mms26-photo src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt loading=lazy></div><div class=mms26-caption><span class=mms26-name>Personnage</span><span class=mms26-quote>Chaque histoire laisse une empreinte.</span></div></div><div class=mms26-credit><span>Le personnage écrit en</span><b>#5A968D</b></div></div>"},"fracture":{"prefix":"mms26","html":"<div class=\"mms26 mms26-fracture\" style=--mms-accent:#5A968D tabindex=0><div class=mms26-cut><span class=mms26-kicker>Entre ombre et lumière</span><div class=mms26-shot><img class=mms26-photo src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt loading=lazy></div><div class=mms26-shot><img class=mms26-photo src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt loading=lazy></div><div class=mms26-rule></div></div><div class=mms26-caption><span class=mms26-name>Personnage</span><span class=mms26-quote>Chaque histoire laisse une empreinte.</span></div><div class=mms26-credit><span>Le personnage écrit en</span><b>#5A968D</b></div></div>"},"parallaxe":{"prefix":"mms26","html":"<div class=\"mms26 mms26-parallaxe\" style=--mms-accent:#5A968D tabindex=0><div class=mms26-deck><span class=mms26-monogram aria-hidden=true>P</span><div class=mms26-card><img class=mms26-photo src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt loading=lazy></div><div class=mms26-card><img class=mms26-photo src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt loading=lazy></div><div class=mms26-seal><span class=mms26-star aria-hidden=true>✦</span></div></div><span class=mms26-name>Personnage</span><span class=mms26-quote>Chaque histoire laisse une empreinte.</span><div class=mms26-credit><span>Le personnage écrit en</span><b>#5A968D</b></div></div>"},"binaire":{"prefix":"mmo26","html":"<div class=\"mmo26 mmo26-binaire\" style=--mmo-accent:#5A968D><div class=mmo26-layout><div class=mmo26-sky><i class=mmo26-ring></i><i class=\"mmo26-ring mmo26-r2\"></i><i class=\"mmo26-ring mmo26-r3\"></i><div class=mmo26-bond></div><div class=mmo26-core><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt></div><div class=mmo26-guest><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt></div><i class=mmo26-spark aria-hidden=true>✦</i></div><div class=mmo26-text><span class=mmo26-eyebrow>Entre ombre et lumière</span><span class=mmo26-name>Personnage</span><span class=mmo26-quote>Chaque histoire laisse une empreinte.</span><span class=mmo26-credit>Le personnage écrit en <b>#5A968D</b></span></div></div></div>"},"dair":{"prefix":"mmc26","html":"<div class=\"mmc26 mmc26-dair\"><div class=mmc26-scene><i class=mmc26-halo></i><i class=mmc26-weave></i><i class=mmc26-orbit></i><div class=mmc26-photo><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt></div><div class=\"mmc26-photo mmc26-second\"><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt></div><i class=mmc26-tree></i><i class=mmc26-light></i></div><div class=mmc26-copy><span class=mmc26-label>Dair</span><span class=mmc26-name>Personnage</span><span class=mmc26-quote>Chaque histoire laisse une empreinte.</span><span class=mmc26-credit>Le personnage écrit en <b>#5A968D</b></span></div></div>"},"triade":{"prefix":"mmc26","html":"<div class=\"mmc26 mmc26-triade\"><div class=mmc26-scene><i class=mmc26-halo></i><i class=mmc26-weave></i><i class=mmc26-orbit></i><div class=mmc26-photo><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt></div><div class=\"mmc26-photo mmc26-second\"><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt></div><i class=mmc26-tree></i><i class=mmc26-light></i></div><div class=mmc26-copy><span class=mmc26-label>Triade</span><span class=mmc26-name>Personnage</span><span class=mmc26-quote>Chaque histoire laisse une empreinte.</span><span class=mmc26-credit>Le personnage écrit en <b>#5A968D</b></span></div></div>"},"dair-portrait":{"prefix":"mmw26","html":"<div class=\"mmw26 mmw26-dair mmw26-portrait\"><div class=mmw26-scene><i class=mmw26-weave></i><i class=mmw26-ring></i><div class=mmw26-photo><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt></div><div class=\"mmw26-photo mmw26-second\"><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif alt></div><i class=mmw26-tree></i></div><div class=mmw26-copy><span class=mmw26-name>Personnage</span><span class=mmw26-quote>Chaque histoire laisse une empreinte.</span><span class=mmw26-credit>Le personnage écrit en <b>#5A968D</b></span></div></div>"},"entrelacs-cinema":{"prefix":"mmw26","html":"<div class=\"mmw26 mmw26-entrelacs\"><div class=mmw26-scene><i class=mmw26-weave></i><i class=mmw26-ring></i><div class=mmw26-photo><img src=//cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif alt></div><i class=mmw26-tree></i></div><div class=mmw26-copy><span class=mmw26-name>Personnage</span><span class=mmw26-quote>Chaque histoire laisse une empreinte.</span><span class=mmw26-credit>Le personnage écrit en <b>#5A968D</b></span></div></div>"}};
  var defaults={nom:'Personnage',citation:'Chaque histoire laisse une empreinte.',accroche:'Entre ombre et lumière',couleur:'#5A968D',image1:'https://cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-solaire.gif',image2:'https://cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@052e7a2aff88e26998dc5a17fac05435cfa65025/meridian-arbre-lunaire.gif'};
  var selector='.mm-signature[data-modele]';
  var attrs=['data-modele','data-nom','data-citation','data-accroche','data-couleur','data-image1','data-image2'];
  var saved=new WeakMap(),pending=[],renderQueued=false,fitQueued=false,fitted=[];
  var resizeObserver=window.ResizeObserver?new ResizeObserver(scheduleFit):null;
  var manageLegacy=false;
  function ensureCss(){
    if(document.getElementById('mm-signatures-css'))return;
    var development=['mmf26-fenrir-css','mmw26-css','mmc26-celtic-css','mm-signatures-compactes-css','mmh26-clockwork-css','mmo26-orbites-css','mms26-collection-css'];
    if(development.every(function(id){return document.getElementById(id);}))return;
    var link=document.createElement('link');link.id='mm-signatures-css';link.rel='stylesheet';link.href='https://cdn.jsdelivr.net/gh/Omnicro/Forum_MM_Test@65e3a45b6f87b90150e05703cee805188764133b/signatures-meridian.css';
    link.addEventListener('load',scheduleFit);document.head.appendChild(link);
  }
  function config(host){
    var result={};
    Object.keys(defaults).forEach(function(key){var value=host.getAttribute('data-'+key);result[key]=value===null?defaults[key]:value;});
    result.modele=(host.getAttribute('data-modele')||'').trim().toLowerCase();
    var color=result.couleur.trim();if(color.charAt(0)!=='#')color='#'+color;
    result.couleur=/^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(color)?color:defaults.couleur;
    return result;
  }
  function imageUrl(value,fallback){
    try{if(!/^https?:\/\/|^\/\//i.test(value.trim()))return fallback;var url=new URL(value.trim(),location.href);return url.protocol==='https:'||url.protocol==='http:'?url.href:fallback;}catch(e){return fallback;}
  }
  function setText(root,query,value){var el=root.querySelector(query);if(el)el.textContent=value;}
  function render(host){
    if(!host.isConnected||host.closest('pre,code,textarea,script,style,[contenteditable],.sceditor-container'))return;
    var data=config(host),key=JSON.stringify(data),previous=saved.get(host);
    if(previous&&previous.key===key&&host.contains(previous.root))return;
    if(!Object.prototype.hasOwnProperty.call(templates,data.modele)){
      if(!host.textContent.trim())host.textContent=data.nom||defaults.nom;
      host.setAttribute('data-mm-signature-state','unknown');return;
    }
    var model=templates[data.modele],template=document.createElement('template');
    // Seul le HTML statique de nos modèles est interprété. Les attributs sont traités séparément.
    template.innerHTML=model.html;
    var root=template.content.firstElementChild,prefix=model.prefix;
    setText(root,'.'+prefix+'-name',data.nom);
    setText(root,'.'+prefix+'-quote',data.citation);
    setText(root,'.'+prefix+'-kicker,.'+prefix+'-eyebrow',data.accroche);
    setText(root,'.'+prefix+'-monogram',Array.from(data.nom.trim())[0]||'');
    var color=root.querySelector('.'+prefix+'-credit b');
    if(color){color.textContent=data.couleur;color.style.color=data.couleur;}
    root.style.setProperty('--'+prefix.slice(0,-2)+'-accent',data.couleur);
    Array.prototype.forEach.call(root.querySelectorAll('img'),function(img,index){
      var field=index===0?'image1':'image2',fallback=defaults[field];
      img.src=imageUrl(data[field],fallback);
      img.addEventListener('error',function(){if(img.src!==fallback)img.src=fallback;},{once:true});
    });
    saved.set(host,{key:key,root:root});
    host.replaceChildren(root);host.setAttribute('data-mm-signature-state','ready');
    if(root.classList.contains('mmw26'))watchFit(root);
  }
  function enqueue(host){if(pending.indexOf(host)<0)pending.push(host);if(!renderQueued){renderQueued=true;requestAnimationFrame(flush);}}
  function flush(){renderQueued=false;var queue=pending;pending=[];queue.forEach(render);}
  function scan(node){
    if(node.nodeType!==1)return;
    if(node.matches(selector))enqueue(node);
    Array.prototype.forEach.call(node.querySelectorAll(selector),enqueue);
    if(manageLegacy){if(node.matches('.mmw26'))watchFit(node);Array.prototype.forEach.call(node.querySelectorAll('.mmw26'),watchFit);}
  }
  function set(el,prop,value){if(el.style.getPropertyValue(prop)!==value)el.style.setProperty(prop,value);}
  function fit(sig){
    var scene=sig.querySelector('.mmw26-scene'),copy=sig.querySelector('.mmw26-copy'),tree=sig.querySelector('.mmw26-tree');
    if(!scene||!copy||!tree)return;
    var controls=Array.prototype.reduce.call(sig.querySelectorAll('.mmw26-pause,.mmw26-motion'),function(h,e){return h+e.offsetHeight;},0);
    var treeWidth=tree.getBoundingClientRect().width;
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
      var img=photo.querySelector('img');if(!img||!img.naturalWidth||!img.naturalHeight)return;
      var ratio=square?1:img.naturalWidth/img.naturalHeight;
      var width=Math.max(1,Math.min(available,Math.max(1,innerHeight)*ratio));
      var value=(Math.floor(width*100)/100)+'px';set(photo,'width',value);set(photo,'flex','0 0 '+value);
    });
    if(photos.length===1){
      var width=photos[0].getBoundingClientRect().width,right=sig.classList.contains('mmw26-entrelacs');
      var offset=portrait?(width+10)/2:right?width/2-17:width/2-20;
      set(sig,'--mmw-tree-x','calc(50% '+(right?'+':'-')+' '+offset.toFixed(2)+'px)');
      if(portrait)set(photos[0],'left',((right?-1:1)*(treeWidth+10)/2)+'px');
    }
  }
  function watchFit(root){
    if(fitted.some(function(item){return item.root===root;}))return;
    var copy=root.querySelector('.mmw26-copy');fitted.push({root:root,copy:copy});
    if(resizeObserver){resizeObserver.observe(root);if(copy)resizeObserver.observe(copy);}
    Array.prototype.forEach.call(root.querySelectorAll('.mmw26-photo img'),function(img){img.addEventListener('load',scheduleFit);});
    scheduleFit();
  }
  function scheduleFit(){if(!fitQueued){fitQueued=true;requestAnimationFrame(updateFit);}}
  function updateFit(){
    fitQueued=false;
    fitted=fitted.filter(function(item){if(item.root.isConnected){fit(item.root);return true;}if(resizeObserver){resizeObserver.unobserve(item.root);if(item.copy)resizeObserver.unobserve(item.copy);}return false;});
  }
  function boot(){
    document.documentElement.setAttribute('data-mm-signatures','starting');
    ensureCss();
    manageLegacy=!window.mmw26HeightReady;if(manageLegacy)window.mmw26HeightReady=true;
    scan(document.body);flush();
    var observer=new MutationObserver(function(records){records.forEach(function(record){
      if(record.type==='attributes'){if(record.target.matches(selector))enqueue(record.target);return;}
      Array.prototype.forEach.call(record.addedNodes,scan);
      if(record.removedNodes.length&&fitted.length)scheduleFit();
    });});
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:attrs});
    window.addEventListener('resize',scheduleFit,{passive:true});
    Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"]'),function(link){link.addEventListener('load',scheduleFit);});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(scheduleFit);
    document.documentElement.setAttribute('data-mm-signatures','1.0');
  }
  // Laisser les modules déjà installés terminer leur initialisation avant de générer les nouveaux blocs.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,0);});else setTimeout(boot,0);
})();
