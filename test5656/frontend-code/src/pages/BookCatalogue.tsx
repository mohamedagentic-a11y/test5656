import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

const translations = {
  en: {
    title: 'Book Catalogue',
    searchPlaceholder: 'Search by title or author...',
    searchButton: 'Search',
    borrowButton: 'Borrow',
    borrowing: 'Borrowing...',
    borrowSuccess: 'Successfully borrowed!',
    borrowError: 'Failed to borrow book.',
    noBooks: 'No books found matching your criteria.',
    loading: 'Loading catalogue...',
    error: 'Failed to load the catalogue. Please try again later.',
    author: 'Author:',
    isbn: 'ISBN:',
    available: 'Available',
    unavailable: 'Currently Unavailable',
    previous: 'Previous',
    next: 'Next',
    page: 'Page'
  },
  ar: {
    title: 'فهرس الكتب',
    searchPlaceholder: 'البحث بالعنوان أو المؤلف...',
    searchButton: 'بحث',
    borrowButton: 'استعارة',
    borrowing: 'جاري الاستعارة...',
    borrowSuccess: 'تمت الاستعارة بنجاح!',
    borrowError: 'فشلت استعارة الكتاب.',
    noBooks: 'لم يتم العثور على كتب تطابق معاييرك.',
    loading: 'جاري تحميل الفهرس...',
    error: 'فشل تحميل الفهرس. يرجى المحاولة مرة أخرى لاحقاً.',
    author: 'المؤلف:',
    isbn: 'الرقم المعياري:',
    available: 'متاح',
    unavailable: 'غير متاح حالياً',
    previous: 'السابق',
    next: 'التالي',
    page: 'صفحة'
  }
};

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  availableCopies: number;
  totalCopies: number;
}

interface BooksResponse {
  success: boolean;
  data: {
    books: Book[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export const BookCatalogue: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['books', searchTerm, page],
    queryFn: async () => {
      const response = await apiClient.get<BooksResponse>('/books', {
        params: { search: searchTerm, page, limit: 12 }
      });
      return response.data.data;
    }
  });

  const borrowMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const response = await apiClient.post('/loans/borrow', { bookId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleBorrow = (bookId: string) => {
    borrowMutation.mutate(bookId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-start"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t.searchButton}
          </button>
        </form>
      </div>

      {borrowMutation.isError && (
        <div className="mb-6 p-4 bg-red-50 border-s-4 border-red-500 text-red-700">
          {t.borrowError}
        </div>
      )}

      {borrowMutation.isSuccess && (
        <div className="mb-6 p-4 bg-green-50 border-s-4 border-green-500 text-green-700">
          {t.borrowSuccess}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">{t.loading}</p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-center">
          {t.error}
        </div>
      ) : !data?.books.length ? (
        <div className="p-8 bg-gray-50 text-gray-500 rounded-md text-center border border-gray-200">
          {t.noBooks}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.books.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium me-1">{t.author}</span>
                    {book.author}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    <span className="font-medium me-1">{t.isbn}</span>
                    {book.isbn}
                  </p>
                  <div className="mt-auto">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      book.availableCopies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {book.availableCopies > 0 ? `${t.available} (${book.availableCopies}/${book.totalCopies})` : t.unavailable}
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => handleBorrow(book.id)}
                    disabled={book.availableCopies === 0 || borrowMutation.isPending}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {borrowMutation.isPending && borrowMutation.variables === book.id 
                      ? t.borrowing 
                      : t.borrowButton}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.previous}
              </button>
              <span className="text-gray-600">
                {t.page} {page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.next}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};