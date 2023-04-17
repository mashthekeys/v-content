import fs from "fs";
import {Database} from "../../config/installation.js";


/** Basic shell command tool */
async function commandLine(settingsDef, defaults, ready, runCommand) {
  const argsObject = processArgs();

  const settings = {
    ...defaults
  };

  Object.entries(settingsDef).forEach(
    ([setting, definition]) => {
      let value;

      if (typeof definition === "string") {
        if (/=$/.test(definition)) {
          value = argsObject.matchingArgument(new RegExp(`^${definition}`))
        } else {
          value = argsObject.hasArgument(definition);
        }
      } else if (Array.isArray(definition)) {
        value = argsObject.hasArgument(...definition);
      } else {
        console.warn(`Cannot parse setting definition for ${setting}.`);
        return;
      }

      settings[setting] = value;
    }
  );

  const args = argsObject.filter($ => /^[^-]/.test($));

  const command = argsObject.shift();

  let aboutCommand = {command, args, settings};

  aboutCommand = (ready ? await ready(aboutCommand) : aboutCommand);

  await runCommand(aboutCommand.command, aboutCommand.args, aboutCommand.settings);

  process.exit(0);


  function processArgs() {
    const [, , ...args] = process.argv;

    args.hasArgument = hasArgument;

    args.matchingArgument = matchingArgument;

    return args;


    function hasArgument(...values) {
      return this.find($ => values.includes($));
    }

    function matchingArgument(prefixRegExp) {
      return this.find($ => prefixRegExp.test($))?.replace(prefixRegExp, '');
    }
  }
}

/** Installer command tool. */
export function installerCommandLine(defaults) {
  let installerConfig;

  const shorthands = {
    re: "reinstall",
    up: "install",
    down: "uninstall"
  };

  const settingsDef = {
    "debug": ["--debug"],

    "quiet": ["-q", "--quiet"],

    "from": "--from=",

    "range": "--range=",

    "to": "--to=",
  };


  async function ready({command, args, settings}) {
    settings.verbose = !settings.quiet;

    settings.verbose && console.warn(`Installer folder: ${(settings.installerFolder)}`);
    settings.verbose && console.warn(`Command: ${command}`);
    settings.verbose && console.warn(`Settings: ${JSON.stringify(settings, null, 4).replace(/[{}]/g, '')}`);

    installerConfig = () => ({
      db: Database.connect({debug: settings.debug})
    });

    return {command, args, settings};
  }

  return commandLine(settingsDef, defaults, ready, runCommand);

// ========================================

  function filterListing(listing, from, to) {
    if (from == null && to == null) return listing;

    if (from == null) {
      from = '';
    } else if (!/^\d\d\d\d-\d\d-\d\d[a-z]?$/.test(from)) {
      throw new Error("Invalid 'install from' point.")
    }

    if (to == null) {
      to = '\uFFFF'; // Sort after all date strings

    } else if (!/^\d\d\d\d-\d\d-\d\d[a-z]?$/.test(to)) {
      throw new Error("Invalid 'install to' point.")
    }


    const matches = listing
      .map($ => /^(up|down)\.(\d\d\d\d-\d\d-\d\d[a-z]?)\.js$/.exec($))
      .filter(match => match !== null && match[2] >= from && match[2] <= to);


    return matches.map($ => $[0]);
  }


  async function runCommand(command, args, settings) {
    if (shorthands.hasOwnProperty(command)) command = shorthands[command];

    settings.verbose && console.warn(`Command: ${command}`);

    let from, to;

    if (typeof settings.range === 'string') {
      const parts = String(settings.range).split("--");

      if (parts.length < 2) {
        from = parts[0];
        to = parts[0];
      } else {
        from = parts[0];
        to = parts[1];
      }
    } else {
      from = settings.from;
      to = settings.to;
    }

    if (!(from || to)) {
      console.warn(`Invalid without date range: ${command} 🛑`);
      process.exit(1);
    }

    const listing = filterListing(await fs.promises.readdir(settings.installerFolder), from, to);

    listing.sort(); // List scripts in ascending order

    const installers = listing.filter($ => /^up\.\d\d\d\d-\d\d-\d\d[a-z]?\.js$/.test($));

    const uninstallers = listing.filter($ => /^down\.\d\d\d\d-\d\d-\d\d[a-z]?\.js$/.test($));

    uninstallers.reverse(); // List uninstall scripts in descending order

    settings.verbose && console.warn(`Found: ${installers.length} install scripts`);

    settings.verbose && console.warn(`Found: ${uninstallers.length} uninstall scripts`);

    if (command === "install" || command === undefined) {
      await runScripts(installers, settings);

    } else if (command === "uninstall") {
      await runScripts(uninstallers, settings);

    } else if (command === "reinstall") {
      await runScripts(uninstallers, settings);
      await runScripts(installers, settings);

    } else {
      console.warn(`Invalid command: ${JSON.stringify(command)}. 🛑`);
      process.exit(1);
    }

    settings.verbose && console.warn(`Command complete.`);
  }


  async function runScripts(fileNames, settings) {
    if (!fileNames.length) {
      console.warn("No scripts to run. 🛑");
      process.exit(2);
    }

    for (let i = 0; i < fileNames.length; i++) {
      const fileName = fileNames[i];

      settings.verbose && console.warn(`Running ${fileName}...`);

      const defaultExport = require(`${(settings.installerFolder)}/${fileName}`)?.default;

      if (typeof defaultExport === 'function') {
        await defaultExport(installerConfig());
      }
    }
  }
}