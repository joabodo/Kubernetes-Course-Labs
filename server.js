const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); // Collect Node.js default metrics

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// In-memory vote store (would use a database in production)
let votes = {
  kubernetes: 0,
  docker: 0,
  helm: 0,
  prometheus: 0
};


// Middleware
app.use(cors());
app.use(express.json());

// Serve static files - assuming simplevotingapp.html is in the same directory
app.use(express.static(__dirname));

// Serve the HTML file on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'simplevotingapp.html'));
});

// API routes
app.get('/api/votes', (req, res) => {
  res.json(votes);
});

app.post('/api/vote', (req, res) => {
  const { option } = req.body;
  
  if (!option || !votes.hasOwnProperty(option)) {
    return res.status(400).json({ error: 'Invalid vote option' });
  }
  
  votes[option]++;
  
  console.log(`Vote recorded for ${option}. Current counts:`, votes);
  res.json({ success: true, votes });
});

// Health check endpoint for Kubernetes liveness probe
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Readiness probe endpoint
app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// Start server
app.listen(port, () => {
  console.log(`Voting app server running on port ${port}`);
  console.log(`Visit http://localhost:${port} to access the application`);
});

// Prometheus metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(client.register.metrics());
});