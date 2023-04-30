import router from "../../../cache/router.json";
import views from "../../../cache/views.js";
import ErrorComponent from "../../components/ErrorComponent.vue";
import ContentHost from "../../components/ContentHost";

let store = null;

async function getPageData(path) {
  return store.dispatch("cms/getPageData", {path});
}

const routes = router.map(({published_at, modified_at, route}) => {
  const {path} = route;

  route = {...route};

  if (views.hasOwnProperty(route.component)) {
    const View = views[route.component];

    let {props, propsFn} = route;

    let propNames = [];

    delete route.props;
    delete route.propsFn;

    if (Array.isArray(props)) {
      propNames = props.map(propSpec => {
        if (typeof propSpec === "string") {
          if (/^\w+\??$/.test(propSpec)) {
            return propSpec.replace(/\?$/, "");
          }
          if (/^query\.\w+$/.test(propSpec)) {
            return propSpec.split(".").pop();
          }

        } else if (Array.isArray(propSpec)) {
          return propSpec[0];
        }
      }).filter(
        $ => typeof $ === "string"
      );

      propsFn = propsFn ?? (route => Object.fromEntries(
        props.map(propSpec => {
          let name, value;

          if (typeof propSpec === "string") {
            if (/^\w+\??$/.test(propSpec)) {
              name = propSpec.replace(/\?$/, "");
              value = route.params[name];

            } else if (/^query\.\w+$/.test(propSpec)) {
              name = propSpec.split(".").pop();
              value = route.query[name];

            } else {
              console.warn("propsFn no match", route.path, propSpec);
            }

          } else if (Array.isArray(propSpec)) {
            if (propSpec.length === 2 && typeof propSpec[0] === "string") {
              name = propSpec[0];
              value = propSpec[1];
            }
          }

          if (name != null) return [name, value];
        }).filter(
          $ => $ != null
        )
      ));

      const params = props.map(propSpec => {
        if (typeof propSpec === "string") {
          if (/^\w+\??$/.test(propSpec)) {
            return propSpec;
          }
        }
      }).filter(
        $ => $ != null
      );

      if (params.length) {
        // Adjust route.path to add params
        route.path = [route.path, ...params].join("/")
      }
    }

    if (propsFn != null) {
      route.props = propsFn;
    }

    route.component = async () => {
      const json = await getPageData(route.path);

      const slotSource = json?.slots;

      const data = json?.data ?? {};

      // console.warn("slots for " + route.path + ": " + JSON.stringify(slotSource ?? null, null, 2));

      return {
        name: "PageContentHost",

        extends: ContentHost,

        props: propNames,

        provide: {
          pageData: data,
        },

        render() {
          const inheritProps = Object.fromEntries(propNames.map(
            prop => [prop, this[prop]]
          ));

          const scopedSlots = this.makeSlots(slotSource);

          return this.$createElement(View, {
            props: inheritProps,
            scopedSlots
          });
        },
      };
    };

  } else {
    console.warn("Error / Blank Page Component: " + route.path);
    route.component = ErrorComponent;
  }

  // console.log("ROUTE " + JSON.stringify(route, null, 2));

  return route;
});

function getLangAlternates(route, inclusive) {
  const name = typeof route === "string" ? route : route?.name;

  // console.warn(`getLangAlternates ${name}`);

  const match = /^([0-9]+):([-a-z0-9]+)$/.exec(name);

  if (match != null) {
    const sameGroupRegExp = new RegExp(`^${match[1]}:${
      inclusive ? "" : "(?!" + match[2] + "$)"
    }`);

    return routes.filter(
      $ => sameGroupRegExp.test($?.name)
    ).sort(({name: a}, {name: b}) => {
      // If inclusive, move exact match to top of list
      if (a === name) a = '\x00';
      if (b === name) b = '\x00';

      // If rest of list is sorted alphabetically by lang key
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  return inclusive ? [route] : [];
}

function ancestorPathRegExp(path) {
  const parentPath = String(path).replace(/\/[^/]+\/?$/, "");

  let brackets = 0;

  const openBrackets = () => {
    ++brackets;
    return "(?:\\/";
  };

  const parentRegExp = parentPath.replace(/[.+]/g, "\\$&").replace(/\//g, openBrackets);

  const closeBrackets = ")?".repeat(brackets);

  const source = "^" + parentRegExp + closeBrackets + "$";

  return new RegExp(source);
}

function childPathRegExp(path) {
  return new RegExp("^" + String(path).replace(/\/?$/, "").replace(/[.+/]/g, "\\$&") + "/[^/]+\\/?$");
}

function descendantPathRegExp(path) {
  return new RegExp("^" + String(path).replace(/\/?$/, "").replace(/[.+/]/g, "\\$&") + "/");
}

function parentPath(path) {
  return String(path).replace(/(\/?[^/]+|)\/?$/, "");
}

function siblingPathRegExp(path) {
  return childPathRegExp(parentPath(path));
}

function cmpByPath({path: a}, {path: b}) {
  return (a < b) ? -1
    : (a > b) ? 1
      : 0;
}

export default {
  connectStore(vuexStore) {
    store = vuexStore;
  },

  getAncestors(path) {
    const ancestorPath = ancestorPathRegExp(path);

    const match = routes.filter($ => ancestorPath.test($.path));

    return match.sort(cmpByPath);
  },

  getChildren(path) {
    const childPath = childPathRegExp(path);

    const match = routes.filter($ => childPath.test($.path));

    return match.sort(cmpByPath);
  },

  getDescendants(path) {
    const descendantPath = descendantPathRegExp(path);

    const match = routes.filter($ => descendantPath.test($.path));

    return match.sort(cmpByPath);
  },

  getLangAlternates,

  getPageData,

  getParent(path) {
    const parent = parentPath(path);

    return routes.find($ => $.path === parent);
  },

  getPath(path) {
    // String trailing slash
    path = String(path).replace(/\/$/, "");

    return routes.find($ => $.path === path);
  },

  getSiblings(path, inclusive) {
    const siblingPath = siblingPathRegExp(path);

    const match = routes.filter($ => siblingPath.test($.path) && (inclusive || $.path !== path));

    return match.sort(cmpByPath);
  },

  routes,
};
