import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, softSpring } from '../lib/motion';

export default function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, #E8F8EE 0%, #F7FBF8 55%, #FFFFFF 100%)',
      }}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        onAnimationComplete={() => setTimeout(onDone, 900)}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Logo mark — real brand asset, scale-up reveal */}
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.55 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.75 },
            },
          }}
          style={{
            width: 116,
            height: 116,
            borderRadius: 30,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 14,
            boxShadow:
              '0 24px 64px rgba(7,143,74,0.22), 0 6px 16px rgba(7,143,74,0.10), inset 0 0 0 1px rgba(7,143,74,0.06)',
          }}
        >
          {logoFailed ? (
            /* Fallback: graceful leaf mark if asset missing */
            <svg width="78" height="78" viewBox="0 0 84 84" fill="none" aria-hidden>
              <motion.path
                d="M42 72V38C42 38 26 36 20 22C16 12 22 6 22 6C22 6 36 8 42 22C48 36 42 38 42 38"
                stroke="url(#ap-leaf)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ ...softSpring, delay: 0.15 }}
              />
              <defs>
                <linearGradient id="ap-leaf" x1="0" y1="0" x2="84" y2="84">
                  <stop stopColor="#22C55E" />
                  <stop offset="1" stopColor="#075B35" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <motion.img
              src="/brand-logo-source.png"
              alt="AgriPulse"
              onError={() => setLogoFailed(true)}
              initial={{ rotate: -8, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.9, delay: 0.15 }}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontSize: 34,
            fontWeight: 800,
            color: '#075B35',
            margin: '22px 0 0',
            letterSpacing: '-0.02em',
          }}
        >
          AgriPulse
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          style={{
            color: '#718579',
            fontSize: 15,
            marginTop: 8,
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          Smarter Farming. Better Yields.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
