// --- main.js ---
(function(){
  const JQUERY_CDN = 'https://code.jquery.com/jquery-3.7.1.min.js';
  const AOS_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css';
  const AOS_JS = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js';

  function loadCSS(href){
    if(!document.querySelector(`link[href="${href}"]`)){
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
    }
  }
  function loadScript(src, cb){
    if(document.querySelector(`script[src="${src}"]`)){
      cb && cb();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => cb && cb();
    s.onerror = () => { console.warn('Failed to load script', src); cb && cb(); };
    document.body.appendChild(s);
  }

  function loadArtistsJSON(cb){
    if(window.MUSEHUB_DATA) return cb(window.MUSEHUB_DATA);
    function tryFetch(path){
      return fetch(path).then(r => {
        if(!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    }
    tryFetch('assets/artists.json')
      .then(data => { window.MUSEHUB_DATA = data; cb(data); })
      .catch(err1 => {
        tryFetch('artists.json')
          .then(data => { window.MUSEHUB_DATA = data; cb(data); })
          .catch(err2 => { console.error('[MUSEHUB] Failed to load artists.json', err2); cb([]); });
      });
  }

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('musehub_theme', theme); } catch(e){}
    const btn = document.getElementById('theme-toggle-btn');
    if(btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  function initTheme(){
  const stored = (localStorage.getItem('musehub_theme') || 'dark');
  applyTheme(stored);


  const btn = document.getElementById('theme-toggle-btn');
  if(btn){
    btn.textContent = stored === 'dark' ? '🌙' : '☀️';
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
}


  function initBackToTop(){
    if(document.getElementById('back-to-top')) return;
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.textContent = '↑';
    btn.title = 'Back to top';
    btn.setAttribute('aria-label', 'Back to top');
    Object.assign(btn.style, {position:'fixed', right:'18px', bottom:'18px', zIndex:9999, display:'none', padding:'8px 10px', borderRadius:'8px'});
    document.body.appendChild(btn);
    btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
    window.addEventListener('scroll', ()=> { btn.style.display = (window.scrollY>300)?'block':'none'; });
  }

  function initScrollSpy(){
    const sidebar = document.querySelector('.sidebar');
    if(!sidebar) return;
    const sections = Array.from(document.querySelectorAll('section[id], main > section[id]'));
    if(sections.length === 0) return;
    function highlight(){
      const pos = window.scrollY + 120;
      let current = null;
      sections.forEach(s => { const top = s.getBoundingClientRect().top + window.scrollY; if(pos>=top) current = s; });
      sidebar.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      if(current){
        const id = current.id;
        const link = sidebar.querySelector(`a[href="#${id}"]`);
        if(link) link.classList.add('active');
      }
    }
    window.addEventListener('scroll', highlight);
    highlight();
  }
  /* ---------- Top Music: dynamic populate + interaction ---------- */
function initTopMusic(){
  const container = document.getElementById('top-music-list');
  if(!container) return;

  // Источник данных: если есть window.MUSEHUB_DATA — попробуем создать треки из него,
  // иначе используем локальный fallback.
  let tracks = [];

  if(window.MUSEHUB_DATA && Array.isArray(window.MUSEHUB_DATA) && window.MUSEHUB_DATA.length){
    // постараемся взять первые треки из artists.json, иначе конвертируем артиста в трек
    window.MUSEHUB_DATA.slice(0, 12).forEach((a, idx) => {
      const tName = (a.tracks && a.tracks[0]) || (a.name ? (a.name + " — Best") : ("Track " + (idx+1)));
      tracks.push({
        id: (a.id || ('t-' + idx)),
        title: tName,
        artist: a.name || 'Unknown Artist',
        duration: a.duration || a.track_duration || '03:30',
        art: (a.image ? (a.image.startsWith('assets/') ? a.image : ('assets/images/' + a.image)) : 'assets/images/placeholder-track.jpg')
      });
    });
  }

  // fallback sample tracks (if none)
  if(tracks.length === 0){
    tracks = [
      { id:'t1', title:'Memories — Maroon 5', artist:'Maroon 5', duration:'04:20', art:'assets/images/memories.jpg' },
      { id:'t2', title:'Anti-Hero — Taylor Swift', artist:'Taylor Swift', duration:'03:54', art:'assets/images/anti-hero.jpg' },
      { id:'t3', title:'Blinding Lights', artist:'The Weeknd', duration:'03:20', art:'assets/images/blinding-lights.jpg' },
      { id:'t4', title:'Leave The Door Open', artist:'Bruno Mars', duration:'04:02', art:'assets/images/leave-door.jpg' },
      { id:'t5', title:'Bad Habits', artist:'Ed Sheeran', duration:'03:50', art:'assets/images/bad-habits.jpg' }
    ];
  }

  container.innerHTML = ''; // очистим

  // helper: render one row
  function makeRow(track){
    const row = document.createElement('div');
    row.className = 'track-row';
    row.setAttribute('data-track-id', track.id);

    // left side: thumbnail + title
    const left = document.createElement('div'); left.className = 'track-left';
    const img = document.createElement('img'); img.src = track.art || '';
    img.alt = track.title || 'track';
    img.loading = 'lazy';
    img.onerror = function(){ this.onerror = null; this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%230b0b0b"/></svg>'; };

    const tt = document.createElement('div'); tt.className = 'track-title';
    const t = document.createElement('div'); t.className = 'title'; t.textContent = track.title;
    const m = document.createElement('div'); m.className = 'meta'; m.textContent = `${track.artist} • ${track.duration}`;

    tt.appendChild(t); tt.appendChild(m);
    left.appendChild(img); left.appendChild(tt);

    // controls
    const controls = document.createElement('div'); controls.className = 'track-controls';

    // play button
    const btnPlay = document.createElement('button');
    btnPlay.className = 'btn-play';
    btnPlay.setAttribute('aria-label', 'Play');
    btnPlay.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#icon-play"></use></svg>`;

    // like button
    const btnLike = document.createElement('button');
    btnLike.className = 'btn-like';
    btnLike.setAttribute('aria-pressed', 'false');
    btnLike.setAttribute('aria-label', 'Like');
    btnLike.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#icon-heart"></use></svg>`;

    controls.appendChild(btnPlay);
    controls.appendChild(btnLike);

    row.appendChild(left);
    row.appendChild(controls);

    // events
    btnPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      // set Now Playing (existing global helper if present)
      if(window.setNowPlaying) window.setNowPlaying(track.title);
      // mark active row
      document.querySelectorAll('.track-row').forEach(r=>r.classList.remove('active'));
      row.classList.add('active');

      // sync footer play icon to "pause"
      const footerUse = document.querySelector('#svg-play-state use');
      if(footerUse) footerUse.setAttribute('href', '#icon-pause');

      // toggle icon in this button to pause
      const useEl = btnPlay.querySelector('use');
      if(useEl) useEl.setAttribute('href', '#icon-pause');

      // optionally, if previously another row had play icon = pause, reset it
      document.querySelectorAll('.track-row .btn-play').forEach(b => {
        if(b !== btnPlay){
          const u = b.querySelector('use'); if(u) u.setAttribute('href', '#icon-play');
        }
      });
    });

    // clicking anywhere on row also plays
    row.addEventListener('click', ()=> btnPlay.click());

    // like toggle
    btnLike.addEventListener('click', (e) => {
      e.stopPropagation();
      const liked = btnLike.classList.toggle('liked');
      btnLike.setAttribute('aria-pressed', String(liked));
      // optionally persist to localStorage:
      // const likedSet = JSON.parse(localStorage.getItem('musehub_likes')||'{}'); likedSet[track.id]=liked; localStorage.setItem('musehub_likes', JSON.stringify(likedSet));
    });

    return row;
  }

  // render tracks
  tracks.forEach(t => container.appendChild(makeRow(t)));
}


  function initGlobalSearchBridge(){
    const el = document.getElementById('global-search');
    if(!el) return;
    el.setAttribute('aria-label', 'Global search');
    el.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){
        const q = el.value.trim();
        try { localStorage.setItem('musehub_search_query', q); } catch(e){}
        window.location.href = 'artists.html';
      }
    });
  }

  function initAOS(){
    loadCSS(AOS_CSS);
    loadScript(AOS_JS, ()=> { if(window.AOS) window.AOS.init({duration:600, once:true}); });
  }

  /* NEW: rightbar actions (Top Artist → artists search; Recently Played → now playing) */
  function initRightbarActions(){
    // Top Artist items: set search and navigate to artists page
    const topItems = document.querySelectorAll('.rightbar h5 + .list-group .list-group-item');
    topItems.forEach(el => {
      el.addEventListener('click', () => {
        const q = el.textContent.trim();
        try { localStorage.setItem('musehub_search_query', q); } catch(e){}
        window.location.href = 'artists.html';
      });
    });

    // Recently Played: set now playing text
    const recentHeader = Array.from(document.querySelectorAll('.rightbar h5')).find(h => /Recently Played/i.test(h.textContent));
    if(recentHeader){
      const list = recentHeader.nextElementSibling;
      if(list){
        Array.from(list.children).forEach(li => {
          li.addEventListener('click', () => {
            const t = li.textContent.trim();
            const el = document.getElementById('now-playing');
            if(el) el.textContent = 'Now Playing: ' + t;
            // optionally show a quick flash on player
            const player = document.querySelector('.player');
            if(player){ player.classList.add('pulse'); setTimeout(()=>player.classList.remove('pulse'), 600); }
          });
        });
      }
    }
  }

  // small visual pulse CSS injection if desired
  (function injectPulseStyles(){
    const s = document.createElement('style');
    s.textContent = `.player.pulse{ box-shadow: 0 12px 40px rgba(123,43,255,0.12); transform: translateY(-4px); transition: all .18s ease; }`;
    document.head.appendChild(s);
  })();

  // start
  loadArtistsJSON(()=> {
    initTheme();
    initTopMusic();
    initBackToTop();
    initGlobalSearchBridge();
    initScrollSpy();
    initAOS();
    initRightbarActions(); // <-- new
    window.musehubUtils = { refreshAOS: ()=> { if(window.AOS) window.AOS.refresh(); } };
  });

})();


// --- artists.js ---
/* js/artists.js — robust image src detection + fallback placeholders */
(function(){
  // inline SVG placeholders (data URI)
  const PERSON_PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>
      <rect width='100%' height='100%' fill='%23e6e6e6'/>
      <g fill='%23999'>
        <circle cx='300' cy='200' r='110'/>
        <path d='M120 460c30-60 360-60 420 0v40H120z'/>
      </g>
    </svg>`
  );

  function ensureData(cb){
    if(window.MUSEHUB_DATA) return cb(window.MUSEHUB_DATA);
    fetch('assets/artists.json').then(r => r.json()).then(data => {
      window.MUSEHUB_DATA = data;
      cb(data);
    }).catch(err => {
      console.error('artists.js: fetch failed', err);
      cb([]);
    });
  }

  function slugToHref(id){ return `artistDetail.html?id=${encodeURIComponent(id)}`; }

  function formatNumber(n){
    if(n === null || n === undefined) return '—';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function resolveImageSrc(imageVal) {
    if (!imageVal) return PERSON_PLACEHOLDER;

    const v = String(imageVal).trim();

    // Уже полный URL (http, data:, //)
    if (/^data:|^https?:|^\/\//i.test(v)) return v;

    // Уже локальный путь с assets/images — просто вернём как есть
    if (v.startsWith('assets/images/')) return v;

    // Просто имя файла (the-weeknd.jpg) → добавим префикс
    if (!v.includes('/')) return `assets/images/${v}`;

    // Относительный путь (images/..., ./images/...) → нормализуем
    if (v.startsWith('images/') || v.startsWith('./images/')) {
      return 'assets/' + v.replace(/^(\.\/)?images\//, 'images/');
    }

    // Всё остальное — fallback
    return PERSON_PLACEHOLDER;
  }

  function makeCardElement(artist){
    const li = document.createElement('li');
    li.className = 'col';

    const card = document.createElement('div');
    card.className = 'card h-100 artist-card';
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');

    // image
    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.alt = artist.name || 'artist';

    const src = resolveImageSrc(artist.image);
    img.src = src;
    img.loading = 'lazy';

    img.onerror = function(){
      img.onerror = null;
      // fallback to PERSON placeholder
      img.src = PERSON_PLACEHOLDER;
    };

    // body
    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h5'); title.className='card-title'; title.textContent = artist.name;
    const p = document.createElement('p'); p.className='card-text'; p.textContent = `${artist.genre || '—'} • ${artist.country || '—'}`;

    const listeners = artist.monthly_listeners ?? artist.popularity ?? null;
    const meta = document.createElement('p');
    meta.className = 'small text-muted';
    meta.textContent = `Monthly listeners: ${listeners ? formatNumber(listeners) : '—'}`;

    body.appendChild(title); body.appendChild(p); body.appendChild(meta);

    card.appendChild(img); card.appendChild(body);
    li.appendChild(card);

    const go = () => { window.location.href = slugToHref(artist.id); };
    card.addEventListener('click', () => go());
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });

    card.setAttribute('data-aos', 'fade-up');

    return li;
  }

  function fadeOutIn(container, renderFn){
    container.style.transition = 'opacity .18s';
    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = '';
      renderFn();
      container.style.opacity = '0';
      void container.offsetWidth;
      container.style.transition = 'opacity .25s';
      container.style.opacity = '1';
      if(window.musehubUtils) window.musehubUtils.refreshAOS();
    }, 180);
  }

  function render(container, data){
    const frag = document.createDocumentFragment();
    data.forEach(a => frag.appendChild(makeCardElement(a)));
    container.appendChild(frag);
  }

  function init(){
    const container = document.getElementById('artist-list');
    if(!container) return;
    ensureData((all) => {
      // populate genre select
      const genreSelect = document.getElementById('genre');
      if(genreSelect){
        const genres = Array.from(new Set(all.map(a => a.genre))).sort();
        genres.forEach(g => { const o = document.createElement('option'); o.value = g; o.textContent = g; genreSelect.appendChild(o); });
      }
      // populate sort select with more options
      const sortSelect = document.getElementById('sort');
      if(sortSelect){
        if(!Array.from(sortSelect.options).some(o=>o.value==='monthly_listeners')){
          const opt = document.createElement('option'); opt.value='monthly_listeners'; opt.text='Sort by listeners'; sortSelect.appendChild(opt);
        }
        if(!Array.from(sortSelect.options).some(o=>o.value==='genre')){
          const opt = document.createElement('option'); opt.value='genre'; opt.text='Sort by genre'; sortSelect.appendChild(opt);
        }
      }

      let filtered = all.slice();

      const globalQ = localStorage.getItem('musehub_search_query');
      if(globalQ){
        const s = document.getElementById('search'); if(s) s.value = globalQ;
        localStorage.removeItem('musehub_search_query');
      }

      function applyFilters(){
        const q = (document.getElementById('search')?.value || '').toLowerCase().trim();
        const genre = document.getElementById('genre')?.value || '';
        const sort = document.getElementById('sort')?.value || 'name';

        filtered = all.filter(a => {
          const hay = (a.name + ' ' + (a.tracks||[]).join(' ') + ' ' + a.genre).toLowerCase();
          const matchesQ = !q || hay.includes(q);
          const matchesG = !genre || a.genre === genre;
          return matchesQ && matchesG;
        });

        if(sort === 'name') filtered.sort((x,y)=> x.name.localeCompare(y.name));
        else if(sort === 'monthly_listeners') filtered.sort((x,y)=> (y.monthly_listeners||y.popularity||0) - (x.monthly_listeners||x.popularity||0));
        else if(sort === 'genre') filtered.sort((x,y)=> x.genre.localeCompare(y.genre) || x.name.localeCompare(y.name));

        fadeOutIn(container, ()=> render(container, filtered));
      }

      ['search','genre','sort'].forEach(id => {
        const el = document.getElementById(id);
        if(!el) return;
        el.addEventListener('input', debounce(applyFilters, 180));
        el.addEventListener('change', applyFilters);
      });

      render(container, filtered);
    });
  }

  function debounce(fn, ms){
    let t;
    return function(...a){
      clearTimeout(t);
      t = setTimeout(()=> fn.apply(this,a), ms);
    };
  }

  document.addEventListener('DOMContentLoaded', init);
})();


// --- artistDetail.js ---
/* js/artistDetail.js — robust image handling + placeholders */
(function(){
  const PERSON_PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>
      <rect width='100%' height='100%' fill='%23e6e6e6'/>
      <g fill='%23999'>
        <circle cx='300' cy='200' r='110'/>
        <path d='M120 460c30-60 360-60 420 0v40H120z'/>
      </g>
    </svg>`
  );

  const NOTE_PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>
      <rect width='100%' height='100%' fill='%23efefef'/>
      <g fill='%239aa'>
        <path d='M420 120v220c0 44-36 80-80 80H220v40c0 11-9 20-20 20s-20-9-20-20V420c0-44 36-80 80-80h120V120h40z'/>
      </g>
    </svg>`
  );

  function getIdFromUrl(){
    const params = new URLSearchParams(location.search);
    return params.get('id');
  }

  function ensureData(cb){
    if(window.MUSEHUB_DATA) return cb(window.MUSEHUB_DATA);
    fetch('assets/artists.json').then(r=>r.json()).then(data => {
      window.MUSEHUB_DATA = data;
      cb(data);
    }).catch(()=> cb([]));
  }

  function resolveImageSrc(imageVal) {
    if (!imageVal) return PERSON_PLACEHOLDER;

    const v = String(imageVal).trim();

    // Уже полный URL (http, data:, //)
    if (/^data:|^https?:|^\/\//i.test(v)) return v;

    // Уже локальный путь с assets/images — просто вернём как есть
    if (v.startsWith('assets/images/')) return v;

    // Просто имя файла (the-weeknd.jpg) → добавим префикс
    if (!v.includes('/')) return `assets/images/${v}`;

    // Относительный путь (images/..., ./images/...) → нормализуем
    if (v.startsWith('images/') || v.startsWith('./images/')) {
      return 'assets/' + v.replace(/^(\.\/)?images\//, 'images/');
    }

    // Всё остальное — fallback
    return PERSON_PLACEHOLDER;
  }

  function createModal(tracks, artistName){
    const old = document.getElementById('mh-track-modal');
    if(old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mh-track-modal';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 99999;

    const box = document.createElement('div');
    box.style.width = 'min(900px, 95%)';
    box.style.maxHeight = '90vh';
    box.style.background = '#fff';
    box.style.borderRadius = '12px';
    box.style.padding = '1rem';
    box.style.position = 'relative';
    box.style.overflow = 'hidden';

    const title = document.createElement('h4');
    title.textContent = `${artistName} — Tracks`;
    box.appendChild(title);

    const slider = document.createElement('div');
    slider.style.display = 'flex';
    slider.style.gap = '10px';
    slider.style.transition = 'transform .35s ease';
    slider.style.width = '100%';

    tracks.forEach((t, i) => {
      const s = document.createElement('div');
      s.style.minWidth = '100%';
      s.style.flex = '0 0 100%';
      s.style.boxSizing = 'border-box';

      const h = document.createElement('h5'); h.textContent = t;
      const p = document.createElement('p'); p.textContent = `Track ${i+1} — ${t}`;
      const play = document.createElement('button'); play.textContent = 'Play (simulate)';
      play.addEventListener('click', ()=> {
        if(window.setNowPlaying) window.setNowPlaying(`${t} — ${artistName}`);
      });
      s.appendChild(h); s.appendChild(p); s.appendChild(play);
      slider.appendChild(s);
    });

    const container = document.createElement('div');
    container.style.overflow = 'hidden';
    container.appendChild(slider);
    box.appendChild(container);

    let index = 0;
    const prevBtn = document.createElement('button'); prevBtn.textContent = '◀';
    const nextBtn = document.createElement('button'); nextBtn.textContent = '▶';
    prevBtn.style.marginRight = '0.5rem';
    prevBtn.addEventListener('click', () => {
      index = Math.max(0, index-1);
      slider.style.transform = `translateX(-${index*100}%)`;
    });
    nextBtn.addEventListener('click', () => {
      index = Math.min(tracks.length-1, index+1);
      slider.style.transform = `translateX(-${index*100}%)`;
    });
    const ctrl = document.createElement('div');
    ctrl.style.position = 'absolute';
    ctrl.style.bottom = '12px';
    ctrl.style.left = '12px';
    ctrl.appendChild(prevBtn);
    ctrl.appendChild(nextBtn);
    box.appendChild(ctrl);

    overlay.addEventListener('click', (e)=>{
      if(e.target === overlay) overlay.remove();
    });

    const close = document.createElement('button');
    close.textContent = '✖';
    close.style.position='absolute';
    close.style.top='8px';
    close.style.right='8px';
    close.addEventListener('click', ()=> overlay.remove());
    box.appendChild(close);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  function renderArtist(artist){
    if(!artist) {
      const el = document.getElementById('artist-name');
      if(el) el.textContent = 'Artist not found';
      return;
    }

    document.getElementById('artist-name').textContent = artist.name;
    const img = document.getElementById('artist-photo');
    if(img){
      img.src = resolveImageSrc(artist.image, false);
      img.loading = 'lazy';
      img.onerror = function(){ img.onerror = null; img.src = PERSON_PLACEHOLDER; };
    }

    document.getElementById('artist-genre').textContent = artist.genre || '—';
    document.getElementById('artist-country').textContent = artist.country || '—';
    document.getElementById('artist-bio').textContent = artist.bio || '';

    const ol = document.getElementById('artist-tracks');
    ol.innerHTML = '';
    (artist.tracks || []).forEach(t => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = t;
      span.className = 'btn btn-outline-secondary btn-sm';
      span.style.margin = '6px 0';
      span.style.cursor = 'default';
      span.style.pointerEvents = 'none';
      li.appendChild(span);
      ol.appendChild(li);
    });


    const favBtn = document.getElementById('favorite-button');
    if(favBtn){
      const favs = JSON.parse(localStorage.getItem('musehub_favs') || '[]');
      favBtn.textContent = favs.includes(artist.id) ? 'In favorites' : 'Add to favorites';
      favBtn.onclick = () => {
        let f = JSON.parse(localStorage.getItem('musehub_favs') || '[]');
        if(f.includes(artist.id)){
          f = f.filter(x=>x!==artist.id);
          favBtn.textContent = 'Add to favorites';
        } else {
          f.push(artist.id);
          favBtn.textContent = 'In favorites';
        }
        localStorage.setItem('musehub_favs', JSON.stringify(f));
      };
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const id = getIdFromUrl();
    if(!id) return;
    ensureData((all) => {
      const artist = all.find(a => a.id === id);
      if(!artist) {
        const lower = id.toLowerCase();
        const f = all.find(a => a.id.toLowerCase() === lower || a.name.toLowerCase() === lower);
        if(f) return renderArtist(f);
      }
      renderArtist(artist);
    });
  });
})();


// --- ui-fixes.js ---
// js/ui-fixes.js
document.addEventListener('DOMContentLoaded', () => {
  const topbar = document.querySelector('.topbar');
  if(!topbar) return;

  // If .topbar-left/.topbar-center/.topbar-right already exist, do nothing.
  if(!topbar.querySelector('.topbar-left') && !topbar.querySelector('.topbar-center') && !topbar.querySelector('.topbar-right')){
    // take existing children and distribute:
    const children = Array.from(topbar.children);
    // create wrappers
    const left = document.createElement('div'); left.className = 'topbar-left';
    const center = document.createElement('div'); center.className = 'topbar-center';
    const right = document.createElement('div'); right.className = 'topbar-right';

    // Heuristic distribution:
    // - if first child contains brand text, put into left
    // - search input (if found) goes center
    // - everything else goes right
    let placedSearch = false;
    children.forEach((ch, idx) => {
      // move nodes by content
      const hasSearch = ch.querySelector && ch.querySelector('input[type="search"], input#global-search, .search');
      const hasBrandText = ch.textContent && ch.textContent.trim().length && idx === 0;
      if(hasBrandText && !left.children.length){
        left.appendChild(ch);
      } else if(hasSearch && !placedSearch){
        center.appendChild(ch);
        placedSearch = true;
      } else {
        // by default append to right if we already placed search or if it's the last node
        right.appendChild(ch);
      }
    });

    // ensure there is at least something in center (if search not found)
    if(!center.children.length){
      // if left has more than one child, move second to center
      if(left.children.length > 1){
        center.appendChild(left.children[1]);
      } else if(right.children.length){
        center.appendChild(right.children[0]);
      }
    }

    // clear topbar and append wrappers
    topbar.innerHTML = '';
    topbar.appendChild(left);
    topbar.appendChild(center);
    topbar.appendChild(right);
  }

  // If theme button exists somewhere, move it into right area and style
  const themeBtn = document.getElementById('theme-toggle-btn');
  const rightArea = document.querySelector('.topbar-right');
  if(themeBtn){
    if(rightArea && themeBtn.parentElement !== rightArea){
      rightArea.appendChild(themeBtn);
    }
    // ensure visual style
    themeBtn.style.display = 'inline-flex';
    themeBtn.style.alignItems = 'center';
    themeBtn.style.justifyContent = 'center';
    themeBtn.style.zIndex = 80;
  }

  // Small reflow fix: ensure search has enough min-width
  const search = document.querySelector('.topbar .search input');
  if(search){
    search.style.minWidth = '180px';
    search.style.maxWidth = '720px';
  }

  // final micro-adjust after layout
  setTimeout(()=> {
    // if search visually overlaps theme button, nudge theme button right using margin
    const tbtn = document.getElementById('theme-toggle-btn');
    if(tbtn){
      const tbRect = tbtn.getBoundingClientRect();
      const sRect = search ? search.getBoundingClientRect() : null;
      if(sRect && tbRect.left < sRect.right + 8){
        tbtn.style.marginLeft = '12px';
      }
    }
  }, 80);
});


