
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AnimatedButton from './AnimatedButton';
import { Menu, X, Package, Truck, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Update scrolled state based on window scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const navLinks = [
    { name: 'Features', path: '/#features' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'About Us', path: '/#about' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect is handled in AuthContext
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md py-3 shadow-sm' 
          : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-foreground"
          aria-label="DeliveryConnect Home"
        >
          <div className="relative h-10 w-10 overflow-hidden">
            <div className="absolute inset-0 bg-primary rounded-md opacity-20 animate-pulse-light"></div>
            <Package className="absolute inset-0 m-auto h-6 w-6 text-primary" />
          </div>
          <div className="font-semibold text-xl tracking-tight">DeliveryConnect</div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        
        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <AnimatedButton 
                  variant="ghost" 
                  size="sm"
                >
                  Dashboard
                </AnimatedButton>
              </Link>
              <AnimatedButton 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                icon={<LogOut className="h-4 w-4" />}
              >
                Log Out
              </AnimatedButton>
            </>
          ) : (
            <>
              <Link to="/auth">
                <AnimatedButton 
                  variant="ghost" 
                  size="sm"
                >
                  Log In
                </AnimatedButton>
              </Link>
              <Link to="/auth?register=true">
                <AnimatedButton 
                  variant="primary" 
                  size="sm"
                  className="animate-fade-in"
                >
                  Get Started
                </AnimatedButton>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center text-foreground p-2"
          aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {isMobileMenuOpen ? (
            <X size={24} className="animate-fade-in" />
          ) : (
            <Menu size={24} className="animate-fade-in" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm shadow-md animate-slide-down">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path}
                  className="text-foreground py-2 px-4 hover:bg-accent rounded-md transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-2 mt-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="w-full">
                    <AnimatedButton 
                      variant="outline" 
                      size="md"
                      className="w-full"
                    >
                      Dashboard
                    </AnimatedButton>
                  </Link>
                  <AnimatedButton 
                    variant="secondary" 
                    size="md"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Log Out
                  </AnimatedButton>
                </>
              ) : (
                <>
                  <Link to="/auth" className="w-full">
                    <AnimatedButton 
                      variant="outline" 
                      size="md"
                      className="w-full"
                    >
                      Log In
                    </AnimatedButton>
                  </Link>
                  <Link to="/auth?register=true" className="w-full">
                    <AnimatedButton 
                      variant="primary" 
                      size="md"
                      className="w-full"
                    >
                      Get Started
                    </AnimatedButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
