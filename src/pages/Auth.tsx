
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import AnimatedButton from '@/components/AnimatedButton';
import UserTypeSelector from '@/components/UserTypeSelector';
import { ArrowLeft, Eye, EyeOff, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AuthData {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
  userType?: 'business' | 'carrier';
}

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isRegister = searchParams.get('register') === 'true';
  const roleParam = searchParams.get('role') as 'business' | 'carrier' | null;
  
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    userType: roleParam || undefined,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(roleParam ? 2 : 1);
  const navigate = useNavigate();

  // Set page title based on current mode
  useEffect(() => {
    document.title = isRegister ? 'Sign Up - DeliveryConnect' : 'Log In - DeliveryConnect';
  }, [isRegister]);

  // Reset form when switching between login and register
  useEffect(() => {
    setAuthData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      userType: roleParam || undefined,
    });
    setStep(roleParam ? 2 : 1);
  }, [isRegister, roleParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthData({ ...authData, [name]: value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const selectUserType = (type: 'business' | 'carrier') => {
    setAuthData({ ...authData, userType: type });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      // Validation for registration
      if (!authData.email || !authData.password || !authData.confirmPassword || !authData.name) {
        toast.error('Please fill out all fields');
        return;
      }
      
      if (authData.password !== authData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (!authData.userType) {
        toast.error('Please select your user type');
        return;
      }
    } else {
      // Validation for login
      if (!authData.email || !authData.password) {
        toast.error('Please fill out all fields');
        return;
      }
    }
    
    setLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success handling
      toast.success(isRegister ? 'Account created successfully!' : 'Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-30 -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full filter blur-3xl -z-10"></div>
      
      <div className="w-full max-w-md">
        {/* Logo and back link */}
        <div className="mb-8 flex items-start justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground group">
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Back to Home</span>
          </Link>
          
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <div className="relative h-8 w-8 overflow-hidden">
              <div className="absolute inset-0 bg-primary rounded-md opacity-20"></div>
              <Package className="absolute inset-0 m-auto h-5 w-5 text-primary" />
            </div>
            <div className="font-semibold text-lg tracking-tight">DeliveryConnect</div>
          </Link>
        </div>
        
        {/* Auth card */}
        <div className="neo-card overflow-hidden p-8 animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isRegister 
                ? 'Sign up to get started with DeliveryConnect' 
                : 'Log in to your DeliveryConnect account'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: User Type Selection (Only for Register) */}
            {isRegister && step === 1 && (
              <UserTypeSelector 
                selectedType={authData.userType || null} 
                onSelect={selectUserType} 
                className="mb-6"
              />
            )}
            
            {/* Step 2: Auth Information */}
            {(!isRegister || step === 2) && (
              <>
                {/* Name field (Register only) */}
                {isRegister && (
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={authData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}
                
                {/* Email field */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={authData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                {/* Password field */}
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={authData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Confirm Password field (Register only) */}
                {isRegister && (
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={authData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Submit button */}
            {(!isRegister || step === 2) && (
              <AnimatedButton 
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mb-4"
                isLoading={loading}
              >
                {isRegister ? 'Create Account' : 'Log In'}
              </AnimatedButton>
            )}
            
            {/* Go back button (Register step 2) */}
            {isRegister && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                ← Go back to user type selection
              </button>
            )}
            
            {/* Switch between login and register */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                {' '}
                <Link 
                  to={isRegister ? '/auth' : '/auth?register=true'}
                  className="text-primary hover:underline"
                >
                  {isRegister ? 'Log in' : 'Sign up'}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
