import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Login } from './pages/Login';
import { BookCatalogue } from './pages/BookCatalogue';
import { LibrarianDashboard } from './pages/LibrarianDashboard';
import { MemberDashboard } from './pages/MemberDashboard';
import { useLanguage } from './i18n/LanguageContext';

const translations = {
  en: {
    notFound: 'Page Not Found',
    goHome: 'Go to Login'
  },
  ar: {
    notFound: 'الصفحة غير موجودة',
    goHome: 'الذهاب إلى تسجيل الدخول'
  }
};

function NotFound() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t.notFound}</h1>
      <Link to="/login" className="text-blue-600 hover:underline">
        {t.goHome}
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/catalogue" element={<BookCatalogue />} />
      <Route path="/librarian" element={<LibrarianDashboard />} />
      <Route path="/member" element={<MemberDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}