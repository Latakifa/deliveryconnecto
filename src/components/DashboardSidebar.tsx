
import React from 'react';
import { Package, Truck, User, LogOut, BarChart, MessageCircle, Settings, Clock } from 'lucide-react';
import AnimatedButton from '@/components/AnimatedButton';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  userType: 'business' | 'carrier';
  toggleUserType: () => void;
  handleLogout: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeView,
  setActiveView,
  userType,
  toggleUserType,
  handleLogout
}) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-2">
        <div className="relative h-8 w-8 overflow-hidden">
          <div className="absolute inset-0 bg-primary rounded-md opacity-20"></div>
          <Package className="absolute inset-0 m-auto h-5 w-5 text-primary" />
        </div>
        <div className="font-semibold text-lg tracking-tight">DeliveryConnect</div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setActiveView('available')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            activeView === 'available'
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Package className="h-5 w-5" />
          <span>Available Jobs</span>
        </button>
        
        <button
          onClick={() => setActiveView('active')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            activeView === 'active'
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Truck className="h-5 w-5" />
          <span>Active Jobs</span>
        </button>
        
        <button
          onClick={() => setActiveView('completed')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            activeView === 'completed'
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Clock className="h-5 w-5" />
          <span>Completed Jobs</span>
        </button>
        
        <button
          onClick={() => setActiveView('analytics')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            activeView === 'analytics'
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <BarChart className="h-5 w-5" />
          <span>Analytics</span>
        </button>
        
        <button
          onClick={() => setActiveView('messages')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            activeView === 'messages'
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <MessageCircle className="h-5 w-5" />
          <span>Messages</span>
        </button>
        
        <button
          onClick={() => setActiveView('profile')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            activeView === 'profile'
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </button>
        
        <button
          onClick={() => setActiveView('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            activeView === 'settings'
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </nav>
      
      {/* User info and logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">John Smith</p>
            <p className="text-xs text-muted-foreground capitalize">{userType}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            className="w-full"
            onClick={toggleUserType}
          >
            Switch View
          </AnimatedButton>
          
          <AnimatedButton
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
            onClick={handleLogout}
            icon={<LogOut className="h-4 w-4" />}
            aria-label="Log out"
          />
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
