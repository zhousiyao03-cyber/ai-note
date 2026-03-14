import { createServer } from 'node:http';

const PORT = Number(process.env.PORT || 8787);

function handle(_req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: true }));
}

createServer(handle).listen(PORT, () => {
  console.log(`Plaud server listening on http://localhost:${PORT}`);
});
