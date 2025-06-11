import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Server, Users, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { UserManagement } from '@/components/UserManagement';
import { ServerLogs } from '@/components/ServerLogs';
import { AdvancedSettings } from '@/components/AdvancedSettings';

const Index = () => {
  const [serverStatus, setServerStatus] = useState<'running' | 'stopped' | 'loading'>('loading');
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'logs' | 'advanced'>('dashboard');
  const { toast } = useToast();

  // Mock API calls - replace with actual backend calls
  useEffect(() => {
    // Simulate fetching server status
    setTimeout(() => {
      setServerStatus('running');
      setActiveUsers(3);
      setTotalUsers(7);
    }, 1000);
  }, []);

  const handleRestartServer = async () => {
    setServerStatus('loading');
    toast({
      title: "Restarting VPN Server",
      description: "Please wait while the server restarts...",
    });

    // Mock restart - replace with actual API call
    setTimeout(() => {
      setServerStatus('running');
      toast({
        title: "Server Restarted",
        description: "VPN server has been successfully restarted.",
      });
    }, 3000);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {serverStatus === 'running' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="default" className="bg-green-500">Running</Badge>
                </>
              )}
              {serverStatus === 'stopped' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Stopped</Badge>
                </>
              )}
              {serverStatus === 'loading' && (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <Badge variant="outline">Loading</Badge>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              xl2tpd service
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently connected users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Configured VPN users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRestartServer}
              disabled={serverStatus === 'loading'}
              className="w-full"
            >
              {serverStatus === 'loading' ? 'Restarting...' : 'Restart Server'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your L2TP/IPsec VPN server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('users')}
              className="h-20 flex flex-col"
            >
              <Users className="h-6 w-6 mb-2" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('logs')}
              className="h-20 flex flex-col"
            >
              <Activity className="h-6 w-6 mb-2" />
              View Logs
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRestartServer}
              className="h-20 flex flex-col"
              disabled={serverStatus === 'loading'}
            >
              <Server className="h-6 w-6 mb-2" />
              Restart Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">VPN Server Dashboard</h1>
              <p className="text-muted-foreground">Manage your L2TP/IPsec VPN server</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={currentView === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setCurrentView('dashboard')}
              >
                Dashboard
              </Button>
              <Button 
                variant={currentView === 'users' ? 'default' : 'outline'}
                onClick={() => setCurrentView('users')}
              >
                Users
              </Button>
              <Button 
                variant={currentView === 'logs' ? 'default' : 'outline'}
                onClick={() => setCurrentView('logs')}
              >
                Logs
              </Button>
              <Button 
                variant={currentView === 'advanced' ? 'default' : 'outline'}
                onClick={() => setCurrentView('advanced')}
              >
                Advanced
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'users' && <UserManagement />}
        {currentView === 'logs' && <ServerLogs />}
        {currentView === 'advanced' && <AdvancedSettings />}
      </div>
    </div>
  );
};

export default Index;
