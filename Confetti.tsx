import React, { useEffect, useRef } from 'react';

const Confetti: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const parent = canvas.parentElement;
        if(!parent) return;

        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
        const pieces: { x: number; y: number; size: number; color: string; speedX: number; speedY: number, rotation: number, rotationSpeed: number }[] = [];
        const numberOfPieces = 50;

        for (let i = 0; i < numberOfPieces; i++) {
            pieces.push({
                x: canvas.width / 2,
                y: canvas.height * 0.8,
                size: Math.random() * 5 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: Math.random() * 8 - 4,
                speedY: Math.random() * -10 - 5,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5,
            });
        }

        let animationFrameId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            pieces.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.speedY += 0.2; // Gravity
                p.rotation += p.rotationSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" />;
};

export default Confetti;
