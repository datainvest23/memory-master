'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const UserDisplay = () => {
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch the user's profile
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          if (data?.first_name) {
            setFirstName(data.first_name);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserProfile();
  }, []);

  if (!firstName) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '8px 16px',
      borderRadius: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      fontSize: '18px',
      fontWeight: '500',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
    }}>
      {firstName}
    </div>
  );
};

export default UserDisplay; 