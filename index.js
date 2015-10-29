var gutil = require("gulp-util")
    mkdirp = require("mkdirp"),
    through = require("through2"),
    jade = require("jade"),
    React = require("react/addons"),
    es = require("event-stream"),
    fs = require("fs"),
    _ = require("lodash"),
    streamFromArray = require("stream-from-array");


var defaultTitleGetter = function(component, props) {
  return component.getPageTitle ? component.getPageTitle(props) : null;
}

var defaultRenderer = function(component, props) {
  var element = React.createElement(component, props, props.children || [] );
  var pageTitle = component.getPageTitle ? component.getPageTitle(props)
                                         : null;
  return React.renderToStaticMarkup(element);
}

module.exports = function(opts) {
  opts = opts || {};
  if (!opts.data) throw new Error("No data Directory or transformer provided.");
  if (!opts.dest) throw new Error("No Destination Directory provided.");
  if (!opts.wrapper) throw new Error("No Wrapper Template provided.");
  opts.defaultProps = opts.defaultProps || {}
  opts.jadeVariables = opts.jadeVariables || {}
  opts.renderer = opts.renderer || defaultRenderer;
  opts.titleGetter = opts.titleGetter || defaultTitleGettter;
  opts.propsSerializer = opts.propsSerializer || JSON.stringify;

  return through.obj(function(file, enc, cb) {
    try {
      var requirePath = file.relative;
      if (opts.templates) {
        var Template = require(process.cwd() + "/" + opts.templates + "/" + requirePath);
        file.history[0] = process.cwd() + "/" + opts.templates + "/" + requirePath
      } else {
        var Template = require(file.history[0]);
      }
      try {
        if (typeof opts.data == "function") {
          var pageData = require(opts.data(file.history[0]));
        } else {
          var pageData = require(process.cwd() + "/" + opts.data + "/" + requirePath);
        }
      } catch (err) {
        var pageData = null;
      }

      if (!Template.applyToStyleguide && !pageData && !opts.alwaysRender) {
        return cb(null, null);
      }

      var prependStyleguideHtml = Template.prependStyleguide || "";
      var appendStyleguideHtml = Template.appendStyleguide || "";

      if (!pageData) {
        pageData = {"default": {}};
      }

      var isPaged = !!pageData.pagedVariations;
      var dataKeys = Object.keys(pageData).filter(function(key) {
        return key !== "pagedVariations"
      });

      var dirPath = opts.dest + "/" + requirePath.split("/").slice(0, -1).join("/");
      file.path = gutil.replaceExtension(file.path, ".html");
      var segments = file.path.split("/");
      var fName = segments[segments.length - 1].replace(".react.html", ".html");
      segments[segments.length - 1] = fName;
      var destPath = [process.cwd(), dirPath, fName].join("/");

      mkdirp(dirPath, function(err) {
        if (err) return cb(err);

        try {
          var variations = dataKeys.map(function(key) {
            var props = _.assign({}, opts.defaultProps, pageData[key]);
            var pageTitle = opts.titleGetter(Template, props);
            var pageHTML = opts.renderer(Template, props);
            return {
              key: key,
              requirePath: "./" + requirePath,
              title: pageTitle,
              prependHtml: prependStyleguideHtml,
              appendHtml: appendStyleguideHtml,
              html: pageHTML,
              json: opts.propsSerializer(props),
              props: props,
            }
          });

          var outs = [];
          if (isPaged) {
            variations.forEach(function(variation) {
              var clone = file.clone();
              var clonePath = destPath;
              if (variation.key !== "default") {
                clonePath = gutil.replaceExtension(clonePath, "-" + variation.key + ".html");
              }
              var jadeOpts = _.assign({
                pretty: true,
                pageTitle: variation.title,
                variations: [variation],
              }, opts.jadeVariables);

              clone.contents = new Buffer(jade.renderFile(opts.wrapper, jadeOpts));
              clone.path = clonePath;
              wstream = fs.createWriteStream(clonePath);
              wstream.write(clone.contents);
              wstream.end();
              outs.push(clone);
            });
          } else {
            var clone = file.clone();

            var jadeOpts = _.assign({
              pretty: true,
              pageTitle: variations[0].title,
              variations: variations,
            }, opts.jadeVariables);

            clone.contents = new Buffer(jade.renderFile(opts.wrapper, jadeOpts));
            clone.path = destPath;
            wstream = fs.createWriteStream(destPath);
            wstream.write(clone.contents);
            wstream.end();
            outs.push(clone);
          }
          cb(null, outs[0]);
        } catch(err) {
          cb(err, file);
        }
      });
    } catch(err) {
      cb(err, file)
    }
  });
};
