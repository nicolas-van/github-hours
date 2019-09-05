
const axios = require("axios");
require('dotenv').config();

// Estimates spent working hours based on commit dates
function estimateHours(dates) {
  if (dates.length < 2) {
    return 0;
  }

  // Oldest commit first, newest last
  var sortedDates = dates.sort(function(a, b) {
    return a - b;
  });
  var allButLast = _.take(sortedDates, sortedDates.length - 1);

  var hours = _.reduce(allButLast, function(hours, date, index) {
    var nextDate = sortedDates[index + 1];
    var diffInMinutes = (nextDate - date) / 1000 / 60;

    // Check if commits are counted to be in same coding session
    if (diffInMinutes < config.maxCommitDiffInMinutes) {
      return hours + (diffInMinutes / 60);
    }

    // The date difference is too big to be inside single coding session
    // The work of first commit of a session cannot be seen in git history,
    // so we make a blunt estimate of it
    return hours + (config.firstCommitAdditionInMinutes / 60);

  }, 0);

  return Math.round(hours);
}

async function getAllCommits(authorName, repoName) {
  const commits = [];
  for (let i = 0; true; i++) {
    let res = await axios({
      method: 'get',
      url: `https://api.github.com/repos/${authorName}/${repoName}/commits?page=${i}&per_page=100`,
      headers: {'Authorization': `token ${process.env.GITHUB_TOKEN}`},
    });
    res.data.forEach((c) => commits.push(c));
    console.log(`received ${commits.length} commits`);
  }
}

getAllCommits("thorvalds", "linux");
