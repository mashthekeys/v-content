import installation from "../../../config/installation.js";

const {Plugins} = installation;

export default Plugins.reduce(
  (transforms, Plugin) => Object.assign(transforms, Plugin.pageTransforms),
  {}
);
