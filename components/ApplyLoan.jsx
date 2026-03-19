import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  IndianRupee, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Lock,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Activity,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { API_BASE_URL } from '../src/config/api';

const ApplyLoan = ({ user, onSubmit, onFinish }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: '',
    age: '',
    income: '', 
    employmentType: '',
    creditScore: '',
    repaymentHistory: '',
    existingLoans: '0',
    jobTenure: '',
    loanAmount: '',
    loanPurpose: '',
    tenure: '36',
    hasExistingLoan: 'No',
    coApplicantIncome: '0',
    // Education Specific Fields
    courseName: '',
    collegeName: '',
    courseDuration: '',
    yearOfStudy: '',
    previousMarks: '',
    entranceExamScore: '',
    coApplicantName: '',
    coApplicantRelationship: '',
    coApplicantEmploymentType: '',
    coApplicantExistingDebt: '0',
    agreedToTerms: false,
  });

  const steps = [
    { id: 1, title: 'Identity', icon: User },
    { id: 2, title: 'Financials', icon: Briefcase },
    { id: 3, title: 'Loan details', icon: IndianRupee },
    { id: 4, title: 'Review', icon: FileText },
  ];

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.email) newErrors.email = 'Email address is required';
      if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
      if (!formData.age) newErrors.age = 'Age is required';
    } else if (step === 2) {
      if (!formData.income) newErrors.income = 'Annual income is required';
      if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
      if (!formData.creditScore) newErrors.creditScore = 'Credit score is required';
      if (!formData.repaymentHistory) newErrors.repaymentHistory = 'Repayment history is required';
      if (!formData.jobTenure) newErrors.jobTenure = 'Years of experience is required';
    } else if (step === 3) {
      if (!formData.loanAmount) newErrors.loanAmount = 'Loan amount is required';
      if (!formData.loanPurpose) newErrors.loanPurpose = 'Loan purpose is required';
      if (!formData.tenure) newErrors.tenure = 'Tenure is required';

      if (formData.loanPurpose === 'Education') {
        if (!formData.courseName) newErrors.courseName = 'Course name is required';
        if (!formData.collegeName) newErrors.collegeName = 'College name is required';
        if (!formData.previousMarks) newErrors.previousMarks = 'Previous marks are required';
        if (!formData.coApplicantName) newErrors.coApplicantName = 'Parent/Guardian name is required';
        if (!formData.coApplicantIncome) newErrors.coApplicantIncome = 'Co-applicant income is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const calculateAge = (dob) => {
    return formData.age; // Using explicit age input now
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      const appId = `HDFC-LOAN-${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
      const age = calculateAge(formData.dob);
      
      const payload = {
        ...formData,
        id: appId,
        userId: user?.id,
        applicant_id: user?.id,
        age: age,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/api/predict-loan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.error) throw new Error(result.error);
      
      if (onSubmit) {
        onSubmit({ ...payload, ...result });
      }
      
      setSubmissionResult(result);
      setSuccessId(appId);
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ global: err.message || 'Failed to submit application. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (successId && submissionResult) {
    return (
      <div className="max-w-2xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-700 font-sans">
        <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-50 to-white px-6 py-6 border-b border-gray-200 text-center">
             <div className="w-16 h-16 bg-blue-100/50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} className="text-blue-600" />
             </div>
             <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">AI Risk Analysis</h2>
             <p className="text-sm text-gray-500 mt-2">Application ID: <span className="font-medium text-blue-600">{successId}</span></p>
          </div>

          {/* Loan Decision */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h4 className="text-[15px] font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500"/>
              Loan Decision
            </h4>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <div className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide ${
                submissionResult.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                submissionResult.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {submissionResult.status === 'PENDING' ? 'Manual Review' : submissionResult.status.charAt(0) + submissionResult.status.slice(1).toLowerCase()}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">AI Risk Score</span>
              <h3 className="text-2xl font-semibold text-gray-900">
                {submissionResult.risk_score} <span className="text-lg text-gray-400 font-normal">/ 100</span>
              </h3>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-6 bg-slate-50 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Assessment</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                submissionResult.risk_level === 'Low' ? 'bg-green-100 text-green-700' :
                submissionResult.risk_level === 'Medium' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {submissionResult.risk_level} Risk
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full ${
                  submissionResult.risk_score >= 70 ? 'bg-green-500' :
                  submissionResult.risk_score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${submissionResult.risk_score}%` }}
              ></div>
            </div>
          </div>

          {/* Score Breakdown Panel */}
          <div className="px-6 py-6">
            <h4 className="text-[15px] font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Activity size={18} className="text-blue-500"/>
              Risk Score Breakdown
            </h4>
            
            <div className="space-y-3 mb-6">
              {(() => {
                const rawBreakdown = submissionResult.score_breakdown || submissionResult.scoreBreakdown;
                let breakdown = [];
                if (rawBreakdown) {
                  try {
                    breakdown = typeof rawBreakdown === 'string' ? JSON.parse(rawBreakdown) : rawBreakdown;
                  } catch (e) {
                    console.error("Failed to parse breakdown in success screen:", e);
                  }
                }
                if (!Array.isArray(breakdown)) return null;

                return breakdown.map((item, index) => {
                  const isPositive = item.score >= 0;
                  return (
                    <div key={index} className="flex justify-between items-center group py-2 border-b border-gray-200 last:border-0 hover:bg-slate-50 px-3 -mx-3 rounded-lg transition-colors">
                      <div>
                         <p className="text-sm font-medium text-gray-700">{item.factor}</p>
                         <p className="text-[11px] text-gray-400 mt-0.5">{item.reason}</p>
                      </div>
                      <span className={`font-semibold text-sm px-3 py-1.5 rounded-md ${
                         isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {isPositive ? '+' : ''}{item.score}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 pt-5 mt-2 flex justify-between items-center">
              <span className="text-base font-semibold text-gray-700">Final Score</span>
              <span className="text-2xl font-semibold text-gray-900">
                {submissionResult.risk_score} <span className="text-lg text-gray-400 font-normal">/ 100</span>
              </span>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-gray-200">
            <button 
              onClick={() => {
                if(onFinish) {
                  onFinish();
                } else if (!onSubmit) {
                  navigate('/dashboard');
                } else {
                  window.location.reload();
                }
              }}
              className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] text-sm active:scale-95"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user || user.isGuest) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 animate-in fade-in duration-700">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign in Required</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            To maintain institutional security and track your application progress, please sign in to your HDFC account before applying for a loan.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <span>Sign in to Continue</span>
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-slate-50 text-gray-600 font-semibold py-3.5 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-6 space-y-6 animate-in fade-in duration-700 font-sans">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
            <ShieldCheck size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Secure application portal</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Loan application</h1>
        <p className="text-sm text-gray-500 mt-2 font-normal">Provide your details to initiate the institutional risk audit</p>
      </header>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between max-w-3xl mx-auto mb-6 relative px-4">
        <div className="absolute top-[20px] left-0 w-full h-[2px] bg-gray-100 -z-0" />
        <div 
          className="absolute top-[20px] left-0 h-[2px] bg-blue-600 transition-all duration-700 ease-in-out -z-0" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]
                ${currentStep > step.id ? 'bg-blue-600 border-blue-600 text-white' : 
                  currentStep === step.id ? 'border-blue-600 text-blue-600 bg-white ring-4 ring-blue-50' : 
                  'border-gray-200 text-gray-300 bg-white'}`}>
              {currentStep > step.id ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
            </div>
            <span className={`mt-4 text-xs font-medium transition-colors ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden flex flex-col min-h-[500px]">
        {errors.global && (
          <div className="bg-red-50 border-b border-red-100 p-6 flex items-center space-x-4 text-red-600">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{errors.global}</p>
          </div>
        )}

        <div className="p-6 md:p-6 flex-1 flex flex-col">
          <form className="flex-1 flex flex-col" onSubmit={e => e.preventDefault()}>
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-500 flex-1">
                 <div className="flex items-center space-x-3 mb-6">
                     <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600 border border-gray-200 text-xs font-semibold">1</div>
                     <h3 className="text-xl font-medium text-gray-900">Personal identity</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Full name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="As per documents" error={errors.fullName} icon={User} />
                  <InputGroup label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" error={errors.email} icon={Zap} />
                  <InputGroup label="Mobile number" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="+91 XXXXX XXXXX" error={errors.mobile} icon={CheckCircle2} />
                  <InputGroup label="Age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="e.g. 30" error={errors.age} icon={User} />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-500 flex-1">
                <div className="flex items-center space-x-3 mb-6">
                     <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600 border border-gray-200 text-xs font-semibold">2</div>
                     <h3 className="text-xl font-medium text-gray-900">Financial assessment</h3>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Annual gross income" name="income" type="number" value={formData.income} onChange={handleChange} placeholder="Before deductions" error={errors.income} icon={TrendingUp} />
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 ml-1">Employment type</label>
                    <div className="relative group">
                        <select 
                            name="employmentType" 
                            value={formData.employmentType} 
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-transparent rounded-xl px-6 py-4 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-100 transition-all appearance-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                        >
                            <option value="">Select employment</option>
                            <option value="Salaried">Institutional salaried</option>
                            <option value="Self-Employed">Private business</option>
                            <option value="Student">Student node</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    {errors.employmentType && <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center"><AlertCircle size={10} className="mr-1" /> {errors.employmentType}</p>}
                  </div>
                  <InputGroup label="Credit score" name="creditScore" type="number" value={formData.creditScore} onChange={handleChange} placeholder="CIBIL (300-900)" error={errors.creditScore} icon={Award} />
                  <InputGroup label="Current monthly debt" name="existingLoans" type="number" value={formData.existingLoans} onChange={handleChange} placeholder="EMI total" icon={Briefcase} />
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 ml-1">Repayment history</label>
                    <div className="relative group">
                        <select 
                            name="repaymentHistory" 
                            value={formData.repaymentHistory} 
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-transparent rounded-xl px-6 py-4 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-100 transition-all appearance-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                        >
                            <option value="">Select history</option>
                            <option value="No defaults">No past defaults</option>
                            <option value="Past defaults">Past defaults</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    {errors.repaymentHistory && <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center"><AlertCircle size={10} className="mr-1" /> {errors.repaymentHistory}</p>}
                  </div>
                  <InputGroup 
                    label="Years in current job" 
                    name="jobTenure" 
                    type="number" 
                    value={formData.jobTenure} 
                    onChange={handleChange} 
                    placeholder="e.g. 5" 
                    error={errors.jobTenure} 
                    icon={Activity} 
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 ml-1">Do you have any existing loans?</label>
                    <div className="relative group">
                        <select 
                            name="hasExistingLoan" 
                            value={formData.hasExistingLoan} 
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-transparent rounded-xl px-6 py-4 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-100 transition-all appearance-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                        >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-500 flex-1">
                <div className="flex items-center space-x-3 mb-6">
                     <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600 border border-gray-200 text-xs font-semibold">3</div>
                     <h3 className="text-xl font-medium text-gray-900">Loan requirements</h3>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Requested loan amount" name="loanAmount" type="number" value={formData.loanAmount} onChange={handleChange} placeholder="Principal volume" error={errors.loanAmount} icon={IndianRupee} />
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 ml-1">Purpose of loan</label>
                    <div className="relative group">
                        <select 
                            name="loanPurpose" 
                            value={formData.loanPurpose} 
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-transparent rounded-xl px-6 py-4 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-100 transition-all appearance-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                        >
                            <option value="">Select purpose</option>
                            <option value="Home">Real estate node</option>
                            <option value="Personal">Personal capital</option>
                            <option value="Education">Education hub</option>
                            <option value="Medical">Medical reserve</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    {errors.loanPurpose && <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center"><AlertCircle size={10} className="mr-1" /> {errors.loanPurpose}</p>}
                  </div>
                  {formData.loanPurpose === 'Education' && (
                    <>
                      {/* Student & Academic Details */}
                      <div className="md:col-span-2 pt-6 border-t border-gray-200 mt-2">
                        <h4 className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-4">Academic & Student Profile</h4>
                      </div>
                      <InputGroup label="Course Name" name="courseName" value={formData.courseName} onChange={handleChange} placeholder="e.g. B.Tech Computer Science" error={errors.courseName} icon={Award} />
                      <InputGroup label="College / University Name" name="collegeName" value={formData.collegeName} onChange={handleChange} placeholder="Target Institution" error={errors.collegeName} icon={ShieldCheck} />
                      <InputGroup label="Course Duration (Years)" name="courseDuration" type="number" value={formData.courseDuration} onChange={handleChange} placeholder="e.g. 4" icon={Clock} />
                      <InputGroup label="Current Year of Study" name="yearOfStudy" type="number" value={formData.yearOfStudy} onChange={handleChange} placeholder="e.g. 1" icon={Zap} />
                      <InputGroup label="Previous Marks (%)" name="previousMarks" type="number" value={formData.previousMarks} onChange={handleChange} placeholder="Qualifying %" error={errors.previousMarks} icon={TrendingUp} />
                      <InputGroup label="Entrance Exam Score" name="entranceExamScore" type="number" value={formData.entranceExamScore} onChange={handleChange} placeholder="Optional" icon={Activity} />

                      {/* Co-applicant Details */}
                      <div className="md:col-span-2 pt-6 border-t border-gray-200 mt-2">
                        <h4 className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-4">Parent / Guardian (Co-applicant)</h4>
                      </div>
                      <InputGroup label="Parent / Guardian Name" name="coApplicantName" value={formData.coApplicantName} onChange={handleChange} placeholder="Full Name" error={errors.coApplicantName} icon={User} />
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 ml-1">Relationship</label>
                        <div className="relative group">
                            <select 
                                name="coApplicantRelationship" 
                                value={formData.coApplicantRelationship} 
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-transparent rounded-xl px-6 py-4 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-100 transition-all appearance-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                            >
                                <option value="">Select relationship</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Guardian">Legal Guardian</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                      </div>
                      <InputGroup label="Co-applicant Monthly Income" name="coApplicantIncome" type="number" value={formData.coApplicantIncome} onChange={handleChange} placeholder="Monthly Salary" error={errors.coApplicantIncome} icon={Briefcase} />
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 ml-1">Co-applicant Employment</label>
                        <div className="relative group">
                            <select 
                                name="coApplicantEmploymentType" 
                                value={formData.coApplicantEmploymentType} 
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-transparent rounded-xl px-6 py-4 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-100 transition-all appearance-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                            >
                                <option value="Salaried">Institutional Salaried</option>
                                <option value="Self-Employed">Private Business</option>
                                <option value="Professional">Licensed Professional</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                      </div>
                      <InputGroup label="Existing Debt (Co-applicant)" name="coApplicantExistingDebt" type="number" value={formData.coApplicantExistingDebt} onChange={handleChange} placeholder="Monthly EMIs" icon={Activity} />
                    </>
                  )}
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 ml-1">Loan tenure (months)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[12, 24, 36, 60].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tenure: m.toString() }))}
                          className={`py-4 px-6 text-sm font-medium rounded-xl border transition-all ${
                            formData.tenure === m.toString() ? 'bg-blue-600 border-blue-600 text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600'
                          }`}
                        >
                          {m} months
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-500 flex-1">
                <div className="flex items-center space-x-3 mb-6">
                     <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600 border border-gray-200 text-xs font-semibold">4</div>
                     <h3 className="text-xl font-medium text-gray-900">Application review</h3>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-gray-200">
                  <ReviewItem label="Applicant name" value={formData.fullName} />
                  <ReviewItem label="Loan purpose" value={formData.loanPurpose} />
                  <ReviewItem label="Requested capital" value={`₹${Number(formData.loanAmount).toLocaleString()}`} />
                  <ReviewItem label="Loan tenure" value={`${formData.tenure} months`} />
                  
                  {formData.loanPurpose === 'Education' && (
                    <>
                      <div className="md:col-span-2 border-t border-gray-200 mt-2 pt-4">
                        <ReviewItem label="Course & College" value={`${formData.courseName} at ${formData.collegeName}`} />
                      </div>
                      <ReviewItem label="Academic Profile" value={`Marks: ${formData.previousMarks}% | Duration: ${formData.courseDuration} yrs`} />
                      <ReviewItem label="Co-applicant (Parent/Guardian)" value={formData.coApplicantName} />
                      <ReviewItem label="Co-applicant Income" value={`₹${Number(formData.coApplicantIncome).toLocaleString()}`} />
                    </>
                  )}
                  
                  {formData.loanPurpose !== 'Education' && (
                    <ReviewItem label="Annual income" value={`₹${Number(formData.income).toLocaleString()}`} />
                  )}
                </div>
                <label className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer group hover:bg-blue-50 transition-colors">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-blue-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-normal group-hover:text-gray-700 transition-colors">
                    I confirm that the information provided is accurate and grant permission to HDFC Bank to process my data for the purpose of this loan application using their automated risk audit system.
                  </p>
                </label>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/dashboard') : handleBack}
                className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors flex items-center group"
              >
                {currentStep > 1 && <ChevronLeft size={16} className="mr-2" />}
                {currentStep === 1 ? 'Discard application' : 'Previous step'}
              </button>
              
              <button
                type="button"
                onClick={currentStep === 4 ? handleSubmit : handleNext}
                disabled={loading || (currentStep === 4 && !formData.agreedToTerms)}
                className="min-w-[180px] bg-blue-600 text-white font-medium py-3.5 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-white rounded-full animate-spin mr-3"></div>
                      <span>Submitting...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    {currentStep === 4 ? 'Submit application' : 'Next step'}
                    {currentStep < 4 && <ChevronRight size={16} className="ml-2" />}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <footer className="text-center pt-8">
          <p className="text-[11px] text-gray-300 font-medium flex items-center justify-center">
              <Lock size={12} className="mr-2" />
              Standard institutional encryption active
          </p>
      </footer>
    </div>
  );
};

const InputGroup = ({ label, name, type = "text", value, onChange, placeholder, error, icon: Icon }) => (
  <div className="space-y-2 text-left">
    <label className="text-xs font-medium text-gray-500 ml-1">{label}</label>
    <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
            {Icon && <Icon size={18} />}
        </div>
        <input 
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full bg-slate-50 border border-transparent rounded-xl pl-12 pr-6 py-4 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-100 transition-all placeholder:text-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] ${error ? 'border-red-200 bg-red-50' : ''}`}
        />
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center"><AlertCircle size={10} className="mr-1" /> {error}</p>}
  </div>
);

const ReviewItem = ({ label, value }) => (
  <div className="pb-4 last:border-0 last:pb-0">
    <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
    <p className="text-base font-medium text-gray-900">{value}</p>
  </div>
);

export default ApplyLoan;
