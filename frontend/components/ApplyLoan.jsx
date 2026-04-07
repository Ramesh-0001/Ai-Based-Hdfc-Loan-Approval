import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, IndianRupee, FileCheck, AlertCircle, Clock, Upload, 
  GraduationCap, BookOpen, ChevronLeft, ArrowRight, CheckCircle2, 
  Mail, Fingerprint, Building2, Calendar, ShieldCheck, XCircle
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { API_BASE_URL } from '../src/config/api';

// --- Vite-Native Worker Registry HUB ---
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
}

/** 
 * Institutional Parity Hub: Normalizes nodes for exact character comparison 
 */
const normalizeText = (txt) => (txt || "").toString().replace(/\s+/g, ' ').trim().toLowerCase();
const normalizeAggressive = (txt) => (txt || "").toString().replace(/\s+/g, '').trim().toLowerCase();

// --- Sub-Components ---

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon, error, type = 'text' }) => (
  <div className="space-y-1.5 font-sans">
    <label className="text-sm font-medium text-gray-700 ml-0.5">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        name={name} type={type} value={value || ''} onChange={onChange}
        placeholder={placeholder} autoComplete="off"
        className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.2 text-[15px] font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
      />
    </div>
    {error && <p className="text-xs text-red-500 font-medium mt-1 flex items-center pl-0.5"><AlertCircle size={12} className="mr-1" />{error}</p>}
  </div>
);

const DocSlot = ({ title, statusKey, verificationStatus, onFileSelect, uploads, isVerifying, extractionProgress }) => {
  const fileInputRef = useRef(null);
  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${verificationStatus[statusKey] ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-white border-gray-200 shadow-sm hover:border-blue-500'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${verificationStatus[statusKey] ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
            {verificationStatus[statusKey] ? <FileCheck size={20} /> : <Upload size={20} />}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 leading-none">{title}</h4>
            <p className="text-xs text-gray-500 mt-2 truncate font-medium">{uploads[statusKey] ? uploads[statusKey].name : 'Required Node'}</p>
          </div>
        </div>
        {verificationStatus[statusKey] && <CheckCircle2 size={20} className="text-green-500 animate-in zoom-in" />}
      </div>
      <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => onFileSelect(statusKey, e.target.files[0])} accept="image/*,.pdf" />
      {isVerifying === statusKey ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-blue-600 uppercase">
             <span>Neural Extraction...</span>
             <span>{extractionProgress}%</span>
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${extractionProgress}%` }}></div></div>
        </div>
      ) : (
        <button onClick={() => fileInputRef.current.click()} disabled={!!isVerifying} className={`w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all ${verificationStatus[statusKey] ? 'bg-green-600 text-white cursor-default' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm active:scale-95'}`}>
          {verificationStatus[statusKey] ? 'Verified HUB' : 'Upload Audit'}
        </button>
      )}
    </div>
  );
};

