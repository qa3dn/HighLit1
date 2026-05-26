import { useState } from 'react';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useDeleteUser, useSetUserBan, useSetUserRole, useUsers } from '../useUsers';
import type { AdminUser, UserRole } from '../userService';

const ROLES: UserRole[] = ['USER', 'ADMIN', 'COMPANY'];

const roleVariant: Record<UserRole, 'success' | 'info' | 'warning'> = {
  ADMIN: 'success',
  COMPANY: 'info',
  USER: 'warning',
};

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);

  const { data: users, isLoading, isError } = useUsers(query);
  const setRole = useSetUserRole();
  const setBan = useSetUserBan();
  const deleteUser = useDeleteUser();

  const confirmDelete = async () => {
    if (!toDelete) return;
    await deleteUser.mutateAsync(toDelete.id);
    setToDelete(null);
  };

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text">إدارة المستخدمين</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
          <Button type="submit" variant="secondary" size="sm">
            بحث
          </Button>
        </form>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <p className="text-red-400">تعذّر تحميل المستخدمين.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-gray-light">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="border-b border-border bg-gray text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">المستخدم</th>
                <th className="px-4 py-3">البريد</th>
                <th className="px-4 py-3">الدور</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(users ?? []).map((user) => (
                <tr key={user.id} className="hover:bg-gray transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{user.username}</td>
                  <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_active ? (
                      <Badge variant="success">نشط</Badge>
                    ) : (
                      <Badge variant="danger">محظور</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          setRole.mutate({ id: user.id, role: e.target.value as UserRole })
                        }
                        className="rounded border border-border bg-gray px-2 py-1 text-xs text-text outline-none focus:border-accent"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setBan.mutate({ id: user.id, isActive: !user.is_active })}
                        className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent"
                      >
                        {user.is_active ? 'حظر' : 'رفع الحظر'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(user)}
                        className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(users ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                    لا يوجد مستخدمون مطابقون.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title="تأكيد الحذف">
        <p className="mb-6 text-text-secondary">
          سيتم حذف المستخدم <span className="text-text">{toDelete?.username}</span> نهائياً. لا يمكن
          التراجع عن هذا الإجراء.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleteUser.isPending}>
            {deleteUser.isPending ? '...جارٍ' : 'حذف نهائي'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
