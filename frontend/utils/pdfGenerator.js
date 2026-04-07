import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateMonthlyReportPdf = (applications, monthlyAnalytics) => {
    // A4 Size: 210 x 297 mm
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });

    // Colors
    const hdfcBlue = [0, 61, 130];
    const hdfcRed = [225, 27, 34];
    const textGray = [60, 60, 60];
    const lightGray = [240, 240, 240];

    let yPos = 20;

    // --- 1. HEADER & LOGO ---
    // Draw Logo Box
    doc.setFillColor(...hdfcRed);
    doc.rect(14, yPos - 10, 16, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("H", 18, yPos + 2);

    // Title
    doc.setTextColor(...hdfcBlue);
    doc.setFontSize(24);
    doc.text("HDFC AI Portal", 35, yPos);

    doc.setTextColor(...textGray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Monthly Institutional Risk & Loan Analysis Report", 35, yPos + 6);

    // Date / Meta
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Generated on: ${currentDate}`, 150, yPos);
    doc.text(`System Unit: AI Node 0042`, 150, yPos + 6);

    yPos += 25;

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;

    // --- 2. EXECUTIVE SUMMARY ---
    doc.setTextColor(...hdfcBlue);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Executive Summary", 14, yPos);
    yPos += 8;

    const totalApps = applications.length;
    const approved = applications.filter(a => Math.abs(a.status?.indexOf('APPROV') !== -1)).length;
    const rejected = applications.filter(a => Math.abs(a.status?.indexOf('REJECT') !== -1)).length;
    const totalDisbursed = applications.filter(a => Math.abs(a.status?.indexOf('APPROV') !== -1)).reduce((acc, a) => acc + (Number(a.loanAmount) || 0), 0);
    const successRate = totalApps > 0 ? ((approved / totalApps) * 100).toFixed(1) : 0;

    doc.setFontSize(11);
    doc.setTextColor(...textGray);
    doc.setFont("helvetica", "normal");
    const summaryText = `This document provides an automated AI-driven analysis of HDFC's loan operational queue. In the analyzed period, the system processed a total of ${totalApps} applications. The AI engine successfully approved ${approved} applications and rejected ${rejected}, yielding a net system approval rate of ${successRate}%. The total approved capital disbursement volume stands at Rs ${totalDisbursed.toLocaleString('en-IN')}.`;

    const splitSummary = doc.splitTextToSize(summaryText, 182);
    doc.text(splitSummary, 14, yPos);
    yPos += splitSummary.length * 6 + 10;

    // --- 3. RISK ANALYSIS ---
    doc.setTextColor(...hdfcRed);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. AI Risk Exposure & Analytics", 14, yPos);
    yPos += 8;

    const avgRisk = totalApps > 0 ? Math.round(applications.reduce((acc, a) => acc + (a.aiCreditworthiness || 0), 0) / totalApps) : 0;
    const highRisk = applications.filter(a => a.aiCreditworthiness < 50).length;

    doc.setFontSize(10);
    doc.setTextColor(...textGray);
    doc.setFont("helvetica", "normal");
    doc.text(`• Average AI Creditworthiness Score: ${avgRisk} / 100`, 14, yPos);
    yPos += 6;
    doc.text(`• High Risk Applications Flagged (Score < 50): ${highRisk} profiles`, 14, yPos);
    yPos += 12;

    // Risk Table
    const riskBody = monthlyAnalytics.map(m => [
        m.name,
        m.count.toString(),
        m.approvedCount.toString(),
        `${((m.approvedCount / m.count) * 100).toFixed(1)}%`,
        `Rs ${(m.approvedLoan / 100000).toFixed(2)} Lacs`
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Fiscal Period', 'Total Apps', 'Approved', 'Approval Rate', 'Total Disbursed']],
        body: riskBody,
        theme: 'striped',
        headStyles: { fillColor: hdfcBlue, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // --- 4. INCOME ANALYSIS ---
    if (yPos > 240) { doc.addPage(); yPos = 20; }

    doc.setTextColor(...hdfcBlue);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. Income vs Verification Analysis", 14, yPos);
    yPos += 8;

    const avgIncome = totalApps > 0 ? Math.round(applications.reduce((acc, a) => acc + (Number(a.income) || 0), 0) / totalApps) : 0;

    doc.setFontSize(10);
    doc.setTextColor(...textGray);
    doc.setFont("helvetica", "normal");
    doc.text(`The average annual reported income across the applicant pool is Rs ${avgIncome.toLocaleString('en-IN')}.`, 14, yPos);
    yPos += 10;

    const recentApps = [...applications].slice(0, 5).map(a => [
        a.fullName || 'N/A',
        `Rs ${Number(a.income || 0).toLocaleString('en-IN')}`,
        `Rs ${Number(a.loanAmount || 0).toLocaleString('en-IN')}`,
        a.aiCreditworthiness || 'N/A',
        a.status
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Applicant Name', 'Declared Income', 'Requested Loan', 'AI Score', 'Final Status']],
        body: recentApps,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // --- 5. FRAUD DETECTION ---
    if (yPos > 240) { doc.addPage(); yPos = 20; }

    doc.setTextColor(...hdfcRed);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("4. Fraud Detection & Security Incidents", 14, yPos);
    yPos += 8;

    const fraudCases = applications.filter(a => a.fraud_status === 'Fraud' || a.is_fraud === true || a.is_fraud === 1).length;

    doc.setFontSize(10);
    doc.setTextColor(...textGray);
    doc.setFont("helvetica", "normal");

    if (fraudCases > 0) {
        doc.text(`CRITICAL ALERT: The AI Security Engine detected ${fraudCases} fraudulent application(s) during this period.`, 14, yPos);
    } else {
        doc.text(`No fraudulent activities were detected by the AI Security Engine during this analyzing period.`, 14, yPos);
    }
    yPos += 15;

    // --- FOOTER (All Pages) ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(14, 280, 196, 280);

        doc.setFont("helvetica", "italic");
        doc.text("CONFIDENTIAL: Property of HDFC Bank. Unauthorized distribution is strictly restricted and punishable.", 14, 286);
        doc.setFont("helvetica", "bold");
        doc.text(`Page ${i} of ${pageCount}`, 185, 286);
    }

    // Export PDF
    doc.save(`HDFC_AI_Monthly_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const generateApplicationPdf = (app) => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });

    // Colors
    const hdfcBlue = [0, 61, 130];
    const hdfcRed = [225, 27, 34];
    const textGray = [60, 60, 60];

    let yPos = 20;

    // --- HEADER ---
    doc.setFillColor(...hdfcRed);
    doc.rect(14, yPos - 10, 16, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("H", 18, yPos + 2);

    doc.setTextColor(...hdfcBlue);
    doc.setFontSize(20);
    doc.text("HDFC AI Loan Application", 35, yPos);

    doc.setTextColor(...textGray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Ref: ${app.id || 'N/A'}`, 35, yPos + 6);
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, yPos);

    yPos += 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;

    // --- APPLICATION DETAILS ---
    doc.setTextColor(...hdfcBlue);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Application Details", 14, yPos);
    yPos += 8;

    const details = [
        ['Applicant Name', app.fullName || app.full_name || 'N/A'],
        ['Email', app.email || 'N/A'],
        ['Mobile', app.mobile || 'N/A'],
        ['Annual Income', `Rs ${Number(app.income || 0).toLocaleString()}`],
        ['Requested Loan', `Rs ${Number(app.loanAmount || app.loan_amount || 0).toLocaleString()}`],
        ['Tenure', `${app.tenure} months`],
        ['Employment Type', app.employmentType || app.employment_type || 'N/A'],
        ['Loan Purpose', app.loanPurpose || app.loan_purpose || 'N/A'],
        ['Credit Score', String(app.creditScore || app.credit_score || 'N/A')]
    ];

    autoTable(doc, {
        startY: yPos,
        body: details,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 50 },
            1: { textColor: [0, 0, 0] }
        },
        margin: { left: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // --- AI RISK PROFILE ---
    doc.setTextColor(...hdfcRed);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AI Risk Audit Profile", 14, yPos);
    yPos += 8;

    const aiDetails = [
        ['Final Decision', app.status],
        ['AI Risk Score', `${app.aiCreditworthiness || app.ai_creditworthiness || '--'} / 100`],
        ['Risk Level', `${app.riskLevel || app.risk_level || 'Unknown'} Risk`]
    ];

    autoTable(doc, {
        startY: yPos,
        body: aiDetails,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 50 },
            1: { textColor: [0, 0, 0] }
        },
        margin: { left: 14 }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    const rawBreakdown = app.score_breakdown || app.scoreBreakdown;
    if (rawBreakdown) {
        let breakdownData = [];
        try {
            breakdownData = typeof rawBreakdown === 'string' ? JSON.parse(rawBreakdown) : rawBreakdown;
        } catch (e) {
            console.error("Failed to parse score breakdown:", e);
        }

        if (Array.isArray(breakdownData) && breakdownData.length > 0) {
            doc.setTextColor(...hdfcBlue);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Score Breakdown", 14, yPos);
            yPos += 8;
            
            const breakdownTable = breakdownData.map(b => [
                b.factor,
                b.reason,
                (b.score >= 0 ? '+' : '') + b.score
            ]);
            
            autoTable(doc, {
                startY: yPos,
                head: [['Factor', 'Reason', 'Score']],
                body: breakdownTable,
                theme: 'striped',
                headStyles: { fillColor: hdfcBlue, textColor: 255 },
                styles: { fontSize: 9, cellPadding: 3 },
                margin: { left: 14, right: 14 }
            });
        }
    }

    doc.save(`Application_${app.id || 'Details'}.pdf`);
};