// --- Summary Table HUB ---
const AuditSummaryTable = ({ formData, detectedData, loanType }) => {
  const nodes = loanType === 'standard' ? [
    { label: 'Full Name Profile', entered: formData.fullName, detected: detectedData.name },
    { label: 'Mobile Registry', entered: formData.phone, detected: detectedData.phone },
    { label: 'Aadhaar Registry ID', entered: formData.aadharId, detected: detectedData.aadharId },
    { label: 'Income Hub (Yield)', entered: formData.income, detected: detectedData.income }
  ] : [
    { label: 'Student Profile', entered: formData.studentName, detected: detectedData.studentName },
    { label: 'Guardian Registry', entered: formData.parentName, detected: detectedData.parentName },
    { label: 'Academic Course Node', entered: formData.courseName, detected: detectedData.courseName },
    { label: 'Institutional Fees Hub', entered: formData.totalFees, detected: detectedData.totalFees }
  ];

  const getStatus = (node) => {
    if (!node.detected) return { icon: <Clock size={16} />, text: 'Scanning Scrutiny...', color: 'text-gray-400' };
    const ent = normalizeText(node.entered);
    const det = normalizeText(node.detected);
    
    let match = (ent === det) || (normalizeAggressive(node.entered) === normalizeAggressive(node.detected));

    // Intelligence: Annual vs Monthly Parity Node
    if (!match && node.label === 'Income Hub (Yield)') {
        const entNum = parseFloat(node.entered.toString().replace(/,/g, '')) || 0;
        const detNum = parseFloat(node.detected.toString().replace(/,/g, '')) || 0;
        if (entNum > 0 && detNum > 0) {
            // If user entered annual but doc is monthly (±5% margin for tax/PF variations)
            if (Math.abs(entNum - (detNum * 12)) < (entNum * 0.05)) match = true;
        }
    }

    return match ? { icon: <CheckCircle2 size={16} />, text: '✅ Match', color: 'text-green-600' } : { icon: <XCircle size={16} />, text: '❌ Mismatch', color: 'text-red-600' };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-left font-sans border-collapse">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Document Node</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Registry Value</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Extracted HUB</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Audit STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {nodes.map((node, i) => {
            const status = getStatus(node);
            return (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5 text-sm font-bold text-gray-900">{node.label}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-500">{node.entered || '---'}</td>
                <td className="px-6 py-5 text-sm font-bold text-gray-900">{node.detected || '---'}</td>
                <td className={`px-6 py-5 text-xs font-bold flex items-center gap-2 ${status.color}`}>{status.icon} {status.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- ApplyLoan Component ---

const ApplyLoan = ({ user, onFinish }) => {
  const navigate = useNavigate();
  const [loanType, setLoanType] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ 
     fullName: '', phone: '', email: '', age: '', panId: '', aadharId: '', income: '', loanAmount: '', creditScore: '750', existingLoans: '0', employmentType: 'Salaried',
     studentName: '', studentEmail: '', parentName: '', collegeName: '', courseName: '', totalFees: '', coApplicantIncome: '', previousMarks: '' 
  });
  const [uploads, setUploads] = useState({});
  const [detectedData, setDetectedData] = useState({});
  const [verificationStatus, setVerificationStatus] = useState({});
  const [isVerifying, setIsVerifying] = useState(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [mismatches, setMismatches] = useState([]);
  const [apiResult, setApiResult] = useState(null);
  const [verificationTime, setVerificationTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isVerifying) timerRef.current = setInterval(() => setVerificationTime(p => p + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [isVerifying]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['phone', 'income', 'loanAmount', 'totalFees', 'age', 'aadharId'].includes(name)) {
      setFormData(p => ({ ...p, [name]: value.replace(/[^0-9]/g, '') }));
    } else setFormData(p => ({ ...p, [name]: value }));
  };

  const extractPDFText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(i => i.str).join(' ') + ' ';
      }
      return fullText.replace(/\s+/g, ' ').trim(); // Node Normalization
    } catch (e) {
      console.error("Institutional Scrutiny Gateway Fail:", e);
      return null;
    }
  };

  const handleFileSelect = async (key, file) => {
    if (!file) return;
    setUploads(p => ({ ...p, [key]: file }));
    await startNeuralExtraction(key, file);
  };

  const extractFieldsFromText = (rawText, key, currentDet) => {
    const det = { ...currentDet };
    if (!rawText) return det;
    
    // Advanced Extraction HUB
    if (loanType === 'standard') {
        if (key === 'aadhar') {
            let nameMatch = rawText.match(/Name[:\s\-]*([A-Za-z\s]{2,50})/i);
            if (nameMatch) det.name = nameMatch[1].trim().split('\n')[0];
            if (!det.name) {
                const candidateMatch = rawText.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/);
                if (candidateMatch) det.name = candidateMatch[1].trim();
            }
            const phoneMatch = rawText.match(/\b\d{10}\b/);
            if (phoneMatch) det.phone = phoneMatch[0];
            const aadhaarMatch = rawText.replace(/\s/g,'').match(/\b\d{12}\b/);
            if (aadhaarMatch) det.aadharId = aadhaarMatch[0];
        } else if (key === 'salarySlip') {
            // Enhanced Revenue Scraper: Labels + optional currency + robust numbering
            const salaryMatch = rawText.match(/(?:Net|Gross|Salary|Pay|Amount|Earnings|Take\s*Home|Income|Total)[:\s\-\u20b9\w]*\b(\d+[\d,]*)/i);
            if (salaryMatch) {
                const val = salaryMatch[1].replace(/,/g, '').trim();
                // If the user entered an annual figure but we found a monthly slip, 
                // the parity check later will handle the normalization check.
                det.income = val;
            }
        }
    } else {
        // High-Fidelity Education Scrutiny Hub
        if (key === 'studentAadhar') {
            const studentMatch = rawText.match(/(?:Student Name|Name)[:\s\-]?\s*([A-Za-z\s]{2,50})/i);
            if (studentMatch) det.studentName = studentMatch[1].trim().split('\n')[0];
        } else if (key === 'parentAadhar') {
            const guardianMatch = rawText.match(/(?:Guardian Name|Parent Name|Name)[:\s\-]?\s*([A-Za-z\s]{2,50})/i);
            if (guardianMatch) det.parentName = guardianMatch[1].split('\n')[0].replace(/\s+/g, '').trim(); 
        } else if (key === 'admissionLetter') {
            const courseMatch = rawText.match(/Course\s*Name[:\-]?\s*([\w\s\.]+?)(?:Total\s*Course\s*Fee|$)/i);
            if (courseMatch) det.courseName = courseMatch[1].trim();
            const feesMatch = rawText.match(/Total\s*Course\s*Fee[:\-]?\s*[^\d]*([\d,]+)/i);
            if (feesMatch) det.totalFees = feesMatch[1].replace(/,/g,'').trim();
        }
    }
    return det;
  };

  const startNeuralExtraction = async (key, file) => {
    setIsVerifying(key); setExtractionProgress(20);
    let rawText = '';

    try {
      if (file.type === 'application/pdf') {
        rawText = await extractPDFText(file);
      } else {
        const { data: { text } } = await Tesseract.recognize(file, 'eng', { logger: m => { if (m.status === 'recognizing') setExtractionProgress(Math.floor(m.progress * 100)); } });
        rawText = text;
      }
      setExtractionProgress(100);
      const det = extractFieldsFromText(rawText, key, detectedData);
      setDetectedData({ ...det }); setVerificationStatus(p => ({ ...p, [key]: true })); setIsVerifying(null);
      checkMismatches(det);
    } catch (err) { setIsVerifying(null); alert('Institutional Scrutiny Gateway Fail.'); }
  };

  const checkMismatches = (det) => {
    const list = [];
    if (loanType === 'standard') {
      if (det.name && (normalizeText(formData.fullName) !== normalizeText(det.name) && normalizeAggressive(formData.fullName) !== normalizeAggressive(det.name))) list.push('Name Registry Mismatch');
      if (det.phone && formData.phone !== det.phone) list.push('Phone Mismatch');
      if (det.aadharId && formData.aadharId !== det.aadharId) list.push('Aadhaar Mismatch');
      
      if (det.income) {
          const entNum = parseFloat(formData.income.toString().replace(/,/g, '')) || 0;
          const detNum = parseFloat(det.income.toString().replace(/,/g, '')) || 0;
          const directMatch = (entNum === detNum);
          const annualMatch = Math.abs(entNum - (detNum * 12)) < (entNum * 0.05);
          if (!directMatch && !annualMatch) list.push('Income Registry Mismatch');
      }
    } else {
      if (det.studentName && (normalizeText(formData.studentName) !== normalizeText(det.studentName) && normalizeAggressive(formData.studentName) !== normalizeAggressive(det.studentName))) list.push('Student Profile Mismatch');
      if (det.parentName && (normalizeText(formData.parentName) !== normalizeText(det.parentName) && normalizeAggressive(formData.parentName) !== normalizeAggressive(det.parentName))) list.push('Guardian Registry Mismatch');
      if (det.courseName && (normalizeText(formData.courseName) !== normalizeText(det.courseName) && normalizeAggressive(formData.courseName) !== normalizeAggressive(det.courseName))) list.push('Academic Course Mismatch');
      if (det.totalFees && formData.totalFees !== det.totalFees) list.push('Institutional Fees Mismatch');
    }
    setMismatches(list);
    return list.length === 0;
  };

  const validateDetails = () => {
    const errs = {};
    const req = loanType === 'standard' ? ['fullName', 'phone', 'email', 'panId', 'aadharId', 'income', 'loanAmount'] : ['studentName', 'parentName', 'collegeName', 'courseName', 'totalFees', 'loanAmount'];
    req.forEach(f => { if (!formData[f]) errs[f] = 'Required Registry Node'; });
    setErrors(errs); return Object.keys(errs).length === 0;
  };

  const getDocStatus = () => {
    const req = loanType === 'standard' ? ['aadhar', 'salarySlip'] : ['studentAadhar', 'studentPan', 'admissionLetter', 'parentAadhar', 'parentPan'];
    return req.every(k => verificationStatus[k]);
  };

  const handleSubmit = async () => {
    if (mismatches.length > 0 || !getDocStatus()) {
        alert("Invalid documents detected. Please verify and upload correct ones.");
        return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/predict-loan`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          userId: user?.id,
          ...formData, 
          loanPurpose: loanType === 'standard' ? 'Personal' : 'Education',
          loanAmount: formData.loanAmount,
          income: formData.income,
          creditScore: formData.creditScore,
          existingLoans: formData.existingLoans,
          employmentType: formData.employmentType,
          coApplicantIncome: formData.coApplicantIncome,
          previousMarks: formData.previousMarks,
          tenure: 60,
          panNumber: formData.panId,
          aadharNumber: formData.aadharId,
          is_preview: false 
        }) 
      });
      const result = await response.json();
      if (result.success) {
        setApiResult(result);
        setCurrentStep(5);
      } else {
        alert("Institutional Gateway Failure: " + (result.error || "Unknown error"));
      }
    } catch (e) { 
      console.error(e);
      alert("Institutional Gateway Failure."); 
    }
    setLoading(false);
  };

  if (currentStep === 1) return (
    <div className="max-w-4xl mx-auto py-12 px-6 font-sans">
      <header className="mb-10 text-center"><h1 className="text-3xl font-bold text-gray-900 leading-tight">Institutional Funding Path</h1><p className="text-gray-500 mt-2">Select your application node to initialize the secure audit.</p></header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[ { id: 'standard', title: 'Personal Loan Hub', icon: <Briefcase size={32} />, bg: 'bg-blue-50', text: 'text-blue-600', desc: 'Secure funding for salaried individuals with revenue audits.' }, { id: 'educational', title: 'Educational Loan Hub', icon: <GraduationCap size={32} />, bg: 'bg-orange-50', text: 'text-orange-600', desc: 'Academic capital hub with guardian audit nodes.' } ].map(opt => (
          <div key={opt.id} onClick={() => { setLoanType(opt.id); setCurrentStep(2); }} className="group relative bg-white rounded-2xl p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer h-[240px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">{opt.icon}</div>
            <div><div className={`w-14 h-14 ${opt.bg} ${opt.text} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>{opt.icon}</div><p className="text-xl font-bold text-gray-900 mb-2">{opt.title}</p><p className="text-sm text-gray-500 leading-relaxed">{opt.desc}</p></div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-[0.2em] group-hover:gap-6 transition-all">Initialize Path <ArrowRight size={18} /></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 font-sans tracking-tight">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="h-2 w-full bg-gray-50 flex"><div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(currentStep - 1) * 25}%` }} /></div>
        <div className="p-10 md:p-14">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div><h2 className="text-2xl font-bold text-gray-900 leading-none">{loanType === 'standard' ? 'Personal Loan Auth' : 'Education Loan Auth'}</h2><p className="text-sm text-gray-500 mt-3 font-medium">Audit Phase {currentStep}: {currentStep === 2 ? 'Registry Inputs' : currentStep === 3 ? 'Neural Audit' : currentStep === 4 ? 'Final Parity Summary' : 'AI Decision Insight'}</p></div>
            <div className="flex items-center gap-5 py-4 px-8 bg-slate-50 border border-gray-50 rounded-2xl shadow-inner"><div className="text-right"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Audit Time</p><p className="text-2xl font-bold text-blue-600">{verificationTime}s</p></div><Clock size={24} className="text-gray-300" /></div>
          </header>

          {currentStep === 2 && (
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 animate-in fade-in slide-in-from-right-4">
              {loanType === 'standard' ? (
                <>
                  <InputField label="Full Node Name" name="fullName" value={formData.fullName} onChange={handleChange} icon={User} placeholder="As per documents" error={errors.fullName} />
                  <InputField label="Mobile Registry" name="phone" value={formData.phone} onChange={handleChange} icon={ShieldCheck} placeholder="10 Digits" error={errors.phone} />
                  <InputField label="Email Relay" name="email" value={formData.email} onChange={handleChange} icon={Mail} error={errors.email} />
                  <InputField label="Current Age" name="age" value={formData.age} onChange={handleChange} icon={Calendar} error={errors.age} />
                  <InputField label="PAN Identifier" name="panId" value={formData.panId} onChange={handleChange} icon={Fingerprint} error={errors.panId} />
                  <InputField label="Aadhaar Hub ID" name="aadharId" value={formData.aadharId} onChange={handleChange} icon={Fingerprint} error={errors.aadharId} />
                  <InputField label="Annual Yield" name="income" value={formData.income} onChange={handleChange} icon={IndianRupee} error={errors.income} />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-0.5">Employment Model</label>
                    <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.2 text-[15px] font-normal text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm">
                      <option value="Salaried">Salaried Hub</option>
                      <option value="Self-Employed">Private Business</option>
                      <option value="Freelancer">Independent Node</option>
                    </select>
                  </div>
                  <InputField label="Credit Health Score" name="creditScore" value={formData.creditScore} onChange={handleChange} icon={Clock} placeholder="300-850" error={errors.creditScore} />
                  <InputField label="Existing EMI Aggregate" name="existingLoans" value={formData.existingLoans} onChange={handleChange} icon={AlertCircle} error={errors.existingLoans} />
                  <div className="md:col-span-2">
                    <InputField label="Principal Request" name="loanAmount" value={formData.loanAmount} onChange={handleChange} icon={IndianRupee} error={errors.loanAmount} />
                  </div>
                </>
              ) : (
                <>
                  <InputField label="Student Profile" name="studentName" value={formData.studentName} onChange={handleChange} icon={User} error={errors.studentName} />
                  <InputField label="Guardian Name" name="parentName" value={formData.parentName} onChange={handleChange} icon={User} error={errors.parentName} />
                  <InputField label="Academic Marks (%)" name="previousMarks" value={formData.previousMarks} onChange={handleChange} icon={CheckCircle2} error={errors.previousMarks} />
                  <InputField label="Institution Hub" name="collegeName" value={formData.collegeName} onChange={handleChange} icon={Building2} error={errors.collegeName} />
                  <InputField label="Course Node" name="courseName" value={formData.courseName} onChange={handleChange} icon={BookOpen} error={errors.courseName} />
                  <InputField label="Total Fees Volume" name="totalFees" value={formData.totalFees} onChange={handleChange} icon={Briefcase} error={errors.totalFees} />
                  <InputField label="Co-Applicant Yield" name="coApplicantIncome" value={formData.coApplicantIncome} onChange={handleChange} icon={IndianRupee} error={errors.coApplicantIncome} />
                  <InputField label="Loan Principal" name="loanAmount" value={formData.loanAmount} onChange={handleChange} icon={IndianRupee} error={errors.loanAmount} />
                </>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              {mismatches.length > 0 && <div className="bg-red-50 border border-red-100 p-8 rounded-2xl animate-in shake"><h5 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-2 uppercase tracking-widest"><AlertCircle size={18} /> Conflict Audit Failure</h5><p className="text-xs text-red-700 font-medium">Invalid documents detected. Please verify and upload correct ones.</p></div>}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loanType === 'standard' ? (
                  <><DocSlot title="Aadhar Node" statusKey="aadhar" verificationStatus={verificationStatus} onFileSelect={handleFileSelect} uploads={uploads} isVerifying={isVerifying} extractionProgress={extractionProgress} /><DocSlot title="Salary Hub" statusKey="salarySlip" verificationStatus={verificationStatus} onFileSelect={handleFileSelect} uploads={uploads} isVerifying={isVerifying} extractionProgress={extractionProgress} /></>
                ) : (
                  <><DocSlot title="Student Aadhar" statusKey="studentAadhar" verificationStatus={verificationStatus} onFileSelect={handleFileSelect} uploads={uploads} isVerifying={isVerifying} extractionProgress={extractionProgress} /><DocSlot title="Student PAN" statusKey="studentPan" verificationStatus={verificationStatus} onFileSelect={handleFileSelect} uploads={uploads} isVerifying={isVerifying} extractionProgress={extractionProgress} /><DocSlot title="Admission Letter" statusKey="admissionLetter" verificationStatus={verificationStatus} onFileSelect={handleFileSelect} uploads={uploads} isVerifying={isVerifying} extractionProgress={extractionProgress} /><DocSlot title="Parent Aadhar" statusKey="parentAadhar" verificationStatus={verificationStatus} onFileSelect={handleFileSelect} uploads={uploads} isVerifying={isVerifying} extractionProgress={extractionProgress} /><DocSlot title="Guardian PAN" statusKey="parentPan" verificationStatus={verificationStatus} onFileSelect={handleFileSelect} uploads={uploads} isVerifying={isVerifying} extractionProgress={extractionProgress} /></>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-10 animate-in fade-in">
              <div className="flex items-center gap-6 p-8 bg-green-50/50 rounded-2xl border border-green-100"><div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><CheckCircle2 size={32} /></div><div><h3 className="text-xl font-bold text-gray-900">Audit Synchronization Sync Hub</h3><p className="text-sm text-gray-500 font-medium">The institutional engine has cross-referenced your registry inputs against the extracted node data.</p></div></div>
              <AuditSummaryTable formData={formData} detectedData={detectedData} loanType={loanType} />
              {mismatches.length > 0 && <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 font-bold uppercase tracking-widest text-xs animate-pulse"><AlertCircle size={20} /> Mismatch Detected: Invalid documents detected. Please verify and upload correct ones.</div>}
            </div>
          )}

          {currentStep === 5 && apiResult && (
            <div className="space-y-10 animate-in zoom-in duration-500">
              <div className={`p-8 rounded-2xl border flex items-center gap-6 ${apiResult.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-800' : apiResult.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${apiResult.status === 'APPROVED' ? 'bg-green-100 text-green-600' : apiResult.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {apiResult.status === 'APPROVED' ? <CheckCircle2 size={32} /> : apiResult.status === 'REJECTED' ? <XCircle size={32} /> : <Clock size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight">System Decision: {apiResult.status}</h3>
                  <p className="text-sm font-medium opacity-80">Ref: {apiResult.id || 'HDFC-AUTH-SYNC'} • Risk Profile: {apiResult.risk_level}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">AI Creditworthiness Score</p>
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * apiResult.ai_score / 100)} className={apiResult.ai_score >= 70 ? 'text-green-500' : apiResult.ai_score >= 50 ? 'text-blue-500' : 'text-red-500'} strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-4xl font-black text-gray-900">{apiResult.ai_score}%</span>
                    </div>
                  </div>
                </div>

                  <div className="bg-slate-50 border border-gray-100 rounded-2xl p-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 text-center">Neuro-Evaluation Marks Hub</p>
                    <div className="space-y-4">
                       {apiResult.risk_breakdown?.filter(i => i.factor !== 'General Risk').map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:border-blue-100 transition-all">
                           <div className="flex flex-col flex-1 pl-2">
                             <span className="text-xs font-black text-gray-900 tracking-tight uppercase leading-none">{item.factor}</span>
                             <span className="text-[10px] text-gray-400 font-medium mt-1.5 leading-relaxed">{item.reason}</span>
                           </div>
                           <div className="text-right flex flex-col items-end gap-2 pr-2">
                              <div className="flex items-center gap-2">
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100">Norm: {item.normalized_score}</span>
                                 <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-100">W: {item.weight}</span>
                              </div>
                              <span className="text-sm font-black tabular-nums text-emerald-600">
                                {item.marks || item.score} Marks
                              </span>
                           </div>
                         </div>
                       ))}
                       <div className="flex justify-between items-center pt-8 border-t-2 border-dashed border-gray-200 mt-6 px-4">
                         <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Institutional Audit Hub Index</span>
                         <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                               {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase tracking-tighter">AI</div>)}
                            </div>
                            <span className="text-2xl font-black text-blue-600 tracking-tighter tabular-nums">{apiResult.ai_score}/100</span>
                         </div>
                       </div>
                    </div>
                  </div>
              </div>

              <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-lg"><ShieldCheck /> Guardian AI Insights</h4>
                <p className="text-sm text-blue-50 leading-relaxed font-medium">{apiResult.recommendation || 'The risk engine suggests a standard verification path with priority handling.'}</p>
              </div>
            </div>
          )}

          <footer className="mt-16 flex justify-between border-t border-gray-100 pt-12">
            {currentStep < 5 ? (
              <>
                <button onClick={() => currentStep === 2 ? setLoanType(null) || setCurrentStep(1) : setCurrentStep(prev => Math.max(prev - 1, 1))} className="flex items-center gap-3 text-xs font-bold text-gray-400 hover:text-gray-900 transition-all uppercase tracking-[0.2em]"><ChevronLeft size={20} /> Back Hub</button>
                <button onClick={() => currentStep < 4 ? (currentStep === 2 ? (validateDetails() && setCurrentStep(3)) : (getDocStatus() && setCurrentStep(4))) : handleSubmit()} disabled={loading || (currentStep === 3 && !getDocStatus()) || (currentStep === 4 && mismatches.length > 0)} className={`flex items-center gap-4 px-14 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${loading || (currentStep === 3 && !getDocStatus()) || (currentStep === 4 && mismatches.length > 0) ? 'bg-gray-100 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10 active:scale-95'}`}>{loading ? 'Syncing...' : currentStep === 4 ? 'Authorize Path' : 'Advance Hub'} <ArrowRight size={20} /></button>
              </>
            ) : (
              <button 
                onClick={() => onFinish ? onFinish() : navigate('/dashboard')} 
                className="w-full flex items-center justify-center gap-4 py-5 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-95"
              >
                Go to Portfolio Dashboard <CheckCircle2 size={20} />
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ApplyLoan;
