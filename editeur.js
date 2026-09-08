/* MM — Atelier de rédaction v1. Forum test, 2026-09-08.
 * Native Forumactif / SCEditor submission is preserved. No remote draft storage.
 */
(function () {
  'use strict';
  if (document.getElementById('mm-write-nav')) return;
  var PREFIX = 'mm-writer-v1:', context = null, stack = [], toastTimer, previousOverflow;
  var pageId = uid(), changing = false;
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
      context.setText(record.text);context.setSubject(record.subject||'');context.links={};if(record.kind==='draft')context.links[record.id]=record.updated;else if(record.links)context.links=Object.assign({},record.links);
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
    var tabDefs=[['draft','Brouillons'],['fragment','Fragments'],['recovery','Récupération']];
    tabDefs.forEach(function(def){var b=button(def[1],function(){changeTo(function(){active=def[0];selected=null;search.value='';render();empty();});});b.setAttribute('role','tab');b.dataset.kind=def[0];tabs.appendChild(b);});
    function changeTo(action){if(!dirty)return action();confirmAction('Modifications non enregistrées','Continuer sans enregistrer les changements de cet élément ?','Continuer sans enregistrer',function(){dirty=false;action();});}
    d.requestClose=function(){changeTo(d.close);};
    function empty(){detail.replaceChildren();var box=node('div','mm-library-empty');box.appendChild(node('strong','',active==='fragment'?'Un raccourci, tout un texte.':'Vos mots restent ici.'));box.appendChild(node('p','',active==='fragment'?'Enregistrez un fragment, puis tapez son raccourci suivi de Ctrl + Espace dans l’éditeur.':'Choisissez un texte dans la liste ou créez un brouillon.'));detail.appendChild(box);}
    function render(){
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
    if(smileys){var smileyFrame=smileys.querySelector('iframe');if(smileyFrame){var decorateSmileys=function(){try{var doc=smileyFrame.contentDocument;if(!doc||!doc.head||doc.getElementById('mm-smiley-style'))return;var style=node('style');style.id='mm-smiley-style';style.textContent='html,body{box-sizing:border-box;margin:0!important;padding:2px!important;background:#0d192a!important;color:#c3d7e8!important;font:12px/1.5 Calibri,Arial,sans-serif!important}select{box-sizing:border-box;max-width:100%!important;width:100%!important;padding:7px 3px!important;border:1px solid #68879e80!important;border-radius:4px;background:#15293d!important;color:#d6e6f3!important;font:11px Calibri,Arial,sans-serif!important}a{color:#bddaf0!important}';doc.head.appendChild(style);}catch(e){}};smileyFrame.addEventListener('load',decorateSmileys);decorateSmileys();}}
    var head=node('div','mm-composer-head'),heading=node('div','mm-composer-heading');heading.appendChild(node('small','','Mythic Meridian'));heading.appendChild(node('span','','Atelier de rédaction'));head.appendChild(heading);
    var tools=node('div','mm-tools');head.appendChild(tools);box.parentNode.insertBefore(head,original);
    tools.appendChild(button('Enregistrer un brouillon',function(){var r=newRecord('draft',getText(),subject());r.name=subject()||'Brouillon du '+time(Date.now());manager('draft',r);},'mm-primary'));
    tools.appendChild(button('Mes brouillons',function(){manager('draft');}));tools.appendChild(button('Fragments',function(){manager('fragment');}));
    var meta=node('div','mm-composer-meta'),state=node('span','mm-save-state','Votre texte est prêt à être rédigé.'),shortcuts=node('span');state.setAttribute('role','status');state.setAttribute('aria-live','polite');
    shortcuts.appendChild(node('span','','Fragments : '));shortcuts.appendChild(node('kbd','','Ctrl'));shortcuts.appendChild(node('span','',' + '));shortcuts.appendChild(node('kbd','','Espace'));meta.appendChild(state);meta.appendChild(shortcuts);
    var toggle=node('button','','Balises colorées');toggle.type='button';toggle.setAttribute('aria-pressed','true');meta.appendChild(toggle);box.parentNode.insertBefore(meta,box.nextSibling);
    var underlay=node('div','mm-source-highlight'),paint=node('pre');underlay.setAttribute('aria-hidden','true');underlay.appendChild(paint);box.appendChild(underlay);box.classList.add('mm-highlight-on');source.setAttribute('aria-label','Texte du message');
    source.setAttribute('spellcheck','true');
    var send=form.querySelector('input[name="post"][type="submit"],button[name="post"]'),preview=form.querySelector('input[name="preview"][type="submit"]');
    if(send&&preview&&send.parentNode===preview.parentNode)send.parentNode.classList.add('mm-submit-actions');
    var iconPaths={bold:'M7 4h6a4 4 0 0 1 0 8H7zm0 8h7a4 4 0 0 1 0 8H7z',italic:'M10 4h8M6 20h8M14 4l-4 16',underline:'M6 4v7a6 6 0 0 0 12 0V4M4 21h16',strike:'M18 6c-3-4-12-3-12 2 0 5 12 3 12 8 0 5-9 6-12 2M3 12h18',left:'M3 4h18M3 9h12M3 14h18M3 19h12',center:'M3 4h18M6 9h12M3 14h18M6 19h12',right:'M3 4h18M9 9h12M3 14h18M9 19h12',justify:'M3 4h18M3 9h18M3 14h18M3 19h18',bulletlist:'M8 5h13M8 12h13M8 19h13M3 5h1M3 12h1M3 19h1',orderedlist:'M9 5h12M9 12h12M9 19h12M3 3h1v5M2 13c0-3 4-3 4-1l-4 6h4',horizontalrule:'M3 12h18',quote:'M4 5h6v7H4zM14 5h6v7h-6zM10 12c0 4-2 6-5 7M20 12c0 4-2 6-5 7',code:'M8 6l-6 6 6 6M16 6l6 6-6 6M14 3l-4 18',faspoiler:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0',fahide:'M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3M12 14v3',table:'M3 3h18v18H3zM3 9h18M9 3v18M15 3v18M3 15h18',image:'M3 4h18v16H3zM3 17l6-6 4 4 3-3 5 5M15 8h1',servimg:'M3 14v7h18v-7M12 3v13M7 8l5-5 5 5',link:'M9 15l6-6M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',embed:'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M8 12h8M12 8v8',youtube:'M3 5h18v14H3zM10 8l6 4-6 4z',headers:'M4 4v16M16 4v16M4 12h12M19 16h2v4',size:'M3 19L9 4l6 15M5 14h8M17 9h6M20 9v11',color:'M5 17L12 3l7 14M8 12h8M3 21h18',font:'M3 4h18M12 4v17M7 21h10',removeformat:'M5 3h12M11 3l-4 13M14 13l7 8M21 13l-7 8',more:'M4 12h1M11 12h1M18 12h1',subscript:'M3 5l10 12M13 5L3 17M17 16c0-3 5-3 5 0l-5 5h5',superscript:'M3 7l10 12M13 7L3 19M17 4c0-3 5-3 5 0l-5 5h5',fascroll:'M2 12h20M7 7l-5 5 5 5M17 7l5 5-5 5',faupdown:'M12 2v20M7 7l5-5 5 5M7 17l5 5 5-5',farand:'M3 5h4l10 14h4M17 15l4 4-4 4M3 19h4L17 5h4M17 1l4 4-4 4',mention:'M16 8v7c0 3 6 2 6-3a10 10 0 1 0-5 9M16 12a4 4 0 1 1-8 0 4 4 0 1 1 8 0',twemojifa:'M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0M8 8h1M15 8h1M7 14q5 7 10 0',date:'M3 5h18v16H3zM7 2v6M17 2v6M3 10h18M8 14h1M14 14h1',time:'M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0M12 6v6l4 3',pastetext:'M7 5H4v17h16V5h-3M8 2h8v5H8zM8 12h8M8 16h8',source:'M4 3h16v18H4zM8 8l-3 4 3 4M16 8l3 4-3 4'};
    Array.prototype.forEach.call(box.querySelectorAll('[data-sceditor-command]'),function(el){var command=el.getAttribute('data-sceditor-command'),path=iconPaths[command];if(!path)return;var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 26 26" fill="none" stroke="black" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';el.style.setProperty('--mm-tool-icon','url("data:image/svg+xml,'+encodeURIComponent(svg)+'")');el.classList.add('mm-tool-icon');el.setAttribute('aria-label',el.title);el.setAttribute('role','button');el.tabIndex=0;el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});

    function inSource(){return api.inSourceMode();}
    function getText(){return inSource()?source.value:api.val();}
    function subject(){return subjectField?subjectField.value:'';}
    function emit(){source.dispatchEvent(new Event('input',{bubbles:true}));original.dispatchEvent(new Event('input',{bubbles:true}));changed();}
    function setText(text){if(!inSource())api.sourceMode(true);source.value=text;original.value=text;source.setSelectionRange(text.length,text.length);source.focus();emit();}
    function snapshot(id){var now=Date.now();return {v:1,id:id||recoveryId,kind:'recovery',name:subject()||'Rédaction — '+time(now),text:getText(),subject:subject(),context:target,links:Object.assign({},context.links),created:now,updated:now,page:pageId};}
    function save(force){
      clearTimeout(saveTimer);var text=getText(),title=subject(),value=JSON.stringify([text,title,context.links]);if(!force&&(!text&&!title||value===lastSaved))return true;
      try{var copy=snapshot();writeRecord(copy);lastSaved=value;state.classList.remove('mm-error');state.textContent='Copie locale à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});return true;}
      catch(e){state.classList.add('mm-error');state.textContent='Copie locale impossible — exportez votre texte';return false;}
    }
    function tokenHTML(text){var re=/<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|\[\/?[a-zA-Z][^\]\r\n]*\]|\[\*\]/g,at=0,result='',m;while((m=re.exec(text))){result+=escapeHTML(text.slice(at,m.index));var cls=m[0].indexOf('<!--')===0?'comment':m[0][0]==='['?'bb':'html';var token=escapeHTML(m[0]);if(cls!=='comment')token=token.replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g,'<span class="mm-token-value">$1</span>');result+='<span class="mm-token-'+cls+'">'+token+'</span>';at=re.lastIndex;}return result+escapeHTML(text.slice(at))+'\u200b';}
    function paintSource(){
      renderFrame=null;var active=inSource();toggle.disabled=!active;toggle.textContent=active?'Balises colorées':'Mode visuel';
      if(!active||!highlight)return;var css=getComputedStyle(source);underlay.style.left=source.offsetLeft+'px';underlay.style.top=source.offsetTop+'px';underlay.style.width=source.clientWidth+'px';underlay.style.height=source.clientHeight+'px';
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
    function styleFrame(){try{var doc=frame.contentDocument;if(!doc||!doc.body||frameDoc===doc)return;frameDoc=doc;var style=node('style');style.textContent='html,body{background:#091421!important;color:#e4edf7!important}body{margin:0!important;padding:18px!important;box-sizing:border-box;font:14px/1.65 Calibri,Arial,sans-serif!important;overflow-wrap:break-word}a{color:#9fd7f4!important}blockquote{border-left:2px solid #8db3cb;padding-left:12px;color:#c4d7e7}code{color:#c3ddeb;background:#142c40}::selection{background:#365c7b;color:#fff}';doc.head.appendChild(style);doc.body.setAttribute('aria-label','Texte du message en mode visuel');doc.addEventListener('input',changed);doc.addEventListener('keyup',changed);doc.addEventListener('keydown',expand,true);doc.addEventListener('selectionchange',rememberSelection);new MutationObserver(changed).observe(doc.body,{childList:true,characterData:true,subtree:true});}catch(e){/* SCEditor handles frame creation. */}}
    context={original:original,form:form,target:target,links:{},getText:getText,subject:subject,setSubject:function(v){if(subjectField)subjectField.value=v;},setText:setText,save:save,snapshot:snapshot,rememberSelection:rememberSelection,insertFragment:insertFragment,recoveryId:recoveryId};
    source.addEventListener('input',changed);source.addEventListener('keyup',changed);source.addEventListener('keydown',expand,true);source.addEventListener('scroll',requestPaint,{passive:true});source.addEventListener('select',rememberSelection);source.addEventListener('blur',function(){rememberSelection();save(false);});
    if(subjectField)subjectField.addEventListener('input',changed);
    api.bind('valuechanged',changed);box.addEventListener('click',function(){setTimeout(changed,0);});
    frame.addEventListener('load',styleFrame);styleFrame();new MutationObserver(function(){styleFrame();requestPaint();}).observe(box,{attributes:true,attributeFilter:['class']});
    if(window.ResizeObserver)new ResizeObserver(requestPaint).observe(source);window.addEventListener('resize',requestPaint,{passive:true});
    toggle.addEventListener('click',function(){highlight=!highlight;box.classList.toggle('mm-highlight-on',highlight);toggle.setAttribute('aria-pressed',String(highlight));requestPaint();});
    window.addEventListener('pagehide',function(){if(getText()||subject())save(false);});document.addEventListener('visibilitychange',function(){if(document.hidden&&(getText()||subject()))save(false);});
    window.addEventListener('beforeunload',function(e){if((getText()||subject())&&!save(false)){e.preventDefault();e.returnValue='';}});
    protectSubmission(context,send,preview);
    var pendingLoad;try{pendingLoad=sessionStorage.getItem(PREFIX+'load');sessionStorage.removeItem(PREFIX+'load');}catch(e){}
    var requested=pendingLoad&&readRecord(pendingLoad);if(requested)loadRecord(requested);
    else{var older=records('recovery').find(function(r){return r.context&&r.context.key===target.key&&r.text&&r.text!==getText();});if(older){var banner=node('div','mm-recovery-banner');banner.appendChild(node('span','','Une copie du '+time(older.updated)+' est disponible pour cette rédaction. '));banner.appendChild(button('Reprendre',function(){loadRecord(older);banner.remove();}));banner.appendChild(button('Plus tard',function(){banner.remove();}));head.parentNode.insertBefore(banner,head);}}
    requestPaint();rememberSelection();if(getText()||subject())save(false);
  }

  function protectSubmission(ctx,send,preview){
    var form=ctx.form,resume=false,submitting=false,resumedEvent=null,lastSubmitter=null;
    form.addEventListener('click',function(e){var target=e.target.closest('input[type="submit"],button[type="submit"]');if(target&&target.form===form)lastSubmitter=target;},true);
    window.addEventListener('pageshow',function(){submitting=false;resume=false;});
    function proceed(submitter,clean,unprotected){
      if(!unprotected&&!ctx.save(true)){storageFailure(submitter);return;}
      var pending=null;
      if(clean){pending=ctx.snapshot('pending-'+uid());pending.kind='pending';pending.name='Avant envoi — '+(ctx.subject()||time(Date.now()));pending.needsConfirmation=true;pending.recoveryId=ctx.recoveryId;pending.recoveryVersion=(readRecord(ctx.recoveryId)||{}).updated;try{writeRecord(pending);}catch(e){storageFailure(submitter);return;}}
      ctx.original.value=ctx.getText();resume=true;submitting=true;resumedEvent=null;
      try{form.requestSubmit(submitter||send);if(!resumedEvent||resumedEvent.defaultPrevented){submitting=false;resume=false;}}
      catch(e){submitting=false;resume=false;notify('L’envoi n’a pas été lancé. Votre texte reste disponible.');}
    }
    function storageFailure(submitter){var d=modal('Votre copie locale n’a pas été enregistrée','',true);d.content.appendChild(node('p','',storageMessage()));d.footer.appendChild(button('Revenir au texte',d.close));d.footer.appendChild(button('Télécharger le texte',function(){download(ctx.getText(),'message-a-conserver.txt');}));d.footer.appendChild(button('Envoyer quand même',function(){d.close();proceed(submitter,false,true);}));}
    form.addEventListener('submit',function(e){
      var submitter=e.submitter||lastSubmitter||send,name=submitter&&submitter.name;
      if(resume){resume=false;resumedEvent=e;ctx.original.value=ctx.getText();return;}
      if(name==='preview'){ctx.save(true);return;}
      if(name!=='post'&&submitter!==send){ctx.save(true);return;}
      e.preventDefault();e.stopImmediatePropagation();if(submitting)return;
      if(!ctx.save(true)){storageFailure(submitter);return;}
      var linked=Object.keys(ctx.links).filter(function(id){return !!readRecord(id);});
      if(!linked.length){proceed(submitter,false,false);return;}
      var d=modal('Envoyer votre message','Une copie de récupération a été enregistrée.',true);d.content.appendChild(node('p','',linked.length+' brouillon'+(linked.length>1?'s sont liés':' est lié')+' à cette rédaction.'));
      var keep=node('label','mm-send-choice'),keepInput=node('input'),keepText=node('span');keepInput.type='radio';keepInput.name='mm-draft-after-send';keepInput.checked=true;keepText.appendChild(node('strong','','Garder mes brouillons'));keepText.appendChild(node('small','','Ils resteront disponibles dans votre atelier.'));keep.appendChild(keepInput);keep.appendChild(keepText);
      var clean=node('label','mm-send-choice'),cleanInput=node('input'),cleanText=node('span');cleanInput.type='radio';cleanInput.name='mm-draft-after-send';cleanText.appendChild(node('strong','','Supprimer après publication'));cleanText.appendChild(node('small','','Après l’envoi, confirmez que le message est publié pour autoriser le nettoyage. Un échec conserve vos textes.'));clean.appendChild(cleanInput);clean.appendChild(cleanText);d.content.appendChild(keep);d.content.appendChild(clean);
      d.footer.appendChild(button('Continuer à rédiger',d.close));d.footer.appendChild(button('Envoyer le message',function(){var choice=cleanInput.checked;d.close();proceed(submitter,choice,false);},'mm-primary'));
    },true);
  }
  function showPending(){
    var pending=records('pending').filter(function(r){return r.needsConfirmation&&r.page!==pageId;});if(!pending.length)return;
    var banner=node('div','mm-pending-banner'),p=pending[0];banner.appendChild(node('strong','','Votre message a-t-il bien été publié ? '));banner.appendChild(node('span','','La copie d’envoi du '+time(p.updated)+' est conservée en attendant votre confirmation. '));
    banner.appendChild(button('Oui, nettoyer les brouillons liés',function(){
      var changed=0;try{Object.keys(p.links||{}).forEach(function(id){var r=readRecord(id);if(r&&r.updated===p.links[id])removeRecord(id);else if(r)changed++;});var recovery=readRecord(p.recoveryId);if(recovery&&recovery.updated===p.recoveryVersion)removeRecord(recovery.id);removeRecord(p.id);banner.remove();notify(changed?'Les brouillons modifiés depuis l’envoi ont été conservés.':'Les brouillons liés ont été supprimés.');}catch(e){notify('Le nettoyage est incomplet. Les copies restantes sont disponibles dans Récupération.');}
    }));
    banner.appendChild(button('Non, récupérer mon texte',function(){loadRecord(p);banner.remove();}));
    banner.appendChild(button('Conserver mes copies',function(){try{p.needsConfirmation=false;writeRecord(p);banner.remove();}catch(e){notify('Vos copies sont toujours conservées.');}}));
    var host=document.querySelector('#wrap')||document.body;host.insertBefore(banner,host.firstChild);
  }
  function boot(){
    if(location.pathname.indexOf('/admin')===0||document.getElementById('mm-write-nav'))return;
    var nav=node('nav','mm-write-nav');nav.id='mm-write-nav';nav.setAttribute('aria-label','Atelier de rédaction');nav.appendChild(button('Brouillons',function(){manager('draft');}));nav.appendChild(button('Fragments',function(){manager('fragment');}));document.body.appendChild(nav);
    var original=document.querySelector('textarea#text_editor_textarea[name="message"]');
    if(original){var tries=0;function attempt(){var box=original.parentNode.querySelector('.sceditor-container'),api=window.jQuery&&window.jQuery(original).data('sceditor');if(box&&api){bindEditor(original,box,api);return;}if(++tries<80)setTimeout(attempt,250);}attempt();}
    showPending();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
