import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [groupCode, setGroupCode] = useState('');

  const handleStart = () => {
    if (userName.trim() && groupCode.trim()) {
      // Store user identity in sessionStorage (tab-specific)
      sessionStorage.setItem('userName', userName.trim());
      sessionStorage.setItem('groupCode', groupCode.trim());
      navigate('/quiz');
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default HomePage; 