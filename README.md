# Chances

A Node.js module to mange requesting a uri multiple times. Sometimes requested pages return a bad status code, timeout, or fail for some reason that would be resolved if the page was just requested again. Chances uses request to give a request multiple tries before it returns with errors.

### Install

<pre>
npm install chances
</pre>


### Use 

The example below requests sends a request to a uri giving it several chances to return successfully before failing.

    var chances = require('chances');
    
    var uri = 'http://www.thing.com';
    var limit = 10; // give the uri a max of 10 tries
    var tiemout = 5000; // for each try timeout after 5 seconds
    var interval = 2000; // then retry in 2 seconds
    var log = function (mes) { console.log(mes); } // your logger
    var gzip = true; // if true, chances will always return gzipped body,
                     // even if the server doesn't provides one.
    var requestOptions = {
      headers: {
        'User-Agent': 'foo'
      }
    }; // additional options of request
    
    chances.process({

      uri: uri,
      limit: limit,
      timeout: timeout,
      interval: interval,
      requestOptions: requestOptions,
      gzip: gzip,
      log: log

    }, function (err, result) {
  
      // if there is an err it will
      // be true. then use result.errs
      // to see what went wrong 

    });
    
    
### Result

    {
      uri: 'http://www.domain.com', // given uri
      errs: [], // errors collected along the way
      body: '<html>stuff</html>' // body html
    }
