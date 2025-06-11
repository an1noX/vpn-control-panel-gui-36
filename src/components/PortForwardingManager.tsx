
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Network, Plus, Trash2, RefreshCw, AlertTriangle, Copy, Router } from 'lucide-react';
import { useVPNApi } from '@/hooks/useVPNApi';
import { useToast } from '@/hooks/use-toast';

interface PortRule {
  id: string;
  port: string;
  protocol: 'tcp' | 'udp';
  action: 'allow' | 'deny';
  description: string;
  enabled: boolean;
}

export const PortForwardingManager = () => {
  const { executeCommand } = useVPNApi();
  const { toast } = useToast();
  const [rules, setRules] = useState<PortRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ufwAvailable, setUfwAvailable] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRule, setNewRule] = useState({ 
    port: '', 
    protocol: 'udp' as const, 
    action: 'allow' as const,
    description: ''
  });

  const checkUfwAvailability = async () => {
    try {
      const result = await executeCommand('which ufw');
      setUfwAvailable(result.success);
    } catch (error) {
      console.error('Error checking UFW availability:', error);
      setUfwAvailable(false);
    }
  };

  const loadUfwRules = async () => {
    if (!ufwAvailable) return;
    
    setIsLoading(true);
    try {
      const result = await executeCommand('ufw status numbered');
      if (result.success) {
        // Parse UFW output to extract rules
        const lines = result.output.split('\n');
        const parsedRules: PortRule[] = [];
        
        lines.forEach((line, index) => {
          const match = line.match(/\[\s*(\d+)\]\s+(\w+)\s+(?:(\d+)(?:\/(\w+))?|(\w+))/);
          if (match) {
            const [, ruleNumber, action, port, protocol, service] = match;
            parsedRules.push({
              id: `ufw-${ruleNumber}`,
              port: port || service || 'unknown',
              protocol: (protocol || 'tcp') as 'tcp' | 'udp',
              action: action.toLowerCase() as 'allow' | 'deny',
              description: `UFW rule ${ruleNumber}`,
              enabled: true
            });
          }
        });
        
        setRules(parsedRules);
      }
    } catch (error) {
      console.error('Failed to load UFW rules:', error);
      toast({
        title: "UFW Error",
        description: "Failed to retrieve UFW rules",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkUfwAvailability().then(() => {
      if (ufwAvailable) {
        loadUfwRules();
      }
    });
  }, [ufwAvailable]);

  const handleAddRule = async () => {
    if (!newRule.port.trim()) {
      toast({
        title: "Invalid Rule",
        description: "Please enter a valid port number",
        variant: "destructive",
      });
      return;
    }

    try {
      const command = `ufw ${newRule.action} ${newRule.port}/${newRule.protocol}`;
      const result = await executeCommand(command);
      
      if (result.success) {
        setShowAddDialog(false);
        setNewRule({ port: '', protocol: 'udp', action: 'allow', description: '' });
        await loadUfwRules();
        toast({
          title: "UFW Rule Added",
          description: `Successfully added ${newRule.action} rule for port ${newRule.port}/${newRule.protocol}`,
        });
      } else {
        toast({
          title: "UFW Error",
          description: result.error || "Failed to add UFW rule",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding UFW rule:', error);
      toast({
        title: "UFW Error",
        description: "Failed to add UFW rule",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRule = async (ruleId: string) => {
    if (!confirm(`Are you sure you want to remove this UFW rule?`)) {
      return;
    }

    try {
      const ruleNumber = ruleId.replace('ufw-', '');
      const result = await executeCommand(`ufw --force delete ${ruleNumber}`);
      
      if (result.success) {
        await loadUfwRules();
        toast({
          title: "UFW Rule Removed",
          description: "Successfully removed UFW rule",
        });
      } else {
        toast({
          title: "UFW Error",
          description: result.error || "Failed to remove UFW rule",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing UFW rule:', error);
      toast({
        title: "UFW Error",
        description: "Failed to remove UFW rule",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: description,
    });
  };

  const vpnPorts = [
    { port: '500', protocol: 'udp', description: 'IKE (Internet Key Exchange)' },
    { port: '4500', protocol: 'udp', description: 'IPsec NAT Traversal' },
    { port: '1701', protocol: 'udp', description: 'L2TP' }
  ];

  const enableUfw = async () => {
    try {
      const result = await executeCommand('ufw --force enable');
      if (result.success) {
        await loadUfwRules();
        toast({
          title: "UFW Enabled",
          description: "UFW firewall has been enabled",
        });
      }
    } catch (error) {
      console.error('Error enabling UFW:', error);
    }
  };

  if (!ufwAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-muted-foreground" />
            <span>Port Forwarding & Firewall</span>
          </CardTitle>
          <CardDescription>
            Manage UFW firewall rules for VPN traffic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 p-4 bg-muted rounded-md">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <h4 className="font-medium text-muted-foreground">UFW Not Available</h4>
              <p className="text-sm text-muted-foreground">
                UFW (Uncomplicated Firewall) is not installed. Install it with: sudo apt install ufw
              </p>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Manual UFW Commands for VPN:</h4>
            <div className="space-y-2">
              {vpnPorts.map((rule, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <div className="font-mono text-xs">ufw allow {rule.port}/{rule.protocol}</div>
                    <div className="text-xs text-muted-foreground">{rule.description}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`ufw allow ${rule.port}/${rule.protocol}`, rule.description)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              Manage UFW firewall rules for VPN traffic on Debian/Ubuntu
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add UFW Rule</DialogTitle>
                  <DialogDescription>
                    Add a new firewall rule to allow or deny traffic
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        value={newRule.port}
                        onChange={(e) => setNewRule(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="500"
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
                  <div className="space-y-2">
                    <Label htmlFor="action">Action</Label>
                    <Select value={newRule.action} onValueChange={(value: 'allow' | 'deny') => setNewRule(prev => ({ ...prev, action: value }))}>
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
                    <Label>Common VPN Ports:</Label>
                    <div className="space-y-1">
                      {vpnPorts.map((rule, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="justify-start h-auto p-2 text-left"
                          onClick={() => setNewRule(prev => ({ ...prev, port: rule.port, protocol: rule.protocol as 'tcp' | 'udp' }))}
                        >
                          <div>
                            <div className="font-mono text-xs">{rule.port}/{rule.protocol}</div>
                            <div className="text-xs text-muted-foreground">{rule.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddRule}>Add Rule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              onClick={loadUfwRules}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length > 0 ? (
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center space-x-3">
                  <Badge variant={rule.action === 'allow' ? 'default' : 'destructive'}>
                    {rule.action.toUpperCase()}
                  </Badge>
                  <code className="text-sm">{rule.port}/{rule.protocol}</code>
                  <span className="text-sm text-muted-foreground">{rule.description}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={rule.enabled ? "default" : "secondary"}>
                    {rule.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveRule(rule.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-muted-foreground">
              {isLoading ? 'Loading UFW rules...' : 'No UFW rules found'}
            </div>
            {!isLoading && (
              <Button onClick={enableUfw} className="mt-2" variant="outline">
                <Router className="h-4 w-4 mr-2" />
                Enable UFW
              </Button>
            )}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
          <h4 className="font-medium mb-2">Essential VPN Ports</h4>
          <p className="text-sm text-muted-foreground mb-3">
            These ports must be open for proper VPN functionality:
          </p>
          <div className="space-y-2">
            {vpnPorts.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded text-xs">
                <div>
                  <code>{rule.port}/{rule.protocol}</code>
                  <div className="text-muted-foreground">{rule.description}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(`ufw allow ${rule.port}/${rule.protocol}`, rule.description)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
