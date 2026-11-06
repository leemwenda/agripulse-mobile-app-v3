import { motion } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  full?: boolean;
}

const base: React.CSSProperties = {
  height: 52, borderRadius: 999, border: 'none',
  fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 700, fontSize: 16,
  cursor: 'pointer', padding: '0 24px',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  minHeight: 44,
};

const variants: Record<string, React.CSSProperties> = {
  primary: { ...base, background: 'linear-gradient(135deg, #078F4A 0%, #075B35 100%)', color: '#fff', boxShadow: '0 8px 20px rgba(7,143,74,0.25)' },
  secondary: { ...base, background: '#E8F8EE', color: '#075B35' },
  ghost: { ...base, background: 'transparent', color: '#078F4A', border: '1.5px solid #078F4A' },
};

export default function Button({ children, variant = 'primary', full, style, ...rest }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{ ...variants[variant], width: full ? '100%' : undefined, ...style }}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}
