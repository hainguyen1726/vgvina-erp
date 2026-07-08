import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../icons/Icons';

interface Option {
    id: string | number;
    name: string;
    [key: string]: any;
}

interface SearchableMultiSelectProps {
    options: Option[];
    selectedIds: (string | number)[];
    onChange: (ids: (string | number)[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
    options,
    selectedIds = [],
    onChange,
    placeholder = "Chọn...",
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOptions = options.filter(opt => selectedIds.includes(String(opt.id)) || selectedIds.includes(opt.id) || selectedIds.includes(Number(opt.id)));

    const filteredOptions = options.filter(opt =>
        !selectedIds.map(String).includes(String(opt.id)) &&
        (opt.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionId: string | number) => {
        onChange([...selectedIds, optionId]);
        setSearchTerm("");
    };

    const handleRemove = (e: React.MouseEvent, optionId: string | number) => {
        e.stopPropagation();
        onChange(selectedIds.filter(id => String(id) !== String(optionId)));
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div
                className={`w-full p-1.5 border border-gray-300 rounded-md bg-white flex flex-wrap gap-1 items-center cursor-pointer min-h-[42px] ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {selectedOptions.length > 0 ? (
                    selectedOptions.map(opt => (
                        <span key={opt.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm">
                            {opt.name}
                            {!disabled && (
                                <button
                                    onClick={(e) => handleRemove(e, opt.id)}
                                    className="hover:text-blue-900 transition-colors"
                                >
                                    &times;
                                </button>
                            )}
                        </span>
                    ))
                ) : (
                    <span className="text-gray-400 text-sm ml-2">{placeholder}</span>
                )}
                <div className="ml-auto pr-1">
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg flex flex-col max-h-64 overflow-hidden">
                    <div className="p-2 border-b bg-gray-50">
                        <input
                            type="text"
                            autoFocus
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50"
                                    onClick={() => handleSelect(option.id)}
                                >
                                    {option.name}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-3 text-sm text-gray-500 text-center">
                                {searchTerm ? "Không tìm thấy kết quả" : "Đã chọn tất cả hoặc không có dữ liệu"}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableMultiSelect;
