import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikeAnimationProps {
  isLiked: boolean;
  onDoubleClick: () => void;
  children: React.ReactNode;
}

const LikeAnimation: React.FC<LikeAnimationProps> = ({ isLiked, onDoubleClick, children }) => {
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowHeart(true);
    onDoubleClick();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showHeart) {
      timer = setTimeout(() => {
        setShowHeart(false);
      }, 1000); // Heart stays for 1 second
    }
    return () => clearTimeout(timer);
  }, [showHeart]);

  return (
    <div className="relative w-full h-full" onDoubleClick={handleDoubleClick}>
      {children}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart
            className={
              "fill-white text-white drop-shadow-lg animate-heart-pop"
            }
            size={100}
          />
        </div>
      )}
    </div>
  );
};

export default LikeAnimation;