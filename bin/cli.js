#!/usr/bin/env node

'use strict';

const ARCHIVER = require("./index.js");

const args = process.argv.slice(2);

if (args.includes("-l")) {
  args[args.indexOf("-l")] = "--list";
}

if (args.includes("-g")) {
  args[args.indexOf("-g")] = "--generate";
}

if (args.includes("-o")) {
  args[args.indexOf("-o")] = "--out";
}

if (args.includes("-h")) {
  args[args.indexOf("-h")] = "--help";
}

if (args.includes("-v")) {
  args[args.indexOf("-v")] = "--version";
}

const program = {
  dirname: __dirname,
  filename: __filename,
  nodeBin: process.argv[0],
  flags: args.filter((arg) => arg[0] === "-"),
};

if (program.flags.includes("--list")) {
  try {
    ARCHIVER.generateBranchesList().then((data) => console.log(data));
  } catch (error) {
    console.error(error);
  }
} else if (program.flags.includes("--generate")) {
  try {
    ARCHIVER.generateBranchesListFile();
  } catch (error) {
    console.error(error);
  }
} else if (program.flags.includes("--version")) {
  const pkg = require("../package.json");
  console.log(pkg.name, pkg.version);
  console.log("Node", process.versions.node);
} else if (program.flags.includes("--help")) {
  console.log(`
    Usage: git-archiver [arguments]
  
    Options:
      -h, --help                        show help information.
      -v, --version                     show git-archiver version.
  
      -l, --list                        show all branches in remote repo
      -g, --generate                    generate branches.txt with all branches information
  
    Examples:

    $ git-archiver                      starts git archiver and generates all archives
  `);
} else {
  try {
    ARCHIVER.archive();
  } catch (error) {
    console.error(error);
  }
}
