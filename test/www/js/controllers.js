/* global angular, document, window */
'use strict';

angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', ['$location', '$helper', '$dbo', '$ionicHistory', '$ionicPlatform', '$scope', '$timeout', '$state', '$rootScope', '$ionicSideMenuDelegate', 'ionicMaterialMotion', 'ionicMaterialInk', '$mdDialog', function($location, $helper, $dbo, $ionicHistory, $ionicPlatform, $scope, $timeout, $state, $rootScope, $ionicSideMenuDelegate, ionicMaterialMotion, ionicMaterialInk, $mdDialog) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;
    $rootScope.isOnline = navigator.onLine;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        }); 
    }
    var isQuitApp = false;
    $ionicPlatform.registerBackButtonAction(function () {      
      if($location.path().toLowerCase().indexOf('login') == -1 && $location.path().toLowerCase().indexOf('dashboard') == -1){
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go("app.dashboard", {}, {location: 'replace'});
      }else if(!isQuitApp){
        if($rootScope.isLoading){
          $rootScope.isLoading = false;
        }else if($rootScope.i18){
          isQuitApp = true;
          var confirm = $mdDialog.confirm({
            title : $rootScope.i18.app.dialog_quit_title,
            content : $rootScope.i18.app.dialog_quit_content,
            ariaLabel : $rootScope.i18.app.dialog_quit_label,
            ok : $rootScope.i18.app.dialog_quit_ok,
            cancel : $rootScope.i18.app.dialog_quit_cancel
          });
          $mdDialog.show(confirm).then(function() {
            // $helper.initAdmob(1);
            navigator.app.exitApp();
          }, function() {
            isQuitApp = false;
          });
        }else{
          // $helper.initAdmob(1);
          navigator.app.exitApp();
        }
      }
    }, 100);

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {        
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };
    var recount = 0;
    $scope.setRecount = function(rc){    
      $rootScope.isLoading = true;  
      recount = rc;
    }
    $scope.recount = function(fcDone){
      --recount;
      if(fcDone) fcDone(recount);
      if(recount <= 0){
        $scope.$apply();
        $rootScope.isLoading = false;
      }
    }

    $scope.logout = function(ev){
      console.log('logout');
      var logout = function(){
        $rootScope.isLoading = true;        
        console.log("CLEAR DATA");    
        $dbo.clear(function(){          
          $helper.config(true, function(){
            $rootScope.isLoading = false;
            $ionicSideMenuDelegate.toggleRight();                    
            $ionicHistory.nextViewOptions({
              disableBack: true
            });
            $state.go("app.login", {}, {location: 'replace'});
            //navigator.app.exitApp();
          });          
        });
      };      
      var tables = cf.SYNC_TABLE;
      $dbo.readTransaction(function(tx){
        var canLogout = true;
        var finishCheck = function(){
          if(canLogout){
            logout();
          }else{
            var alert = $mdDialog.alert({
              title : $rootScope.i18.config.dialog_logout_title,
              content : $rootScope.i18.config.dialog_logout_content,
              ariaLabel : $rootScope.i18.config.dialog_logout_label,
              ok : $rootScope.i18.config.dialog_logout_ok,
              ev: ev
            });
            $mdDialog.show(alert).then(function() {              
              $state.go("app.config");
              $ionicSideMenuDelegate.toggleRight();
            });
          }
        };
        var checkNewRecords = function(tx, index){
          if(index < tables.length){            
            tx.execSql("SELECT * FROM " + tables[index++] + " WHERE is_sync < 1 LIMIT 1", [], function(tx, rs){
              if(rs.rows.length == 0){
                checkNewRecords(tx, index);
              }else{
                canLogout = false;
                finishCheck();
              }
            });
          }else{
            finishCheck();
          }          
        };
        checkNewRecords(tx, 0);
      });
    };

    $scope.loadEffect = function(effectClass){
      effectClass = '.animate-fade-slide-in .' + (effectClass ? effectClass : 'item');
      $timeout(function(){
        ionicMaterialMotion.fadeSlideInRight({
            selector: effectClass
        });
        ionicMaterialInk.displayEffect();
      }, 50);
    };

}])

.controller('ConfigCtrl', ['$rootScope', '$helper', '$dbo', '$scope', '$mdDialog', '$mdToast', function($rootScope, $helper, $dbo, $scope, $mdDialog, $mdToast) {
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = true;
  $scope.$parent.setExpanded(true);
  $scope.$parent.setHeaderFab(false);
  $scope.stateSync = 1;

  var tables = cf.SYNC_TABLE;
  $dbo.readTransaction(function(tx){
    var checkNewRecords = function(tx, index){
      if(index < tables.length){
        tx.execSql("SELECT ID FROM " + tables[index++] + " WHERE is_sync < 1 LIMIT 1", [], function(tx, rs){
          if(rs.rows.length == 0){
            checkNewRecords(tx, index);
          }else{
            $scope.stateSync = -1;
          }
        });
      }else if($scope.stateSync != -1 && $rootScope.isOnline){
        var checkOnlineNewRecords = function(index){
          if(index < tables.length){
            var tableName = tables[index++];
            var TableClass = Parse.Object.extend(tableName);
            var query = new Parse.Query(TableClass);
            query.select("ID");          
            query.equalTo("email", $rootScope.me.email);
            query.greaterThan("updatedAt", new Date($rootScope.pref.sync.lastDown[tableName]));
            query.count({
              success: function(count) {                
                if(count > 0){
                  $scope.stateSync = -1;
                }else{
                  checkOnlineNewRecords(index);
                }
              }
            });
          }
        }
        checkOnlineNewRecords(0);
      }
    };
    checkNewRecords(tx, 0);
  });

  $scope.changeLanguage = function(){
    $helper.changeLanguage($rootScope.pref.locale);
  }

  $scope.earse = function(){
    if(!$rootScope.isOnline) return;
    var tables = cf.SYNC_TABLE;
    var count = 0;
    var remove = function(index, fcDone, fcError){
      if(index < tables.length){
        var tableName = tables[index++];
        var TableClass = Parse.Object.extend(tableName);
        var query = new Parse.Query(TableClass);
        query.equalTo("email", $rootScope.me.email);          
        query.find({
          success: function(list) {
            Parse.Object.destroyAll(list).then(function(success) {              
              count += success.length;
              remove(index, fcDone, fcError);
            },fcError);
          }
        });
      }else{
        console.log('Delete all ' + count + ' from server');
        if(fcDone) fcDone(count);
      }
    };
    var confirm = $mdDialog.confirm({
      title : $rootScope.i18.config.dialog_earse_title,
      content : $rootScope.i18.config.dialog_earse_content,
      ariaLabel : $rootScope.i18.config.dialog_earse_label,
      ok : $rootScope.i18.config.dialog_earse_ok,
      cancel : $rootScope.i18.config.dialog_earse_cancel
    });
    $mdDialog.show(confirm).then(function() {
      $rootScope.isLoading = true;
      remove(0, function(count){
        $rootScope.isLoading = false;
        $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.config.earsed_done));
      }, function(error){
        $rootScope.isLoading = false;
        $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.config.earsed_error));
      });
    });
  }

  $scope.sync = function() {  
    if($scope.stateSync >= 0) return;
    $helper.checkOnline(function(){
      $scope.stateSync = 0;   
      $rootScope.$broadcast("Main.Sync", {done: function(){
        $scope.$apply(function(){
            $scope.stateSync = 1;
          });
      }});      
    });      
  };

}])

