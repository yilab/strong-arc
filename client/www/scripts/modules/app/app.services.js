// Copyright StrongLoop 2014
app.service('AppService', [
  '$location',
  '$state',
  function($location, $state) {
    var svc = {};
    svc.isViewAuth = function(stateName){
      switch(stateName){

      }
    };
    return svc;
  }
]);
app.service('AppStorageService', [
  '$rootScope',
  function($rootScope) {
    var svc = {};

    // namepsace for UI state storage
    var slScope = '';

    var getSlScope = function() {
      if ($rootScope.projectName) {
        slScope = $rootScope.projectName;
        return JSON.parse(window.localStorage.getItem($rootScope.projectName)) || {};
      }
      return null;
    };

    svc.setItem = function(itemName, item) {
      var localScope = getSlScope();
      if (localScope) {
        localScope[itemName] = item;
        window.localStorage.setItem(slScope, JSON.stringify(localScope));
      }

    };
    svc.getItem = function(itemName) {
      var localScope = getSlScope();
      if (localScope) {
        return localScope[itemName];
      }
      return null;

    };
    svc.removeItem = function(itemName) {
      var localScope = getSlScope();
      if (localScope) {
        delete localScope[itemName];
        window.localStorage.setItem(slScope, JSON.stringify(localScope));
        return localScope;
      }
      return null;

    };
    svc.clearActiveInstance = function() {
      svc.removeItem('activeInstance');
    };
    svc.clearStorage = function() {
      var localScope = getSlScope();
      if (localScope) {
        window.localStorage.removeItem(slScope);
      }

    };
    return svc;
  }
]);
app.service('NavigationService', [
  '$location',
  'Config',
  function($location, Config) {
    if ( Config.foo == 'bar' ) {

    }
    var svc = {};
    svc.postLogoutNav = function(){
      $location.path('/login');
    };
    return svc;
  }
]);
