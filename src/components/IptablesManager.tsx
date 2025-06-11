
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Plus, Trash2, RefreshCw, AlertTriangle, Copy, Edit } from 'lucide-react';
import { useVPNApi, IptablesRule } from '@/hooks/useVPNApi';
import { useToast } from '@/hooks/use-toast';

export const IptablesManager = () => {
  const { getIptablesRules, addIptablesRule, removeIptablesRule, checkFileExists } = useVPNApi();
  const { toast } = useToast();
  const [rules, setRules] = useState<IptablesRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [iptablesAvailable, setIptablesAvailable] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newRule, setNewRule] = useState({ chain: 'INPUT', rule: '' });
  const [editingRule, setEditingRule] = useState<IptablesRule | null>(null);

  const checkIptablesAvailability = async () => {
    const iptablesPaths = ['/usr/sbin/iptables', '/sbin/iptables', '/bin/iptables'];
    
    for (const path of iptablesPaths) {
      const result = await checkFileExists(path);
      if (result.exists) {
        setIptablesAvailable(true);
        return;
      }
    }
    setIptablesAvailable(false);
  };

  const loadRules = async () => {
    if (!iptablesAvailable) return;
    
    setIsLoading(true);
    try {
      const iptablesRules = await getIptablesRules();
      setRules(iptablesRules);
    } catch (error) {
      console.error('Failed to load iptables rules:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkIptablesAvailability().then(() => {
      if (iptablesAvailable) {
        loadRules();
      }
    });
  }, [iptablesAvailable]);

  const handleAddRule = async () => {
    if (!newRule.rule.trim()) {
      toast({
        title: "Invalid Rule",
        description: "Please enter a valid iptables rule",
        variant: "destructive",
      });
      return;
    }

    const success = await addIptablesRule(newRule.chain, newRule.rule);
    if (success) {
      setShowAddDialog(false);
      setNewRule({ chain: 'INPUT', rule: '' });
      await loadRules();
    }
  };

  const handleEditRule = (rule: IptablesRule) => {
    setEditingRule(rule);
    setNewRule({ chain: rule.chain, rule: rule.rule });
    setShowEditDialog(true);
  };

  const handleUpdateRule = async () => {
    if (!editingRule || !newRule.rule.trim()) {
      toast({
        title: "Invalid Rule",
        description: "Please enter a valid iptables rule",
        variant: "destructive",
      });
      return;
    }

    // First remove the old rule, then add the new one
    const ruleIndex = rules.findIndex(r => r.id === editingRule.id) + 1;
    const removeSuccess = await removeIptablesRule(editingRule.chain, ruleIndex);
    
    if (removeSuccess) {
      const addSuccess = await addIptablesRule(newRule.chain, newRule.rule);
      if (addSuccess) {
        setShowEditDialog(false);
        setEditingRule(null);
        setNewRule({ chain: 'INPUT', rule: '' });
        await loadRules();
      }
    }
  };

  const handleRemoveRule = async (rule: IptablesRule) => {
    if (!confirm(`Are you sure you want to remove this rule from the ${rule.chain} chain?`)) {
      return;
    }

    const ruleIndex = rules.findIndex(r => r.id === rule.id) + 1;
    const success = await removeIptablesRule(rule.chain, ruleIndex);
    if (success) {
      await loadRules();
    }
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: description,
    });
  };

  const commonRules = [
    { name: 'Allow VPN - IKE', rule: '-p udp --dport 500 -j ACCEPT', description: 'Allow IKE (Internet Key Exchange)' },
    { name: 'Allow VPN - IPsec NAT-T', rule: '-p udp --dport 4500 -j ACCEPT', description: 'Allow IPsec NAT Traversal' },
    { name: 'Allow VPN - L2TP', rule: '-p udp --dport 1701 -j ACCEPT', description: 'Allow L2TP traffic' },
    { name: 'Allow VPN - ESP', rule: '-p esp -j ACCEPT', description: 'Allow ESP (Encapsulating Security Payload)' },
    { name: 'Forward VPN Traffic', rule: '-i ppp+ -j ACCEPT', description: 'Allow forwarding for VPN clients' },
    { name: 'SSH Access', rule: '-p tcp --dport 22 -j ACCEPT', description: 'Allow SSH connections' }
  ];

  if (!iptablesAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span>IPTables Configuration</span>
          </CardTitle>
          <CardDescription>
            Manage firewall rules for VPN traffic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 p-4 bg-muted rounded-md">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <h4 className="font-medium text-muted-foreground">IPTables Not Available</h4>
              <p className="text-sm text-muted-foreground">
                IPTables is not installed or not accessible. Please ensure iptables is installed on your system.
              </p>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Manual IPTables Commands for VPN:</h4>
            <div className="space-y-2">
              {commonRules.map((rule, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <div className="font-mono text-xs">iptables {rule.rule}</div>
                    <div className="text-xs text-muted-foreground">{rule.description}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`iptables ${rule.rule}`, rule.name)}
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
              <Shield className="h-5 w-5" />
              <span>IPTables Configuration</span>
            </CardTitle>
            <CardDescription>
              Manage firewall rules for VPN traffic
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
                  <DialogTitle>Add IPTables Rule</DialogTitle>
                  <DialogDescription>
                    Add a new firewall rule to the selected chain
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="chain">Chain</Label>
                    <Select value={newRule.chain} onValueChange={(value) => setNewRule(prev => ({ ...prev, chain: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INPUT">INPUT</SelectItem>
                        <SelectItem value="OUTPUT">OUTPUT</SelectItem>
                        <SelectItem value="FORWARD">FORWARD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule">Rule</Label>
                    <Input
                      id="rule"
                      value={newRule.rule}
                      onChange={(e) => setNewRule(prev => ({ ...prev, rule: e.target.value }))}
                      placeholder="-p udp --dport 500 -j ACCEPT"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Common VPN Rules:</Label>
                    <div className="space-y-1">
                      {commonRules.slice(0, 3).map((rule, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="justify-start h-auto p-2 text-left"
                          onClick={() => setNewRule(prev => ({ ...prev, rule: rule.rule }))}
                        >
                          <div>
                            <div className="font-mono text-xs">{rule.rule}</div>
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

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit IPTables Rule</DialogTitle>
                  <DialogDescription>
                    Modify the selected firewall rule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editChain">Chain</Label>
                    <Select value={newRule.chain} onValueChange={(value) => setNewRule(prev => ({ ...prev, chain: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INPUT">INPUT</SelectItem>
                        <SelectItem value="OUTPUT">OUTPUT</SelectItem>
                        <SelectItem value="FORWARD">FORWARD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRule">Rule</Label>
                    <Input
                      id="editRule"
                      value={newRule.rule}
                      onChange={(e) => setNewRule(prev => ({ ...prev, rule: e.target.value }))}
                      placeholder="-p udp --dport 500 -j ACCEPT"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                  <Button onClick={handleUpdateRule}>Update Rule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={loadRules}
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
                  <Badge variant="outline">{rule.chain}</Badge>
                  <code className="text-sm">{rule.rule}</code>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={rule.enabled ? "default" : "secondary"}>
                    {rule.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditRule(rule)}
                    title="Edit rule"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveRule(rule)}
                    title="Delete rule"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            {isLoading ? 'Loading iptables rules...' : 'No iptables rules found or unable to retrieve rules'}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
          <h4 className="font-medium mb-2">Essential VPN Rules</h4>
          <p className="text-sm text-muted-foreground mb-3">
            These rules are typically required for proper VPN functionality:
          </p>
          <div className="space-y-2">
            {commonRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded text-xs">
                <div>
                  <code>{rule.rule}</code>
                  <div className="text-muted-foreground">{rule.description}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(`iptables ${rule.rule}`, rule.name)}
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