.controller('LoginCtrl', ['$ionicHistory', '$helper', '$dbo', '$scope', '$timeout', 'ionicMaterialInk', '$rootScope', '$cordovaOauth', '$http', '$localstorage', '$state', '$mdDialog', function($ionicHistory, $helper, $dbo, $scope, $timeout, ionicMaterialInk, $rootScope, $cordovaOauth, $http, $localstorage, $state, $mdDialog) {    
    $scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();     

    var loginDone = function(fcDone){
      var installDb = function(rowsAffected, rowsServer, lang){
        console.log(rowsAffected +"/" + rowsServer);
        if(rowsServer == 0){
          console.log("Installing default data " + lang);
          $dbo.install(db[lang], function(){
            $rootScope.$broadcast("Main.Sync");
            if(fcDone) fcDone();
          });
        }else if(rowsServer == rowsAffected){
            console.log("Installed " + rowsAffected + " from server");
            if(fcDone) fcDone();
        }else{
          console.log("Installed error " + rowsAffected +"/"+rowsServer);
          $dbo.clear(function(){
            $rootScope.isLoading = false;
            $ionicHistory.nextViewOptions({
              disableBack: true
            });
            $state.go("app.login", {}, {location: 'replace', reload: true});
          });          
        }
      };
      console.log("Login done");
      $rootScope.isLoading = false;
      $mdDialog.show({
        controller: ['$scope', 'theScope', '$mdToast', '$localstorage', function($scope, theScope, $mdToast, $localstorage){
          $scope.choose = function(lang){
            $mdDialog.cancel();
            $rootScope.isLoading = true;
            $helper.changeLanguage(lang, function(){                
              $rootScope.pref.currency = $rootScope.i18.common.currency;
              $rootScope.pref.locale = $rootScope.i18.common.locale;                
              $dbo.syncFrom(function(rowsAffected, rowsServer){
                installDb(rowsAffected, rowsServer, lang);
              }, true);                
            });                  
          };
        }],
        templateUrl: '/choose_language.temp.html',
        parent: angular.element(document.body),
        clickOutsideToClose:false,
        locals: {
            theScope: $scope
        }
      });    
    };

    $scope.facebookLogin = function() {
      if(cf.DEBUG){
        $rootScope.isLoading = true;
        $rootScope.me = cf.ACCOUNT_TEST;
        $localstorage.setObject("me", $rootScope.me);        
        loginDone(function(){          
          $rootScope.isLoading = false;
          $rootScope.isOnline = true;
          $localstorage.set("defaultPage", "/app/dashboard");
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go("app.dashboard", {}, {location: 'replace'});
        }); 
        return;
      }
      $cordovaOauth.facebook("530533497113800", ["email"]).then(function(result) {        
        $rootScope.isLoading = true;
        $http.get("https://graph.facebook.com/v2.5/me", { params: { access_token: result.access_token, fields: "id,name,email", format: "json" }}).then(function(result) {
          $rootScope.me = {name: result.data.name, email: result.data.email, type: "facebook"};
          // Save avata
          var img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = function(){
              var canvas = document.createElement('canvas');
              var ctx = canvas.getContext("2d");
              var dataURL;
              canvas.height = this.height;
              canvas.width = this.width;
              ctx.drawImage(this, 0, 0);

              $rootScope.me.avata = canvas.toDataURL();
              $localstorage.setObject("me", $rootScope.me);

              loginDone(function(){
                $rootScope.isLoading = false;                                
                $localstorage.set("defaultPage", "/app/dashboard");
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                $state.go("app.dashboard", {}, {location: 'replace'});
              });              

              canvas = null; 
          };
          img.onerror = function(){
            $rootScope.me.avata = null;
            $localstorage.setObject("me", $rootScope.me);
            loginDone(function(){
              $rootScope.isLoading = false;              
              $localstorage.set("defaultPage", "/app/dashboard");
              $ionicHistory.nextViewOptions({
                disableBack: true
              });
              $state.go("app.dashboard", {}, {location: 'replace'});
            });  
          }
          img.src = "http://graph.facebook.com/"+result.data.id+"/picture?type=normal";
        }, function(error) {            
            console.log(error);
        });        
      }, function(error) {
        console.log(error);
      });
    };

    $scope.googleLogin = function(){      
      $cordovaOauth.google("1024845392530-afg3q5bbgq3n75mvf33d5ptmdpv7slu9.apps.googleusercontent.com", [
        "https://www.googleapis.com/auth/plus.login", "https://www.googleapis.com/auth/plus.me", 
        "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"
        ]).then(function(result) {
          $rootScope.isLoading = true;
          $http({
            method: "GET",
            url: "https://www.googleapis.com/oauth2/v2/userinfo",
            headers: {
              "Authorization": result.token_type + " " + result.access_token
            }
          }).then(function(result0){
            $http({
              method: "GET",
              url: "https://www.googleapis.com/plus/v1/people/" + result0.data.id + "?fields=displayName,emails/value,id,image/url",
              headers: {
                "Authorization": result.token_type + " " + result.access_token
              }
            }).then(function(result){
              $rootScope.me = {name: result.data.displayName, email: result.data.emails[0].value, type: "gmail"};
              // Save avata
              var img = new Image();
              img.crossOrigin = "Anonymous";
              img.onload = function(){
                  var canvas = document.createElement('canvas');
                  var ctx = canvas.getContext("2d");
                  var dataURL;
                  canvas.height = this.height;
                  canvas.width = this.width;
                  ctx.drawImage(this, 0, 0);

                  $rootScope.me.avata = canvas.toDataURL();
                  $localstorage.setObject("me", $rootScope.me);

                  loginDone(function() {
                    $rootScope.isLoading = false;                                        
                    $localstorage.set("defaultPage", "/app/dashboard");
                    $ionicHistory.nextViewOptions({
                      disableBack: true
                    });
                    $state.go("app.dashboard", {}, {location: 'replace'});
                  });  

                  canvas = null; 
              };
              img.onerror = function(){
                $localstorage.setObject("me", $rootScope.me);
                loginDone(function(){
                  $rootScope.isLoading = false;                  
                  $localstorage.set("defaultPage", "/app/dashboard");
                  $ionicHistory.nextViewOptions({
                    disableBack: true
                  });
                  $state.go("app.dashboard", {}, {location: 'replace'});
                });  
              }
              img.src = result.data.image.url.replace(/sz=(\d+)/, "sz=100");;
            }, function(error){
              console.log(error);
            });
          }, function(error){
            console.log(error);
          });
        });
    };

}])

