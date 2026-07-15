import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
export const Card = forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]', className)} {...props}/>));
Card.displayName = 'Card';
