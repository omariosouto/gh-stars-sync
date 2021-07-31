require('dotenv').config();
const core = require('@actions/core');
const githubStarsService = require('./services/githubStars');

async function main() {
  try {
    const { newContributions } = await githubStarsService.addNewContributions();
    const totalNewContributions = newContributions.length;


    core.setOutput("total_new_contributions", totalNewContributions);
    core.setOutput("time", (new Date()).toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();