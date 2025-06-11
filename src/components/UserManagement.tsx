
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Users, Eye, EyeOff } from 'lucide-react';

interface VPNUser {
  username: string;
  password: string;
  status: 'active' | 'inactive';
  lastConnected?: string;
  ipAddress?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<VPNUser[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUsers: VPNUser[] = [
      { username: 'john_doe', password: 'SecurePass123!', status: 'active', lastConnected: '2024-01-15 14:30', ipAddress: '192.168.1.100' },
      { username: 'jane_smith', password: 'MyVPN2024@', status: 'active', lastConnected: '2024-01-15 13:45', ipAddress: '192.168.1.101' },
      { username: 'bob_wilson', password: 'VPN_Password#1', status: 'inactive', lastConnected: '2024-01-14 09:20' },
      { username: 'alice_brown', password: 'Secure123$VPN', status: 'active', lastConnected: '2024-01-15 16:15', ipAddress: '192.168.1.102' },
    ];
    setUsers(mockUsers);
  }, []);

  // Validation logic from the original script
  const validateCredentials = (username: string, password: string) => {
    if (!username || !password) {
      return "Username and password are required.";
    }

    // Check for non-ASCII characters
    const hasNonASCII = /[^ -~]/.test(username + ' ' + password);
    if (hasNonASCII) {
      return "VPN credentials must not contain non-ASCII characters.";
    }

    // Check for special characters
    const hasSpecialChars = /[\\\"']/.test(username + ' ' + password);
    if (hasSpecialChars) {
      return "VPN credentials must not contain these special characters: \\ \" '";
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
        description: `User "${newUser.username}" already exists. Password will be updated.`,
      });
    }

    setIsLoading(true);

    // Mock API call - replace with actual backend call
    setTimeout(() => {
      if (userExists) {
        setUsers(prev => prev.map(user => 
          user.username === newUser.username 
            ? { ...user, password: newUser.password }
            : user
        ));
        toast({
          title: "User Updated",
          description: `Password for "${newUser.username}" has been updated.`,
        });
      } else {
        const newVPNUser: VPNUser = {
          username: newUser.username,
          password: newUser.password,
          status: 'inactive',
        };
        setUsers(prev => [...prev, newVPNUser]);
        toast({
          title: "User Added",
          description: `VPN user "${newUser.username}" has been created successfully.`,
        });
      }

      setNewUser({ username: '', password: '' });
      setShowAddDialog(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    // Mock API call - replace with actual backend call
    setTimeout(() => {
      setUsers(prev => prev.filter(user => user.username !== username));
      toast({
        title: "User Deleted",
        description: `VPN user "${username}" has been removed.`,
      });
    }, 500);
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
                Manage L2TP/IPsec and Cisco IPsec VPN user accounts
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
                  <DialogTitle>Add or Update VPN User</DialogTitle>
                  <DialogDescription>
                    If the username already exists, it will be updated with the new password.
                    Write down these credentials - you'll need them to connect!
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
                    <p className="font-medium mb-1">Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>No special characters: \ " '</li>
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
                    {isLoading ? 'Adding...' : 'Add/Update User'}
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
                  <TableHead>Password</TableHead>
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
                        <span className="font-mono">
                          {showPasswords[user.username] ? user.password : '••••••••'}
                        </span>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.username)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            Instructions for connecting to your VPN server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Connection Details:</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Server Type:</strong> L2TP/IPsec</p>
                <p><strong>Server Address:</strong> Your server IP or domain</p>
                <p><strong>Pre-shared Key:</strong> Check /etc/ipsec.secrets</p>
                <p><strong>Authentication:</strong> Use the username and password created above</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>For detailed setup instructions visit: <a href="https://vpnsetup.net/clients" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://vpnsetup.net/clients</a></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
