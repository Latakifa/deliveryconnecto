
import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AnimatedButton from '@/components/AnimatedButton';

interface SearchFilterBarProps {
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userType: 'business' | 'carrier';
  setShowNewJobModal: (show: boolean) => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  handleSearchChange,
  userType,
  setShowNewJobModal
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2"
        />
      </div>
      
      <div className="flex gap-3">
        <AnimatedButton
          variant="outline"
          size="sm"
          icon={<Filter className="h-4 w-4" />}
          iconPosition="left"
        >
          Filter
        </AnimatedButton>
        
        {userType === 'business' && (
          <AnimatedButton
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            iconPosition="left"
            onClick={() => setShowNewJobModal(true)}
          >
            Create Job
          </AnimatedButton>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
