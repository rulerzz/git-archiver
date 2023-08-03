"use strict";
const fs = require("fs");
const readline = require("readline");
const { exec } = require("child_process");
const { promisify } = require("util");
const chalk = require("chalk");

const writeFileAsync = promisify(fs.writeFile);

const archive = async function () {
  const branches = await generateBranchesList();
  await writeFileAsync("./branches.txt", branches);
  console.log(chalk.blue("Branch list fetched from remote......."));

  const fileStream = fs.createReadStream("branches.txt");
  console.log(chalk.green("Generate branches registry"));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  !fs.existsSync(`./archive/`) &&
    fs.mkdirSync(`./archive/`, { recursive: true });

  console.log(chalk.blue("Making archive DIR if not exists..."));
  if (fs.existsSync(`./archive/`))
    console.log(chalk.blue("archive DIR exists"));
  else console.log(chalk.blue("creating archive DIR..."));

  for await (const line of rl) {
    const branch = line.replace("origin/", "").trim();
    console.log(chalk.yellow(`\n=> Archiving ${branch}`));

    await checkoutBranch(branch)
      .then(() =>
        console.log(chalk.green(`Checkout of branch ${branch} completed`))
      ) 
      .catch((err) => console.log(chalk.yellow(`\n${err}`)));

    await archiveBranch(branch)
      .then(() =>
        console.log(chalk.green(`Archive for branch ${branch} generated`))
      )
      .catch((err) =>
        console.log(
          chalk.red(
            `Checkout of branch ${branch} failed with error ${err.message}`
          )
        )
      );
  }
};

const generateBranchesList = function () {
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

const checkoutBranch = function (branch) {
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

const archiveBranch = function (branch) {
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

const generateBranchesListFile = async function () {
  const branches = await generateBranchesList();
  await writeFileAsync("./branches.txt", branches);
};

global.bytenode = {
  archiveBranch,
  checkoutBranch,
  generateBranchesList,
  archive,
  generateBranchesListFile,
};

module.exports = global.bytenode;
