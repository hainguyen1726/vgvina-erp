
import React from 'react';
import { Link } from 'react-router-dom';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  linkTo?: string;
  subtitle?: React.ReactNode;
  tooltip?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, colorClass, linkTo, subtitle, tooltip }) => {
  const cardContent = (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4 flex-1 h-full ${linkTo ? 'group-hover:shadow-md transition-shadow duration-200' : ''}`}
      title={tooltip}
    >
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate" style={{ fontSize: '0.875rem' }}>{title}</p>
        <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex-1 group min-w-0">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default SummaryCard;
