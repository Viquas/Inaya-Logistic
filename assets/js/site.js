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
    appendSet(); appendSet();
  }

  /* ---- clock ---- */
  var clock = document.getElementById('clock');
  if(clock){
    var pad = function(n){ return n<10 ? '0'+n : ''+n; };
    var tick = function(){
      var d = new Date();
      clock.textContent = pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---- counters ---- */
  function runCount(el){
    var to = parseInt(el.getAttribute('data-to'),10);
    var padTo = parseInt(el.getAttribute('data-pad')||'0',10);
    if(reduce){ el.textContent = padTo ? String(to).padStart(padTo,'0') : to; return; }
    var start = null, dur = 1200;
    function frame(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      var val = Math.round(eased*to);
      el.textContent = padTo ? String(val).padStart(padTo,'0') : val;
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

  /* ---- dispatch board live cycling (DOM nodes, no innerHTML) ---- */
  var boardRows = document.querySelectorAll('#boardRows .status');
  if(boardRows.length && !reduce){
    var pool = [
      {t:'On time', c:'st-grn'},
      {t:'In transit', c:'st-amb'},
      {t:'Loading', c:'st-blu'},
      {t:'Dispatched', c:'st-grn'},
      {t:'On schedule', c:'st-grn'},
      {t:'Arriving', c:'st-amb'}
    ];
    setInterval(function(){
      var row = boardRows[Math.floor(Math.random()*boardRows.length)];
      var pick = pool[Math.floor(Math.random()*pool.length)];
      row.className = 'status ' + pick.c + ' flip';
      var dot = document.createElement('span');
      dot.className = 'd';
      row.textContent = '';
      row.appendChild(dot);
      row.appendChild(document.createTextNode(pick.t));
      setTimeout(function(){ row.classList.remove('flip'); }, 420);
    }, 2200);
  }

  /* ---- india map: hover tooltips (DOM nodes, no innerHTML) ---- */
  var wrap = document.getElementById('mapWrap');
  var tip = document.getElementById('mapTip');
  if(wrap && tip){
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
  }

  /* ---- reduced motion: freeze SVG (SMIL) animations on the map ---- */
  if(reduce){
    var im = document.getElementById('indiaMap');
    if(im && im.pauseAnimations){ try{ im.pauseAnimations(); }catch(e){} }
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
})();
