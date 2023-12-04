const core = require('@actions/core');
const axios = require('axios')

const VMMETER_PID = 'vmmeter-pid'
const VMMETER_PORT = 'vmmeter-port'

try {
  const time = (new Date()).toTimeString();
  core.setOutput("end-time", time);

  let vmPort = core.getState('vmmeter-port')

  if(vmPort == '') {
    throw new Error("vmmeter port not found")
  }

  axios({"method": "get", "url": `http://127.0.0.1:${vmPort}/collect`, "headers": {}}).
  then((response) => {
    console.log(response.data)
  }).
  catch(err => {
    console.log(err)
    core.setFailed(`Failed to collect metrics: ${err.message}`);
  })
 
} catch (error) {
  core.setFailed(error.message);
}
