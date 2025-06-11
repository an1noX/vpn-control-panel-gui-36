
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

// Start server
app.listen(PORT, () => {
  console.log(`VPN Manager API running on http://localhost:${PORT}`);
});
