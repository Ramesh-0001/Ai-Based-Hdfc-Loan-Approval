import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  CloudUpload,
  MoreVertical,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

const DocumentsModule = () => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'AadharCard_Front.pdf', type: 'ID Proof', status: 'Verified', date: '2026-03-10' },
    { id: 2, name: 'SalarySlip_Feb2026.pdf', type: 'Income Proof', status: 'Pending', date: '2026-03-15' },
    { id: 3, name: 'PanCard_Scan.jpg', type: 'ID Proof', status: 'Verified', date: '2026-03-08' },
  ]);

  const [uploading, setUploading] = useState(null);

  const handleUpload = (type) => {
    setUploading(type);
    setTimeout(() => {
      const newDoc = {
        id: Date.now(),
        name: `${type.replace(' ', '')}_Document.pdf`,
        type: type,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };
      setDocuments(prev => [newDoc, ...prev]);
      setUploading(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans max-w-6xl mx-auto">
      <header className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Documents Vault</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track your institutional documentation</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Upload Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
            <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <CloudUpload size={18} className="text-blue-600" />
              Upload Documents
            </h3>
            
            <div className="space-y-4">
              <UploadCard 
                title="ID Proof" 
                subtitle="Aadhar, PAN, or Passport" 
                onUpload={() => handleUpload('ID Proof')}
                isLoading={uploading === 'ID Proof'}
              />
              <UploadCard 
                title="Income Proof" 
                subtitle="Last 3 months salary slips" 
                onUpload={() => handleUpload('Income Proof')}
                isLoading={uploading === 'Income Proof'}
              />
              <UploadCard 
                title="Address Proof" 
                subtitle="Utility bill or Rent agreement" 
                onUpload={() => handleUpload('Address Proof')}
                isLoading={uploading === 'Address Proof'}
              />
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex gap-3">
                <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                  Documents are encrypted and stored in HDFC's high-security compliance vault.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Recent Submissions
              </h3>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Total: {documents.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Document Name</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-900 line-clamp-1">{doc.name}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{doc.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[12px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Preview">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download">
                            <Download size={16} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {documents.length === 0 && (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">No documents found</p>
                  <p className="text-gray-400 text-xs mt-1">Upload your identity and income proofs to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadCard = ({ title, subtitle, onUpload, isLoading }) => (
  <button 
    onClick={onUpload}
    disabled={isLoading}
    className="w-full group text-left p-4 bg-slate-50 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:border-blue-200 border border-transparent rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-[13px] font-semibold text-gray-900">{title}</h4>
        <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        isLoading ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-blue-600 group-hover:bg-blue-600 group-hover:'
      }`}>
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-200 border-t-white rounded-full animate-spin"></div>
        ) : (
          <Upload size={14} />
        )}
      </div>
    </div>
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Verified: 'bg-green-50 text-green-700 border-green-100',
    Pending: 'bg-orange-50 text-orange-700 border-orange-100',
    Rejected: 'bg-red-50 text-red-700 border-red-100'
  };

  const icons = {
    Verified: <CheckCircle2 size={12} />,
    Pending: <Clock size={12} />,
    Rejected: <XCircle size={12} />
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

export default DocumentsModule;
