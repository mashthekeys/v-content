import Vuex from "vuex";
import Vue from "vue";
import {cmsRemoteStore} from "./cmsRemoteStore.js";

Vue.use(Vuex);

/*
Live Values (Read Only)
=======================

path[$path].children[]
path[$path].childrenLoaded
path[$path].data
path[$path].dataLoaded
path[$path].group
path[$path].path

group[$id].children[]
group[$id].childrenLoaded
group[$id].data
group[$id].dataLoaded
group[$id].id
group[$id].members[$lang]
group[$id].parent
*/

const {set} = Vue;

function update(object, property, value) {
  if (object[property] !== value) {
    set(object, property, value);
  }
}

function isObject(o) {
  return typeof o === "object" && o !== null;
}
function updateRecursive(object, property, value) {
  if (isObject(object[property]) && isObject(value)) {
    Object.keys(value).forEach(k => {
      updateRecursive(object[property], k, value[k]);
    });
  } else if (object[property] !== value) {
    set(object, property, value);
  }
}

function updateRecursiveByPath(object, property, newArray) {
  const array = object[property];

  const arrayByPath = array.map((o, index) => [o.path, index, o]);

  while (newArray.length > array.length) {
    array.push({});
  }

  newArray.forEach((value, index) => {
    const path = value.path;

    const tuple = arrayByPath.find($ => $[0]  === path);
    const oldIndex = tuple?.[1];

    if (oldIndex == null) {
      // op = INSERT
      set(array, index, value);

    } else {
      const oldValue = tuple?.[2];

      if (oldIndex !== index) {
        // op = SHIFT
        set(array, index, oldValue);
      }

      // op = UPDATE IN PLACE
      Object.keys(value).forEach(k => {
        updateRecursive(oldValue, k, value[k]);
      });
    }
  });

  if (array.length > newArray.length) {
    array.splice(newArray.length, array.length - newArray.length);
  }

  return array;
}

function groupPropertyConfig(group) {
  const m = Object.getOwnPropertyDescriptor(group, "members");
  m.enumerable = false;
  Object.defineProperty(group, "members", m);
}

function pathJoin(...parts) {
  const parentIsRoot = (parts[0] === "/");

  const path = parts.join("/");

  return parentIsRoot ? path.substr(1) : path;
}


