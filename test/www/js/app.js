// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ionic-material', 'ionMdInput', 'ngMaterial', 'ngCordova', 'ngMessages', 'ngMdIcons'])

.run(['$timeout', '$helper', '$dbo', '$ionicPlatform', '$rootScope', '$localstorage', '$cordovaNetwork', '$mdToast', '$state', function($timeout, $helper, $dbo, $ionicPlatform, $rootScope, $localstorage, $cordovaNetwork, $mdToast, $state) {
    $rootScope.isOnline = navigator.onLine;
    var isSyncing = false;    
    $rootScope.$on("Main.Sync", function(event, args){
      if(!$rootScope.isOnline || isSyncing) return;
      isSyncing = true;
      $dbo.syncTo(function(list){
        $dbo.syncFrom(function(rowsAffected, rowsServer){
          console.log("MAIN SYNC " + rowsAffected + "/" + rowsServer);          
          isSyncing = false;
          if(args && args.done) args.done();
        }, false, list);
      });
    });

    $rootScope.$watch(function(){                
      return JSON.stringify($rootScope.pref);
    }, function(vl, o){
      if(vl) {
        $localstorage.set("pref", vl);
      }
    });

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)        
        if (window.cordova) {          
            if(window.cordova.plugins.Keyboard) {
              cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
              cordova.plugins.Keyboard.disableScroll(true);
            }
            //var type = $cordovaNetwork.getNetwork();            
            if($rootScope.isOnline) $helper.initAdmob(0);            
            $rootScope.admobBanner = $rootScope.isOnline;
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
              $rootScope.isOnline = true;
              $rootScope.admobBanner = $rootScope.isOnline;
              $helper.initAdmob(0);
              var defaultPage = window.localStorage.getItem("defaultPage");
              if(defaultPage){
                $rootScope.$broadcast("Main.Sync");
              }
              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.online));
            });
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
              $rootScope.isOnline = false;
              // $rootScope.admobBanner = $rootScope.isOnline;
              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.offline));
            });            
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        $helper.config(false, function(){
            if($localstorage.get("isInstallDb", "0") == "0"){  
                $dbo.setup(function(){
                    $localstorage.set("isInstallDb", "1");
                    console.log("Created schema database done");
                    $timeout(function() {
                        $state.go('app.login');
                    });
                });
            }else{
                console.log("Reuse schema database");
                var defaultPage = window.localStorage.getItem("defaultPage");
                if(defaultPage){
                    $rootScope.$broadcast("Main.Sync");
                    $timeout(function() {
                        $state.go('app.dashboard');
                    });
                }else{
                    $timeout(function() {
                        $state.go('app.login');
                    });
                }
            }
        });
    });
}])

.config(['$mdThemingProvider', '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', function($mdThemingProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('orange')
    .warnPalette('red');

    // Turn off caching for demo simplicity's sake
    $ionicConfigProvider.views.maxCache(0);
    // Turn off back button text
    // $ionicConfigProvider.backButton.previousTitleText(false);
    

    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.config', {
        url: '/config',
        views: {
            'menuContent': {
                templateUrl: 'templates/config.html',
                controller: 'ConfigCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.additionBy', {
        url: '/addition/:id',
        views: {
            'menuContent': {
                templateUrl: 'templates/addition.html',
                controller: 'AdditionCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

	.state('app.addition', {
        url: '/addition',
        views: {
            'menuContent': {
                templateUrl: 'templates/addition.html',
                controller: 'AdditionCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.listMonthly', {
        url: '/listMonthly',
        views: {
            'menuContent': {
                templateUrl: 'templates/list_monthly.html',
                controller: 'ListMonthlyCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.listCharts', {
        url: '/listCharts',
        views: {
            'menuContent': {
                templateUrl: 'templates/list_charts.html',
                controller: 'ListChartsCtrl'
            },
            'fabContent': {
                template: '<button id="fab-filterCharts" on-tap="openSearch()" class="button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-android-search"></i></button>',
                controller: ['$timeout', '$scope', '$rootScope', function ($timeout, $scope, $rootScope) {
                    $scope.openSearch = function(){
                        $rootScope.$broadcast("ListChartsCtrl.OpenSearch");
                    }
                    $timeout(function () {
                        document.getElementById('fab-filterCharts').classList.toggle('on');
                    }, 200);
                }]
            }
        }
    })

    .state('app.dashboardBy', {
        url: '/dashboard/:createdDate',
        views: {
            'menuContent': {
                templateUrl: 'templates/dashboard.html',
                controller: 'DashboardCtrl'
            },
            'fabContent': {                
                template: '<button id="fab-dashboard" ui-sref="app.addition" class="button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-plus-round"></i></button>',
                controller: ['$timeout', function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-dashboard').classList.toggle('on');
                    }, 200);
                }]
            }
        }
    })

    .state('app.dashboard', {
        url: '/dashboard',
        views: {
            'menuContent': {
                templateUrl: 'templates/dashboard.html',
                controller: 'DashboardCtrl'
            },
            'fabContent': {                
                template: '<button id="fab-dashboard" ui-sref="app.addition" class="button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-plus-round"></i></button>',
                controller: ['$timeout', function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-dashboard').classList.toggle('on');
                    }, 200);
                }]
            }
        }
    })

    .state('app.wallet', {
        url: '/wallet',
        views: {
            'menuContent': {
                templateUrl: 'templates/wallet.html',
                controller: 'WalletCtrl'
            },
            'fabContent': {
                template: '<button id="fab-dashboard" on-tap="addNew()" class="button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-plus-round"></i></button>',
                controller: ['$timeout', '$rootScope', '$scope', function ($timeout, $rootScope, $scope) {
                    $scope.addNew = function(){
                        $rootScope.$broadcast("AddWalletCtrl.AddNew");
                    };
                    $timeout(function () {
                        document.getElementById('fab-dashboard').classList.toggle('on');
                    }, 200);
                }]
            }
        }
    })

    .state('app.category', {
        url: '/category',
        views: {
            'menuContent': {
                templateUrl: 'templates/category.html',
                controller: 'CategoryCtrl'
            },
            'fabContent': {
                template: '<button id="fab-dashboard" on-tap="addNew()" class="button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-plus-round"></i></button>',
                controller: ['$timeout', '$rootScope', '$scope', function ($timeout, $rootScope, $scope) {
                    $scope.addNew = function(){
                        $rootScope.$broadcast("CategoryCtrl.AddNew");
                    };
                    $timeout(function () {
                        document.getElementById('fab-dashboard').classList.toggle('on');
                    }, 200);
                }]
            }
        }
    })

    ;
    
}])

;
