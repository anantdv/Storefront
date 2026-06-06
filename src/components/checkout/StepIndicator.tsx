import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={step}>
              {/* Step bubble */}
              <div className="flex flex-col items-center flex-1 relative">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-black transition-all ${
                  isCompleted 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : isActive
                      ? 'border-indigo-600 bg-white text-indigo-600 ring-4 ring-indigo-50'
                      : 'border-slate-200 bg-white text-slate-400'
                }`}>
                  {stepNum}
                </div>
                <span className={`mt-2 text-xxs font-extrabold uppercase tracking-wider text-center hidden sm:block ${
                  isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>

              {/* Progress Line */}
              {idx !== steps.length - 1 && (
                <div className={`h-0.5 flex-1 transition-all ${
                  isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