const cms = {
  namespaced: true,

  state: () => ({
    path: {},
    group: {},
  }),

  mutations: {
    // ___({state, commit}, params) {},
  },

  actions: {
    // Internal Actions
    // ================
    async __fetchGroupMembers({dispatch}, {group}) {
      const {id} = group;

      // console.log("__fetchGroupMembers", id);

      const allMembers = await cmsRemoteStore.findAll("CMSPath", {lang_group: id});

      set(group, "members", {});

      groupPropertyConfig(group);

      for (let m = 0; m < allMembers.length; m++) {
        await dispatch("__updatePathData", {
          data: allMembers[m],
          group: group,
        });
      }

      update(group, "membersLoaded", true);
    },

    async __updateGroupData({state}, {data}) {
      const {id} = data;

      const inCache = state.group.hasOwnProperty(id);

      const cachedGroup = inCache ? state.group[id] : {};

      let groupObject;

      if (!inCache) {
        groupObject = {
          id,
          children: [],
          childrenLoaded: false,
          members: {},
          membersLoaded: false,
        };

        set(state.group, id, groupObject);

        groupPropertyConfig(groupObject);

      } else {
        groupObject = cachedGroup;
      }

      set(groupObject, "data", data);
      update(groupObject, "dataLoaded", true);
      return groupObject;
    },

    async __updatePathData({state}, {data, group}) {
      const {path} = data;

      const inCache = state.path.hasOwnProperty(path);

      const cachedPath = inCache ? state.path[path] : {};

      let pathObject;

      if (inCache) {
        pathObject = cachedPath;
      } else {
        pathObject = {
          path,
          children: [],
          childrenLoaded: false,
        };

        set(state.path, path, pathObject);
      }

      update(pathObject, "data", data);
      update(pathObject, "dataLoaded", true);
      update(pathObject, "group", group);

      // console.log("__updatePathData", data.lang, data);

      if (group != null) {
        update(group.members, data.lang, pathObject);
      }

      return pathObject;
    },

    // Fetch Actions
    // =============
    async getPath({dispatch, state}, {path, fresh, skip}) {
      const inCache = state.path.hasOwnProperty(path);

      const cachedPath = inCache ? state.path[path] : {};

      if (!fresh && cachedPath.dataLoaded) {
        return cachedPath;
      }

      const data = await cmsRemoteStore.getById("CMSPath", path);

      if (data != null) {
        let group = undefined;

        // Fetch group props
        if (skip?.group) {
          group = cachedPath?.group ?? null;

        } else if (fresh || cachedPath.group == null) {
          if (data.lang_group > 0) {
            group = await dispatch("getGroupById", {
              id: data.lang_group,
              fresh,
              skip: {path: true},
            });
          } else {
            group = null;
          }
        }

        return dispatch("__updatePathData", {data, group});
      }

      return null;
    },

    async getGroupById({dispatch, state}, {id, fresh, skip}) {
      const inCache = state.group.hasOwnProperty(id);

      const cachedGroup = inCache ? state.group[id] : {};

      if (!fresh && cachedGroup.dataLoaded && cachedGroup.membersLoaded) {
        return cachedGroup;
      }

      const data = await cmsRemoteStore.getById("CMSGroup", id);

      if (data != null) {

        const group = await dispatch("__updateGroupData", {data});

        if (!skip?.path) {
          if (fresh || !cachedGroup.membersLoaded) {
            await dispatch("__fetchGroupMembers", {group});
          }
        }

        return group;
      }

      return null;
    },

    async getGroupByPath({dispatch, state}, {path, fresh, skip}) {

      const pathObject = await dispatch("getPath", {path, fresh, skip: {group: true}});

      // console.log("getGroupByPath", pathObject);

      if (pathObject == null) return null;

      const id = pathObject.data.lang_group;

      return await dispatch("getGroupById", {id, fresh, skip});
    },

    async getChildrenById({dispatch, state}, {id, fresh, skip}) {
      const inCache = state.group.hasOwnProperty(id);

      const cachedGroup = inCache ? state.group[id] : {};

      if (!fresh && cachedGroup.childrenLoaded) {
        return cachedGroup.children;
      }

      const childData = await cmsRemoteStore.findAll("CMSGroup", {parent_group: id});

      const children = [];

      for (let c = 0; c < childData.length; c++) {
        const group = await dispatch("__updateGroupData", {data: childData[c]});

        children[c] = group;

        if (!skip?.path || fresh) {
          await dispatch("__fetchGroupMembers", {group});
        }
      }

      // Store children in cache
      if (inCache) {
        updateRecursive(cachedGroup, "children", children);
        set(cachedGroup, "childrenLoaded", true);
      } else {
        set(state.group, id, {
          id,
          data: undefined,
          dataLoaded: false,
          children,
          childrenLoaded: true,
          members: {},
          membersLoaded: false,
        });

        groupPropertyConfig(state.group[id]);

      }

      return children;
    },

    async getChildrenByPath({dispatch, state}, {path, fresh, skip}) {
      const inCache = state.path.hasOwnProperty(path);

      const cachedPath = inCache ? state.path[path] : {};

      if (!fresh && cachedPath.childrenLoaded) {
        return cachedPath.children;
      }

      const childData = await cmsRemoteStore.findAll("CMSPath", {parent: path});

      const children = [];

      for (let c = 0; c < childData.length; c++) {
        const groupObject = await dispatch("getGroupById", {
          id: childData[c].lang_group,
          fresh,
          skip: {path: true},
        });

        children[c] = await dispatch("__updatePathData", {
          data: childData[c],
          group: groupObject,
        });
      }

      if (inCache) {
        updateRecursiveByPath(cachedPath, "children", children);
        set(cachedPath, "childrenLoaded", true);
      } else {
        set(state.path, path, {
          path,
          data: undefined,
          dataLoaded: true,
          children,
          childrenLoaded: true,
          group: null,
        });
      }

      return children;
    },

    // Modification Actions
    // ====================
    async createGroup({dispatch, state}, params) {
      const valid = await dispatch("validateCreateGroup", params);

      if (valid !== true) throw new Error(valid || "!validateCreateGroup");

      const {data, members} = params;

      const memberList = Object.entries(members ?? {});

      const command = {insert: true};

      //Add group to remote store
      const groupData = (await cmsRemoteStore.store("CMSGroup", {data}, command))[0];

      //Add paths to remote store
      const memberData = [];

      for (let m = 0; m < memberList.length; m++) {
        const [lang, member] = memberList[m];

        memberData.push(await cmsRemoteStore.store("CMSPath", {data: {...member, lang}}, command));
      }

      //Add group to local store
      const groupObject = await dispatch("__updateGroupData", {data: groupData});

      //Add paths to local store
      const pathObjects = [];

      for (let m = 0; m < memberList.length; m++) {
        pathObjects[m] = await dispatch("__updatePathData", {
          data: memberData[m][0],
          group: groupObject,
        });
      }

      // Add group to parent
      const parentGroup = groupObject.data.parent_group;

      if (parentGroup) {
        const parentGroupObject = await dispatch("getGroupById", {id: parentGroup});

        parentGroupObject.children.push(groupObject);
      }

      // Add paths to parents
      for (let m = 0; m < memberList.length; m++) {
        const pathObject = pathObjects[m];

        const parent = pathObject.data.parent;

        if (parent) {

          const parentPathObject = await dispatch("getPath", {path: parent});

          parentPathObject.children.push(pathObject);
        }
      }

      return groupObject;
    },

    async createPathInGroup({dispatch, state}, params) {
      // console.log("createPathInGroup", JSON.parse(JSON.stringify(params)));
      const valid = await dispatch("validateCreatePathInGroup", params);

      if (valid !== true) throw new Error(valid || "!validateCreatePathInGroup");

      const {data} = params;

      // Get Group
      const groupObject = await dispatch("getGroupById", {id: data.lang_group});

      //Add path to remote store
      const memberData = await cmsRemoteStore.store("CMSPath", {data}, {insert: true});

      //Add path to local store
      return await dispatch("__updatePathData", {
        data: memberData[0],
        group: groupObject,
      });
    },

    async deleteGroup({dispatch, state}, params) {
      const valid = await dispatch("validateDeletePath", params);

      if (valid !== true) throw new Error(valid || "!validateDeletePath");

      const {id} = params;

      const groupObject = await dispatch("getGroupById", {id});

      // Delete members and children from remote store
      for (let m = 0; m < groupObject.members.length; m++) {
        const {path} = groupObject.members[m];

        const pathLike = path.replace(/[_%]/g, "\\$&");

        await cmsRemoteStore.deleteAll("CMSPath", {
          path: ["LIKE", pathLike + "/%"],
        });
      }

      // Delete group from remote store
      await cmsRemoteStore.deleteById("CMSGroup", id);

      // Delete members and children from local store
      for (let m = 0; m < groupObject.members.length; m++) {
        const {path} = groupObject.members[m];

        Vue.delete(state.path, path);
      }

      // Delete group from local store
      Vue.delete(state.group, id);

      return true;
    },

    async deletePathOnly({dispatch, state}, params) {
      const valid = await dispatch("validateDeletePathOnly", params);

      if (valid !== true) throw new Error(valid || "!validateDeletePathOnly");

      const {path} = params;

      // Delete path from remote store
      await cmsRemoteStore.deleteById("CMSPath", path);

      // Delete path from local store
      Vue.delete(state.path, path);

      return true;
    },

    async moveGroup({dispatch, state}, params) {
      const valid = await dispatch("validateMoveGroup", params);

      if (valid !== true) throw new Error(valid || "!validateMoveGroup");

      // TODO
    },

    async updatePath({dispatch, state}, params) {
      const valid = await dispatch("validateUpdatePath", params);

      if (valid !== true) throw new Error(valid || "!validateUpdatePath");

      const command = {update: true};

      let {path: pathData, group: groupData} = params;

      const oldPath = pathData.path;

      pathData = {...pathData};

      delete pathData.path;

      // Update path object
      pathData = (await cmsRemoteStore.store("CMSPath", {
        id: oldPath,
        data: pathData,
      }, command))[0];

      // Update group object
      groupData = (await cmsRemoteStore.store("CMSGroup", {data: groupData}, command))[0];

      // Update group in local store
      const groupObject = await dispatch("__updateGroupData", {data: groupData});

      // Update path in local store
      if (oldPath !== pathData.path) {
        set(state.path, pathData.path, state.path[oldPath]);
        Vue.delete(state.path, oldPath);
      }

      const pathObject = await dispatch("__updatePathData", {
        data: pathData,
        group: groupObject,
      });

      return pathObject;
    },

    async updatePathOnly({dispatch, state}, params) {
      const valid = await dispatch("validateUpdatePathOnly", params);

      if (valid !== true) throw new Error(valid || "!validateUpdatePathOnly");

      let {path: pathData} = params;

      const oldPath = pathData.path;

      pathData = {...pathData};

      delete pathData.path;

      const command = {update: true};

      // Update path object
      pathData = (await cmsRemoteStore.store("CMSPath", {
        id: oldPath,
        data: pathData,
      }, command))[0];

      // Fetch group object
      const groupObject = await dispatch("getGroupById", pathData.lang_group);

      // Update path in local store
      if (oldPath !== pathData.path) {
        set(state.path, pathData.path, state.path[oldPath]);
        Vue.delete(state.path, oldPath);
      }

      const pathObject = await dispatch("__updatePathData", {
        data: pathData,
        group: groupObject,
      });

      return pathObject;
    },

    async updateGroup({dispatch, state}, params) {
      const valid = await dispatch("validateUpdateGroup", params);

      if (valid !== true) throw new Error(valid || "!validateUpdateGroup");

      const {group, members} = params;

      // Update group object in remote store
      const groupData = (await cmsRemoteStore.store("CMSGroup", group, {update: true}))[0];

      // Update members in remote store
      const memberData = [];

      for (let m = 0; m < members.length; m++) {
        const pathData = members[m];

        const data = {...pathData};

        delete data.path;

        memberData.push((await cmsRemoteStore.store("CMSPath", {
          id: pathData.path,
          data,
        }, {replace: true}))[0]);
      }

      // Update members in local store
      for (let m = 0; m < memberData.length; m++) {
        const pathData = memberData[m];

        const oldPath = members[m].path;

        if (oldPath !== pathData.path) {
          set(state.path, pathData.path, state.path[oldPath]);
          Vue.delete(state.path, oldPath);
        }

        await dispatch("__updatePathData", {
          data: memberData,
          group: groupObject,
        });
      }

      // Update group object in local store
      const groupObject = await dispatch("__updateGroupData", {data: groupData});

      return groupObject;
    },

    async updateGroupOnly({dispatch, state}, params) {
      const valid = await dispatch("validateUpdateGroupOnly", params);

      if (valid !== true) throw new Error(valid || "!validateUpdateGroupOnly");

      const {group} = params;

      // Update group object in remote store
      const groupData = (await cmsRemoteStore.store("CMSGroup", group, {update: true}))[0];

      // Update group object in local store
      const groupObject = await dispatch("__updateGroupData", {data: groupData});

      return groupObject;
    },

    // Validation Actions
    // ==================
    async validateCreateGroup({dispatch, state}, params) {
      const {data, members} = params;

      if (data == null) {
        return 'Invalid reference: "data"';
      }

      const {id} = data;

      const isRoot = String(data.parent_group) === "0";

      if (!/[0-9]+/.test(id)) {
        return 'Invalid value: "data.id"';
      }
      if ((await dispatch("getGroupById", {id})) != null) {
        return `Resource conflict: "data.id", ${JSON.stringify(id)}`;
      }

      if (!/[0-9]+/.test(data.parent_group)) {
        return 'Invalid value: "data.parent_group"';
      }

      if (!isRoot
        && (await dispatch("getGroupById", {id: data.parent_group})) == null
      ) {
        return `Missing resource: "data.parent_group", ${JSON.stringify(data.parent_group)}`;
      }

      if (typeof data.shared_route !== "object") {
        return `Invalid type: "data.shared_route" ${typeof data.shared_route}`;
      }

      if (typeof data.shared_data !== "object") {
        return `Invalid type: "data.shared_data" ${typeof data.shared_data}`;
      }

      if (members == null) {
        return 'Invalid reference: "members"';
      }
      if (typeof members !== "object") {
        return `Invalid type: "members" ${typeof members}`;
      }

      const entries = Object.entries(members);

      if (!(entries.length > 0)) {
        return 'Empty value: "members"';
      }

      if (isRoot) {
        if (entries.length !== 1) {
          return 'Invalid: Root group must contain exactly 1 member.';
        }

        const [, memberData] = entries[0];
        if (memberData.parent !== "" || memberData.name !== "" || memberData.ext !== "") {
          return 'Invalid: Root page cannot have parent, name or ext.';
        }
      }

      for (let m = 0; m < entries.length; m++) {
        const [lang, memberData] = entries[m];

        if (!/^[-a-z0-9]+/.test(lang)) {
          return `Invalid key: "members.${lang}"`;
        }

        if (memberData == null) {
          return `Invalid reference: "members.${lang}"`;
        }

        if (memberData.lang !== lang) {
          return `Invalid data: "members.${lang}.lang"`;
        }

        if (memberData.lang_group !== id) {
          return `Invalid data: "members.${lang}.lang"`;
        }

        const path = pathJoin(memberData.path, memberData.name + memberData.ext);

        if ((await dispatch("getPath", {path})) != null) {
          return `Resource conflict: "members.${lang}.path", ${JSON.stringify(path)}`;
        }

        // TODO validate page data
      }

      return true
    },

    async validateCreatePathInGroup({dispatch, state}, params) {
      const {data} = params;

      if (data == null) {
        return 'Invalid reference: "data"';
      }

      if (!/[0-9]+/.test(data.lang_group)) {
        return 'Invalid value: "data.lang_group"';
      }

      if (!/^[-a-z0-9]+/.test(data.lang)) {
        return 'Invalid value: "data.lang"';
      }

      const path = pathJoin(data.parent, data.name + data.ext);

      if (data.parent === "" && data.name === "" && data.ext === "") {
        // root path

      } else {
        // validation needed for non-root paths
        if (!(typeof data.name === "string" && data.name.length)) {
          return 'Invalid value: "data.name"';
        }

        if (data.ext !== "" && !/^\.*[^./]+$/.test(data.ext)) {
          return 'Invalid value: "data.ext"';
        }

        if (!/^\/(?:.*[^/]|)$/.test(data.parent)) {
          return 'Invalid value: "data.parent"';
        }

        if ((await dispatch("getPath", {path: data.parent})) == null) {
          return `Missing resource: "data.parent", ${JSON.stringify(data.parent)}`;
        }
      }

      if ((await dispatch("getPath", {path})) != null) {
        return `Resource conflict: "data.path", ${JSON.stringify(path)}`;
      }

      return true;
    },

    async validateDeleteGroup({dispatch, state}, params) {
      // TODO
      return true;
    },

    async validateDeletePathOnly({dispatch, state}, params) {
      // TODO
      return true;
    },

    async validateMoveGroup({dispatch, state}, params) {
      // TODO
      return true;
    },

    async validateUpdatePath({dispatch, state}, params) {
      // TODO
      return true;
    },

    async validateUpdatePathOnly({dispatch, state}, params) {
      // TODO
      return true;
    },

    async validateUpdateGroup({dispatch, state}, params) {
      // TODO
      return true;
    },

    async validateUpdateGroupOnly({dispatch, state}, params) {
      // TODO
      return true;
    },
  },
};  // End of cms store

export default function createStore() {
  return new Vuex.Store({
    modules: {cms},
  });
}

/*

const sharedRouteData = {
  hidden: Boolean, // "*" only
  component: String, // "*" only
  props: Array, //[String|Object], "*" only
  propsFn: String, // advanced, * only
};

const localRouteData = {
  name: String, // local
  title: String, // local
  meta: Object, // unused
};

const slotData = Object; // {[String]: Array}

const pageData = Object;
*/


