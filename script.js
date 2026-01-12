// ... Firebase config code here ...

const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');
cv.width = 5000; cv.height = 2000;

function render() {
    ctx.clearRect(0, 0, 5000, 2000);
    
    // গাঢ় পিক্সেল গ্রিড (স্বচ্ছতা বাড়িয়ে খণ্ড খণ্ড করা হয়েছে)
    ctx.strokeStyle = "#222"; 
    ctx.lineWidth = 1;
    for(let x=0; x<=5000; x+=20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,2000); ctx.stroke(); }
    for(let y=0; y<=2000; y+=20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(5000,y); ctx.stroke(); }

    // লোগো রেন্ডারিং
    Object.keys(pixels).forEach(id => {
        const p = pixels[id];
        if(p.imageUrl) {
            const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
            img.onload = () => {
                const sz = Math.sqrt(parseInt(p.pixelCount));
                ctx.drawImage(img, p.x, p.y, sz, sz);
                // লোগোর বর্ডার
                ctx.strokeStyle = "#FFD700";
                ctx.lineWidth = 2;
                ctx.strokeRect(p.x, p.y, sz, sz);
            };
        }
    });
}

// ... বাকি সব Zoom, Pan, Search এবং Hover Logic আগের মতোই কার্যকর থাকবে ...
