
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from '../components/Login';
import CustomerDashboard from '../components/CustomerDashboard';
import AdminDashboard from '../components/AdminDashboard';
import InstitutionalDashboard from '../components/InstitutionalDashboard';
import Navbar from '../components/Navbar';
import ApplyLoan from '../components/ApplyLoan';
import EMICalculator from '../components/EMICalculator';
import EligibilityChecker from '../components/EligibilityChecker';
import TrackApplication from '../components/TrackApplication';
import Dashboard from '../components/Dashboard';
import RoleSelection from '../components/RoleSelection';
import CustomerEntry from '../components/CustomerEntry';
import OfficerLogin from '../components/OfficerLogin';
import AdminLogin from '../components/AdminLogin';

const ProtectedRoute = ({ user, roles, children }) => {
    if (!user || !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
};

import { API_BASE_URL } from './config/api';

const App = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('hdfc_user');
        try {
            return (saved && saved !== 'null') ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [applications, setApplications] = useState(() => {
        const saved = localStorage.getItem('hdfc_applications');
        return saved ? JSON.parse(saved) : [];
    });
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('hdfc_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [isDark, setIsDark] = useState(
        localStorage.getItem('color-theme') === 'dark'
    );

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
            setIsDark(true);
        }
    };

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('hdfc_user', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        localStorage.setItem('hdfc_applications', JSON.stringify(applications));
    }, [applications]);

    useEffect(() => {
        localStorage.setItem('hdfc_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const handleLogin = (u) => {
        setUser(u);
        if (u.role === 'ADMIN' || u.role === 'OFFICER') {
            fetchApplications();
        }
    };

    const fetchApplications = async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            // If user is an applicant, only fetch their own applications
            if (user && user.role === 'APPLICANT') {
                queryParams.append('applicant_id', user.id);
            }

            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'ALL' && value !== 'all') {
                    if (typeof value === 'object') {
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            if (subValue) queryParams.append(`${key}_${subKey}`, subValue);
                        });
                    } else {
                        queryParams.append(key, value);
                    }
                }
            });

            const url = `${API_BASE_URL}/api/applications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);
            const result = await response.json();
            if (Array.isArray(result)) {
                setApplications(result);
            } else if (result.success && Array.isArray(result.data)) {
                setApplications(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch applications:', err);
        }
    };

    useEffect(() => {
        const syncState = (e) => {
            if (e.key === 'hdfc_applications') setApplications(JSON.parse(e.newValue || '[]'));
            if (e.key === 'hdfc_notifications') setNotifications(JSON.parse(e.newValue || '[]'));
            if (e.key === 'hdfc_user') setUser(JSON.parse(e.newValue || 'null'));
        };
        window.addEventListener('storage', syncState);
        return () => window.removeEventListener('storage', syncState);
    }, []);

    useEffect(() => {
        let interval;
        if (user) {
            fetchApplications();
            // Poll for new updates every 10 seconds
            interval = setInterval(fetchApplications, 10000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user]);


    const handleLogout = () => {
        // Clear all state
        setUser(null);
        setApplications([]);
        setNotifications([]);

        // Clear all persistence
        localStorage.removeItem('hdfc_user');
        localStorage.removeItem('hdfc_applications');
        localStorage.removeItem('hdfc_notifications');
    };

    const createNotification = ({ type, message, targetRoles = [], recipientId = null, appId = null, customerName = null }) => {
        const newNotif = {
            id: Math.random().toString(36).substr(2, 9),
            appId,
            customerName,
            type,
            message,
            targetRoles,
            read: false,
            timestamp: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const addApplication = (app) => {
        // loanAmount may come as a string from formData – normalise it
        const loanAmtNum = parseFloat(app.loanAmount) || 0;
        const appStatus = app.status || 'PENDING';

        setApplications(prev => {
            const updatedApps = [app, ...prev];
            localStorage.setItem('hdfc_applications', JSON.stringify(updatedApps));
            return updatedApps;
        });

        // 1. Notify Applicant
        createNotification({
            type: 'SUBMISSION',
            message: `Loan application for \u20b9${loanAmtNum.toLocaleString()} submitted successfully (REF: ${(app.id || '').toUpperCase()})`,
            targetRoles: ['CUSTOMER'],
            customerName: app.fullName,
            appId: app.id
        });

        // 2. Notify Officers/Admin based on AI decision
        if (appStatus === 'PENDING') {
            createNotification({
                type: 'ASSIGNMENT',
                message: `New Loan Application Received: ${app.fullName} (\u20b9${loanAmtNum.toLocaleString()}) - Pending Review`,
                targetRoles: ['OFFICER', 'ADMIN'],
                appId: app.id
            });

            // Priority alert for High Risk
            if (app.aiCreditworthiness < 40) {
                createNotification({
                    type: 'ALERT',
                    message: `HIGH RISK ALERT: Application ${(app.id || '').toUpperCase()} has a low AI Creditworthiness score (${app.aiCreditworthiness}%)`,
                    targetRoles: ['OFFICER', 'ADMIN'],
                    appId: app.id
                });
            }
        } else {
            // AI Auto-decision (APPROVED / REJECTED / MANUAL_REVIEW)
            createNotification({
                type: appStatus,
                message: `AI System Decision: Loan ${appStatus} for ${app.fullName} based on Risk Engine Profiling.`,
                targetRoles: ['CUSTOMER', 'OFFICER', 'ADMIN'],
                customerName: app.fullName,
                appId: app.id
            });
        }
    };


    const updateApplicationStatus = async (id, status, remark = '', officer = null) => {
        // Optimistic update
        setApplications(prev => prev.map(a => {
            if (a.id === id) {
                return { ...a, status, bankerRemark: remark, reviewedBy: officer?.name, isManualOverride: true };
            }
            return a;
        }));

        try {
            const response = await fetch(`${API_BASE_URL}/api/update-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, remark, officer: officer?.name })
            });
            const data = await response.json();
            if (data.success) {
                // Refresh data to be sure
                fetchApplications();
            }
        } catch (err) {
            console.error('Failed to update status in SQL:', err);
        }

        // Keep local notification logic
        const targetApp = applications.find(a => a.id === id);
        if (targetApp) {
            const userMsg = status === 'INFO_REQUIRED'
                ? `ATTENTION: Additional documents or information are required for your application ${id.toUpperCase()}.`
                : `Loan Decision: Your application ${id.toUpperCase()} has been ${status}.`;

            createNotification({
                type: status,
                message: userMsg,
                targetRoles: ['CUSTOMER'],
                customerName: targetApp.fullName,
                appId: id
            });
        }
    };

    const deleteApplication = async (id) => {
        setApplications(prev => prev.filter(a => a.id !== id));
        try {
            await fetch(`${API_BASE_URL}/api/delete-application?id=${id}`, { method: 'DELETE' });
        } catch (err) {
            console.error('Failed to delete from SQL:', err);
        }
    };

    const markNotificationsRead = (currentUser) => {
        setNotifications(prev => prev.map(n => {
            let shouldMark = false;
            if (currentUser.role === 'ADMIN' && n.targetRoles?.includes('ADMIN')) shouldMark = true;
            if (currentUser.role === 'OFFICER' && (n.targetRoles?.includes('OFFICER') || n.recipientId === currentUser.id)) shouldMark = true;
            if (currentUser.role === 'APPLICANT' && n.targetRoles?.includes('CUSTOMER') && n.customerName === currentUser.name) shouldMark = true;

            return shouldMark ? { ...n, read: true } : n;
        }));
    };

    return (
        <Router>
            <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
                <Routes>
                    {/* Dashboards take over the full screen with their own layouts */}
                    <Route
                        path="/dashboard"
                        element={
                            !user ? <Navigate to="/login" replace /> :
                                (user.role === 'ADMIN') ?
                                    <AdminDashboard
                                        user={user}
                                        onLogout={handleLogout}
                                    /> :
                                (user.role === 'OFFICER') ?
                                    <InstitutionalDashboard
                                        user={user}
                                        onLogout={handleLogout}
                                    /> :
                                    <CustomerDashboard 
                                        user={user} 
                                        applications={applications.filter(a => 
                                            // Prefer matching by ID if available, otherwise fallback to name
                                            (a.applicant_id && user.id && Number(a.applicant_id) === Number(user.id)) ||
                                            (a.fullName && user.name && a.fullName.toLowerCase().trim().includes(user.name.toLowerCase().trim())) ||
                                            (user.name && a.fullName && user.name.toLowerCase().trim().includes(a.fullName.toLowerCase().trim()))
                                        )} 
                                        onLogout={handleLogout} 
                                        onSubmit={addApplication}
                                    />
                        }
                    />

                    {/* Other routes with standard Navbar/Footer */}
                    <Route
                        path="*"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Navbar
                                    user={user}
                                    onLogout={handleLogout}
                                    isDark={isDark}
                                    onToggleTheme={toggleTheme}
                                    notifications={notifications}
                                    onMarkRead={markNotificationsRead}
                                />
                                <main className="flex-grow container mx-auto px-4 py-8">
                                    <Routes>
                                        <Route
                                            path="/login"
                                            element={<RoleSelection isDark={isDark} user={user} />}
                                        />
                                        <Route
                                            path="/login/applicant"
                                            element={<CustomerEntry onLogin={handleLogin} isDark={isDark} />}
                                        />
                                        <Route
                                            path="/login/officer"
                                            element={<OfficerLogin onLogin={handleLogin} isDark={isDark} />}
                                        />
                                        <Route
                                            path="/login/admin"
                                            element={<AdminLogin onLogin={handleLogin} isDark={isDark} />}
                                        />
                                        <Route
                                            path="/apply"
                                            element={<ApplyLoan user={user} onSubmit={addApplication} />}
                                        />
                                        <Route path="/emi-calculator" element={<EMICalculator />} />
                                        <Route path="/check-eligibility" element={<EligibilityChecker />} />
                                        <Route path="/track-application" element={<TrackApplication applications={applications} />} />
                                        <Route
                                            path="/stats"
                                            element={
                                                <ProtectedRoute user={user} roles={['ADMIN', 'OFFICER']}>
                                                    <Dashboard />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route path="/" element={<Navigate to="/login" replace />} />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </main>
                                <footer className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 py-6 mt-12">
                                    <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                        © {new Date().getFullYear()} HDFC Bank. Secure AI-Based Loan Processing System.
                                    </div>
                                </footer>
                            </div>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
