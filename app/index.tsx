import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Redirect to auth screen on app start
    router.replace('/auth');
  }, []);

  return null;
}