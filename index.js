const core = require('@actions/core');
const fs = require('fs');
const { execSync, spawn } = require('child_process');

const VMMETER_PID = 'vmmeter-pid';
const VMMETER_PORT = 'vmmeter-port';

function run() {
  const time = new Date().toTimeString();
  core.setOutput("start-time", time);

  // Check if arkade is installed
  try {
    fs.accessSync('/usr/local/bin/arkade', fs.constants.X_OK);
  } catch (err) {
    core.setFailed("arkade not found in /usr/local/bin, please install it to proceed.");
    return;
  }

  // Check if vmmeter is installed
  try {
    fs.accessSync('/usr/local/bin/vmmeter', fs.constants.X_OK);
  } catch (err) {
    console.log("vmmeter not found. Attempting to install via arkade...");
    
    try {
      execSync('sudo -E /usr/local/bin/arkade oci install ghcr.io/openfaasltd/vmmeter:latest --path /usr/local/bin/', { stdio: 'inherit' });
    } catch (installErr) {
      core.setFailed(`Failed to install vmmeter: ${installErr.message}`);
      return;
    }

    // Re-check if vmmeter is installed after installation attempt
    try {
      fs.accessSync('/usr/local/bin/vmmeter', fs.constants.X_OK);
    } catch (finalErr) {
      core.setFailed("vmmeter installation failed, still not found in /usr/local/bin.");
      return;
    }
  }

  // Start vmmeter as a detached process
  const child = spawn(
    'sudo',
    ['/usr/local/bin/vmmeter'],
    {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env }
    }
  );
  child.unref();

  if (child.pid === undefined) {
    core.warning("Unable to start vmmeter process");

    try {
      let data = fs.readFileSync('/tmp/vmmeter.log', 'utf8');
      core.warning(`Error starting vmmeter, logs: ${data}`);
    } catch {
      core.warning("No logs found in /tmp/vmmeter.log");
    }
    return;
  }

  core.saveState(VMMETER_PID, child.pid.toString());
  console.log(`vmmeter pid: ${child.pid}`);

  let port = 0;
  for (let i = 0; i < 100; i++) {
    let found = false;
    try {
      const data = fs.readFileSync('/tmp/vmmeter.port', 'utf8');
      port = parseInt(data.trim());
      found = true;
    } catch {
      // Retry reading port file if not found
    }

    if (found) break;
    execSync('sleep 0.1'); // Wait for 100ms
  }

  if (port > 0) {
    console.log(`vmmeter port: ${port}`);
    core.saveState(VMMETER_PORT, port);
  } else {
    core.warning("vmmeter port not found, process did not start correctly");

    try {
      let data = fs.readFileSync('/tmp/vmmeter.log', 'utf8');
      core.warning(`Error starting vmmeter, logs: ${data}`);
    } catch {
      core.warning("No logs found in /tmp/vmmeter.log");
    }
  }
}

try {
  run();
} catch (error) {
  core.setFailed(error.message);
}
