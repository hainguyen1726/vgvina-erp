import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from '../icons/Icons';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-20 md:bottom-6 right-6 z-50 p-3 rounded-full text-[#0066cc] border-2 border-[#0066cc] hover:opacity-80 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066cc]`}
    >
      <ArrowUpIcon />
    </button>
  );
};

export default ScrollToTopButton;