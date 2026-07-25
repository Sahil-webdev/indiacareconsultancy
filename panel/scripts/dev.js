const { spawn } = require('child_process');

const PORT = Number(process.env.PORT || 3001);

async function checkExistingPanel(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/login`, {
      redirect: 'manual',
    });
    return response.status > 0;
  } catch {
    return false;
  }
}

async function main() {
  const existingPanel = await checkExistingPanel(PORT);
  if (existingPanel) {
    console.log(`\nℹ️  ICC panel is already running on http://localhost:${PORT}`);
    console.log(`   Existing login page: http://localhost:${PORT}/login`);
    console.log('   No new dev server was started because the current port is already in use.\n');
    process.exit(0);
  }

  const child = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['next', 'dev', '-p', String(PORT)],
    {
      stdio: 'inherit',
      env: process.env,
    }
  );

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(`❌ Failed to start ICC panel: ${error.message}`);
  process.exit(1);
});
