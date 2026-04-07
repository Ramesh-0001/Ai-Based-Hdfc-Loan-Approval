import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, FileText, ShieldCheck, Clock, XCircle, CheckCircle2,
  CloudUpload, Eye, AlertCircle, RefreshCw, Zap, User, IndianRupee,
  ChevronRight, Loader2, Shield, Info, AlertTriangle, Trash2
} from 'lucide-react';
import { API_BASE_URL } from '../src/config/api';

// --- STATUS CONFIG ---
const STATUS_CONFIG = {
  'Not Submitted': {
    color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200',
    dot: 'bg-gray-400', icon: FileText, label: 'Not Submitted'
  },
  'AI Processing': {
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    dot: 'bg-blue-500 animate-pulse', icon: Zap, label: 'AI Processing'
  },
  'Verified': {
    color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200',
    dot: 'bg-green-600', icon: CheckCircle2, label: 'AI Verified'
  },
  'Rejected': {
    color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200',
    dot: 'bg-red-500', icon: XCircle, label: 'Rejected'
  }
};

const PIPELINE_STEPS = ['Upload', 'AI Analysis', 'Verified'];

const getPipelineStep = (status) => {
  if (status === 'Not Submitted') return 0;
  if (status === 'AI Processing') return 1;
  if (status === 'Verified') return 3;
  if (status === 'Rejected') return -1;
  return 0;
};


// --- MAIN COMPONENT ---

