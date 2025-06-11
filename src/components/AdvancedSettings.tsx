
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, Network, Server, AlertTriangle, FileText, Copy, RefreshCw } from 'lucide-react';
import { useVPNApi, ServerStatus } from '@/hooks/useVPNApi';
import { useToast } from '@/hooks/use-toast';
import { ConfigFileChecker } from '@/components/ConfigFileChecker';
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

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: description,
    });
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
            <span>Advanced Debian/Ubuntu VPN Settings</span>
          </CardTitle>
          <CardDescription>
            Configure advanced IPsec/L2TP and IKEv2 settings for your Debian/Ubuntu server
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
              variant="outline"
              onClick={() => copyToClipboard('sudo systemctl status strongswan xl2tpd', 'Status check command')}
              className="h-20 flex flex-col"
            >
              <Shield className="h-6 w-6 mb-2" />
              Check Service Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <FileEditor />

      <IptablesManager />

      <PortForwardingManager />

      <ConfigFileChecker />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>IPsec/L2TP Configuration</span>
              </CardTitle>
              <CardDescription>
                Live status of IPsec/L2TP VPN services on Debian/Ubuntu
              </CardDescription>
            </div>
            <Button
              onClick={loadServerStatus}
              disabled={isLoadingStatus}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStatus ? 'animate-spin' : ''}`} />
              {isLoadingStatus ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">strongSwan Service</h4>
                <p className="text-xs text-muted-foreground">IPsec daemon for Debian/Ubuntu</p>
              </div>
              <Badge variant={getServiceBadgeVariant('strongswan')}>
                {getServiceStatus('strongswan')}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">xl2tpd Service</h4>
                <p className="text-xs text-muted-foreground">L2TP daemon for layer 2 tunneling</p>
              </div>
              <Badge variant={getServiceBadgeVariant('xl2tpd')}>
                {getServiceStatus('xl2tpd')}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">IPsec Service</h4>
                <p className="text-xs text-muted-foreground">Core IPsec functionality</p>
              </div>
              <Badge variant={getServiceBadgeVariant('ipsec')}>
                {getServiceStatus('ipsec')}
              </Badge>
            </div>
          </div>

          {serverStatus && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Server Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Active Connections:</span>
                    <span className="ml-2 font-medium">{serverStatus.activeConnections}</span>
                  </div>
                  {serverStatus.uptime && (
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="ml-2 font-medium">{serverStatus.uptime}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Configuration Files</h4>
            <div className="grid gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>/etc/ipsec.conf</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('/etc/ipsec.conf', 'IPsec configuration path')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>/etc/ipsec.secrets</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('/etc/ipsec.secrets', 'IPsec secrets path')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>/etc/xl2tpd/xl2tpd.conf</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('/etc/xl2tpd/xl2tpd.conf', 'xl2tpd configuration path')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Security Considerations</span>
          </CardTitle>
          <CardDescription>
            Important security settings for your Debian/Ubuntu VPN
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
