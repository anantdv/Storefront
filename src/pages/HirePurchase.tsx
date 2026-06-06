import React, { useState } from 'react';
import { CreditCard, BadgePercent, CheckCircle, FileText, Info, Calculator } from 'lucide-react';

export const HirePurchase: React.FC = () => {
  const [productCost, setProductCost] = useState<number>(1500);
  const [termMonths, setTermMonths] = useState<number>(12);
  const [depositPct, setDepositPct] = useState<number>(10);

  // Interest details: 15% standard APR
  const annualInterestRate = 0.15;
  const calculatedDeposit = (productCost * depositPct) / 100;
  const principal = productCost - calculatedDeposit;
  
  // Repayment calculations using standard loan formulas
  const monthlyInterestRate = annualInterestRate / 12;
  const totalMonths = termMonths;
  const monthlyPayment = principal > 0
    ? (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)
    : 0;

  const weeklyPayment = monthlyPayment / 4.33;
  const totalPayments = monthlyPayment * totalMonths;
  const totalCost = totalPayments + calculatedDeposit;
  const totalInterest = totalCost - productCost;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-10">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none margin-0">
          Courts Hire Purchase
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wide">
          Flexible installment financing options designed to suit your budget
        </p>
      </div>

      {/* Hero promo card */}
      <div className="rounded-3xl bg-[#0060a9] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xxs font-bold uppercase tracking-wider">
            <BadgePercent className="h-3.5 w-3.5" /> Easy Payment Plans
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Take home tech, furniture, or home appliances today. Pay in flexible installments.
          </h2>
          <p className="text-xs text-indigo-100 font-medium">
            With Courts Hire Purchase (HP) options, you don't have to wait. Choose from 6 to 36-month flexible finance terms with easy application approvals.
          </p>
        </div>
        <div className="bg-white/10 p-5 rounded-2xl border border-white/20 text-center space-y-1 shrink-0">
          <p className="text-xs text-indigo-150 font-bold uppercase tracking-wider">Starting APR</p>
          <p className="text-3xl font-black">15.0%</p>
          <p className="text-[10px] text-indigo-200">Competitive Repayment Rates</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Financing Calculator */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs space-y-6">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
            <Calculator className="h-5 w-5 text-[#0060a9]" />
            Installment Payment Estimator
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Input 1: Product Cost */}
            <div>
              <label className="text-xxs font-extrabold text-slate-400 uppercase">Product Value (K)</label>
              <input
                type="number"
                value={productCost}
                onChange={(e) => setProductCost(Math.max(100, Number(e.target.value)))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-[#0060a9] mt-1.5"
                placeholder="1500"
              />
            </div>

            {/* Input 2: Deposit percentage */}
            <div>
              <label className="text-xxs font-extrabold text-slate-400 uppercase">Down Deposit (%)</label>
              <select
                value={depositPct}
                onChange={(e) => setDepositPct(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-[#0060a9] mt-1.5 cursor-pointer"
              >
                <option value={0}>0% Deposit</option>
                <option value={10}>10% Deposit</option>
                <option value={20}>20% Deposit</option>
                <option value={30}>30% Deposit</option>
              </select>
            </div>

            {/* Input 3: Terms in months */}
            <div>
              <label className="text-xxs font-extrabold text-slate-400 uppercase">Duration Term</label>
              <select
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-[#0060a9] mt-1.5 cursor-pointer"
              >
                <option value={6}>6 Months</option>
                <option value={12}>12 Months (1 Year)</option>
                <option value={18}>18 Months</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
              </select>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            
            {/* Left Col: Repayment amounts */}
            <div className="rounded-2xl bg-[#0060a9]/5 border border-[#0060a9]/10 p-5 space-y-4 text-center">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Estimated Weekly Installment</p>
                <p className="text-3xl font-black text-[#0060a9] mt-1">K{weeklyPayment.toFixed(2)}</p>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">computed over 4.33 weeks/mo</p>
              </div>
              <div className="border-t border-[#0060a9]/10 pt-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Estimated Monthly Installment</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">K{monthlyPayment.toFixed(2)}</p>
              </div>
            </div>

            {/* Right Col: Cost breakdown details */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2.5 font-semibold text-xs text-slate-550 justify-center flex flex-col">
              <div className="flex justify-between">
                <span>Calculated Down Deposit:</span>
                <span className="text-slate-800 font-extrabold">K{calculatedDeposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Principal Finance Amount:</span>
                <span className="text-slate-800 font-extrabold">K{principal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Repayment Interest:</span>
                <span className="text-indigo-650 font-bold">K{totalInterest.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-800 text-sm">
                <span>Total Financing Cost:</span>
                <span className="text-slate-900">K{totalCost.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Requirements & Info */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs space-y-6">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
            <FileText className="h-5 w-5 text-[#0060a9]" />
            Eligibility Requirements
          </h3>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Applying for Courts Hire Purchase is fast and simple. Please ensure you have the following documents ready when submitting your application at any showroom outlet:
            </p>

            <div className="space-y-3 pl-1">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-extrabold text-slate-800">Valid Photo ID</p>
                  <p className="text-[10px] font-bold text-slate-450 mt-0.5">National Identification Card, Passport, or Driver License.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-extrabold text-slate-800">Employment Letter</p>
                  <p className="text-[10px] font-bold text-slate-450 mt-0.5">Letter confirming your position, base salary, and length of service.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-extrabold text-slate-800">Latest 3 Payslips</p>
                  <p className="text-[10px] font-bold text-slate-450 mt-0.5">Proof of stable continuous income from employer checks.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-extrabold text-slate-800">Recent Bank Statements</p>
                  <p className="text-[10px] font-bold text-slate-450 mt-0.5">Latest 3 months history statement indicating regular payroll credits.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-2 text-xxs font-semibold text-slate-550 leading-relaxed mt-2">
              <Info className="h-4.5 w-4.5 text-[#0060a9] shrink-0 mt-0.5" />
              <span>
                *Terms and Conditions Apply. Approvals are subject to credit bureau evaluations and income validation checks by the finance authorization team.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
