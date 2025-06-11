
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Server, Terminal, Code, FileText } from 'lucide-react';

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
            Connect this frontend dashboard to your Debian/Ubuntu VPN server
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>1. Create Node.js Backend on Your VPN Server</span>
              </CardTitle>
              <CardDescription>Set up an Express.js API server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Install dependencies:</p>
                <code className="text-xs font-mono bg-background p-2 rounded block">
                  npm init -y && npm install express cors helmet
                </code>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Basic server structure:</p>
                <pre className="text-xs font-mono bg-background p-2 rounded overflow-x-auto">
{`const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Add user endpoint
app.post('/api/users', (req, res) => {
  const { username, password } = req.body;
  const command = \`sudo /opt/src/addvpnuser.sh \${username} \${password}\`;
  
  exec(command, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ message: 'User added', output: stdout });
  });
});

app.listen(3001, () => console.log('VPN API running on port 3001'));`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>2. Configure Sudo Permissions</span>
              </CardTitle>
              <CardDescription>Allow Node.js to execute VPN scripts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Edit sudoers file:</p>
                <code className="text-xs font-mono bg-background p-2 rounded block">
                  sudo visudo
                </code>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Add these lines (replace 'username' with your Node.js user):</p>
                <pre className="text-xs font-mono bg-background p-2 rounded">
{`username ALL=(ALL) NOPASSWD: /opt/src/addvpnuser.sh
username ALL=(ALL) NOPASSWD: /opt/src/delvpnuser.sh
username ALL=(ALL) NOPASSWD: /opt/src/ikev2.sh`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>3. API Endpoints to Implement</span>
              </CardTitle>
              <CardDescription>Required endpoints for full functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">POST</Badge>
                    <code className="text-sm">/api/users</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Add VPN user</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">DELETE</Badge>
                    <code className="text-sm">/api/users/:username</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Delete VPN user</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">POST</Badge>
                    <code className="text-sm">/api/ikev2/generate</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Generate IKEv2 config</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">GET</Badge>
                    <code className="text-sm">/api/status</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Server status</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">GET</Badge>
                    <code className="text-sm">/api/configs/:filename</code>
                  </div>
                  <span className="text-xs text-muted-foreground">Download config files</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>4. Update Frontend Configuration</span>
              </CardTitle>
              <CardDescription>Connect this dashboard to your backend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Update API_BASE_URL in useVPNApi.ts:</p>
                <code className="text-xs font-mono bg-background p-2 rounded block">
                  const API_BASE_URL = 'http://your-server-ip:3001/api';
                </code>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                <p className="text-sm font-medium mb-1">Current Status:</p>
                <p className="text-xs text-muted-foreground">
                  The frontend is currently using mock data. Once you implement the backend, 
                  uncomment the actual API calls in the useVPNApi.ts file.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alternative: Use Supabase Integration</CardTitle>
              <CardDescription>Recommended approach for hosted backend</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                For a more robust solution, consider using Lovable's Supabase integration to create 
                Edge Functions that can interact with your VPN server remotely.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://docs.lovable.dev/integrations/supabase/" target="_blank" rel="noopener noreferrer">
                  Learn about Supabase Integration
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
