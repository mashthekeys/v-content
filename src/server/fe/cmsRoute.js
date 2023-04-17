
export function cmsRoute({DB, debug}) {
  return async function $cmsRoute(req, res, next) {
    try {
      const [rows] = await DB.execute(`
        SELECT cmsPath.published_at,
          cmsPath.modified_at,
          JSON_MERGE_PATCH(
            IFNULL(cmsGroup.shared_route, JSON_OBJECT()),
            IFNULL(cmsPath.route, JSON_OBJECT()),
            JSON_OBJECT('meta', IF (cmsGroup.shared_route->'$.inMenu' = CAST(TRUE AS JSON),
              JSON_OBJECT('inMenu', TRUE),
              JSON_OBJECT()
            ))
          ) AS route
        FROM cmsPath
               JOIN cmsGroup
                    ON (cmsPath.lang_group = cmsGroup.id)
        WHERE cmsPath.published_at <= NOW()
        ORDER BY cmsPath.path`
      );

      let mostRecent = undefined;

      const returnValue = rows.map(
        ({published_at, modified_at, route}) => {
          if (!(mostRecent > published_at)) {
            mostRecent = published_at;
          }
          return {published_at, modified_at, route};
        }
      );

      debug && console.debug('cmsRoute: OK');

      res.set('Cache-Control', 'no-store');

      res.set('Content-Type', 'application/json');

      res.set('Last-Modified', (mostRecent ?? new Date()).toUTCString());

      res.status(200).send(JSON.stringify(returnValue));

    } catch (e) {
      console.warn("cmsRoute error\n", e);

      res.status(500).send(JSON.stringify({error: 500}));

      // next();
    }
  };
}