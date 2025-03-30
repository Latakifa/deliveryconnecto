
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

// Format relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  return date.toLocaleDateString();
};
