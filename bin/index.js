'use strict';
const fs = require("fs");
const readline = require("readline");
const { exec } = require("child_process");
const { promisify } = require("util");

const writeFileAsync = promisify(fs.writeFile);

const archive = async function() {
  const branches = await generateBranchesList();
  await writeFileAsync("./branches.txt", branches);
  console.log("Branch list fetched from remote.......");

  const fileStream = fs.createReadStream("branches.txt");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  !fs.existsSync(`./archive/`) &&
    fs.mkdirSync(`./archive/`, { recursive: true });

  for await (const line of rl) {
    const branch = line.replace("origin/", "").trim();
    console.log(`Archiving ${branch}`);
    await checkoutBranch(branch)
      .catch((err) => console.log(err))
      .then(() => console.log(`Checkout of branch ${branch} completed`));
    await archiveBranch(branch)
      .catch((err) => console.log(err))
      .then(() => console.log(`Archive for branch ${branch} generated`));
  }
};

const generateBranchesList = function() {
  return new Promise((resolve, reject) => {
    exec(`git branch -r`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(stdout);
    });
  });
};

const checkoutBranch = function(branch) {
  return new Promise((resolve, reject) => {
    exec(`git checkout ${branch}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(stdout);
    });
  });
};

const archiveBranch = function(branch) {
  return new Promise((resolve, reject) => {
    exec(
      `git archive --format zip --output archive/${branch}.zip ${branch}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        if (stderr) {
          reject(error);
        }
        resolve(stdout);
      }
    );
  });
};

const generateBranchesListFile = async function() {
  const branches = await generateBranchesList();
  await writeFileAsync("./branches.txt", branches);
};

global.bytenode = {
  archiveBranch,
  checkoutBranch,
  generateBranchesList,
  archive,
  generateBranchesListFile
};

module.exports = global.bytenode;
