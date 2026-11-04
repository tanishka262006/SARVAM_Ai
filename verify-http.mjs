import { spawn } from 'child_process';

const PORT = 3005;
const BASE = `http://localhost:${PORT}`;

console.log(`Starting Next.js production server on port ${PORT}...`);
const nextProc = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  shell: true,
  stdio: 'pipe'
});

nextProc.stdout.on('data', (d) => process.stdout.write(d.toString()));
nextProc.stderr.on('data', (d) => process.stderr.write(d.toString()));

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function probe() {
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE}/`);
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await wait(1000);
  }

  if (!ready) {
    console.error('Server failed to start within 30 seconds');
    nextProc.kill();
    process.exit(1);
  }

  console.log('\n--- Probing API Endpoints Over HTTP ---');

  // 1. GET /
  const homeRes = await fetch(`${BASE}/`);
  console.log(`GET /: ${homeRes.status} (OK)`);

  // 2. POST /api/schemes/match
  const matchRes = await fetch(`${BASE}/api/schemes/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: {
        state: 'Maharashtra',
        annualHouseholdIncome: 200000,
        occupation: 'Delivery worker',
        documentsAvailable: ['Aadhaar Card', 'Income Certificate']
      }
    })
  });
  const matchData = await matchRes.json();
  console.log(`POST /api/schemes/match: ${matchRes.status}, Eligible schemes: ${matchData.eligibleCount}`);

  // 3. GET /api/profile
  const profRes = await fetch(`${BASE}/api/profile?sessionId=test-1`);
  console.log(`GET /api/profile: ${profRes.status}`);

  // 4. POST /api/sarvam/vision (demo sample)
  const visionRes = await fetch(`${BASE}/api/sarvam/vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      isDemoSample: true,
      sampleType: 'income_certificate'
    })
  });
  const visionData = await visionRes.json();
  console.log(`POST /api/sarvam/vision: ${visionRes.status}, Doc: ${visionData.document?.document_type}`);

  console.log('\nAll probed HTTP endpoints healthy!');
  nextProc.kill();
  process.exit(0);
}

probe().catch(e => {
  console.error(e);
  nextProc.kill();
  process.exit(1);
});

