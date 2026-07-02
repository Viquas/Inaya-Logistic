/* =====================================================================
   Inaya Logistics — shared site behaviour (Option 2 design system).
   Every feature is guarded so the file is safe to load on any page.
   ===================================================================== */
(function(){
  "use strict";

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if(reveals.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  }

  /* ---- nav scroll state ---- */
  var nav = document.getElementById('nav');
  if(nav){
    window.addEventListener('scroll', function(){
      if(window.scrollY > 24){ nav.classList.add('scrolled'); } else { nav.classList.remove('scrolled'); }
    }, {passive:true});
  }

  /* ---- mobile menu ---- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if(burger && menu){
    burger.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && menu.classList.contains('open')){
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded','false');
        burger.setAttribute('aria-label','Open menu');
        burger.focus();
      }
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ menu.classList.remove('open'); burger.setAttribute('aria-expanded','false'); });
    });
  }

  /* ---- marquee build (DOM nodes, no innerHTML) ---- */
  var track = document.getElementById('mqTrack');
  if(track){
    var items = (track.getAttribute('data-items') || 'Bengaluru,Delhi,Mumbai,Hyderabad,Chennai,Kolkata,Pune,Ahmedabad,On time,Reliable,Cost-effective,Pan-India').split(',');
    function appendSet(){
      items.forEach(function(t){
        var span = document.createElement('span');
        span.className = 'mq-item';
        var b = document.createElement('b');
        b.textContent = t.trim();
        var sep = document.createElement('span');
        sep.className = 'mq-sep';
        sep.textContent = '/';
        span.appendChild(b); span.appendChild(sep);
        track.appendChild(span);
      });
    }
    function buildTrack(){
      track.textContent = '';
      appendSet();
      /* make the first half at least as wide as the viewport so the loop
         point never shows a gap */
      var vw = document.documentElement.clientWidth || window.innerWidth || 1280;
      var guard = 0;
      while(track.scrollWidth < vw + 160 && guard < 40){ appendSet(); guard++; }
      /* clone the whole first half -> track is exactly two identical halves,
         so the CSS translateX(-50%) wraps seamlessly (never-ending) */
      Array.prototype.slice.call(track.children).forEach(function(node){
        track.appendChild(node.cloneNode(true));
      });
    }
    buildTrack();
    var mqResizeT;
    window.addEventListener('resize', function(){
      clearTimeout(mqResizeT);
      mqResizeT = setTimeout(buildTrack, 250);
    });
  }

  /* ---- clock ---- */
  var clock = document.getElementById('clock');
  if(clock){
    var tick = function(){
      try{
        clock.textContent = new Date().toLocaleTimeString('en-GB',{timeZone:'Asia/Kolkata',hour12:false}) + ' IST';
      }catch(e){
        var d = new Date(), p = function(n){ return n<10 ? '0'+n : ''+n; };
        clock.textContent = p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
      }
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---- counters ---- */
  function fmtCount(n, padTo){
    if(padTo){ return String(n).padStart(padTo,'0'); }
    if(n >= 1000){ return n.toLocaleString('en-IN'); } /* 10000 -> 10,000 */
    return String(n);
  }
  function runCount(el){
    var to = parseInt(el.getAttribute('data-to'),10);
    var padTo = parseInt(el.getAttribute('data-pad')||'0',10);
    if(reduce){ el.textContent = fmtCount(to, padTo); return; }
    var start = null, dur = 1200;
    function frame(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      var val = Math.round(eased*to);
      el.textContent = fmtCount(val, padTo);
      if(p<1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('.count');
  if(counters.length){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ runCount(e.target); cio.unobserve(e.target); } });
    },{threshold:0.6});
    counters.forEach(function(el){ cio.observe(el); });
  }

  /* ---- dispatch board: new route slides in every 5s (DOM nodes only) ---- */
  var boardRows = document.getElementById('boardRows');
  if(boardRows && !reduce){
    var DESTS = ['DEL','BOM','HYD','MAA','CCU','PNQ','AMD','JAI','GHY','COK','VTZ','NAG','IDR','LKO','SXR','GOI'];
    var VEHS  = ['32 ft','24 ft','22 ft','20 ft','17 ft','14 ft','10 ft','7 ft'];
    var STATS = [
      {t:'On time', c:'st-grn'},
      {t:'In transit', c:'st-amb'},
      {t:'Loading', c:'st-blu'},
      {t:'Dispatched', c:'st-grn'},
      {t:'Arriving', c:'st-amb'}
    ];
    var pick = function(a){ return a[Math.floor(Math.random()*a.length)]; };
    function makeRow(){
      var s = pick(STATS);
      var row = document.createElement('div');
      row.className = 'board-row enter';

      var rc = document.createElement('span');
      rc.className = 'rc';
      rc.appendChild(document.createTextNode('BLR'));
      var arrow = document.createElement('i');
      arrow.textContent = '→';
      rc.appendChild(arrow);
      rc.appendChild(document.createTextNode(pick(DESTS)));

      var veh = document.createElement('span');
      veh.className = 'veh';
      veh.textContent = pick(VEHS);

      var st = document.createElement('span');
      st.className = 'status ' + s.c;
      var d = document.createElement('span');
      d.className = 'd';
      st.appendChild(d);
      st.appendChild(document.createTextNode(s.t));

      row.appendChild(rc); row.appendChild(veh); row.appendChild(st);
      return row;
    }
    setInterval(function(){
      if(document.hidden) return;
      var row = makeRow();
      boardRows.insertBefore(row, boardRows.firstChild);
      while(boardRows.children.length > 6){ boardRows.removeChild(boardRows.lastChild); }
      setTimeout(function(){ row.classList.remove('enter'); }, 520);
    }, 5000);
  }

  /* ---- maps: hover tooltips (DOM nodes, no innerHTML) ---- */
  /* generalised so any .map-wrap that contains a .map-tip works
     (India lane map + Karnataka home-state map) */
  document.querySelectorAll('.map-wrap').forEach(function(wrap){
    var tip = wrap.querySelector('.map-tip');
    if(!tip) return;
    wrap.querySelectorAll('.city').forEach(function(c){
      c.addEventListener('mouseenter', function(){
        var key = document.createElement('span');
        key.className = 'tk';
        key.textContent = c.getAttribute('data-name') || '';
        tip.textContent = '';
        tip.appendChild(key);
        tip.appendChild(document.createTextNode(c.getAttribute('data-km') || ''));
        tip.classList.add('show');
      });
      c.addEventListener('mousemove', function(e){
        var r = wrap.getBoundingClientRect();
        tip.style.left = (e.clientX - r.left) + 'px';
        tip.style.top  = (e.clientY - r.top) + 'px';
      });
      c.addEventListener('mouseleave', function(){ tip.classList.remove('show'); });
    });
  });

  /* ---- reduced motion: freeze SVG (SMIL) animations on the maps ---- */
  if(reduce){
    document.querySelectorAll('#indiaMap,#karnatakaMap').forEach(function(im){
      if(im && im.pauseAnimations){ try{ im.pauseAnimations(); }catch(e){} }
    });
  }

  /* ---- quote -> mailto (works on any page with the form) ---- */
  var QUOTE_IDS=['q-name','q-company','q-phone','q-detail'];

  function v(id){ var el=document.getElementById(id); return el ? el.value.trim() : ''; }

  window.sendQuote = function(){
    var firstInvalid=null;
    QUOTE_IDS.forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      var wrap=el.closest('.field');
      var val=el.value.trim();
      var ok=val.length>0;
      if(id==='q-phone' && ok){ ok=val.replace(/[^0-9]/g,'').length>=7; }
      if(wrap){ wrap.classList.toggle('invalid', !ok); }
      if(!ok && !firstInvalid){ firstInvalid=el; }
    });
    var msg=document.getElementById('quoteMsg');
    if(firstInvalid){
      if(msg){ msg.className='quote-msg err show'; msg.textContent='Please fill in all fields before sending, so we can quote without calling you back for the missing details.'; }
      try{ firstInvalid.focus(); }catch(e){}
      return;
    }
    if(msg){ msg.className='quote-msg'; msg.textContent=''; }
    var name=v('q-name'), company=v('q-company'), phone=v('q-phone'), detail=v('q-detail');
    var subject='Quote request - '+company;
    var body='Name: '+name+'\nCompany: '+company+'\nPhone: '+phone+'\n\nRequirement:\n'+detail;
    window.location.href='mailto:InayaLogistics19@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  };

  var quoteSend = document.getElementById('quoteSend');
  if(quoteSend){ quoteSend.addEventListener('click', window.sendQuote); }

  /* clear a field's error as soon as the user fixes it */
  QUOTE_IDS.forEach(function(id){
    var el=document.getElementById(id);
    if(!el) return;
    el.addEventListener('input', function(){
      var wrap=el.closest('.field');
      if(wrap){ wrap.classList.remove('invalid'); }
      var msg=document.getElementById('quoteMsg');
      if(msg && msg.classList.contains('show')){ msg.className='quote-msg'; msg.textContent=''; }
    });
  });

  /* ---- arrive-on-hash: honour #quote (and any #anchor) with the
     sticky-nav offset, so contact CTAs from other pages land on the
     form instead of tucking it under the fixed header. Uses Lenis
     when present, native scroll otherwise. ---- */
  function scrollToHash(smooth){
    var hash = window.location.hash;
    if(!hash || hash.length < 2) return;
    var target;
    try{ target = document.getElementById(hash.slice(1)); }catch(e){ target = null; }
    if(!target) return;
    if(window.__lenis){
      window.__lenis.scrollTo(target, { offset:-80, immediate:!smooth });
    } else {
      var y = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top:y, behavior: smooth ? 'smooth' : 'auto' });
    }
  }
  if(window.location.hash){
    window.addEventListener('load', function(){
      /* let layout settle and Lenis initialise, then realign */
      setTimeout(function(){ scrollToHash(true); }, 80);
    });
  }

  /* ---- permanent "need transportation" quote bar: slides in after the
     fold and stays (not dismissible) ---- */
  var qbar = document.getElementById('quotebar');
  if(qbar){
    var qbTick = function(){
      if(window.scrollY > 620){ qbar.classList.add('show'); }
      else { qbar.classList.remove('show'); }
    };
    window.addEventListener('scroll', qbTick, {passive:true});
    qbTick();
  }

  /* =====================================================================
     Careers roles from a Google Sheet (client-managed, no code needed).

     SETUP (one time):
       1. Make a Google Sheet. Row 1 headers (exact order):
            Title | Type | Location | Experience | Description | Status
          One role per row below. Status is "Open" or "Closed" —
          only "Open" rows show on the site.
       2. Pause ONE role: set that row's Status to "Closed" (or anything
          other than "Open") — leave the row in the sheet, resume later
          by switching it back.
          Pause ALL hiring: set every row's Status to "Closed", or just
          delete the role rows. Either way the site shows the same
          "not hiring" message.
       3. File -> Share -> Publish to web -> choose the sheet -> CSV ->
          Publish. Copy that .../pub?output=csv link.
       4. Paste it into CAREERS_SHEET_CSV below. Done.

     The client only ever touches the Sheet after that. If the link is
     empty or unreachable, the static roles already in careers.html show
     instead (safe fallback, good for SEO / no-JS).
     ===================================================================== */
  var CAREERS_SHEET_CSV = 'https://docs.google.com/spreadsheets/d/1II9lhRV4Pm9NDo3nG1I8HtL5VucZTsI7fo1vdcbPab0/export?format=csv&gid=0'; /* <-- paste the published CSV URL here */
  var roleList = document.getElementById('roleList');
  if(roleList && CAREERS_SHEET_CSV){
    var APPLY_EMAIL = 'InayaLogistics19@gmail.com';

    /* minimal RFC-4180 CSV parser (handles quoted fields, commas, newlines) */
    function parseCSV(text){
      var rows=[], row=[], val='', i=0, q=false, c;
      text = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
      for(; i<text.length; i++){
        c = text[i];
        if(q){
          if(c === '"'){ if(text[i+1] === '"'){ val+='"'; i++; } else { q=false; } }
          else { val+=c; }
        } else if(c === '"'){ q=true; }
        else if(c === ','){ row.push(val); val=''; }
        else if(c === '\n'){ row.push(val); rows.push(row); row=[]; val=''; }
        else { val+=c; }
      }
      if(val.length || row.length){ row.push(val); rows.push(row); }
      return rows;
    }

    function el(tag, cls, txt){
      var e = document.createElement(tag);
      if(cls) e.className = cls;
      if(txt != null) e.textContent = txt;
      return e;
    }

    function renderEmpty(){
      roleList.textContent = '';
      var box = el('div','role-empty reveal in');
      box.appendChild(el('h3', null, "No open roles right now"));
      box.appendChild(el('p', null, "We're not actively hiring at the moment — but we're always glad to hear from good people. Send us your resume and we'll reach out when the right role opens up."));
      var a = el('a','btn btn-dark','Send your resume');
      a.setAttribute('href','mailto:'+APPLY_EMAIL+'?subject='+encodeURIComponent('Open application - Inaya Logistics'));
      box.appendChild(a);
      roleList.appendChild(box);
    }

    function renderRoles(roles){
      roleList.textContent = '';
      roles.forEach(function(r, idx){
        var card = el('div','role reveal in');
        if(idx) card.style.transitionDelay = Math.min(idx*0.05, 0.3)+'s';
        var main = el('div','role-main');
        main.appendChild(el('h3', null, r.title));
        var tags = el('div','role-tags');
        [r.type, r.location, r.exp].forEach(function(t){
          if(t) tags.appendChild(el('span','role-tag', t));
        });
        main.appendChild(tags);
        if(r.desc) main.appendChild(el('p', null, r.desc));
        card.appendChild(main);
        var a = el('a','btn btn-dark','Apply');
        a.setAttribute('href','mailto:'+APPLY_EMAIL+'?subject='+encodeURIComponent('Application - '+r.title));
        var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none');
        svg.setAttribute('stroke','currentColor'); svg.setAttribute('stroke-width','2');
        svg.setAttribute('stroke-linecap','round'); svg.setAttribute('stroke-linejoin','round');
        var p = document.createElementNS('http://www.w3.org/2000/svg','path');
        p.setAttribute('d','M5 12h14M13 6l6 6-6 6'); svg.appendChild(p);
        a.appendChild(svg);
        card.appendChild(a);
        roleList.appendChild(card);
      });
    }

    fetch(CAREERS_SHEET_CSV, {cache:'no-store'}).then(function(res){
      if(!res.ok) throw new Error('sheet fetch '+res.status);
      return res.text();
    }).then(function(text){
      var rows = parseCSV(text).filter(function(r){ return r.some(function(c){ return c.trim() !== ''; }); });
      if(!rows.length) { renderEmpty(); return; }
      var body = rows.slice(1); /* drop header row */
      var roles = body
        .filter(function(r){ return (r[0]||'').trim() && (r[5]||'').trim().toUpperCase() === 'OPEN'; })
        .map(function(r){ return { title:(r[0]||'').trim(), type:(r[1]||'').trim(), location:(r[2]||'').trim(), exp:(r[3]||'').trim(), desc:(r[4]||'').trim() }; });
      if(!roles.length){ renderEmpty(); }
      else { renderRoles(roles); }
    }).catch(function(err){
      /* leave the static fallback roles already in the HTML */
      if(window.console && console.warn){ console.warn('Careers sheet unavailable, showing default roles.', err); }
    });
  }
})();
