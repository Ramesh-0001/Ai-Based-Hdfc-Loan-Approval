import React, { useState, useEffect } from 'react';

/**
 * Dashboard Component 
 * Requirement: Fetches data from Flask backend and displays key metrics.
 */
const Dashboard = () => {
    // State for storing the API response
    const [stats, setStats] = useState(null);
    // State for tracking loading status
    const [loading, setLoading] = useState(true);
    // State for error handling
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1. Fetch data when the component loads
        const fetchData = async () => {
            try {
                console.log("Fetching dashboard data...");
                const response = await fetch("http://localhost:5001/api/dashboard-stats");

                if (!response.ok) {
                    throw new Error("Failed to fetch data from API");
                }

                const data = await response.json();

                // 2. Print data in console for debugging (Requirement)
                console.log("Dashboard Data Received:", data);

                // 3. Store response in state
                setStats(data);
            } catch (err) {
                console.error("Dashboard Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 4. Handle loading state
    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Loading Stats...</h3>
            </div>
        );
    }

    // 5. Handle error state
    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
                <h3>Error: {error}</h3>
                <p>Please ensure the backend server is running at port 5001.</p>
            </div>
        );
    }

    // 6. Display Data (Clean and Simple UI)
    return (
        <div style={{
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f9f9f9',
            minHeight: '100vh'
        }}>
            <h1 style={{ color: '#003d82' }}>HDFC AI Loan Dashboard</h1>

            {/* Summary Metrics */}
            <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    flex: 1
                }}>
                    <strong>Total Applications:</strong>
                    <span style={{ fontSize: '24px', marginLeft: '10px' }}>{stats.total_apps}</span>
                </div>

                <div style={{
                    padding: '20px',
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    flex: 1
                }}>
                    <strong>Approved Loans:</strong>
                    <span style={{ fontSize: '24px', marginLeft: '10px', color: 'green' }}>{stats.approved}</span>
                </div>
            </div>

            {/* Recent Activity List */}
            <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}>
                <h2>Recent Activity</h2>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {stats.recent_activity.map((app, index) => (
                        <li key={index} style={{
                            padding: '10px',
                            borderBottom: index !== stats.recent_activity.length - 1 ? '1px solid #eee' : 'none'
                        }}>
                            <strong>{app.fullName || app.full_name}</strong> applied for ₹{app.amount ? app.amount.toLocaleString() : app.loan_amount.toLocaleString()}
                            <span style={{
                                float: 'right',
                                color: app.status === 'APPROVED' ? 'green' : 'orange',
                                fontWeight: 'bold'
                            }}>
                                {app.status}
                            </span>
                        </li>
                    ))}
                </ul>
                {stats.recent_activity.length === 0 && <p>No recent activity found.</p>}
            </div>
        </div>
    );
};

export default Dashboard;
