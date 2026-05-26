import { useEffect, useState } from 'react';
import { listMyProjects, type StudentProject } from '../../../services/studentProjects';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';

const MyProjectsPage = () => {
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyProjects()
      .then(setProjects)
      .catch(() => setError('تعذّر تحميل مشاريعك. سجّل الدخول بحساب حقيقي من الباكند.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-text-secondary">جاري التحميل...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">مشاريعي</h1>
        <a
          href={`${FRONTEND_URL}/code/new`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-hover"
        >
          + مشروع جديد
        </a>
      </div>

      {projects.length === 0 ? (
        <p className="text-text-secondary">لم تنشر أي مشروع بعد.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-gray-light p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-semibold text-text">{p.title}</h2>
                <span className="text-xs text-accent">{p.status}</span>
              </div>
              <p className="mb-2 text-sm text-text-secondary line-clamp-2">{p.summary}</p>
              <p className="text-xs text-text-secondary">
                {p.university} · {p.major}
              </p>
              <a
                href={`${FRONTEND_URL}/code/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-accent hover:underline"
              >
                عرض في الموقع
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;
