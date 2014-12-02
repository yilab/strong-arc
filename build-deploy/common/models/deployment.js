var performGitDeployment = require('strong-deploy/lib/git').performGitDeployment;
var performHttpPutDeployment = require('strong-deploy/lib/put-file').performHttpPutDeployment;
var performLocalDeployment = require('strong-deploy/lib/post-json').performLocalDeployment;
var request = require('request');

module.exports = function(Deployment) {
  Deployment.create = function(deployment, cb) {
    // TODO(ritch) handle custom CWDs
    var baseURL = 'http://' + deployment.host + ':' + deployment.port;

    resize();

    function deploy(err){
      if ( err ) return cb(err);

      if(deployment.type === 'local') {
        // Note: I strongly recommend a `deployment.processes` of 1 for local,
        // especially since its not configurable in the UI.
        var cwd = process.cwd();
        // args are: baseUrl, localdir, config, callback
        performLocalDeployment(baseURL, cwd, '', cb);
      } else if(deployment.type === 'git') {
        var cwd = process.cwd();
        // args are: workingDir, baseUrl, config, branch, callback
        performGitDeployment(cwd, baseURL, '', deployment.branch, cb);
      } else {
        // args are: baseURL, config, npmPkg, callback
        performHttpPutDeployment(baseURL, '', deployment.archive, cb);
      }
    }

    function resize() {
      request.put(baseURL + '/api/ServiceInstances/1', {
        json: true,
        body: {
          cpus: deployment.processes
        }
      }, deploy);
    }
  };

  Deployment.remoteMethod('create', {
    http: {verb: 'post', path: '/'},
    accepts: {arg: 'deployment', type: 'Deployment', http: {source: 'body'}},
    returns: {arg: 'deployment', type: 'Deployment', root: true}
  });
};