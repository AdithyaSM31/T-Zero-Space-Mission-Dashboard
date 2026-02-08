"use client";

import React, { useRef, useEffect } from "react";

interface GalaxyProps {
  mouseInteraction?: boolean;
}

const Galaxy: React.FC<GalaxyProps> = ({ mouseInteraction = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Galaxy parameters
    const particles: Particle[] = [];
    const particleCount = 4000; // Increased for better density
    const centerX = width / 2;
    const centerY = height / 2;

    class Particle {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      angle: number;
      radius: number;
      speed: number;

      constructor() {
        // Random angle
        this.angle = Math.random() * Math.PI * 2;
        // Random distance from center (spiral distribution)
        // Using a power function to cluster stars in the center
        // Adjusted for much more uniformity, reducing center density significantly
        // Expanded to cover larger area using max dimension
        this.radius = (Math.random() * 0.3 + Math.pow(Math.random(), 0.5) * 0.7) * (Math.max(width, height));
        this.speed = (0.0005 + Math.random() * 0.001) / (this.radius * 0.005 + 1); // Inner stars move faster
        
        // Add random variation to simulate arms
        const armCount = 3;
        const armOffset = Math.floor(Math.random() * armCount) * (Math.PI * 2 / armCount);
        // Perturbation to spread out the arms
        const perturbation = (Math.random() - 0.5) * 4.0; // Wider spread for uniformity
        
        // Store base angle for rotation
        this.angle = armOffset + this.radius * 0.001 + perturbation;

        this.x = centerX + Math.cos(this.angle) * this.radius;
        this.y = centerY + Math.sin(this.angle) * this.radius;
        this.z = Math.random() * 2; // Depth simulation
        this.size = Math.random() < 0.98 ? Math.random() * 1.0 : Math.random() * 2.5 + 1; // Few larger stars

        // Color based on distance (Blue/White outer, Yellow/Red inner)
        const distRatio = this.radius / (Math.max(width, height) * 0.7);
        if (Math.random() > 0.9) {
             this.color = "white";
        } else if (distRatio < 0.2) {
            this.color = `rgba(255, ${200 + Math.random() * 55}, ${200 + Math.random() * 55}, ${0.5 + Math.random() * 0.5})`; // Warm center
        } else if (distRatio < 0.6) {
             this.color = `rgba(${200 + Math.random() * 55}, ${220 + Math.random() * 35}, 255, ${0.4 + Math.random() * 0.4})`; // Blue/White middle
        } else {
             this.color = `rgba(${100 + Math.random() * 100}, ${100 + Math.random() * 100}, 255, ${0.2 + Math.random() * 0.3})`; // Deep blue outer
        }
      }

      update() {
        // Rotate around center
        this.angle += this.speed;
        this.x = centerX + Math.cos(this.angle) * this.radius;
        this.y = centerY + Math.sin(this.angle) * this.radius;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        // Simple depth scale
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.2)"; // Slate-950 with trail
      ctx.fillRect(0, 0, width, height);

      // Handle mouse interaction (tilt effect)
      let tiltX = 0;
      let tiltY = 0;
      if (mouseInteraction) {
          tiltX = (mouseX - width / 2) * 0.0001;
          tiltY = (mouseY - height / 2) * 0.0001;
      }

      particles.forEach((p) => {
        p.angle += tiltX; 
        // p.radius += tiltY; // Maybe zoom?
        p.update();
        p.draw(ctx);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!mouseInteraction) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Initial size setup
    handleResize();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseInteraction]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full object-cover -z-50 bg-slate-950" 
    />
  );
};

export default Galaxy;
