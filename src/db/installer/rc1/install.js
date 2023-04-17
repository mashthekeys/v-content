#!/usr/bin/npx babel-node

import path from "path";
import {installerCommandLine} from "@/server/installerCommandLine.js";

installerCommandLine({
  installerFolder: path.dirname(__filename)
}).then(
  () => process.exit()
);

