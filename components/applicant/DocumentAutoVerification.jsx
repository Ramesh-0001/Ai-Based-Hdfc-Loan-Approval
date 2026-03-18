import React, { useState } from 'react';
import { Upload, FileCheck, CheckCircle2, Clock, AlertCircle, FileText, Plus } from 'lucide-react';

const DocumentAutoVerification = () => {
    const [files, setFiles] = useState([]);
    const [verifications, setVerifications] = useState([]);

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Visual feedback
        setFiles(prev => [...prev, { type, name: file.name, status: 'Uploading...' }]);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', type);

        try {
            const response = await fetch('http://localhost:8000/api/documents/verify', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            setVerifications(prev => [...prev, data]);
            setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: data.status } : f));
        } catch (error) {
            setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'Sync error' } : f));
        }
    };

    const docTypes = ["PAN", "Aadhaar", "Salary Slip", "Bank Statement"];

    return (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 font-sans">
            <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <FileCheck size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Auto-verification portal</h3>
                    <p className="text-sm text-gray-400 font-normal mt-1">Real-time institutional document processing</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest pl-1">Required documents</p>
                    <div className="grid gap-4">
                        {docTypes.map(type => (
                            <div key={type} className="bg-slate-50 p-5 rounded-xl border border-dashed border-gray-200 hover:border-blue-600 hover:bg-white transition-all group relative cursor-pointer">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white border border-gray-200 p-2.5 rounded-xl text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-transform group-hover:scale-110">
                                            <FileText size={18} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{type} card</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileUpload(e, type)}
                                    />
                                    <div className="bg-white px-4 py-1.5 rounded-xl border border-gray-200 text-[11px] font-medium text-gray-500 group-hover:text-blue-600 group-hover:border-blue-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex items-center space-x-2">
                                        <Plus size={12} />
                                        <span>Upload</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest pl-1">Verification status</p>
                    <div className="bg-slate-50 rounded-xl p-6 min-h-[300px] border border-gray-200 flex flex-col">
                        {files.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-gray-200">
                                    <FileText size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-400 font-normal">Pending document upload</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {files.map((f, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center animate-in slide-in-from-right-4 duration-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <FileText size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-gray-900">{f.type}</span>
                                                <span className="text-[10px] text-gray-400 truncate max-w-[120px] font-normal mt-0.5">{f.name}</span>
                                            </div>
                                        </div>
                                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-medium border ${
                                            f.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-100' : 
                                            f.status === 'Uploading...' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {f.status === 'Verified' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                            <span>{f.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="mt-6 pt-8 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-400 font-normal">
                <div className="flex items-center space-x-2">
                    <AlertCircle size={14} className="text-blue-600" />
                    <span>Upload original scans for 100% processing speed</span>
                </div>
                <span className="font-medium text-gray-300 uppercase tracking-widest">Enterprise v4.8</span>
            </div>
        </div>
    );
};

export default DocumentAutoVerification;
