import { type ReactNode } from 'react';
import styles from './VibeTag.module.css';

type VibeTagVariant = 'default' | 'primary' | 'secondary' | 'accent';

interface VibeTagProps {
  children: ReactNode;
  variant?: VibeTagVariant;
  className?: string;
}

const variantClasses: Record<VibeTagVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-purple-100 text-purple-700',
  secondary: 'bg-blue-100 text-blue-700',
  accent: 'bg-pink-100 text-pink-700',
};

export function VibeTag({ 
  children, 
  variant = 'primary',
  className = '' 
}: VibeTagProps) {
  const variantClass = variantClasses[variant];
  
  return (
    <span 
      className={`${styles.vibeTag} ${variantClass} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
