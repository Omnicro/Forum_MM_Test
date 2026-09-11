/* Mythic Meridian — <image-survol src="URL" lien_visible="vrai" couleur_lien="vrai">Texte</image-survol> */
(function () {
  'use strict';
  function start() {
    if (document.getElementById('mm-img-style') || location.pathname.indexOf('/admin') === 0) return;
    var style = document.createElement('style');
    style.id = 'mm-img-style';
    style.textContent = "/* Images au survol — styles limités au composant. */\nhtml image-survol{display:inline}\nhtml a.mm-img-trigger{font:inherit;letter-spacing:inherit;text-transform:none;cursor:zoom-in;text-decoration:none!important;border:0;border-radius:0;padding:0;background:none;box-shadow:none}\nhtml a.mm-img-trigger[data-mm-visible=\"true\"]{text-decoration:underline dotted!important;text-underline-offset:.22em;text-decoration-thickness:1px}\nhtml a.mm-img-trigger[data-mm-color=\"false\"]{color:inherit!important}\nhtml a.mm-img-trigger:focus-visible{outline:1px solid currentColor;outline-offset:4px}\nhtml .mm-img-tip{position:fixed;z-index:100005;box-sizing:border-box;width:max-content;max-width:calc(100vw - 24px);padding:7px;border:1px solid #af967466;border-radius:5px;background:#080f1cf5;color:#dcd9d1;box-shadow:0 18px 48px #0009,0 0 0 3px #18263988;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(10px);transition:opacity .22s ease,transform .28s cubic-bezier(.2,.7,.2,1),visibility .22s}\nhtml .mm-img-tip[data-open=\"true\"]{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0)}\nhtml .mm-img-tip img{display:block!important;width:auto!important;height:auto!important;max-width:min(300px,calc(100vw - 42px))!important;max-height:min(240px,45vh)!important;object-fit:contain;aspect-ratio:auto!important;margin:0!important;border:0!important;border-radius:2px}\nhtml .mm-img-tip p{margin:3px 5px;font:12px/1.5 Arial,sans-serif;color:#dcd9d1}\nhtml .mm-img-tip [hidden],html .mm-img-modal [hidden]{display:none!important}\nhtml dialog.mm-img-modal{box-sizing:border-box;width:max-content;max-width:calc(100vw - 32px);max-height:calc(100dvh - 32px);margin:auto;padding:42px 18px 16px;border:1px solid #af967470;border-radius:5px;background:#080f1c;color:#dfdbd1;box-shadow:0 24px 100px #000b;overflow:auto}\nhtml .mm-img-modal::backdrop{background:#02060de6;backdrop-filter:blur(5px)}\nhtml .mm-img-modal[open]{animation:mm-img-reveal .25s ease-out}\nhtml .mm-img-modal img{display:block!important;width:auto!important;height:auto!important;max-width:calc(100vw - 72px)!important;max-height:calc(100dvh - 156px)!important;object-fit:contain;aspect-ratio:auto!important;margin:0 auto!important;padding:0;border:0!important;border-radius:2px}\nhtml .mm-img-modal figcaption{margin:13px 0 0;text-align:center;font:15px/1.5 Georgia,serif;color:#cfc0a5;overflow-wrap:anywhere;max-width:min(800px,calc(100vw - 72px))}\nhtml .mm-img-modal figure{margin:0;padding:0}\nhtml .mm-img-modal .mm-img-close{position:absolute;right:8px;top:5px;width:32px;height:32px;display:grid;place-items:center;padding:0;border:1px solid transparent;border-radius:3px;background:none;color:#e1d8ca;font:26px/1 Arial,sans-serif;cursor:pointer;box-shadow:none}\nhtml .mm-img-close:hover,html .mm-img-close:focus-visible{border-color:#af9674;background:#182536;outline:0}\nhtml .mm-img-modal .mm-img-status{margin:8px 20px;font:14px/1.5 Arial,sans-serif;color:#dcd9d1}\n@keyframes mm-img-reveal{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}\n@media(prefers-reduced-motion:reduce){html .mm-img-tip{transition:none;transform:none}html .mm-img-modal[open]{animation:none}}\n";
    document.head.appendChild(style);
    var tip = document.createElement('div');
    tip.className = 'mm-img-tip';
    tip.setAttribute('aria-hidden', 'true');
    var tipImage = document.createElement('img');
    tipImage.alt = '';
    var tipStatus = document.createElement('p');
    tip.append(tipImage, tipStatus);
    document.body.appendChild(tip);
    var modal = document.createElement('dialog');
    modal.className = 'mm-img-modal';
    modal.setAttribute('aria-label', 'Image agrandie');
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'mm-img-close';
    close.setAttribute('aria-label', 'Fermer l’image');
    close.textContent = '×';
    var figure = document.createElement('figure');
    var modalImage = document.createElement('img');
    var caption = document.createElement('figcaption');
    var modalStatus = document.createElement('p');
    modalStatus.className = 'mm-img-status';
    modalStatus.setAttribute('role', 'status');
    figure.append(modalImage, caption);
    modal.append(close, figure, modalStatus);
    document.body.appendChild(modal);
    var active = null, opener = null, hideTimer, loadToken = 0, oldOverflow = null;
    function bool(value) { return !/^(faux|false|0|non)$/i.test((value || '').trim()); }
    function url(raw) {
      try { var u = new URL(raw, location.href); return /^(https?:)$/.test(u.protocol) && !u.username && !u.password ? u.href : null; }
      catch (_) { return null; }
    }
    function hide() { clearTimeout(hideTimer); tip.dataset.open = 'false'; active = null; }
    function later() { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 180); }
    function position() {
      if (!active) return;
      var a = active.getBoundingClientRect(), t = tip.getBoundingClientRect(), margin = 12, gap = 13;
      var top = a.top - t.height - gap;
      if (top < margin) top = a.bottom + gap;
      tip.style.left = Math.max(margin, Math.min(a.left + (a.width - t.width) / 2, innerWidth - t.width - margin)) + 'px';
      tip.style.top = Math.max(margin, Math.min(top, innerHeight - t.height - margin)) + 'px';
    }
    function preview(link) {
      if (modal.open) return;
      clearTimeout(hideTimer);
      if (active === link) return;
      active = link;
      var token = ++loadToken;
      tipImage.hidden = true;
      tipStatus.hidden = false;
      tipStatus.textContent = 'Chargement de l’image…';
      tipImage.onload = function () { if (token !== loadToken || active !== link) return; tipImage.hidden = false; tipStatus.hidden = true; position(); };
      tipImage.onerror = function () { if (token !== loadToken || active !== link) return; tipImage.hidden = true; tipStatus.textContent = 'Image indisponible'; position(); };
      tipImage.src = link.href;
      position();
      tip.dataset.open = 'true';
    }
    function enlarge(link) {
      hide();
      opener = link;
      caption.textContent = link.textContent.trim();
      modalImage.alt = link.dataset.mmAlt || link.textContent.trim();
      modalImage.hidden = true;
      modalStatus.hidden = false;
      modalStatus.textContent = 'Chargement de l’image…';
      modalImage.onload = function () { modalImage.hidden = false; modalStatus.hidden = true; };
      modalImage.onerror = function () { modalImage.hidden = true; modalStatus.textContent = 'Impossible de charger cette image. Son adresse est peut-être incorrecte ou son hébergement indisponible.'; };
      modalImage.src = link.href;
      if (!modal.open) { oldOverflow = document.documentElement.style.overflow; modal.showModal(); document.documentElement.style.overflow = 'hidden'; }
      close.focus();
    }
    close.addEventListener('click', function () { modal.close(); });
    modal.addEventListener('click', function (e) {
      if (e.target !== modal) return;
      var r = modal.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
    });
    modal.addEventListener('close', function () {
      if (oldOverflow !== null) document.documentElement.style.overflow = oldOverflow;
      oldOverflow = null;
      if (opener && opener.isConnected) opener.focus({preventScroll:true});
      hide();
    });
    tip.addEventListener('pointerenter', function () { clearTimeout(hideTimer); });
    tip.addEventListener('pointerleave', later);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    window.addEventListener('scroll', function () { if (active && document.activeElement === active) position(); else hide(); }, true);
    window.addEventListener('resize', position);
    function enhance(root) {
      var nodes = [];
      if (root.nodeType !== 1 && root.nodeType !== 9) return;
      if (root.matches && root.matches('image-survol')) nodes.push(root);
      nodes.push.apply(nodes, root.querySelectorAll('image-survol'));
      nodes.forEach(function (tag) {
        if (tag.dataset.mmImageReady || tag.closest('pre,code,textarea,[contenteditable="true"],.sceditor-container,a,button')) return;
        var raw = tag.getAttribute('src');
        var src = raw && url(raw);
        if (!src) return;
        tag.dataset.mmImageReady = 'true';
        var link = document.createElement('a');
        link.className = 'mm-img-trigger';
        link.href = src;
        link.setAttribute('role', 'button');
        link.setAttribute('aria-haspopup', 'dialog');
        link.dataset.mmVisible = String(bool(tag.getAttribute('lien_visible')));
        link.dataset.mmColor = String(bool(tag.getAttribute('couleur_lien')));
        link.dataset.mmAlt = tag.getAttribute('alt') || '';
        while (tag.firstChild) link.appendChild(tag.firstChild);
        tag.appendChild(link);
        link.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') preview(link); });
        link.addEventListener('pointerleave', later);
        link.addEventListener('focus', function () { preview(link); });
        link.addEventListener('blur', later);
        link.addEventListener('click', function (e) { e.preventDefault(); enlarge(link); });
        link.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); enlarge(link); } });
      });
    }
    enhance(document);
    new MutationObserver(function (changes) {
      changes.forEach(function (change) { change.addedNodes.forEach(function (node) { if (node.nodeType === 1 && !node.closest('.mm-img-tip,.mm-img-modal,image-survol[data-mm-image-ready]')) enhance(node); }); });
    }).observe(document.body, {childList:true, subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
