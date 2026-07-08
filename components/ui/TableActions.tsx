import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, ArrowsUpDownIcon, ColumnOptionsIcon, ChevronDownIcon } from '../icons/Icons';

export interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  subActions?: Omit<Action, 'subActions' | 'variant'>[];
}

export interface Column {
  key: string;
  label: string;
}

interface TableActionsProps {
  onSearch: (query: string) => void;
  searchPlaceholder: string;
  primaryActions: Action[];
  columns: Column[];
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
  filterActions?: React.ReactNode;
}

export const TableActions: React.FC<TableActionsProps> = ({
  onSearch,
  searchPlaceholder,
  primaryActions,
  columns,
  visibleColumns,
  onVisibleColumnsChange,
  filterActions,
}) => {
  const [isColDropdownOpen, setIsColDropdownOpen] = useState(false);
  const [openActionDropdown, setOpenActionDropdown] = useState<number | null>(null);

  const colDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colDropdownRef.current && !colDropdownRef.current.contains(event.target as Node)) {
        setIsColDropdownOpen(false);
      }
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target as Node)) {
        setOpenActionDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleColumnToggle = (columnKey: string) => {
    const newVisibleColumns = visibleColumns.includes(columnKey)
      ? visibleColumns.filter(key => key !== columnKey)
      : [...visibleColumns, columnKey];
    onVisibleColumnsChange(newVisibleColumns);
  };

  const mainActions = primaryActions.filter(a => a.variant !== 'secondary');
  const secondaryActions = primaryActions.filter(a => a.variant === 'secondary');

  return (
    <div className="flex items-center justify-end md:justify-between my-4">
      {/* Left: Search Bar */}
      <div className="hidden md:block relative w-full max-w-sm">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
        />
        <button className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700">
          <ArrowsUpDownIcon />
        </button>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center space-x-2">
        {filterActions && (
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-2 mr-1">
            {filterActions}
          </div>
        )}
        
        {mainActions.map((action, index) => {
          if (action.subActions && action.subActions.length > 0) {
            return (
              <div key={index} className="relative" ref={actionDropdownRef}>
                <button
                  onClick={() => setOpenActionDropdown(openActionDropdown === index ? null : index)}
                  className="group relative flex items-center justify-center px-3 py-2 text-sm font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066cc] bg-[#0066cc] text-white hover:bg-[#0052a3] border-transparent"
                >
                  {action.icon}
                  <span className="hidden lg:inline ml-2 whitespace-nowrap">{action.label}</span>
                  <ChevronDownIcon />
                </button>
                {openActionDropdown === index && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-200">
                    <ul>
                      {action.subActions.map((subAction, subIndex) => (
                        <li key={subIndex}>
                          <button
                            onClick={() => {
                              subAction.onClick();
                              setOpenActionDropdown(null);
                            }}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {subAction.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          }
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="group relative flex items-center justify-center px-3 py-2 text-sm font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066cc] bg-[#0066cc] text-white hover:bg-[#0052a3] border-transparent"
            >
              {action.icon}
              <span className="hidden lg:inline ml-2 whitespace-nowrap">{action.label}</span>
              <span className="lg:hidden absolute left-1/2 -translate-x-1/2 top-full mt-2 w-auto p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {action.label}
              </span>
            </button>
          );
        })}
        
        {secondaryActions.length > 0 && (
            <div className="flex items-center space-x-1">
                {secondaryActions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className="group relative p-2 text-white bg-green-600 border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        aria-label={action.label}
                    >
                        {action.icon}
                        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-auto p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {action.label}
                        </span>
                    </button>
                ))}
            </div>
        )}

        {(secondaryActions.length > 0) && (
             <div className="hidden md:block h-6 w-px bg-gray-200"></div>
        )}

        <div className="hidden md:flex items-center space-x-1">
          <div className="relative" ref={colDropdownRef}>
            <button 
              onClick={() => setIsColDropdownOpen(!isColDropdownOpen)}
              className="group relative p-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-700"
              aria-label="Tùy chọn cột"
            >
              <ColumnOptionsIcon />
               <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-auto p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Ẩn/hiện cột
              </span>
            </button>
            {isColDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-30">
                <div className="p-3 font-semibold text-sm border-b text-gray-800 bg-gray-50">Tùy chọn hiển thị cột</div>
                <ul className="py-2 px-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  {columns.map((col) => (
                    <li key={col.key}>
                      <label className="flex items-center space-x-2 text-sm text-gray-700 hover:bg-gray-100 p-1 rounded-md cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col.key)}
                          onChange={() => handleColumnToggle(col.key)}
                          className="h-4 w-4 rounded border-gray-300 text-[#0066cc] focus:ring-[#0052a3]"
                        />
                        <span>{col.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};