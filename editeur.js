/* MM — Atelier de rédaction v1. Forum test, 2026-09-08.
 * Native Forumactif / SCEditor submission is preserved. No remote draft storage.
 */
(function () {
  'use strict';
  if (window.mmWriterStarted) return; window.mmWriterStarted = true;
  var PREFIX = 'mm-writer-v1:', context = null, stack = [], toastTimer, previousOverflow;
  var pageId = uid(), lastWriteTime = 0;
  function uid() { return Date.now().toString(36) + '-' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)); }
  function node(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function button(text, fn, cls) { var e = node('button', 'mm-writer-button' + (cls ? ' ' + cls : ''), text); e.type = 'button'; e.addEventListener('click', fn); return e; }
  function input(label, value, multiline) { var wrap = node('label', '', label), field = node(multiline ? 'textarea' : 'input'); if (!multiline) field.type = 'text'; field.value = value || ''; wrap.appendChild(field); return { wrap: wrap, field: field }; }
  function escapeHTML(text) { return text.replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function time(stamp) { return new Date(stamp).toLocaleString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); }
  function notify(text) { var e = document.getElementById('mm-writer-toast'); if (!e) { e = node('div', 'mm-writer-toast'); e.id = 'mm-writer-toast'; e.setAttribute('role', 'status'); document.body.appendChild(e); } e.textContent = text; clearTimeout(toastTimer); toastTimer = setTimeout(function () { e.remove(); }, 5000); }
  function readRecord(id) { try { var r = JSON.parse(localStorage.getItem(PREFIX + id)); return r && r.v === 1 && r.id === id && typeof r.text === 'string' ? r : null; } catch (e) { return null; } }
  function records(kind) {
    var result = [];
    try { for (var i = 0; i < localStorage.length; i++) { var key = localStorage.key(i); if (key && key.indexOf(PREFIX) === 0) { var r = readRecord(key.slice(PREFIX.length)); if (r && (!kind || r.kind === kind || (kind === 'recovery' && r.kind === 'pending'))) result.push(r); } } } catch (e) { /* Writes report storage errors explicitly. */ }
    return result.sort(function (a, b) { return b.updated - a.updated; });
  }
  function writeRecord(record) {
    record.v = 1;
    var previous=readRecord(record.id);
    record.updated=Math.max(Date.now(),lastWriteTime+1,previous?previous.updated+1:0);
    lastWriteTime=record.updated;
    var encoded = JSON.stringify(record);
    localStorage.setItem(PREFIX + record.id, encoded);
    if (localStorage.getItem(PREFIX + record.id) !== encoded) throw new Error('La copie locale n’a pas pu être vérifiée.');
    return record;
  }
  function removeRecord(id) { localStorage.removeItem(PREFIX + id); if (localStorage.getItem(PREFIX + id) !== null) throw new Error('La suppression n’a pas pu être enregistrée.'); }
  function storageMessage() { return 'Le navigateur ne peut pas enregistrer cette copie. Votre texte reste dans l’éditeur. Exportez-le avant de quitter la page.'; }
  function download(text, name, mime) { var url = URL.createObjectURL(new Blob([text], { type:mime || 'text/plain;charset=utf-8' })), a = node('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 10000); }
  function exportAll() { download(JSON.stringify({ format:'mm-writer', version:1, forum:location.hostname, exported:new Date().toISOString(), records:records() }, null, 2), 'atelier-' + new Date().toISOString().slice(0,10) + '.json', 'application/json'); }
  function copyText(text) { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { notify('Texte copié.'); }, function () { download(text, 'texte.txt'); }); download(text, 'texte.txt'); }
  function modal(title, subtitle, compact) {
    var opener = document.activeElement, overlay = node('div','mm-writer-overlay'), panel = node('section','mm-writer-dialog' + (compact ? ' mm-compact' : ''));
    var heading = node('h2','',title), headingId = 'mw-title-' + uid(), header = node('header'), headingWrap = node('div'), content = node('div','mm-dialog-content'), footer = node('footer');
    heading.id = headingId; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true'); panel.setAttribute('aria-labelledby',headingId); panel.tabIndex = -1;
    headingWrap.appendChild(heading); if (subtitle) headingWrap.appendChild(node('p','',subtitle)); header.appendChild(headingWrap);
    var api = { overlay:overlay, panel:panel, content:content, footer:footer, close:close, requestClose:close };
    var x = button('×',function () { api.requestClose(); }); x.className='mm-close'; x.setAttribute('aria-label','Fermer'); header.appendChild(x);
    panel.appendChild(header); panel.appendChild(content); panel.appendChild(footer); overlay.appendChild(panel);
    if (!stack.length) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    if (stack.length) stack[stack.length-1].panel.inert = true;
    stack.push(api); document.body.appendChild(overlay); panel.focus();
    overlay.addEventListener('click',function (e) { if (e.target === overlay) api.requestClose(); });
    function close() { var at=stack.indexOf(api); if(at<0)return; stack.splice(at,1); overlay.remove(); if(stack.length){stack[stack.length-1].panel.inert=false;stack[stack.length-1].panel.focus();}else{document.body.style.overflow=previousOverflow;if(opener&&opener.isConnected)opener.focus();} }
    return api;
  }
  function confirmAction(title, text, label, action, danger) {
    var d=modal(title,'',true); d.content.appendChild(node('p','',text)); d.footer.appendChild(button('Annuler',d.close)); d.footer.appendChild(button(label,function(){d.close();action();},danger?'mm-danger':'mm-primary'));
  }
  document.addEventListener('keydown',function(e){
    if(!stack.length)return; var d=stack[stack.length-1];
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();d.requestClose();return;}
    if(e.key==='Tab'){var list=Array.prototype.filter.call(d.panel.querySelectorAll('button,input,textarea,select,a[href],[tabindex="0"]'),function(el){return !el.disabled&&el.getClientRects().length;});if(!list.length){e.preventDefault();return;}var first=list[0],last=list[list.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===d.panel)){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===d.panel)){e.preventDefault();first.focus();}}
  },true);

  function safeTarget(raw) {
    try { var url = new URL(raw,location.origin); if(url.origin!==location.origin||url.pathname!=='/post')return ''; var params=new URLSearchParams(), mode=url.searchParams.get('mode'); if(!/^(reply|newtopic|editpost)$/.test(mode||''))return ''; params.set('mode',mode);['t','f','p'].forEach(function(k){var v=url.searchParams.get(k);if(/^\d+$/.test(v||''))params.set(k,v);});return '/post?'+params.toString(); } catch(e){return '';}
  }
  function currentTarget(form) {
    var url=new URL(location.href), query=new URLSearchParams();
    ['mode','t','f','p'].forEach(function(k){var f=form.querySelector('[name="'+k+'"]'),v=f&&f.value||url.searchParams.get(k);if(v)query.set(k,v);});
    if(!query.has('t')){var topic=location.pathname.match(/^\/t(\d+)/);if(topic)query.set('t',topic[1]);}
    if(!query.has('mode')&&query.has('t'))query.set('mode','reply');
    var target=safeTarget('/post?'+query.toString()); return {url:target,key:target||location.pathname,title:(document.querySelector('h1')||document.querySelector('.page-title')||document).textContent.slice(0,150)};
  }
  function newRecord(kind, text, subject) {var now=Date.now();return {v:1,id:kind+'-'+uid(),kind:kind,name:'',text:text||'',subject:subject||'',created:now,updated:now,context:context?context.target:null};}
  function loadRecord(record) {
    if(!context){var target=record.context&&safeTarget(record.context.url);if(target){try{sessionStorage.setItem(PREFIX+'load',record.id);location.href=target;}catch(e){notify('Ouvrez une page de rédaction, puis chargez ce brouillon.');}}else{copyText(record.text);}return;}
    function apply(){
      try{if(context.getText()||context.subject()){var old=context.snapshot('recovery-'+uid());old.name='Avant le chargement de « '+record.name+' »';writeRecord(old);}}catch(e){notify(storageMessage());return;}
      context.setText(record.text);context.setSubject(record.subject||'');context.chain=record.kind==='recovery'||record.kind==='pending'?(record.chain||uid()):uid();context.links={};if(record.kind==='draft')context.links[record.id]=record.updated;else if(record.links)context.links=Object.assign({},record.links);
      context.save();notify('Brouillon chargé. Le texte est prêt à être modifié.');
    }
    if((context.getText()||context.subject())&&(context.getText()!==record.text||context.subject()!==(record.subject||'')))confirmAction('Remplacer le texte en cours ?','Le texte actuel sera conservé dans Récupération avant le chargement du brouillon.','Charger le brouillon',apply);else apply();
  }

  function manager(kind, initial) {
    if(context)context.rememberSelection();
    var d=modal('Votre atelier','Vos textes, vos raccourcis. À portée de main.'),tabs=node('div','mm-writer-tabs'),active=kind||'draft',selected=null,dirty=false;
    tabs.setAttribute('role','tablist');d.panel.insertBefore(tabs,d.content);
    var library=node('div','mm-library'),side=node('div','mm-library-sidebar'),top=node('div','mm-library-top'),search=node('input'),list=node('div','mm-library-list'),detail=node('div','mm-library-detail');
    search.type='search';search.placeholder='Rechercher…';search.setAttribute('aria-label','Rechercher dans l’atelier');top.appendChild(search);
    var add=button('+',function(){changeTo(function(){edit(newRecord(active==='fragment'?'fragment':'draft','',''),true);});});add.setAttribute('aria-label','Créer un élément');top.appendChild(add);side.appendChild(top);side.appendChild(list);library.appendChild(side);library.appendChild(detail);d.content.appendChild(library);
    d.footer.appendChild(node('span','mm-local-note','Enregistrés dans ce navigateur, pour ce forum. Exportez une copie pour les conserver ailleurs.'));d.footer.appendChild(button('Exporter mes textes',exportAll));
    var purge=button('Purger les copies temporaires',function(){
      changeTo(function(){var copies=records('recovery');if(!copies.length){notify('Aucune copie temporaire à supprimer.');return;}
        confirmAction('Purger les copies temporaires ?',copies.length+' copie(s) de récupération seront supprimées. Vos brouillons enregistrés et vos fragments seront conservés.','Purger les copies',function(){
          try{copies.forEach(function(r){var current=readRecord(r.id);if(current&&current.updated===r.updated&&(current.kind==='recovery'||current.kind==='pending'))removeRecord(r.id);});selected=null;dirty=false;render();empty();notify('Copies temporaires supprimées.');}catch(e){notify('Certaines copies n’ont pas pu être supprimées.');}
        },true);
      });
    },'mm-danger');d.footer.appendChild(purge);
    var tabDefs=[['draft','Brouillons'],['fragment','Fragments'],['recovery','Récupération']];
    tabDefs.forEach(function(def){var b=button(def[1],function(){changeTo(function(){active=def[0];selected=null;search.value='';render();empty();});});b.setAttribute('role','tab');b.dataset.kind=def[0];tabs.appendChild(b);});
    function changeTo(action){if(!dirty)return action();confirmAction('Modifications non enregistrées','Continuer sans enregistrer les changements de cet élément ?','Continuer sans enregistrer',function(){dirty=false;action();});}
    d.requestClose=function(){changeTo(d.close);};
    function empty(){detail.replaceChildren();var box=node('div','mm-library-empty');box.appendChild(node('strong','',active==='fragment'?'Un raccourci, tout un texte.':'Vos mots restent ici.'));box.appendChild(node('p','',active==='fragment'?'Enregistrez un fragment, puis tapez son raccourci suivi de Ctrl + Espace dans l’éditeur.':'Choisissez un texte dans la liste ou créez un brouillon.'));detail.appendChild(box);}
    function render(){
      purge.hidden=active!=='recovery';purge.style.display=active==='recovery'?'':'none';
      Array.prototype.forEach.call(tabs.children,function(b){b.setAttribute('aria-selected',b.dataset.kind===active?'true':'false');});
      list.replaceChildren();var q=search.value.toLocaleLowerCase('fr'),items=records(active).filter(function(r){return [r.name,r.shortcut||'',r.text].join(' ').toLocaleLowerCase('fr').indexOf(q)>=0;});
      if(!items.length)list.appendChild(node('div','mm-library-empty',q?'Aucun résultat.':active==='recovery'?'Aucune copie de récupération.':'Votre bibliothèque est vide.'));
      items.forEach(function(r){var b=node('button','mm-library-item');b.type='button';b.setAttribute('aria-current',selected&&selected.id===r.id?'true':'false');b.appendChild(node('strong','',r.shortcut?r.shortcut+' · '+r.name:r.name));b.appendChild(node('small','',time(r.updated)+(r.kind==='pending'?' · copie d’envoi':'')));b.appendChild(node('small','',r.text.replace(/\s+/g,' ').slice(0,72)));b.addEventListener('click',function(){changeTo(function(){edit(r,false);});});list.appendChild(b);});
    }
    function edit(record,isNew){
      selected=record;dirty=isNew;detail.replaceChildren();
      var name=input('Nom',record.name),shortcut=active==='fragment'?input('Raccourci (ex. #texte1)',record.shortcut||'#'):null,subject=active!=='fragment'?input('Titre du sujet (facultatif)',record.subject):null,body=input('Texte',record.text,true),error=node('p','mm-dialog-error'),actions=node('div','mm-detail-actions');
      name.field.maxLength=100;detail.appendChild(name.wrap);if(shortcut){shortcut.field.maxLength=41;detail.appendChild(shortcut.wrap);}if(subject)detail.appendChild(subject.wrap);detail.appendChild(body.wrap);
      detail.appendChild(node('p','mm-detail-meta',record.context&&record.context.title?record.context.title:'Texte local · aucun envoi automatique'));detail.appendChild(error);detail.appendChild(actions);
      [name,shortcut,subject,body].filter(Boolean).forEach(function(f){f.field.addEventListener('input',function(){dirty=true;error.textContent='';});});
      function save(){
        if(!name.field.value.trim()){error.textContent='Donnez un nom à ce texte.';name.field.focus();return null;}
        var code=shortcut&&shortcut.field.value.trim();
        if(shortcut&&!/^#[a-zA-Z0-9_-]{1,40}$/.test(code)){error.textContent='Utilisez # puis des lettres, chiffres, tirets ou _.';shortcut.field.focus();return null;}
        if(shortcut&&records('fragment').some(function(r){return r.id!==record.id&&r.shortcut.toLowerCase()===code.toLowerCase();})){error.textContent='Ce raccourci existe déjà. Choisissez-en un autre.';return null;}
        var saved=Object.assign({},record,{name:name.field.value.trim(),text:body.field.value,subject:subject?subject.field.value:'',updated:Date.now()});
        if(shortcut)saved.shortcut=code;
        if(record.kind==='recovery'||record.kind==='pending'){saved.id='draft-'+uid();saved.kind='draft';saved.created=Date.now();}
        var existing=readRecord(saved.id);
        if(existing&&existing.updated!==record.updated&&!isNew){error.textContent='Ce texte a changé dans un autre onglet. Enregistrez une nouvelle copie pour conserver vos changements.';return null;}
        try{writeRecord(saved);}catch(e){error.textContent=storageMessage();return null;}
        if(context&&saved.kind==='draft'&&saved.text===context.getText()&&saved.subject===context.subject()){context.links[saved.id]=saved.updated;context.save();}
        dirty=false;isNew=false;record=saved;selected=saved;active=saved.kind==='fragment'?'fragment':'draft';edit(saved,false);notify('« '+saved.name+' » enregistré.');return saved;
      }
      actions.appendChild(button(record.kind==='recovery'||record.kind==='pending'?'Enregistrer comme brouillon':'Enregistrer',save,'mm-primary'));
      if(!isNew){
        actions.appendChild(button(active==='fragment'?(context?'Insérer':'Copier'):(context||record.context&&safeTarget(record.context.url)?'Charger':'Copier'),function(){var r=dirty?save():record;if(!r)return;d.close();if(r.kind==='fragment'){if(context)context.insertFragment(r.text);else copyText(r.text);}else loadRecord(r);}));
        actions.appendChild(button('Nouvelle copie',function(){var clone=Object.assign({},record,{id:(active==='fragment'?'fragment':'draft')+'-'+uid(),kind:active==='fragment'?'fragment':'draft',name:(name.field.value||record.name)+' — copie',text:body.field.value,subject:subject?subject.field.value:'',created:Date.now(),updated:Date.now()});if(shortcut)clone.shortcut=shortcut.field.value.slice(0,34)+'-copie';edit(clone,true);}));
        actions.appendChild(button('Supprimer',function(){confirmAction('Supprimer ce texte ?','« '+record.name+' » sera supprimé de ce navigateur.','Supprimer',function(){try{removeRecord(record.id);dirty=false;selected=null;render();empty();}catch(e){error.textContent='La suppression a échoué. Le texte a été conservé.';}},true);},'mm-danger'));
      }
      actions.appendChild(button('Télécharger',function(){download(body.field.value,(name.field.value||'texte').replace(/[^a-zA-Z0-9à-ÿ_-]/g,'-')+'.txt');}));
      render();name.field.focus();
    }
    search.addEventListener('input',render);render();if(initial)edit(initial,true);else empty();
  }

  function bindEditor(original,box,api){
    var form=original.form;if(!form||form.classList.contains('mm-compose'))return;
    form.classList.add('mm-compose');document.documentElement.classList.add('mm-writer-enabled');
    var source=box.querySelector('textarea'),frame=box.querySelector('iframe'),subjectField=form.querySelector('input[name="subject"]');
    if(!source||!frame)return;
    var target=currentTarget(form),recoveryId='recovery-'+uid(),saveTimer,renderFrame,lastSaved='',selection=null,frameDoc=null,highlight=true,lastPaint=null;
    var message=form.querySelector('#message-box'),smileys=form.querySelector('#smiley-box');
    // Moving an existing iframe or its ancestors reloads its document. Keep both
    // native blocks in place and lay them out through their current parent.
    if(message&&smileys&&message.parentNode===smileys.parentNode){var layout=message.parentNode;layout.classList.add('mm-editor-layout');var preceding=Array.prototype.filter.call(layout.children,function(el){return el.tagName==='DL'&&getComputedStyle(el).display!=='none';}).length;layout.style.setProperty('--mm-editor-row',String(preceding+1));}
    if(smileys){var smileyFrame=smileys.querySelector('iframe');if(smileyFrame){var decorateSmileys=function(){try{var doc=smileyFrame.contentDocument;if(!doc||!doc.head||doc.getElementById('mm-smiley-style'))return;var style=node('style');style.id='mm-smiley-style';style.textContent='html,html body#sce_smilies_body{box-sizing:border-box;width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;padding:2px!important;background:#0d192a!important;color:#c3d7e8!important;font:12px/1.5 Calibri,Arial,sans-serif!important}select{box-sizing:border-box;max-width:100%!important;width:100%!important;padding:7px 3px!important;border:1px solid #68879e80!important;border-radius:4px;background:#15293d!important;color:#d6e6f3!important;font:11px Calibri,Arial,sans-serif!important}a{color:#bddaf0!important}#sce_smilies_body .smiley-element{display:flex;flex-wrap:wrap;align-items:center;gap:7px;padding:7px 2px!important;font-size:0}#sce_smilies_body .smiley-element img{margin:0!important;max-width:100%;height:auto}';doc.head.appendChild(style);}catch(e){}};smileyFrame.addEventListener('load',decorateSmileys);decorateSmileys();}}
    var head=node('div','mm-composer-head'),heading=node('div','mm-composer-heading');heading.appendChild(node('small','','Mythic Meridian'));heading.appendChild(node('span','','Atelier de rédaction'));head.appendChild(heading);
    var tools=node('div','mm-tools');head.appendChild(tools);box.parentNode.insertBefore(head,original);
    tools.appendChild(button('Enregistrer un brouillon',function(){var r=newRecord('draft',getText(),subject());r.name=subject()||'Brouillon du '+time(Date.now());manager('draft',r);},'mm-primary'));
    tools.appendChild(button('Mes brouillons',function(){manager('draft');}));
    var fragmentsButton=button('Fragments',function(){manager('fragment');});
    var fragmentsHelp='Tapez le raccourci d’un fragment (ex. #texte1), puis Ctrl + Espace juste après pour le remplacer par le texte enregistré. Cliquez ici pour gérer vos fragments.';
    fragmentsButton.title=fragmentsHelp;fragmentsButton.setAttribute('aria-description',fragmentsHelp);tools.appendChild(fragmentsButton);
    var meta=node('div','mm-composer-meta'),state=node('span','mm-save-state','Votre texte est prêt à être rédigé.');state.setAttribute('role','status');state.setAttribute('aria-live','polite');meta.appendChild(state);
    var toggle=node('button','','Balises colorées');toggle.type='button';toggle.setAttribute('aria-pressed','true');meta.appendChild(toggle);box.parentNode.insertBefore(meta,box.nextSibling);
    var underlay=node('div','mm-source-highlight'),paint=node('pre');underlay.setAttribute('aria-hidden','true');underlay.appendChild(paint);box.appendChild(underlay);box.classList.add('mm-highlight-on');source.setAttribute('aria-label','Texte du message');
    source.setAttribute('spellcheck','true');
    var send=form.querySelector('input[name="post"][type="submit"],button[name="post"]'),preview=form.querySelector('input[name="preview"][type="submit"]');
    if(send&&preview&&send.parentNode===preview.parentNode)send.parentNode.classList.add('mm-submit-actions');
    // Native sprites, labels and command handlers remain in place.
    Array.prototype.forEach.call(box.querySelectorAll('[data-sceditor-command]'),function(el){el.setAttribute('aria-label',el.title);el.setAttribute('role','button');el.tabIndex=0;el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});

    function isBase(){return document.documentElement.getAttribute('data-mm-theme')==='base';}
    function inSource(){return api.inSourceMode();}
    function getText(){return inSource()?source.value:api.val();}
    function subject(){return subjectField?subjectField.value:'';}
    function emit(){source.dispatchEvent(new Event('input',{bubbles:true}));original.dispatchEvent(new Event('input',{bubbles:true}));changed();}
    function setText(text){if(!inSource())api.sourceMode(true);source.value=text;original.value=text;source.setSelectionRange(text.length,text.length);source.focus();emit();}
    function snapshot(id){var now=Date.now();return {v:1,id:id||recoveryId,kind:'recovery',name:subject()||'Rédaction — '+time(now),text:getText(),subject:subject(),context:target,links:Object.assign({},context.links),created:now,updated:now,page:pageId,chain:context.chain};}
    function save(force){
      clearTimeout(saveTimer);var text=getText(),title=subject(),value=JSON.stringify([text,title,context.links]);if(!force&&(!text&&!title||value===lastSaved))return true;
      try{var copy=snapshot();writeRecord(copy);lastSaved=value;state.classList.remove('mm-error');state.textContent='Brouillon sauvegardé à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});return true;}
      catch(e){state.classList.add('mm-error');state.textContent='Sauvegarde du brouillon impossible — exportez votre texte';return false;}
    }
    function tokenHTML(text){var re=/<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|\[\/?[a-zA-Z][^\]\r\n]*\]|\[\*\]/g,at=0,result='',m;while((m=re.exec(text))){result+=escapeHTML(text.slice(at,m.index));var cls=m[0].indexOf('<!--')===0?'comment':m[0][0]==='['?'bb':'html';var token=escapeHTML(m[0]);if(cls!=='comment')token=token.replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g,'<span class="mm-token-value">$1</span>');result+='<span class="mm-token-'+cls+'">'+token+'</span>';at=re.lastIndex;}return result+escapeHTML(text.slice(at))+'\u200b';}
    function paintSource(){
      renderFrame=null;var active=inSource();toggle.disabled=!active;toggle.textContent=active?'Balises colorées':'Mode visuel';
      if(!active||!highlight||isBase())return;var css=getComputedStyle(source);underlay.style.left=source.offsetLeft+'px';underlay.style.top=source.offsetTop+'px';underlay.style.width=source.clientWidth+'px';underlay.style.height=source.clientHeight+'px';
      ['fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','wordSpacing','paddingTop','paddingRight','paddingBottom','paddingLeft','tabSize','textAlign','direction'].forEach(function(prop){paint.style[prop]=css[prop];});paint.style.width=source.clientWidth+'px';
      if(lastPaint!==source.value){paint.innerHTML=tokenHTML(source.value);lastPaint=source.value;}
      paint.style.transform='translate('+(-source.scrollLeft)+'px,'+(-source.scrollTop)+'px)';
    }
    function requestPaint(){if(!renderFrame)renderFrame=requestAnimationFrame(paintSource);}
    function changed(){requestPaint();clearTimeout(saveTimer);saveTimer=setTimeout(function(){save(false);},550);}
    function rememberSelection(){if(inSource())selection={source:true,start:source.selectionStart,end:source.selectionEnd};else{var sel=frame.contentWindow.getSelection();if(sel&&sel.rangeCount)selection={source:false,range:sel.getRangeAt(0).cloneRange()};}}
    function insertSource(text,start,end){source.focus();source.setSelectionRange(start,end);var ok=false;try{ok=document.execCommand('insertText',false,text);}catch(e){}if(!ok){source.setRangeText(text,start,end,'end');}emit();}
    function insertFragment(text){
      if(inSource()){var s=selection&&selection.source?selection:{start:source.selectionStart,end:source.selectionEnd};insertSource(text,s.start,s.end);}
      else{api.focus();if(selection&&!selection.source&&selection.range&&selection.range.startContainer.isConnected){var sel=frame.contentWindow.getSelection();sel.removeAllRanges();sel.addRange(selection.range);}api.insert(text,null,true,true,true);changed();}
      rememberSelection();notify('Fragment inséré.');
    }
    function expand(e){
      if(!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey||e.isComposing||!(e.code==='Space'||e.key===' '||e.keyCode===32))return;
      var match,start,end,range,sel;
      if(inSource()){if(source.selectionStart!==source.selectionEnd)return;end=source.selectionStart;match=source.value.slice(0,end).match(/#[a-zA-Z0-9_-]+$/);if(match)start=end-match[0].length;}
      else{sel=frame.contentWindow.getSelection();if(!sel||!sel.isCollapsed||!sel.rangeCount)return;range=sel.getRangeAt(0);if(range.startContainer.nodeType===3)match=range.startContainer.textContent.slice(0,range.startOffset).match(/#[a-zA-Z0-9_-]+$/);}
      e.preventDefault();e.stopPropagation();if(!match){notify('Placez le curseur juste après un raccourci, par exemple #texte1.');return;}
      var fragment=records('fragment').find(function(r){return r.shortcut&&r.shortcut.toLowerCase()===match[0].toLowerCase();});if(!fragment){notify('Aucun fragment pour '+match[0]+'. Créez-le dans Fragments.');return;}
      if(inSource())insertSource(fragment.text,start,end);else{range.setStart(range.startContainer,range.startOffset-match[0].length);sel.removeAllRanges();sel.addRange(range);api.insert(fragment.text,null,true,true,true);changed();}rememberSelection();
    }
    function styleFrame(){try{var doc=frame.contentDocument;if(!doc||!doc.body||frameDoc===doc)return;frameDoc=doc;var style=node('style');style.id='mm-visual-style';style.textContent='html,body{background:#0a0d20!important;color:#e0d8d3!important}body{margin:0!important;padding:18px!important;box-sizing:border-box;font:14px/1.65 Calibri,Arial,sans-serif!important;overflow-wrap:break-word}a{color:#9fd7f4!important}blockquote{border-left:2px solid #8db3cb;padding-left:12px;color:#c4d7e7}code{color:#c3ddeb;background:#142c40}::selection{background:#365c7b;color:#fff}';doc.head.appendChild(style);doc.body.setAttribute('aria-label','Texte du message en mode visuel');doc.addEventListener('input',changed);doc.addEventListener('keyup',changed);doc.addEventListener('keydown',expand,true);doc.addEventListener('selectionchange',rememberSelection);new MutationObserver(changed).observe(doc.body,{childList:true,characterData:true,subtree:true});}catch(e){/* SCEditor handles frame creation. */}}
    context={original:original,form:form,target:target,chain:pageId,links:{},getText:getText,subject:subject,setSubject:function(v){if(subjectField)subjectField.value=v;},setText:setText,save:save,snapshot:snapshot,rememberSelection:rememberSelection,insertFragment:insertFragment,recoveryId:recoveryId};
    // A native preview creates a new document. Carry draft associations forward
    // only when the server returned the exact same text, title and destination.
    var matchingCopy=records('recovery').find(function(r){return r.context&&r.context.key===target.key&&(r.text===getText()||r.text===original.defaultValue)&&(r.subject||'')===subject();});
    if(matchingCopy){context.chain=matchingCopy.chain||matchingCopy.page||pageId;context.links=Object.assign({},matchingCopy.links);if(inSource()&&matchingCopy.text===original.defaultValue&&source.value!==matchingCopy.text){source.value=matchingCopy.text;original.value=matchingCopy.text;emit();}}
    source.addEventListener('input',changed);source.addEventListener('keyup',changed);source.addEventListener('keydown',expand,true);source.addEventListener('scroll',requestPaint,{passive:true});source.addEventListener('select',rememberSelection);source.addEventListener('blur',function(){rememberSelection();save(false);});
    // SCEditor's source commands may assign textarea.value without an input
    // event. Observe only the focused editor, before the next screen paint.
    var sourceWatch=0,observedSource=source.value;
    function watchSource(){sourceWatch=0;if(!source.isConnected||document.activeElement!==source)return;if(source.value!==observedSource){observedSource=source.value;changed();}sourceWatch=requestAnimationFrame(watchSource);}
    source.addEventListener('focus',function(){requestPaint();if(!sourceWatch)sourceWatch=requestAnimationFrame(watchSource);});
    source.addEventListener('blur',function(){if(sourceWatch)cancelAnimationFrame(sourceWatch);sourceWatch=0;});
    if(subjectField)subjectField.addEventListener('input',changed);
    api.bind('valuechanged',changed);box.addEventListener('click',function(){setTimeout(changed,0);},true);
    document.addEventListener('click',function(e){if(e.target.closest('.sceditor-dropdown'))setTimeout(changed,0);},true);
    frame.addEventListener('load',styleFrame);styleFrame();new MutationObserver(function(){styleFrame();requestPaint();}).observe(box,{attributes:true,attributeFilter:['class']});
    if(window.ResizeObserver)new ResizeObserver(requestPaint).observe(source);window.addEventListener('resize',requestPaint,{passive:true});
    toggle.addEventListener('click',function(){highlight=!highlight;box.classList.toggle('mm-highlight-on',highlight&&!isBase());toggle.setAttribute('aria-pressed',String(highlight));requestPaint();});
    window.addEventListener('pagehide',function(){if(getText()||subject())save(false);});document.addEventListener('visibilitychange',function(){if(document.hidden&&(getText()||subject()))save(false);});
    window.addEventListener('beforeunload',function(e){if((getText()||subject())&&!save(false)){e.preventDefault();e.returnValue='';}});
    function applyWriterTheme(){
      var base=isBase();box.classList.toggle('mm-highlight-on',highlight&&!base);toggle.hidden=base;
      [frame,smileys&&smileys.querySelector('iframe')].filter(Boolean).forEach(function(f){try{var doc=f.contentDocument;var s=doc&&doc.querySelector('#mm-visual-style,#mm-smiley-style');if(s)s.disabled=base;}catch(e){}});requestPaint();
    }
    new MutationObserver(applyWriterTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-mm-theme']});
    frame.addEventListener('load',applyWriterTheme);if(smileys&&smileys.querySelector('iframe'))smileys.querySelector('iframe').addEventListener('load',applyWriterTheme);applyWriterTheme();
    protectSubmission(context,send,preview);
    var pendingLoad;try{pendingLoad=sessionStorage.getItem(PREFIX+'load');sessionStorage.removeItem(PREFIX+'load');}catch(e){}
    var requested=pendingLoad&&readRecord(pendingLoad);if(requested)loadRecord(requested);
    else{var older=records('recovery').find(function(r){return r.context&&r.context.key===target.key&&r.text&&r.text!==getText();});if(older){var banner=node('div','mm-recovery-banner');banner.appendChild(node('span','','Une copie du '+time(older.updated)+' est disponible pour cette rédaction. '));banner.appendChild(button('Reprendre',function(){loadRecord(older);banner.remove();}));banner.appendChild(button('Plus tard',function(){banner.remove();}));head.parentNode.insertBefore(banner,head);}}
    requestPaint();rememberSelection();if(getText()||subject())save(false);
  }

  function protectSubmission(ctx,send,preview){
    var form=ctx.form,lastSubmitter=null;
    form.addEventListener('click',function(e){var target=e.target.closest('input[type="submit"],button[type="submit"]');if(target&&target.form===form)lastSubmitter=target;},true);
    form.addEventListener('submit',function(e){
      var submitter=e.submitter||lastSubmitter||send,name=submitter&&submitter.name;
      if(name==='preview'||name!=='post'&&submitter!==send){ctx.save(true);return;}
      if(!ctx.save(true)||!prepareDelivery(ctx)){e.preventDefault();e.stopImmediatePropagation();notify('La copie de récupération ne peut pas être enregistrée. Votre texte reste dans l’éditeur : téléchargez-le depuis Mes brouillons avant de quitter.');return;}
      // Save first, then let Forumactif validate and submit its original form.
      ctx.original.value=ctx.getText();
    },true);
  }
  // Only an explicit Forumactif success receipt authorizes automatic cleanup.
  function prepareDelivery(ctx){
    var p=ctx.snapshot('pending-'+uid());p.kind='pending';p.name='Avant envoi — '+(ctx.subject()||time(Date.now()));p.needsConfirmation=true;p.temporary={};p.recoveryId=ctx.recoveryId;
    records('recovery').forEach(function(r){if((r.kind==='recovery'||r.kind==='pending')&&r.context&&r.context.key===ctx.target.key&&(r.chain===ctx.chain||r.id===ctx.recoveryId||(r.text===p.text&&(r.subject||'')===p.subject)))p.temporary[r.id]=r.updated;});
    p.recoveryVersion=(readRecord(ctx.recoveryId)||{}).updated;
    try{writeRecord(p);sessionStorage.setItem(PREFIX+'delivery',JSON.stringify({id:p.id,at:Date.now()}));return true;}catch(e){return false;}
  }
  function cleanupDelivery(p){
    Object.keys(p.temporary||{}).forEach(function(id){var r=readRecord(id);if(r&&(r.kind==='recovery'||r.kind==='pending')&&r.updated===p.temporary[id])removeRecord(id);});
    removeRecord(p.id);
  }
  function confirmedDelivery(){
    try{var receipt=JSON.parse(sessionStorage.getItem(PREFIX+'delivery')||'null');if(!receipt||Date.now()-receipt.at>600000)return;
      var success=receipt.confirmed||(/^\/post(?:\?|$)/.test(location.pathname+location.search)&&!document.querySelector('#text_editor_textarea,.post')&&/(?:Votre message a (?:bien )?été enregistré|Message enregistré avec succès)[.!]/.test((document.querySelector('#main-content')||document.body).textContent));
      if(success){var p=readRecord(receipt.id);if(p)cleanupDelivery(p);sessionStorage.removeItem(PREFIX+'delivery');}
    }catch(e){/* Keep the recovery copies whenever confirmation or cleanup fails. */}
  }
  function showPending(){confirmedDelivery();}
  function boot(){
    if(location.pathname.indexOf('/admin')===0)return;
    var original=document.querySelector('textarea#text_editor_textarea[name="message"]');
    if(original){var tries=0;function attempt(){var box=original.parentNode.querySelector('.sceditor-container'),api=window.jQuery&&window.jQuery(original).data('sceditor');if(box&&api){bindEditor(original,box,api);return;}if(++tries<80)setTimeout(attempt,250);}attempt();}
    showPending();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
