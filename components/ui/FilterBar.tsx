import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ChevronDownIcon, SearchIcon, ChevronLeftIcon } from '../icons/Icons';
import { useNotification } from '../../contexts/NotificationContext';

interface FilterBarProps {
  onSearch: (query: string) => void;
  onTimeFilterChange: (filter: string, dates?: { from: Date; to: Date }) => void;
  pageTitle: string;
  backPath?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ onSearch, onTimeFilterChange, pageTitle, backPath }) => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All time');
  const [isCustomRangeVisible, setIsCustomRangeVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [customDates, setCustomDates] = useState<{ from: string, to: string }>({ from: '', to: '' });
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);


  const timeOptions = ['Hôm nay', 'Hôm qua', 'Tuần này', 'Tháng này', 'Quý này', 'Năm nay', 'All time', 'Tùy chọn'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTimeSelect = (option: string) => {
    setSelectedTimeFilter(option);
    setIsDropdownOpen(false);
    if (option === 'Tùy chọn') {
      const today = new Date().toISOString().split('T')[0];
      setCustomDates({ from: today, to: today });
      setIsCustomRangeVisible(true);
    } else {
      setIsCustomRangeVisible(false);
      onTimeFilterChange(option);
    }
  };

  const handleCustomDateApply = () => {
    if (customDates.from && customDates.to) {
      onTimeFilterChange('Tùy chọn', {
        from: new Date(customDates.from),
        to: new Date(customDates.to)
      });
      setIsCustomRangeVisible(false);
    } else {
      showNotification('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.', 'warning');
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (backPath) {
      navigate(backPath);
    }
  };

  return (
    <div className="relative sticky top-[var(--header-height)] transition-all duration-300 bg-gray-100/95 backdrop-blur-sm py-3 z-20 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {backPath && (
            <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer" aria-label="Quay lại">
              <ChevronLeftIcon />
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">{pageTitle}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-36 sm:w-48 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066cc]"
            >
              <span className="flex items-center">
                <CalendarIcon className="mr-2" />
                {selectedTimeFilter}
              </span>
              <ChevronDownIcon />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-30">
                <ul className="py-1">
                  {timeOptions.map((option) => (
                    <li key={option}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleTimeSelect(option);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {option}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon />
            </div>
          </div>
          {/* Mobile Search Icon */}
          <div className="relative md:hidden">
            <button
              onClick={() => setIsMobileSearchVisible(true)}
              className="p-2.5 bg-white border border-gray-300 rounded-md shadow-sm"
              aria-label="Tìm kiếm"
            >
              <SearchIcon />
            </button>
          </div>
        </div>
      </div>
      {isCustomRangeVisible && (
        <div className="mt-2 p-4 bg-white border rounded-md shadow-sm flex items-center space-x-4 justify-end">
          <div className="flex items-center space-x-2">
            <label htmlFor="from-date" className="text-sm font-medium text-gray-700">Từ</label>
            <input type="date" id="from-date" value={customDates.from} onChange={e => setCustomDates({ ...customDates, from: e.target.value })} className="w-40 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0066cc]" />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="to-date" className="text-sm font-medium text-gray-700">Đến</label>
            <input type="date" id="to-date" value={customDates.to} onChange={e => setCustomDates({ ...customDates, to: e.target.value })} className="w-40 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0066cc]" />
          </div>
          <button
            onClick={handleCustomDateApply}
            className="px-4 py-1.5 text-sm font-medium text-white bg-[#0066cc] rounded-md hover:bg-[#0052a3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066cc]"
          >
            Áp dụng
          </button>
        </div>
      )}
      {/* Mobile Search Input Overlay */}
      {isMobileSearchVisible && (
        <div className="absolute inset-0 bg-gray-100 p-2 z-10 flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
              autoFocus
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon />
            </div>
          </div>
          <button onClick={() => setIsMobileSearchVisible(false)} className="text-sm font-medium text-gray-700 px-3">
            Hủy
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;