
import React, { useRef } from 'react';
import { AppState, Staff } from '../types';
import { Printer, FileSpreadsheet, FileText } from 'lucide-react';

interface ReportsViewProps {
  state: AppState;
}

const ReportsView: React.FC<ReportsViewProps> = ({ state }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const activeStaff = state.staff.filter(s => !s.archived);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-800">التقارير الإدارية</h2>
          <p className="text-slate-500 mt-1">توليد الوثائق الرسمية حسب معايير وزارة التربية الوطنية</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700"
        >
          <Printer size={20} />
          <span>طباعة التقرير الحالي</span>
        </button>
      </header>

      <div className="bg-white p-12 shadow-sm border border-slate-100 min-h-[1100px] overflow-x-auto" ref={printRef}>
        <div className="flex justify-between text-center mb-10 text-[11px] font-bold">
          <div className="w-1/3">
            <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
            <p>وزارة التربية الوطنية</p>
          </div>
          <div className="w-1/3 flex flex-col items-center">
            <p className="text-lg mb-2">بطاقة استعلامات الموظفين (الأساتذة والإداريين)</p>
            <p className="text-[10px]">السنة الدراسية: {new Date().getFullYear()}/{new Date().getFullYear()+1}</p>
          </div>
          <div className="w-1/3 text-right">
            <p>مديرية التربية لولاية الأغواط</p>
            <p>المؤسسة: متوسطة المجاهد بوفلجة محمد</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-800 text-[9px] text-center leading-tight">
          <thead>
            <tr className="bg-slate-50 font-black">
              <th className="border border-slate-800 p-1">الرقم</th>
              <th className="border border-slate-800 p-1">الرمز الوظيفي</th>
              <th className="border border-slate-800 p-1">اللقب والاسم</th>
              <th className="border border-slate-800 p-1">الرتبة</th>
              <th className="border border-slate-800 p-1">المادة</th>
              <th className="border border-slate-800 p-1">تاريخ الازدياد</th>
              <th className="border border-slate-800 p-1">تاريخ التعيين</th>
              <th className="border border-slate-800 p-1">رقم CCP</th>
              <th className="border border-slate-800 p-1">الدرجة</th>
              <th className="border border-slate-800 p-1">تاريخ السريان</th>
              <th className="border border-slate-800 p-1">العائلية</th>
              <th className="border border-slate-800 p-1">الأولاد</th>
              <th className="border border-slate-800 p-1">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {activeStaff.map((person, idx) => (
              <tr key={person.id} className="h-8">
                <td className="border border-slate-800 p-1">{idx + 1}</td>
                <td className="border border-slate-800 p-1 font-mono">{person.functionalCode || '---'}</td>
                <td className="border border-slate-800 p-1 font-bold text-right pr-2">{person.name}</td>
                <td className="border border-slate-800 p-1">{person.position}</td>
                <td className="border border-slate-800 p-1">{person.subject || '---'}</td>
                <td className="border border-slate-800 p-1 font-mono">{person.birthDate}</td>
                <td className="border border-slate-800 p-1 font-mono">{person.appointmentDate}</td>
                <td className="border border-slate-800 p-1 font-mono">{person.ccp}</td>
                <td className="border border-slate-800 p-1 font-bold">{person.grade}</td>
                <td className="border border-slate-800 p-1 font-mono">{person.gradeDate}</td>
                <td className="border border-slate-800 p-1">{person.maritalStatus === 'married' ? 'متزوج' : 'أعزب'}</td>
                <td className="border border-slate-800 p-1">{person.childrenCount}</td>
                <td className="border border-slate-800 p-1"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-16 flex justify-between px-10 text-xs font-bold">
          <div className="text-center">
            <p>حرر بـ: ............................ في: ............................</p>
            <p className="mt-4 italic">مدير المؤسسة</p>
            <div className="h-16"></div>
          </div>
          <div className="text-center">
            <p>ختم المؤسسة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
