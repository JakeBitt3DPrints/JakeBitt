/* Shared helpers for jakebitt.com tools.
   jbConfirm(message, {title, ok, cancel, danger}) -> Promise<boolean>
   jbPrompt(message, defaultValue, {title, ok, cancel, placeholder}) -> Promise<string|null>
   Styled to match the site instead of the browser's own pop-ups. */
(function () {
  if (window.jbConfirm) return;
  var css = '' +
    '.jb-dlg{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,6,8,.62);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);animation:jbFade .15s ease-out}' +
    '.jb-dlg-box{width:min(420px,100%);background:#13161b;color:#ecf0f4;border:1px solid #2a303a;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.55);padding:20px 20px 16px;font:15px/1.5 "DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;animation:jbRise .18s cubic-bezier(.22,.7,.2,1)}' +
    '.jb-dlg-box h2{margin:0 0 6px;font:800 19px/1.25 "Bricolage Grotesque","DM Sans",system-ui,sans-serif;letter-spacing:-.015em}' +
    '.jb-dlg-box p{margin:0;color:#98a2b0;white-space:pre-line}' +
    '.jb-dlg-box input{display:block;width:100%;margin-top:14px;height:42px;padding:0 12px;border-radius:10px;border:1px solid #2a303a;background:#0f1216;color:#ecf0f4;font:inherit;outline:none;box-sizing:border-box}' +
    '.jb-dlg-box input:focus{border-color:#9bd7ff;box-shadow:0 0 0 3px rgba(155,215,255,.14)}' +
    '.jb-dlg-row{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}' +
    '.jb-dlg-row button{height:40px;padding:0 16px;border-radius:10px;font:700 14px "DM Sans",system-ui,sans-serif;cursor:pointer;border:1px solid #2a303a;background:#191d24;color:#ecf0f4}' +
    '.jb-dlg-row button:hover{background:#20252e;border-color:#3a4250}' +
    '.jb-dlg-row button.ok{background:#9bd7ff;border-color:#9bd7ff;color:#06263a}' +
    '.jb-dlg-row button.ok:hover{background:#b7e3ff;border-color:#b7e3ff}' +
    '.jb-dlg-row button.ok.danger{background:#ff7b7b;border-color:#ff7b7b;color:#2a0606}' +
    '.jb-dlg-row button:focus-visible{outline:2px solid #9bd7ff;outline-offset:2px}' +
    '@keyframes jbFade{from{opacity:0}}@keyframes jbRise{from{opacity:0;transform:translateY(8px) scale(.98)}}' +
    '@media (prefers-reduced-motion:reduce){.jb-dlg,.jb-dlg-box{animation:none}}';
  function ensureStyle() {
    if (document.getElementById('jb-dlg-style')) return;
    var st = document.createElement('style'); st.id = 'jb-dlg-style'; st.textContent = css; document.head.appendChild(st);
  }
  function open(opts) {
    ensureStyle();
    return new Promise(function (resolve) {
      var prev = document.activeElement;
      var wrap = document.createElement('div'); wrap.className = 'jb-dlg';
      wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
      var box = document.createElement('div'); box.className = 'jb-dlg-box'; wrap.appendChild(box);
      if (opts.title) { var h = document.createElement('h2'); h.textContent = opts.title; box.appendChild(h); }
      if (opts.message) { var p = document.createElement('p'); p.textContent = opts.message; box.appendChild(p); }
      var input = null;
      if (opts.input) {
        input = document.createElement('input'); input.type = 'text';
        input.value = opts.value == null ? '' : String(opts.value);
        if (opts.placeholder) input.placeholder = opts.placeholder;
        box.appendChild(input);
      }
      var row = document.createElement('div'); row.className = 'jb-dlg-row'; box.appendChild(row);
      var cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = opts.cancel || 'Cancel';
      var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'ok' + (opts.danger ? ' danger' : ''); ok.textContent = opts.ok || 'OK';
      row.appendChild(cancel); row.appendChild(ok);
      function done(v) {
        document.removeEventListener('keydown', onKey, true);
        wrap.remove();
        try { prev && prev.focus && prev.focus(); } catch (e) {}
        resolve(v);
      }
      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(opts.input ? null : false); }
        else if (e.key === 'Enter' && (input ? document.activeElement === input : true)) { e.preventDefault(); e.stopPropagation(); done(opts.input ? input.value : true); }
        else if (e.key === 'Tab') {
          var f = [input, cancel, ok].filter(Boolean), i = f.indexOf(document.activeElement);
          e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
        }
        e.stopPropagation();
      }
      cancel.onclick = function () { done(opts.input ? null : false); };
      ok.onclick = function () { done(opts.input ? input.value : true); };
      wrap.addEventListener('pointerdown', function (e) { if (e.target === wrap) done(opts.input ? null : false); });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(wrap);
      setTimeout(function () { if (input) { input.focus(); input.select(); } else ok.focus(); }, 0);
    });
  }
  window.jbConfirm = function (message, o) {
    o = o || {};
    return open({ title: o.title || '', message: message, ok: o.ok || 'OK', cancel: o.cancel, danger: !!o.danger });
  };
  window.jbPrompt = function (message, value, o) {
    o = o || {};
    return open({ title: o.title || message, message: o.title ? message : '', input: true, value: value, placeholder: o.placeholder, ok: o.ok || 'Save', cancel: o.cancel });
  };
})();
