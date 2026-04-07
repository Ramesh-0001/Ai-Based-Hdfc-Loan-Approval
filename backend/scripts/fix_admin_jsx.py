import re

filepath = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\AdminDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Let's find the return statement and the closing block.
# We will manually rebuild the return block to be absolutely sure.
# We know the return starts at 506 and function ends at 588.

# Actually, I'll just replace the whole section from 500 to 590 with a clean version.

new_return_section = """
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
            {/* ADD USER MODAL */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-none overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-gray-900">Add New User</h2>
                            <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-5 space-y-4">
                            <div className="space-y-4">
                                <FormInput label="Node Identifier" value={newUser.username} onChange={v => setNewUser({...newUser, username: v})} placeholder="e.g. officer_rahul" />
                                <FormInput label="Full Human Name" value={newUser.full_name} onChange={v => setNewUser({...newUser, full_name: v})} placeholder="e.g. Rahul Sharma" />
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500">Role</label>
                                    <select 
                                        value={newUser.role} 
                                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                                        className="w-full bg-slate-50 border border-gray-200 py-2.5 px-4 rounded-none text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
                                    >
                                        <option value="APPLICANT">APPLICANT</option>
                                        <option value="OFFICER">OFFICER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={actionLoading}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-none text-sm font-medium shadow-sm hover:bg-blue-700 transition-all inline-flex items-center justify-center font-semibold"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : "Create User"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-50">
                <div className="px-5 py-5 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center font-semibold text-base font-bold">H</div>
                    <div className="leading-tight"><p className="text-sm font-semibold text-gray-900">HDFC Admin</p><p className="text-xs text-gray-500">Control Panel</p></div>
                </div>
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map(item => (
                        <button key={item.name} onClick={() => setActiveTab(item.name)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-medium transition-all duration-200 ${activeTab === item.name ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:!bg-blue-600 hover:!text-white'}`}>
                            <item.icon size={18} /><span>{item.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-3 border-t border-gray-200">
                    <button onClick={onLogout} className="w-full inline-flex items-center justify-center gap-2 py-2 text-gray-600 border border-transparent rounded-none text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-semibold">
                        <LogOut size={16} /><span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* WORKSPACE */}
            <div className="flex-1 ml-60">
                <header className="h-16 bg-white sticky top-0 z-40 border-b border-gray-200 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">{activeTab} Dashboard V4</h1>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-none text-xs font-medium text-gray-500 hover:bg-gray-100 transition-all" onClick={fetchData}>
                             <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
                             <span>Refresh</span>
                        </button>
                        <div className="relative cursor-pointer">
                            <Bell size={18} className="text-gray-400 hover:text-gray-600 transition-colors" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto w-full min-h-screen">
                    {renderContent()}
                </main>

                {/* TOAST PANEL */}
                {toast && (
                    <div className="fixed bottom-6 right-6 bg-white border border-gray-200 px-5 py-3 rounded-none shadow-lg inline-flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5">
                        {toast.type === 'error' ? <AlertOctagon size={16} className="text-red-400" /> : <CheckCircle size={16} className="text-green-400" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
"""

content = "".join(lines)

# Find the start of the return block
start_match = re.search(r'return\s*\(', content)
if start_match:
    start_pos = start_match.start()
    # Find the end of the functional component (before // --- HELPERS ---)
    end_pos = content.find('// --- HELPERS ---')
    if end_pos != -1:
        new_content = content[:start_pos] + new_return_section + "\n\n" + content[end_pos:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("AdminDashboard updated and balanced.")
    else:
        print("Could not find HELPERS marker.")
else:
    print("Could not find return block.")
