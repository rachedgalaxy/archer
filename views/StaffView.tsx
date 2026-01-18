
import React, { useState, useMemo, useRef } from 'react';
import { AppState, Staff, StaffCustomField } from '../types';
import { 
  Archive, 
  Search, 
  UserPlus, 
  Save, 
  X, 
  Edit3, 
  Briefcase, 
  Loader2, 
  ChevronDown, 
  User, 
  GraduationCap,
  Wrench,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  UserCog,
  ShieldCheck,
  Heart,
  RotateCcw,
  LayoutGrid,
  FileSpreadsheet,
  MapPin,
  Hash,
  Users,
  Link2,
  AlertCircle,
  Info,
  DownloadCloud,
  PlusCircle,
  Trash2,
  Settings2,
  UserCircle,
  Plus,
  Users2
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface StaffViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  requestActionWithPin: (onConfirm: () => void) => void;
  addNotification: (message: string, type?: any) => void;
}

const StaffView: React.FC<StaffViewProps> = ({ state, updateState, requestActionWithPin, addNotification }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Staff['staffType'] | 'all'>('all');
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIX: Added filteredStaff memo to resolve 'Cannot find name filteredStaff' error
  const filteredStaff = useMemo(() => {
    return state.staff.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || s.staffType === filterType;
      return !s.archived && matchesSearch && matchesFilter;
    }).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [state.staff, searchQuery, filterType]);

  const initialForm: Partial<Staff> = {
    name: '', 
    phone: '', 
    email: '', 
    contractType: 'مرسم', 
    jobTitle: '',
    position: 'أستاذ تعليم متوسط', 
    staffType: 'teacher', 
    specialization: '',
    subject: '', 
    functionalCode: '', 
    appointmentDate: new Date().toISOString().split('T')[0],
    birthDate: '1980-01-01', 
    birthPlace: '', 
    ccp: '', 
    grade: '01',
    gradeDate: new Date().toISOString().split('T')[0], 
    maritalStatus: 'married', 
    childrenCount: 0,
    category: '12', 
    customFields: []
  };

  const [formData, setFormData] = useState<Partial<Staff>>(initialForm);

  const formatExcelDate = (val: any): string => {
    if (val === undefined || val === null || val === '') return '';
    let dateObj: Date | null = null;
    if (val instanceof Date) { dateObj = val; } 
    else if (typeof val === 'number') {
      try {
        const parsed = XLSX.SSF.parse_date_code(val);
        return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.m).padStart(2, '0')}`;
      } catch (e) { return String(val); }
    } else {
      const strVal = String(val).trim();
      const timestamp = Date.parse(strVal);
      if (!isNaN(timestamp)) { dateObj = new Date(timestamp); }
      else {
        const cleanedStr = strVal.replace(/[\/\.]/g, '-');
        const parts = cleanedStr.split('-');
        if (parts.length === 3) {
          if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          else if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      }
    }
    if (dateObj && !isNaN(dateObj.getTime())) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(val);
  };

  const processStaffData = (rawData: any[]) => {
    const cleanedRows = rawData.filter(row => {
      const values = Object.values(row).join(' ');
      const skipTerms = ['الجمهورية الجزائرية', 'وزارة التربية', 'القائمة الاسمية', 'مديرية التربية'];
      return !skipTerms.some(term => values.includes(term)) && values.trim().length > 5;
    });

    const fieldMapping = {
      functionalCode: ['الرمز الوظيفي', 'الرقم', 'رقم التسجيل', 'ID', 'Code', 'رقم الموظف'],
      surname: ['اللقب', 'لقب', 'Nom', 'Last Name'],
      firstName: ['الاسم', 'اسم', 'إسم', 'الأسماء', 'Prenom', 'Prénom'],
      combinedName: ['اللقب والاسم', 'اللقب و الاسم', 'اللقب والأسماء', 'الاسم واللقب', 'الاسم و اللقب', 'Nom et Prenom', 'Full Name'],
      birthDate: ['تاريخ الازدياد', 'تاريخ الميلاد', 'ت.الميلاد', 'ت.الازدياد', 'تاريخ ميلاد', 'تاريخ ازدياد', 'Date de naissance', 'Date of Birth'],
      birthPlace: ['مكان الميلاد', 'مكان الازدياد', 'بـ', 'بـ:', 'Lieu de naissance'],
      position: ['الرتبة', 'المنصب', 'Grade', 'Position', 'الرتبة الحالية'],
      subject: ['المادة', 'مادة التدريس', 'Subject', 'التخصص'],
      jobTitle: ['الوظيفة', 'Function', 'المهنة'],
      contractType: ['الصفة', 'نوع العقد', 'Status', 'Contract'],
      grade: ['الدرجة', 'Echelon', 'الدرجة الحالية'],
      gradeDate: ['تاريخ السريان', 'تاريخ مفعول الدرجة', 'تاريخ سريان الدرجة', 'تاريخ الدرجة'],
      appointmentDate: ['تاريخ التعيين', 'تاريخ التوظيف', 'تاريخ أول تعيين', 'Date d\'engagement'],
      ccp: ['رقم CCP', 'الحساب البريدي', 'رقم الحساب الجاري', 'CCP'],
      maritalStatus: ['الحالة العائلية', 'الحالة الاجتماعية', 'Marital Status'],
      childrenCount: ['الأولاد', 'عدد الأطفال', 'عدد الأولاد']
    };

    return cleanedRows.map((row) => {
      const normalizedRow: any = {};
      const usedKeysInRow = new Set<string>();
      Object.keys(row).forEach(k => { normalizedRow[k.toString().trim().replace(/\s+/g, ' ')] = row[k]; });

      const getFieldValue = (fieldKeys: string[]) => {
        for (const key of fieldKeys) {
          if (normalizedRow[key] !== undefined && normalizedRow[key] !== null && String(normalizedRow[key]).trim() !== "") {
            usedKeysInRow.add(key);
            return normalizedRow[key];
          }
        }
        return '';
      };

      const functionalCode = String(getFieldValue(fieldMapping.functionalCode)).trim();
      const sn = getFieldValue(fieldMapping.surname);
      const fn = getFieldValue(fieldMapping.firstName);
      const cn = getFieldValue(fieldMapping.combinedName);
      let name = String(cn || (sn || fn ? `${sn} ${fn}`.trim() : '')).trim();
      if (!name) name = `موظف ${Math.floor(Math.random() * 9000) + 1000}`;

      const birthDate = formatExcelDate(getFieldValue(fieldMapping.birthDate));
      const birthPlace = String(getFieldValue(fieldMapping.birthPlace));
      const pos = String(getFieldValue(fieldMapping.position) || 'موظف');
      const sub = String(getFieldValue(fieldMapping.subject) || '');
      const job = String(getFieldValue(fieldMapping.jobTitle) || sub);
      const contract = String(getFieldValue(fieldMapping.contractType) || 'مرسم');
      const grd = String(getFieldValue(fieldMapping.grade) || '00');
      const grdDate = formatExcelDate(getFieldValue(fieldMapping.gradeDate));
      const appDate = formatExcelDate(getFieldValue(fieldMapping.appointmentDate));
      const ccpNum = String(getFieldValue(fieldMapping.ccp)).replace(/\s/g, '');
      const marital = String(getFieldValue(fieldMapping.maritalStatus)).includes('متزوج') ? 'married' : 'single';
      const kids = Number(getFieldValue(fieldMapping.childrenCount) || 0);

      const type: Staff['staffType'] = pos.includes('مدير') || pos.includes('ناظر') ? 'admin' :
                                       pos.includes('أستاذ') || pos.includes('معلم') ? 'teacher' : 'service';

      const custom: StaffCustomField[] = [];
      Object.keys(normalizedRow).forEach(key => {
        if (!usedKeysInRow.has(key) && normalizedRow[key] !== undefined && normalizedRow[key] !== null && String(normalizedRow[key]).trim() !== "") {
          custom.push({ id: Math.random().toString(36).substr(2, 5), label: key, value: String(normalizedRow[key]).trim() });
        }
      });

      return {
        id: Math.random().toString(36).substr(2, 9),
        name, functionalCode, position: pos, subject: sub, jobTitle: job, contractType: contract,
        birthDate, birthPlace, appointmentDate: appDate, ccp: ccpNum, grade: grd, gradeDate: grdDate,
        maritalStatus: marital, childrenCount: kids, staffType: type, archived: false, customFields: custom
      } as Staff;
    });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];
        const newStaff = processStaffData(rawData);
        updateState(prev => ({ ...prev, staff: [...prev.staff, ...newStaff] }));
        addNotification(`تم استيراد ${newStaff.length} موظف بنجاح`, 'success');
      } catch (err) { addNotification('فشل في معالجة الملف', 'error'); } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = () => {
    if (!formData.name) return addNotification('يرجى إدخال اسم الموظف', 'error');
    updateState(prev => {
      const classification = classifyStaffRole(formData.position || 'موظف');
      const finalData = { ...formData, staffType: classification.type };
      if (editingId) return { ...prev, staff: prev.staff.map(s => s.id === editingId ? { ...finalData, id: editingId } as Staff : s) };
      return { ...prev, staff: [...prev.staff, { ...finalData, id: Math.random().toString(36).substr(2, 9), archived: false } as Staff] };
    });
    addNotification(editingId ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح', 'success');
    closeForm();
  };

  const classifyStaffRole = (pos: string) => {
    const p = pos ? pos.toLowerCase() : '';
    if (p.includes('مدير') || p.includes('ناظر')) return { type: 'admin' as const, icon: ShieldCheck, color: 'bg-indigo-100 text-indigo-700' };
    if (p.includes('أستاذ') || p.includes('معلم')) return { type: 'teacher' as const, icon: Briefcase, color: 'bg-violet-100 text-violet-700' };
    return { type: 'service' as const, icon: User, color: 'bg-slate-50 text-slate-500' };
  };

  const closeForm = () => { setIsFormOpen(false); setEditingId(null); setFormData(initialForm); };

  const DataItem = ({ icon: Icon, label, value, isMono = false }: any) => (
    <div className="space-y-0.5 overflow-hidden">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon size={12} />
        <span className="text-[10px] font-black uppercase tracking-wider truncate">{label}</span>
      </div>
      <p className={`text-xs font-black text-slate-800 truncate ${isMono ? 'font-mono' : ''}`}>{value || '---'}</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 no-print">
        <div>
           <h2 className="text-3xl font-black text-slate-800">إدارة الطاقم</h2>
           <p className="text-slate-500 font-bold mt-1 text-sm">إضافة وتعديل كافة البيانات المستوردة والمضافة</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm">
            {isImporting ? <Loader2 size={22} className="animate-spin" /> : <FileSpreadsheet size={22} />}
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleExcelImport} />
          </button>
          <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-sm rounded-[2rem] shadow-xl hover:bg-indigo-700">
            <UserPlus size={20} />
            <span>إضافة موظف</span>
          </button>
        </div>
      </header>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#F8FAFC] w-full max-w-5xl rounded-[3.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-white animate-in zoom-in-95">
            <header className="px-10 py-6 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg">
                  <UserCircle size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">{editingId ? 'تعديل الملف الإداري' : 'بطاقة موظف جديد'}</h3>
                  <p className="text-xs text-slate-400 font-bold">يرجى مراجعة كافة الحقول بعناية لضمان صحة شهادات العمل</p>
                </div>
              </div>
              <button onClick={closeForm} className="p-4 bg-slate-50 rounded-[1.2rem] text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                  <h4 className="text-xs font-black text-indigo-600 flex items-center gap-3 uppercase tracking-widest"><User size={16} /> المعلومات الشخصية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الاسم واللقب</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">تاريخ الميلاد</label>
                      <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">مكان الميلاد</label>
                      <input type="text" value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" />
                    </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                  <h4 className="text-xs font-black text-emerald-600 flex items-center gap-3 uppercase tracking-widest"><Briefcase size={16} /> المسار المهني والوظيفي</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الرتبة (Position)</label>
                      <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-emerald-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الوظيفة (Job)</label>
                      <input type="text" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-emerald-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الصفة (Contract Type)</label>
                      <input type="text" value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-emerald-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">تاريخ أول تعيين</label>
                      <input type="date" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-emerald-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">المادة / التخصص</label>
                      <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-emerald-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الرمز الوظيفي</label>
                      <input type="text" value={formData.functionalCode} onChange={e => setFormData({...formData, functionalCode: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-emerald-100" />
                    </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                  <h4 className="text-xs font-black text-amber-600 flex items-center gap-3 uppercase tracking-widest"><CreditCard size={16} /> البيانات الإدارية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الدرجة</label>
                      <input type="text" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-amber-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">رقم الحساب الجاري</label>
                      <input type="text" value={formData.ccp} onChange={e => setFormData({...formData, ccp: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-amber-100 font-mono" />
                    </div>
                  </div>
               </div>
            </div>

            <footer className="px-10 py-6 bg-white border-t border-slate-100 flex gap-4">
              <button onClick={handleSave} className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"><Save size={20} /> حفظ البيانات</button>
              <button onClick={closeForm} className="px-10 py-5 bg-slate-50 text-slate-500 font-black rounded-[1.5rem] hover:bg-slate-100 transition-all">إلغاء</button>
            </footer>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-50 mb-8 flex flex-col lg:flex-row items-center gap-4 no-print">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="البحث بالاسم..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pr-14 pl-6 py-4 bg-slate-50/50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
        </div>
        <div className="flex gap-2 p-1 bg-slate-50 rounded-[1.5rem]">
          {['all', 'teacher', 'admin', 'service'].map(type => (
            <button key={type} onClick={() => setFilterType(type as any)} className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${filterType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-indigo-400'}`}>
              {type === 'all' ? 'الكل' : type === 'teacher' ? 'أساتذة' : type === 'admin' ? 'إدارة' : 'خدمات'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map(staff => {
          const cls = classifyStaffRole(staff.position);
          const isExp = expandedId === staff.id;
          const RoleIcon = cls.icon;
          return (
            <div key={staff.id} onClick={() => setExpandedId(isExp ? null : staff.id)} className={`relative bg-white rounded-[2.5rem] border transition-all duration-500 cursor-pointer overflow-hidden ${isExp ? 'border-indigo-400 shadow-2xl z-20 col-span-1 md:col-span-2 lg:col-span-3' : 'border-slate-50 shadow-sm hover:shadow-md'}`}>
              <div className="p-6 flex items-center gap-5">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner ${cls.color}`}><RoleIcon size={28} /></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black truncate text-slate-800">{staff.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate mt-0.5">{staff.jobTitle || staff.position}</p>
                </div>
                <ChevronDown size={20} className={`text-slate-300 transition-transform no-print ${isExp ? 'rotate-180 text-indigo-500' : ''}`} />
              </div>
              {isExp && (
                <div className="px-10 pb-10 pt-4 border-t border-slate-50 bg-slate-50/20 animate-in slide-in-from-top-4 duration-300">
                  <div className="max-w-4xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-2 gap-y-6 gap-x-4">
                         <DataItem icon={ShieldCheck} label="الرتبة" value={staff.position} />
                         <DataItem icon={GraduationCap} label="الوظيفة" value={staff.jobTitle} />
                         <DataItem icon={Calendar} label="الازدياد" value={staff.birthDate} isMono />
                         <DataItem icon={MapPin} label="مكان الميلاد" value={staff.birthPlace} />
                         <DataItem icon={Calendar} label="تاريخ التعيين" value={staff.appointmentDate} isMono />
                         <DataItem icon={CreditCard} label="الصفة" value={staff.contractType} />
                         <DataItem icon={Hash} label="الرمز" value={staff.functionalCode} isMono />
                         <DataItem icon={CreditCard} label="CCP" value={staff.ccp} isMono />
                      </div>
                      <div className="bg-white p-7 rounded-[2.5rem] border border-rose-100 shadow-sm space-y-4">
                        <h5 className="text-[11px] font-black text-rose-600 flex items-center gap-2 border-b border-rose-50 pb-2"><Info size={14} /> بيانات إضافية</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {staff.customFields && staff.customFields.length > 0 ? (
                            staff.customFields.map(f => <DataItem key={f.id} icon={PlusCircle} label={f.label} value={f.value} />)
                          ) : ( <p className="text-[10px] text-slate-300 font-bold italic">لا توجد بيانات إضافية</p> )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4 no-print">
                       <button onClick={(e) => { e.stopPropagation(); setEditingId(staff.id); setFormData(staff); setIsFormOpen(true); }} className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 font-black text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"><Edit3 size={16} /> تعديل البيانات</button>
                       <button onClick={(e) => { e.stopPropagation(); requestActionWithPin(() => updateState(p => ({...p, staff: p.staff.map(s => s.id === staff.id ? {...s, archived: true} : s)}))); }} className="flex-1 py-4 bg-white border border-rose-100 text-rose-500 font-black text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-50 transition-all"><Archive size={16} /> أرشفة</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffView;
