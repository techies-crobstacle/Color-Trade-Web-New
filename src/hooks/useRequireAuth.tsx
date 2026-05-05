'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useRequireAuth() {
  const router = useRouter();
  const [checked, setChecked] = useState<null | boolean>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Silent redirect without toast to avoid messy UX
      router.replace('/login');
      setChecked(false);
    } else {
      setChecked(true);
    }
  }, [router]);

  return checked;
}
