"use client";

import Link from "next/link";

export type Step = {
  number: number;
  label: string;
  href?: string;
  icon?: string;
};

type BookingStepsProps = {
  currentStep: number;
  steps?: Step[];
  title?: string;
  subtitle?: string;
};

const DEFAULT_STEPS: Step[] = [
  { number: 1, label: "Pilih Olahraga", href: "/booking", icon: "🏆" },
  { number: 2, label: "Pilih Lapangan", href: "/booking", icon: "🏟️" },
  { number: 3, label: "Pilih Jam Main", icon: "⏰" },
  { number: 4, label: "Data Pelanggan", icon: "👤" },
  { number: 5, label: "Pembayaran", icon: "💳" },
  { number: 6, label: "Konfirmasi", icon: "✅" },
];

export default function BookingSteps({
  currentStep,
  steps = DEFAULT_STEPS,
  title,
  subtitle,
}: BookingStepsProps) {
  return (
    <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 py-4 sm:py-6 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Desktop: full step indicators with icons */}
        <div className="hidden sm:flex items-start justify-center mb-4">
          {steps.map((step, i) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            const circleClass = isCompleted
              ? "bg-white text-emerald-600 shadow-lg shadow-emerald-900/20"
              : isCurrent
                ? "bg-white text-emerald-600 shadow-xl shadow-white/30 ring-4 ring-white/30 scale-110"
                : "bg-white/20 text-white/60 backdrop-blur-sm border-2 border-white/30";

            const labelClass = isCompleted
              ? "text-emerald-100 font-medium"
              : isCurrent
                ? "text-white font-bold"
                : "text-white/50";

            const iconClass = isCompleted
              ? "opacity-100"
              : isCurrent
                ? "opacity-100"
                : "opacity-60";

            return (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center min-w-[90px]">
                  {isCompleted && step.href ? (
                    <Link href={step.href} className="flex flex-col items-center group">
                      <div className="relative">
                        <span className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${circleClass} group-hover:scale-105`}>
                          {isCompleted ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className={iconClass}>{step.icon}</span>
                          )}
                        </span>
                        {isCurrent && (
                          <div className="absolute -inset-1 rounded-full bg-white/20 animate-ping"></div>
                        )}
                      </div>
                      <span className={`mt-2 text-xs leading-tight transition-colors ${labelClass} group-hover:text-white`}>
                        {step.label}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <span className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${circleClass}`}>
                          {isCompleted ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className={iconClass}>{step.icon}</span>
                          )}
                        </span>
                        {isCurrent && (
                          <div className="absolute -inset-1 rounded-full bg-white/20 animate-ping"></div>
                        )}
                      </div>
                      <span className={`mt-2 text-xs leading-tight ${labelClass}`}>
                        {step.label}
                      </span>
                    </div>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className="flex items-center mt-[-20px] mx-2">
                    <div className={`h-1 w-12 rounded-full transition-all duration-300 ${
                      step.number < currentStep 
                        ? "bg-white shadow-sm shadow-white/50" 
                        : "bg-white/20"
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: compact progress with current step info */}
        <div className="flex sm:hidden items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {steps.map((step) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;
              return (
                <span
                  key={step.number}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? "bg-white w-4 shadow-sm"
                      : isCurrent
                        ? "bg-white w-6 shadow-md"
                        : "bg-white/30 w-2"
                  }`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{steps[currentStep - 1]?.icon}</span>
            <span className="text-white text-xs font-semibold">
              {steps[currentStep - 1]?.label}
            </span>
          </div>
        </div>

        {/* Title */}
        {title && (
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-emerald-50 text-sm max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}