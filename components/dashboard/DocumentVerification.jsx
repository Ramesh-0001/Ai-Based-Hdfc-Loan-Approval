import React from 'react';
import { FileCheck, FileText, CheckCircle2, Clock, Upload, ArrowRight } from 'lucide-react';

const DocumentVerification = ({ documents = [] }) => {
  const displayDocs = documents.length > 0 ? documents : [
    { id: 1, name: "Identity proof (Aadhaar/PAN)", status: "VERIFIED", date: "12 Mar 2026", type: "Identification" },
    { id: 2, name: "Address proof (Utility bill)", status: "VERIFIED", date: "12 Mar 2026", type: "Address" },
    { id: 3, name: "Income proof (6M statement)", status: "PENDING", date: "Pending review", type: "Financials" },
    { id: 4, name: "Employment verification", status: "PROCESSING", date: "In progress", type: "Employment" }
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] animate-in fade-in duration-700 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-50">
            <FileCheck size={20} />
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900">Document vault</h3>
            <p className="text-xs text-gray-400 mt-1 font-normal">Manage and verify your credentials</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-6 py-2 bg-slate-50 text-gray-600 hover:text-blue-600 hover:bg-white hover:border-blue-100 border border-transparent rounded-xl transition-all text-xs font-medium">
          <Upload size={14} />
          <span>Upload new</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayDocs.map((doc) => (
          <div key={doc.id} className="p-6 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-between hover:bg-white hover:border-gray-200 transition-all group">
            <div className="flex items-center space-x-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all
                ${doc.status === 'VERIFIED' ? 'bg-green-50 text-green-600' : 
                  doc.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : 
                  'bg-blue-50 text-blue-600'}`}>
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[10px] text-blue-600/70 py-0.5 font-medium px-2 bg-blue-50 rounded-md">{doc.type}</span>
                    <p className="text-[11px] text-gray-400 font-normal">{doc.date}</p>
                </div>
              </div>
            </div>
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-medium border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]
              ${doc.status === 'VERIFIED' ? 'bg-green-50 border-green-100 text-green-600' : 
                doc.status === 'PENDING' ? 'bg-orange-50 border-orange-100 text-orange-600' : 
                'bg-blue-50 border-blue-100 text-blue-600'}`}>
              {doc.status === 'VERIFIED' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
              <span>{doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center">
        <button className="text-xs font-medium text-gray-400 hover:text-blue-600 flex items-center space-x-2 transition-colors">
          <span>Manage all vault documents</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default DocumentVerification;
