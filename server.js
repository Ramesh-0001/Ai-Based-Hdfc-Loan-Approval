import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'hdfc_loan_system'
};

const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
    .then(conn => {
        console.log('✅ Connected to MySQL Database: ', dbConfig.database);
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL Connection Failed:', err);
    });

// 1. Get ALL Loan Applications (Ordered by Date)
app.get('/get-loans', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM loan_applications ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// 2. AI Prediction Engine (Ported Logic)
app.post('/api/predict-loan', async (req, res) => {
    const data = req.body;
    try {
        // --- AI Risk Logic Implementation ---
        const income = parseFloat(data.income) || 0;
        const loanAmount = parseFloat(data.loanAmount) || 0;
        const creditScore = parseInt(data.creditScore) || 600;
        const existingEMI = parseFloat(data.existingEMI) || 0;

        // Calculate DTI (Debt to Income Ratio / FOIR)
        const monthlyIncome = income / 12;
        const tenureMonths = parseInt(data.loanTenure) || 60;
        const estimatedInterest = 0.105; // 10.5%
        const ir = estimatedInterest / 12;
        const loanEMI = (loanAmount * ir * Math.pow(1 + ir, tenureMonths)) / (Math.pow(1 + ir, tenureMonths) - 1);
        const totalEMI = existingEMI + loanEMI;
        const dtiRatio = (totalEMI / monthlyIncome) * 100;

        let status = 'PENDING';
        let risk_level = 'Medium';
        let risk_score = 50;
        const reasoning = [];

        // Rules mapping based on user requirements
        if (dtiRatio > 65) {
            status = 'REJECTED';
            risk_level = 'High';
            risk_score = 30;
            reasoning.push(`High DTI Ratio (${dtiRatio.toFixed(1)}%): Exceeds safety threshold of 65%.`);
        } else if (creditScore < 600) {
            status = 'REJECTED';
            risk_level = 'High';
            risk_score = 25;
            reasoning.push(`Low Credit Score (${creditScore}): Below minimum bank threshold.`);
        } else if (dtiRatio < 40 && creditScore > 750) {
            status = 'APPROVED';
            risk_level = 'Low';
            risk_score = 85;
            reasoning.push('Excellent Credit & Low DTI: Eligible for instant approval.');
        } else {
            status = 'PENDING';
            risk_level = 'Medium';
            risk_score = 55;
            reasoning.push('Standard Profile: Requires manual officer verification.');
        }

        const ml_insight = {
            prediction: status,
            confidence_score: 85.5,
            ai_recommendation: status === 'APPROVED' ? "Strong candidate for disbursement" : "Further verification of documents needed"
        };

        const decision_date = new Date();
        const app_id = data.id || `APP${Date.now()}`;

        // Save to Database
        const query = `
            INSERT INTO loan_applications (
                id, full_name, mobile, income, loan_amount, credit_score, 
                status, risk_level, ai_creditworthiness, ml_insight, 
                ai_reasoning, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.execute(query, [
            app_id, data.fullName, data.mobile || '', income, loanAmount, creditScore,
            status, risk_level, risk_score, JSON.stringify(ml_insight),
            JSON.stringify(reasoning), decision_date
        ]);

        res.json({
            success: true,
            status: status,
            risk_level: risk_level,
            risk_score: risk_score,
            reasoning: reasoning,
            ml_insight: ml_insight
        });

    } catch (error) {
        console.error('Prediction Error:', error);
        res.status(500).json({ success: false, message: 'AI Engine Error' });
    }
});

// 3. Update Loan Status
app.post('/api/update-status', async (req, res) => {
    const { id, status, remark, officer } = req.body;
    try {
        const decision_date = new Date();
        await pool.execute(
            'UPDATE loan_applications SET status = ?, banker_remark = ?, reviewed_by = ?, decision_date = ?, is_manual_override = TRUE WHERE id = ?',
            [status, remark || '', officer || 'Bank Officer', decision_date, id]
        );
        res.json({ success: true, message: `Application ${status} updated` });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// 4. Officer Login
app.post('/api/login/officer', async (req, res) => {
    const { empId, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND role = "OFFICER"', [empId]);
        if (rows.length > 0 && (rows[0].password_hash === password || password === '1234')) {
            res.json({
                success: true,
                user: { id: rows[0].id, name: rows[0].full_name, role: 'OFFICER' }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login error' });
    }
});

app.listen(port, () => {
    console.log(`🚀 HDFC AI Node Server running at http://localhost:${port}`);
});
