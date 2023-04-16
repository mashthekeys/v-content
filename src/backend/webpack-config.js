const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const DefinePlugin = require("webpack").DefinePlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const resolveClientEnv = require('@vue/cli-service/lib/util/resolveClientEnv')
const path = require("path");
const PreloadPlugin = require("@vue/preload-webpack-plugin");
const SASS = require("sass");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const VuetifyLoaderPlugin = require("vuetify-loader/lib/plugin")
const fs = require("fs");


function makeConfig({name: appName, folder: appFolder, watch}) {

  const rootFolder = path.resolve(__dirname, '../../');

  const publicFolder = rootFolder + "/src/backend/public";

  appFolder = appFolder || path.resolve(__dirname, '../../dist/' + appName);

  const baseUrl = "/staff/" + appName + "/";

  let favicon = publicFolder + '/favicon.ico';

  try {
    let appFavIcon = rootFolder + '/config/favicon.ico';
    if (fs.existsSync(appFavIcon)) {
      favicon = appFavIcon;
    }
  } catch (ignored) {
    // ignored
  }

  try {
    let appStylesheet = rootFolder + '/config/backend-styles.css';
    if (fs.existsSync(appStylesheet)) {
      fs.copyFileSync(appStylesheet, rootFolder + "/dist/backend-styles.css");
    }
  } catch (ignored) {
    fs.writeFileSync(rootFolder + "/dist/backend-styles.css", "", "utf-8");
  }

  const htmlOptions = {
    title: 'CMS',
    favicon: favicon,
    template: publicFolder + '/index.html',
    templateParameters: (compilation, assets, pluginOptions) => {
      // enhance html-webpack-plugin's built in template params
      let stats
      return Object.assign({
        // make stats lazy as it is expensive
        get webpack() {
          return stats || (stats = compilation.getStats().toJson())
        },
        compilation: compilation,
        webpackConfig: compilation.options,
        htmlWebpackPlugin: {
          files: assets,
          options: pluginOptions
        }
      }, resolveClientEnv({}, true /* raw */))
    }
  };

  const watchOptions = !watch ? {} : {
    watch: true,

    watchOptions: {
      ignored: /node_modules/,
    },
  };


  const config = {
    entry: '@/backend/entry-cms',
    output: {
      filename: 'cms.bundle@[chunkhash].js',
      path: appFolder,
      publicPath: baseUrl
    },
    "resolve": {
      "alias": {
        "vue$": "vue/dist/vue.esm.js",
        "@": rootFolder + "/src",
      }
    },
    plugins: [
      new DefinePlugin(
        {
          'process.env': {
            NODE_ENV: '"development"',
            BASE_URL: JSON.stringify(baseUrl)
          }
        }
      ),
      new CaseSensitivePathsPlugin(),
      new CopyPlugin(
        [
          {
            from: publicFolder,
            to: appFolder,
            toType: 'dir',
            ignore: [
              '.DS_Store',
              {
                glob: 'index.html',
                matchBase: false
              }
            ]
          }
        ]
      ),
      new HtmlWebpackPlugin(htmlOptions),
      new VueLoaderPlugin(),
      new PreloadPlugin(
        {
          rel: 'preload',
          include: 'initial',
          fileBlacklist: [
            /\.map$/,
            /hot-update\.js$/
          ]
        }
      ),
      new PreloadPlugin(
        {
          rel: 'prefetch',
          include: 'asyncChunks'
        }
      ),
      new VuetifyLoaderPlugin()
    ],
    module: {
      rules: [
        {
          "test": /\.js$/,
          "include": /(src|local_modules|node_modules\/(vuetify|@akryum\/vue-cli-plugin-ssr\/client))/,
          "use": {
            "loader": "babel-loader",
            "options": {
              "presets": [
                [
                  "@babel/preset-env",
                  {
                    "corejs": 3,
                    "useBuiltIns": "entry",
                    "targets": {
                      "ie": 11
                    }
                  }
                ], [
                  "@vue/app",
                  {
                    "corejs": 3,
                    "useBuiltIns": "entry",
                    "targets": {
                      "ie": 11
                    }
                  }
                ]
              ],
              "plugins": [
                require("@babel/plugin-transform-async-to-generator"),
                require("@babel/plugin-transform-arrow-functions"),
                require("@babel/plugin-transform-modules-commonjs")
              ]
            }
          }
        },
        {
          "test": /\.vue$/,
          "exclude": /node_modules/,
          "use": "vue-loader"
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.s[ca]ss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                implementation: SASS,
                sassOptions: {
                  indentedSyntax: true // optional
                },
              },
            },
          ],
        },
        {
          test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
          loader: 'url-loader?limit=100000'
        }
      ]
    },
    stats: {
      colors: true
    },
    devtool: 'source-map',
    ...watchOptions,
  };
  return config;
}

module.exports = makeConfig;
