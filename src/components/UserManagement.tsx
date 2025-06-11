
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Users, Eye, EyeOff, Download } from 'lucide-react';

interface VPNUser {
  username: string;
  password: string;
  status: 'active' | 'inactive';
  lastConnected?: string;
  ipAddress?: string;
  hasIKEv2Config?: boolean;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<VPNUser[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Server configuration
  const serverConfig = {
    ip: '38.54.86.245',
    ipsecPsk: 'TqNA5MFSpguyarTNJN4Y'
  };

  // Load initial users including the default vpnuser
  useEffect(() => {
    const initialUsers: VPNUser[] = [
      { 
        username: 'vpnuser', 
        password: '3ptEHfmJGk3ZaivU', 
        status: 'active', 
        lastConnected: '2024-01-15 14:30', 
        ipAddress: '192.168.42.10',
        hasIKEv2Config: false
      },
      { 
        username: 'vpnclient', 
        password: 'IKEv2 Certificate', 
        status: 'inactive', 
        hasIKEv2Config: true
      }
    ];
    setUsers(initialUsers);
  }, []);

  // Validation logic for Debian/Ubuntu VPN setup
  const validateCredentials = (username: string, password: string) => {
    if (!username || !password) {
      return "Username and password are required.";
    }

    // Check for non-ASCII characters
    const hasNonASCII = /[^ -~]/.test(username + ' ' + password);
    if (hasNonASCII) {
      return "VPN credentials must not contain non-ASCII characters.";
    }

    // Check for special characters that break shell scripts
    const hasSpecialChars = /[\\\"'`$]/.test(username + ' ' + password);
    if (hasSpecialChars) {
      return "VPN credentials must not contain these special characters: \\ \" ' ` $";
    }

    // Check for spaces
    if (username.includes(' ') || password.includes(' ')) {
      return "VPN credentials must not contain spaces.";
    }

    return null;
  };

  const handleAddUser = async () => {
    const validationError = validateCredentials(newUser.username, newUser.password);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    // Check if user already exists
    const userExists = users.some(user => user.username === newUser.username);
    if (userExists) {
      toast({
        title: "User Update",
        description: `User "${newUser.username}" already exists. Use /opt/src/addvpnuser.sh to update.`,
      });
      return;
    }

    setIsLoading(true);

    // Mock API call - in reality this would call /opt/src/addvpnuser.sh
    setTimeout(() => {
      const newVPNUser: VPNUser = {
        username: newUser.username,
        password: newUser.password,
        status: 'inactive',
        hasIKEv2Config: false,
      };
      setUsers(prev => [...prev, newVPNUser]);
      toast({
        title: "User Added",
        description: `VPN user "${newUser.username}" has been created. Run /opt/src/addvpnuser.sh on the server to activate.`,
      });

      setNewUser({ username: '', password: '' });
      setShowAddDialog(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleDeleteUser = async (username: string) => {
    if (username === 'vpnuser' || username === 'vpnclient') {
      toast({
        title: "Cannot Delete",
        description: "Default users cannot be deleted through the dashboard.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    // Mock API call - in reality this would call /opt/src/delvpnuser.sh
    setTimeout(() => {
      setUsers(prev => prev.filter(user => user.username !== username));
      toast({
        title: "User Deleted",
        description: `VPN user "${username}" has been removed. Run /opt/src/delvpnuser.sh on the server to complete removal.`,
      });
    }, 500);
  };

  const handleGenerateIKEv2Config = (username: string) => {
    toast({
      title: "IKEv2 Config Generation",
      description: `Run /opt/src/ikev2.sh to generate IKEv2 configuration for "${username}". Config files will be saved to /root/`,
    });
  };

  const togglePasswordVisibility = (username: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>VPN Users</span>
              </CardTitle>
              <CardDescription>
                Manage L2TP/IPsec and IKEv2 VPN user accounts on Debian/Ubuntu
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add VPN User</DialogTitle>
                  <DialogDescription>
                    Create a new VPN user. You'll need to run /opt/src/addvpnuser.sh on the server to activate the user.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    <p className="font-medium mb-1">Requirements for Debian/Ubuntu VPN:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>No special characters: \ " ' ` $</li>
                      <li>No spaces allowed</li>
                      <li>ASCII characters only</li>
                      <li>Both username and password required</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleAddUser}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add User'}
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
                  <TableHead>Username</TableHead>
                  <TableHead>Password/Auth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Connected</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">
                          {user.hasIKEv2Config ? 'Certificate' : (showPasswords[user.username] ? user.password : '••••••••')}
                        </span>
                        {!user.hasIKEv2Config && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(user.username)}
                          >
                            {showPasswords[user.username] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastConnected || 'Never'}
                    </TableCell>
                    <TableCell>
                      {user.ipAddress || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {!user.hasIKEv2Config && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateIKEv2Config(user.username)}
                            title="Generate IKEv2 config"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {user.username !== 'vpnuser' && user.username !== 'vpnclient' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.username)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No VPN users configured. Add your first user to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>VPN Client Setup</CardTitle>
          <CardDescription>
            Instructions for connecting to your Debian/Ubuntu VPN server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">L2TP/IPsec Connection:</h4>
                <div className="space-y-1 text-sm font-mono">
                  <p><strong>Server Address:</strong> {serverConfig.ip}</p>
                  <p><strong>Pre-shared Key:</strong> {serverConfig.ipsecPsk}</p>
                  <p><strong>Username:</strong> vpnuser (or created user)</p>
                  <p><strong>Password:</strong> 3ptEHfmJGk3ZaivU (or user password)</p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">IKEv2 Connection:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Server Address:</strong> {serverConfig.ip}</p>
                  <p><strong>Authentication:</strong> Certificate-based</p>
                  <p><strong>Config Files:</strong> Located in /root/</p>
                  <ul className="list-disc list-inside text-xs mt-1 text-muted-foreground">
                    <li>vpnclient.p12 (Windows & Linux)</li>
                    <li>vpnclient.sswan (Android)</li>
                    <li>vpnclient.mobileconfig (iOS & macOS)</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
              <h4 className="font-medium mb-2">Server Scripts:</h4>
              <div className="text-sm space-y-1 font-mono">
                <p><strong>/opt/src/addvpnuser.sh:</strong> Add/update VPN users</p>
                <p><strong>/opt/src/delvpnuser.sh:</strong> Delete VPN users</p>
                <p><strong>/opt/src/ikev2.sh:</strong> Generate IKEv2 client configs</p>
                <p><strong>/root/setup.sh:</strong> Initial VPN server setup</p>
                <p><strong>/root/vpn.sh:</strong> VPN management script</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>For detailed client setup instructions visit: <a href="https://vpnsetup.net/clients" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://vpnsetup.net/clients</a></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
