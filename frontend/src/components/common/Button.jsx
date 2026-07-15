import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
export const Button = forwardRef(({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (<button ref={ref} disabled={disabled || isLoading} className={cn('inline-flex items-center justify-center rounded-full font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', {
            'bg-[var(--color-brand-orange)] text-white hover:bg-[var(--color-brand-orange-hover)] shadow-sm hover:shadow-md': variant === 'primary',
            'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md': variant === 'secondary',
            'border-2 border-gray-900 bg-transparent text-gray-900 hover:bg-gray-100': variant === 'outline',
            'hover:bg-gray-100 text-gray-900': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-11 px-6 py-2.5 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
        }, className)} {...props}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
        {children}
      </button>);
});
Button.displayName = 'Button';
