import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Users, Eye, EyeOff, Download, RefreshCw } from 'lucide-react';
import { useVPNApi, VPNUser } from '@/hooks/useVPNApi';

export const UserManagement = () => {
  const [users, setUsers] = useState<VPNUser[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { addUser, deleteUser, generateIKEv2Config, downloadConfigFile, mockUsers, getUsers } = useVPNApi();

  // Server configuration
  const serverConfig = {
    ip: '38.54.86.245',
    ipsecPsk: 'TqNA5MFSpguyarTNJN4Y'
  };

  // Load users from backend
  const loadUsers = async () => {
    setIsRefreshing(true);
    try {
      const backendUsers = await getUsers();
      setUsers(backendUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback to mock users if backend fails
      setUsers(mockUsers);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load initial users
  useEffect(() => {
    loadUsers();
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
        title: "User Exists",
        description: `User "${newUser.username}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await addUser(newUser.username, newUser.password);
    
    if (success) {
      // Refresh the user list from backend
      await loadUsers();
      setNewUser({ username: '', password: '' });
      setShowAddDialog(false);
    }
    
    setIsLoading(false);
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

    const success = await deleteUser(username);
    if (success) {
      // Refresh the user list from backend
      await loadUsers();
    }
  };

  const handleGenerateIKEv2Config = async (username: string) => {
    const success = await generateIKEv2Config(username);
    if (success) {
      // Refresh the user list to update config status
      await loadUsers();
    }
  };

  const handleDownloadConfig = async (filename: string) => {
    await downloadConfigFile(filename);
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
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={loadUsers}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
                      Create a new VPN user. The user will be added to the server via addvpnuser.sh script.
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Auth Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Config Files</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.hasIKEv2Config ? 'default' : 'secondary'}>
                        {user.hasIKEv2Config ? 'Certificate' : 'Password'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.configs ? (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadConfig(`${user.username}.p12`)}
                            title="Download .p12 (Windows/Linux)"
                          >
                            .p12
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadConfig(`${user.username}.sswan`)}
                            title="Download .sswan (Android)"
                          >
                            .sswan
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadConfig(`${user.username}.mobileconfig`)}
                            title="Download .mobileconfig (iOS/macOS)"
                          >
                            .mobileconfig
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No configs</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateIKEv2Config(user.username)}
                          title="Refresh IKEv2 configs"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        {user.username !== 'vpnuser' && user.username !== 'vpnclient' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.username)}
                            title="Delete user"
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
          {users.length === 0 && !isRefreshing && (
            <div className="text-center py-8 text-muted-foreground">
              No VPN users found. Add your first user to get started.
            </div>
          )}
          {isRefreshing && (
            <div className="text-center py-8 text-muted-foreground">
              Loading users from server...
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
                  <p><strong>Config Files:</strong> Download from table above</p>
                  <ul className="list-disc list-inside text-xs mt-1 text-muted-foreground">
                    <li>.p12 files for Windows & Linux</li>
                    <li>.sswan files for Android</li>
                    <li>.mobileconfig files for iOS & macOS</li>
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
