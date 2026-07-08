import React from 'react';
import { TelegramIcon } from '../icons/Icons';

const TelegramButton: React.FC = () => {
  return (
    <a
      href="https://t.me/+lyYMIK3tfu8wZjY1"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 left-6 z-50 p-3 rounded-full text-[#0066cc] border-2 border-[#0066cc] hover:opacity-80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066cc]"
    >
      <TelegramIcon />
    </a>
  );
};

export default TelegramButton;