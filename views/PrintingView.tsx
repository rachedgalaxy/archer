
import React, { useState, useMemo, useRef } from 'react';
import { AppState, Staff } from '../types';
import { 
  Printer, 
  Search, 
  X,
  UserCheck,
  Calendar,
  MapPin, 
  Hash,
  Type,
  Layout,
  Clock,
  Info,
  Building2,
  FileText,
  ChevronLeft,
  Settings2,
  Edit2
} from 'lucide-react';

interface PrintingViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  addNotification: (message: string, type?: any) => void;
}

const PrintingView: React.FC<PrintingViewProps> = ({ state, updateState, addNotification }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isEditorMode, setIsEditorMode] = useState(false);
  
  const [docData, setDocData] = useState({
    certNumber: '317 / أ م ب / ' + new Date().getFullYear(),
    issueDate: new Date().toISOString().split('T')[0],
    issuePlace: state.institutionInfo.directorate || 'الأغواط',
    startDate: '', 
    endDate: 'يومنا هذا' 
  });

  const editorRef = useRef<HTMLDivElement>(null);

  const filteredStaff = useMemo(() => {
    return state.staff.filter(s => 
      !s.archived && 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [state.staff, searchQuery]);

  const openEditor = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsEditorMode(true);
    setDocData({
      ...docData,
      issuePlace: state.institutionInfo.directorate || 'الأغواط',
      startDate: staff.appointmentDate || '',
      endDate: 'يومنا هذا'
    });
    addNotification('يمكنك الآن التعديل مباشرة على النص داخل الورقة.', 'info');
  };

  const handlePrintHTML = () => {
    if (!editorRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addNotification('يرجى السماح بفتح النوافذ المنبثقة للطباعة', 'error');
      return;
    }

    const content = editorRef.current.innerHTML;
    const styles = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>شهادة عمل - ${selectedStaff?.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4; margin: 0; }
          body { 
            font-family: 'Amiri', serif; 
            margin: 0; 
            padding: 0; 
            background-color: white;
            -webkit-print-color-adjust: exact;
          }
          .paper {
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            margin: auto;
            box-sizing: border-box;
            position: relative;
            background: white;
            color: black;
          }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .font-black { font-weight: 900; }
          .underline { text-decoration: underline; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          h1 { font-size: 34pt; margin: 0; padding-bottom: 10px; border-bottom: 4px solid black; display: inline-block; }
          p { font-size: 16pt; line-height: 2.2; margin: 10px 0; }
          .header p { font-size: 14pt; margin: 5px 0; line-height: 1.2; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-start; }
          .signature-box { min-width: 250px; text-align: center; }
          [contenteditable] { outline: none; border: none; }
        </style>
      </head>
      <body>
        <div class="paper">
          ${content}
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(styles);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* Sidebar Control Panel - Responsive Drawer */}
      <div className={`
        no-print z-[60] transition-all duration-500 ease-in-out
        ${isEditorMode 
          ? 'fixed inset-0 md:relative md:inset-auto w-full md:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col' 
          : 'w-full space-y-8'}
      `}>
        
        {isEditorMode ? (
          <div className="h-full flex flex-col animate-in slide-in-from-right duration-500">
            {/* Header of Sidebar */}
            <div className="px-6 py-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Settings2 size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">أدوات التحرير</h3>
               </div>
               <button 
                 onClick={() => setIsEditorMode(false)} 
                 className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500 hover:bg-rose-50 transition-all"
               >
                  <X size={20} />
               </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
               
               {/* Institution Group */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <Building2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">بيانات المؤسسة</span>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 mr-2">مديرية التربية لولاية</label>
                      <input 
                        type="text" 
                        value={state.institutionInfo.directorate} 
                        onChange={e => updateState(prev => ({...prev, institutionInfo: {...prev.institutionInfo, directorate: e.target.value}}))} 
                        className="w-full p-3 bg-white rounded-2xl border-none font-bold text-sm shadow-sm focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 mr-2">اسم المؤسسة التعليمية</label>
                      <textarea 
                        value={state.institutionInfo.schoolName} 
                        onChange={e => updateState(prev => ({...prev, institutionInfo: {...prev.institutionInfo, schoolName: e.target.value}}))} 
                        rows={2} 
                        className="w-full p-3 bg-white rounded-2xl border-none font-bold text-sm shadow-sm resize-none focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                  </div>
               </div>

               {/* Document Details Group */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <FileText size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">تفاصيل الشهادة</span>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 mr-2">رقم الشهادة (الصادر)</label>
                      <input 
                        type="text" 
                        value={docData.certNumber} 
                        onChange={e => setDocData({...docData, certNumber: e.target.value})} 
                        className="w-full p-3 bg-white rounded-2xl border-none font-bold text-sm shadow-sm focus:ring-2 focus:ring-emerald-500" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 mr-2">تاريخ التحرير</label>
                        <input 
                          type="date" 
                          value={docData.issueDate} 
                          onChange={e => setDocData({...docData, issueDate: e.target.value})} 
                          className="w-full p-3 bg-white rounded-2xl border-none font-bold text-xs shadow-sm focus:ring-2 focus:ring-emerald-500" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 mr-2">مكان التحرير</label>
                        <input 
                          type="text" 
                          value={docData.issuePlace} 
                          onChange={e => setDocData({...docData, issuePlace: e.target.value})} 
                          className="w-full p-3 bg-white rounded-2xl border-none font-bold text-xs shadow-sm focus:ring-2 focus:ring-emerald-500" 
                        />
                      </div>
                    </div>
                  </div>
               </div>

               {/* Work Period Group */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">فترة العمل بالقطاع</span>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 mr-2">يعمل منذ تاريخ</label>
                      <input 
                        type="date" 
                        value={docData.startDate} 
                        onChange={e => setDocData({...docData, startDate: e.target.value})} 
                        className="w-full p-3 bg-white rounded-2xl border-none font-bold text-sm shadow-sm focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 mr-2">إلى غاية (ملاحظة)</label>
                      <input 
                        type="text" 
                        value={docData.endDate} 
                        onChange={e => setDocData({...docData, endDate: e.target.value})} 
                        className="w-full p-3 bg-white rounded-2xl border-none font-bold text-sm shadow-sm focus:ring-2 focus:ring-amber-500" 
                        placeholder="يومنا هذا"
                      />
                    </div>
                  </div>
               </div>
            </div>

            {/* Sticky Footer for Sidebar */}
            <div className="p-6 bg-white border-t border-slate-100 mt-auto sticky bottom-0">
               <button 
                 onClick={handlePrintHTML}
                 className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 group"
               >
                  <Printer size={22} className="group-hover:animate-bounce" />
                  طباعة الشهادة الآن
               </button>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">مركز الوثائق الرقمي</h2>
                <p className="text-slate-500 font-bold mt-1 text-sm">توليد شهادات عمل رسمية بدقة واحترافية</p>
              </div>
            </header>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                     <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl"><UserCheck size={20} /></div>
                     اختر الموظف لبدء التحرير
                  </h3>
                  <div className="relative w-full md:w-80">
                     <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input 
                       type="text" 
                       placeholder="ابحث بالاسم..."
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                       className="w-full pr-12 pl-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStaff.map(staff => (
                     <button 
                       key={staff.id}
                       onClick={() => openEditor(staff)}
                       className="flex items-center gap-4 p-5 rounded-[2rem] border border-transparent bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all text-right group"
                     >
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                           {staff.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                           <p className="font-black text-sm truncate">{staff.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{staff.position}</p>
                        </div>
                     </button>
                  ))}
                  {filteredStaff.length === 0 && (
                     <div className="col-span-full py-20 text-center">
                        <Layout size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">لم يتم العثور على موظفين مطابقين للبحث</p>
                     </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Editor Surface - Simulated A4 Page */}
      {isEditorMode && selectedStaff && (
        <div className="flex-1 overflow-y-auto no-scrollbar py-10 px-4 md:px-10">
          <div className="max-w-[210mm] mx-auto">
            {/* Context Actions Floating (Mobile Friendly) */}
            <div className="no-print flex justify-center mb-8 sticky top-0 z-20">
               <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white flex items-center gap-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs">
                     <Edit2 size={16} />
                     <span className="hidden sm:inline">تعديل مباشر على المعاينة</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <button onClick={handlePrintHTML} className="flex items-center gap-2 text-emerald-600 font-black text-xs hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-all">
                     <Printer size={16} />
                     <span>طباعة (HTML)</span>
                  </button>
                  <button onClick={() => setIsEditorMode(false)} className="md:hidden flex items-center gap-2 text-slate-400 font-black text-xs hover:bg-slate-50 px-3 py-1.5 rounded-full transition-all">
                     <ChevronLeft size={16} />
                     <span>رجوع للأدوات</span>
                  </button>
               </div>
            </div>

            {/* The Paper Component with Content Editable fields */}
            <div 
              ref={editorRef}
              className="paper-editor font-amiri text-right bg-white shadow-2xl mx-auto" 
              dir="rtl"
            >
              <div className="text-center space-y-2 mb-10 header">
                 <p className="font-bold" contentEditable={true} suppressContentEditableWarning={true}>الجمهورية الجزائرية الديمقراطية الشعبية</p>
                 <p className="font-bold" contentEditable={true} suppressContentEditableWarning={true}>وزارة التربية الوطنية</p>
                 <p className="font-bold">مديرية التربية لولاية <span contentEditable={true} suppressContentEditableWarning={true} onBlur={(e) => updateState(prev => ({...prev, institutionInfo: {...prev.institutionInfo, directorate: e.currentTarget.textContent || ''}}))}>{state.institutionInfo.directorate || '........'}</span></p>
              </div>

              <div className="space-y-1 mb-12 header">
                 <p className="font-bold" contentEditable={true} suppressContentEditableWarning={true} onBlur={(e) => updateState(prev => ({...prev, institutionInfo: {...prev.institutionInfo, schoolName: e.currentTarget.textContent || ''}}))}>{state.institutionInfo.schoolName || 'المؤسسة التعليمية المذكورة أعلاه'}</p>
                 <p className="font-bold">الرقم : <span contentEditable={true} suppressContentEditableWarning={true} onBlur={(e) => setDocData({...docData, certNumber: e.currentTarget.textContent || ''})}>{docData.certNumber}</span></p>
              </div>

              <div className="text-center my-14">
                 <h1 className="font-black" contentEditable={true} suppressContentEditableWarning={true}>شهـــــــادة عــــــــمــــــــل</h1>
              </div>

              <div className="space-y-10 mt-12 px-6">
                 <p>
                    شهد السيد(ة) مدير <span className="font-black underline" contentEditable={true} suppressContentEditableWarning={true}>{state.institutionInfo.schoolName || 'المؤسسة المذكورة أعلاه'}</span>
                 </p>
                 
                 <p>
                    بأن السيـــــد(ة) : <span className="font-black" style={{fontSize: '20pt'}} contentEditable={true} suppressContentEditableWarning={true}>{selectedStaff.name}</span>
                 </p>

                 <div className="grid">
                    <p>المولود (ة) بتاريخ : <span className="font-black" contentEditable={true} suppressContentEditableWarning={true}>{selectedStaff.birthDate}</span></p>
                    <p>بـ : <span className="font-black" contentEditable={true} suppressContentEditableWarning={true}>{selectedStaff.birthPlace || '...........'}</span></p>
                 </div>

                 <div className="space-y-2">
                    <p>الرتبة : <span className="font-black" contentEditable={true} suppressContentEditableWarning={true}>{selectedStaff.position}</span></p>
                    <p>الصفة : <span className="font-black" contentEditable={true} suppressContentEditableWarning={true}>{selectedStaff.contractType || 'مرسم'}</span></p>
                    <p>الوظيفة : <span className="font-black" contentEditable={true} suppressContentEditableWarning={true}>{selectedStaff.jobTitle || selectedStaff.subject || 'أستاذ'}</span></p>
                 </div>

                 <p>مكان العمل : <span className="font-black" contentEditable={true} suppressContentEditableWarning={true}>{state.institutionInfo.schoolName || '................'}</span></p>
                 
                 <p>
                    (ت) يعد من موظفي قطاع التربية منذ : <span className="font-black" contentEditable={true} suppressContentEditableWarning={true} onBlur={(e) => setDocData({...docData, startDate: e.currentTarget.textContent || ''})}>{docData.startDate}</span> إلى <span className="font-black" contentEditable={true} suppressContentEditableWarning={true} onBlur={(e) => setDocData({...docData, endDate: e.currentTarget.textContent || ''})}>{docData.endDate}</span>.
                 </p>

                 <p className="text-center font-bold mt-16 italic" style={{fontSize: '13pt'}} contentEditable={true} suppressContentEditableWarning={true}>
                    سلمت هذه الشهادة لإستعمالها في حدود ما يسمح به القانون
                 </p>
              </div>

              <div className="footer px-10 mt-auto pb-10">
                 <div className="flex justify-between items-start">
                   <div className="text-right">
                      <p className="font-bold" style={{fontSize: '13pt'}}>حرر بـ : <span contentEditable={true} suppressContentEditableWarning={true} onBlur={(e) => setDocData({...docData, issuePlace: e.currentTarget.textContent || ''})}>{docData.issuePlace}</span></p>
                      <p className="font-bold" style={{fontSize: '13pt'}}>في : <span contentEditable={true} suppressContentEditableWarning={true} onBlur={(e) => setDocData({...docData, issueDate: e.currentTarget.textContent || ''})}>{new Date(docData.issueDate).toLocaleDateString('ar-DZ').replace(/\//g, '-')}</span></p>
                   </div>
                   <div className="signature-box">
                      <p className="font-black underline" style={{fontSize: '15pt'}} contentEditable={true} suppressContentEditableWarning={true}>مدير المؤسسة</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintingView;