.controller('AdditionCtrl', ['$q', '$helper', '$dbo', '$scope', '$stateParams', '$rootScope', '$mdToast', '$ionicHistory', '$mdDialog', '$state', function($q, $helper, $dbo, $scope, $stateParams, $rootScope, $mdToast, $ionicHistory, $mdDialog, $state) {
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = true;
  $scope.$parent.setExpanded(true);
  $scope.$parent.setHeaderFab(false);

  $scope.today = new Date();
  $scope.bean = { description: "", createdDate: $scope.today, isReport: 1, getType: function(){return $scope.tabIndex == 0 ? $scope.bean.typeSpending.ID : $scope.bean.typeEarning.ID;}};
  $scope.tabIndex = 0;
  
  $scope.typeSpending = [];
  $scope.typeEarning = [];
  $scope.wallet = [];

  $scope.focusMoneyField = function(formName){
    document.forms[formName].money.focus();
    document.forms[formName].money.click();
  }

  var limitSuggestTime = new Date();
  limitSuggestTime.setMonth(limitSuggestTime.getMonth() - cf.LIMIT_SUGGESTION_MONTH);

  var _querySearch = function(txt){
    txt = txt.toLowerCase();
    var deferred = $q.defer();
    var suggestion = [];
    $dbo.readTransaction(function(tx){
      tx.execSql("SELECT distinct des from Spending WHERE created_date > " + limitSuggestTime.getTime() + " AND udes LIKE '%" + txt + "%'", [], function (tx,rs){          
        rs.toBean(suggestion);
        deferred.resolve(suggestion);
      }, function(){
        deferred.resolve(suggestion);
      });
    });
    return deferred.promise;
  }
  $scope.querySearch = function(txt){
    return _querySearch(txt).then(function(rs){      
      return rs;
    });
  };
  $scope.loadData = function(){    
    var id = $stateParams.id;
    $scope.setRecount(id ? 3 : 2);
    var applyBeanData = function(count){
      if(id && count <= 0){
        for(var i in $scope.wallet){
          var item = $scope.wallet[i];
          if(item.ID == $scope.bean.wallet){
            $scope.bean.wallet = item;
            break;
          }
        }
        var isBreak = false;
        for(var i in $scope.typeSpending){
          var item = $scope.typeSpending[i];
          if(item.ID == $scope.bean.typeSpending){
            $scope.bean.typeSpending = item;
            isBreak = true;
            break;
          }
        }
        if(!isBreak){
          for(var i in $scope.typeEarning){
            var item = $scope.typeEarning[i];
            if(item.ID == $scope.bean.typeSpending){
              $scope.bean.typeSpending = item;
              isBreak = true;
              break;
            }
          }
        }
      }
    }
    $dbo.readTransaction(function(tx){
      if(id){
        tx.execSql("SELECT * from Spending WHERE ID = ? AND removed = 0", [id], function (tx,rs){
          if(rs.rows.length > 0) {
            var item = rs.rows.item(0);
            $scope.bean.description = item.des;
            $scope.bean.createdDate = new Date(item.created_date);
            $scope.bean.money = item.money;
            $scope.bean.type = item.type;
            $scope.bean.wallet = item.wallet_id;
            $scope.bean.typeSpending = item.type_spending_id;
            $scope.bean.isReport = item.is_report;
            $scope.bean.isOldReport = item.is_report;            
            $scope.tabIndex = $scope.bean.type < 0 ? 0 : 1;
          }
          $scope.recount(applyBeanData);
        });
      }
      tx.execSql("SELECT * from TypeSpending WHERE (type = -1 OR type = 1) AND removed = 0 ORDER BY parent_id, oder", [], function (tx,rs){
        var tmp = {};
        for(var i=0; i< rs.rows.length; i++){
          var item = rs.rows.item(i);
          if(item.parent_id){                     
            if(!tmp["_" + item.parent_id]) tmp["_" + item.parent_id] = {};
            if(!tmp["_" + item.parent_id].inner) tmp["_" + item.parent_id].inner = [];
            tmp["_" + item.parent_id].inner.push(item);            
          }else{
            if(tmp["_" + item.ID] && tmp["_" + item.ID].inner){
              item.inner = tmp["_" + item.ID].inner;
            }
            tmp["_" + item.ID] = item;
          }              
        }
        for(var i in tmp){
          var item = tmp[i];
          if(item.type < 0){
            $scope.typeSpending.push(item);
          }else{
            $scope.typeEarning.push(item);
          }
        }
        $scope.tabFocus($scope.bean.type ? ($scope.bean.type < 0 ? 0 : 1) : 0);    
        $scope.recount(applyBeanData);
      });

      tx.execSql("SELECT * from Wallet WHERE removed = 0 ORDER BY avail DESC, oder", [], function (tx,rs){
        rs.toBean($scope.wallet);
        if(!$scope.bean.wallet && $scope.wallet.length > 0){
          $scope.bean.wallet = $scope.wallet[0];
        }
        $scope.recount(applyBeanData);
      });      

    });    
  }  

  $scope.tabFocus = function(index){
    $scope.tabIndex = index;    
    if(!$scope.bean.typeSpending && index == 0 && $scope.typeSpending.length > 0)    
        $scope.bean.typeSpending = $scope.typeSpending[0];
    else if(!$scope.bean.typeEarning && $scope.typeEarning.length > 0)        
      $scope.bean.typeEarning = $scope.typeEarning[0];          
  }

  $scope.onlyWeekendsPredicate = function(date) {
    var day = date.getDay();
    return day === 0 || day === 6;
  }

  $scope.save = function(formName, ev){
    var a = angular.element(document.querySelector('#' + formName));
    if(a.hasClass("ng-valid")){
      $dbo.transaction(function(tx){
        if($stateParams.id){
          tx.execSql("UPDATE Spending set is_sync = 0, created_date = ?, created_day = ?, created_month = ?, created_year = ?, type_spending_id = ?, des = ?, udes = ?, is_report = ? WHERE ID = ?", [$scope.bean.createdDate.getTime(), $scope.bean.createdDate.getDate(), $scope.bean.createdDate.getMonth(), $scope.bean.createdDate.getFullYear(), $scope.bean.getType(), $scope.bean.description, $helper.unsignedString($scope.bean.description), $scope.bean.isReport, $stateParams.id], function (tx,rs){
            if(rs.rowsAffected > 0) {
              if($scope.bean.isOldReport != $scope.bean.isReport){
                var moneyBack = $scope.bean.money*($scope.bean.isReport == 0 ? -1 : 1)*($scope.tabIndex == 0 ? -1 : 1);
                tx.execSql("UPDATE Wallet SET is_sync = 0, money = money + ? WHERE ID = ?", [moneyBack, $scope.bean.wallet.ID], function (tx,rs){
                  if(rs.rowsAffected > 0) {
                    $scope.bean.description = "";
                    $scope.bean.creditor = "";
                    for(var i in $scope.wallet){
                      if($scope.wallet[i].ID == $scope.bean.wallet.ID){
                        $scope.wallet[i].money += moneyBack;
                        break;
                      }
                    } 
                    $rootScope.$broadcast("Main.Sync");
                    $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_ok));
                    $ionicHistory.goBack();
                  }else{
                    $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_toWallet_fail));
                  }
                }, function(err){      
                  $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_toWallet_fail));
                });
              }else{
                $rootScope.$broadcast("Main.Sync");
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_ok));
                $ionicHistory.goBack();
              }
            }else{
              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail));
            }
          }, function(err){      
            $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail));
          });
        }else{
          tx.execSql("INSERT INTO Spending(money, created_date, created_day, created_month, created_year, type_spending_id, wallet_id, des, udes, type, is_sync, email, is_report, ID) values(?, ?, ?, ?, ? ,? , ?, ?, ?, ?, 0, ?, ?, ?)", [$scope.bean.money, $scope.bean.createdDate.getTime(), $scope.bean.createdDate.getDate(), $scope.bean.createdDate.getMonth(), $scope.bean.createdDate.getFullYear(), $scope.bean.getType(), $scope.bean.wallet.ID, $scope.bean.description, $helper.unsignedString($scope.bean.description), $scope.tabIndex == 0 ? -1 : 1, $rootScope.me.email, $scope.bean.isReport, $helper.getUID()], function (tx,rs){
            if(rs.rowsAffected > 0) {
              tx.execSql("UPDATE Wallet SET is_sync = 0, money = money + ? WHERE ID = ?", [$scope.bean.money*($scope.tabIndex == 0 ? -1 : 1), $scope.bean.wallet.ID], function (tx,rs){
                if(rs.rowsAffected > 0) {
                  $scope.bean.description = "";
                  $scope.bean.creditor = "";
                  for(var i in $scope.wallet){
                    if($scope.wallet[i].ID == $scope.bean.wallet.ID){
                      $scope.wallet[i].money += $scope.bean.money*($scope.tabIndex == 0 ? -1 : 1)
                      break;
                    }
                  } 
                  var confirm = $mdDialog.confirm({
                    title: $rootScope.i18.addition.confirm_add_continue_title,
                    content: $rootScope.i18.addition.confirm_add_continue_content,
                    ariaLabel: $rootScope.i18.addition.confirm_add_continue_title,
                    ok: $rootScope.i18.addition.confirm_add_continue_ok,
                    cancel: $rootScope.i18.addition.confirm_add_continue_cancel,
                    targetEvent: ev
                  });
                  $rootScope.$broadcast("Main.Sync");                  
                  $mdDialog.show(confirm).then(function() {
                    $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_insert_ok));
                    delete $scope.bean.paymentdate;
                    delete $scope.bean.money;
                  }, function(){
                    $ionicHistory.nextViewOptions({
                      disableBack: true
                    });
                    $state.go("app.dashboard", {}, {location: 'replace'});
                  });                  
                }else{
                  $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_toWallet_fail));
                }
              }, function(err){      
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_toWallet_fail));
              });
            }else{
              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_insert_fail));
            }
          }, function(err){      
            $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_insert_fail));
          });
        }
        
      });
    }
  }  
  
}])

