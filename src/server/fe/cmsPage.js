import NodeCache from "node-cache";

import server from "../../../config/server.js";
import PageTransforms from "./pageTransforms.js";

const {
  dataExpiry = 10,
  transformedDataExpiry = 10,
  siteTransform = '',
} = server;

export function cmsPage({DB, debug}) {
  const pageDataCache = new NodeCache({
    stdTTL: dataExpiry,
    checkperiod: dataExpiry / 2,
    useClones: false,
  });

  return async function $cmsPage(req, res, next) {
    let expiry;

    const path = String(req.path).replace(/\/$/, '');

    const cached = pageDataCache.get(path);

    let computed;

    if (cached != null) {
      debug && console.debug(`cmsPage: Cached result for ${path}`);
      computed = cached;

    } else {
      debug && console.debug(`cmsPage: Querying for ${path}`);
      try {
        const [rows] = await DB.execute(`
            SELECT cmsPath.path, 
              cmsPath.published_at, 
              cmsPath.modified_at,
              cmsPath.lang,
              cmsPath.lang_group,
              cmsPath.local_transform,
              CAST(cmsPath.page_content AS CHAR) AS slots_json,
              cmsGroup.parent_group,
              cmsGroup.shared_transform,
              JSON_MERGE_PATCH(
                IFNULL(cmsGroup.shared_route, JSON_OBJECT()),
                IFNULL(cmsPath.route, JSON_OBJECT())
              ) AS merged_route_data,
              CAST(JSON_MERGE_PATCH(
                IFNULL(cmsGroup.shared_data, JSON_OBJECT()),
                IFNULL(cmsPath.local_data, JSON_OBJECT())
              ) AS CHAR) AS merged_page_json
            FROM cmsPath JOIN cmsGroup
              ON (cmsPath.lang_group = cmsGroup.id)
            WHERE cmsPath.path = ?
            LIMIT 1`,
          [path === '' ? '/' : path.replace(/\/$/, '')]
        );

        if (!rows.length) {
          computed = {
            status: 404,
            data: {error: 404}
          };
        } else {
          const routeData = rows[0].merged_route_data ?? {};

          const lang = rows[0].lang;

          let pageJSON = rows[0].merged_page_json ?? "null";

          let modifiedAt = rows[0].modified_at;

          const publishedAt = rows[0].published_at;

          const pageTransform = [...new Set(`${siteTransform || ''},${rows[0].shared_transform || ''},${rows[0].local_transform || ''}`.split(',').filter(Boolean))];

          const slotsJSON = rows[0].slots_json;

          const visible = publishedAt != null && !routeData.hidden;

          if (!visible) {
            computed = {
              status: 404,
              data: {error: 404}
            };

          } else if (pageTransform.length) {
            // Page data is only decoded from JSON as required
            let data = JSON.parse(pageJSON);
            let expiry = transformedDataExpiry;

            for (let t = 0; t < pageTransform.length; t++){
              const transform = pageTransform[t];

              if (!PageTransforms.hasOwnProperty(transform)) {
                console.error('No such transform: ' + transform);
                next();
              }

              const result = await PageTransforms[transform]({path, data, expiry});

              expiry = result.expiry || transformedDataExpiry;

              data = result.data ?? null;
            }

            pageJSON = JSON.stringify(data);

            modifiedAt = new Date();
          } else {
            expiry = dataExpiry;
          }

          const routeJSON = JSON.stringify(routeData);

          const json = `{"data":${pageJSON},"route":${routeJSON},"slots":${slotsJSON}}`;

          computed = {
            status: 200,
            lang,
            json,
            modifiedAt,
          };
        }
      } catch (dbError) {
        console.warn('Bailing with DB error');
        console.error(dbError);
        next();
        return;
      }

      if (computed.data != null) {
        computed.json = JSON.stringify(computed.data);

        delete computed.data;
      }

      pageDataCache.set(path, computed, expiry);
    }

    if (computed == null) {
      console.error('Bailing: computed == null');
      return next();

    } else if (!(200 <= computed.status && computed.status <= 599)) {
      console.error(`Bailing: computed.status === ${computed.status}`);
      return next();
    }

    if (computed.json == null) {
      console.error('Bailing: computed.json == null');
      return next();
    }

    debug && console.debug('cmsPage: OK');

    res.set('Cache-Control', 'no-store');

    if (computed.lang) {
      res.set('Content-Language', computed.lang);
    }

    res.set('Content-Type', 'application/json');

    if (computed.modifiedAt) {
      res.set('Last-Modified', computed.modifiedAt.toUTCString());
    }

    res.status(computed.status).send(computed.json);
  };
}