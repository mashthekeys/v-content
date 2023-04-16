import config from "../config/config.js";
import child_process from "child_process";
import * as fs from "fs";

function execSync(command) {
  console.warn(command);
  child_process.execSync(command);
}

function quote(s) {
  return !s ? "''" : `'${String(s).replace(/'/g, "'\\''")}'`
}

const buildTarget = process.argv[2];

if (!(buildTarget in config.DEPLOYMENT)) throw new TypeError(`Unknown deployment target: ${buildTarget}`);

const deploymentFolder = config.DEPLOYMENT[buildTarget];

if (!deploymentFolder || String(deploymentFolder).length < 2) {
  throw new Error(`Invalid or empty deployment folder: ${deploymentFolder}`);
} 

if (fs.existsSync(deploymentFolder)) {
  execSync(`rm -rf ${quote(deploymentFolder)}/*`);
} else {
  execSync(`mkdir -p ${quote(deploymentFolder)}`);
}

execSync(`cp -R ${quote("./dist/" + buildTarget)}/* ${quote(deploymentFolder + "/")}`);
