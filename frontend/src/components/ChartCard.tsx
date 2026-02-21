import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  subtitle?: string;
}

export default function ChartCard({ title, children, subtitle }: ChartCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {subtitle && (
          <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
