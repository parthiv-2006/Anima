import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * SpriteAnimator - Renders frame-by-frame sprite sheet animations
 * @param {string} spriteSheet - Path to sprite sheet image
 * @param {number} frameCount - Total number of frames in the sprite sheet
 * @param {number} frameWidth - Width of each frame in pixels
 * @param {number} frameHeight - Height of each frame in pixels
 * @param {number} fps - Frames per second for animation speed
 * @param {boolean} loop - Whether to loop the animation
 * @param {Function} onComplete - Callback when animation completes
 */
export default function SpriteAnimator({
  spriteSheet,
  frameCount,
  frameWidth,
  frameHeight,
  fps = 10,
  loop = true,
  scale = 1,
  onComplete
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameInterval = 1000 / fps;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const nextFrame = prev + 1;
        
        if (nextFrame >= frameCount) {
          if (loop) {
            return 0;
          } else {
            clearInterval(interval);
            onComplete?.();
            return prev;
          }
        }
        
        return nextFrame;
      });
    }, frameInterval);

    return () => clearInterval(interval);
  }, [frameCount, frameInterval, loop, onComplete]);

  const backgroundPositionX = -(currentFrame * frameWidth);

  return (
    <div
      style={{
        width: frameWidth * scale,
        height: frameHeight * scale,
        backgroundImage: `url(${spriteSheet})`,
        backgroundPosition: `${backgroundPositionX * scale}px 0`,
        backgroundSize: `${frameCount * frameWidth * scale}px ${frameHeight * scale}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'crisp-edges'
      }}
    />
  );
}
