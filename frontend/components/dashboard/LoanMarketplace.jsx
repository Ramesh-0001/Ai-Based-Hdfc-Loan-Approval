import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, TrendingUp, ArrowRight, Home, Car, Zap, BadgeCheck, ChevronRight } from 'lucide-react';

const LoanMarketplace = ({ latestApp }) => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Extract features for dynamic logic
        const score = latestApp?.aiCreditworthiness || latestApp?.ai_creditworthiness || 70;
        const income = latestApp?.income || latestApp?.annualIncome || 600000;
        const debt = latestApp?.existing_loans || latestApp?.existingLoans || 0;

        // Dynamic logic for offers
        const generateOffers = () => {
            const baseHomeRate = score > 75 ? 8.2 : 8.8;
            const basePersonalRate = score > 75 ? 10.2 : 11.5;
            
            const approvalOdds = score > 80 ? 'High' : score > 50 ? 'Medium' : 'Low';
            
            const dynamicAmount = Math.round(income * (score / 100) * 5);

            return [
                {
                    bankName: "HDFC Premium Home",
                    interestRate: `${baseHomeRate}%`,
                    approvalChance: approvalOdds,
                    bestOffer: score > 70,
                    icon: Home,
                    type: "Home Loan",
                    description: `Eligible up to ₹${(dynamicAmount * 2).toLocaleString()}`
                },
                {
                    bankName: "HDFC Fast-Track",
                    interestRate: `${basePersonalRate}%`,
                    approvalChance: debt > 100000 ? 'Medium' : approvalOdds,
                    bestOffer: score <= 70,
                    icon: Zap,
                    type: "Personal Loan",
                    description: "Instant disbursement for members"
                },
                {
                    bankName: "HDFC Scholar",
                    interestRate: "9.25%",
                    approvalChance: "High",
                    bestOffer: false,
                    icon: TrendingUp,
                    type: "Education Loan",
                    description: "Special rates for top universities"
                },
                {
                    bankName: "HDFC Moto",
                    interestRate: score > 75 ? "8.90%" : "9.80%",
                    approvalChance: approvalOdds,
                    bestOffer: false,
                    icon: Car,
                    type: "Auto Loan",
                    description: "Pre-approved based on status"
                }
            ];
        };

        // Simulate a small loading effect for "Smart" feel
        const timeout = setTimeout(() => {
            setOffers(generateOffers());
            setLoading(false);
        }, 600);

        return () => clearTimeout(timeout);
    }, [latestApp]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-8 bg-gray-100 rounded-lg w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[180px] bg-slate-50 rounded-2xl border border-gray-100"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 font-sans">
            <header className="pb-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Smart Loan Offers</h1>
                <p className="text-[10px] text-blue-600 font-bold capitalize mt-1.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                  Personalized Offers Based On Your Profile
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {offers.map((offer, index) => (
                    <div 
                        key={index}
                        className={`relative rounded-2xl p-6 border transition-all duration-300 transform cursor-pointer hover:shadow-xl hover:shadow-blue-900/10 hover:scale-[1.05] group min-h-[180px] flex flex-col justify-between ${
                            offer.bestOffer 
                                ? 'border-blue-600 bg-gradient-to-b from-white to-blue-50 shadow-lg shadow-blue-900/15 translate-y-[-4px]' 
                                : 'bg-white border-gray-100'
                        }`}
                    >
                        {offer.bestOffer && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-lg z-20 capitalize tracking-widest whitespace-nowrap">
                                Best Match
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-gray-400 capitalize tracking-wider">
                                <span>{offer.type}</span>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${offer.bestOffer ? 'bg-blue-600 text-white group-hover:rotate-12' : 'bg-slate-50 text-blue-600'}`}>
                                    <offer.icon size={16} />
                                </div>
                            </div>
                            
                            <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{offer.bankName}</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className={`text-xl font-black tracking-tighter ${offer.bestOffer ? 'text-blue-600' : 'text-gray-900'}`}>{offer.interestRate}</span>
                                <span className="text-[10px] text-gray-400 font-medium italic lowercase">p.a.</span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-medium mt-1 truncate">{offer.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                 <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize tracking-widest ${offer.approvalChance === 'High' ? 'bg-green-50 text-green-600' : offer.approvalChance === 'Medium' ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'}`}>
                                    {offer.approvalChance} Approval
                                </span>
                                {offer.bestOffer && (
                                    <div className="text-blue-600 flex items-center gap-1 text-[9px] font-black capitalize tracking-widest animate-in slide-in-from-left duration-1000">
                                        <BadgeCheck size={12} />
                                        Recommended
                                    </div>
                                )}
                            </div>
                        </div>

                        <button 
                            className="absolute bottom-4 left-5 right-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold hover:bg-black transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
                        >
                            Select Plan <ArrowRight size={14} />
                        </button>
                    </div>
                ))}
            </div>
            
            <footer className="text-center pt-8">
                 <p className="text-[10px] font-bold text-gray-300 capitalize tracking-[0.3em] italic">
                    AI-Driven Financial Matching
                 </p>
            </footer>
        </div>
    );
};

export default LoanMarketplace;
