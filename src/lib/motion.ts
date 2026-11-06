import type { Variants, Transition } from 'framer-motion';

export const softSpring: Transition = { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.45 };
export const quickTap: Transition = { type: 'tween', ease: 'easeOut', duration: 0.15 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: softSpring },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};
