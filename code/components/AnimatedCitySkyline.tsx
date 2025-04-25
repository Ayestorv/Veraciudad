import React, { useEffect, useRef } from 'react';

interface AnimatedCitySkylineProps {
  className?: string;
}

const AnimatedCitySkyline: React.FC<AnimatedCitySkylineProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const skylineImageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Load skyline image
    const skylineImage = new Image();
    skylineImage.src = '/new-york-city-skyline.png';
    skylineImageRef.current = skylineImage;
    
    skylineImage.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions to match window
      const updateCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      // Handle window resize
      window.addEventListener('resize', updateCanvasSize);
      updateCanvasSize();
      
      // Animation variables
      let time = 0;
      const radialPoints: { x: number; y: number; radius: number; speed: number; hue: number }[] = [];
      
      // Create initial radial points
      for (let i = 0; i < 5; i++) {
        radialPoints.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height * 0.7),
          radius: 50 + Math.random() * 200,
          speed: 0.2 + Math.random() * 0.5,
          hue: Math.random() * 60 + 200 // Blue-purple hues
        });
      }
      
      // Animation function
      const animate = () => {
        time += 0.01;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a2a'); // Dark blue at top
        gradient.addColorStop(1, '#1a1a3a'); // Lighter blue at bottom
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw radial gradients
        radialPoints.forEach(point => {
          // Update position with gentle floating motion
          point.x += Math.sin(time * point.speed) * 0.5;
          point.y += Math.cos(time * point.speed) * 0.5;
          
          // Ensure points stay within bounds
          if (point.x < -point.radius) point.x = canvas.width + point.radius;
          if (point.x > canvas.width + point.radius) point.x = -point.radius;
          if (point.y < -point.radius) point.y = canvas.height + point.radius;
          if (point.y > canvas.height + point.radius) point.y = -point.radius;
          
          // Create radial gradient
          const radialGradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, point.radius
          );
          
          const hueShift = Math.sin(time) * 10;
          radialGradient.addColorStop(0, `hsla(${point.hue + hueShift}, 70%, 60%, 0.2)`);
          radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = radialGradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Draw subtle stars
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * (canvas.height * 0.6);
          const opacity = Math.random() * 0.5 + 0.2;
          const size = Math.random() * 1.5;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw skyline silhouette at bottom
        if (skylineImageRef.current) {
          const skylineHeight = canvas.height * 0.3; // 30% of canvas height
          const skylineWidth = (skylineImageRef.current.width / skylineImageRef.current.height) * skylineHeight;
          
          // Center the skyline
          const skylineX = (canvas.width - skylineWidth) / 2;
          const skylineY = canvas.height - skylineHeight;
          
          // Draw with silhouette effect
          ctx.globalCompositeOperation = 'destination-out';
          ctx.drawImage(
            skylineImageRef.current,
            skylineX, skylineY,
            skylineWidth, skylineHeight
          );
          
          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over';
          
          // Add a glowing effect along the skyline
          const skylineGlow = ctx.createLinearGradient(0, skylineY, 0, canvas.height);
          skylineGlow.addColorStop(0, 'rgba(60, 120, 255, 0.2)');
          skylineGlow.addColorStop(1, 'rgba(60, 120, 255, 0)');
          
          ctx.fillStyle = skylineGlow;
          ctx.fillRect(0, skylineY, canvas.width, skylineHeight);
          
          // Draw small city lights
          for (let i = 0; i < 200; i++) {
            const x = skylineX + Math.random() * skylineWidth;
            const y = skylineY + Math.random() * skylineHeight * 0.8;
            const size = Math.random() * 2 + 0.5;
            const opacity = Math.random() * 0.8 + 0.2;
            
            ctx.fillStyle = `rgba(255, 255, 150, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // Continue animation
        animationRef.current = requestAnimationFrame(animate);
      };
      
      // Start animation
      animate();
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default AnimatedCitySkyline; 