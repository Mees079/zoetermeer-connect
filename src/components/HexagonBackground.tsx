import { useEffect, useRef } from 'react';

export const HexagonBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    interface Hexagon {
      x: number;
      y: number;
      size: number;
      opacity: number;
      velocityX: number;
      velocityY: number;
    }

    const hexagons: Hexagon[] = [];
    const hexagonCount = 15;

    for (let i = 0; i < hexagonCount; i++) {
      hexagons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 100 + 50,
        opacity: Math.random() * 0.3 + 0.1,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5,
      });
    }

    const drawHexagon = (hex: Hexagon) => {
      ctx.save();
      ctx.translate(hex.x, hex.y);
      ctx.beginPath();
      
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = hex.size * Math.cos(angle);
        const y = hex.size * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.strokeStyle = `rgba(59, 130, 246, ${hex.opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, hex.size);
      gradient.addColorStop(0, `rgba(59, 130, 246, ${hex.opacity * 0.2})`);
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.restore();
    };

    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      hexagons.forEach((hex) => {
        hex.x += hex.velocityX + scrollY * 0.001;
        hex.y += hex.velocityY;

        if (hex.x < -hex.size) hex.x = canvas.width + hex.size;
        if (hex.x > canvas.width + hex.size) hex.x = -hex.size;
        if (hex.y < -hex.size) hex.y = canvas.height + hex.size;
        if (hex.y > canvas.height + hex.size) hex.y = -hex.size;

        drawHexagon(hex);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="hexagon-bg" />;
};
