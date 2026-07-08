import React, { useState } from 'react';
import { CloseIcon, SearchIcon } from '../icons/Icons';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');

    if (!isOpen) return null;

    // Mock search results
    const results = query ? [
        { type: 'Đối tác', name: 'Nhà hàng Hải Sản Biển Đông', link: '/doi-tac' },
        { type: 'Đơn hàng', name: 'SO-2024-0153', link: '/bao-cao/xuat-nhap' },
        { type: 'Giao dịch', name: 'Thu tiền hàng 12,500,000đ', link: '/thu-chi' },
    ] : [];

    return (
        <div className="fixed inset-0 bg-white z-50 animate-fade-in-fast" onClick={onClose}>
            <div className="p-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm toàn trang..."
                            className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                            autoFocus
                        />
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900">
                        <CloseIcon />
                    </button>
                </div>

                {/* Results */}
                <div>
                    {query && results.length > 0 && (
                        <ul className="space-y-2">
                            {results.map((result, index) => (
                                <li key={index}>
                                    <a href={`#${result.link}`} onClick={onClose} className="block p-3 rounded-lg hover:bg-gray-100">
                                        <p className="font-semibold text-gray-800">{result.name}</p>
                                        <p className="text-sm text-gray-500">{result.type}</p>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                    {query && results.length === 0 && (
                        <p className="text-center text-gray-500 p-8">Không tìm thấy kết quả cho "{query}"</p>
                    )}
                </div>
            </div>
            <style>{`
                .animate-fade-in-fast {
                    animation: fadeIn 0.2s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default GlobalSearch;
