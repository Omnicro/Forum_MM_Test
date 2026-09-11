/* Mythic Meridian — liens PNJ V1/V2. Aucune dépendance. */
(function(){
 'use strict';
 if(window.mmPnjLinksLoaded)return;window.mmPnjLinksLoaded=true;
 var selector='.mm-pnj[fiche_name],.mm-pnj2[fiche_name]',cache=new Map(),panel,inside,opener,request=0,controller,leaveTimer,closeTimer;
 function text(el){if(!el)return '';var copy=el.cloneNode(true);copy.querySelectorAll('script,style,iframe,object').forEach(function(n){n.remove();});copy.querySelectorAll('p,div,br,b,li').forEach(function(n){n.append(document.createTextNode(' '));});return(copy.textContent||'').replace(/\s+/g,' ').trim();}
 function find(doc,name){return Array.from(doc.querySelectorAll(selector)).find(function(el){return el.getAttribute('fiche_name')===name;});}
 function target(raw){
  raw=(raw||'').trim();if(!raw)throw Error('Ce lien ne contient pas de destination.');
  var u=new URL(raw,location.href),name;
  if(!/^https?:$/.test(u.protocol)||u.origin!==location.origin)throw Error('Les mini-fiches doivent être sur ce même forum.');
  if(u.hash){name=decodeURIComponent(u.hash.slice(1)).replace(/^mm-pnj-/, '');u.hash='';}
  else {var slash=u.pathname.lastIndexOf('/');name=decodeURIComponent(u.pathname.slice(slash+1));u.pathname=u.pathname.slice(0,slash)||'/';}
  if(!name||name.length>120)throw Error('Le nom de la fiche est manquant ou invalide.');
  return {url:u,name:name};
 }
 function create(tag,cls,value){var e=document.createElement(tag);if(cls)e.className=cls;if(value)e.textContent=value;return e;}
 function status(message){inside.replaceChildren();var close=create('button','mm-pnj-close','×');close.type='button';close.setAttribute('aria-label','Réduire la mini-fiche');close.onclick=function(){hide(true);};inside.append(close,create('p','mm-pnj-status',message));}
 function hide(focus){clearTimeout(leaveTimer);request++;if(controller)controller.abort();if(!panel)return;panel.classList.remove('mm-pnj-mini-open');if(opener)opener.setAttribute('aria-expanded','false');if(focus&&opener&&opener.isConnected)opener.focus();clearTimeout(closeTimer);closeTimer=setTimeout(function(){panel.hidden=true;},220);}
 function leave(e){if(panel&&(panel.contains(e.relatedTarget)||opener&&opener.contains(e.relatedTarget)))return;clearTimeout(leaveTimer);leaveTimer=setTimeout(function(){hide(false);},160);}
 function position(){if(!panel||panel.hidden||!opener)return;var card=opener.closest('.mm-pnj2'),r=card.getBoundingClientRect(),a=opener.getBoundingClientRect(),width=Math.min(370,r.width-24,window.innerWidth-24);panel.style.width=width+'px';panel.style.left=Math.max(11,Math.min(a.left-r.left,r.width-width-13))+'px';panel.style.top=(a.bottom-r.top+7)+'px';panel.style.setProperty('--pnj-pointer',Math.max(18,Math.min(width-18,a.left-r.left+a.width/2-parseFloat(panel.style.left)))+'px');}
 function ensurePanel(){
  if(panel)return;
  panel=create('div','mm-pnj-mini');panel.id='mm-pnj-preview';panel.hidden=true;panel.tabIndex=-1;panel.setAttribute('role','region');panel.setAttribute('aria-label','Aperçu du personnage');
  inside=create('div','mm-pnj-mini-inner');inside.setAttribute('aria-live','polite');panel.append(inside);
  panel.addEventListener('mouseenter',function(){clearTimeout(leaveTimer);});panel.addEventListener('mouseleave',leave);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)hide(true);});
  document.addEventListener('pointerdown',function(e){if(!panel.hidden&&!panel.contains(e.target)&&opener&&!opener.contains(e.target))hide(false);});
  document.addEventListener('focusin',function(e){if(!panel.hidden&&!panel.contains(e.target)&&opener&&!opener.contains(e.target))hide(false);});
  window.addEventListener('resize',position);
 }
 async function show(link,keyboard){
  ensurePanel();if(opener===link&&!panel.hidden&&panel.classList.contains('mm-pnj-mini-open')){hide(false);return;}
  clearTimeout(leaveTimer);clearTimeout(closeTimer);if(opener)opener.setAttribute('aria-expanded','false');opener=link;opener.setAttribute('aria-expanded','true');var token=++request;if(controller)controller.abort();controller=new AbortController();var signal=controller.signal;
  link.closest('.mm-pnj2').append(panel);panel.hidden=false;panel.classList.remove('mm-pnj-mini-open');status('Chargement de la fiche…');position();requestAnimationFrame(function(){if(token===request)panel.classList.add('mm-pnj-mini-open');});if(keyboard)panel.focus();
  var timer=setTimeout(function(){if(token===request)controller.abort();},12000);
  try{
   var dest=target(link.getAttribute('data_lien')||link.getAttribute('data-lien')),page=dest.url.href,current=new URL(location.href);current.hash='';
   var doc=page===current.href?document:cache.get(page);
   if(!doc){
    var response=await fetch(page,{credentials:'same-origin',signal:signal,redirect:'error'});
    if(!response.ok)throw Error('La page de cette fiche est inaccessible ('+response.status+').');
    var html=await response.text();
    // Template inert : aucun script, iframe ou image de la page distante n’est exécuté/chargé.
    var template=document.createElement('template');template.innerHTML=html;doc=template.content;
    if(cache.size>=20)cache.delete(cache.keys().next().value);cache.set(page,doc);
   }
   if(token!==request)return;
   var card=find(doc,dest.name);if(!card)throw Error('Fiche « '+dest.name+' » introuvable. Vérifiez fiche_name et la page du message.');
   var v2=card.classList.contains('mm-pnj2'),name=text(card.querySelector(v2?':scope>div>strong':'header strong'))||dest.name;
   var bio=card.querySelector(v2?'bio':'section'),summary=text(bio),role=text(card.querySelector(v2?':scope>div>small':'header small'));
   if(summary.length>520)summary=summary.slice(0,517).replace(/\s+\S*$/,'')+'…';
   status('');inside.querySelector('.mm-pnj-status').remove();
   var original=card.querySelector(':scope>img');
   if(original){var src=new URL(original.getAttribute('src'),page);if(/^https?:$/.test(src.protocol)){var img=create('img');img.src=src.href;img.alt=name;img.addEventListener('error',function(){img.remove();},{once:true});inside.append(img);}}
   var content=create('div');content.append(create('h3','',name));if(role)content.append(create('p','',role));content.append(create('p','',summary||'Aucun résumé renseigné.'));
   var more=create('a','','Voir la fiche complète');more.href=page+'#mm-pnj-'+encodeURIComponent(dest.name);more.addEventListener('click',function(){hide(false);});content.append(more);inside.append(content);position();
  }catch(error){if(token===request)status(error.name==='AbortError'?'La page met trop de temps à répondre. Réessayez.':error.message);}
  finally{clearTimeout(timer);}
 }
 function init(){
  document.querySelectorAll(selector).forEach(function(card){if(!card.id)card.id='mm-pnj-'+card.getAttribute('fiche_name');});
  document.querySelectorAll('.mm-pnj2 bio').forEach(function(bio){if(!bio.hasAttribute('tabindex')){bio.tabIndex=0;bio.setAttribute('role','region');bio.setAttribute('aria-label','Biographie, zone défilante');}});
  document.querySelectorAll('.mm-pnj2>liens').forEach(function(group){if(group.querySelector(':scope>lien')&&!group.hasAttribute('data-mm-has-links'))group.setAttribute('data-mm-has-links','');});
  document.querySelectorAll('.mm-pnj2 lien[data_lien],.mm-pnj2 lien[data-lien]').forEach(function(link){if(link.dataset.mmReady)return;link.dataset.mmReady='1';link.tabIndex=0;link.setAttribute('role','button');link.setAttribute('aria-expanded','false');link.setAttribute('aria-controls','mm-pnj-preview');link.title='Déplier l’image et le résumé du personnage';link.addEventListener('click',function(){show(link,false);});link.addEventListener('mouseenter',function(){if(opener===link)clearTimeout(leaveTimer);});link.addEventListener('mouseleave',function(e){if(opener===link)leave(e);});link.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();show(link,true);}});});
 }
 function start(){init();if(location.hash.indexOf('#mm-pnj-')===0){var anchor=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(anchor)anchor.scrollIntoView({block:'center'});}var queued=false;new MutationObserver(function(records){if(queued||!records.some(function(r){return Array.from(r.addedNodes).some(function(n){return n.nodeType===1&&(n.matches('.mm-pnj,.mm-pnj2,liens,lien')||n.querySelector('.mm-pnj,.mm-pnj2,liens,lien'));});}))return;queued=true;queueMicrotask(function(){queued=false;init();});}).observe(document.body,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
