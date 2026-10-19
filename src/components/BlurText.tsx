'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom' | 'left' | 'right';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, any>;
  animationTo?: Record<string, any>[];
  easing?: string;
  onAnimationComplete?: () => void;
  stepDuration?: number;
  blur?: number;
  distance?: number;
  effect?: 'blur' | 'zoom' | 'tilt' | 'focus' | 'drift';
  staggerFrom?: 'start' | 'end' | 'center' | 'random';
  trigger?: 'view' | 'load' | 'hover' | 'click';
  loop?: boolean;
  loopDelay?: number;
  color?: string;
  fromColor?: string;
  focusOnHover?: boolean;
}

const AXIS_OFFSETS = {
  top: { y: -1, x: 0 },
  bottom: { y: 1, x: 0 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 100,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  onAnimationComplete,
  stepDuration = 0.45,
  blur = 12,
  distance = 32,
  effect = 'blur',
  staggerFrom = 'start',
  trigger = 'view',
  loop = false,
  loopDelay = 3,
  color,
  fromColor,
  focusOnHover = false
}) => {
  const containerRef = useRef<HTMLParagraphElement | null>(null);
  const [isInView, setIsInView] = useState(trigger === 'load');
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const words = useMemo(() => text.split(' '), [text]);

  const tokens = useMemo(() => {
    if (animateBy === 'words') {
      return words.map((w, i) => ({
        token: w + (i < words.length - 1 ? '\u00A0' : ''),
        index: i
      }));
    }
    // Letters
    const list: Array<{ token: string; index: number }> = [];
    let count = 0;
    words.forEach((w, wi) => {
      w.split('').forEach(ch => {
        list.push({ token: ch, index: count++ });
      });
      if (wi < words.length - 1) {
        list.push({ token: '\u00A0', index: count++ });
      }
    });
    return list;
  }, [words, animateBy]);

  useEffect(() => {
    if (trigger === 'load') {
      setIsInView(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          onAnimationComplete?.();
          if (!loop) observer.disconnect();
        } else if (loop) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger, threshold, rootMargin, loop, onAnimationComplete]);

  const offset = AXIS_OFFSETS[direction] || AXIS_OFFSETS.top;

  return (
    <p
      ref={containerRef}
      className={className}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        margin: 0,
        color
      }}
      onMouseEnter={trigger === 'hover' ? () => setIsInView(true) : undefined}
      onMouseLeave={trigger === 'hover' ? () => setIsInView(false) : undefined}
      onClick={trigger === 'click' ? () => setIsInView(prev => !prev) : undefined}
    >
      {tokens.map((item, idx) => {
        const order =
          staggerFrom === 'end'
            ? tokens.length - 1 - idx
            : staggerFrom === 'center'
            ? Math.abs(idx - (tokens.length - 1) / 2)
            : idx;

        const tokenDelay = order * (delay / 1000);
        const isDimmed = focusOnHover && focusIndex !== null && focusIndex !== idx;

        // Effect-specific styles when unrevealed
        const unrevealedTransform =
          effect === 'zoom'
            ? `scale(1.4) translate3d(${offset.x * distance * 0.4}px, ${offset.y * distance * 0.4}px, 0)`
            : effect === 'tilt'
            ? `perspective(600px) rotateX(${offset.y * 45}deg) rotateY(${offset.x * 45}deg) translate3d(${offset.x * distance}px, ${offset.y * distance}px, 0)`
            : effect === 'drift'
            ? `skewX(${offset.x ? offset.x * 20 : 15}deg) translate3d(${offset.x * distance * 1.5}px, ${offset.y * distance}px, 0)`
            : `translate3d(${offset.x * distance}px, ${offset.y * distance}px, 0)`;

        return (
          <span
            key={idx}
            onMouseEnter={focusOnHover ? () => setFocusIndex(idx) : undefined}
            onMouseLeave={focusOnHover ? () => setFocusIndex(null) : undefined}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              willChange: 'transform, filter, opacity',
              opacity: isDimmed ? 0.3 : isInView ? 1 : 0,
              filter: isDimmed ? 'blur(4px)' : isInView ? 'blur(0px)' : `blur(${blur}px)`,
              transform: isInView ? 'translate3d(0, 0, 0) scale(1) rotate(0deg)' : unrevealedTransform,
              transition: `opacity ${stepDuration}s cubic-bezier(0.25, 1, 0.5, 1) ${tokenDelay}s, filter ${stepDuration}s cubic-bezier(0.25, 1, 0.5, 1) ${tokenDelay}s, transform ${stepDuration}s cubic-bezier(0.25, 1, 0.5, 1) ${tokenDelay}s`,
              color: !isInView && fromColor ? fromColor : undefined
            }}
          >
            {item.token}
          </span>
        );
      })}
    </p>
  );
};

export default BlurText;
