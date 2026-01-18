
import React, { useState } from 'react';
import { AppState, ClassRoom } from '../types';
import { Plus, Trash2, Edit3, School, GraduationCap, User, Save, X } from 'lucide-react';

interface ClassesViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  requestActionWithPin: (onConfirm: () => void) => void;
}

const ClassesView: React.FC<ClassesViewProps> = ({ state, updateState, requestActionWithPin }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ClassRoom, 'id'>>({
    name: '',
    school: '',
    teacher: '',
    level: ''
  });

  const handleSave = () => {
    if (!formData.name || !formData.school) return alert('يرجى ملء الحقول الأساسية');
    
    updateState(prev => {
      if (editingId) {
        // تحديث قسم موجود
        return {
          ...prev,
          classes: prev.classes.map(c => c.id === editingId ? { ...formData, id: editingId } : c)
        };
      } else {
        // إضافة قسم جديد
        return {
          ...prev,
          classes: [...prev.classes, { ...formData, id: Math.random().toString(36).substr(2, 9) }]
        };
      }
    });

    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', school: '', teacher: '', level: '' });
  };

  const startEdit = (c: ClassRoom) => {
    setFormData({
      name: c.name,
      school: c.school,
      teacher: c.teacher,
      level: c.level
    });
    setEditingId(c.id);
    setIsAdding(true);
    // التمرير للأعلى لرؤية النموذج
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelAction = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', school: '', teacher: '', level: '' });
  };

  const handleDelete = (id: string) => {
    requestActionWithPin(() => {
      updateState(prev => ({
        ...prev,
        classes: prev.classes.filter(c => c.id !== id),
        students: prev.students.map(s => s.classId === id ? { ...s, archived: true } : s)
      }));
      if (editingId === id) cancelAction();
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">إدارة الأقسام التربوية</h2>
          <p className="text-slate-500 mt-1">قم بإنشاء وتعديل الأفواج الدراسية</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} />
            <span>قسم جديد</span>
          </button>
        )}
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-smart shadow-xl border-2 border-indigo-100 mb-10 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {editingId ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
            </h3>
            <button onClick={cancelAction} className="text-slate-400 hover:text-rose-500 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 mr-2">اسم القسم</label>
              <input 
                type="text" 
                placeholder="مثلاً: 1 ثانوي ع" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl focus:outline-none font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 mr-2">المؤسسة</label>
              <input 
                type="text" 
                placeholder="اسم الثانوية/الإعدادية" 
                value={formData.school}
                onChange={e => setFormData({...formData, school: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl focus:outline-none font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 mr-2">أستاذ المادة</label>
              <input 
                type="text" 
                placeholder="اسم الأستاذ" 
                value={formData.teacher}
                onChange={e => setFormData({...formData, teacher: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl focus:outline-none font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 mr-2">المستوى</label>
              <input 
                type="text" 
                placeholder="الجذع المشترك" 
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl focus:outline-none font-bold transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-50 hover:bg-emerald-700 transition-all"
            >
              <Save size={18} />
              <span>{editingId ? 'حفظ التغييرات' : 'حفظ القسم'}</span>
            </button>
            <button 
              onClick={cancelAction}
              className="px-8 py-3 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {state.classes.map(c => (
          <div key={c.id} className={`bg-white p-8 rounded-smart shadow-sm border ${editingId === c.id ? 'border-indigo-500 ring-2 ring-indigo-50' : 'border-slate-100'} hover:shadow-xl transition-all group relative`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-3xl transition-colors duration-300 ${editingId === c.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                <School size={28} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEdit(c)}
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white rounded-xl shadow-sm border border-slate-100"
                  title="تعديل"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors bg-white rounded-xl shadow-sm border border-slate-100"
                  title="حذف"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 mb-2">{c.name}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-500 font-bold">
                <GraduationCap size={16} />
                <span className="text-sm">{c.level}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-bold">
                <User size={16} />
                <span className="text-sm">{c.teacher}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-bold">
                <School size={16} />
                <span className="text-xs uppercase tracking-tight">{c.school}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">إحصائيات</span>
              <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {state.students.filter(s => s.classId === c.id && !s.archived).length} تلميذ
              </span>
            </div>
          </div>
        ))}
        {state.classes.length === 0 && !isAdding && (
          <div className="col-span-full py-20 bg-slate-50 rounded-smart border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <School size={48} className="mb-4 opacity-20" />
            <p className="font-bold">لا توجد أقسام مسجلة حالياً</p>
            <p className="text-sm">ابدأ بإضافة قسمك التربوي الأول</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesView;
