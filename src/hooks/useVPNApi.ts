
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

  const addUser = async (username: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/users`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // });

      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "User Creation Initiated",
        description: `Run: sudo /opt/src/addvpnuser.sh ${username} ${password}`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user. Check server connection.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteUser = async (username: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/users/${username}`, {
      //   method: 'DELETE'
      // });

      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "User Deletion Initiated",
        description: `Run: sudo /opt/src/delvpnuser.sh ${username}`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Check server connection.",
        variant: "destructive",
      });
      return false;
    }
  };

  const generateIKEv2Config = async (username: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/ikev2/generate`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username })
      // });

      toast({
        title: "IKEv2 Config Generation",
        description: `Run: sudo /opt/src/ikev2.sh to generate config for ${username}`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate IKEv2 config.",
        variant: "destructive",
      });
      return false;
    }
  };

  const restartServices = async (): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/restart`, {
      //   method: 'POST'
      // });

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Services Restarted",
        description: "strongSwan and xl2tpd services have been restarted.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restart services.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getServerStatus = async (): Promise<ServerStatus> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/status`);
      // return await response.json();

      // Mock server status
      return {
        running: true,
        services: {
          strongswan: true,
          xl2tpd: true,
          ipsec: true
        },
        activeConnections: 1,
        uptime: '2 days, 4 hours'
      };
    } catch (error) {
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

  const downloadConfigFile = (filename: string) => {
    // TODO: Replace with actual backend endpoint
    // window.open(`${API_BASE_URL}/configs/${filename}`, '_blank');
    
    toast({
      title: "Config File Download",
      description: `Config file location: /root/${filename}`,
    });
  };

  return {
    addUser,
    deleteUser,
    generateIKEv2Config,
    restartServices,
    getServerStatus,
    downloadConfigFile,
    mockUsers
  };
};
