// script.js — fetch con cache-busting + botón 'Actualizar datos' + indicador de estado
const DATA_URL = 'data.json';

async function loadData(){
  try{
    // cache-busting: agregamos timestamp para evitar versiones cacheadas
    const url = DATA_URL + '?cb=' + Date.now();
    const resp = await fetch(url, {cache:'no-store'});
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    renderData(data);
    showStatus('Datos cargados: ' + (data.week_of || 'sin semana'));
  }catch(err){
    console.warn('Error cargando data.json — usando fallback', err);
    showStatus('No se pudo cargar data.json — usando datos locales', true);
    if(window.__DATA_FALLBACK__) renderData(window.__DATA_FALLBACK__);
  }
}

function renderData(d){
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mostrar week_of + service_time en la meta si existe
  const metaEl = document.getElementById('service-time');
  if(d.week_of){
    metaEl.textContent = (d.service_time ? d.service_time + ' · ' : '') + 'Semana: ' + d.week_of;
  } else {
    metaEl.textContent = d.service_time || '—';
  }

// script.js — prioriza JSON embebido, si falla intenta fetch
function getEmbeddedData(){
  const el = document.getElementById('initial-data');
  if(!el) return null;
  try{
    return JSON.parse(el.textContent);
  }catch(e){
    console.warn('embedded JSON parse error', e);
    return null;
  }
}

async function loadData(){
  // 1) intenta leer embedded
  const embedded = getEmbeddedData();
  if(embedded){
    renderData(embedded);
    showStatus('Datos cargados desde HTML (embebido)');
    return;
  }

  // 2) si no hay embedded, intenta fetch con cache-busting
  try{
    const resp = await fetch('data.json?cb=' + Date.now(), {cache: 'no-store'});
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    const d = await resp.json();
    renderData(d);
    showStatus('Datos cargados desde data.json');
  }catch(err){
    console.warn('No se pudo cargar data.json', err);
    showStatus('No se pudo cargar data.json — usando fallback', true);
    if(window.__DATA_FALLBACK__) renderData(window.__DATA_FALLBACK__);
  }
}


  document.getElementById('sermon-leader').textContent = d.sermon_leader || '—';
  document.getElementById('worship-leader').textContent = d.worship_leader || '—';

  // Escuela dominical
  document.getElementById('ss-adults').textContent = d.sunday_school?.adults || '—';
  document.getElementById('ss-youth').textContent = d.sunday_school?.youth || '—';
  document.getElementById('ss-pre').textContent = d.sunday_school?.pre || '—';
  document.getElementById('ss-children').textContent = d.sunday_school?.children || '—';

  // Anuncios
  const annList = document.getElementById('ann-list');
  annList.innerHTML = '';
  (d.announcements || []).forEach(a => {
    const li = document.createElement('li');
    li.className = 'ann-item';
    const h4 = document.createElement('h4');
    h4.textContent = a.title;
    const p = document.createElement('p');
    p.textContent = a.body;
    li.appendChild(h4); li.appendChild(p);
    annList.appendChild(li);
  });
}

function showStatus(msg, isError=false){
  console[isError ? 'warn' : 'info'](msg);
  const el = document.getElementById('data-status');
  if(el){
    el.textContent = msg;
    el.style.color = isError ? '#b91c1c' : '#0b5aa6';
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('reload-data');
  if(btn){
    btn.addEventListener('click', ()=>{
      btn.disabled = true;
      const old = btn.textContent;
      btn.textContent = 'Actualizando...';
      setTimeout(()=>{ // pequeña animación UX
        loadData().finally(()=>{
          btn.disabled = false;
          btn.textContent = old;
        });
      }, 250);
    });
  }
  // carga inicial
  loadData();
});

window.__DATA_FALLBACK__ = {
  "week_of": "2026-02-01",
  "announcements": [
    {
      "title": "Torneo Bíblico - Sociedad Cristiana de Jóvenes",
      "body": "Sábado 18:30 - Iglesia World Wide Mission."
    },
    {
      "title": "Oración de Madrugada",
      "body": "Sábado 18:30 - Iglesia World Wide Mission."
    },
    {
      "title": "Taller de Pedagogía para Maestros de Escuela Dominical",
      "body": "Sábado 18 de abril - Iglesia World Wide Mission."
    }
  ],
  "sermon_leader": "Pastor Gregorio Gironda",
  "worship_leader": "Hno. Audon Suxo",
  "service_time": "Domingo 9:00 - Culto Principal",
  "sunday_school": {
    "adults": "Hno. Alvaro Flores",
    "youth": "Hna. Karen Arcani",
    "pre": "Hna. Viky Lizbeth Suxo",
    "children": "Hna. Hortencia Peña"
  }
};
