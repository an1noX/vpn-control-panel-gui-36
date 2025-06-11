
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Download, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  service: string;
  message: string;
}

export const ServerLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const { toast } = useToast();

  // Mock log data - replace with actual API calls
  useEffect(() => {
    const mockLogs: LogEntry[] = [
      {
        timestamp: '2024-01-15 16:45:23',
        level: 'info',
        service: 'xl2tpd',
        message: 'Client john_doe connected from 203.0.113.45'
      },
      {
        timestamp: '2024-01-15 16:44:15',
        level: 'info',
        service: 'ipsec',
        message: 'IPsec tunnel established for john_doe'
      },
      {
        timestamp: '2024-01-15 16:30:02',
        level: 'warning',
        service: 'xl2tpd',
        message: 'Failed authentication attempt from 198.51.100.23'
      },
      {
        timestamp: '2024-01-15 16:25:11',
        level: 'info',
        service: 'xl2tpd',
        message: 'Client alice_brown disconnected'
      },
      {
        timestamp: '2024-01-15 16:20:45',
        level: 'info',
        service: 'systemd',
        message: 'xl2tpd service restarted successfully'
      },
      {
        timestamp: '2024-01-15 15:58:33',
        level: 'error',
        service: 'ipsec',
        message: 'PSK authentication failed for unknown user'
      },
      {
        timestamp: '2024-01-15 15:45:21',
        level: 'info',
        service: 'xl2tpd',
        message: 'Client jane_smith connected from 192.0.2.100'
      },
      {
        timestamp: '2024-01-15 15:30:12',
        level: 'warning',
        service: 'xl2tpd',
        message: 'Connection timeout for client bob_wilson'
      }
    ];
    setLogs(mockLogs);
  }, []);

  const handleRefreshLogs = async () => {
    setIsRefreshing(true);
    
    // Mock API call - replace with actual backend call
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Logs Refreshed",
        description: "Server logs have been updated.",
      });
    }, 1000);
  };

  const handleDownloadLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()} ${log.service}: ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vpn-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Logs Downloaded",
      description: "Log file has been saved to your downloads.",
    });
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Server Logs</CardTitle>
              <CardDescription>
                Real-time logs from xl2tpd, IPsec, and system services
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleRefreshLogs}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadLogs}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by level:</span>
              <div className="flex space-x-1">
                {['all', 'info', 'warning', 'error'].map((level) => (
                  <Button
                    key={level}
                    variant={filter === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(level as any)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border rounded-md">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-2">
                  {filteredLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50">
                      <div className="text-xs text-muted-foreground min-w-[130px] font-mono">
                        {log.timestamp}
                      </div>
                      <Badge variant={getLevelBadgeVariant(log.level)} className="min-w-[60px] justify-center">
                        {log.level}
                      </Badge>
                      <div className="text-xs text-muted-foreground min-w-[80px]">
                        {log.service}
                      </div>
                      <div className="text-sm flex-1">
                        {log.message}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No logs found for the selected filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Analysis</CardTitle>
          <CardDescription>
            Summary of recent activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(log => log.level === 'info').length}
              </div>
              <div className="text-sm text-muted-foreground">Info Messages</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-600">
                {logs.filter(log => log.level === 'warning').length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(log => log.level === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
