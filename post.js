const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios')

const VMMETER_PID = 'vmmeter-pid'
const VMMETER_PORT = 'vmmeter-port'

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Thanks ${nameToGreet}!`);

  let vmPort = core.getState('vmmeter-port')

  if(vmPort == '') {
    throw new Error("vmmeter port not found")
  }

  axios({"method": "get", "url": `http://127.0.0.1:${vmPort}/metrics`, "headers": {}}).
  then((response) => {
    console.log(response.data)
  }).
  catch(err => {
    console.log(err)
  })
 
} catch (error) {
  core.setFailed(error.message);
}
