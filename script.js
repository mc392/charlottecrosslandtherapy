/* Charlotte Crossland Therapy — small enhancements. The page works fully without this file. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Year in footer */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Where did this visitor come from? ----------
     Tip: on the BACP / Counselling Directory profiles, link to
     https://www.charlottecrosslandtherapy.co.uk/?ref=bacp  (or ?ref=counselling-directory)
     so the source is recorded even when the browser hides the referrer. */
  var source = 'direct';
  try {
    var ref = new URLSearchParams(location.search).get('ref');
    var referrer = (document.referrer || '').toLowerCase();
    if (ref) source = ref.toLowerCase();
    else if (referrer.indexOf('bacp.co.uk') > -1) source = 'bacp';
    else if (referrer.indexOf('counselling-directory') > -1) source = 'counselling-directory';
    else if (/google\.|bing\.|duckduckgo\.|yahoo\./.test(referrer)) source = 'search';
    else if (referrer && referrer.indexOf(location.hostname) === -1) source = 'link: ' + referrer.split('/')[2];
  } catch (e) {}
  var sourceField = document.getElementById('f-source');
  if (sourceField) sourceField.value = source;

  var header = document.querySelector('.site-header');

  /* ---------- Welcome phrases: each brightens as it comes into view and stays bright
     until it has nearly reached the top of the screen ---------- */
  var scrolly = document.getElementById('welcome');
  var steps = scrolly ? Array.prototype.slice.call(scrolly.querySelectorAll('.step')) : [];
  if ('IntersectionObserver' in window && steps.length) {
    var stepObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.closest('.step').classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-9% 0px -16% 0px' });
    steps.forEach(function (s) { var ps = s.querySelectorAll('p'); stepObserver.observe(ps[ps.length - 1]); });
  } else {
    steps.forEach(function (s) { s.classList.add('is-active'); });
  }

  /* ---------- Vines ----------
     A meandering stem drawn as you scroll. It curls into varied loops (the growing tip
     travels round each one), sprouts leaves, and gets thicker and brighter as it grows. */
  function seeded(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function rgb(a, b, t) { return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(',') + ')'; }
  var NS = 'http://www.w3.org/2000/svg';
  function make(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function Vine(o) {
    /* o: svg, box, waypoints(W,H,narrow,rect), style, seed, lead (0-1 of viewport), flower */
    var samples = [], isLoop = [], vy = [], cum = [], total = 0, chunks = [], leaves = [], flower = null, tip = null;
    var lastDrawn = -1, lastW = 0, lastH = 0;

    function build() {
      var W = o.box.clientWidth, H = o.box.offsetHeight;
      if (!W || !H) return;
      lastW = W; lastH = H;
      var rect = o.box.getBoundingClientRect();
      var narrow = W < 600, st = o.style, rand = seeded(o.seed);
      o.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      while (o.svg.firstChild) o.svg.removeChild(o.svg.firstChild);
      var pts = o.waypoints(W, H, narrow, rect, rand);
      if (pts.length < 2) return;

      samples = []; isLoop = []; var u = [], segOf = [], jump = [];
      var R = narrow ? st.loopR[0] : st.loopR[1];
      var wob = narrow ? W * st.wobble[0] : Math.min(160, W * st.wobble[1]);

      function addLoop(k, segStartU) {
        var a = samples[samples.length - 2], c = samples[samples.length - 1];
        var tx = c[0] - a[0], ty = c[1] - a[1], L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
        var sg = rand() < 0.5 ? 1 : -1;
        if (st.loopOutward && Math.abs(ty) > 0.2) sg = (c[0] < W / 2 ? -1 : 1) * (ty > 0 ? -1 : 1);   // curl towards the page edge
        var nx = -ty * sg, ny = tx * sg;
        /* varied shapes: wide, tall, lopsided, and sometimes a double curl that tightens */
        var turns = rand() < 0.3 ? 2 : 1;
        var A = R * lerp(0.7, 1.5, rand()), B = R * lerp(0.55, 1.35, rand()), C = R * lerp(-0.45, 0.45, rand());
        var shrink = turns === 2 ? lerp(0.35, 0.55, rand()) : lerp(0, 0.2, rand());
        var M = 44 * turns, prev = c, lu = u[u.length - 1];
        for (var m = 1; m <= M; m++) {
          var f = m / M, psi = 2 * Math.PI * turns * f, sc = 1 - shrink * Math.sin(Math.PI * f);
          var lx = A * sc * (1 - Math.cos(psi)), ly = B * sc * Math.sin(psi) + C * Math.sin(2 * psi) / turns;
          var p = [c[0] + nx * lx + tx * ly, c[1] + ny * lx + ty * ly];
          lu += Math.hypot(p[0] - prev[0], p[1] - prev[1]) * 0.75;   // loops take a little scrolling to draw
          samples.push(p); isLoop.push(true); u.push(lu); segOf.push(k); jump.push(false); prev = p;
        }
      }

      for (var k = 0; k < pts.length - 1; k++) {
        var P = pts[k], Q = pts[k + 1], dy = Q.y - P.y, n = Math.max(16, Math.round(Math.abs(dy) / 5));
        if (Q.jump) {   // hidden off-screen: carry on from the other edge without drawing across the page
          samples.push([Q.x, Q.y]); isLoop.push(false); u.push(u[u.length - 1] + Math.abs(dy)); segOf.push(k); jump.push(true);
          continue;
        }
        var loopAt = (P.loop && !P.calm) ? Math.round(n * lerp(0.4, 0.6, rand())) : -1;   // loops are rare: only where marked
        var dir = rand() < 0.5 ? 1 : -1, w = wob * lerp(0.5, 1.2, rand()) * (P.calm ? 0.3 : 1);
        for (var j = (k === 0 ? 0 : 1); j <= n; j++) {
          var t = j / n;
          var x = P.x + (Q.x - P.x) * ease(t) + Math.sin(t * Math.PI * 2) * w * dir;
          var y = P.y + dy * t;
          var pu = u.length ? u[u.length - 1] + (samples.length ? Math.abs(y - samples[samples.length - 1][1]) : 0) : 0;
          samples.push([x, y]); isLoop.push(false); u.push(pu); segOf.push(k); jump.push(false);
          if (j === loopAt) addLoop(k);
        }
      }

      /* Scroll mapping: within each segment, spread the loop's extra length across the
         segment, so the tip travels smoothly round every curl and meets each phrase on time */
      vy = []; var segStart = {}, segEnd = {};
      segOf.forEach(function (s, i) { if (!(s in segStart)) segStart[s] = i; segEnd[s] = i; });
      for (var i = 0; i < samples.length; i++) {
        var s = segOf[i], i0 = segStart[s], i1 = segEnd[s];
        var y0 = s === 0 ? pts[0].y : samples[i0 - 1][1], y1 = pts[s + 1].y;
        var u0 = s === 0 ? u[0] : u[i0 - 1], span = (u[i1] - u0) || 1;
        vy[i] = y0 + (u[i] - u0) / span * (y1 - y0);
      }
      cum = [0];
      for (var c = 1; c < samples.length; c++) cum[c] = cum[c - 1] + (jump[c] ? 0 : Math.hypot(samples[c][0] - samples[c - 1][0], samples[c][1] - samples[c - 1][1]));
      total = cum[cum.length - 1];

      /* Stem in chunks that thicken and brighten */
      chunks = [];
      var stemG = make('g', {}, o.svg), CH = Math.max(30, Math.round(total / 90)), per = Math.ceil(samples.length / CH);
      for (var ch = 0; ch < CH; ch++) {
        var a0 = ch * per, a1 = Math.min(samples.length - 1, (ch + 1) * per);
        if (a0 >= a1) break;
        var tt = ch / (CH - 1), d = 'M' + samples[a0][0].toFixed(1) + ' ' + samples[a0][1].toFixed(1);
        for (var q = a0 + 1; q <= a1; q++) d += (jump[q] ? 'M' : 'L') + samples[q][0].toFixed(1) + ' ' + samples[q][1].toFixed(1);
        var len = cum[a1] - cum[a0];
        var el = make('path', { d: d, class: 'stem', stroke: rgb(st.dim, st.bright, tt),
          'stroke-width': lerp(st.width[0], st.width[narrow ? 1 : 2], tt).toFixed(2),
          'stroke-opacity': lerp(st.opacity[0], st.opacity[1], tt).toFixed(2),
          'stroke-dasharray': len + ' ' + (len + 2), 'stroke-dashoffset': len }, stemG);
        el.style.visibility = 'hidden';
        chunks.push({ el: el, start: cum[a0], len: len });
      }

      /* Leaves, alternating sides, off the curls */
      leaves = [];
      var leafG = make('g', {}, o.svg), spacing = narrow ? st.leafGap[0] : st.leafGap[1], side = 1, idx = 0;
      for (var at = 24; at < total - 24; at += spacing * lerp(0.75, 1.3, rand())) {
        while (idx < cum.length - 1 && cum[idx] < at) idx++;
        if (isLoop[idx]) continue;
        var p0 = samples[Math.max(0, idx - 1)], p1 = samples[Math.min(samples.length - 1, idx + 1)];
        var ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI + side * lerp(45, 70, rand());
        var lt = at / total, size = lerp(st.leafSize[0], st.leafSize[narrow ? 1 : 2], lt) * lerp(0.8, 1.15, rand());
        var g = make('g', { transform: 'translate(' + samples[idx][0].toFixed(1) + ' ' + samples[idx][1].toFixed(1) + ') rotate(' + ang.toFixed(1) + ') scale(' + size.toFixed(2) + ')' }, leafG);
        var inner = make('g', { class: 'leaf' }, g);
        make('path', { d: 'M0 0C5 -8 15 -10 23 0C15 10 5 8 0 0Z', fill: rgb(st.dim, st.bright, Math.min(1, lt + 0.15)), 'fill-opacity': lerp(st.leafOpacity[0], st.leafOpacity[1], lt).toFixed(2) }, inner);
        if (st.midrib) make('path', { d: 'M2 0Q11 -1 19 0', stroke: '#47505E', 'stroke-opacity': '0.35', 'stroke-width': '0.9', fill: 'none' }, inner);
        leaves.push({ el: g, at: at });
        side = -side;
      }

      flower = null;
      if (o.flower) {
        var end = samples[samples.length - 1], fs = narrow ? 1.05 : 1.45;
        flower = make('g', { transform: 'translate(' + end[0].toFixed(1) + ' ' + end[1].toFixed(1) + ') scale(' + fs + ')' }, o.svg);
        for (var f = 0; f < 5; f++) {
          var pg = make('g', { transform: 'rotate(' + (f * 72) + ')' }, flower);
          make('ellipse', { class: 'petal', cx: 0, cy: -10, rx: 6, ry: 10, fill: '#F2F8F7' }, pg).style.transitionDelay = (f * 0.08) + 's';
        }
        make('circle', { class: 'bud', r: 5, fill: '#8AB6AF' }, flower);
      }
      tip = make('circle', { r: narrow ? st.tip[0] : st.tip[1], fill: rgb(st.bright, st.bright, 1), class: 'tip' }, o.svg);
      tip.style.opacity = 0;

      lastDrawn = -1;
      update(window.innerHeight);
    }

    function update(vh) {
      if (!total) return;
      var target = vh * o.lead - o.box.getBoundingClientRect().top, drawn, px, py;
      var n = vy.length;
      if (reduceMotion || target >= vy[n - 1]) { drawn = total; px = samples[n - 1][0]; py = samples[n - 1][1]; }
      else if (target <= vy[0]) { drawn = 0; px = samples[0][0]; py = samples[0][1]; }
      else {
        var lo = 0, hi = n - 1;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (vy[mid] < target) lo = mid + 1; else hi = mid; }
        var i = Math.max(1, lo), f = (target - vy[i - 1]) / ((vy[i] - vy[i - 1]) || 1);
        drawn = lerp(cum[i - 1], cum[i], f);
        px = lerp(samples[i - 1][0], samples[i][0], f); py = lerp(samples[i - 1][1], samples[i][1], f);
      }
      if (Math.abs(drawn - lastDrawn) < 0.3) return;
      lastDrawn = drawn;
      chunks.forEach(function (c) {
        var vis = Math.max(0, Math.min(c.len, drawn - c.start));
        c.el.setAttribute('stroke-dashoffset', (c.len - vis).toFixed(1));
        c.el.style.visibility = vis > 0.5 ? 'visible' : 'hidden';
      });
      leaves.forEach(function (l) { l.el.classList.toggle('on', l.at <= drawn); });
      if (flower) flower.classList.toggle('bloomed', drawn >= total - 2);
      tip.setAttribute('cx', px.toFixed(1)); tip.setAttribute('cy', py.toFixed(1));
      tip.style.opacity = drawn > 2 && drawn < total - 2 ? 1 : 0;
    }

    build();
    return {
      build: build, update: update,
      resized: function () { return o.box.clientWidth !== lastW || o.box.offsetHeight !== lastH; }
    };
  }

  var vines = [];

  /* 1. The Welcome vine: weaves beside each phrase and ends in a flower */
  var welcomeSvg = document.getElementById('vine'), welcomeBox = document.getElementById('scrolly-steps');
  if (welcomeSvg && welcomeBox && steps.length && welcomeSvg.getBBox) {
    vines.push(Vine({
      svg: welcomeSvg, box: welcomeBox, seed: 7, lead: 0.62, flower: true,
      style: { dim: [104, 124, 128], bright: [190, 222, 216], width: [1.6, 3.8, 5.2], opacity: [0.55, 1],
               leafGap: [42, 56], leafSize: [0.6, 1.15, 1.5], leafOpacity: [0.6, 1], midrib: true,
               loopR: [26, 42], wobble: [0.06, 0.11], tip: [3.5, 4.5] },
      waypoints: function (W, H, narrow, b) {
        var pts = [{ x: W * 0.5, y: 0 }];
        steps.forEach(function (step, i) {
          var ps = step.querySelectorAll('p');
          var r1 = ps[0].getBoundingClientRect(), r2 = ps[ps.length - 1].getBoundingClientRect();
          var left = Math.min(r1.left, r2.left) - b.left, right = Math.max(r1.right, r2.right) - b.left;
          var gap = narrow ? 16 : 48, edge = narrow ? 14 : 32;
          var x = Math.max(edge, Math.min(W - edge, i % 2 === 1 ? left - gap : right + gap));
          var top = Math.min(r1.top, r2.top) - b.top, bottom = r2.bottom - b.top;
          /* run calmly down beside the phrase, then cross over (and curl) in the space between phrases */
          pts.push({ x: x, y: top - 6, calm: true });
          pts.push({ x: x, y: i === steps.length - 1 ? (top + bottom) / 2 : bottom + 6, loop: i === 1 || i === 3 });
        });
        return pts;
      }
    }));
  }

  /* 2. A faint vine that carries on down the rest of the page. It slips off the edges now and
     then and comes back, reaching into the page mostly through the empty gaps between blocks of text. */
  var bgSvg = document.getElementById('vine-bg'), mainEl = document.getElementById('main');
  var contactEl = document.getElementById('contact');
  var CONTENT = 'h1,h2,h3,p,li,summary,legend,label,blockquote,figure,img,.place,.fee-card,.form,.quals,.btn,.timeline';
  if (bgSvg && mainEl && scrolly && contactEl && bgSvg.getBBox) {
    vines.push(Vine({
      svg: bgSvg, box: mainEl, seed: 41, lead: 0.72, flower: false,
      style: { dim: [138, 182, 175], bright: [138, 182, 175], width: [1.4, 1.6, 2], opacity: [0.24, 0.32],
               leafGap: [50, 64], leafSize: [0.7, 0.9, 1.1], leafOpacity: [0.18, 0.26], midrib: false,
               loopR: [20, 32], wobble: [0.03, 0.025], tip: [2, 2.5], loopOutward: true },
      waypoints: function (W, H, narrow, b, rand) {
        var top = scrolly.offsetTop + scrolly.offsetHeight + 20;
        var bottom = contactEl.offsetTop;
        var vh = window.innerHeight;

        /* Find the empty horizontal bands between blocks of content */
        var spans = [];
        Array.prototype.forEach.call(mainEl.querySelectorAll(CONTENT), function (el) {
          if (el.closest('#welcome')) return;
          var r = el.getBoundingClientRect();
          if (r.height < 1) return;
          spans.push([r.top - b.top - 12, r.bottom - b.top + 12]);
        });
        spans.sort(function (p, q) { return p[0] - q[0]; });
        var gaps = [], edge = top;
        spans.forEach(function (sp) {
          if (sp[0] > edge + 60 && sp[0] > top && edge < bottom) gaps.push({ c: (edge + Math.min(sp[0], bottom)) / 2, h: Math.min(sp[0], bottom) - edge });
          edge = Math.max(edge, sp[1]);
        });

        function off(side) { return side < 0 ? -140 : W + 140; }
        function reach(side) {
          var depth = W * lerp(narrow ? 0.28 : 0.14, narrow ? 0.55 : 0.32, rand());
          return side < 0 ? depth : W - depth;
        }
        var side = 1, y = top, pts = [{ x: off(side), y: y, calm: true }], visit = 0;
        gaps.forEach(function (gap) {
          var g = gap.c, half = lerp(150, 240, rand());
          var cross = gap.h > 110 && rand() < 0.5;          // about half the visits sweep right across the gap
          if (cross) half = Math.min(half, gap.h * 0.5 + 60);
          if (g - half < y + vh * 0.25 || g + half > bottom) return;   // short spell out of sight first
          if (rand() < 0.2) return;                                      // skip the odd gap, so it isn't predictable
          var newSide = rand() < 0.55 ? -side : side;
          if (newSide !== side) {
            pts.push({ x: off(side), y: g - half - 2, calm: true });
            pts.push({ x: off(newSide), y: g - half, jump: true });
            side = newSide;
          } else {
            pts.push({ x: off(side), y: g - half });
          }
          if (cross) {
            /* in one side, across the gap with a gentle wave, and out the other side */
            pts.push({ x: W * lerp(0.42, 0.58, rand()), y: g, loop: visit === 2 });
            side = -side;
          } else {
            pts.push({ x: reach(side), y: g, loop: visit === 2 });       // reach into the gap
          }
          pts.push({ x: off(side), y: g + half, calm: true });           // and back out
          y = g + half; visit++;
        });
        pts.push({ x: off(side), y: Math.max(y + 10, bottom), calm: true });
        return pts;
      }
    }));
  }

  if (vines.length) {
    var rebuildAll = function () { vines.forEach(function (v) { v.build(); }); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuildAll);
    window.addEventListener('load', rebuildAll);
    var rt;
    var rebuildIfResized = function () {
      if (!vines.some(function (v) { return v.resized(); })) return;   // ignore phone toolbar show/hide
      clearTimeout(rt); rt = setTimeout(rebuildAll, 150);
    };
    window.addEventListener('resize', rebuildIfResized);
    /* If a section changes height after the vine is drawn (e.g. phone browsers settling their
       screen size after load), redraw it, otherwise the vine is squashed and falls behind the scroll */
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(rebuildIfResized);
      [welcomeBox, mainEl].forEach(function (el) { if (el) ro.observe(el); });
    }
    /* Opening FAQ answers changes the page height, so the background vine is re-laid out */
    document.querySelectorAll('details').forEach(function (d) {
      d.addEventListener('toggle', function () { clearTimeout(rt); rt = setTimeout(rebuildAll, 120); });
    });
  }

  /* ---------- How it works line draws as you read ---------- */
  var timeline = document.getElementById('timeline');

  /* ---------- Sticky contact button on phones ---------- */
  var sticky = document.getElementById('sticky-cta');
  var heroActions = document.querySelector('.hero-actions');
  var contactSection = document.getElementById('contact');

  function clamp(n) { return Math.max(0, Math.min(1, n)); }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var vh = window.innerHeight;
      if (header) header.classList.toggle('scrolled', window.scrollY > 8);
      vines.forEach(function (v) { v.update(vh); });
      if (timeline && !reduceMotion) {
        var t = timeline.getBoundingClientRect();
        timeline.style.setProperty('--tl', clamp((vh * 0.65 - t.top) / t.height).toFixed(3));
      }
      if (sticky && heroActions && contactSection) {
        var pastHero = heroActions.getBoundingClientRect().bottom < 0;
        var atForm = contactSection.getBoundingClientRect().top < vh;
        sticky.classList.toggle('show', pastHero && !atForm);
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Enquiry form (Formspree) ---------- */
  var form = document.getElementById('enquiry-form');
  if (!form) return;
  var errorBox = document.getElementById('form-error');
  var submitBtn = document.getElementById('f-submit');
  var success = document.getElementById('form-success');

  function showError(msg) { errorBox.textContent = msg; errorBox.hidden = false; }

  function validate() {
    var ok = true, firstBad = null;
    form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('invalid'); });
    [
      ['f-first', function (v) { return v.trim().length > 0; }],
      ['f-last', function (v) { return v.trim().length > 0; }],
      ['f-email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }],
      ['f-avail', function (v) { return v.trim().length > 0; }]
    ].forEach(function (c) {
      var el = document.getElementById(c[0]);
      if (!c[1](el.value)) { ok = false; el.closest('.field').classList.add('invalid'); firstBad = firstBad || el; }
    });
    if (!form.querySelector('input[name="location"]:checked')) {
      ok = false;
      var fs = document.getElementById('f-loc-online').closest('fieldset');
      fs.classList.add('invalid'); firstBad = firstBad || fs.querySelector('input');
    }
    if (!ok) {
      showError('Please complete all required fields.');
      if (firstBad) firstBad.focus();
    }
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.hidden = true;
    if (!validate()) return;

    if (form.action.indexOf('YOUR_FORM_ID') > -1) {
      showError('Preview only: the form isn’t connected yet. Add the Formspree form ID to go live.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) {
          /* Formspree explains what went wrong (e.g. an invalid email) as JSON */
          return res.json().catch(function () { return {}; }).then(function (data) {
            var msg = data && data.errors ? data.errors.map(function (er) { return er.message; }).join(' ') : '';
            throw new Error(msg);
          });
        }
        var name = document.getElementById('f-first').value.trim();
        document.getElementById('success-name').textContent = name ? ', ' + name : '';
        form.classList.add('sent');
        success.hidden = false;
        success.focus();
      })
      .catch(function (err) {
        showError((err && err.message ? err.message + ' ' : '') + 'Sorry, your message didn’t send. Please try again, or email charlottecrosslandtherapy@gmail.com or call 07396 810749.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send';
      });
  });
})();
