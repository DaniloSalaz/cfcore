import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center space-y-8">
        <div className="w-32 h-32 mx-auto">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-primary animate-pulse"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M 30 50 L 50 70 L 70 50 Q 70 30 50 20 Q 30 30 30 50 Z" />
            <circle cx="50" cy="40" r="8" fill="currentColor" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          CFC Time
        </h1>
      </div>
    </div>
  );
}
