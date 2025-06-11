
import { useToast } from '@/hooks/use-toast';

// API configuration - updated to match your backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface VPNUser {
  username: string;
  password?: string;
  status: 'active' | 'inactive';
  lastConnected?: string;
  ipAddress?: string;
  hasIKEv2Config?: boolean;
  configs?: {
    p12: string;
    sswan: string;
    mobileconfig: string;
  };
}

export interface ServerStatus {
  running: boolean;
  services: {
    strongswan: boolean;
    xl2tpd: boolean;
    ipsec: boolean;
  };
  activeConnections: number;
  uptime?: string;
}

export interface FileCheckResult {
  exists: boolean;
  path: string;
  error?: string;
}

export interface FileContent {
  path: string;
  content: string;
  writable: boolean;
  size?: number;
  lastModified?: string;
}

export interface IptablesRule {
  id: string;
  chain: string;
  rule: string;
  enabled: boolean;
}

export const useVPNApi = () => {
  const { toast } = useToast();

  // Mock data for development - will be replaced by real API calls
  const mockUsers: VPNUser[] = [
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
      password: 'Certificate Auth', 
      status: 'inactive', 
      hasIKEv2Config: true
    }
  ];

  // Get all users from your backend
  const getUsers = async (): Promise<VPNUser[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      
      if (!response.ok) {
        throw new Error(`Failed to get users: ${response.statusText}`);
      }
      
      const backendUsers = await response.json();
      
      // Transform backend response to match frontend VPNUser interface
      const users: VPNUser[] = backendUsers.map((user: any) => ({
        username: user.username,
        status: 'active' as const, // Default status
        hasIKEv2Config: true, // Users from backend have configs
        configs: user.configs
      }));
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      toast({
        title: "Error Getting Users",
        description: "Failed to load users from server. Using mock data.",
        variant: "destructive",
      });
      return mockUsers;
    }
  };

  const checkFileExists = async (filePath: string): Promise<FileCheckResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error checking file ${filePath}:`, error);
      return {
        exists: false,
        path: filePath,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // File CRUD Operations
  const readFile = async (filePath: string): Promise<FileContent | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath })
      });

      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      toast({
        title: "File Read Error",
        description: error instanceof Error ? error.message : `Failed to read ${filePath}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const writeFile = async (filePath: string, content: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content })
      });

      if (!response.ok) {
        throw new Error(`Failed to write file: ${response.statusText}`);
      }

      toast({
        title: "File Saved",
        description: `Successfully saved ${filePath}`,
      });

      return true;
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      toast({
        title: "File Write Error",
        description: error instanceof Error ? error.message : `Failed to write ${filePath}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const createFile = async (filePath: string, content: string = ''): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content })
      });

      if (!response.ok) {
        throw new Error(`Failed to create file: ${response.statusText}`);
      }

      toast({
        title: "File Created",
        description: `Successfully created ${filePath}`,
      });

      return true;
    } catch (error) {
      console.error(`Error creating file ${filePath}:`, error);
      toast({
        title: "File Creation Error",
        description: error instanceof Error ? error.message : `Failed to create ${filePath}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }

      toast({
        title: "File Deleted",
        description: `Successfully deleted ${filePath}`,
      });

      return true;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      toast({
        title: "File Deletion Error",
        description: error instanceof Error ? error.message : `Failed to delete ${filePath}`,
        variant: "destructive",
      });
      return false;
    }
  };

  // IPTables Operations
  const getIptablesRules = async (): Promise<IptablesRule[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/iptables/list`);
      
      if (!response.ok) {
        throw new Error(`Failed to get iptables rules: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting iptables rules:', error);
      toast({
        title: "IPTables Error",
        description: "Failed to retrieve iptables rules",
        variant: "destructive",
      });
      return [];
    }
  };

  const addIptablesRule = async (chain: string, rule: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/iptables/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain, rule })
      });

      if (!response.ok) {
        throw new Error(`Failed to add iptables rule: ${response.statusText}`);
      }

      toast({
        title: "IPTables Rule Added",
        description: `Successfully added rule to ${chain} chain`,
      });

      return true;
    } catch (error) {
      console.error('Error adding iptables rule:', error);
      toast({
        title: "IPTables Error",
        description: error instanceof Error ? error.message : "Failed to add iptables rule",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeIptablesRule = async (chain: string, ruleNumber: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/iptables/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain, ruleNumber })
      });

      if (!response.ok) {
        throw new Error(`Failed to remove iptables rule: ${response.statusText}`);
      }

      toast({
        title: "IPTables Rule Removed",
        description: `Successfully removed rule from ${chain} chain`,
      });

      return true;
    } catch (error) {
      console.error('Error removing iptables rule:', error);
      toast({
        title: "IPTables Error",
        description: error instanceof Error ? error.message : "Failed to remove iptables rule",
        variant: "destructive",
      });
      return false;
    }
  };

  // Updated to use your backend API endpoints
  const addUser = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to add user: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "User Added Successfully",
        description: `VPN user ${username} has been created.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error Adding User",
        description: error instanceof Error ? error.message : "Failed to add user. Check server connection.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Updated to use your backend API endpoints
  const deleteUser = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to delete user: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "User Deleted Successfully",
        description: `VPN user ${username} has been removed.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error Deleting User",
        description: error instanceof Error ? error.message : "Failed to delete user. Check server connection.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Updated to use your IKEv2 reload endpoint
  const generateIKEv2Config = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ikev2/reload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to generate IKEv2 config: ${response.statusText}`);
      }

      const result = await response.json();

      toast({
        title: "IKEv2 Config Generated",
        description: `Configuration files refreshed`,
      });
      
      return true;
    } catch (error) {
      console.error('Error generating IKEv2 config:', error);
      toast({
        title: "Error Generating Config",
        description: error instanceof Error ? error.message : "Failed to generate IKEv2 config.",
        variant: "destructive",
      });
      return false;
    }
  };

  const restartServices = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/restart`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to restart services: ${response.statusText}`);
      }
      
      toast({
        title: "Services Restarted",
        description: "strongSwan and xl2tpd services have been restarted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error restarting services:', error);
      toast({
        title: "Error Restarting Services",
        description: error instanceof Error ? error.message : "Failed to restart services.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getServerStatus = async (): Promise<ServerStatus> => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to get server status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting server status:', error);
      toast({
        title: "Server Status Error",
        description: "Unable to connect to VPN server. Check server connection.",
        variant: "destructive",
      });
      
      return {
        running: false,
        services: {
          strongswan: false,
          xl2tpd: false,
          ipsec: false
        },
        activeConnections: 0
      };
    }
  };

  // Updated to use your configs endpoint
  const downloadConfigFile = async (filename: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/configs/${filename}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "File Not Found",
            description: `Configuration file ${filename} does not exist`,
            variant: "destructive",
          });
          return false;
        }
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Create download blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${filename} download initiated successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : `Failed to download ${filename}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const checkConfigurationFiles = async (): Promise<{ [key: string]: FileCheckResult }> => {
    const configFiles = [
      '/etc/ipsec.conf',
      '/etc/ipsec.secrets',
      '/etc/xl2tpd/xl2tpd.conf',
      '/opt/src/addvpnuser.sh',
      '/opt/src/delvpnuser.sh',
      '/opt/src/ikev2.sh'
    ];

    const results: { [key: string]: FileCheckResult } = {};

    for (const file of configFiles) {
      results[file] = await checkFileExists(file);
    }

    return results;
  };

  return {
    // User management
    addUser,
    deleteUser,
    generateIKEv2Config,
    getUsers,
    
    // Server operations
    restartServices,
    getServerStatus,
    downloadConfigFile,
    
    // File operations (CRUD)
    checkFileExists,
    readFile,
    writeFile,
    createFile,
    deleteFile,
    checkConfigurationFiles,
    
    // IPTables operations
    getIptablesRules,
    addIptablesRule,
    removeIptablesRule,
    
    // Mock data
    mockUsers
  };
};
