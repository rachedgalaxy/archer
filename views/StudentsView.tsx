
import React, { useState } from 'react';
import { AppState, Student } from '../types';
// Add Users to imports
import { Plus, Trash2, FileUp, Download, Archive, UserPlus, Search, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentsViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  requestActionWithPin: (onConfirm: () => void) => void;
}

const StudentsView: React.FC<StudentsViewProps> = ({ state, updateState, requestActionWithPin }) => {
  const [selectedClassId, setSelectedClassId] = useState(state.classes[0]?.id || '');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newName, setNewName] = useState('');

  const filteredStudents = state.students.filter(s => 
    s.classId === selectedClassId && 
    !s.archived && 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!newName || !selectedClassId) return;
    updateState(prev => ({
      ...prev,
      students: [...prev.students, {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        classId: selectedClassId,
        archived: false
      }]
    }));
    setNewName('');
    setIsAdding(false);
  };

  const handleArchive = (id: string) => {
    requestActionWithPin(() => {
      updateState(prev => ({
        ...prev,
        students: prev.students.map(s => s.id === id ? { ...s, archived: true } : s)
      }));
    });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClassId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      const newStudents: Student[] = data.map(row => ({
        id: Math.random().toString(36).substr(2, 9),
        name: row['الاسم'] || row['Name'] || row['اسم التلميذ'] || 'غير معروف',
        registrationNumber: row['الرقم'] || row['ID'] || '',
        classId: selectedClassId,
        archived: false
      }));

      updateState(prev => ({
        ...prev,
        students: [...prev.students, ...newStudents]
      }));
      alert(`تم استيراد ${newStudents.length} تلميذ بنجاح`);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">إدارة قاعدة التلاميذ</h2>
          <p className="text-slate-500 mt-1">إضافة تلاميذ وتصدير اللوائح التربوية</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-100 transition-all">
            <FileUp size={20} />
            <span>استيراد إكسيل</span>
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleExcelImport} />
          </label>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700"
          >
            <UserPlus size={20} />
            <span>تلميذ جديد</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="relative">
          <label className="block text-xs font-black text-slate-400 mb-2 mr-4 uppercase">اختر القسم</label>
          <select 
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full p-4 bg-white border border-slate-200 rounded-3xl font-bold appearance-none focus:ring-2 focus:ring-indigo-500"
          >
            {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="relative flex flex-col justify-end">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="البحث بالاسم..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-4 bg-white border border-slate-200 rounded-3xl font-bold focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-smart shadow-xl border border-slate-100 mb-10 animate-in slide-in-from-top-4">
          <h3 className="text-xl font-bold mb-6">إضافة تلميذ جديد</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="اسم التلميذ الكامل" 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
              autoFocus
            />
            <button 
              onClick={handleAdd}
              className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700"
            >
              إضافة
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="px-10 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-smart border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-slate-400 font-bold text-sm">التلميذ</th>
              <th className="px-8 py-5 text-slate-400 font-bold text-sm">الرقم الترتيبي</th>
              <th className="px-8 py-5 text-slate-400 font-bold text-sm">الحالة</th>
              <th className="px-8 py-5 text-slate-400 font-bold text-sm text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStudents.map((student, idx) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5">
                  <span className="font-bold text-slate-800">{student.name}</span>
                </td>
                <td className="px-8 py-5 font-bold text-slate-400">{student.registrationNumber || idx + 1}</td>
                <td className="px-8 py-5">
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">نشط</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => handleArchive(student.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="أرشفة التلميذ"
                    >
                      <Archive size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                  <Users size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold">لا توجد سجلات مطابقة</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsView;
