import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export const AdminCareersPage: React.FC = () => {
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Create state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hollandCode: 'RIASEC',
    salaryRange: '',
    educationLevel: '',
    skills: '',
    workEnvironment: '',
    futureOutlook: 'Tốt'
  });

  const loadCareers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/careers');
      setCareers(res.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadCareers(); }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      title: '', description: '', hollandCode: 'R', salaryRange: '', educationLevel: '', skills: '', workEnvironment: '', futureOutlook: 'Tốt'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (career: any) => {
    setIsEditing(true);
    setCurrentId(career.id);
    setFormData({
      title: career.title,
      description: career.description || '',
      hollandCode: career.hollandCode,
      salaryRange: career.salaryRange || '',
      educationLevel: career.educationLevel || '',
      skills: (career.skills || []).join(', '),
      workEnvironment: career.workEnvironment || '',
      futureOutlook: career.futureOutlook || 'Tốt'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      
      if (isEditing) {
        await api.put(`/admin/careers/${currentId}`, payload);
      } else {
        await api.post('/admin/careers', payload);
      }
      setShowModal(false);
      loadCareers();
    } catch (err) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa nghề nghiệp này?')) return;
    try {
      await api.delete(`/admin/careers/${id}`);
      loadCareers();
    } catch {
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Nghề nghiệp</h2>
          <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xóa thông tin hướng nghiệp</p>
        </div>
        <button onClick={handleOpenCreate} className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600">
          + Thêm nghề mới
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careers.map(c => (
            <div key={c.id} className="border border-gray-200 rounded-xl p-4 flex flex-col">
              <h3 className="font-bold text-lg text-gray-800">{c.title}</h3>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold w-max mt-1">Mã: {c.hollandCode}</span>
              <p className="text-gray-600 text-sm mt-2 line-clamp-2 flex-1">{c.description}</p>
              
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleOpenEdit(c)} className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Sửa
                </button>
                <button onClick={() => handleDelete(c.id)} className="flex-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{isEditing ? 'Sửa nghề nghiệp' : 'Thêm nghề nghiệp'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nghề nghiệp</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã Holland</label>
                  <input required value={formData.hollandCode} onChange={e => setFormData({...formData, hollandCode: e.target.value})} className="w-full px-3 py-2 border rounded-xl" placeholder="VD: RIA" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng (cách nhau dấu phẩy)</label>
                <input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương</label>
                  <input value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Học vấn</label>
                  <input value={formData.educationLevel} onChange={e => setFormData({...formData, educationLevel: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Triển vọng</label>
                  <input value={formData.futureOutlook} onChange={e => setFormData({...formData, futureOutlook: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
              </div>

              <div className="mt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
