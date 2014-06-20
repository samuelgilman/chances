# Chances

A Node.js module to mange requesting a uri multiple times. Sometimes requested
pages return a bad status code, timeout, or fail for some reason that would be
resolved if the page was just requested again. Chances uses request to give a
request multiple tries before it returns with errors.

### Install

<pre>
npm install chances
</pre>


### Use 

The example below requests sends a request to a uri giving it several chances to
return successfully before failing.

    var chances = require('chances');
    
    var uri = 'http://www.thing.com';
    var limit = 10; // give the uri a max of 10 tries
    var tiemout = 5000; // for each try timeout after 5 seconds
    var interval = 2000; // then retry in 2 seconds
    var maxInterval = 10000; //the max interval
    var log = function (mes) { console.log(mes); } // your logger
    var gzip = true; // if true, chances will always return gzipped body,
                     // even if the server doesn't provides one.
    var requestOptions = {
      headers: {
        'User-Agent': 'foo'
      }
    }; // additional options of request
    var randomize = true; //if true, chances will randomize the interval
                          // the factor is between 1 and 1.5

    
    chances.process({

      uri: uri,
      limit: limit,
      timeout: timeout,
      interval: interval,
      maxInterval: maxInterval,
      requestOptions: requestOptions,
      gzip: gzip,
      log: log,
      randomize: randomize

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

### Retry Strategy & Interval

Now, after an request being luanched...

``timeout``ms later, if there's still no response, it would be regarded as a
failed attempt. The handling of this failed attemp is decided by `limit`.

When an attempt is failed, ``limit`` will decreases, if this `limit` hit the floor
(limit === 0), chances will stop trying and returning an error. If not,
chances will retry again after a while, the retry interval is decided by
`interval`, `maxInterval` and `randomize`.

The true interval is calculated from `interval`, `maxInterval` and `randomize`.

#### maxInterval
If `maxInterval` is set, chances will make sure that current `interval`
is less than `maxInterval`, if `interval > maxInterval`, `interval` will be set
to `maxInterval`.

#### factor & randomize
Each time we meet a failure, the interval will be multipled by a factor to make
it longer. If `randomize` is `true`, the factor will be a number between
1.0 and 1.5, otherwise it will be 1.5.