// --- MAIN COMPONENT ---
const DocumentsModule = ({ user, applications = [] }) => {
  const latestApp = applications.length > 0 ? applications[0] : null;
  const userDisplayName = latestApp?.full_name || latestApp?.fullName || user?.name || 'Ramesh Kannan';
  const userPhone = latestApp?.mobile || latestApp?.phone || '9876543210';
  const userIncome = latestApp?.income;
  const userCollege = latestApp?.collegeName;
  const userCourse = latestApp?.courseName;
  
  // Co-applicant info for parent documents
  const coApplicantName = latestApp?.coApplicantName;
  const coApplicantRelationship = latestApp?.coApplicantRelationship;
  const coApplicantIncome = latestApp?.coApplicantIncome;
  
  const createEmptyDoc = () => ({ file: null, name: '', status: 'Not Submitted', aiResult: null, uploadedAt: null, rejectionReason: '', fileUrl: null });
  const [loanType, setLoanType] = useState('Personal Loan'); // 'Personal Loan' | 'Education Loan'
  const [docs, setDocs] = useState({
    id_proof: createEmptyDoc(),
    income_proof: createEmptyDoc(),
    admission_letter: createEmptyDoc(),
    student_id: createEmptyDoc(),
    parent_income_proof: createEmptyDoc(),
    parent_bank_statement: createEmptyDoc(),
    pan_card: createEmptyDoc(),
    bank_statement: createEmptyDoc()
  });
  const [overallStatus, setOverallStatus] = useState('Not Submitted');
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [toast, setToast] = useState(null);
  const idRef = useRef();
  const incomeRef = useRef();
  const admissionRef = useRef();
  const studentIdRef = useRef();
  const parentIncomeRef = useRef();
  const parentBankRef = useRef();
  const panCardRef = useRef();
  const bankStatementRef = useRef();

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch verification status from backend
  const fetchVerificationStatus = async () => {
    if (!user?.id) {
      setFetchingStatus(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/status?user_id=${user.id}`);
      const data = await res.json();
      console.log("[Status] Backend response:", data);

      if (!data.documents || data.documents.length === 0) {
        setFetchingStatus(false);
        return;
      }

      setDocs(prev => {
        const updated = { ...prev };
        
        data.documents.forEach(r => {
          const docType = r.doc_type;
          if (!docType || !updated[docType]) return;

          const priority = {
            'Not Submitted': 0,
            'AI Processing': 1,
            'Rejected': 2,
            'Verified': 3
          };

          const currentStatus = prev[docType]?.status || 'Not Submitted';
          let newStatus = r.status;

          // NEVER downgrade status
          if (priority[currentStatus] > priority[newStatus]) {
            newStatus = currentStatus;
          }

          updated[docType] = {
            ...prev[docType],
            name: r.doc_name || prev[docType]?.name,
            status: newStatus,
            fileUrl: r.file_url || prev[docType]?.fileUrl,
            uploadedAt: r.uploaded_at || prev[docType]?.uploadedAt,
            rejectionReason: r.rejection_reason || prev[docType]?.rejectionReason,
            aiResult: (r.ai_confidence !== undefined && r.ai_confidence !== null && r.ai_confidence > 0)
              ? {
                  passed: Boolean(r.ai_passed),
                  confidence: r.ai_confidence,
                  summary: r.ai_summary || '',
                  extracted_data: r.extracted_data || {}
                }
              : prev[docType]?.aiResult
          };
        });

        computeOverallStatus(updated);
        return updated;
      });
    } catch (e) {
      console.error('Failed to fetch document status', e);
    } finally {
      setFetchingStatus(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchVerificationStatus, 2000);
    const interval = setInterval(fetchVerificationStatus, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user?.id]);

  const computeOverallStatus = (d, type = loanType) => {
    let requiredKeys = ['id_proof', 'income_proof', 'pan_card', 'bank_statement'];
    if (type === 'Education Loan') {
        requiredKeys = ['admission_letter', 'parent_income_proof', 'parent_bank_statement', 'pan_card'];
    }
    const statuses = requiredKeys.map(k => d[k].status);
    
    if (statuses.every(s => s === 'Verified')) setOverallStatus('Verified');
    else if (statuses.some(s => s === 'Rejected')) setOverallStatus('Rejected');
    else if (statuses.some(s => s === 'AI Processing')) setOverallStatus('AI Processing');
    else setOverallStatus('Not Submitted');
  };

  useEffect(() => {
    computeOverallStatus(docs, loanType);
  }, [loanType]);


  const handleUpload = async (docType, file) => {
    console.log("Uploading docType:", docType);
    if (!user?.id) { showToast('Please log in to upload documents.', 'error'); return; }
    if (!file) return;

    setLoading(true);
    setDocs(prev => {
      const updated = {
        ...prev,
        [docType]: {
          ...prev[docType],
          file,
          name: file.name,
          status: 'AI Processing',
          aiResult: null,
          rejectionReason: ''
        }
      };
      computeOverallStatus(updated);
      return updated;
    });

    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("doc_type", docType);
      formData.append("doc_name", file.name);
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      console.log("[Upload] Response from server:", data);

      if (!res.ok) {
        throw new Error(data.error || 'Server returned an error');
      }

      // Backend now returns status and ai_result with extraction
      const nextStatus = data.status;
      const aiResult = {
        passed: data.ai_result.passed,
        confidence: data.ai_result.confidence,
        summary: data.ai_result.summary,
        extracted_data: data.ai_result.extracted_data
      };

      setDocs(prev => {
        const updated = {
          ...prev,
          [docType]: {
            ...prev[docType],
            file,
            name: file.name,
            status: nextStatus,
            aiResult: aiResult,
            uploadedAt: new Date().toISOString(),
            rejectionReason: '',
            fileUrl: data.file_url
          }
        };

        computeOverallStatus(updated);
        return updated;
      });

      if (aiResult.passed) {
        showToast(`AI verification passed (${aiResult.confidence}% confidence). Document verified.`, 'success');
      } else {
        showToast(`AI detected issues (${aiResult.confidence}% confidence). Please re-upload a valid document.`, 'error');
      }
    } catch (err) {
      console.error('[Upload] Error caught in catch block:', err);
      
      let errorMsg = err.message;
      if (err.message.includes('Failed to fetch')) {
        errorMsg = "Network error: Target server unreachable or CORS policy blocked the request. Ensure the backend is running on port 5001.";
      }
      
      showToast(errorMsg, 'error');
      setDocs(prev => {
        const errDocs = {
          ...prev,
          [docType]: { ...prev[docType], status: 'Not Submitted' }
        };
        computeOverallStatus(errDocs);
        return errDocs;
      });
      showToast('Upload failed. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (docType) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/documents/remove?user_id=${user.id}&doc_type=${docType}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setDocs(prev => {
          const updated = { ...prev, [docType]: createEmptyDoc() };
          computeOverallStatus(updated);
          return updated;
        });
        showToast('Document removed successfully.', 'success');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove document');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReupload = (docType) => {
    if (docType === 'id_proof') idRef.current?.click();
    else if (docType === 'income_proof') incomeRef.current?.click();
    else if (docType === 'admission_letter') admissionRef.current?.click();
    else if (docType === 'student_id') studentIdRef.current?.click();
    else if (docType === 'parent_income_proof') parentIncomeRef.current?.click();
    else if (docType === 'parent_bank_statement') parentBankRef.current?.click();
    else if (docType === 'pan_card') panCardRef.current?.click();
    else if (docType === 'bank_statement') bankStatementRef.current?.click();
  };

  const overallCfg = STATUS_CONFIG[overallStatus] || STATUS_CONFIG['Not Submitted'];
  const pipelineStep = getPipelineStep(overallStatus);
  const isVerified = overallStatus === 'Verified';

  if (fetchingStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 size={32} className="text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-400">Loading verification status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full px-5 py-4 rounded-xl border shadow-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'success' ? 'bg-white border-green-200 text-green-700' :
          toast.type === 'error' ? 'bg-white border-red-200 text-red-700' : 'bg-white border-blue-200 text-blue-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> :
           toast.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> :
           <Info size={18} className="shrink-0 mt-0.5" />}
          <p className="text-sm font-medium">{toast.msg}</p>
        </div>
      )}

      {/* Header */}
      <header className="pb-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Document Verification</h1>
            <p className="text-sm text-gray-400 mt-1">Upload your documents for institutional verification (Optional)</p>
          </div>
          <div className="flex items-center gap-3">
            <select
               value={loanType}
               onChange={(e) => setLoanType(e.target.value)}
               className="text-sm font-semibold bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
               <option value="Personal Loan">Standard Loan</option>
               <option value="Education Loan">Education Loan</option>
            </select>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${overallCfg.bg} ${overallCfg.border} ${overallCfg.color}`}>
            <span className={`w-2 h-2 rounded-full ${overallCfg.dot}`} />
            {overallStatus}
          </div>
          </div>
        </div>
      </header>

      {/* Verified Banner */}
      {isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-500">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Documents verified!</p>
            <p className="text-xs text-green-600 mt-0.5">Your profile is now strengthened with verified documentation.</p>
          </div>
        </div>
      )}

      {/* Progress Pipeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Verification Pipeline</p>
        <div className="flex items-center gap-0">
          {PIPELINE_STEPS.map((step, idx) => {
            const completed = overallStatus === 'Rejected' ? false : pipelineStep > idx;
            const current = pipelineStep === idx + 1 && overallStatus !== 'Rejected';
            const rejected = overallStatus === 'Rejected' && idx <= 1;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
                    rejected ? 'bg-red-50 border-red-200 text-red-500' :
                    completed ? 'bg-blue-600 border-blue-600 text-white' :
                    current ? 'bg-white border-blue-600 text-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' :
                    'bg-white border-gray-200 text-gray-300'
                  }`}>
                    {rejected ? <XCircle size={16} /> :
                     completed ? <CheckCircle2 size={16} /> :
                     current ? <Loader2 size={16} className="animate-spin" /> :
                     <span className="text-[11px] font-bold">{idx + 1}</span>}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight ${
                    rejected ? 'text-red-500' : completed || current ? 'text-gray-800' : 'text-gray-300'
                  }`}>{step}</span>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 -mt-5 transition-all duration-700 ${
                    rejected ? 'bg-red-200' : pipelineStep > idx + 1 ? 'bg-blue-600' : 'bg-gray-100'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {overallStatus === 'Rejected' && (
          <p className="text-xs text-red-500 font-medium mt-3 text-center">
            One or more documents were rejected. Please re-upload corrected documents.
          </p>
        )}
      </div>

      {/* Hidden file inputs */}
      <input ref={idRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files[0] && handleUpload('id_proof', e.target.files[0])} />
      <input ref={incomeRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files[0] && handleUpload('income_proof', e.target.files[0])} />
      <input ref={admissionRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files[0] && handleUpload('admission_letter', e.target.files[0])} />
      <input ref={studentIdRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files[0] && handleUpload('student_id', e.target.files[0])} />
      <input ref={parentIncomeRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files[0] && handleUpload('parent_income_proof', e.target.files[0])} />
      <input ref={parentBankRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files[0] && handleUpload('parent_bank_statement', e.target.files[0])} />
      <input ref={panCardRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files[0] && handleUpload('pan_card', e.target.files[0])} />
      <input ref={bankStatementRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files[0] && handleUpload('bank_statement', e.target.files[0])} />

      {/* Document Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <DocumentCard
          docType="id_proof"
          title={loanType === 'Education Loan' ? 'Student / ID Proof' : 'Identity Proof'}
          subtitle="Aadhaar Card or PAN Card"
          icon={User}
          doc={docs.id_proof}
          onUpload={() => idRef.current?.click()}
          onReupload={() => handleReupload('id_proof')}
          onRemove={() => handleRemove('id_proof')}
          isLoading={loading && docs.id_proof.status === 'AI Processing'}
        />
        <DocumentCard
          docType="pan_card"
          title="PAN Card"
          subtitle="Permanent Account Number (Mandatory for financial verification)"
          icon={User}
          doc={docs.pan_card}
          onUpload={() => panCardRef.current?.click()}
          onReupload={() => handleReupload('pan_card')}
          onRemove={() => handleRemove('pan_card')}
          isLoading={loading && docs.pan_card.status === 'AI Processing'}
        />
        <DocumentCard
          docType="bank_statement"
          title="Bank Statement"
          subtitle="Last 6 months transaction history"
          icon={FileText}
          doc={docs.bank_statement}
          onUpload={() => bankStatementRef.current?.click()}
          onReupload={() => handleReupload('bank_statement')}
          onRemove={() => handleRemove('bank_statement')}
          isLoading={loading && docs.bank_statement.status === 'AI Processing'}
        />
        {loanType !== 'Education Loan' && (
            <DocumentCard
              docType="income_proof"
              title="Income Proof"
              subtitle="Salary slip or Bank statement (3 months)"
              icon={IndianRupee}
              doc={docs.income_proof}
              onUpload={() => incomeRef.current?.click()}
              onReupload={() => handleReupload('income_proof')}
              onRemove={() => handleRemove('income_proof')}
              isLoading={loading && docs.income_proof.status === 'AI Processing'}
            />
        )}
        {loanType === 'Education Loan' && (
            <>
                <DocumentCard
                  docType="admission_letter"
                  title="Admission Letter"
                  subtitle="Official University Acceptance Letter"
                  icon={FileText}
                  doc={docs.admission_letter}
                  onUpload={() => admissionRef.current?.click()}
                  onReupload={() => handleReupload('admission_letter')}
                  onRemove={() => handleRemove('admission_letter')}
                  isLoading={loading && docs.admission_letter.status === 'AI Processing'}
                />
                <DocumentCard
                  docType="parent_income_proof"
                  title="Parent Income Proof"
                  subtitle="Parent/Guardian Salary slip or ITR"
                  icon={IndianRupee}
                  doc={docs.parent_income_proof}
                  onUpload={() => parentIncomeRef.current?.click()}
                  onReupload={() => handleReupload('parent_income_proof')}
                  onRemove={() => handleRemove('parent_income_proof')}
                  isLoading={loading && docs.parent_income_proof.status === 'AI Processing'}
                />
                <DocumentCard
                  docType="parent_bank_statement"
                  title="Parent Bank Statement"
                  subtitle="Last 6 months officially stamped"
                  icon={FileText}
                  doc={docs.parent_bank_statement}
                  onUpload={() => parentBankRef.current?.click()}
                  onReupload={() => handleReupload('parent_bank_statement')}
                  onRemove={() => handleRemove('parent_bank_statement')}
                  isLoading={loading && docs.parent_bank_statement.status === 'AI Processing'}
                />
                <DocumentCard
                  docType="student_id"
                  title="Student ID (Optional)"
                  subtitle="University ID or library card"
                  icon={ShieldCheck}
                  doc={docs.student_id}
                  onUpload={() => studentIdRef.current?.click()}
                  onReupload={() => handleReupload('student_id')}
                  onRemove={() => handleRemove('student_id')}
                  isLoading={loading && docs.student_id.status === 'AI Processing'}
                />
            </>
        )}
      </div>



      {/* Security Note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
          Your documents are encrypted with AES-256 and stored in HDFC's high-security compliance vault. Data is processed only for KYC verification and never shared with third parties.
        </p>
      </div>
    </div>
  );
};

// --- DOCUMENT CARD ---
const DocumentCard = ({ docType, title, subtitle, icon: Icon, doc, onUpload, onReupload, onRemove, isLoading }) => {
  const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG['Not Submitted'];
  const StatusIcon = cfg.icon;
  const isRejected = doc.status === 'Rejected';
  const isVerified = doc.status === 'Verified';
  const isProcessing = doc.status === 'AI Processing';
  const isNotSubmitted = doc.status === 'Not Submitted';

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ${
      isVerified ? 'border-green-200' : isRejected ? 'border-red-200' : 'border-gray-200'
    }`}>
      {/* Card Header */}
      <div className={`p-5 border-b ${isVerified ? 'border-green-100 bg-green-50' : isRejected ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-slate-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isVerified ? 'bg-green-100 text-green-600' : isRejected ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-600'
            }`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-[11px] text-gray-400">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                <StatusIcon size={11} />
                {cfg.label}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Not Submitted */}
        {isNotSubmitted && (
          <button
            onClick={onUpload}
            disabled={isLoading}
            className="w-full group border-2 border-dashed border-gray-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 rounded-xl p-6 transition-all duration-200 flex flex-col items-center gap-3 disabled:opacity-50"
          >
            <CloudUpload size={28} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-600">Click to upload</p>
              <p className="text-[11px] text-gray-400 mt-0.5">PDF, JPG, PNG up to 5MB</p>
            </div>
          </button>
        )}

        {/* AI Processing */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center space-y-3">
            <Loader2 size={28} className="text-blue-600 animate-spin mx-auto" />
            <div>
              <p className="text-sm font-semibold text-blue-800">AI verification in progress...</p>
              <p className="text-[11px] text-blue-500 mt-1">Analyzing document authenticity and fraud signals</p>
            </div>
            <div className="w-full h-1 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-[grow_2.2s_ease-in-out_infinite]" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Verified */}
        {isVerified && (
          <div className="space-y-3">
            {doc.aiResult && <AIResultCard aiResult={doc.aiResult} compact />}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
              <ShieldCheck size={16} className="text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-800">Document strictly AI Verified</p>
                <p className="text-[10px] text-green-600 mt-0.5">This document has successfully passed neural validation</p>
              </div>
            </div>
          </div>
        )}

        {/* Rejected */}
        {isRejected && (
          <div className="space-y-3">
            {doc.aiResult && <AIResultCard aiResult={doc.aiResult} />}
            {doc.rejectionReason && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1">Rejection Reason</p>
                <p className="text-xs text-red-700 font-medium">{doc.rejectionReason}</p>
              </div>
            )}
            <button
              onClick={onReupload}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Re-upload Document
            </button>
          </div>
        )}

        {/* File info footer */}
        {doc.name && !isNotSubmitted && !isProcessing && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <FileText size={14} className="text-gray-300 shrink-0" />
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
               <span className="text-[11px] text-gray-400 truncate">{doc.name}</span>
                {doc.fileUrl && (
                   <div className="flex items-center gap-2 shrink-0">
                      <a href={`${API_BASE_URL}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline bg-blue-50 px-2.5 py-1 rounded-full shadow-sm border border-blue-100">
                        View Document
                      </a>
                      <button 
                        onClick={onRemove}
                        className="text-[10px] text-red-500 font-bold hover:underline bg-red-50 px-2.5 py-1 rounded-full shadow-sm border border-red-100 flex items-center gap-1"
                      >
                        <Trash2 size={10} />
                        Remove
                      </button>
                   </div>
                )}
            </div>
            {doc.uploadedAt && (
              <span className="text-[10px] text-gray-300 whitespace-nowrap">
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- AI RESULT CARD ---
const AIResultCard = ({ aiResult, compact = false }) => {
  if (!aiResult) return null;

  const isHigh = aiResult.confidence >= 80;
  const isMedium = aiResult.confidence >= 50 && aiResult.confidence < 80;

  return (
    <div className={`rounded-xl border p-4 ${aiResult.passed ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={14} className={aiResult.passed ? 'text-blue-600' : 'text-red-500'} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">AI Analysis Result</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
          aiResult.passed ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
        }`}>
          {aiResult.passed ? '✓ PASSED' : '✗ FLAGGED'} · {aiResult.confidence}%
        </span>
      </div>
      {/* AI Confidence Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-[120px]">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${
              isHigh ? 'bg-green-500' : isMedium ? 'bg-orange-400' : 'bg-red-500'
            }`} style={{ width: `${aiResult.confidence}%` }} />
          </div>
        </div>
        <span className={`text-[10px] font-bold ${isHigh ? 'text-green-700' : isMedium ? 'text-orange-600' : 'text-red-600'}`}>
          {aiResult.confidence}% Confidence
        </span>
      </div>
      


      {/* Checklist */}
      {!compact && (
        <>
          {aiResult.checks && (
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {Object.values(aiResult.checks).map((check, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {check.result
                    ? <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                    : <XCircle size={11} className="text-red-400 shrink-0" />}
                  <span className="text-[10px] text-gray-600">{check.label}</span>
                </div>
              ))}
            </div>
          )}
          <p className={`text-[10px] leading-relaxed ${aiResult.passed ? 'text-blue-700' : 'text-red-700'}`}>
            {aiResult.summary}
          </p>
        </>
      )}
    </div>
  );
};



export default DocumentsModule;
