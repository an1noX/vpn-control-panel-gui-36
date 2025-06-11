
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Server, Terminal, Code, FileText, CheckCircle } from 'lucide-react';

export const BackendHelpDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Backend Setup Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Backend Integration Setup Guide</DialogTitle>
          <DialogDescription>
            Your dashboard is already connected to the backend server running on your VPN server
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>✅ Backend Status: Ready</span>
              </CardTitle>
              <CardDescription>Your server.js backend is configured and running</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Current Configuration:</p>
                <ul className="text-xs space-y-1">
                  <li>✅ Express.js server with CORS enabled</li>
                  <li>✅ All required dependencies installed (express, cors, body-parser)</li>
                  <li>✅ Complete API endpoints implemented</li>
                  <li>✅ File operations support</li>
                  <li>✅ IPTables management</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Running Your Backend Server</span>
              </CardTitle>
              <CardDescription>How to start your VPN management server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Start the server:</p>
                <code className="text-xs font-mono bg-background p-2 rounded block">
                  node server.js
                </code>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Server will run on port 3000:</p>
                <code className="text-xs font-mono bg-background p-2 rounded block">
                  VPN Manager API running on http://localhost:3000
                </code>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                <p className="text-sm font-medium mb-1">Frontend Configuration:</p>
                <p className="text-xs text-muted-foreground">
                  The frontend is configured to connect to http://localhost:3000 by default. 
                  You can change this by setting the VITE_API_URL environment variable.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>Required Sudo Permissions</span>
              </CardTitle>
              <CardDescription>Configure sudo access for VPN script execution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Edit sudoers file:</p>
                <code className="text-xs font-mono bg-background p-2 rounded block">
                  sudo visudo
                </code>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Add these lines (replace 'username' with your server user):</p>
                <pre className="text-xs font-mono bg-background p-2 rounded">
{`username ALL=(ALL) NOPASSWD: /opt/src/addvpnuser.sh
username ALL=(ALL) NOPASSWD: /opt/src/delvpnuser.sh
username ALL=(ALL) NOPASSWD: /opt/src/ikev2.sh
username ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart strongswan
username ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart xl2tpd
username ALL=(ALL) NOPASSWD: /usr/bin/systemctl is-active *
username ALL=(ALL) NOPASSWD: /usr/sbin/iptables`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Implemented API Endpoints</span>
              </CardTitle>
              <CardDescription>All endpoints are fully implemented in server.js</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">GET</Badge>
                    <code className="text-sm">/users</code>
                  </div>
                  <span className="text-xs text-muted-foreground">List all VPN users</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">POST</Badge>
                    <code className="text-sm">/users</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Add new VPN user</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">PUT</Badge>
                    <code className="text-sm">/users/:username</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Update user password</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">DELETE</Badge>
                    <code className="text-sm">/users/:username</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Delete VPN user</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">POST</Badge>
                    <code className="text-sm">/ikev2/reload</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Refresh IKEv2 configs</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">GET</Badge>
                    <code className="text-sm">/status</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Server status & services</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">GET</Badge>
                    <code className="text-sm">/configs/:filename</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Download config files</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">POST</Badge>
                    <code className="text-sm">/restart</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Restart VPN services</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">POST</Badge>
                    <code className="text-sm">/files/*</code>
                  </div>
                  <span className="text-xs text-muted-foreground">File CRUD operations</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">GET/POST</Badge>
                    <code className="text-sm">/iptables/*</code>
                  </div>
                  <span className="text-xs text-muted-foreground">IPTables management</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">POST</Badge>
                    <code className="text-sm">/execute</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Execute system commands</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Server Configuration</span>
              </CardTitle>
              <CardDescription>Current backend server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Server Details:</p>
                <ul className="text-xs space-y-1 font-mono">
                  <li><strong>Port:</strong> 3000</li>
                  <li><strong>CORS:</strong> Enabled for all origins</li>
                  <li><strong>Body Parser:</strong> JSON support enabled</li>
                  <li><strong>Config Files Location:</strong> /root/</li>
                  <li><strong>Scripts Location:</strong> /opt/src/</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                <p className="text-sm font-medium mb-1">Security Note:</p>
                <p className="text-xs text-muted-foreground">
                  The server is configured to work with your existing VPN setup scripts and 
                  requires proper sudo permissions to execute system commands safely.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
              <CardDescription>Common issues and solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Connection Failed:</p>
                    <p className="text-xs text-muted-foreground">Ensure server.js is running and accessible on port 3000</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Permission Denied:</p>
                    <p className="text-xs text-muted-foreground">Check sudo permissions for VPN scripts and systemctl commands</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Scripts Not Found:</p>
                    <p className="text-xs text-muted-foreground">Verify VPN setup scripts exist in /opt/src/ directory</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
