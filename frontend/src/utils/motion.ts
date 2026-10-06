// ponytail: Central motion design tokens and physics curves for DORMI (Apple-grade fluid motion)
// All transition durations are intentionally compact (80-360ms) to ensure immediate responsiveness.

import type { Transition, Variants } from 'framer-motion';

export const motionTokens = {
  duration: {
    micro: 0.12,    // 120ms: micro-interactions, icons, checkboxes, toggles
    small: 0.18,    // 180ms: button states, dropdowns, tooltips, badges
    standard: 0.24, // 240ms: modals, drawers, card reveals, content changes
    large: 0.36,    // 360ms: major layout movements, navigation sheets
  },
  ease: {
    // Standard Apple UI curve: immediate start, smooth decelerated settle
    standard: [0.22, 1, 0.36, 1] as const,
    // Enter: faster initial trajectory for arriving elements
    enter: [0.16, 1, 0.3, 1] as const,
    // Exit: accelerates slightly out of view without lingering
    exit: [0.4, 0, 1, 1] as const,
    // Emphasis: subtle organic overshoot
    emphasis: [0.175, 0.885, 0.32, 1.1] as const,
  },
  spring: {
    // Soft physical spring: modals, bottom sheets, expanding cards
    soft: {
      type: 'spring',
      stiffness: 380,
      damping: 32,
      mass: 0.8,
    } as Transition,
    // Snappy: fast toggle, small interactive badges, active tab indicators
    snappy: {
      type: 'spring',
      stiffness: 480,
      damping: 36,
      mass: 0.6,
    } as Transition,
    // Drawer / Sheet: controlled sliding mass
    drawer: {
      type: 'spring',
      stiffness: 360,
      damping: 35,
      mass: 0.9,
    } as Transition,
    // Tactile click feedback: minimal overshoot
    tactile: {
      type: 'spring',
      stiffness: 520,
      damping: 24,
    } as Transition,
  },
};

// Reusable Framer Motion Variants for DORMI

// Modal Overlay Backdrop
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: motionTokens.duration.small, ease: motionTokens.ease.enter }
  },
  exit: { 
    opacity: 0,
    transition: { duration: motionTokens.duration.micro, ease: motionTokens.ease.exit }
  },
};

// Modal Content: Physical scale 0.97 -> 1, subtle 8px vertical drift
export const modalContentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.97, 
    y: 8 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 32,
      mass: 0.8,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: 4,
    transition: { 
      duration: motionTokens.duration.micro, 
      ease: motionTokens.ease.exit 
    }
  },
};

// Mobile Bottom Sheet
export const bottomSheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { 
    y: 0,
    transition: motionTokens.spring.drawer,
  },
  exit: { 
    y: '100%',
    transition: { duration: motionTokens.duration.small, ease: motionTokens.ease.exit }
  },
};

// Side Drawer (Right to Left)
export const drawerRightVariants: Variants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: motionTokens.spring.drawer,
  },
  exit: { 
    x: '100%',
    transition: { duration: motionTokens.duration.small, ease: motionTokens.ease.exit }
  },
};

// Dropdown / Popover (e.g. Notification Bell, Filter Menus)
export const dropdownVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.96, 
    y: -4 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: motionTokens.duration.small, 
      ease: motionTokens.ease.enter 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.97, 
    y: -2,
    transition: { 
      duration: motionTokens.duration.micro, 
      ease: motionTokens.ease.exit 
    }
  },
};

// Staggered Container for Lists and Grids (Room Cards, Discovery items)
export const staggerListContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // 25ms stagger: cards feel like they arrive together as one cohesive set
      staggerChildren: 0.025,
      delayChildren: 0.01,
    },
  },
};

// Individual item reveal inside staggered list
export const staggerListItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 6 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: motionTokens.duration.standard, 
      ease: motionTokens.ease.standard 
    }
  },
};

// Chat Message Entrance: subtle 4px rise with quick opacity
export const chatMessageItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 4 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: motionTokens.duration.small, 
      ease: motionTokens.ease.enter 
    }
  },
};
