
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, Network, Server, AlertTriangle, FileText, Copy } from 'lucide-react';
import { useVPNApi } from '@/hooks/useVPNApi';
import { useToast } from '@/hooks/use-toast';

export const AdvancedSettings = () => {
  const { restartServices } = useVPNApi();
  const { toast } = useToast();
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestartServices = async () => {
    setIsRestarting(true);
    await restartServices();
    setIsRestarting(false);
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: description,
    });
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>IPsec/L2TP Configuration</span>
          </CardTitle>
          <CardDescription>
            Core settings for IPsec/L2TP VPN on Debian/Ubuntu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">strongSwan Service</h4>
                <p className="text-xs text-muted-foreground">IPsec daemon for Debian/Ubuntu</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">xl2tpd Service</h4>
                <p className="text-xs text-muted-foreground">L2TP daemon for layer 2 tunneling</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </div>

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
            <Network className="h-5 w-5" />
            <span>Port Forwarding & Firewall</span>
          </CardTitle>
          <CardDescription>
            Network configuration for Debian/Ubuntu VPN server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Required Ports</h4>
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <span className="font-mono text-sm">UDP 500</span>
                  <p className="text-xs text-muted-foreground">IKE (Internet Key Exchange)</p>
                </div>
                <Badge variant="outline">Required</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <span className="font-mono text-sm">UDP 4500</span>
                  <p className="text-xs text-muted-foreground">IPsec NAT Traversal</p>
                </div>
                <Badge variant="outline">Required</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <span className="font-mono text-sm">UDP 1701</span>
                  <p className="text-xs text-muted-foreground">L2TP</p>
                </div>
                <Badge variant="outline">Required</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">UFW Commands</h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>ufw allow 500/udp</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('ufw allow 500/udp', 'UFW rule for IKE')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>ufw allow 4500/udp</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('ufw allow 4500/udp', 'UFW rule for NAT-T')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>ufw allow 1701/udp</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('ufw allow 1701/udp', 'UFW rule for L2TP')}
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
