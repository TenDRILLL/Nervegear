const canvas: HTMLCanvasElement = document.createElement("canvas");
let stars: Array<Star> = [], speed = 40, x = 100;

function init() {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if(!ctx) return;
    canvas.width = 785; canvas.height = 532;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0, x = stars.length; i < x; i++) {
        const star: Star = stars[i];
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.stroke();
    }
    ctx.beginPath();
    for (let i = 0, x = stars.length; i < x; i++) {
        const star: Star = stars[i];
        ctx.moveTo(star.x,star.y);
        for (let j = 0, x = stars.length; j < x; j++) {
            const star2: Star = stars[j];
            if(distance(star, star2) < 150) {
                ctx.lineTo(star2.x,star2.y);
            }
        }
    }
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = 'white';
    ctx.stroke();
}

function refresh() {
    for (let i = 0, x = stars.length; i < x; i++) {
        const star: Star = stars[i];
        star.x += star.vx / speed;
        star.y += star.vy / speed;
        if (star.x < 0 || star.x > canvas.width) star.vx = -star.vx;
        if (star.y < 0 || star.y > canvas.height) star.vy = -star.vy;
    }
}

function distance( point1, point2 ){
    let xs, ys;
    xs = point2.x - point1.x;
    xs = xs**2;
    ys = point2.y - point1.y;
    ys = ys**2;
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

class Star {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
}