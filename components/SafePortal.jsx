'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Safe portal: hanya render setelah DOM siap (client-side only).
 * Menghindari "Target container is not a DOM element" saat SSR.
 */
export function SafePortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
