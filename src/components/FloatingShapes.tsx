import { useEffect, useRef } from 'react';

interface FloatingShapesProps {
  isDark: boolean;
}

export default function FloatingShapes({ isDark }: FloatingShapesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 50 : 250;
    const CONNECTION_DISTANCE = 100;
    const GRID_CELL_SIZE = CONNECTION_DISTANCE;

    const particles: Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    const colors = isDark 
      ? ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']
      : ['#1d4ed8', '#6d28d9', '#be185d', '#d97706', '#047857', '#0369a1'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: Math.random() * 2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let isRunning = true;
    const buildSpatialGrid = () => {
      const cols = Math.ceil(canvas.width / GRID_CELL_SIZE);
      const rows = Math.ceil(canvas.height / GRID_CELL_SIZE);
      const grid: Array<Array<Array<typeof particles[0]>>> = [];
      
      for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
          grid[i][j] = [];
        }
      }
      
      for (const p of particles) {
        const col = Math.floor(p.x / GRID_CELL_SIZE);
        const row = Math.floor(p.y / GRID_CELL_SIZE);
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          grid[col][row].push(p);
        }
      }
      
      return { grid, cols, rows };
    };
    let animId: number;

    const animate = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distSq = dx * dx + dy * dy;
        const maxDist = 150;
        const maxDistSq = maxDist * maxDist;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const force = (maxDist - dist) / maxDist;
          p.x -= (dx / dist) * force * 10;
          p.y -= (dy / dist) * force * 10;
        } else {
          p.x += (p.baseX - p.x) * 0.05 + p.vx;
          p.y += (p.baseY - p.y) * 0.05 + p.vy;
        }

        if (p.x < 0 || p.x > canvas.width) p.baseX = Math.random() * canvas.width;
        if (p.y < 0 || p.y > canvas.height) p.baseY = Math.random() * canvas.height;

        ctx.save();
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!isMobile) {
        const { grid, cols, rows } = buildSpatialGrid();
        
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const col = Math.floor(p.x / GRID_CELL_SIZE);
          const row = Math.floor(p.y / GRID_CELL_SIZE);
          
          for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
            for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
              const cell = grid[c][r];
              for (let j = 0; j < cell.length; j++) {
                const p2 = cell[j];
                if (p2 === p) continue;
                
                const dx2 = p.x - p2.x;
                const dy2 = p.y - p2.y;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                if (dist2 < CONNECTION_DISTANCE) {
                  ctx.strokeStyle = p.color;
                  ctx.globalAlpha = (1 - dist2 / CONNECTION_DISTANCE) * 0.2;
                  ctx.lineWidth = 0.5;
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.stroke();
                }
              }
            }
          }
        }
      }
      
      ctx.restore();

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
}