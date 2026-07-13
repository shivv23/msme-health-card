import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
  padding?: boolean;
}

export default function Card({ children, className, hover = false, glow = false, padding = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-slate-900 border border-slate-800',
        padding && 'p-6',
        hover && 'transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/80',
        glow && 'glow-pulse',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
