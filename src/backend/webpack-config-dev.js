const makeConfig = require("./webpack-config.js");
const config = require("../../config/config.js");


module.exports = makeConfig({
  name: "cms-dev",
  folder: config.DEPLOYMENT["cms-dev"],
  watch: true,
});
