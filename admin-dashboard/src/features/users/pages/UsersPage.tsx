import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import type { CreateUserPayload } from '../services/usersService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

const UsersPage = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateUserPayload>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'USER',
    bio: '',
  });

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'USER',
      bio: '',
    });
    setShowModal(true);
  };

  const handleEdit = (user: typeof users[0]) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      bio: user.bio,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateUser(editingId, formData);
      } else {
        await createUser(formData);
      }
      setShowModal(false);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      ADMIN: '👑',
      COMPANY: '🏢',
      USER: '👤',
    };
    return icons[role] || '👤';
  };

  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      NOVICE: 'bg-gray-dark/50 text-gray-400',
      INTERMEDIATE: 'bg-yellow-500/10 text-yellow-400',
      EXPERT: 'bg-accent/10 text-accent',
      LEGENDARY: 'bg-purple-500/10 text-purple-400',
    };
    return colors[rank] || colors.NOVICE;
  };

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-2">
            <div>
              <h1 className="text-5xl font-black text-text mb-2 tracking-tight">
                Users
                <span className="text-accent text-3xl ml-3">({filteredUsers.length})</span>
              </h1>
              <p className="text-lg text-text-secondary">
                {!loading && `${filteredUsers.length} of ${users.length} users`}
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-accent hover:bg-accent-hover px-8 py-4 text-base font-bold self-start md:self-auto shadow-glow"
            >
              ➕ New User
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-base bg-gray-dark border-gray/50"
          />
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-dark border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary text-lg">Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-24 px-6">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-text-secondary text-xl">No users found</p>
            <p className="text-text-secondary text-sm mt-1">Create your first user to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-gray-light border border-gray-dark/50 rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all duration-300 animate-fade-in group"
              >
                <div className="p-6 flex items-start justify-between gap-6">
                  {/* Left Side - User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl flex-shrink-0">{getRoleIcon(user.role)}</div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-text group-hover:text-accent transition-colors">
                          {user.first_name || user.username} {user.last_name}
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">@{user.username}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-block px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold border border-accent/30">
                        {user.role}
                      </span>
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${getRankColor(user.rank)}`}>
                        {user.rank}
                      </span>
                      <span className="inline-block px-3 py-1.5 rounded-lg bg-text-secondary/10 text-text-secondary text-xs font-bold">
                        ⭐ {user.reputation_points}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary">✉️</span>
                        <a href={`mailto:${user.email}`} className="text-text-secondary hover:text-accent transition-colors truncate">
                          {user.email}
                        </a>
                      </div>
                      {user.bio && (
                        <div className="flex items-start gap-3">
                          <span className="text-text-secondary">📝</span>
                          <p className="text-text-secondary line-clamp-2">{user.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(user)}
                      className="py-2.5 px-4 bg-accent/10 hover:bg-accent/20 text-accent font-bold rounded-lg transition-colors text-sm border border-accent/30"
                      title="Edit user"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-lg transition-colors text-sm border border-red-500/30"
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? '✏️ Edit User' : '✨ Create User'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text mb-2">First Name</label>
              <Input
                type="text"
                placeholder="John"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text mb-2">Last Name</label>
              <Input
                type="text"
                placeholder="Doe"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">Username</label>
            <Input
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">Email</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-dark rounded-lg border border-gray-dark/50 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium"
            >
              <option value="USER">👤 User</option>
              <option value="ADMIN">👑 Admin</option>
              <option value="COMPANY">🏢 Company</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">Bio</label>
            <textarea
              placeholder="Tell us about this user..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-dark rounded-lg border border-gray-dark/50 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none font-medium"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-dark/50">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-accent hover:bg-accent-hover py-3 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '⏳ Saving...' : (editingId ? '✓ Update' : '✨ Create')}
            </Button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-3 px-4 bg-gray-dark hover:bg-gray-dark/80 text-text font-bold rounded-lg transition-colors border border-gray-dark/50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
