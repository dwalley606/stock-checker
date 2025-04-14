import express from 'express';
import path from 'path';

const app = express();
const port = 3000;
let serveInStock = false;

// Serve out-of-stock initially, toggle to in-stock after 30s
app.get('/', (_req, res) => {
  const file = serveInStock ? 'in-stock.html' : 'out-of-stock.html';
  res.sendFile(path.join(process.cwd(), 'public', file));
});

// Toggle stock status
setTimeout(() => {
  console.log('Switching to in-stock...');
  serveInStock = true;
}, 30 * 1000); // 30s for testing

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});