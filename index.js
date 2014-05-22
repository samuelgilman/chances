var request = require('request');
var zlib = require('zlib');

module.exports = {

  process: function (params, next) {

    var that = this;
    var errs = (params.errs || []);
    var uri = params.uri;
    var limit = params.limit;
    var timeout = params.timeout;
    var interval = params.interval;
    var requestOptions = params.requestOptions;
    var gzip = params.gzip;
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
        timeout: timeout,
        gzip: gzip,
        requestOptions: requestOptions

      }, function (err, body) {

        if (err) {

          log(err);
          errs.push(err);

          // If NOT_ACCEPTABLE happened, we should request for plain HTML
          if(err.indexOf("NOT_ACCEPTABLE") !== -1) {

            gzip = false;
          
          }

          log('CHANCES_AGAIN * limit -> ' + limit + ' * interval -> ' + interval + ' * uri -> ' + uri);

          setTimeout(function () {
            that.process({
              uri: uri,
              limit: (limit-1),
              errs: errs,
              timeout: timeout,
              interval: interval,
              requestOptions: requestOptions,
              log: log,
              gzip: gzip
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
    var gzip = params.gzip;
    var options = params.requestOptions || {};

    options.uri = uri;
    options.timeout = timeout;

    if (gzip) {

      options.headers = options.headers || {};
      options.headers['accept-encoding'] = 'gzip';
      options.encoding = null;
    
    }

    request(options, function (err, res, body) {

      if (err) {

        err = ('REQUEST_ERROR * err -> ' + err + ' * timeout -> ' + timeout + ' * uri -> ' + uri);

      } else if (res.statusCode !== 200) {

        if (res.statusCode === 406) {

          err = ('REQUEST_NOT_ACCEPTABLE * uri -> ' + uri );
        
        } else {
        
          err = ('REQUEST_CODE_BAD * code -> (' + res.statusCode + ') * timeout -> ' + timeout + ' * uri -> ' + uri);

        }

      } else if (!body) {

        err = ('REQUEST_BODY_MISS * timeout -> ' + timeout + ' * uri -> ' + uri);

      } else {

        var responseHeaders = res.headers;
        var contentEncoding = responseHeaders['content-encoding'];
        if (gzip && contentEncoding !== 'gzip') {
          
          // If our customer asked for a gzipped version but the 
          // website doesn't provide it, we'll have to do it 
          // ourselves

          zlib.gzip(body, function (err, res) {

            var error;
            if (err) {
              error = err.toString(); 
            }
            next(error, res);
          
          });

        } else {

          next(err, body);
        
        }
      
      }

      if (err) {
      
        next(err);

      }

    });

  }

};
