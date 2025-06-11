
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, Server, AlertTriangle, RefreshCw } from 'lucide-react';
import { useVPNApi, ServerStatus } from '@/hooks/useVPNApi';
import { useToast } from '@/hooks/use-toast';
import { FileEditor } from '@/components/FileEditor';
import { IptablesManager } from '@/components/IptablesManager';
import { PortForwardingManager } from '@/components/PortForwardingManager';

export const AdvancedSettings = () => {
  const { restartServices, getServerStatus } = useVPNApi();
  const { toast } = useToast();
  const [isRestarting, setIsRestarting] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const loadServerStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const status = await getServerStatus();
      setServerStatus(status);
    } catch (error) {
      console.error('Failed to load server status:', error);
    }
    setIsLoadingStatus(false);
  };

  useEffect(() => {
    loadServerStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(loadServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRestartServices = async () => {
    setIsRestarting(true);
    await restartServices();
    // Reload status after restart
    setTimeout(loadServerStatus, 2000);
    setIsRestarting(false);
  };

  const getServiceStatus = (serviceName: keyof ServerStatus['services']) => {
    if (!serverStatus) return 'Unknown';
    return serverStatus.services[serviceName] ? 'Active' : 'Inactive';
  };

  const getServiceBadgeVariant = (serviceName: keyof ServerStatus['services']) => {
    if (!serverStatus) return 'secondary';
    return serverStatus.services[serviceName] ? 'default' : 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Advanced VPN Server Settings</span>
          </CardTitle>
          <CardDescription>
            Configure advanced IPsec/L2TP and IKEv2 settings for your VPN server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              onClick={handleRestartServices}
              disabled={isRestarting}
              variant="outline"
              className="h-20 flex flex-col"
            >
              <Server className="h-6 w-6 mb-2" />
              {isRestarting ? 'Restarting...' : 'Restart VPN Services'}
            </Button>
            <Button
              onClick={loadServerStatus}
              disabled={isLoadingStatus}
              variant="outline"
              className="h-20 flex flex-col"
            >
              <RefreshCw className={`h-6 w-6 mb-2 ${isLoadingStatus ? 'animate-spin' : ''}`} />
              {isLoadingStatus ? 'Loading...' : 'Refresh Status'}
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Service Status</span>
            </h4>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <div className="font-medium text-sm">strongSwan</div>
                  <div className="text-xs text-muted-foreground">IPsec daemon</div>
                </div>
                <Badge variant={getServiceBadgeVariant('strongswan')}>
                  {getServiceStatus('strongswan')}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <div className="font-medium text-sm">xl2tpd</div>
                  <div className="text-xs text-muted-foreground">L2TP daemon</div>
                </div>
                <Badge variant={getServiceBadgeVariant('xl2tpd')}>
                  {getServiceStatus('xl2tpd')}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <div className="font-medium text-sm">IPsec</div>
                  <div className="text-xs text-muted-foreground">Core IPsec</div>
                </div>
                <Badge variant={getServiceBadgeVariant('ipsec')}>
                  {getServiceStatus('ipsec')}
                </Badge>
              </div>
            </div>
          </div>

          {serverStatus && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Active Connections:</span>
                  <span className="font-medium">{serverStatus.activeConnections}</span>
                </div>
                {serverStatus.uptime && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="font-medium">{serverStatus.uptime}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <FileEditor />

      <IptablesManager />

      <PortForwardingManager />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Security Considerations</span>
          </CardTitle>
          <CardDescription>
            Important security settings for your VPN server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Change default PSK regularly for better security</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Use strong passwords for VPN users</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Consider certificate-based authentication for IKEv2</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Monitor VPN logs regularly using journalctl</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
