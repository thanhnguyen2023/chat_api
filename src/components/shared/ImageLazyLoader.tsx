import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageLazyLoaderProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageLazyLoader: React.FC<ImageLazyLoaderProps> = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative w-full h-full", className)}>
      {!loaded && (
        <div className="absolute inset-0  bg-muted animate-pulse flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      )}
       <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn("object-cover w-full h-full transition-opacity  duration-300", loaded ? "opacity-100" : "opacity-0")}
      />
      
    </div>
  );
};

export default ImageLazyLoader;