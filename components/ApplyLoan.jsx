
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { geminiService } from '../services/geminiService';

import { API_BASE_URL } from '../src/config/api';

const ApplyLoan = ({ user, onSubmit }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [successId, setSuccessId] = useState(null);
    const [apiResult, setApiResult] = useState(null);

    // 1. Initial State: No hardcoded defaults (all empty/null)
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        mobile: '',
        age: '',
        income: '',
        creditScore: '',
        employmentType: '',
        yearsInCurrentJob: '',
        loanAmount: '',
        loanTenure: '',
        loanPurpose: '',
        existingEMI: '0',
        numberOfActiveLoans: '0',
        numberOfDependents: '',
        residentialStatus: '',
        cityTier: '',
        educationLevel: '',
        maritalStatus: '',
        bankAccountVintageMonths: '',
        pan: '',
        // Education Loan Specific Fields
        studentMarks: '',
        courseType: '',
        collegeTier: '',
        courseDuration: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [documents, setDocuments] = useState({ aadhaar: null, pan: null });
    const [scanningDocs, setScanningDocs] = useState({ aadhaar: false, pan: false });

    // 2. Real-time Validation & AI Preview Logic
    const aiPreview = useMemo(() => {
        const errors = {};
        const warnings = [];
        let riskScore = 50; // Base score

        const income = parseFloat(formData.income) || 0;
        const loanAmt = parseFloat(formData.loanAmount) || 0;
        const score = parseInt(formData.creditScore) || 0;
        const emi = parseFloat(formData.existingEMI) || 0;

        // Validations
        if (formData.income !== '' && income <= 0) errors.income = "Annual income must be greater than 0";
        if (formData.age !== '' && (formData.age < 18 || formData.age > 75)) errors.age = "Age must be between 18 and 75";
        if (formData.creditScore !== '' && (score < 300 || score > 900)) errors.creditScore = "Score must be between 300 and 900";
        if (formData.loanAmount !== '' && loanAmt < 10000) errors.loanAmount = "Minimum loan amount is ₹10,000";

        // Fraud Check / Mismatched Data
        // Rule Check: 15x Monthly Income (User Requirement)
        const monthlyInc = income / 12;
        if (monthlyInc > 0 && loanAmt > monthlyInc * 15) {
            warnings.push("High Leverage: Amount exceeds 15x your monthly income guideline.");
            riskScore -= 25;
        }

        const monthlyIncome = income / 12;
        const potentialEmi = (loanAmt * 0.12) / 12; // Crude approximation 12% interest
        if (income > 0 && (emi + potentialEmi) > monthlyIncome * 0.6) {
            warnings.push("High DBR: Your total monthly debt obligations exceed 60% of income.");
            riskScore -= 20;
        }

        // Risk Scoring
        if (score > 750) riskScore += 25;
        else if (score < 600) riskScore -= 20;

        if (income > 1200000) riskScore += 15;

        let riskCategory = "MEDIUM";
        if (riskScore > 75) riskCategory = "LOW";
        if (riskScore < 40) riskCategory = "HIGH";

        return { errors, warnings, riskScore, riskCategory };
    }, [formData]);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setScanningDocs(prev => ({ ...prev, [name]: true }));
            setTimeout(() => {
                setDocuments(prev => ({ ...prev, [name]: files[0].name }));
                setScanningDocs(prev => ({ ...prev, [name]: false }));
            }, 1200);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final Validation
        if (Object.keys(aiPreview.errors).length > 0) {
            setFormErrors(aiPreview.errors);
            return;
        }

        setLoading(true);
        try {
            const appId = `APP${Date.now().toString().slice(-8)}`;
            const response = await fetch(`${API_BASE_URL}/api/predict-loan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: appId,
                    userId: user?.id,
                    fullName: formData.fullName,
                    ...formData
                })
            });
            console.log("Loan request sent to backend:", { id: appId, ...formData });
            const prediction = await response.json();

            // Guard: if server returned an error object instead of a prediction
            if (prediction.error || !prediction.status) {
                console.error('AI Engine Error:', prediction.error || prediction);
                alert(`AI Engine returned an error: ${prediction.error || 'No status received. Check backend logs.'}`);
                return;
            }

            // Format for onSubmit (App.jsx notifications + state)
            const finalApp = {
                ...prediction,
                id: appId,
                fullName: formData.fullName,
                // Keep formData fields but ensure loanAmount is numeric
                ...formData,
                loanAmount: parseFloat(formData.loanAmount) || 0,
                status: prediction.status,   // Ensure prediction.status always wins
                createdAt: new Date().toISOString()
            };

            setApiResult(prediction);
            setSuccessId(appId);
            if (onSubmit) onSubmit(finalApp);
        } catch (err) {
            console.error(err);
            alert("Connection error. Ensure HDFC AI Server is running on port 5001.");
        } finally {
            setLoading(false);
        }
    };


    const sectionClass = "bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4 mb-6 transition-all hover:shadow-md";
    const labelClass = "block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1";
    const inputClass = "w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#003d82] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-bold text-gray-800 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600";

    if (apiResult) {
        // Normalise status – backend may return MANUAL_REVIEW which is not APPROVED/REJECTED
        const rawStatus = apiResult.status || 'PENDING';
        const displayStatus =
            rawStatus === 'MANUAL_REVIEW' ? 'SENT FOR REVIEW' :
                rawStatus === 'REVIEW_REQUIRED' ? 'SENT FOR REVIEW' : rawStatus;

        const headerColor =
            rawStatus === 'APPROVED' ? 'bg-green-500' :
                rawStatus === 'REJECTED' ? 'bg-red-500' : 'bg-blue-600';

        return (
            <div className="max-w-3xl mx-auto py-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white dark:border-slate-800">
                    <div className={`p-10 text-center ${headerColor} text-white`}>
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/50">
                            {rawStatus === 'APPROVED' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                            ) : rawStatus === 'REJECTED' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            )}
                        </div>
                        <h2 className="text-4xl font-black mb-1">LOAN {displayStatus}</h2>
                        <p className="text-white/80 font-bold uppercase tracking-widest text-xs">Application ID: {successId}</p>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-black text-gray-400 text-xs uppercase tracking-widest">AI Risk Decision</h3>
                                <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl border dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-gray-500">Risk Level</span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${apiResult.risk_level === 'Low' ? 'bg-green-100 text-green-700' : apiResult.risk_level === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {apiResult.risk_level}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-500">AI Score</span>
                                        <span className="text-2xl font-black text-[#003d82] dark:text-blue-400">{apiResult.risk_score}/100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-black text-gray-400 text-xs uppercase tracking-widest">Fraud Audit</h3>
                                <div className={`p-6 rounded-3xl border ${apiResult.fraud_detection?.is_fraud ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30 text-green-700'}`}>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${apiResult.fraud_detection?.is_fraud ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
                                        <span className="font-black uppercase text-[10px] tracking-widest">{apiResult.fraud_detection?.status || 'Secure'}</span>
                                    </div>
                                    <p className="text-xs italic font-medium">"{apiResult.fraud_detection?.explanation || 'No suspicious deviations found in profile.'}"</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t dark:border-slate-800">
                            <h3 className="font-black text-gray-800 dark:text-white text-sm mb-4">AI Reasoning & Next Steps</h3>
                            <ul className="space-y-3">
                                {apiResult.education_evaluation ? (
                                    <>
                                        <li className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                                            <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase">Placement Prob.</span>
                                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{apiResult.education_evaluation.placementProbability}</span>
                                        </li>
                                        <li className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                                            <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase">Expected Salary</span>
                                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{apiResult.education_evaluation.expectedSalary}</span>
                                        </li>
                                        <li className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                                            <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase">Moratorium</span>
                                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{apiResult.education_evaluation.moratoriumPeriod}</span>
                                        </li>
                                        <li className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                                            <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase">Collateral Req.</span>
                                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{apiResult.education_evaluation.collateralRequired}</span>
                                        </li>
                                    </>
                                ) : (
                                    apiResult.reasoning?.map((reason, i) => (
                                        <li key={i} className="flex items-start space-x-3 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                                            <span>{reason}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-5 bg-[#003d82] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
                    >
                        RETURN TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-[#003d82] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">L</div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">Apply for AI-Loan</h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">HDFC Intelligent Risk Management</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2">
                    {/* SECTION: IDENTITY */}
                    <div className={sectionClass}>
                        <h3 className="font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest text-[11px] mb-4">I. Applicant Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Full Legal Name</label>
                                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="As per Aadhaar/PAN" className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Mobile Number</label>
                                <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10 Digits" className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>PAN Number</label>
                                <input name="pan" value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase().slice(0, 10) })} placeholder="ABCDE1234F" className={inputClass + " font-mono"} required />
                            </div>
                            <div>
                                <label className={labelClass}>Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Min 18" className={inputClass} required />
                                {aiPreview.errors.age && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">{aiPreview.errors.age}</p>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION: FINANCIALS */}
                    <div className={sectionClass}>
                        <h3 className="font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest text-[11px] mb-4">II. Financial Standing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Annual Income (₹)</label>
                                <input
                                    type="number"
                                    name="income"
                                    value={formData.income}
                                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                                    placeholder="Annual Income"
                                    className={inputClass}
                                    required
                                />
                                {aiPreview.errors.income && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">{aiPreview.errors.income}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Credit Score (CIBIL)</label>
                                <input
                                    type="number"
                                    name="creditScore"
                                    value={formData.creditScore}
                                    onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                                    placeholder="Credit Score"
                                    className={inputClass}
                                    required
                                />
                                {aiPreview.errors.creditScore && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">{aiPreview.errors.creditScore}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Employment Type</label>
                                <select name="employmentType" value={formData.employmentType} onChange={handleChange} className={inputClass} required>
                                    <option value="">Select Type</option>
                                    <option value="Salaried">Salaried</option>
                                    <option value="Self-Employed">Self-Employed</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Monthly Existing EMIs (₹)</label>
                                <input type="number" name="existingEMI" value={formData.existingEMI} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: LOAN REQUEST */}
                    <div className={sectionClass}>
                        <h3 className="font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest text-[11px] mb-4">III. Loan Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Requested Amount (₹)</label>
                                <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} placeholder="e.g. 500000" className={inputClass} required />
                                {aiPreview.errors.loanAmount && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">{aiPreview.errors.loanAmount}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Tenure (Months)</label>
                                <select name="loanTenure" value={formData.loanTenure} onChange={handleChange} className={inputClass} required>
                                    <option value="">Select Tenure</option>
                                    <option value="12">12 Months (1 yr)</option>
                                    <option value="24">24 Months (2 yrs)</option>
                                    <option value="36">36 Months (3 yrs)</option>
                                    <option value="60">60 Months (5 yrs)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Loan Purpose</label>
                                <select name="loanPurpose" value={formData.loanPurpose} onChange={handleChange} className={inputClass} required>
                                    <option value="">Select Purpose</option>
                                    <option value="Personal">Personal Loan</option>
                                    <option value="Education">Education Loan</option>
                                    <option value="Home">Home Loan</option>
                                    <option value="Vehicle">Vehicle Loan</option>
                                    <option value="Medical">Medical Emergency</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: EDUCATION DETAILS (Conditional) */}
                    {formData.loanPurpose === 'Education' && (
                        <div className={sectionClass}>
                            <h3 className="font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest text-[11px] mb-4">IV. Academic & Course Profile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Student Academic Score (%)</label>
                                    <input type="number" name="studentMarks" value={formData.studentMarks} onChange={handleChange} placeholder="e.g. 85" className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Course Type</label>
                                    <select name="courseType" value={formData.courseType} onChange={handleChange} className={inputClass} required>
                                        <option value="">Select Course</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Medical">Medical</option>
                                        <option value="MBA">MBA</option>
                                        <option value="Arts">Arts</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>College Tier</label>
                                    <select name="collegeTier" value={formData.collegeTier} onChange={handleChange} className={inputClass} required>
                                        <option value="">Select Tier</option>
                                        <option value="Tier 1">Tier 1 (IIT/IIM/Top Univ)</option>
                                        <option value="Tier 2">Tier 2 (Reputed State Colg)</option>
                                        <option value="Tier 3">Tier 3 (Other)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Course Duration (Years)</label>
                                    <input type="number" name="courseDuration" value={formData.courseDuration} onChange={handleChange} placeholder="e.g. 4" className={inputClass} required />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={sectionClass}>
                        <h3 className="font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest text-[11px] mb-4">{formData.loanPurpose === 'Education' ? 'V.' : 'IV.'} Demographic Metadata</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Residential</label>
                                <select name="residentialStatus" value={formData.residentialStatus} onChange={handleChange} className={inputClass} required>
                                    <option value="">Status</option>
                                    <option value="Own">Own House</option>
                                    <option value="Rented">Rented</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>City Tier</label>
                                <select name="cityTier" value={formData.cityTier} onChange={handleChange} className={inputClass} required>
                                    <option value="">Level</option>
                                    <option value="Metro">Metro</option>
                                    <option value="Tier 1">Tier 1</option>
                                    <option value="Tier 2">Tier 2</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Marital</label>
                                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputClass} required>
                                    <option value="">Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: DOCUMENT UPLOAD */}
                    <div className={sectionClass}>
                        <h3 className="font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest text-[11px] mb-4">{formData.loanPurpose === 'Education' ? 'VI.' : 'V.'} Document Verification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className={labelClass}>Aadhaar Card (Front/Back)</label>
                                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all ${documents.aadhaar ? 'border-green-500 bg-green-50/10' : 'border-gray-200 dark:border-slate-800'}`}>
                                    <div className="space-y-1 text-center">
                                        {scanningDocs.aadhaar ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="mt-2 text-[10px] font-black text-blue-600 uppercase">AI Scanning...</p>
                                            </div>
                                        ) : documents.aadhaar ? (
                                            <div className="flex flex-col items-center">
                                                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                <p className="text-[10px] font-bold text-green-700 uppercase mt-1">Verified: {documents.aadhaar}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                <div className="flex text-xs text-gray-400"><label className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-bold text-blue-600 hover:text-blue-500 outline-none"><span>Upload File</span><input name="aadhaar" type="file" className="sr-only" onChange={handleFileChange} /></label></div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <label className={labelClass}>PAN Card Details</label>
                                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all ${documents.pan ? 'border-green-500 bg-green-50/10' : 'border-gray-200 dark:border-slate-800'}`}>
                                    <div className="space-y-1 text-center">
                                        {scanningDocs.pan ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="mt-2 text-[10px] font-black text-blue-600 uppercase">AI OCR Check...</p>
                                            </div>
                                        ) : documents.pan ? (
                                            <div className="flex flex-col items-center">
                                                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                <p className="text-[10px] font-bold text-green-700 uppercase mt-1">OCR Success: {documents.pan}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                <div className="flex text-xs text-gray-400"><label className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-bold text-blue-600 hover:text-blue-500 outline-none"><span>Upload File</span><input name="pan" type="file" className="sr-only" onChange={handleFileChange} /></label></div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading || Object.keys(aiPreview.errors).length > 0}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all transform active:scale-95 ${loading ? 'bg-gray-400' : 'bg-[#e11b22] text-white hover:bg-red-700 hover:shadow-red-500/30'}`}
                        >
                            {loading ? 'AI RISK PROFILING IN PROGRESS...' : 'Initiate AI Approval Cycle'}
                        </button>
                    </div>
                </form>
            </div>

            {/* SIDEBAR: REAL-TIME ANALYTICS */}
            <div className="lg:col-span-1 space-y-6">
                <div className="sticky top-24 p-8 bg-gray-50 dark:bg-slate-900 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-xl space-y-8">
                    <div>
                        <h4 className="font-black text-gray-400 uppercase tracking-[0.3em] text-[9px] mb-6">Real-time Risk Preview</h4>
                        <div className="relative h-40 w-40 mx-auto">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-gray-800" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * aiPreview.riskScore) / 100} className={`transition-all duration-1000 ${aiPreview.riskCategory === 'LOW' ? 'text-green-500' : aiPreview.riskCategory === 'HIGH' ? 'text-red-500' : 'text-blue-500'}`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-black ${aiPreview.riskCategory === 'LOW' ? 'text-green-500' : aiPreview.riskCategory === 'HIGH' ? 'text-red-500' : 'text-blue-500'}`}>{aiPreview.riskScore}</span>
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Confidence</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Risk Index</span>
                            <span className={`text-xs font-black uppercase ${aiPreview.riskCategory === 'LOW' ? 'text-green-500' : aiPreview.riskCategory === 'HIGH' ? 'text-red-500' : 'text-blue-500'}`}>{aiPreview.riskCategory}</span>
                        </div>

                        {aiPreview.warnings.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Fraud Flags / Deviations</p>
                                {aiPreview.warnings.map((w, i) => (
                                    <div key={i} className="flex space-x-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/20 rounded-xl">
                                        <svg className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                        <p className="text-[10px] text-red-700 dark:text-red-400 font-bold leading-tight">{w}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {aiPreview.warnings.length === 0 && formData.income && (
                            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/20 rounded-xl">
                                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <p className="text-[10px] text-green-700 dark:text-green-400 font-bold">No suspicious patterns detected in real-time profiling.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t dark:border-slate-800">
                        <p className="text-[9px] text-gray-400 font-bold italic text-center">
                            Note: This preview is generated by the Edge node. Final authority lies with the centralized HDFC AI Core.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyLoan;
