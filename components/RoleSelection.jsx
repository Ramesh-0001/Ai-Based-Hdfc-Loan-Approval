
import React from 'react';
import { useNavigate } from 'react-router-dom';


const RoleSelection = ({ isDark, user }) => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'applicant',
            title: 'Loan Applicant',
            desc: 'Apply for home, personal, or business loans with AI-driven instant risk profiling.',
            icon: (
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            theme: 'blue',
            path: '/login/applicant'
        },
        {
            id: 'officer',
            title: 'Bank Officer',
            desc: 'Review loan applications, manage fraud alerts, and process manual overrides.',
            icon: (
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            theme: 'green',
            path: '/login/officer'
        },
        {
            id: 'admin',
            title: 'System Admin',
            desc: 'Manage system users, monitor AI node health, and access detailed security logs.',
            icon: (
                <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            theme: 'indigo',
            path: '/login/admin'
        }
    ];

    return (
        <div className={`min-h-[80vh] flex flex-col items-center justify-center p-4`}>
            {/* Quick Session Resume Button */}
            {user && (
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center space-x-6 p-1.5 pr-8 rounded-full border-2 transition-all hover:scale-105 active:scale-95 group ${isDark
                            ? 'bg-indigo-600/10 border-indigo-500/50 hover:bg-indigo-600/20'
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-xl shadow-blue-500/10'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg ${isDark ? 'bg-indigo-500 text-white' : 'bg-white text-[#003d82]'
                            }`}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                            <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isDark ? 'text-indigo-400' : 'text-blue-600'}`}>Session Active</p>
                            <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-[#003d82]'}`}>
                                Continue as {user.name} <span className="ml-2 font-medium opacity-50">({user.role})</span>
                            </h3>
                        </div>
                        <svg className="w-5 h-5 ml-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                    <div className="mt-4 flex justify-center">
                        <div className={`h-1 w-24 rounded-full ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}></div>
                    </div>
                </div>
            )}

            <div className="text-center mb-12">
                <h1 className={`text-4xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-[#003d82]'}`}>
                    Secure Access Portal
                </h1>
                <p className={`text-sm font-bold uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    Select your operational role at HDFC Bank
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        onClick={() => navigate(role.path)}
                        className={`group p-8 rounded-[2.5rem] border-4 cursor-pointer transition-all hover:scale-105 active:scale-95 ${isDark
                            ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:shadow-indigo-500/10'
                            : 'bg-white border-gray-100 hover:border-blue-500/50 shadow-2xl hover:shadow-blue-500/20 shadow-gray-200/50'
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-transform group-hover:rotate-12 ${isDark ? 'bg-slate-800' : 'bg-gray-50'
                            }`}>
                            {role.icon}
                        </div>
                        <h2 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {role.title}
                        </h2>
                        <p className={`text-sm font-medium leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {role.desc}
                        </p>
                        <div className={`inline-flex items-center space-x-2 font-black text-xs uppercase tracking-widest ${role.theme === 'blue' ? 'text-blue-500' : role.theme === 'green' ? 'text-green-500' : 'text-indigo-500'
                            }`}>
                            <span>Authorize Access</span>
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center">
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-slate-700' : 'text-gray-300'}`}>
                    Property of HDFC Bank AI Risk Engineering
                </p>
            </div>
        </div>
    );
};


export default RoleSelection;
