import { useEffect, useRef } from 'react';
import type { Theme } from '../data/wishes';
export function ParticleCanvas({ theme = 'blossoms', burst = 0, celebration = false, reduced = false }: {
    theme?: Theme;
    burst?: number;
    celebration?: boolean;
    reduced?: boolean;
}) { const ref = useRef<HTMLCanvasElement>(null); useEffect(() => { const canvas = ref.current; if (!canvas || reduced)
    return; const ctx = canvas.getContext('2d'); if (!ctx)
    return; let w = 0, h = 0, frame = 0, raf = 0, last = 0; const particles = Array.from({ length: celebration ? 150 : theme === 'blossoms' ? 28 : 65 }, (_, i) => ({ x: Math.random(), y: Math.random(), s: 2 + Math.random() * 5, v: .25 + Math.random() * .8, a: Math.random() * 6.28, color: ['#eeb0c3', '#d5af74', '#fff9e3', '#cfa6c3'][i % 4] })); const resize = () => { w = innerWidth; h = innerHeight; const dpr = Math.min(devicePixelRatio, 2); canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }; resize(); addEventListener('resize', resize); function draw(t: number) { raf = requestAnimationFrame(draw); if (document.hidden || t - last < 30)
    return; const dt = Math.min((t - last) / 16.67, 3); last = t; frame += dt; ctx!.clearRect(0, 0, w, h); particles.forEach((p, i) => { p.y += p.v * .0008 * dt; p.x += Math.sin(frame * .012 + i) * .00025 * dt; if (p.y > 1.05) {
    p.y = -.05;
    p.x = Math.random();
} ctx!.save(); ctx!.translate(p.x * w, p.y * h); ctx!.rotate(p.a + frame * .008); ctx!.globalAlpha = .4 + Math.sin(frame * .02 + i) * .2; ctx!.fillStyle = p.color; ctx!.strokeStyle = p.color; if (theme === 'hearts') {
    ctx!.beginPath();
    ctx!.moveTo(0, p.s);
    ctx!.bezierCurveTo(-p.s * 3, -p.s, p.s, -p.s * 2, 0, 0);
    ctx!.bezierCurveTo(p.s * 3, -p.s, -p.s, -p.s * 2, 0, p.s);
    ctx!.fill();
}
else if (theme === 'roses') {
    for (let k = 0; k < 5; k++) {
        ctx!.rotate(Math.PI * 2 / 5);
        ctx!.beginPath();
        ctx!.ellipse(0, -p.s * .6, p.s * .5, p.s * .75, 0, 0, Math.PI * 2);
        ctx!.fill();
    }
    ctx!.fillStyle = '#dfc48e';
    ctx!.beginPath();
    ctx!.arc(0, 0, p.s * .25, 0, 7);
    ctx!.fill();
}
else if (theme === 'candy') {
    ctx!.fillRect(-p.s, -p.s * .5, p.s * 2, p.s);
    ctx!.beginPath();
    ctx!.moveTo(-p.s, -p.s * .5);
    ctx!.lineTo(-p.s * 1.7, -p.s);
    ctx!.lineTo(-p.s * 1.7, p.s);
    ctx!.closePath();
    ctx!.fill();
    ctx!.beginPath();
    ctx!.moveTo(p.s, p.s * .5);
    ctx!.lineTo(p.s * 1.7, p.s);
    ctx!.lineTo(p.s * 1.7, -p.s);
    ctx!.closePath();
    ctx!.fill();
}
else if (theme === 'snow') {
    for (let k = 0; k < 3; k++) {
        ctx!.rotate(Math.PI / 3);
        ctx!.beginPath();
        ctx!.moveTo(-p.s, 0);
        ctx!.lineTo(p.s, 0);
        ctx!.strokeStyle = '#fffdf9';
        ctx!.stroke();
    }
}
else if (theme === 'shooting') {
    ctx!.beginPath();
    ctx!.moveTo(-p.s * 5, 0);
    ctx!.lineTo(p.s, 0);
    ctx!.stroke();
    ctx!.beginPath();
    ctx!.arc(p.s, 0, 1.5, 0, 7);
    ctx!.fill();
}
else if (['glitter', 'stardust', 'fireworks'].includes(theme)) {
    ctx!.beginPath();
    ctx!.moveTo(-p.s, 0);
    ctx!.lineTo(p.s, 0);
    ctx!.moveTo(0, -p.s);
    ctx!.lineTo(0, p.s);
    ctx!.stroke();
}
else if (theme === 'butterflies') {
    ctx!.scale(Math.sin(frame * .15 + i) * .6 + .7, 1);
    ctx!.beginPath();
    ctx!.ellipse(-p.s / 2, 0, p.s * .65, p.s, Math.PI / 4, 0, Math.PI * 2);
    ctx!.ellipse(p.s / 2, 0, p.s * .65, p.s, -Math.PI / 4, 0, Math.PI * 2);
    ctx!.fill();
}
else {
    ctx!.beginPath();
    ctx!.ellipse(0, 0, p.s * .5, p.s, Math.PI / 4, 0, Math.PI * 2);
    ctx!.fill();
} ctx!.restore(); }); if (celebration || theme === 'fireworks') {
    for (let k = 0; k < 4; k++) {
        const age = (frame + k * 45) % 180;
        if (age > 85)
            continue;
        const cx = w * (.15 + k * .23), cy = h * (.18 + (k % 2) * .18);
        for (let i = 0; i < 28; i++) {
            const a = i / 28 * Math.PI * 2, r = age * 1.8;
            ctx!.globalAlpha = (1 - age / 90) * .75;
            ctx!.fillStyle = k % 2 ? '#eab2be' : '#d8b574';
            ctx!.beginPath();
            ctx!.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r + age * age * .006, 2, 0, 7);
            ctx!.fill();
        }
    }
} } raf = requestAnimationFrame(draw); return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); }; }, [theme, burst, celebration, reduced]); return <canvas className="particle-canvas" ref={ref} aria-hidden="true"/>; }
