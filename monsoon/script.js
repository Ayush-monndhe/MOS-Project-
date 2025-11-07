const WEATHERAPI_KEY = 'd6ffdfcd7f0c448ca23223947250611'; // provided by user
  const SEARCH_ENDPOINT = 'https://api.weatherapi.com/v1/search.json';
  const CURRENT_ENDPOINT = 'https://api.weatherapi.com/v1/current.json';

  // ---------------------------
  // Helpers
  // ---------------------------
  function $(sel){return document.querySelector(sel)}
  function $all(sel){return Array.from(document.querySelectorAll(sel))}

  function debounce(fn, wait=300){
    let t;return function(...args){clearTimeout(t);t=setTimeout(()=>fn.apply(this,args),wait)}
  }

  function createEl(tag, props={}, children=[]){
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v])=>el.setAttribute(k,v));
    children.forEach(c => typeof c === 'string' ? el.appendChild(document.createTextNode(c)) : el.appendChild(c));
    return el;
  }

  // Keyboard accessible suggestion navigation
  let activeIndex = -1;

  // ---------------------------
  // UI elements
  // ---------------------------
  const input = $('#city-input');
  const suggestionsEl = $('#suggestions');
  const cityNameEl = $('#city-name');
  const localTimeEl = $('#local-time');
  const tempEl = $('#temp');
  const conditionTextEl = $('#condition-text');
  const metaEl = $('#meta');
  const weatherIconEl = $('#weather-icon');
  const bigIconEl = $('#big-icon');
  const bigTempEl = $('#big-temp');
  const bigCondEl = $('#big-cond');
  const detailsEl = $('#details');
  const feelsEl = $('#feelslike');
  const precipEl = $('#precip');
  const uvEl = $('#uv');
  const dayNightEl = $('#day-night');
  const extraInfoEl = $('#extra-info');

  // temp scale buttons
  const cBtn = $('#c-btn');
  const fBtn = $('#f-btn');
  let currentUnit = 'C';

  cBtn.addEventListener('click', ()=>{currentUnit='C';cBtn.setAttribute('aria-pressed','true');fBtn.setAttribute('aria-pressed','false');updateTempDisplay()});
  fBtn.addEventListener('click', ()=>{currentUnit='F';cBtn.setAttribute('aria-pressed','false');fBtn.setAttribute('aria-pressed','true');updateTempDisplay()});

  let latestWeather = null;

  // ---------------------------
  // Fetch helpers
  // ---------------------------
  async function searchCities(q){
    if(!q || q.length < 1) return [];
    const url = `${SEARCH_ENDPOINT}?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(q)}`;
    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error('Search failed');
      const data = await res.json();
      return data; // array of {id, name, region, country, url}
    }catch(err){
      console.error(err);
      return [];
    }
  }

  async function fetchCurrent(q){
    const url = `${CURRENT_ENDPOINT}?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();
    return data;
  }

  // ---------------------------
  // UI update helpers
  // ---------------------------
  function showSuggestions(list){
    suggestionsEl.innerHTML='';
    if(!list || list.length===0){ suggestionsEl.hidden = true; return; }
    list.forEach((item, idx)=>{
      const el = createEl('div',{class:'suggestion','data-index':idx,tabindex:0},[
        createEl('strong',{},[`${item.name}`]),
        document.createTextNode(` — ${item.region ? item.region+',' : ''} ${item.country}`)
      ]);
      el.addEventListener('click', ()=>selectSuggestion(item));
      el.addEventListener('keydown',(e)=>{ if(e.key === 'Enter') selectSuggestion(item)});
      suggestionsEl.appendChild(el);
    });
    activeIndex = -1;
    suggestionsEl.hidden = false;
  }

  function selectSuggestion(item){
    input.value = item.name + (item.region ? ', '+item.region : '');
    suggestionsEl.hidden = true;
    loadWeatherFor(item.name);
  }

  function clearSuggestions(){ suggestionsEl.hidden = true; suggestionsEl.innerHTML=''; }

  function updateTempDisplay(){
    if(!latestWeather) return;
    const c = latestWeather.current.temp_c;
    const f = latestWeather.current.temp_f;
    tempEl.textContent = currentUnit === 'C' ? `${Math.round(c)}°C` : `${Math.round(f)}°F`;
    bigTempEl.textContent = currentUnit === 'C' ? `${Math.round(c)}°C` : `${Math.round(f)}°F`;
    feelsEl.textContent = currentUnit === 'C' ? `Feels like ${Math.round(latestWeather.current.feelslike_c)}°C` : `Feels like ${Math.round(latestWeather.current.feelslike_f)}°F`;
  }

  function updateUI(data){
    latestWeather = data;
    const loc = data.location;
    const cur = data.current;

    cityNameEl.textContent = `${loc.name}, ${loc.country}`;
    localTimeEl.textContent = `Local: ${loc.localtime}`;
    conditionTextEl.textContent = cur.condition.text;
    metaEl.textContent = `Humidity: ${cur.humidity}% • Wind: ${cur.wind_kph} kph`;
    feelsEl.textContent = `Feels like ${cur.feelslike_c}°C`;
    precipEl.textContent = `Precip ${cur.precip_mm} mm`;
    uvEl.textContent = `UV ${cur.uv}`;
    dayNightEl.textContent = cur.is_day ? 'Day' : 'Night';

    // icon
    const iconUrl = 'https:' + cur.condition.icon;
    weatherIconEl.innerHTML = `<img src="${iconUrl}" alt="${cur.condition.text}" width="64" height="64">`;
    bigIconEl.innerHTML = `<img src="${iconUrl}" alt="${cur.condition.text}" width="72" height="72">`;
    bigCondEl.textContent = cur.condition.text;

    // extra info (sunrise/sunset if available from forecast not current — WeatherAPI current doesn't return sunrise; if you need forecast use forecast endpoint)
    extraInfoEl.innerHTML = `<div class="muted">Local time: ${loc.localtime} • Cloud: ${cur.cloud}%</div>`;

    updateTempDisplay();
    applyBackground(cur);
  }

  // background based on temp & day/night
  function applyBackground(cur){
    const root = document.documentElement;
    const temp_c = cur.temp_c;
    const isDay = !!cur.is_day;

    let g1='#051937', g2='#0b486b';
    if(!isDay){
      g1 = '#001021'; g2='#002b4d';
    }
    // shift by temperature
    if(temp_c <= 0){ g1 = '#001f3f'; g2 = '#003b6f'; }
    else if(temp_c > 0 && temp_c <=15){ g1 = '#0b3d91'; g2 = '#1ea0ff'; }
    else if(temp_c > 15 && temp_c <=25){ g1 = '#3ed6a6'; g2 = '#00a8ff'; }
    else if(temp_c > 25){ g1 = '#ff7e5f'; g2 = '#feb47b'; }

    document.body.style.background = `linear-gradient(180deg, ${g1} 0%, ${g2} 100%)`;
  }

  // ---------------------------
  // Main handlers
  // ---------------------------
  const handleSearch = debounce(async function(e){
    const q = e.target.value.trim();
    if(!q){ clearSuggestions(); return; }
    const results = await searchCities(q);
    showSuggestions(results.slice(0,8));
  }, 280);

  input.addEventListener('input', handleSearch);

  input.addEventListener('keydown', (e)=>{
    const items = Array.from(suggestionsEl.querySelectorAll('.suggestion'));
    if(suggestionsEl.hidden) return;
    if(e.key === 'ArrowDown'){
      activeIndex = (activeIndex + 1) % items.length;
      items.forEach(i=>i.classList.remove('active'));
      items[activeIndex].classList.add('active');
      items[activeIndex].focus();
      e.preventDefault();
    } else if(e.key === 'ArrowUp'){
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      items.forEach(i=>i.classList.remove('active'));
      items[activeIndex].classList.add('active');
      items[activeIndex].focus();
      e.preventDefault();
    } else if(e.key === 'Enter'){
      // if an item is active, select it, otherwise try to fetch by typed name
      const active = suggestionsEl.querySelector('.suggestion.active');
      if(active){ active.click(); }
      else {
        const q = input.value.trim(); if(q) loadWeatherFor(q);
      }
    } else if(e.key === 'Escape'){
      clearSuggestions();
    }
  });

  async function loadWeatherFor(q){
    try{
      cityNameEl.textContent = 'Loading...';
      const data = await fetchCurrent(q);
      updateUI(data);
    }catch(err){
      console.error(err);
      cityNameEl.textContent = 'City not found';
      tempEl.textContent = '--°C';
      conditionTextEl.textContent = '—';
    }
  }

  // click outside suggestions to close
  document.addEventListener('click',(e)=>{
    if(!e.target.closest('.search-box')){ suggestionsEl.hidden=true }
  });

  // try user's geolocation on load (best-effort)
  window.addEventListener('load', ()=>{
    // optionally use geolocation; fallback to a default city
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(async position=>{
        const {latitude,longitude} = position.coords;
        // WeatherAPI allows lat,long queries as "lat,lon"
        const q = `${latitude},${longitude}`;
        try{ const data = await fetchCurrent(q); updateUI(data); }
        catch(e){ console.warn('Geolocation fetch failed',e); }
      }, ()=>{
        // fallback: load a default city
        loadWeatherFor('New York');
      }, {timeout:5000});
    } else {
      loadWeatherFor('New York');
    }
  });
  
