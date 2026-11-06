import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  format?: (n: number) => string;
  style?: React.CSSProperties;
}

export default function AnimatedCounter({
  value, prefix = '', suffix = '', decimals = 0, duration = 0.9, format, style,
}: Props) {
  const count = useMotionValue(0);
  const text = useTransform(count, (v) =>
    format ? format(v) : `${prefix}${v.toFixed(decimals)}${suffix}`
  );
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      const controls = animate(count, value, { duration, ease: [0.22, 1, 0.36, 1] });
      return () => controls.stop();
    }
    const controls = animate(count, value, { duration: 0.4, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, count, duration]);

  return (
    <motion.span
      aria-label={format ? format(value) : `${prefix}${value}${suffix}`}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
    >
      {text}
    </motion.span>
  );
}
