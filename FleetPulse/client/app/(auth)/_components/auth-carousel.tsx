"use client";

import React, { useState, useEffect } from "react";

const images = [
  "https://images.unsplash.com/photo-1591419478162-a4dd21b7ec0a?q=80&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1619302820124-e3b9d8a7f686?q=80&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1653106587625-e27944832833?q=80&w=3000&auto=format&fit=crop",
];

export function AuthCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Transition every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-zinc-100">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`FleetPulse Facility ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          } grayscale mix-blend-multiply`}
        />
      ))}
      {/* Subtle overlay for text legibility, monochrome */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Progress indicators */}
      <div className="absolute bottom-12 left-12 flex gap-2 z-20">
        {images.map((_, index) => (
          <div 
            key={index} 
            className={`h-1 transition-all duration-500 rounded-full ${
              index === currentIndex ? "w-8 bg-white" : "w-4 bg-white/40"
            }`} 
          />
        ))}
      </div>
    </div>
  );
}
