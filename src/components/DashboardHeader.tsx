
import React from 'react';
import { Bell, User, Package, MessageCircle, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  activeView: string;
  userName?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ activeView, userName = "John Smith" }) => {
  return (
    <header className="bg-card border-b border-border p-4 flex items-center justify-between">
      {/* Mobile menu & logo */}
      <div className="flex items-center gap-4 md:hidden">
        <div className="relative h-8 w-8 overflow-hidden">
          <div className="absolute inset-0 bg-primary rounded-md opacity-20"></div>
          <Package className="absolute inset-0 m-auto h-5 w-5 text-primary" />
        </div>
        <div className="font-semibold text-lg tracking-tight">DeliveryConnect</div>
      </div>
      
      {/* Title */}
      <h1 className="text-xl font-semibold hidden md:block">
        {activeView === 'available' && 'Available Jobs'}
        {activeView === 'active' && 'Active Jobs'}
        {activeView === 'completed' && 'Completed Jobs'}
        {activeView === 'analytics' && 'Analytics'}
        {activeView === 'messages' && (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Messages</span>
          </div>
        )}
        {activeView === 'profile' && (
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>{userName}'s Profile</span>
          </div>
        )}
        {activeView === 'settings' && (
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>Account Settings</span>
          </div>
        )}
      </h1>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button className="h-9 w-9 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
          </button>
        </div>
        
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center md:hidden">
          <User className="h-5 w-5 text-primary" />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
