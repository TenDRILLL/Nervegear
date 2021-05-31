/*************************************
* BACKGROUND ANIMATION FOR MAIN MENU *
*************************************/

let canvas = document.getElementById("canvas")
let ctx = canvas.getContext('2d');
let stars = [], speed = 40, x = 100;
canvas.width = 785; canvas.height = 532;

function init() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0, x = stars.length; i < x; i++) {
        let s = stars[i];
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.stroke();
    }
    ctx.beginPath();
    for (let i = 0, x = stars.length; i < x; i++) {
        let starI = stars[i];
        ctx.moveTo(starI.x,starI.y);
        for (let j = 0, x = stars.length; j < x; j++) {
            let starII = stars[j];
            if(distance(starI, starII) < 150) {
                ctx.lineTo(starII.x,starII.y);
            }
        }
    }
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = 'white';
    ctx.stroke();
}

function refresh() {
    for (let i = 0, x = stars.length; i < x; i++) {
        let s = stars[i];
        s.x += s.vx / speed;
        s.y += s.vy / speed;
        if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
        if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;
    }
}

function distance( point1, point2 ){
    let xs; let ys;
    xs = point2.x - point1.x;
    xs = xs * xs;
    ys = point2.y - point1.y;
    ys = ys * ys;
    return Math.sqrt( xs + ys );
}

function loop() {
    init();
    refresh();
    requestAnimationFrame(loop);
}

for (let i = 0; i < x; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() + 1,
        vx: Math.floor(Math.random() * 50) - 25,
        vy: Math.floor(Math.random() * 50) - 25
    });
}

loop();