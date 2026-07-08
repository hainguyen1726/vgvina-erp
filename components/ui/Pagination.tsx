
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  totalItems: number;
  prevButtonContent?: React.ReactNode;
  nextButtonContent?: React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  prevButtonContent,
  nextButtonContent,
}) => {
  const pageNumbers = [];
  const maxPagesToShow = 5;
  
  let startPage: number, endPage: number;

  if (totalPages <= maxPagesToShow) {
    startPage = 1;
    endPage = totalPages;
  } else {
    const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrent) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - maxPagesBeforeCurrent;
      endPage = currentPage + maxPagesAfterCurrent;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mt-4 px-1">
      <div className="hidden sm:flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Hiển thị {startItem}-{endItem} trên {totalItems}
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
        >
          <option value="10">10 / trang</option>
          <option value="30">30 / trang</option>
          <option value="50">50 / trang</option>
          <option value="100">100 / trang</option>
          <option value="200">200 / trang</option>
          <option value="500">500 / trang</option>
        </select>
      </div>

      <nav>
        <ul className="inline-flex items-center -space-x-px">
          <li>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                prevButtonContent ? 'px-2.5' : 'px-3'
              }`}
            >
              {prevButtonContent || 'Trước'}
            </button>
          </li>
          {startPage > 1 && (
            <>
              <li>
                <button onClick={() => onPageChange(1)} className="hidden sm:inline-block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">1</button>
              </li>
              {startPage > 2 && <li className="hidden sm:inline-block"><span className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">...</span></li>}
            </>
          )}

          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => onPageChange(number)}
                className={`px-3 py-2 leading-tight border border-gray-300 ${
                  currentPage === number
                    ? 'text-white bg-[#0066cc] border-[#0066cc]'
                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {number}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="hidden sm:inline-block"><span className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">...</span></li>}
              <li>
                <button onClick={() => onPageChange(totalPages)} className="hidden sm:inline-block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">{totalPages}</button>
              </li>
            </>
          )}
          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                nextButtonContent ? 'px-2.5' : 'px-3'
              }`}
            >
              {nextButtonContent || 'Sau'}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
