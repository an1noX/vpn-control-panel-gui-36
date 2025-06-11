import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVPNApi } from '@/hooks/useVPNApi';

interface ServerConfigCardProps {
  serverConfig: {
    ip: string;
    ipsecPsk: string;
    defaultUser: string;
    defaultPassword: string;
  };
}

export const ServerConfigCard = ({ serverConfig }: ServerConfigCardProps) => {
  const { toast } = useToast();
  const { downloadConfigFile, checkFileExists } = useVPNApi();
  const [fileStatuses, setFileStatuses] = useState<{ [key: string]: boolean }>({});
  const [isCheckingFiles, setIsCheckingFiles] = useState(true);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} has been copied to clipboard.`,
    });
  };

  const configFiles = [
    { name: 'vpnclient.p12', label: 'Windows & Linux', description: 'PKCS#12 certificate' },
    { name: 'vpnclient.sswan', label: 'Android', description: 'strongSwan config' },
    { name: 'vpnclient.mobileconfig', label: 'iOS & macOS', description: 'Apple configuration profile' }
  ];

  useEffect(() => {
    const checkAllFiles = async () => {
      setIsCheckingFiles(true);
      const statuses: { [key: string]: boolean } = {};
      
      for (const file of configFiles) {
        const result = await checkFileExists(`/root/${file.name}`);
        statuses[file.name] = result.exists;
      }
      
      setFileStatuses(statuses);
      setIsCheckingFiles(false);
    };

    checkAllFiles();
  }, []);

  const handleDownload = async (filename: string) => {
    const success = await downloadConfigFile(filename);
    
    // Refresh file status after download attempt
    if (success) {
      const result = await checkFileExists(`/root/${filename}`);
      setFileStatuses(prev => ({
        ...prev,
        [filename]: result.exists
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Configuration</CardTitle>
        <CardDescription>
          Your Debian/Ubuntu IPsec/L2TP and IKEv2 VPN server details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* L2TP/IPsec Configuration */}
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">L2TP/IPsec Configuration:</h4>
                <Badge variant="outline">Debian/Ubuntu</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Server IP:</span>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono">{serverConfig.ip}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(serverConfig.ip, 'Server IP')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">IPsec PSK:</span>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono text-xs">{serverConfig.ipsecPsk}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(serverConfig.ipsecPsk, 'IPsec PSK')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Default User:</span>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono">{serverConfig.defaultUser}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(serverConfig.defaultUser, 'Username')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Default Password:</span>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono text-xs">{serverConfig.defaultPassword}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(serverConfig.defaultPassword, 'Password')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* IKEv2 Configuration */}
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">IKEv2 Configuration:</h4>
                <Badge variant="outline">Certificate-based</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Server Address:</span>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono">{serverConfig.ip}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(serverConfig.ip, 'Server Address')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Default Client:</span>
                  <code className="font-mono">vpnclient</code>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-medium text-xs mb-2">Configuration Files (/root/):</h5>
                <div className="space-y-2">
                  {isCheckingFiles ? (
                    <div className="text-xs text-muted-foreground">Checking file availability...</div>
                  ) : (
                    configFiles.map((file) => (
                      <div key={file.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-xs font-mono">{file.name}</div>
                          {fileStatuses[file.name] === false && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                          <div className="text-xs text-muted-foreground">{file.label}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(file.name)}
                          disabled={fileStatuses[file.name] === false}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
          <h4 className="font-medium mb-2 text-sm">Server Management Scripts:</h4>
          <div className="text-sm space-y-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
              <div><strong>/opt/src/addvpnuser.sh:</strong> Add/update VPN users</div>
              <div><strong>/opt/src/delvpnuser.sh:</strong> Delete VPN users</div>
              <div><strong>/opt/src/ikev2.sh:</strong> Generate IKEv2 configs</div>
              <div><strong>/root/setup.sh:</strong> Initial setup</div>
              <div><strong>/root/vpn.sh:</strong> Management script</div>
              <div><strong>/root/:</strong> Generated client configs</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
