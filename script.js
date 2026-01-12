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

let scale = 0.22, pX = 0, pY = 0, isD = false, sX, sY, pixels = {};
const hoverBox = document.getElementById('hover-info');

function render() {
    ctx.fillStyle = "#ffffff"; // হোয়াইট কালার ব্যাকগ্রাউন্ড
    ctx.fillRect(0, 0, 5000, 2000);
    
    // কালো কালার দাগ (Black Grid)
    ctx.strokeStyle = "#000000"; 
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2; // দাগগুলো হালকা রাখা হয়েছে যাতে লোগো বোঝা যায়
    for(let x=0; x<=5000; x+=20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,2000); ctx.stroke(); }
    for(let y=0; y<=2000; y+=20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(5000,y); ctx.stroke(); }
    ctx.globalAlpha = 1.0;

    Object.keys(pixels).forEach(id => {
        const p = pixels[id];
        if(p.imageUrl) {
            const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
            img.onload = () => {
                const sz = Math.sqrt(parseInt(p.pixelCount));
                ctx.drawImage(img, p.x, p.y, sz, sz);
                ctx.strokeStyle = "#FFD700"; ctx.strokeRect(p.x, p.y, sz, sz);
            };
        }
    });
}

function updateUI() { document.getElementById('mover').style.transform = `translate(${pX}px,${pY}px) scale(${scale})`; }
function zoomIn() { scale = Math.min(scale * 1.3, 4); updateUI(); }
function zoomOut() { scale = Math.max(scale / 1.3, 0.05); updateUI(); }
function toggleSearch() { document.getElementById('search-panel').classList.toggle('search-hidden'); }

const vp = document.getElementById('viewport');
vp.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale = Math.min(Math.max(0.05, scale*(e.deltaY>0?0.9:1.1)), 4);
    updateUI();
}, {passive: false});

vp.onmousedown = (e) => { isD = true; sX = e.clientX-pX; sY = e.clientY-pY; vp.style.cursor="grabbing"; };
window.onmouseup = () => { isD = false; vp.style.cursor="grab"; };
window.onmousemove = (e) => {
    if(isD){ pX = e.clientX-sX; pY = e.clientY-sY; updateUI(); }
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left - pX) / scale;
    const my = (e.clientY - rect.top - pY) / scale;
    let found = false;
    Object.keys(pixels).forEach(id => {
        const p = pixels[id]; const sz = Math.sqrt(parseInt(p.pixelCount));
        if(mx>=p.x && mx<=p.x+sz && my>=p.y && my<=p.y+sz) {
            hoverBox.style.display = 'block';
            hoverBox.style.left = (e.clientX - vp.getBoundingClientRect().left + 15) + 'px';
            hoverBox.style.top = (e.clientY - vp.getBoundingClientRect().top + 15) + 'px';
            hoverBox.innerText = p.name + " (" + p.pixelCount + " px)"; found = true;
        }
    });
    if(!found) hoverBox.style.display = 'none';
};

db.ref('pixels').on('value', s => { pixels = s.val() || {}; render(); });
