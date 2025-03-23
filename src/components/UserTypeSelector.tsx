
import React from 'react';
import { cn } from '@/lib/utils';
import { Package, Truck } from 'lucide-react';

interface UserTypeSelectorProps {
  selectedType: 'business' | 'carrier' | null;
  onSelect: (type: 'business' | 'carrier') => void;
  className?: string;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ 
  selectedType, 
  onSelect,
  className 
}) => {
  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <h3 className="text-lg font-medium text-center mb-2">I am a...</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Option */}
        <button
          onClick={() => onSelect('business')}
          className={cn(
            "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200",
            selectedType === 'business'
              ? "border-primary/70 bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/30 hover:bg-primary/5"
          )}
        >
          <div 
            className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-all duration-200",
              selectedType === 'business'
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Package className="h-8 w-8" />
          </div>
          
          <h4 className="text-xl font-medium mb-2">Business</h4>
          <p className="text-center text-muted-foreground text-sm">
            I need deliveries for my products or services
          </p>
        </button>
        
        {/* Carrier Option */}
        <button
          onClick={() => onSelect('carrier')}
          className={cn(
            "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200",
            selectedType === 'carrier'
              ? "border-primary/70 bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/30 hover:bg-primary/5"
          )}
        >
          <div 
            className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-all duration-200",
              selectedType === 'carrier'
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Truck className="h-8 w-8" />
          </div>
          
          <h4 className="text-xl font-medium mb-2">Carrier</h4>
          <p className="text-center text-muted-foreground text-sm">
            I want to deliver packages and earn money
          </p>
        </button>
      </div>
    </div>
  );
};

export default UserTypeSelector;
