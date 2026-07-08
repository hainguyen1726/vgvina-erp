import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ChevronDownIcon, CloseIcon } from '../icons/Icons';

interface Option {
    id: string | number;
    name: string;
    [key: string]: any; // Allow other props
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string | any) => void; // string for simple ID, or any if we want to pass full object
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
    required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select option",
    className = "",
    disabled = false,
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Dropdown position state for fixed positioning
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    // Find selected option object
    const selectedOption = options.find(opt => String(opt.id) === String(value));

    // Calculate dropdown position when it opens
    useLayoutEffect(() => {
        if (isOpen && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const dropdownHeight = Math.min(240, options.length * 36 + 52); // estimate

            // Open upward if not enough space below
            if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
                setDropdownStyle({
                    position: 'fixed',
                    bottom: viewportHeight - rect.top,
                    left: rect.left,
                    width: rect.width,
                    zIndex: 9999,
                });
            } else {
                setDropdownStyle({
                    position: 'fixed',
                    top: rect.bottom,
                    left: rect.left,
                    width: rect.width,
                    zIndex: 9999,
                });
            }
        }
    }, [isOpen, options.length]);

    useEffect(() => {
        // Handle clicks outside to close
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                // Also check if click is inside the dropdown (rendered via portal-like fixed position)
                const dropdownEl = document.getElementById('searchable-select-dropdown');
                if (dropdownEl && dropdownEl.contains(event.target as Node)) return;
                setIsOpen(false);
                setSearchTerm(""); // Reset search on close
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Filter options
    const filteredOptions = options.filter(opt =>
        (opt.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: Option) => {
        onChange(option.id);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div
                className={`w-full p-2 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex-1 truncate text-sm text-gray-700">
                    {selectedOption ? selectedOption.name : <span className="text-gray-400">{placeholder}</span>}
                </div>
                <div className="flex items-center gap-1">
                    {selectedOption && !required && !disabled && (
                        <div onClick={handleClear} className="p-0.5 hover:bg-gray-200 rounded-full text-gray-500 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </div>
                    )}
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && !disabled && (
                <div
                    id="searchable-select-dropdown"
                    style={dropdownStyle}
                    className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    <div className="p-2 sticky top-0 bg-white border-b">
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full p-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.id}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${String(option.id) === String(value) ? 'bg-blue-100 text-[#0066cc] font-medium' : 'text-gray-700'}`}
                                onClick={() => handleSelect(option)}
                            >
                                {option.name}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-4 text-sm text-red-600 font-bold text-center bg-red-50">
                            KHÔNG TÌM THẤY DỮ LIỆU TRONG Ô CHỌN!<br />
                            <span className="text-[10px] font-normal text-gray-500">
                                Total: {options?.length || 0}, Filtered: {filteredOptions?.length || 0}, Search: "{searchTerm}"
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
