
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Server, Users, Activity, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useVPNApi } from '@/hooks/useVPNApi';

export const ServerStatusCard = () => {
  const [serverStatus, setServerStatus] = useState<'running' | 'stopped' | 'loading'>('loading');
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [uptime, setUptime] = useState<string>('');
  const { restartServices, getServerStatus } = useVPNApi();

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getServerStatus();
      setServerStatus(status.running ? 'running' : 'stopped');
      setActiveUsers(status.activeConnections);
      setTotalUsers(2); // vpnuser + vpnclient
      setUptime(status.uptime || '');
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [getServerStatus]);

  const handleRestartServer = async () => {
    setServerStatus('loading');
    const success = await restartServices();
    if (success) {
      setServerStatus('running');
    }
  };

  return (
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
                <RefreshCw className="h-4 w-4 animate-spin" />
                <Badge variant="outline">Loading</Badge>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            strongSwan & xl2tpd
          </p>
          {uptime && (
            <p className="text-xs text-muted-foreground">
              Uptime: {uptime}
            </p>
          )}
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
            {serverStatus === 'loading' ? 'Restarting...' : 'Restart Services'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
