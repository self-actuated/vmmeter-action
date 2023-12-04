const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Thanks ${nameToGreet}!`);
 
} catch (error) {
  core.setFailed(error.message);
}
