"use client";

import { useEffect, useState } from "react";

interface ATSScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  status?: string;
  scoreLabel?: string;
}

export default function ATSScoreCircle({
  score,
  size = 208,
  strokeWidth = 8,
  status,
  scoreLabel = "ATS compatibility",
}: ATSScoreCircleProps) {
  const clampedScore = Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const displayScore = String(clampedScore);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAnimatedScore(clampedScore));
    return () => window.cancelAnimationFrame(frame);
  }, [clampedScore]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full" style={{ maxWidth: `${size}px` }}>
        <svg
          viewBox="0 0 100 100"
          role="progressbar"
          aria-label={scoreLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedScore}
          aria-valuetext={`${displayScore}% ${scoreLabel}`}
          className="block h-auto w-full overflow-visible"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            transform="rotate(-90 50 50)"
            className="text-cream-dark"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - animatedScore / 100)}
            transform="rotate(-90 50 50)"
            className="text-olive transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
          />
          <text
            x="50"
            y="50"
            dominantBaseline="central"
            textAnchor="middle"
            className="fill-charcoal text-[1.45rem] font-semibold"
          >
            {displayScore}%
          </text>
        </svg>
      </div>
      {status && <p className="mt-2 text-base font-semibold text-charcoal">{status}</p>}
    </div>
  );
}
