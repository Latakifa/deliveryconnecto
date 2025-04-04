
import React from 'react';
import AnimatedButton from '@/components/AnimatedButton';

interface FormActionsProps {
  onCancel: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel }) => {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <AnimatedButton
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </AnimatedButton>
      <AnimatedButton
        type="submit"
        variant="primary"
      >
        Create Job
      </AnimatedButton>
    </div>
  );
};

export default FormActions;
