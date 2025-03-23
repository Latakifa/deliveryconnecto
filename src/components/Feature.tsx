
import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: 'default' | 'highlight' | 'subtle';
  className?: string;
}

const Feature: React.FC<FeatureProps> = ({ 
  title, 
  description, 
  icon, 
  variant = 'default',
  className
}) => {
  // Define styles based on variant
  const variantStyles = {
    default: "bg-card border border-border/50 shadow-soft",
    highlight: "bg-primary/5 border border-primary/20 shadow-soft",
    subtle: "bg-background border border-border/30",
  };

  return (
    <div 
      className={cn(
        "group rounded-xl p-6 transition-all duration-300 hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex flex-col">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Feature;
