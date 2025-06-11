
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Network, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useVPNApi } from '@/hooks/useVPNApi';

interface PortForwardingRule {
  id: string;
  port: string;
  protocol: 'tcp' | 'udp';
  action: 'allow' | 'deny';
  description: string;
  enabled: boolean;
}

export const PortForwardingManager = () => {
  const [rules, setRules] = useState<PortForwardingRule[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    port: '',
    protocol: 'tcp' as 'tcp' | 'udp',
    action: 'allow' as 'allow' | 'deny',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addIptablesRule, removeIptablesRule, getIptablesRules } = useVPNApi();

  // Load existing rules
  const loadRules = async () => {
    try {
      const iptablesRules = await getIptablesRules();
      
      // Convert iptables rules to our format
      const portRules: PortForwardingRule[] = iptablesRules
        .filter(rule => rule.rule.includes('dport') || rule.rule.includes('sport'))
        .map(rule => ({
          id: rule.id,
          port: extractPortFromRule(rule.rule),
          protocol: rule.rule.includes('tcp') ? 'tcp' : 'udp',
          action: rule.rule.includes('ACCEPT') ? 'allow' : 'deny',
          description: `${rule.chain} chain rule`,
          enabled: rule.enabled
        }));

      setRules(portRules);
    } catch (error) {
      console.error('Failed to load port forwarding rules:', error);
    }
  };

  const extractPortFromRule = (rule: string): string => {
    const match = rule.match(/dport (\d+)/);
    return match ? match[1] : 'unknown';
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleAddRule = async () => {
    if (!newRule.port || !newRule.protocol) {
      toast({
        title: "Validation Error",
        description: "Port and protocol are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const iptablesRule = `-p ${newRule.protocol} --dport ${newRule.port} -j ${newRule.action.toUpperCase()}`;
    const success = await addIptablesRule('INPUT', iptablesRule);
    
    if (success) {
      await loadRules();
      setNewRule({
        port: '',
        protocol: 'tcp',
        action: 'allow',
        description: ''
      });
      setShowAddDialog(false);
    }
    
    setIsLoading(false);
  };

  const handleDeleteRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    const [chain, lineNumber] = rule.id.split('-');
    const success = await removeIptablesRule(chain, parseInt(lineNumber));
    
    if (success) {
      await loadRules();
    }
  };

  const commonPorts = [
    { port: '22', protocol: 'tcp', description: 'SSH' },
    { port: '80', protocol: 'tcp', description: 'HTTP' },
    { port: '443', protocol: 'tcp', description: 'HTTPS' },
    { port: '500', protocol: 'udp', description: 'IKE' },
    { port: '4500', protocol: 'udp', description: 'IPsec NAT-T' },
    { port: '1701', protocol: 'udp', description: 'L2TP' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Network className="h-5 w-5" />
              <span>Port Forwarding & Firewall</span>
            </CardTitle>
            <CardDescription>
              Manage firewall rules and port forwarding for your VPN server
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
                  Create a new firewall rule for port forwarding
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={newRule.port}
                    onChange={(e) => setNewRule(prev => ({ ...prev, port: e.target.value }))}
                    placeholder="e.g., 80, 443, 22"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocol</Label>
                  <Select 
                    value={newRule.protocol} 
                    onValueChange={(value: 'tcp' | 'udp') => setNewRule(prev => ({ ...prev, protocol: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="udp">UDP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select 
                    value={newRule.action} 
                    onValueChange={(value: 'allow' | 'deny') => setNewRule(prev => ({ ...prev, action: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newRule.description}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Rule description"
                  />
                </div>
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
      <CardContent className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Port</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.port}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.protocol.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.action === 'allow' ? 'default' : 'destructive'}>
                      {rule.action === 'allow' ? 'Allow' : 'Deny'}
                    </Badge>
                  </TableCell>
                  <TableCell>{rule.description}</TableCell>
                  <TableCell>
                    <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {rules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No port forwarding rules configured
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-3">Common VPN Ports</h4>
          <div className="grid gap-2 md:grid-cols-3">
            {commonPorts.map((port) => (
              <div key={`${port.port}-${port.protocol}`} className="flex items-center justify-between p-2 bg-muted rounded">
                <div>
                  <span className="font-medium">{port.port}/{port.protocol.toUpperCase()}</span>
                  <p className="text-xs text-muted-foreground">{port.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewRule({
                      port: port.port,
                      protocol: port.protocol as 'tcp' | 'udp',
                      action: 'allow',
                      description: port.description
                    });
                    setShowAddDialog(true);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
