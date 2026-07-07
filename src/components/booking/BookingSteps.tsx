"use client";

import Link from "next/link";

export type Step = {
  number: number;
  label: string;
  href?: string;
};

type BookingStepsProps = {
  currentStep: number;
  steps?: Step[];
  title?: string;
  subtitle?: string;
};

const DEFAULT_STEPS: Step[] = [
  { number: 1, label: "Pilih Olahraga", href: "/booking" },
  { number: 2, label: "Pilih Venue" },
  { number: 3, label: "Pilih Jadwal" },
  { number: 4, label: "Isi Data" },
  { number: 5, label: "Selesai" },
];

export default function BookingSteps({
  currentStep,
  steps = DEFAULT_STEPS,
  title,
  subtitle,
}: BookingStepsProps) {
  return (
    <div className="relative bg-emerald-600 py-3 sm:py-5 overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Desktop: full step indicators */}
        <div className="hidden sm:flex items-start justify-center mb-3">
          {steps.map((step, i) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            const circleClass = isCompleted
              ? "bg-emerald-400 text-white shadow-md shadow-emerald-500/30"
              : isCurrent
                ? "bg-white text-emerald-700 shadow-lg shadow-white/25 ring-4 ring-white/20"
                : "bg-white/15 text-white/40 backdrop-blur-sm";

            const labelClass = isCompleted
              ? "text-emerald-200"
              : isCurrent
                ? "text-white font-semibold"
                : "text-white/35";

            const circleContent = isCompleted ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step.number
            );

            return (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  {isCompleted && step.href ? (
                    <Link href={step.href} className="flex flex-col items-center group">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${circleClass} group-hover:scale-110`}>
                        {circleContent}
                      </span>
                      <span className={`mt-1.5 text-[10px] leading-tight transition-colors ${labelClass} group-hover:text-white`}>
                        {step.label}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${circleClass} ${isCurrent ? "scale-110" : ""}`}>
                        {circleContent}
                      </span>
                      <span className={`mt-1.5 text-[10px] leading-tight ${labelClass}`}>
                        {step.label}
                      </span>
                    </div>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className="flex items-center mt-[-12px] mx-1">
                    <div className={`h-0.5 w-8 rounded-full transition-all duration-300 ${step.number < currentStep ? "bg-emerald-300" : "bg-white/20"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: compact progress dots */}
        <div className="flex sm:hidden items-center justify-center gap-1 mb-2">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            return (
              <span
                key={step.number}
                className={`h-1 rounded-full transition-all duration-200 ${
                  isCompleted
                    ? "bg-emerald-300 w-3"
                    : isCurrent
                      ? "bg-white w-5"
                      : "bg-white/25 w-1"
                }`}
              />
            );
          })}
        </div>

        {/* Title */}
        {title && (
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-emerald-100/70 text-[11px] sm:text-xs max-w-md mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}