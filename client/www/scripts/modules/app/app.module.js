// Application Constants
var CONST = {
  NEW_MODEL_PRE_ID: 'sl.temp.new-model',
  NEW_MODEL_NAME: 'newModel',
  NEW_MODEL_FACET_NAME: 'common',
  NEW_MODEL_BASE: 'Model',
  NEW_DATASOURCE_PRE_ID: 'sl.temp.new-datasource',
  NEW_DATASOURCE_NAME: 'newDatasource',
  NEW_DATASOURCE_FACET_NAME: 'server',
  DATASOURCE_TYPE: 'datasource',
  DEFAULT_DATASOURCE: 'none',
  DEFAULT_DATASOURCE_BASE_MODEL: 'PersistedModel',
  MODEL_TYPE: 'model',
  APP_FACET: 'server',
};

var app = angular.module('app', [
  'ui.router',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'angularSpinner',
  'elasticsearch',
  'ngCookies',
  'angular-growl',
  'lbServices',
  'oldServices',
  'Profile',
  'IA',
  'Common',
  'Property',
  'Discovery',
  'Model',
  'Landing',
  'Advisor',
  'UI',
  'Datasource',
  'Explorer',
  'ui.bootstrap',
  'ui.utils',
  'checklist-model',
  'ngGrid'
]);
app.value('CONST', CONST);
app.config(['growlProvider', function (growlProvider) {
  growlProvider.globalTimeToLive(1800);
}]);
app.config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push('requestInterceptor');
  }
]);
app.config([
  '$stateProvider',
  '$urlRouterProvider',

  function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider.
      state('home', {
        url: '/',
        controller: 'HomeMainController',
        templateUrl: './scripts/modules/app/templates/home.main.html'
      }).
      state('devtools', {
        url: '/devtools',
        templateUrl: './scripts/modules/app/templates/devtools.html',
        controller: 'DevToolsController'
      }).
      state('studio', {
        url: '/studio',
        templateUrl: './scripts/modules/app/templates/studio.main.html',
        controller: 'StudioController',
        resolve: {
          // Wait for all metadata requests to finish
          'studioMetadataResults': [
            'modelPropertyTypes',
            'connectorMetadata',
            '$q',
            function waitForAllStudioMetadata(modelPropertyTypes,
                                              connectorMetadata,
                                              $q) {
              return $q.all([
                connectorMetadata.$promise,
                modelPropertyTypes.$promise
              ]);
            }
          ]
        }
      })
      .state('landing', {
        url: '/landing',
        templateUrl: './scripts/modules/landing/templates/landing.main.html',
        controller: 'LandingController'
      })
      .state('advisor', {
        url: '/advisor',
        templateUrl: './scripts/modules/advisor/templates/advisor.main.html',
        controller: 'AdvisorController'
      })
      .state('login', {
        url: '/login',
        controller: 'LoginController',
        templateUrl: './scripts/modules/profile/templates/login.html'
      }).
      state('register', {
        url: '/register',
        controller: 'RegisterController',
        templateUrl: './scripts/modules/profile/templates/register.html'
      });

  }
]);
app.factory('requestInterceptor', [
  '$q',
  '$rootScope',
  '$location',
  '$cookieStore',
  function ($q, $rootScope, $location, $cookieStore) {
    function isLocal(url, host){
      var isLocal = false;

      if ( url.indexOf('./') === 0 || url.indexOf('/') === 0 ) {
        isLocal = true;
      } else if ( url.indexOf(host) > -1 ) {
        isLocal = true;
      }

      return isLocal;
    }

    return {
      'request': function (config) {
        var at = $cookieStore.get('accessToken');
        if (at) {
          if ( isLocal(config.url, $location.host()) ) {
            config.headers.authorization = at;
          } else {
            delete config.headers.authorization;
          }
        }
        else {
          // allow users to get to home view
          // any other navigation requires login
          if ($location.path() !== '/') {
            $location.path('/login');
          }
        }
        return config || $q.when(config);
      },
      responseError: function (rejection) {
        if (rejection.status == 401) {
          $location.path('/login');
        }
        if ((rejection.status > 499) || (rejection.status === 422)) {

          $rootScope.$broadcast('GlobalExceptionEvent', {
              requestUrl: rejection.config.url,
              message: rejection.data.error.message,
              details: rejection.data.error.details,
              name: rejection.data.error.name,
              stack: rejection.data.error.stack,
              code: rejection.data.error.code,
              status: rejection.status
            }
          );
        }
        return $q.reject(rejection);
      }
    };
  }
]);

// global autofocus
app.factory('Focus', [
  '$rootScope', '$timeout', (function ($rootScope, $timeout) {
    return function (name) {
      return $timeout(function () {
        return $rootScope.$broadcast('focusOn', name);
      });
    };
  })
]);


app.controller('MainNavController', [
  '$scope',
  '$location',
  function ($scope, $location) {

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

  }
]);

// Get project name from package.json
app.run(['$rootScope', 'PackageDefinition', function ($rootScope, PackageDefinition) {
  var pkg = PackageDefinition.findOne();
  return pkg.$promise
    .then(function () {
      $rootScope.projectName = pkg.name;
    })
    .catch(function (err) {
      console.warn('Cannot get project\'s package definition.', err);
    });
}]);
