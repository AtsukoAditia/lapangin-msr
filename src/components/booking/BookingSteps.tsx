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
  { number: 2, label: "Pilih Lapangan" },
  { number: 3, label: "Pilih Jadwal" },
  { number: 4, label: "Isi Data" },
  { number: 5, label: "Berhasil" },
];

export default function BookingSteps({
  currentStep,
  steps = DEFAULT_STEPS,
  title,
  subtitle,
}: BookingStepsProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-5">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center">
              {step.number < currentStep ? (
                // Completed step - clickable
                step.href ? (
                  <Link
                    href={step.href}
                    className="flex items-center gap-1 sm:gap-1.5 group"
                  >
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-400/90 text-white flex items-center justify-center text-xs sm:text-sm font-bold group-hover:bg-emerald-300 transition-colors">
                      ✓
                    </span>
                    <span className="hidden sm:inline text-xs font-medium text-emerald-200 group-hover:text-white transition-colors">
                      {step.label}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-400/90 text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                      ✓
                    </span>
                    <span className="hidden sm:inline text-xs font-medium text-emerald-200">
                      {step.label}
                    </span>
                  </div>
                )
              ) : step.number === currentStep ? (
                // Current step
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg shadow-emerald-800/30">
                    {step.number}
                  </span>
                  <span className="hidden sm:inline text-xs font-bold text-white">
                    {step.label}
                  </span>
                </div>
              ) : (
                // Future step
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 text-white/60 flex items-center justify-center text-xs sm:text-sm font-medium">
                    {step.number}
                  </span>
                  <span className="hidden sm:inline text-xs text-white/50">
                    {step.label}
                  </span>
                </div>
              )}

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 rounded-full ${
                    step.number < currentStep
                      ? "bg-emerald-400/70"
                      : "bg-white/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          {title || "Booking Lapangan"}
        </h1>
        {subtitle && (
          <p className="text-emerald-100 text-sm sm:text-base max-w-lg mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}