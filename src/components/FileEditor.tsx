
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Edit3, Save, Download, Trash2, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { useVPNApi, FileCheckResult, FileContent } from '@/hooks/useVPNApi';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfigFile {
  path: string;
  name: string;
  description: string;
  category: 'ipsec' | 'l2tp' | 'scripts' | 'other';
  critical: boolean;
}

export const FileEditor = () => {
  const { checkFileExists, readFile, writeFile, createFile, deleteFile } = useVPNApi();
  const { toast } = useToast();
  const [fileStatuses, setFileStatuses] = useState<{ [key: string]: FileCheckResult }>({});
  const [isChecking, setIsChecking] = useState(false);
  const [editingFile, setEditingFile] = useState<FileContent | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');

  const configFiles: ConfigFile[] = [
    { path: '/etc/ipsec.conf', name: 'ipsec.conf', description: 'IPsec main configuration', category: 'ipsec', critical: true },
    { path: '/etc/ipsec.secrets', name: 'ipsec.secrets', description: 'IPsec pre-shared keys and certificates', category: 'ipsec', critical: true },
    { path: '/etc/xl2tpd/xl2tpd.conf', name: 'xl2tpd.conf', description: 'L2TP daemon configuration', category: 'l2tp', critical: true },
    { path: '/opt/src/addvpnuser.sh', name: 'addvpnuser.sh', description: 'User addition script', category: 'scripts', critical: false },
    { path: '/opt/src/delvpnuser.sh', name: 'delvpnuser.sh', description: 'User deletion script', category: 'scripts', critical: false },
    { path: '/opt/src/ikev2.sh', name: 'ikev2.sh', description: 'IKEv2 configuration generator', category: 'scripts', critical: false },
    { path: '/etc/sysctl.conf', name: 'sysctl.conf', description: 'Kernel parameters configuration', category: 'other', critical: false },
    { path: '/etc/ufw/before.rules', name: 'before.rules', description: 'UFW firewall rules', category: 'other', critical: false }
  ];

  const checkAllFiles = async () => {
    setIsChecking(true);
    const statuses: { [key: string]: FileCheckResult } = {};
    
    for (const file of configFiles) {
      const result = await checkFileExists(file.path);
      statuses[file.path] = result;
    }
    
    setFileStatuses(statuses);
    setIsChecking(false);
  };

  useEffect(() => {
    checkAllFiles();
  }, []);

  const handleEditFile = async (filePath: string) => {
    const fileContent = await readFile(filePath);
    if (fileContent) {
      setEditingFile(fileContent);
      setEditContent(fileContent.content);
      setShowEditor(true);
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    
    const success = await writeFile(editingFile.path, editContent);
    if (success) {
      setShowEditor(false);
      setEditingFile(null);
      // Refresh file status
      await checkAllFiles();
    }
  };

  const handleCreateFile = async () => {
    if (!newFilePath.trim()) {
      toast({
        title: "Invalid Path",
        description: "Please enter a valid file path",
        variant: "destructive",
      });
      return;
    }

    const success = await createFile(newFilePath, '# New configuration file\n');
    if (success) {
      setShowCreateDialog(false);
      setNewFilePath('');
      await checkAllFiles();
    }
  };

  const handleDeleteFile = async (filePath: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}? This action cannot be undone.`)) {
      return;
    }

    const success = await deleteFile(filePath);
    if (success) {
      await checkAllFiles();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ipsec': return '🔐';
      case 'l2tp': return '🌐';
      case 'scripts': return '📜';
      default: return '📄';
    }
  };

  const groupedFiles = configFiles.reduce((groups, file) => {
    if (!groups[file.category]) {
      groups[file.category] = [];
    }
    groups[file.category].push(file);
    return groups;
  }, {} as { [key: string]: ConfigFile[] });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Configuration File Manager</span>
            </CardTitle>
            <CardDescription>
              Edit, create, and manage VPN server configuration files
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Configuration File</DialogTitle>
                  <DialogDescription>
                    Enter the full path for the new configuration file
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newFilePath">File Path</Label>
                    <Input
                      id="newFilePath"
                      value={newFilePath}
                      onChange={(e) => setNewFilePath(e.target.value)}
                      placeholder="/etc/example.conf"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateFile}>Create File</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              onClick={checkAllFiles}
              disabled={isChecking}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedFiles).map(([category, files]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium flex items-center space-x-2">
              <span>{getCategoryIcon(category)}</span>
              <span className="capitalize">{category} Configuration</span>
            </h3>
            <div className="space-y-2">
              {files.map((file) => {
                const status = fileStatuses[file.path];
                const exists = status?.exists === true;
                
                return (
                  <div key={file.path} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <FileText className={`h-4 w-4 ${exists ? 'text-green-600' : 'text-muted-foreground'}`} />
                        {!exists && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                      </div>
                      <div>
                        <div className="font-mono text-sm">{file.path}</div>
                        <div className="text-xs text-muted-foreground">{file.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.critical && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                      <Badge 
                        variant={exists ? "default" : "secondary"}
                        className={exists ? "bg-green-100 text-green-800 border-green-200" : ""}
                      >
                        {exists ? 'Available' : 'Missing'}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditFile(file.path)}
                          disabled={!exists}
                          title={exists ? "Edit file" : "File not found"}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        {!file.critical && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFile(file.path, file.name)}
                            disabled={!exists}
                            title={exists ? "Delete file" : "File not found"}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* File Editor Dialog */}
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit3 className="h-4 w-4" />
                <span>Editing: {editingFile?.path}</span>
              </DialogTitle>
              <DialogDescription>
                Make changes to the configuration file. Be careful with critical system files.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="File content..."
              />
            </div>
            <DialogFooter className="flex justify-between">
              <div className="text-xs text-muted-foreground">
                {editingFile?.writable === false && (
                  <span className="text-orange-600">⚠️ File may be read-only</span>
                )}
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveFile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {Object.values(fileStatuses).some(status => !status.exists) && (
          <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-md">
            <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Missing Configuration Files</h4>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Some configuration files are missing. This may indicate that the VPN server is not properly installed or configured.
              Critical files are required for proper VPN functionality.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
