import { useState } from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  size?: number;
}

export function Logo({ className = "", imgClassName = "", size = 32 }: LogoProps) {
  const [error, setError] = useState(false);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {!error ? (
        <img 
          src="/assets/logo.png" 
          alt="DLX Logo" 
          className={`object-contain ${imgClassName}`}
          style={{ width: size, height: size }}
          onError={() => setError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div 
          className="bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center font-black italic shadow-lg"
          style={{ width: size, height: size, fontSize: size * 0.6 }}
        >
          D
        </div>
      )}
    </div>
  );
}
