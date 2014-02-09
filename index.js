var request = require('request');

module.exports = {

  process: function (params, next) {

    var that = this;
    var errs = (params.errs || []);
    var uri = params.uri;
    var limit = params.limit;
    var timeout = params.timeout;
    var interval = params.interval;
    var log = params.log || (function () {});

    if (!limit) {

      log('CHANCES_GONE * limit -> ' + limit + ' * interval -> ' + interval + ' * uri -> ' + uri);

      next(true, {
        uri: uri,
        errs: errs,
        body: false
      });

    } else {

      that.crawl({

        uri: uri,
        timeout: timeout

      }, function (err, body) {

        if (err) {

          log(err);
          errs.push(err);

          log('CHANCES_AGAIN * limit -> ' + limit + ' * interval -> ' + interval + ' * uri -> ' + uri);

          setTimeout(function () {
            that.process({
              uri: uri,
              limit: (limit-1),
              errs: errs,
              timeout: timeout,
              interval: interval,
              log: log
            }, next);
          }, interval);

        } else {

          log('CHANCES_SUCCESSFUL * limit -> ' + limit + ' * interval -> ' + interval + ' * uri -> ' + uri);

          next(undefined, {
            uri: uri,
            errs: errs,
            body: body
          });

        }

      });

    }

  },

  crawl: function (params, next) {

    var that = this;
    var uri = params.uri;
    var timeout = params.timeout;

    request({

      uri: uri,
      timeout: timeout

    }, function (err, res, body) {

      if (err) {

        err = ('REQUEST_ERROR * err -> ' + err + ' * timeout -> ' + timeout + ' * uri -> ' + uri);

      } else if (res.statusCode !== 200) {

        err = ('REQUEST_CODE_BAD * code -> (' + res.statusCode + ') * timeout -> ' + timeout + ' * uri -> ' + uri);

      } else if (!body) {

        err = ('REQUEST_BODY_MISS * timeout -> ' + timeout + ' * uri -> ' + uri);

      }

      next(err, body);

    });

  }

};
