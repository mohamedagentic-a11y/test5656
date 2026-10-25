import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

const translations = {
  en: {
    dashboardTitle: 'Librarian Dashboard',
    booksTab: 'Manage Books',
    loansTab: 'View Loans',
    addBook: 'Add New Book',
    title: 'Title',
    author: 'Author',
    isbn: 'ISBN',
    actions: 'Actions',
    delete: 'Delete',
    deleting: 'Deleting...',
    loading: 'Loading...',
    error: 'An error occurred while fetching data.',
    noBooks: 'No books found in the catalogue.',
    noLoans: 'No active loans found.',
    loanId: 'Loan ID',
    bookId: 'Book ID',
    memberId: 'Member ID',
    dueDate: 'Due Date',
    status: 'Status',
    submit: 'Submit',
    cancel: 'Cancel',
    addBookTitle: 'Add a Book',
  },
  ar: {
    dashboardTitle: 'لوحة تحكم أمين المكتبة',
    booksTab: 'إدارة الكتب',
    loansTab: 'عرض الإعارات',
    addBook: 'إضافة كتاب جديد',
    title: 'العنوان',
    author: 'المؤلف',
    isbn: 'الرقم الدولي (ISBN)',
    actions: 'إجراءات',
    delete: 'حذف',
    deleting: 'جاري الحذف...',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ أثناء جلب البيانات.',
    noBooks: 'لم يتم العثور على كتب في الفهرس.',
    noLoans: 'لا توجد إعارات نشطة.',
    loanId: 'معرف الإعارة',
    bookId: 'معرف الكتاب',
    memberId: 'معرف العضو',
    dueDate: 'تاريخ الاستحقاق',
    status: 'الحالة',
    submit: 'إرسال',
    cancel: 'إلغاء',
    addBookTitle: 'إضافة كتاب',
  }
};

type Tab = 'books' | 'loans';

export const LibrarianDashboard: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>('books');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '' });

  const { data: books, isLoading: isLoadingBooks, isError: isErrorBooks } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const response = await apiClient.get('/books');
      return response.data.data;
    }
  });

  const { data: loans, isLoading: isLoadingLoans, isError: isErrorLoans } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const response = await apiClient.get('/loans');
      return response.data.data;
    }
  });

  const addBookMutation = useMutation({
    mutationFn: async (bookData: typeof newBook) => {
      const response = await apiClient.post('/books', bookData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsAddModalOpen(false);
      setNewBook({ title: '', author: '', isbn: '' });
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/books/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    }
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    addBookMutation.mutate(newBook);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">{t.dashboardTitle}</h1>

      <div className="flex space-x-4 space-x-reverse mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'books' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t.booksTab}
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'loans' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t.loansTab}
        </button>
      </div>

      {activeTab === 'books' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
            >
              {t.addBook}
            </button>
          </div>

          {isLoadingBooks ? (
            <p className="text-gray-500">{t.loading}</p>
          ) : isErrorBooks ? (
            <p className="text-red-500">{t.error}</p>
          ) : !books || books.length === 0 ? (
            <p className="text-gray-500">{t.noBooks}</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t.title}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t.author}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t.isbn}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book: any) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.isbn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteBookMutation.mutate(book.id)}
                          disabled={deleteBookMutation.isPending}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleteBookMutation.isPending ? t.deleting : t.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'loans' && (
        <div>
          {isLoadingLoans ? (
            <p className="text-gray-500">{t.loading}</p>
          ) : isErrorLoans ? (
            <p className="text-red-500">{t.error}</p>
          ) : !loans || loans.length === 0 ? (
            <p className="text-gray-500">{t.noLoans}</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t.loanId}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t.bookId}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t.memberId}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t.dueDate}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan: any) => (
                    <tr key={loan.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.bookId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.memberId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(loan.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{t.addBookTitle}</h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.title}</label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.author}</label>
                <input
                  type="text"
                  required
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.isbn}</label>
                <input
                  type="text"
                  required
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={addBookMutation.isPending}
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {addBookMutation.isPending ? t.loading : t.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};