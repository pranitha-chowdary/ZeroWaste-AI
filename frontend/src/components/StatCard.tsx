import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  color?: string;
  animate?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'orange',
  animate = true
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Safely handle value conversion and NaN/undefined/null cases
  let numericValue: number;
  if (value === null || value === undefined) {
    numericValue = 0;
  } else if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/\D/g, ''));
    numericValue = isNaN(parsed) ? 0 : parsed;
  } else {
    numericValue = isNaN(value) ? 0 : value;
  }

  useEffect(() => {
    if (animate && typeof numericValue === 'number') {
      let start = 0;
      const increment = numericValue / 30;
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 30);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(numericValue);
    }
  }, [numericValue, animate]);

  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
  };

  const iconColorClasses = {
    orange: 'text-orange-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500'
  };

  // Safe display value
  const safeDisplayValue = (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) 
    ? 0 
    : value;

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses] || colorClasses.orange} backdrop-blur-xl border rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-300 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-1">
            {animate && typeof numericValue === 'number' && !isNaN(numericValue) ? displayValue : safeDisplayValue}
          </h3>
          {subtitle && (
            <p className="text-gray-400 text-xs">{subtitle}</p>
          )}
          {trend && (
            <p className="text-green-400 text-sm mt-2 font-medium">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-white/10 ${iconColorClasses[color as keyof typeof iconColorClasses] || iconColorClasses.orange}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
