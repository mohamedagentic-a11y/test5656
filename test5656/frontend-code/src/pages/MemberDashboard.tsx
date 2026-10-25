import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

const DICTIONARY = {
  en: {
    title: 'Member Dashboard',
    activeLoans: 'Active Loans',
    bookTitle: 'Book Title',
    dueDate: 'Due Date',
    actions: 'Actions',
    renew: 'Renew',
    return: 'Return',
    noLoans: 'You have no active loans.',
    loading: 'Loading...',
    error: 'Failed to load loans.',
    renewSuccess: 'Loan renewed successfully.',
    returnSuccess: 'Book returned successfully.',
  },
  ar: {
    title: 'لوحة تحكم العضو',
    activeLoans: 'القروض النشطة',
    bookTitle: 'عنوان الكتاب',
    dueDate: 'تاريخ الاستحقاق',
    actions: 'الإجراءات',
    renew: 'تجديد',
    return: 'إرجاع',
    noLoans: 'ليس لديك قروض نشطة.',
    loading: 'جاري التحميل...',
    error: 'فشل في تحميل القروض.',
    renewSuccess: 'تم تجديد القرض بنجاح.',
    returnSuccess: 'تم إرجاع الكتاب بنجاح.',
  },
};

interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  dueDate: string;
  status: 'ACTIVE' | 'RETURNED';
}

export const MemberDashboard: React.FC = () => {
  const { language } = useLanguage();
  const t = DICTIONARY[language];
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Loan[] }>('/loans');
      return response.data.data;
    },
  });

  const renewMutation = useMutation({
    mutationFn: async (loanId: string) => {
      await apiClient.post(`/loans/${loanId}/renew`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      alert(t.renewSuccess);
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (loanId: string) => {
      await apiClient.post(`/loans/${loanId}/return`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      alert(t.returnSuccess);
    },
  });

  if (isLoading) {
    return <div className="p-8 text-start">{t.loading}</div>;
  }

  if (isError) {
    return <div className="p-8 text-start text-red-600">{t.error}</div>;
  }

  const activeLoans = data?.filter((loan) => loan.status === 'ACTIVE') || [];

  return (
    <div className="max-w-4xl mx-auto p-6 text-start">
      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
      
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t.activeLoans}</h2>
        
        {activeLoans.length === 0 ? (
          <p className="text-gray-500">{t.noLoans}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 font-medium text-gray-700">{t.bookTitle}</th>
                  <th className="py-3 px-4 font-medium text-gray-700">{t.dueDate}</th>
                  <th className="py-3 px-4 font-medium text-gray-700">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan) => (
                  <tr key={loan.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{loan.bookTitle}</td>
                    <td className="py-3 px-4">{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 flex gap-2 justify-start">
                      <button
                        onClick={() => renewMutation.mutate(loan.id)}
                        disabled={renewMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {t.renew}
                      </button>
                      <button
                        onClick={() => returnMutation.mutate(loan.id)}
                        disabled={returnMutation.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {t.return}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};