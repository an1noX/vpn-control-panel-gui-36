
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useVPNApi, FileCheckResult } from '@/hooks/useVPNApi';
import { useToast } from '@/hooks/use-toast';

export const ConfigFileChecker = () => {
  const { checkConfigurationFiles } = useVPNApi();
  const { toast } = useToast();
  const [fileChecks, setFileChecks] = useState<{ [key: string]: FileCheckResult }>({});
  const [isChecking, setIsChecking] = useState(false);

  const checkFiles = async () => {
    setIsChecking(true);
    try {
      const results = await checkConfigurationFiles();
      setFileChecks(results);
      
      const missingFiles = Object.entries(results).filter(([_, result]) => !result.exists);
      if (missingFiles.length > 0) {
        toast({
          title: "Missing Configuration Files",
          description: `${missingFiles.length} configuration files are missing`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Configuration Check Complete",
          description: "All configuration files are present",
        });
      }
    } catch (error) {
      toast({
        title: "Check Failed",
        description: "Unable to verify configuration files",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkFiles();
  }, []);

  const getFileDisplayName = (path: string) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  const getFileDescription = (path: string) => {
    const descriptions: { [key: string]: string } = {
      '/etc/ipsec.conf': 'IPsec main configuration',
      '/etc/ipsec.secrets': 'IPsec pre-shared keys and certificates',
      '/etc/xl2tpd/xl2tpd.conf': 'L2TP daemon configuration',
      '/opt/src/addvpnuser.sh': 'User addition script',
      '/opt/src/delvpnuser.sh': 'User deletion script',
      '/opt/src/ikev2.sh': 'IKEv2 configuration generator'
    };
    return descriptions[path] || 'Configuration file';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Configuration File Status</span>
        </CardTitle>
        <CardDescription>
          Verify that all required VPN configuration files exist on the server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Last checked: {Object.keys(fileChecks).length > 0 ? 'Just now' : 'Not checked'}
          </div>
          <Button
            onClick={checkFiles}
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Files'}
          </Button>
        </div>

        <div className="space-y-3">
          {Object.entries(fileChecks).map(([path, result]) => (
            <div key={path} className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center space-x-3">
                {result.exists ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <div className="font-mono text-sm">{path}</div>
                  <div className="text-xs text-muted-foreground">
                    {getFileDescription(path)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={result.exists ? "default" : "destructive"}
                  className={result.exists ? "bg-green-100 text-green-800 border-green-200" : ""}
                >
                  {result.exists ? 'Found' : 'Missing'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(fileChecks).length === 0 && !isChecking && (
          <div className="text-center py-6 text-muted-foreground">
            Click "Check Files" to verify configuration file status
          </div>
        )}

        {Object.values(fileChecks).some(result => !result.exists) && (
          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Missing Files Detected</h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              Some configuration files are missing. Please ensure your VPN server is properly installed and configured.
              Missing files may cause VPN functionality to not work correctly.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
