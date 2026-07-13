import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

export default function ScoreGauge({ score, size = 200, label }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = size * 0.38;
  const strokeWidth = size * 0.08;
  const circumference = Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 70) return '#10b981';
    if (s >= 40) return '#f59e0b';
    return '#f43f5e';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.6 }}>
        <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.55}`}>
          <path
            d={`M ${strokeWidth / 2 + 4} ${size * 0.5} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 4} ${size * 0.5}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={`M ${strokeWidth / 2 + 4} ${size * 0.5} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 4} ${size * 0.5}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-4xl font-bold" style={{ color }}>
            {animatedScore}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">out of 100</span>
        </div>
      </div>
      {label && <p className="text-sm text-slate-400 mt-2 font-medium">{label}</p>}
    </div>
  );
}
