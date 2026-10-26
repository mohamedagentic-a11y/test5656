import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

type Book = {
  id: string;
  title: string;
  author: string;
  available: boolean;
};

type Loan = {
  id: string;
  bookId: string;
  bookTitle: string;
  dueDate: string;
};

const DICTIONARY = {
  en: {
    title: 'Library Dashboard',
    searchPlaceholder: 'Search books by title or author...',
    searchButton: 'Search',
    booksSection: 'Book Catalogue',
    loansSection: 'My Active Loans',
    borrowButton: 'Borrow',
    returnButton: 'Return',
    renewButton: 'Renew',
    noBooks: 'No books found.',
    noLoans: 'No active loans.',
    loading: 'Loading data...',
    error: 'An error occurred while fetching data.',
    authorLabel: 'Author:',
    dueLabel: 'Due:',
    unavailable: 'Currently Unavailable',
    actionFailed: 'Action failed. Please try again.',
  },
  ar: {
    title: 'لوحة تحكم المكتبة',
    searchPlaceholder: 'البحث عن كتب بالعنوان أو المؤلف...',
    searchButton: 'بحث',
    booksSection: 'فهرس الكتب',
    loansSection: 'إعاراتي النشطة',
    borrowButton: 'استعارة',
    returnButton: 'إرجاع',
    renewButton: 'تجديد',
    noBooks: 'لم يتم العثور على كتب.',
    noLoans: 'لا توجد إعارات نشطة.',
    loading: 'جاري تحميل البيانات...',
    error: 'حدث خطأ أثناء جلب البيانات.',
    authorLabel: 'المؤلف:',
    dueLabel: 'تاريخ الاستحقاق:',
    unavailable: 'غير متوفر حالياً',
    actionFailed: 'فشلت العملية. يرجى المحاولة مرة أخرى.',
  }
};

export const Dashboard: React.FC = () => {
  const { language } = useLanguage();
  const t = DICTIONARY[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboardData = async (query: string = '') => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const booksRes = await fetch(`/api/v1/books${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      if (!booksRes.ok) throw new Error('Failed to fetch books');
      const booksData = await booksRes.json();
      
      // Assuming a standard GET /api/v1/loans exists for the user's loans
      const loansRes = await fetch('/api/v1/loans');
      const loansData = loansRes.ok ? await loansRes.json() : { data: [] };

      setBooks(booksData.data || []);
      setLoans(loansData.data || []);
    } catch (err) {
      setErrorMsg(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData(searchQuery);
  };

  const handleBorrow = async (bookId: string) => {
    setActionLoading(bookId);
    try {
      const res = await fetch('/api/v1/loans/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      });
      if (res.ok) {
        await fetchDashboardData(searchQuery);
      } else {
        alert(t.actionFailed);
      }
    } catch (err) {
      alert(t.actionFailed);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      const res = await fetch(`/api/v1/loans/${loanId}/return`, { method: 'POST' });
      if (res.ok) {
        await fetchDashboardData(searchQuery);
      } else {
        alert(t.actionFailed);
      }
    } catch (err) {
      alert(t.actionFailed);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenew = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      const res = await fetch(`/api/v1/loans/${loanId}/renew`, { method: 'POST' });
      if (res.ok) {
        await fetchDashboardData(searchQuery);
      } else {
        alert(t.actionFailed);
      }
    } catch (err) {
      alert(t.actionFailed);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
      </header>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {t.searchButton}
        </button>
      </form>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t.loading}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">{t.booksSection}</h2>
            {books.length === 0 ? (
              <p className="text-gray-500">{t.noBooks}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => (
                  <div key={book.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{t.authorLabel}</span> {book.author}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleBorrow(book.id)}
                        disabled={!book.available || actionLoading === book.id}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          book.available
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        title={!book.available ? t.unavailable : ''}
                      >
                        {book.available ? t.borrowButton : t.unavailable}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">{t.loansSection}</h2>
            {loans.length === 0 ? (
              <p className="text-gray-500">{t.noLoans}</p>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-blue-50">
                    <h3 className="text-md font-medium text-gray-900">{loan.bookTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{t.dueLabel}</span> {new Date(loan.dueDate).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex gap-2 justify-end">
                      <button
                        onClick={() => handleRenew(loan.id)}
                        disabled={actionLoading === loan.id}
                        className="px-3 py-1.5 bg-white border border-blue-600 text-blue-600 rounded-md text-sm hover:bg-blue-50 transition-colors"
                      >
                        {t.renewButton}
                      </button>
                      <button
                        onClick={() => handleReturn(loan.id)}
                        disabled={actionLoading === loan.id}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        {t.returnButton}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};