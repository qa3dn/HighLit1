import { useState } from 'react';
import { useCompanies } from '../hooks/useCompanies';
import type { CreateCompanyPayload } from '../services/companiesService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

const CompaniesPage = () => {
  const { companies, loading, error, createCompany, updateCompany, deleteCompany } = useCompanies();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyPayload>({
    name: '',
    industry: 'OTHER',
    size: 'STARTUP',
    email: '',
    website: '',
    description: '',
  });

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      industry: 'OTHER',
      size: 'STARTUP',
      email: '',
      website: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleEdit = (company: typeof companies[0]) => {
    setEditingId(company.id);
    setFormData({
      name: company.name,
      industry: company.industry,
      size: company.size,
      email: company.email,
      website: company.website,
      description: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCompany(editingId, formData);
      } else {
        await createCompany(formData);
      }
      setShowModal(false);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      await deleteCompany(id);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const industryIcons: Record<string, string> = {
    TECHNOLOGY: '💻',
    FINANCE: '💰',
    HEALTHCARE: '🏥',
    EDUCATION: '🎓',
    RETAIL: '🛍️',
    MANUFACTURING: '🏭',
    OTHER: '🏢',
  };

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-2">
            <div>
              <h1 className="text-5xl font-black text-text mb-2 tracking-tight">
                Companies
                <span className="text-accent text-3xl ml-3">({filteredCompanies.length})</span>
              </h1>
              <p className="text-lg text-text-secondary">
                {!loading && `${filteredCompanies.length} of ${companies.length} companies`}
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-accent hover:bg-accent-hover px-8 py-4 text-base font-bold self-start md:self-auto shadow-glow"
            >
              ➕ New Company
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
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-base bg-gray-dark border-gray/50"
          />
        </div>

        {/* Companies */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-dark border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary text-lg">Loading companies...</p>
            </div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-24 px-6">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-text-secondary text-xl">No companies found</p>
            <p className="text-text-secondary text-sm mt-1">Get started by creating your first company</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-gray-light border border-gray-dark/50 rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all duration-300 animate-fade-in group"
              >
                {/* Header with icon */}
                <div className="bg-gradient-to-r from-gray-dark to-gray-light p-6 border-b border-gray-dark/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{industryIcons[company.industry] || '🏢'}</div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-text group-hover:text-accent transition-colors">
                          {company.name}
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">{company.industry}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold border border-accent/30">
                      {company.size === 'STARTUP' ? '1-10' :
                       company.size === 'SMALL' ? '11-50' :
                       company.size === 'MEDIUM' ? '51-200' :
                       company.size === 'LARGE' ? '201-1K' : '1K+'}
                      {' employees'}
                    </span>
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-text-secondary/10 text-text-secondary text-xs font-bold">
                      {company.employee_count} active
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-3 text-sm">
                    {company.email && (
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary text-base">✉️</span>
                        <a href={`mailto:${company.email}`} className="text-text-secondary hover:text-accent transition-colors truncate">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary text-base">🌐</span>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline truncate font-medium"
                        >
                          Visit website
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-dark/50">
                    <button
                      onClick={() => handleEdit(company)}
                      className="flex-1 py-2.5 px-4 bg-accent/10 hover:bg-accent/20 text-accent font-bold rounded-lg transition-colors text-sm border border-accent/30"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="flex-1 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-lg transition-colors text-sm border border-red-500/30"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? '✏️ Edit Company' : '✨ Create Company'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-text mb-2">Company Name</label>
            <Input
              type="text"
              placeholder="Acme Corporation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text mb-2">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-dark rounded-lg border border-gray-dark/50 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium"
              >
                <option value="TECHNOLOGY">💻 Technology</option>
                <option value="FINANCE">💰 Finance</option>
                <option value="HEALTHCARE">🏥 Healthcare</option>
                <option value="EDUCATION">🎓 Education</option>
                <option value="RETAIL">🛍️ Retail</option>
                <option value="MANUFACTURING">🏭 Manufacturing</option>
                <option value="OTHER">🏢 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-text mb-2">Company Size</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-dark rounded-lg border border-gray-dark/50 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium"
              >
                <option value="STARTUP">1-10 employees</option>
                <option value="SMALL">11-50 employees</option>
                <option value="MEDIUM">51-200 employees</option>
                <option value="LARGE">201-1000 employees</option>
                <option value="ENTERPRISE">1000+ employees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">Email</label>
            <Input
              type="email"
              placeholder="contact@acme.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">Website</label>
            <Input
              type="url"
              placeholder="https://acme.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">Description</label>
            <textarea
              placeholder="What does this company do?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default CompaniesPage;
