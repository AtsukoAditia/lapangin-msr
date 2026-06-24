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
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Step Indicators — circle on top, label below */}
        <div className="flex items-start justify-center mb-6">
          {steps.map((step, i) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            const circleClass = isCompleted
              ? "bg-emerald-400 text-white"
              : isCurrent
                ? "bg-white text-emerald-700 shadow-lg"
                : "bg-white/20 text-white/50";

            const labelClass = isCompleted
              ? "text-emerald-200"
              : isCurrent
                ? "text-white font-semibold"
                : "text-white/40";

            const circleContent = isCompleted ? "✓" : step.number;

            return (
              <div key={step.number} className="flex items-center">
                {/* Step: circle + label stacked vertically */}
                <div className="flex flex-col items-center">
                  {isCompleted && step.href ? (
                    <Link
                      href={step.href}
                      className="flex flex-col items-center group"
                    >
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${circleClass} group-hover:scale-110`}
                      >
                        {circleContent}
                      </span>
                      <span
                        className={`mt-1.5 text-[10px] sm:text-xs transition-colors ${labelClass} group-hover:text-white`}
                      >
                        {step.label}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${circleClass}`}
                      >
                        {circleContent}
                      </span>
                      <span
                        className={`mt-1.5 text-[10px] sm:text-xs ${labelClass}`}
                      >
                        {step.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className={`w-6 sm:w-14 h-0.5 mt-[-10px] mx-1 sm:mx-2 rounded-full ${
                      step.number < currentStep
                        ? "bg-emerald-400/70"
                        : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Title */}
        {title && (
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-emerald-100 text-sm sm:text-base max-w-lg mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}