import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
export const Loader = ({ className, size = 24, variant = 'spinner' }) => {
    if (variant === 'skeleton') {
        return (<div className={cn('animate-pulse rounded-md bg-gray-200', className)} style={{ height: typeof size === 'number' ? size : undefined, width: '100%' }}/>);
    }
    return (<div className={cn('flex items-center justify-center', className)}>
      <Loader2 size={size} className="animate-spin text-[var(--color-brand-orange)]"/>
    </div>);
};
