'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// Simple JWT decode function for client-side
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export default function useRequireAdmin() {
  const router = useRouter();
  const [checked, setChecked] = useState<null | boolean>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Silent redirect to avoid messy flash
      router.replace('/login');
      setChecked(false);
      return;
    }

    const decoded = decodeJWT(token);
    
    if (!decoded || decoded.role !== 'admin') {
      // Silent redirect to home - user shouldn't see error flash
      router.replace('/');
      setChecked(false);
      return;
    }

    setChecked(true);
  }, [router]);

  return checked;
}