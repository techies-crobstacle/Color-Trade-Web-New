'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function useRequireAuth() {
  const router = useRouter();
  const [checked, setChecked] = useState<null | boolean>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('You will first need to login to visit that page');
      router.replace('/login');
      setChecked(false);
    } else {
      setChecked(true);
    }
  }, [router]);

  return checked;
}
