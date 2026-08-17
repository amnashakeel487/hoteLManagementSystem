import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const [displayLocation, setDisplayLocation] = useState(useLocation());
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const location = useLocation();

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'fadeOut') {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  return (
    <div 
      className={`page-transition ${transitionStage}`}
      style={{
        opacity: transitionStage === 'fadeIn' ? 1 : 0,
        transform: transitionStage === 'fadeIn' ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 0.15s ease-out, transform 0.15s ease-out'
      }}
    >
      {children}
    </div>
  );
}