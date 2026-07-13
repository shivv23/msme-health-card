import React from 'react';
import { cn, getRiskCategory } from '../../lib/utils';
import type { HealthScore } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'red' | 'slate' | 'blue';
  className?: string;
}

const variantStyles: Record<string, string> = {
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  red: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

export default function Badge({ children, variant = 'slate', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function RiskBadge({ score }: { score: number }) {
  const cat = getRiskCategory(score);
  const variant = cat === 'GREEN' ? 'green' : cat === 'AMBER' ? 'amber' : 'red';
  return <Badge variant={variant}>{cat}</Badge>;
}
