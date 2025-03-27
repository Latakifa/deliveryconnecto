
// Format currency to Kenyan Shillings
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Convert package size strings to kilograms
export const formatPackageWeight = (packageSize: string | undefined | null): string => {
  if (!packageSize) {
    return 'Unknown size';
  }
  
  if (packageSize.includes('Small')) {
    return 'Small (under 2 kg)';
  } else if (packageSize.includes('Medium')) {
    return 'Medium (2-7 kg)';
  } else if (packageSize.includes('Large')) {
    return 'Large (7-14 kg)';
  } else if (packageSize.includes('Extra Large')) {
    return 'Extra Large (14+ kg)';
  }
  return packageSize;
};
