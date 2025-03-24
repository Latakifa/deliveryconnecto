
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, Shield, Users, Package, Settings, MapPin, 
  ChevronDown, ChevronUp, Search, X, Plus, Trash2 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface UserProfile {
  id: string;
  full_name: string | null;
  user_type: 'business' | 'carrier' | null;
  avatar_url: string | null;
  created_at: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    businessUsers: 0,
    carrierUsers: 0,
    activeDeliveries: 0
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        toast.error('You must be logged in to access the admin dashboard');
        navigate('/auth');
        return;
      }
      
      // For demo purposes, we'll allow any user to access admin
      // In a real app, you'd check for admin role in the user's profile
      const isAdmin = true;
      
      if (!isAdmin) {
        toast.error('You do not have admin privileges');
        navigate('/dashboard');
      }
    };
    
    checkAdmin();
  }, [user, navigate]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      
      try {
        // In a real app, this would fetch from Supabase
        // For demo, generate random user data
        const mockUsers: UserProfile[] = Array.from({ length: 15 }, (_, i) => ({
          id: `user-${i + 1}`,
          full_name: `User ${i + 1}`,
          user_type: i % 3 === 0 ? 'business' : 'carrier',
          avatar_url: null,
          created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          email: `user${i + 1}@example.com`
        }));
        
        setUsers(mockUsers);
        
        // Update stats
        setStats({
          totalUsers: mockUsers.length,
          businessUsers: mockUsers.filter(u => u.user_type === 'business').length,
          carrierUsers: mockUsers.filter(u => u.user_type === 'carrier').length,
          activeDeliveries: Math.floor(Math.random() * 20)
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.user_type?.toLowerCase().includes(query)
    );
  });

  const handleDeleteUser = (userId: string) => {
    toast.error('User deletion is disabled in this demo');
  };

  const handleAddUser = () => {
    toast.info('User creation form would open here');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-6 min-h-screen">
        {/* Sidebar */}
        <div className="col-span-1 bg-card border-r border-border p-4">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="font-semibold">Admin Panel</div>
          </div>
          
          <nav className="space-y-2">
            <button
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'users' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-5 w-5" />
              <span>Users</span>
            </button>
            
            <button
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'deliveries' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              onClick={() => setActiveTab('deliveries')}
            >
              <Package className="h-5 w-5" />
              <span>Deliveries</span>
            </button>
            
            <button
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>
          
          <div className="absolute bottom-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              Return to App
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="col-span-5 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, deliveries, and system settings</p>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Business Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.businessUsers}</div>
                <p className="text-xs text-muted-foreground">+1 from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Carrier Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.carrierUsers}</div>
                <p className="text-xs text-muted-foreground">+2 from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
                <p className="text-xs text-muted-foreground">+5 from yesterday</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Users tab content */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <button 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <Button onClick={handleAddUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>User Type</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            {user.full_name || 'Unnamed User'}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.user_type === 'business' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.user_type || 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Deliveries tab content */}
          {activeTab === 'deliveries' && (
            <div className="text-center py-20">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Delivery Management</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                This section will allow you to manage all deliveries in the system, track performance, and generate reports.
              </p>
              <Button>Set Up Delivery Management</Button>
            </div>
          )}
          
          {/* Settings tab content */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure global system settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable User Registration</p>
                      <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Require Email Verification</p>
                      <p className="text-sm text-muted-foreground">Users must verify email before accessing the system</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Carrier Tracking</p>
                      <p className="text-sm text-muted-foreground">Allow real-time tracking of carriers during deliveries</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Manage API integrations and keys</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Mapbox API Key</label>
                    <div className="flex mt-1">
                      <Input 
                        type="password" 
                        defaultValue="pk.eyJ1IjoiZGVtby1hY2NvdW50LWxvdmFibGUiLCJhIjoiY2x3eHF1dmFrMGNpMjJqbnhqcnllaXcyciJ9"
                        className="rounded-r-none"
                      />
                      <Button variant="outline" className="rounded-l-none">Update</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Used for maps and location services</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Stripe API Key</label>
                    <div className="flex mt-1">
                      <Input 
                        type="password" 
                        defaultValue=""
                        placeholder="Not configured"
                        className="rounded-r-none"
                      />
                      <Button variant="outline" className="rounded-l-none">Add</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Used for payment processing</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
