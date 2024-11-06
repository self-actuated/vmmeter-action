const core = require('@actions/core');
const fs = require('fs')
import { execSync, spawn } from 'child_process'

const VMMETER_PID = 'vmmeter-pid'
const VMMETER_PORT = 'vmmeter-port'

function run() {

  const time = (new Date()).toTimeString();
  core.setOutput("start-time", time);

  // Fail if installation skipped
  try {
    fs.accessSync('/usr/local/bin/vmmeter', fs.constants.X_OK);
  } catch (err) {
    core.setFailed("vmmeter not found in /usr/local/bin, install via arkade");
    return;
  }
   
  const child = spawn(
    'sudo',
    [
      "/usr/local/bin/vmmeter",
    ],
    {
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env
      }
    }
  )
  child.unref()

  if (child.pid === undefined) {
    core.warning("Unable to start vmmeter process");

    try {
      let data = fs.readFileSync('/tmp/vmmeter.log', 'utf8')
      core.warning(`Error starting vmmeter, logs: ${data}`)
    } catch {
      core.warning(`No logs found in /tmp/vmmeter.log`);
    }
    return;
  }

  core.saveState(VMMETER_PID, child.pid?.toString())
  console.log(`vmmeter pid: ${child.pid}`)

  let port = 0;

  for(let i = 0; i < 100; i++) {
    let found = false
    try {
      const data = fs.readFileSync('/tmp/vmmeter.port', 'utf8')
      port = parseInt(data.trim())
      found = true
    } catch {

    }

    if(found) {
      break
    }

    execSync('sleep 0.1'); // Wait for 100ms
  }

  if(port > 0) {
    console.log(`vmmeter port: ${port}`)

    core.saveState(VMMETER_PORT, port)
  } else {
    core.warning("vmmeter port not found, process did not start correctly");

    try {
      let data = fs.readFileSync('/tmp/vmmeter.log', 'utf8')
      core.warning(`Error starting vmmeter, logs: ${data}`)
    } catch {
      core.warning(`No logs found in /tmp/vmmeter.log`);
    }

  }
}

try {
  run()
} catch (error) {
  core.setFailed(error.message);
}