.controller('ListMonthlyCtrl', ['$dbo', '$scope', function($dbo, $scope) {
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = true;
  $scope.$parent.setExpanded(true);
  $scope.$parent.setHeaderFab(false);

  $scope.dataMonth = [];

  $scope.loadData = function(){
    $scope.setRecount(1);
    $dbo.readTransaction(function(tx){
      tx.execSql("SELECT created_month, created_year, SUM(money) money, type FROM Spending WHERE is_report = 1 AND removed = 0 GROUP BY created_month, created_year, type ORDER BY created_year DESC, created_month DESC",[], function (tx,rs){
          var tmp = {};
          for(var i=0; i<rs.rows.length; i++){
            var r = rs.rows.item(i);
            if(!tmp[r.created_month + "-" + r.created_year])
              tmp[r.created_month + "-" + r.created_year] = { spending: 0, earning: 0, month: r.created_month, year: r.created_year, created_date: new Date(r.created_year, r.created_month, 1).getTime()};
            if(r.type > 0)
              tmp[r.created_month + "-" + r.created_year].earning = r.money;
            else 
              tmp[r.created_month + "-" + r.created_year].spending = r.money;
          }
          for(var i in tmp){
            $scope.dataMonth.push(tmp[i]);
          }
          $scope.recount();
      });
    });  
  };
}])

