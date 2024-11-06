const core = require('@actions/core');
const fs = require('fs')
import { execSync, spawn } from 'child_process'

const VMMETER_PID = 'vmmeter-pid'
const VMMETER_PORT = 'vmmeter-port'

function run() {

  const time = (new Date()).toTimeString();
  core.setOutput("start-time", time);
 
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
      core.warning(`Error starting vmmeter, logs: {data}`)
    } catch {
      core.warning(`No logs found in /tmp/vmmeter.log`);
    }
    return;
  }

  core.saveState(VMMETER_PID, child.pid?.toString())
  console.log(`vmmeter pid: ${child.pid}`)

  for( let i = 0; i < 100; i++ ) {
    let out = false
    try {
      const data = fs.readFileSync('/tmp/vmmeter.port', 'utf8')
      console.log(`Read port {data} from: /tmp/vmmeter.port`)
      core.saveState(VMMETER_PORT, data.trim())
      out = true
    } catch {

    }

    if(out) {
      break
    }
    execSync('sleep 0.1'); // block process for 1 second.
    // add a 100ms sleep
  }
}

try {
  run()
} catch (error) {
  core.setFailed(error.message);
}
