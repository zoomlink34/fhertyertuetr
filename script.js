const firebaseConfig = {
  apiKey: "AIzaSyDcFXKaFi1lPOV5wMqFwcjhXlpKdpKkxgE",
  authDomain: "the-10-million-pixels-plus.firebaseapp.com",
  projectId: "the-10-million-pixels-plus",
  databaseURL: "https://the-10-million-pixels-plus-default-rtdb.firebaseio.com/",
  storageBucket: "the-10-million-pixels-plus.firebasestorage.app",
  messagingSenderId: "589782307046",
  appId: "1:589782307046:web:fcc40b27c846d5dcb86b27"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');
cv.width = 5000; cv.height = 2000;

let scale = 0.2, pX = 0, pY = 0, isD = false, sX, sY, pixels = {};
const hoverBox = document.getElementById('hover-info');

// Trail Effect
const tCv = document.getElementById('trailCanvas'); const tCtx = tCv.getContext('2d');
let dots = []; window.onresize = () => { tCv.width = window.innerWidth; tCv.height = window.innerHeight; }; window.onresize();
window.addEventListener('mousemove', (e) => { for(let i=0; i<2; i++) dots.push({x: e.clientX, y: e.clientY, a: 1, s: Math.random()*2}); });
function drawT() { tCtx.clearRect(0,0,tCv.width,tCv.height); dots.forEach((d, i) => { d.a -= 0.03; tCtx.fillStyle = `rgba(212, 175, 55, ${d.a})`; tCtx.beginPath(); tCtx.arc(d.x, d.y, d.s, 0, Math.PI*2); tCtx.fill(); if(d.a <= 0) dots.splice(i, 1); }); requestAnimationFrame(drawT); } drawT();

// Fire Effect
const fCv = document.getElementById('fireCanvas'); const fCtx = fCv.getContext('2d');
fCv.width = window.innerWidth; fCv.height = 100;
let pt = [];
function animF() { fCtx.clearRect(0,0,fCv.width,100); if(pt.length < 80) pt.push({x: Math.random()*fCv.width, y: 100, a: 1, s: Math.random()*2}); pt.forEach((p, i) => { p.y -= 0.6; p.a -= 0.01; fCtx.fillStyle = `rgba(255, 69, 0, ${p.a})`; fCtx.fillRect(p.x, p.y, p.s, p.s); if(p.a <= 0) pt.splice(i, 1); }); requestAnimationFrame(animF); } animF();

// Canvas Logic
function updateUI() { document.getElementById('mover').style.transform = `translate(${pX}px,${pY}px) scale(${scale})`; }
function zoomIn() { scale = Math.min(scale * 1.3, 4); updateUI(); }
function zoomOut() { scale = Math.max(scale / 1.3, 0.05); updateUI(); }
function toggleSearch() { document.getElementById('search-panel').classList.toggle('search-hidden'); }

function render() {
    ctx.clearRect(0, 0, 5000, 2000);
    ctx.strokeStyle = "#eee";
    for(let x=0; x<=5000; x+=100) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,2000); ctx.stroke(); }
    for(let y=0; y<=2000; y+=100) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(5000,y); ctx.stroke(); }
    Object.keys(pixels).forEach(id => {
        const p = pixels[id];
        if(p.imageUrl) {
            const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
            img.onload = () => { const size = Math.sqrt(parseInt(p.pixelCount)); ctx.drawImage(img, p.x, p.y, size, size); };
        }
    });
}

db.ref('pixels').on('value', s => { pixels = s.val() || {}; render(); document.getElementById('pixel-count-display').innerText = Object.keys(pixels).length * 100; });

const vp = document.getElementById('viewport');
vp.onmousedown = (e) => { isD = true; sX = e.clientX-pX; sY = e.clientY-pY; };
window.onmouseup = () => isD = false;
window.onmousemove = (e) => {
    if(isD){ pX = e.clientX-sX; pY = e.clientY-sY; updateUI(); }
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left - pX) / scale;
    const my = (e.clientY - rect.top - pY) / scale;
    let found = false;
    Object.keys(pixels).forEach(id => {
        const p = pixels[id]; const sz = Math.sqrt(parseInt(p.pixelCount));
        if(mx>=p.x && mx<=p.x+sz && my>=p.y && my<=p.y+sz) {
            hoverBox.style.display = 'block'; hoverBox.style.left = (e.clientX - vp.getBoundingClientRect().left + 15) + 'px';
            hoverBox.style.top = (e.clientY - vp.getBoundingClientRect().top + 15) + 'px';
            hoverBox.innerText = p.name + " (" + p.pixelCount + " Pixels)"; found = true;
        }
    });
    if(!found) hoverBox.style.display = 'none';
};

function searchPixel() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const res = document.getElementById('searchResult'); res.innerHTML = ""; if(!q) return;
    Object.keys(pixels).forEach(id => {
        if(pixels[id].name.toLowerCase().includes(q)) {
            const d = document.createElement('div'); d.style.padding = "8px"; d.style.borderBottom = "1px solid #eee"; d.style.cursor = "pointer";
            d.innerText = pixels[id].name; d.onclick = () => {
                const p = pixels[id]; const sz = Math.sqrt(parseInt(p.pixelCount));
                scale = 1.2; pX = (vp.offsetWidth/2) - (p.x + sz/2)*scale; pY = (vp.offsetHeight/2) - (p.y + sz/2)*scale; updateUI();
            };
            res.appendChild(d);
        }
    });
}
