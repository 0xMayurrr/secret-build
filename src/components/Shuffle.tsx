'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import './Shuffle.css';

const DEFAULT_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$@%!&?*~_<>[]{}';

export interface ShuffleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  shuffleDirection?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  maxDelay?: number;
  ease?: string;
  threshold?: number;
  rootMargin?: string;
  tag?: keyof React.JSX.IntrinsicElements;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  onShuffleComplete?: () => void;
  shuffleTimes?: number;
  animationMode?: 'evenodd' | 'center' | 'sequence' | 'random';
  loop?: boolean;
  loopDelay?: number;
  stagger?: number;
  scrambleCharset?: string;
  colorFrom?: string;
  colorTo?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
  effect?: 'slide' | 'flip' | 'blur';
  hoverRadius?: number;
  motionBlur?: boolean;
  color?: string;
  accentColor?: string;
}

const Shuffle: React.FC<ShuffleProps> = ({
  text,
  className = '',
  style = {},
  shuffleDirection = 'right',
  duration = 0.35,
  maxDelay = 0,
  ease = 'power3.out',
  threshold = 0.1,
  rootMargin = '-50px',
  tag = 'p',
  textAlign = 'center',
  onShuffleComplete,
  shuffleTimes = 3,
  animationMode = 'sequence',
  loop = false,
  loopDelay = 2,
  stagger = 0.03,
  scrambleCharset = DEFAULT_CHARSET,
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true,
  effect = 'slide',
  hoverRadius = 0,
  motionBlur = false,
  color,
  accentColor
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const [displayedText, setDisplayedText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const charset = scrambleCharset || DEFAULT_CHARSET;

  const runShuffle = useCallback(() => {
    if (respectReducedMotion && typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedText(text);
      onShuffleComplete?.();
      return;
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsScrambling(true);

    const length = text.length;
    const rolls = Math.max(2, Math.floor(shuffleTimes * 4));
    let frame = 0;
    const totalFrames = Math.max(12, Math.round((duration * 60) + (length * stagger * 60)));

    const tick = () => {
      frame++;
      const progress = frame / totalFrames;

      const chars = text.split('').map((targetChar, index) => {
        if (targetChar === ' ' || targetChar === '\n' || targetChar === '\t') {
          return targetChar;
        }

        let charProgress = 0;
        if (animationMode === 'sequence') {
          const charStart = (index / length) * 0.55;
          charProgress = Math.max(0, Math.min(1, (progress - charStart) / 0.45));
        } else if (animationMode === 'center') {
          const mid = (length - 1) / 2;
          const dist = Math.abs(index - mid) / (mid || 1);
          const charStart = dist * 0.4;
          charProgress = Math.max(0, Math.min(1, (progress - charStart) / 0.6));
        } else if (animationMode === 'evenodd') {
          const charStart = index % 2 === 0 ? 0 : 0.25;
          charProgress = Math.max(0, Math.min(1, (progress - charStart) / 0.75));
        } else {
          charProgress = progress;
        }

        if (charProgress >= 1) {
          return targetChar;
        }

        // Random roll
        const randIndex = Math.floor(Math.random() * charset.length);
        return charset[randIndex];
      });

      setDisplayedText(chars.join(''));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayedText(text);
        setIsScrambling(false);
        onShuffleComplete?.();

        if (loop) {
          timeoutRef.current = window.setTimeout(() => {
            runShuffle();
          }, loopDelay * 1000);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [text, charset, duration, shuffleTimes, stagger, animationMode, loop, loopDelay, onShuffleComplete, respectReducedMotion]);

  useEffect(() => {
    setDisplayedText(text);
  }, [text]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (!hasTriggered || !triggerOnce) {
            setHasTriggered(true);
            runShuffle();
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [runShuffle, threshold, rootMargin, triggerOnce, hasTriggered]);

  const handleMouseEnter = () => {
    if (!triggerOnHover || isScrambling) return;
    runShuffle();
  };

  const commonStyle = useMemo(
    () => ({
      textAlign,
      ...(color ? { color } : {}),
      ...(isScrambling && accentColor ? { color: accentColor } : {}),
      ...style
    }),
    [textAlign, color, isScrambling, accentColor, style]
  );

  const Tag = (tag || 'p') as any;

  return (
    <Tag
      ref={containerRef}
      className={`shuffle-parent ${className}`.trim()}
      style={commonStyle}
      onMouseEnter={handleMouseEnter}
    >
      {displayedText.split('').map((ch, idx) => (
        <span
          key={idx}
          className={`shuffle-char ${isScrambling && ch !== text[idx] ? 'is-scrambling' : ''}`}
          style={{
            color: isScrambling && ch !== text[idx] ? (accentColor || 'var(--signal, #a855f7)') : undefined,
            transitionDelay: `${idx * (stagger * 100)}ms`
          }}
        >
          {ch}
        </span>
      ))}
    </Tag>
  );
};

export default Shuffle;
