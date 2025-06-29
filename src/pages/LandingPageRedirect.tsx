import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  // Redirect to UserTypeLanding immediately
  useEffect(() => {
    navigate('/user-type-landing');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#141418] text-white flex items-center justify-center">
      <div className="text-center">
        <img 
          src="/TruIndee-Horz-Logo.png" 
          alt="TruIndee" 
          className="h-16 w-auto mx-auto mb-4"
        />
        <p className="text-[#35A764]">Redirecting...</p>
      </div>
    </div>
  );
}
