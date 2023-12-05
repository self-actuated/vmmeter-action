const core = require('@actions/core');
const axios = require('axios')

const VMMETER_PID = 'vmmeter-pid'
const VMMETER_PORT = 'vmmeter-port'

async function run() {

  try {
    const time = (new Date()).toTimeString();
    core.setOutput("end-time", time);
  
    let vmPort = core.getState('vmmeter-port')
  
    if(vmPort == '') {
      throw new Error("vmmeter port not found")
    }
  
    let results = ""
    await axios({"method": "get", "url": `http://127.0.0.1:${vmPort}/collect`, "headers": {}}).
    then((response) => {
      console.log(response.data)
      results = response.data
    }).
    catch(err => {

      try {
        let data = fs.readFileSync('/tmp/vmmeter.log', 'utf8')
        console.error(data)
        console.log(err)
        core.setFailed(`Failed to collect metrics: ${err.message}, logs: ${data}`);
      } catch {
        core.setFailed(`Failed to collect metrics: ${err.message}, logs: (can't read from /tmp/vmmeter.log)`);
      }
    })
  
    if(core.getBooleanInput("createSummary")){
  
      await core.summary
      .addHeading('Metering Results')
      .addCodeBlock(results, "text")
      .write()
    }
   
  } catch (error) {
    core.setFailed(error.message);
  }
  
}

run()