.controller('ListChartsCtrl', ['$scope', '$filter', '$rootScope', '$mdDialog', '$timeout', function($scope, $filter, $rootScope, $mdDialog, $timeout) {
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = true;
  $scope.$parent.setExpanded(true);
  $scope.$parent.setHeaderFab(false);

  $scope.dataMonth = [];

  var today = new Date();  
  $scope.chartByMonth = {
    start: new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0).getTime(),
    end: new Date(today.getFullYear(), today.getMonth()+1, 0, 23, 59, 59, 999).getTime()
  };

  $scope.chartByYear = {
    start: new Date(today.getFullYear(), 0, 1, 0, 0, 0).getTime(),
    end: new Date(today.getFullYear()+1, 0, 0, 23, 59, 59, 999).getTime(),
    onSelect: function (e) {
      var content = "";
      var d = e.entries[0].dataPoint.x;
      content += "<h4>" + $filter('date')(d, 'MMMM') + "</h4>";
      for (var i = 0; i < e.entries.length; i++) {                    
        content += e.entries[i].dataSeries.name + " : " + "<strong class='" + (i == 0 ? 'earning' : 'spending') + "'>" + $filter('number')(e.entries[i].dataPoint.y) + " " + $rootScope.pref.currency + "</strong>";
        content += "<br/>";                    
      }
      $scope.chartByMonth.start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0).getTime();
      $scope.chartByMonth.end = new Date(d.getFullYear(), d.getMonth()+1, 0, 23, 59, 59, 999).getTime();
      $rootScope.$broadcast("EventChartBySpendingtype", $scope.chartByMonth);
      
      return content;
    }
  };

  $scope.$on("ListChartsCtrl.OpenSearch", function(){
    $mdDialog.show({
      controller: ['$scope', 'theScope', function($scope, theScope){
        $scope.start = new Date(theScope.chartByYear.start);
        $scope.end = new Date(theScope.chartByYear.end);
        $scope.filter = function(){
          theScope.chartByYear.start = new Date($scope.start.getFullYear(), $scope.start.getMonth(), $scope.start.getDate(), 0, 0, 0, 0).getTime();
          theScope.chartByYear.end = new Date($scope.end.getFullYear(), $scope.end.getMonth(), $scope.end.getDate(), 23, 59, 59, 999).getTime();

          var d = $scope.end;
          if(d.getTime() > today.getTime()){
            d = today;
          }
          theScope.chartByMonth.start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0).getTime();
          theScope.chartByMonth.end = new Date(d.getFullYear(), d.getMonth()+1, 0, 23, 59, 59, 999).getTime();
          $timeout(function() {
            $rootScope.$broadcast("EventChartByMonth", theScope.chartByYear);
            $rootScope.$broadcast("EventChartBySpendingtype", theScope.chartByMonth);
          }, 200);
          
          $mdDialog.hide();
        }
      }],
      templateUrl: '/search.temp.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true,
      locals: {
          theScope: $scope
      }
    });
  });

}])

.controller('DashboardCtrl', ['$localstorage', '$helper', '$dbo', '$scope', '$stateParams', '$mdDialog', '$mdToast', '$rootScope', function($localstorage, $helper, $dbo, $scope, $stateParams, $mdDialog, $mdToast, $rootScope) {
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = true;
  $scope.$parent.setExpanded(true);
  $scope.$parent.setHeaderFab(false);
  var loadFinished = false;

  var today0 = $stateParams.createdDate ? new Date(parseInt($stateParams.createdDate)) : new Date();  
  var month0, month1;

  $scope.dashboard = {    
    walletFilter: $localstorage.getObject("dashboard.walletFilter"),
    totalEarning: 0,
    totalSpending: 0,
    recently: {
      list: [],
      remaining: 0
    }
  };

  var changeToday0 = function(){
    month0 = new Date(today0.getFullYear(), today0.getMonth(), 1);
    month0.setHours(0);
    month0.setMinutes(0);
    month0.setSeconds(0);
    month0.setMilliseconds(0);

    month1 = new Date(month0.getTime());
    month1.setMonth(month1.getMonth()+1);
    month1.setDate(month1.getDate()-1);
    month1.setHours(23);
    month1.setMinutes(59);
    month1.setSeconds(59);
    month1.setMilliseconds(999);

    $scope.dashboard.date = month0;
  };

  changeToday0();

  $scope.opacity = function(typeSpendingId){        
    $scope.filterTypeSpendingId = $scope.filterTypeSpendingId ? undefined : typeSpendingId;
  }

  $scope.isNextMonth = function(){
    var now = new Date();
    if(today0.getFullYear() < now.getFullYear() || (today0.getFullYear() == now.getFullYear() && today0.getMonth() < now.getMonth()))
      return true;
    return false;
  }

  $scope.nextMonth = function() {
    today0.setMonth(today0.getMonth() + 1);
    changeToday0();
    $dbo.readTransaction(function(tx){
      loadDataBy(tx);
    });
  }

  $scope.prevMonth = function() {
    today0.setMonth(today0.getMonth() - 1);
    changeToday0();
    $dbo.readTransaction(function(tx){
      loadDataBy(tx);
    });
  }

  var loadDataBy = function(tx){
    $scope.dashboard.totalEarning = 0;
    $scope.dashboard.totalSpending = 0;
    $scope.dashboard.recently.list = [];
    $scope.dashboard.walletFilterAllIcon = $helper.getIcon([5, 0], true);

    var filDashboardSql = "";
    var filRecentlySql = "";
    if($scope.dashboard.walletFilter){
      filDashboardSql += "AND is_report = 1 AND wallet_id = '" + $scope.dashboard.walletFilter.ID + "'";
      filRecentlySql += "AND wallet_id = '" + $scope.dashboard.walletFilter.ID + "'";
    }else{
      filDashboardSql += "AND is_report = 1 AND c.avail = 1 AND c.removed = 0";
      filRecentlySql += "AND c.avail = 1 AND c.removed = 0";
    }
    // DASHBOARD
    tx.execSql("SELECT SUM(a.money) money, type FROM Spending a INNER JOIN Wallet c ON a.wallet_id = c.id WHERE created_date >= ? AND created_date <= ? AND a.removed = 0 " + filDashboardSql + " GROUP BY type",[month0.getTime(), month1.getTime()], function (tx,rs){
      for(var i=0; i<rs.rows.length; i++){            
        if(rs.rows.item(i).type > 0)
          $scope.dashboard.totalEarning  = rs.rows.item(i).money;
        else
          $scope.dashboard.totalSpending  = rs.rows.item(i).money;          
      }
      $scope.recount();
    });
    // RECENTLY
    tx.execSql("SELECT a.*, b.name, b.icon, b.type as 'edit', c.sicon as 'wicon', a.type_spending_id as 'typeSpendingId' from Spending a INNER JOIN TypeSpending b ON a.type_spending_id = b.id INNER JOIN Wallet c on c.ID = a.wallet_id WHERE created_date >= ? AND created_date <= ? AND a.removed = 0 " + filRecentlySql + " ORDER BY created_date DESC",[month0.getTime(), month1.getTime()], function (tx,rs){
      if(rs.rows.length > 0) {
        var tmp = {};
        for(var i=0; i<rs.rows.length; i++){
          var item = rs.rows.item(i);
          var key = new Date(item.created_year, item.created_month, item.created_day, 0, 0, 0).getTime().toString();
          if(!tmp[key]) tmp[key] = [];
          tmp[key].push(item);
        }
        for(var i in tmp){
          var earning = 0;
          var spending = 0;
          for(var j in tmp[i]){
            var item = tmp[i][j];
            var condition = item.is_report == 1;
            if(condition){
              if(item.type > 0)
                earning += item.money;
              else if(item.type < 0)
                spending += item.money;
            }
          }
          $scope.dashboard.recently.list.push({created_date: new Date(parseInt(i)), earning: earning, spending: spending, list: tmp[i]});        
        }      
      }
      $scope.recount();
      if(!loadFinished) loadFinished = true;
    });
  };

  $scope.clearFilter = function(){
    $scope.dashboard.walletFilter = undefined;
    $localstorage.remove("dashboard.walletFilter");
    $dbo.readTransaction(function(tx){
      loadDataBy(tx);
    });
  }

  $scope.loadData = function(){
    $scope.setRecount(3);
    $scope.walletAvail = [];
    $scope.walletNoAvail = [];
    $scope.allWalletMoney = 0;    
    $dbo.readTransaction(function(tx){
      tx.execSql("SELECT * from Wallet WHERE removed = 0 ORDER BY avail DESC, oder", [], function (tx,rs){
        for(var i=0; i<rs.rows.length; i++){
          var item = rs.rows.item(i);
          if(item.avail == 0)
            $scope.walletNoAvail.push(item);
          else{
            $scope.allWalletMoney += item.money;
            $scope.walletAvail.push(item);
          }
        }
        $scope.recount();
      });
      loadDataBy(tx);
    });    
  }

  $scope.changeWalletFilter = function(){
    if(loadFinished){
      $localstorage.setObject("dashboard.walletFilter", $scope.dashboard.walletFilter);    
      $dbo.readTransaction(function(tx){
        loadDataBy(tx);
      });
      if(!loadFinished) loadFinished = true;
    }
  }

  $scope.toggleTool = function(r){
    r.isShowTool = !r.isShowTool;
  }

  $scope.delete = function(ev, r) {    
    var confirm = $mdDialog.confirm({
      title: $rootScope.i18.app.confirm_delete_title,
      content: $rootScope.i18.app.confirm_delete_content,
      ariaLabel: $rootScope.i18.app.confirm_delete_title,
      ok: $rootScope.i18.app.confirm_delete_button_ok,
      cancel: $rootScope.i18.app.confirm_delete_button_cancel,
      targetEvent: ev
    });
    $mdDialog.show(confirm).then(function() {
      $dbo.transaction(function(tx){
        tx.execSql("UPDATE Spending SET removed = 1, is_sync = 0 WHERE ID = ?",[r.ID], function (tx,rs){
          var msg = "";
          if(rs.rowsAffected > 0){
            tx.execSql("UPDATE Wallet SET is_sync = 0, money = money + ? WHERE ID = ?", [r.money*r.type*-1, r.wallet_id], function (tx,rs){
              if(rs.rowsAffected > 0) {
                $rootScope.$broadcast("Main.Sync");
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_delete_ok));
                $scope.loadData(tx);
              }else{
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_delete_fail));
              }
            }, function(err){      
              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_delete_fail));
            });            
          }else{
            $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_delete_fail));
          }
        });
      });
    });
  }

}])

