import { useState, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import AnimatedSplash from './AnimatedSplash';

const KEY = 'ap.splash.shown';

export default function SplashGate({ children }: { children: ReactNode }) {
  const alreadyShown = sessionStorage.getItem(KEY) === '1';
  const [done, setDone] = useState(alreadyShown);

  return (
    <>
      <AnimatePresence>
        {!done && (
          <AnimatedSplash
            onDone={() => {
              sessionStorage.setItem(KEY, '1');
              setDone(true);
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
