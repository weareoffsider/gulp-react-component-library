var gutil = require("gulp-util")
    mkdirp = require("mkdirp"),
    through = require("through2"),
    jade = require("jade"),
    React = require("react/addons"),
    es = require("event-stream"),
    fs = require("fs"),
    streamFromArray = require("stream-from-array");

module.exports = function(opts) {
  opts = opts || {};
  if (!opts.data) throw new Error("No data Directory provided.");
  if (!opts.dest) throw new Error("No Destination Directory provided.");
  if (!opts.wrapper) throw new Error("No Wrapper Template provided.");

  return through.obj(function(file, enc, cb) {
    var Template = require(file.history[0]);
    var requirePath = file.relative;
    try {
      var pageData = require(process.cwd() + "/" + opts.data + "/" + requirePath);
    } catch (err) {
      var pageData = null;
    }

    if (!Template.applyToStyleguide && !pageData) {
      return cb(null, null);
    }

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
    file.path = segments.join("/");

    mkdirp(dirPath, function(err) {
      if (err) return cb(err);

      var variations = dataKeys.map(function(key) {
        var props = pageData[key];
        var element = React.createElement( Template, props, [] );
        var pageTitle = Template.getPageTitle ? Template.getPageTitle(props)
                                              : null;
        var pageHTML = React.renderToStaticMarkup(element);
        return {
          key: key,
          requirePath: "./" + requirePath,
          title: pageTitle,
          html: pageHTML,
          json: JSON.stringify(props),
          props: props,
        }
      });

      var outs = [];
      if (isPaged) {
        variations.forEach(function(variation) {
          var clone = file.clone();
          if (variation.key !== "default") {
            clone.path = gutil.replaceExtension(clone.path, "-" + variation.key + ".html");
          }
          var jadeOpts = {
            pretty: true,
            pageTitle: variation.title,
            variations: [variation],
          };

          clone.contents = new Buffer(jade.renderFile(opts.wrapper, jadeOpts));
          wstream = fs.createWriteStream(opts.dest + "/" + clone.relative);
          wstream.write(clone.contents);
          wstream.end();
          outs.push(clone);
        });
      } else {
        var clone = file.clone();

        var jadeOpts = {
          pretty: true,
          pageTitle: variations[0].title,
          variations: variations,
        };

        clone.contents = new Buffer(jade.renderFile(opts.wrapper, jadeOpts));
        wstream = fs.createWriteStream(opts.dest + "/" + clone.relative);
        wstream.write(clone.contents);
        wstream.end();
        outs.push(clone);
      }
      cb(null, outs[0]);
    });
  });
};
