
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Trash2, AlertTriangle, Network } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PortForwardRule {
  id: string;
  serverPort: number;
  clientIP: string;
  clientPort: number;
  protocol: 'tcp' | 'udp';
  description?: string;
  status: 'active' | 'inactive';
}

export const AdvancedSettings = () => {
  const [portForwardRules, setPortForwardRules] = useState<PortForwardRule[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    serverPort: '',
    clientIP: '',
    clientPort: '',
    protocol: 'tcp' as 'tcp' | 'udp',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockRules: PortForwardRule[] = [
      {
        id: '1',
        serverPort: 443,
        clientIP: '192.168.42.10',
        clientPort: 443,
        protocol: 'tcp',
        description: 'HTTPS to john_doe client',
        status: 'active'
      },
      {
        id: '2',
        serverPort: 123,
        clientIP: '192.168.43.10',
        clientPort: 123,
        protocol: 'udp',
        description: 'NTP to alice_brown client',
        status: 'active'
      }
    ];
    setPortForwardRules(mockRules);
  }, []);

  const validateRule = () => {
    if (!newRule.serverPort || !newRule.clientIP || !newRule.clientPort) {
      return "Server port, client IP, and client port are required.";
    }

    const serverPort = parseInt(newRule.serverPort);
    const clientPort = parseInt(newRule.clientPort);

    if (serverPort < 1 || serverPort > 65535 || clientPort < 1 || clientPort > 65535) {
      return "Ports must be between 1 and 65535.";
    }

    // Basic IP validation
    const ipRegex = /^192\.168\.(42|43)\.\d{1,3}$/;
    if (!ipRegex.test(newRule.clientIP)) {
      return "Client IP must be in VPN range (192.168.42.x for L2TP or 192.168.43.x for IKEv2).";
    }

    // Check for duplicate rules
    const duplicate = portForwardRules.find(rule => 
      rule.serverPort === serverPort && rule.protocol === newRule.protocol
    );
    if (duplicate) {
      return "A rule for this server port and protocol already exists.";
    }

    return null;
  };

  const handleAddRule = async () => {
    const validationError = validateRule();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Mock API call - replace with actual backend call
    setTimeout(() => {
      const newPortForwardRule: PortForwardRule = {
        id: Date.now().toString(),
        serverPort: parseInt(newRule.serverPort),
        clientIP: newRule.clientIP,
        clientPort: parseInt(newRule.clientPort),
        protocol: newRule.protocol,
        description: newRule.description || undefined,
        status: 'active'
      };

      setPortForwardRules(prev => [...prev, newPortForwardRule]);
      
      toast({
        title: "Port Forward Rule Added",
        description: `Port ${newRule.serverPort} (${newRule.protocol.toUpperCase()}) forwarded to ${newRule.clientIP}:${newRule.clientPort}`,
      });

      setNewRule({
        serverPort: '',
        clientIP: '',
        clientPort: '',
        protocol: 'tcp',
        description: ''
      });
      setShowAddDialog(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleDeleteRule = async (ruleId: string, rule: PortForwardRule) => {
    if (!confirm(`Remove port forwarding rule for port ${rule.serverPort} (${rule.protocol.toUpperCase()})?`)) {
      return;
    }

    // Mock API call - replace with actual backend call
    setTimeout(() => {
      setPortForwardRules(prev => prev.filter(r => r.id !== ruleId));
      toast({
        title: "Port Forward Rule Removed",
        description: `Port forwarding rule for port ${rule.serverPort} has been removed.`,
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Advanced Settings</span>
              </CardTitle>
              <CardDescription>
                Configure advanced VPN server settings and port forwarding
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Port Forwarding Rules</span>
              </CardTitle>
              <CardDescription>
                Forward ports from the VPN server to connected clients
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Port Forwarding Rule</DialogTitle>
                  <DialogDescription>
                    Forward a port on the VPN server to a connected VPN client.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serverPort">Server Port</Label>
                      <Input
                        id="serverPort"
                        type="number"
                        value={newRule.serverPort}
                        onChange={(e) => setNewRule(prev => ({ ...prev, serverPort: e.target.value }))}
                        placeholder="e.g., 443"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protocol">Protocol</Label>
                      <Select value={newRule.protocol} onValueChange={(value: 'tcp' | 'udp') => setNewRule(prev => ({ ...prev, protocol: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="udp">UDP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientIP">Client IP</Label>
                      <Input
                        id="clientIP"
                        value={newRule.clientIP}
                        onChange={(e) => setNewRule(prev => ({ ...prev, clientIP: e.target.value }))}
                        placeholder="192.168.42.10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPort">Client Port</Label>
                      <Input
                        id="clientPort"
                        type="number"
                        value={newRule.clientPort}
                        onChange={(e) => setNewRule(prev => ({ ...prev, clientPort: e.target.value }))}
                        placeholder="443"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={newRule.description}
                      onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., HTTPS for web server"
                    />
                  </div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Security Warning</AlertTitle>
                    <AlertDescription>
                      Port forwarding exposes client ports to the Internet. Only use if required for your use case.
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleAddRule}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Rule'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server Port</TableHead>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Client IP</TableHead>
                  <TableHead>Client Port</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portForwardRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.serverPort}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.protocol.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{rule.clientIP}</TableCell>
                    <TableCell>{rule.clientPort}</TableCell>
                    <TableCell>{rule.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                        {rule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id, rule)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {portForwardRules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No port forwarding rules configured.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Port Forwarding Information</CardTitle>
          <CardDescription>
            How port forwarding works with your VPN setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">VPN Client IP Ranges:</h4>
              <div className="space-y-1 text-sm">
                <p><strong>L2TP/IPsec clients:</strong> 192.168.42.x</p>
                <p><strong>IKEv2/IPsec clients:</strong> 192.168.43.x</p>
                <p><strong>Note:</strong> IP assignments are dynamic. Check client connection status for current IP.</p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <h4 className="font-medium text-orange-800">Security Considerations</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
                <li>Port forwarding exposes client services to the Internet</li>
                <li>Ensure client firewalls allow forwarded traffic</li>
                <li>Only forward ports that are absolutely necessary</li>
                <li>Consider using VPN for access instead of port forwarding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
