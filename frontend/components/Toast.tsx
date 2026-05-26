'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 72,
        right: 20,
        zIndex: 100,
        padding: '8px 14px',
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 6,
        fontSize: 12,
        color: '#ccc',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.2s, transform 0.2s',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const show = (msg = 'Saved') => {
    setMessage(msg);
    setVisible(true);
  };

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, [visible]);

  return { visible, message, show };
}
