import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { useDeleteUser, useSetUserBan, useSetUserRole, useUsers } from '../useUsers';
import type { AdminUser, UserRole } from '../userService';
import { UserDetailDrawer } from '../components/UserDetailDrawer';

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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: users, isLoading, isError } = useUsers(query);
  const setRole = useSetUserRole();
  const setBan = useSetUserBan();
  const deleteUser = useDeleteUser();

  const confirmDelete = async () => {
    if (!toDelete) return;
    await deleteUser.mutateAsync(toDelete.id);
    setToDelete(null);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'username',
      header: 'المستخدم',
      render: (u) => <span className="font-medium text-text">{u.username}</span>,
    },
    { key: 'email', header: 'البريد', render: (u) => <span className="text-text-secondary">{u.email}</span> },
    { key: 'role', header: 'الدور', render: (u) => <Badge variant={roleVariant[u.role]}>{u.role}</Badge> },
    {
      key: 'status',
      header: 'الحالة',
      render: (u) =>
        u.is_active ? <Badge variant="success">نشط</Badge> : <Badge variant="danger">محظور</Badge>,
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (u) => (
        <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <select
            value={u.role}
            onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value as UserRole })}
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
            onClick={() => setBan.mutate({ id: u.id, isActive: !u.is_active })}
            className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent"
          >
            {u.is_active ? 'حظر' : 'رفع الحظر'}
          </button>
          <button
            type="button"
            onClick={() => setToDelete(u)}
            className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

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

      {isError ? (
        <p className="text-red-400">تعذّر تحميل المستخدمين.</p>
      ) : (
        <DataTable
          columns={columns}
          rows={users ?? []}
          keyField={(u) => u.id}
          onRowClick={(u) => setSelectedUserId(u.id)}
          loading={isLoading}
          empty="لا يوجد مستخدمون مطابقون."
        />
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

      <UserDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
};

export default UsersPage;
