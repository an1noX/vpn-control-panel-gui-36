import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, Server } from 'lucide-react';
import { UserManagement } from '@/components/UserManagement';
import { ServerLogs } from '@/components/ServerLogs';
import { AdvancedSettings } from '@/components/AdvancedSettings';
import { ServerStatusCard } from '@/components/ServerStatusCard';
import { ServerConfigCard } from '@/components/ServerConfigCard';
import { BackendHelpDialog } from '@/components/BackendHelpDialog';

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'logs' | 'advanced'>('dashboard');

  // Server configuration from actual setup
  const serverConfig = {
    ip: '38.54.86.245',
    ipsecPsk: 'TqNA5MFSpguyarTNJN4Y',
    defaultUser: 'vpnuser',
    defaultPassword: '3ptEHfmJGk3ZaivU'
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <ServerStatusCard />
      
      <ServerConfigCard serverConfig={serverConfig} />

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your Debian/Ubuntu IPsec/L2TP and IKEv2 VPN server
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
              onClick={() => setCurrentView('advanced')}
              className="h-20 flex flex-col"
            >
              <Server className="h-6 w-6 mb-2" />
              Advanced Settings
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
              <h1 className="text-3xl font-bold">Debian/Ubuntu VPN Server Dashboard</h1>
              <p className="text-muted-foreground">Manage your IPsec/L2TP and IKEv2 VPN server</p>
            </div>
            <div className="flex items-center space-x-4">
              <BackendHelpDialog />
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
