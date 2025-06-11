
import { useToast } from '@/hooks/use-toast';

// API configuration - update this to point to your actual backend when ready
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

export interface VPNUser {
  username: string;
  password: string;
  status: 'active' | 'inactive';
  lastConnected?: string;
  ipAddress?: string;
  hasIKEv2Config?: boolean;
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

export const useVPNApi = () => {
  const { toast } = useToast();

  // Mock data that matches your actual server
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

  const addUser = async (username: string, password: string): Promise<boolean> => {
    try {
      // Check if addvpnuser.sh script exists
      const scriptCheck = await checkFileExists('/opt/src/addvpnuser.sh');
      if (!scriptCheck.exists) {
        toast({
          title: "Script Not Found",
          description: "addvpnuser.sh script does not exist at /opt/src/addvpnuser.sh",
          variant: "destructive",
        });
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error(`Failed to add user: ${response.statusText}`);
      }
      
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

  const deleteUser = async (username: string): Promise<boolean> => {
    try {
      // Check if delvpnuser.sh script exists
      const scriptCheck = await checkFileExists('/opt/src/delvpnuser.sh');
      if (!scriptCheck.exists) {
        toast({
          title: "Script Not Found",
          description: "delvpnuser.sh script does not exist at /opt/src/delvpnuser.sh",
          variant: "destructive",
        });
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/users/${username}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }
      
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

  const generateIKEv2Config = async (username: string): Promise<boolean> => {
    try {
      // Check if ikev2.sh script exists
      const scriptCheck = await checkFileExists('/opt/src/ikev2.sh');
      if (!scriptCheck.exists) {
        toast({
          title: "Script Not Found",
          description: "ikev2.sh script does not exist at /opt/src/ikev2.sh",
          variant: "destructive",
        });
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/ikev2/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate IKEv2 config: ${response.statusText}`);
      }

      toast({
        title: "IKEv2 Config Generated",
        description: `Configuration files generated for ${username}`,
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

  const downloadConfigFile = async (filename: string): Promise<boolean> => {
    try {
      // Check if the config file exists
      const filePath = `/root/${filename}`;
      const fileCheck = await checkFileExists(filePath);
      
      if (!fileCheck.exists) {
        toast({
          title: "File Not Found",
          description: `Configuration file ${filename} does not exist at ${filePath}`,
          variant: "destructive",
        });
        return false;
      }

      // Attempt to download the file
      const response = await fetch(`${API_BASE_URL}/configs/${filename}`);
      
      if (!response.ok) {
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
    addUser,
    deleteUser,
    generateIKEv2Config,
    restartServices,
    getServerStatus,
    downloadConfigFile,
    checkFileExists,
    checkConfigurationFiles,
    mockUsers
  };
};