.controller('WalletCtrl', ['$helper', '$dbo', '$scope', '$rootScope', '$mdDialog', '$mdToast', function($helper, $dbo, $scope, $rootScope, $mdDialog, $mdToast) {
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = true;
  $scope.$parent.setExpanded(true);
  $scope.$parent.setHeaderFab(false);

  $scope.loadData = function(){
    $scope.setRecount(1);
    $scope.walletAvail = {total: 0, list: []};
    $scope.walletNoAvail = {total: 0, list: []};
    $dbo.readTransaction(function(tx){
      tx.execSql("SELECT * from Wallet WHERE removed = 0 ORDER BY avail DESC, oder", [], function (tx,rs){
        for(var i=0; i< rs.rows.length; i++){
          var item = rs.rows.item(i);
          item.isCheck = item.avail == 0;
          if(item.avail == 1){
            $scope.walletAvail.total += item.money;
            $scope.walletAvail.list.push(item);
          }else{
            $scope.walletNoAvail.total += item.money;
            $scope.walletNoAvail.list.push(item);
          }          
        }
        $scope.recount();
      });
    });    
  };

  $scope.delete = function(ev, r) {    
    var confirm = $mdDialog.confirm({
      title: $rootScope.i18.app.confirm_delete_title,
      content: $rootScope.i18.app.confirm_delete_content,
      ariaLabel: $rootScope.i18.app.confirm_delete_title,
      ok: $rootScope.i18.app.confirm_delete_button_ok,
      cancel: $rootScope.i18.app.confirm_delete_button_cancel,
      targetEvent: ev
    });
    $mdDialog.show(confirm).then(function() {
      $dbo.transaction(function(tx){
        tx.execSql("UPDATE Wallet SET is_sync = 0, removed = 1 WHERE ID = ?",[r.ID], function (tx,rs){
          if(rs.rowsAffected > 0){
            $rootScope.$broadcast("Main.Sync");
            $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_delete_ok));
            $scope.loadData(tx);
          }else{
            $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_delete_fail));
          }          
        });
      });
    });
  };

  $scope.edit = function(e, r){
    $mdDialog.show({
      controller: ['$scope', 'theScope', '$mdToast', function($scope, theScope, $mdToast){
        $scope.pref = theScope.pref;
        $scope.wallet = r;
        $scope.wallet.isReport = 1;
        $scope.wallet.oldmoney = r.money;
        $scope.save = function(){          
          theScope.save($scope.wallet);          
        };
      }],
      templateUrl: '/edit.temp.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true,
      ev: e,
      locals: {
          theScope: $scope
      }
    });
  };

  $scope.move = function(e, r){
    $mdDialog.show({
      controller: ['$scope', 'theScope', '$mdToast', '$rootScope', function($scope, theScope, $mdToast, $rootScope){
        $scope.pref = theScope.pref;
        $scope.bean = {from : r, fromName: r.name, money: 0, createdDate: new Date()};
        $scope.wallets = [];
        for(var i in theScope.walletAvail.list){
          var item = theScope.walletAvail.list[i];
          if(item.ID != $scope.bean.from.ID){
            if($scope.wallets.length == 0){
              $scope.bean.to = item;
            }
            $scope.wallets.push(item);
          }
        }
        for(var i in theScope.walletNoAvail.list){
          var item = theScope.walletNoAvail.list[i];
          if(item.ID != $scope.bean.from.ID){
            if($scope.wallets.length == 0){
              $scope.bean.to = item;
            }
            $scope.wallets.push(item);
          }
        }
        $scope.save = function(bean){
          var a = angular.element(document.querySelector('#walletForm'));
            if(a.hasClass("ng-valid")){
              $dbo.transaction(function(tx){
                if(!bean.description) bean.description = "";
                tx.execSql("UPDATE Wallet SET is_sync = 0, money = money - ? WHERE ID = ?", [bean.money, bean.from.ID], function (tx,rs){
                  if(rs.rowsAffected > 0) {
                    tx.execSql("UPDATE Wallet SET is_sync = 0, money = money + ? WHERE ID = ?", [bean.money, bean.to.ID], function (tx,rs){
                      if(rs.rowsAffected > 0) {
                        tx.execSql("SELECT ID FROM TypeSpending WHERE name in (?, ?) ORDER BY name ASC", ['Transfer to wallet', 'Received from wallet'], function(tx, rs0){
                          if(rs0.rows.length > 0){
                            bean.spendingType = rs0.rows.item(1).ID;
                            bean.earningType = rs0.rows.item(0).ID;
                            tx.execSql("INSERT INTO Spending(money, created_date, created_day, created_month, created_year, type_spending_id, wallet_id, des, type, is_report, is_sync, email, ID) values(?, ?, ?, ?, ? ,? , ?, ?, ?, ?, 0, ?, ?)", [bean.money, bean.createdDate.getTime(), bean.createdDate.getDate(), bean.createdDate.getMonth(), bean.createdDate.getFullYear(), bean.spendingType, bean.from.ID,  "[" + bean.from.name + "->" + bean.to.name + "] " + bean.description, -1, 0, $rootScope.me.email, $helper.getUID()], function (tx,rs){
                              if(rs.rowsAffected > 0) {                            
                                tx.execSql("INSERT INTO Spending(money, created_date, created_day, created_month, created_year, type_spending_id, wallet_id, des, type, is_report, is_sync, email, ID) values(?, ?, ?, ?, ? ,? , ?, ?, ?, ?, 0, ?, ?)", [bean.money, bean.createdDate.getTime(), bean.createdDate.getDate(), bean.createdDate.getMonth(), bean.createdDate.getFullYear(), bean.earningType, bean.to.ID, "[" + bean.to.name + "<-" + bean.from.name + "] " + bean.description, 1, 0, $rootScope.me.email, $helper.getUID()], function (tx,rs){
                                  if(rs.rowsAffected > 0) {
                                    $rootScope.$broadcast("Main.Sync");
                                    $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.wallet.response_move_ok));
                                    $mdDialog.cancel();
                                    theScope.loadData();
                                  }
                                }, function(err){
                                  $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_move_fail)); 
                                });
                              }
                            }, function(err){
                              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_move_fail)); 
                            });
                          }
                        });
                      }else{
                        $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_move_fail));
                      }
                    }, function(err){
                      $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_move_fail)); 
                    });
                  }else{
                    $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_move_fail));
                  }
                }, function(err){
                  $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_move_fail)); 
                });
              });
            }
          }
      }],
      templateUrl: '/move.temp.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true,
      locals: {
          theScope: $scope
      }
    });
  }

  $scope.$on("AddWalletCtrl.AddNew", function() {
    $mdDialog.show({
      controller: ['$dbo', '$scope', 'theScope', '$mdToast', function($dbo, $scope, theScope, $mdToast){
        $scope.pref = theScope.pref;
        $scope.wallet = {money: 0, oldmoney: 0, isCheck: false, isReport: 0, oder: 1};        
        $scope.save = function(){
          theScope.save($scope.wallet);
        };
      }],
      templateUrl: '/edit.temp.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true,
      locals: {
          theScope: $scope
      }
    });
  });

  $scope.save = function(bean){    
    var a = angular.element(document.querySelector('#walletForm'));
      if(a.hasClass("ng-valid")){
        bean.createdDate = new Date();
        $dbo.transaction(function(tx){
          if(bean.ID){                           
            tx.execSql("UPDATE Wallet SET is_sync = 0, name = ?, money = ?, avail = ?, icon = ?, sicon = ?, oder = ? WHERE ID = ?", [bean.name, bean.money, !bean.isCheck ? 1 : 0, bean.icon, bean.sicon, bean.oder, bean.ID], function (tx,rs){
              if(rs.rowsAffected > 0) {
                if(bean.money != bean.oldmoney){                  
                  bean.description = "[" + bean.name + ": " + bean.oldmoney + "->" + bean.money + "] " + (bean.description ? bean.description : "");
                  tx.execSql("SELECT ID FROM TypeSpending WHERE name = ?", ['Update wallet'], function(tx, rs0){
                    if(rs0.rows.length > 0){
                      bean.spendingType = rs0.rows.item(0).ID;
                      tx.execSql("INSERT INTO Spending(money, created_date, created_day, created_month, created_year, type_spending_id, wallet_id, des, type, is_sync, email, ID, is_report) values(?, ?, ?, ?, ? ,? , ?, ?, ?, 0, ?, ?, ?)", [Math.abs(bean.money - bean.oldmoney), bean.createdDate.getTime(), bean.createdDate.getDate(), bean.createdDate.getMonth(), bean.createdDate.getFullYear(), bean.spendingType, bean.ID, bean.description, bean.oldmoney > bean.money ? -1 : 1, $rootScope.me.email, $helper.getUID(), bean.isReport], function (tx,rs){
                        if(rs.rowsAffected > 0) {
                          $rootScope.$broadcast("Main.Sync");
                          $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_ok));
                          $mdDialog.cancel();
                          $scope.loadData();
                        }
                      }, function(err){
                        $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail)); 
                      });
                    }else{
                      $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail)); 
                    }
                  }, function(err){
                    $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail)); 
                  });
                }else{
                  $rootScope.$broadcast("Main.Sync");
                  $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_ok));
                  $mdDialog.cancel();
                  $scope.loadData();
                }
              }else{
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail));
              }
            }, function(err){
              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail)); 
            });
          }else{
            var walletId = $helper.getUID();
            tx.execSql("INSERT INTO Wallet(name, money, avail, icon, sicon, symb, is_sync, email, ID, oder) values(?, ?, ?, ?, ?, ?, 0, ?, ?, ?)", [bean.name, bean.money, !bean.isCheck ? 1 : 0, bean.icon, bean.sicon, $rootScope.pref.currency, $rootScope.me.email, walletId, bean.oder], function (tx,rs){
              if(rs.rowsAffected > 0) {
                bean.description = "[" + bean.name + ": " + bean.money + "] " + (bean.description ? bean.description : "");
                tx.execSql("SELECT ID FROM TypeSpending WHERE name = ?", ['Add new wallet'], function(tx, rs0){
                  if(rs0.rows.length > 0){
                    bean.spendingType = rs0.rows.item(0).ID;
                    tx.execSql("INSERT INTO Spending(money, created_date, created_day, created_month, created_year, type_spending_id, wallet_id, des, type, is_sync, email, ID, is_report) values(?, ?, ?, ?, ? ,? , ?, ?, ?, 0, ?, ?, ?)", [bean.money, bean.createdDate.getTime(), bean.createdDate.getDate(), bean.createdDate.getMonth(), bean.createdDate.getFullYear(), bean.spendingType, walletId, bean.description, 1, $rootScope.me.email, $helper.getUID(), bean.isReport], function (tx,rs){
                      if(rs.rowsAffected > 0) {
                        $rootScope.$broadcast("Main.Sync");
                        $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_insert_ok));
                        $mdDialog.cancel();
                        $scope.loadData();
                      }
                    }, function(err){
                      $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_move_fail)); 
                    });
                  }else{
                    $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_move_fail)); 
                  }
                }, function(err){
                  $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail)); 
                });  
              }else{
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_insert_fail));
              }
            }, function(err){
              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_insert_fail)); 
            });
          }          
        });
      }
  };

}])

