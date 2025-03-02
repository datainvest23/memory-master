'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const UserDisplay = () => {
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      // First check localStorage
      const storedName = localStorage.getItem('userFirstName');
      if (storedName) {
        setFirstName(storedName);
        return;
      }

      try {
        // If not in localStorage, fetch from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Fetching profile for user:", user.id);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching profile:', error);
            console.log('Full error details:', JSON.stringify(error, null, 2));
            return;
          }

          if (data) {
            console.log('Profile data fetched:', data);
            setFirstName(data.first_name);
            // Store for future use
            localStorage.setItem('userFirstName', data.first_name);
          } else {
            console.log('No profile found for user');
          }
        } else {
          console.log('No authenticated user found');
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