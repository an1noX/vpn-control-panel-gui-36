
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

/**
 * GET /users
 * Lists users by scanning for .p12 files in /root
 */
app.get('/users', (req, res) => {
  const rootDir = '/root/';
  fs.readdir(rootDir, (err, files) => {
    if (err) {
      console.error('Failed to read /root:', err);
      return res.status(500).send('Error reading user configs.');
    }

    const users = files
      .filter(f => f.endsWith('.p12'))
      .map(f => {
        const username = path.basename(f, '.p12');
        return {
          username,
          configs: {
            p12: `/configs/${username}.p12`,
            sswan: `/configs/${username}.sswan`,
            mobileconfig: `/configs/${username}.mobileconfig`
          }
        };
      });

    res.json(users);
  });
});

/**
 * POST /users
 * Adds a new VPN user via /opt/src/addvpnuser.sh
 */
app.post('/users', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }

  const cmd = `sudo /opt/src/addvpnuser.sh ${username} ${password}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Error adding user:', stderr || err.message);
      return res.status(500).send(stderr || err.message);
    }

    res.json({ message: 'User created successfully', output: stdout });
  });
});

/**
 * PUT /users/:username
 * Updates password for existing user by re-running addvpnuser.sh
 */
app.put('/users/:username', (req, res) => {
  const { password } = req.body;
  const username = req.params.username;
  if (!password) {
    return res.status(400).send('New password is required.');
  }

  const cmd = `sudo /opt/src/addvpnuser.sh ${username} ${password}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Error updating password:', stderr || err.message);
      return res.status(500).send(stderr || err.message);
    }

    res.json({ message: 'Password updated successfully', output: stdout });
  });
});

/**
 * DELETE /users/:username
 * Deletes a VPN user via /opt/src/delvpnuser.sh
 */
app.delete('/users/:username', (req, res) => {
  const username = req.params.username;

  const cmd = `sudo /opt/src/delvpnuser.sh ${username}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Error deleting user:', stderr || err.message);
      return res.status(500).send(stderr || err.message);
    }

    res.json({ message: 'User deleted successfully', output: stdout });
  });
});

/**
 * POST /ikev2/reload
 * Triggers the ikev2.sh script to refresh IKEv2 configs
 */
app.post('/ikev2/reload', (req, res) => {
  const cmd = `sudo /opt/src/ikev2.sh`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('IKEv2 reload failed:', stderr || err.message);
      return res.status(500).send(stderr || err.message);
    }

    res.json({ message: 'IKEv2 config refreshed', output: stdout });
  });
});

/**
 * GET /configs/:filename
 * Serves config files (.p12, .sswan, .mobileconfig) from /root
 */
app.get('/configs/:filename', (req, res) => {
  const filePath = path.join('/root', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.download(filePath, err => {
    if (err) {
      console.error('Download error:', err.message);
      res.status(500).send('Error downloading file');
    }
  });
});

/**
 * GET /status
 * Returns server status and service information
 */
app.get('/status', (req, res) => {
  // Check service status using systemctl
  const checkService = (serviceName) => {
    return new Promise((resolve) => {
      exec(`systemctl is-active ${serviceName}`, (err, stdout) => {
        resolve(stdout.trim() === 'active');
      });
    });
  };

  Promise.all([
    checkService('strongswan'),
    checkService('xl2tpd'),
    checkService('ipsec')
  ]).then(([strongswan, xl2tpd, ipsec]) => {
    // Get uptime
    exec('uptime -p', (err, uptime) => {
      // Count active connections (simplified)
      exec('ipsec status | grep -c "ESTABLISHED"', (err, connections) => {
        const activeConnections = parseInt(connections) || 0;
        
        res.json({
          running: strongswan && xl2tpd,
          services: {
            strongswan,
            xl2tpd,
            ipsec
          },
          activeConnections,
          uptime: uptime ? uptime.trim() : undefined
        });
      });
    });
  });
});

/**
 * POST /restart
 * Restarts VPN services
 */
app.post('/restart', (req, res) => {
  const cmd = 'sudo systemctl restart strongswan xl2tpd';
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Error restarting services:', stderr || err.message);
      return res.status(500).send(stderr || err.message);
    }

    res.json({ message: 'Services restarted successfully', output: stdout });
  });
});

/**
 * POST /files/check
 * Check if a file exists
 */
app.post('/files/check', (req, res) => {
  const { path: filePath } = req.body;
  
  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  fs.access(filePath, fs.constants.F_OK, (err) => {
    res.json({
      exists: !err,
      path: filePath,
      error: err ? err.message : undefined
    });
  });
});

/**
 * POST /files/read
 * Read file content
 */
app.post('/files/read', (req, res) => {
  const { path: filePath } = req.body;
  
  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    fs.stat(filePath, (statErr, stats) => {
      res.json({
        path: filePath,
        content,
        writable: true, // Simplified for now
        size: stats ? stats.size : undefined,
        lastModified: stats ? stats.mtime.toISOString() : undefined
      });
    });
  });
});

/**
 * POST /files/write
 * Write content to file
 */
app.post('/files/write', (req, res) => {
  const { path: filePath, content } = req.body;
  
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: 'File path and content are required' });
  }

  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ success: true, message: 'File written successfully' });
  });
});

/**
 * POST /files/create
 * Create a new file
 */
app.post('/files/create', (req, res) => {
  const { path: filePath, content = '' } = req.body;
  
  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ success: true, message: 'File created successfully' });
  });
});

/**
 * POST /files/delete
 * Delete a file
 */
app.post('/files/delete', (req, res) => {
  const { path: filePath } = req.body;
  
  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ success: true, message: 'File deleted successfully' });
  });
});

/**
 * GET /iptables/list
 * List iptables rules (simplified)
 */
app.get('/iptables/list', (req, res) => {
  exec('sudo iptables -L -n --line-numbers', (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: stderr || err.message });
    }

    // Parse iptables output into structured format
    const rules = [];
    const lines = stdout.split('\n');
    let currentChain = '';
    
    lines.forEach((line, index) => {
      if (line.startsWith('Chain ')) {
        currentChain = line.split(' ')[1];
      } else if (line.match(/^\d+/)) {
        rules.push({
          id: `${currentChain}-${index}`,
          chain: currentChain,
          rule: line.trim(),
          enabled: true
        });
      }
    });

    res.json(rules);
  });
});

/**
 * POST /iptables/add
 * Add iptables rule
 */
app.post('/iptables/add', (req, res) => {
  const { chain, rule } = req.body;
  
  if (!chain || !rule) {
    return res.status(400).json({ error: 'Chain and rule are required' });
  }

  const cmd = `sudo iptables -A ${chain} ${rule}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: stderr || err.message });
    }

    res.json({ success: true, message: 'Rule added successfully' });
  });
});

/**
 * POST /iptables/remove
 * Remove iptables rule
 */
app.post('/iptables/remove', (req, res) => {
  const { chain, ruleNumber } = req.body;
  
  if (!chain || !ruleNumber) {
    return res.status(400).json({ error: 'Chain and rule number are required' });
  }

  const cmd = `sudo iptables -D ${chain} ${ruleNumber}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: stderr || err.message });
    }

    res.json({ success: true, message: 'Rule removed successfully' });
  });
});

/**
 * POST /execute
 * Execute system command
 */
app.post('/execute', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  exec(command, (err, stdout, stderr) => {
    if (err) {
      return res.json({
        success: false,
        error: stderr || err.message,
        output: stdout
      });
    }

    res.json({
      success: true,
      output: stdout,
      error: stderr || undefined
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`VPN Manager API running on http://localhost:${PORT}`);
});
