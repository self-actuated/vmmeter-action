const core = require('@actions/core');
const github = require('@actions/github');

import { ChildProcess, spawn, exec } from 'child_process'

const VMMETER_PID = 'vmmeter-pid'
const VMMETER_PORT = 'vmmeter-port'

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
 
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

  core.saveState(VMMETER_PID, child.pid?.toString())
  console.log(`vmmeter pid: ${child.pid}`)

  for( let i = 0; i < 100; i++ ) {
    let out = false
    fs.readFileSync('/tmp/vmmeter.port', 'utf8', function(err, data) {
      if(!err) {
        console.log("Port: " + data)

        core.saveState(VMMETER_PORT, data.trim())
        out = true
      }
    });

    if(out) {
      break
    }
  }

} catch (error) {
  core.setFailed(error.message);
}