.controller('CategoryCtrl', ['$helper', '$dbo', '$scope', '$rootScope', '$mdDialog', '$mdToast', function($helper, $dbo, $scope, $rootScope, $mdDialog, $mdToast) {
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = true;
  $scope.$parent.setExpanded(true);
  $scope.$parent.setHeaderFab(false);

  var tabIndex = 0;

  $scope.loadData = function(){
    $scope.setRecount(1);
    $scope.spendingTypes = [];
    $scope.earningTypes = [];
    $dbo.readTransaction(function(tx){
      tx.execSql("SELECT * from TypeSpending WHERE (type = -1 or type = 1) AND removed = 0 ORDER BY parent_id, oder", [], function (tx,rs){
        var tmp = {};
        for(var i=0; i< rs.rows.length; i++){
          var item = rs.rows.item(i);
          if(item.parent_id){                     
            if(!tmp["_" + item.parent_id]) tmp["_" + item.parent_id] = {};
            if(!tmp["_" + item.parent_id].inner) tmp["_" + item.parent_id].inner = [];
            tmp["_" + item.parent_id].inner.push(item);            
          }else{
            if(tmp["_" + item.ID] && tmp["_" + item.ID].inner){
              item.inner = tmp["_" + item.ID].inner;
            }
            tmp["_" + item.ID] = item;
          }              
        }
        for(var i in tmp){
          var item = tmp[i];
          if(item.type < 0){
            $scope.spendingTypes.push(item);
          }else{
            $scope.earningTypes.push(item);
          }
        }
        $scope.recount();
      });
    });
  };

  $scope.delete = function(ev, r) {    
    var confirm = $mdDialog.confirm({
      title: $rootScope.i18.app.confirm_delete_title,
      content: $rootScope.i18.app.confirm_delete_content,
      ariaLabel: $rootScope.i18.app.confirm_delete_title,
      ok: $rootScope.i18.app.confirm_delete_button_ok,
      cancel: $rootScope.i18.app.confirm_delete_button_cancel,
      targetEvent: ev
    });
    $mdDialog.show(confirm).then(function() {
      $dbo.transaction(function(tx){
        tx.execSql("UPDATE TypeSpending SET is_sync = 0, removed = 1 WHERE ID = ?",[r.ID], function (tx,rs){
          if(rs.rowsAffected > 0){
            $rootScope.$broadcast("Main.Sync");
            $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_delete_ok));
            $scope.loadData(tx);
          }else{
            $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_delete_fail));
          }          
        });
      });
    });
  };

  $scope.edit = function(e, r){
    $mdDialog.show({
      controller: ['$scope', 'theScope', '$mdToast', function($scope, theScope, $mdToast){
        $scope.category = r;
        $scope.save = function(){          
          theScope.save($scope.category);          
        };
      }],
      templateUrl: '/edit.temp.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true,
      ev: e,
      locals: {
          theScope: $scope
      }
    });
  };

  $scope.add = function(e, r){
    $mdDialog.show({
      controller: ['$dbo', '$scope', 'theScope', '$mdToast', function($dbo, $scope, theScope, $mdToast){
        $scope.category = {parentId: r.ID, oder: (r.inner ? r.inner.length : 0), type: r.type, parentName: r.name, parentIcon: r.icon};
        $scope.save = function(){
          theScope.save($scope.category);
        };
      }],
      templateUrl: '/edit.temp.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true,
      locals: {
          theScope: $scope
      }
    });
  }

  $scope.tabFocus = function(index){
    tabIndex = index;     
  }

  $scope.$on("CategoryCtrl.AddNew", function() {
    $mdDialog.show({
      controller: ['$dbo', '$scope', 'theScope', '$mdToast', function($dbo, $scope, theScope, $mdToast){
        $scope.category = {parentId: null, oder: (tabIndex == 0 ? theScope.spendingTypes.length : theScope.earningTypes.length), type: tabIndex == 0 ? -1 : 1};
        $scope.save = function(){
          theScope.save($scope.category);
        };
      }],
      templateUrl: '/edit.temp.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true,
      locals: {
          theScope: $scope
      }
    });
  });

  $scope.save = function(bean){    
    var a = angular.element(document.querySelector('#categoryForm'));
      if(a.hasClass("ng-valid")){
        $dbo.transaction(function(tx){
          if(bean.ID){                           
            tx.execSql("UPDATE TypeSpending SET is_sync = 0, name = ?, oder = ?, icon = ?, sicon = ? WHERE ID = ?", [bean.name, bean.oder, bean.icon, bean.sicon, bean.ID], function (tx,rs){
              if(rs.rowsAffected > 0) {
                $rootScope.$broadcast("Main.Sync");
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_ok));
                $mdDialog.cancel();
                $scope.loadData();
              }else{
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail));
              }
            }, function(err){
              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_update_fail)); 
            });
          }else{
            tx.execSql("INSERT INTO TypeSpending(name, icon, sicon, type, parent_id, oder, is_sync, email, ID) values(?, ?, ?, ?, ?, ?, 0, ?, ?)", [bean.name, bean.icon, bean.sicon, bean.type, bean.parentId, bean.oder, $rootScope.me.email, $helper.getUID()], function (tx,rs){
              if(rs.rowsAffected > 0) {
                $rootScope.$broadcast("Main.Sync");
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_insert_ok));
                $mdDialog.cancel();
                $scope.loadData();
              }else{
                $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_insert_fail));
              }
            }, function(err){
              $mdToast.show($mdToast.simple().hideDelay(cf.TOAST_DELAY).content($rootScope.i18.common.response_insert_fail)); 
            });
          }          
        });
      }
  };

}])

;


