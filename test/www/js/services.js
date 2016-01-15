angular.module('starter.services', ['tmh.dynamicLocale'])

.service('$helper', ['tmhDynamicLocale', '$http', '$window', '$localstorage', '$rootScope', '$locale', '$cordovaDevice', '$mdDateLocale', function(tmhDynamicLocale, $http, $window, $localstorage, $rootScope, $locale, $cordovaDevice, $mdDateLocale) {
  var admobid = {};
  //if( /(android)/i.test(navigator.userAgent) ) { 
  var admobid = { // for Android
      banner: 'ca-app-pub-7861623744178820/8087704797',
      interstitial: 'ca-app-pub-7861623744178820/8087704797'
  };
  this.initAdmob = function(type){        
    if (! AdMob ) { return; }
    if(type == 0){
      AdMob.createBanner( {
          adId: admobid.banner, 
          isTesting: cf.DEBUG,
          overlap: true, 
          offsetTopBar: false, 
          position: AdMob.AD_POSITION.BOTTOM_CENTER,
          bgColor: 'white'
      });
    }else {
      AdMob.prepareInterstitial({
          adId: admobid.interstitial,
          autoShow: true
      });
    }
  };
  this.unsignedString = function(input, matchCase) {
    if(!input) return null;
    var signedChars     = "àảãáạăằẳẵắặâầẩẫấậđèẻẽéẹêềểễếệìỉĩíịòỏõóọôồổỗốộơờởỡớợùủũúụưừửữứựỳỷỹýỵÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬĐÈẺẼÉẸÊỀỂỄẾỆÌỈĨÍỊÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢÙỦŨÚỤƯỪỬỮỨỰỲỶỸÝỴ";
    var unsignedChars   = "aaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAADEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYY";
    var pattern = new RegExp("[" + signedChars + "]", "g");
    var output = input.replace(pattern, function (m, key, value) {
        return unsignedChars.charAt(signedChars.indexOf(m));
    });
    return output.toLowerCase();
  };
  var eid = 0;
  this.getUID = function(){
    if(!$window.deviceId){
      $window.deviceId = "website_";
      if (window.cordova) {
          $window.deviceId = $cordovaDevice.getUUID();          
      }
    }
    var uid = $window.deviceId + "-" + eid++ + "-" + new Date().getTime();
    return uid;
  };
  this.changeLanguage = function(lang, fcDone){
    tmhDynamicLocale.set(lang);
    $http.get('js/i18n/string-locale_' + lang + '.json')
    .success(function(i18){
      $rootScope.i18 = i18;
      // $mdDateLocale.months = $locale.DATETIME_FORMATS.MONTH; //$rootScope.i18.locale.datetime.month;
      // $mdDateLocale.shortMonths = $locale.DATETIME_FORMATS.SHORTMONTH; //$rootScope.i18.locale.datetime.short_month;
      // $mdDateLocale.days = $locale.DATETIME_FORMATS.DAY; //$rootScope.i18.locale.datetime.day;
      // $mdDateLocale.shortDays = $locale.DATETIME_FORMATS.SHORTDAY; //$rootScope.i18.locale.datetime.short_day;
      // $mdDateLocale.firstDayOfWeek = $locale.DATETIME_FORMATS.FIRSTDAYOFWEEK; //0;
      $mdDateLocale.parseDate = function(dateString) {
          var m = moment(dateString, $locale.DATETIME_FORMATS.shortDate.toUpperCase(), true);
          return m.isValid() ? m.toDate() : new Date(NaN);
      };
      $mdDateLocale.formatDate = function(date) {
          return moment(date).format($locale.DATETIME_FORMATS.shortDate.toUpperCase());
      };
      // $mdDateLocale.monthHeaderFormatter = function(date) { 
      //     return $mdDateLocale.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
      // };
      // $mdDateLocale.weekNumberFormatter = function(weekNumber) {
      //     return $rootScope.i18.locale.datetime.label_week + " " + weekNumber;
      // };
      // $mdDateLocale.msgCalendar = $rootScope.i18.locale.datetime.label;
      // $mdDateLocale.msgOpenCalendar = $rootScope.i18.locale.datetime.label_open;
      if(fcDone) fcDone();
    });
  }  
  this.checkOnline = function(fcDone){    
    if($rootScope.isOnline){
      if(fcDone) fcDone();
    }else{
      $mdDialog.show(
        $mdDialog.alert({
          parent: angular.element(document.body),
          clickOutsideToClose : true,
          title : $rootScope.i18.config.dialog_networkno_title,
          content : $rootScope.i18.config.dialog_networkno_content,
          ariaLabel : $rootScope.i18.config.dialog_networkno_title,
          ok : $rootScope.i18.config.dialog_networkno_ok
        })
      );
    }
  }
  this.getIcon = function(indexs, isSicon){    
    if(isSicon)
      return "-" + (cf.SPACE_24[0] * indexs[0]) + "px -" + (cf.SPACE_24[1] * indexs[1]) + "px";
    return "-" + (cf.SPACE_36[0] * indexs[0]) + "px -" + (cf.SPACE_36[1] * indexs[1]) + "px";
  }
  this.config = function(isClear, fcDone){
    console.log("CONFIG");
    if(isClear) $localstorage.clear();
    Parse.initialize("ItiAkjw1hzUcs96By8SZLF59V2eesDr80Kahkr09", "kpnievWAuxFJaH5Gnx8sp9MlYeeKCrBdTDPDQ37H");
    if($localstorage.getObject("pref", null) == null) $localstorage.setObject("pref", cf.PREF);
    $rootScope.pref = $localstorage.getObject("pref");
    $rootScope.me = $localstorage.getObject("me");
    $rootScope.isOnline = cf.DEBUG;    
    if($rootScope.pref.locale) 
      this.changeLanguage($rootScope.pref.locale, fcDone);
    else if(fcDone) fcDone();
  };
}])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key, defaultValue) {
      if($window.localStorage[key]) {
        return JSON.parse($window.localStorage[key]);
      }else if(defaultValue){
        return JSON.parse(defaultValue);
      }
      return defaultValue;
    },
    clear: function(){
      for(var k in $window.localStorage){
        if(k != "isInstallDb")
          $window.localStorage.removeItem(k);
      }      
    },
    remove: function(key){
      $window.localStorage.removeItem(key);
    }
  }
}])

.factory('$dbo', ['$window', '$helper', '$rootScope', function($window, $helper, $rootScope) {
  return {  
    syncFrom: function(fcDone, isFirst, idBreak){      
      console.log("SYNC FROM SERVER");
      var self = this;
      var tables = cf.SYNC_TABLE;
      var total = 0;
      var totalServer = 0;
      var syncTable = function(index){     
        if(index < tables.length){
          var tableName = tables[index++];          
          if(!$rootScope.pref.sync.lastDown[tableName]) $rootScope.pref.sync.lastDown[tableName] = new Date(2015, 0, 1).getTime();
          var beginSyncing = $rootScope.pref.sync.lastDown[tableName];
          var lastSyncing = beginSyncing;
          var splitQuery = function(num, limit){            
            var TableClass = Parse.Object.extend(tableName);
            var query = new Parse.Query(TableClass);
            query.equalTo("email", $rootScope.me.email);          
            if(isFirst) query.equalTo("removed", 0);
            query.greaterThan("updatedAt", new Date(beginSyncing));
            query.ascending("updatedAt");
            query.skip(num * limit);
            query.limit(limit);            
            query.find({
              success: function(list) {
                console.log(tableName + ": skip " + num + ", limit " + limit + ", get " + list.length);
                if(list.length > 0){
                  totalServer += list.length;
                  var query = "INSERT INTO " + tableName + "(%FIELD%) VALUES ";
                  var data  = [];   
                  var delData = [];
                  var itemField = null;     
                  for(var i=0; i<list.length; i++){                  
                    var item = list[i].attributes;
                    if(lastSyncing < item.updatedAt.getTime()) lastSyncing = item.updatedAt.getTime();
                    if(idBreak && idBreak.length > 0){
                      for(var j in idBreak){
                        if(idBreak[j].id == list[i].id){
                          item = null;
                          break;
                        }
                      }
                    }
                    if(item == null) {
                      totalServer--;
                      continue;
                    }
                    // Check if exist then delete before insert new records
                    if(!isFirst){                    
                      if(item.removed == 1){                      
                        delData.push(item.ID);
                        continue;
                      }else if(list[i].createdAt.getTime() != list[i].updatedAt.getTime()){
                        delData.push(item.ID);
                      }
                    }
                    // Insert new records                  
                    var c = "(";
                    var f = "";
                    if(itemField == null) itemField = item;
                    for(field in itemField){
                      if(field == "createdAt" || field == "updatedAt")
                        continue;
                      if(query.indexOf("%FIELD%") != -1){
                        if(f.length > 0) f += ",";
                        f += field;
                      }
                      if(c.length > 1) c+= ",";
                      c += "?";
                      if(field == "server_id")
                        data.push(list[i].id);
                      else if(field == "is_sync")
                        data.push(1);
                      else
                        data.push(item[field]);
                    }                  
                    c += ")";
                    if(query.indexOf("%FIELD%") != -1){
                      query = query.replace("%FIELD%", f);                    
                    }else{
                      query += ",";
                    }
                    query += c;
                  }                        
                  var insert = function(tx){
                    if(data.length > 0){
                      tx.execSql(query, data, function(tx, rs){
                        if(rs.rowsAffected > 0){
                          total += rs.rowsAffected;
                          console.log("Sync insert " + tableName + ": " + rs.rowsAffected);
                        }
                        if(list.length < limit){
                          $rootScope.pref.sync.lastDown[tableName] = lastSyncing;
                          syncTable(index);
                        }else{
                          splitQuery(++num, limit);
                        }
                      });
                    }else{
                      if(list.length < limit){
                        $rootScope.pref.sync.lastDown[tableName] = lastSyncing;
                        syncTable(index);
                      }else{
                        splitQuery(++num, limit);
                      }
                    }
                  };                  
                  self.transaction(function(tx){                  
                    if(delData.length > 0){
                      var qname = "";
                      for(var i in delData){
                        if(qname.length > 0) qname += ",";
                        qname += "?";
                      }
                      tx.execSql("DELETE FROM " + tableName + " WHERE ID IN (" + qname + ")", delData, function(tx, rs){
                        console.log("Sync delete " + tableName + ": " + rs.rowsAffected);
                        total += rs.rowsAffected;
                        if(rs.rowsAffected > 0){
                          insert(tx);
                        }else{
                          if(list.length < limit){
                            $rootScope.pref.sync.lastDown[tableName] = lastSyncing;
                            syncTable(index);
                          }else{
                            splitQuery(++num, limit);
                          }
                        }
                      });
                    }else{
                      insert(tx);
                    }
                  });                  
                }else{
                  $rootScope.pref.sync.lastDown[tableName] = lastSyncing;
                  syncTable(index);
                }
              }
            });
          }
          splitQuery(0, cf.MAX_SYNC_FROM);        
        }else{
          $rootScope.$apply();
          if(fcDone) fcDone(total, totalServer);
        }
      }
      syncTable(0);
    },
    syncTo: function(fcDone){      
      console.log("SYNC TO SERVER");
      var self = this;
      var tables = cf.SYNC_TABLE;
      var total = 0;
      var totalList = [];
      var syncTable = function(tx, index){
        if(index < tables.length){
          var tableName = tables[index++];
          var splitQuery = function(tx, num, limit){            
            tx.execSql("SELECT * FROM " + tableName + " WHERE is_sync < 1 limit " + limit, [], function(tx, rs){
              console.log(tableName + ": skip " + num + ", limit " + limit + ", get " + rs.rows.length);
              if(rs.rows.length > 0){
                var list = [];
                var TableClass = Parse.Object.extend(tableName);
                for(var i =0; i<rs.rows.length; i++){
                  var item = rs.rows.item(i);
                  var w = new TableClass();
                  w.id = item["server_id"];
                  for(var field in item){                  
                    w.set(field, item[field]);
                  }
                  list.push(w);
                  totalList.push(w);
                }
                Parse.Object.saveAll(list, {              
                  success: function(list){
                    var updateRow = function(tx, idx){
                      if(idx < list.length){
                        var item = list[idx++];
                        tx.execSql("UPDATE " + item.className + " SET server_id = ?, is_sync = 1 WHERE ID = ?", [item.id, item.attributes.ID], function(tx, rs){
                          total += rs.rowsAffected;
                          updateRow(tx, idx);
                        });
                      }else{
                        if(list.length < limit){
                          syncTable(tx, index);
                        }else{
                          splitQuery(tx, ++num, limit);
                        }                        
                      }
                    }
                    self.transaction(function(tx){
                      updateRow(tx, 0);
                    });
                  },
                  error: function(e){
                    console.log(e);
                  }
                });                
              }else{
                syncTable(tx, index);
              }
            });
          }  
          splitQuery(tx, 0, cf.MAX_SYNC_TO);        
        }else{
          console.log("Sync " + total + "/" + totalList.length + " to server");
          if(fcDone) fcDone(totalList); 
        }
      }
      this.readTransaction(function(tx){
        syncTable(tx, 0);
      });
    },
    install: function(db, fcDone){      
      console.log("INSTALL DATA");      

      var email = $rootScope.me.email;      
      this.transaction(function(tx){

        angular.forEach(db.Wallet, function(value) {
            tx.execSql("INSERT INTO Wallet(name, icon, sicon, avail, money, symb, is_sync, email, ID, oder) values(?, ?, ?, ?, ?, ?, 0, ?, ?, ?)", [value.name, $helper.getIcon(value.icon, false), $helper.getIcon(value.icon, true), value.avail, value.money, value.symb, email, $helper.getUID(), value.oder]);
        });

        angular.forEach(db.TypeOthers, function(value) {
          var parentId = $helper.getUID();
          tx.execSql("INSERT INTO TypeSpending(name, icon, sicon, parent_id, type, oder, is_sync, email, ID) values(?, ?, ?, ?, ?, ?, 0, ?, ?)", [value.name, $helper.getIcon(value.icon, false), $helper.getIcon(value.icon, true), null, 0, value.oder, email, parentId], function (tx,rs){
              if(value.inner){                  
                  angular.forEach(value.inner, function(value1) {                      
                      tx.execSql("INSERT INTO TypeSpending(name, icon, sicon, parent_id, type, oder, is_sync, email, ID) values(?, ?, ?, ?, ?, ?, 0, ?, ?)", [value1.name, $helper.getIcon(value1.icon, false), $helper.getIcon(value1.icon, true), parentId, 0, value1.oder, email, $helper.getUID()]);
                  });
              }
          });
        });  
        angular.forEach(db.TypeEarning, function(value) {
          var parentId = $helper.getUID();
          tx.execSql("INSERT INTO TypeSpending(name, icon, sicon, parent_id, type, oder, is_sync, email, ID) values(?, ?, ?, ?, ?, ?, 0, ?, ?)", [value.name, $helper.getIcon(value.icon, false), $helper.getIcon(value.icon, true), null, 1, value.oder, email, parentId], function (tx,rs){
              if(value.inner){
                  angular.forEach(value.inner, function(value1) {
                      tx.execSql("INSERT INTO TypeSpending(name, icon, sicon, parent_id, type, oder, is_sync, email, ID) values(?, ?, ?, ?, ?, ?, 0, ?, ?)", [value1.name, $helper.getIcon(value1.icon, false), $helper.getIcon(value1.icon, true), parentId, 1, value1.oder, email, $helper.getUID()]);
                  });
              }
          });
        });   
        angular.forEach(db.TypeSpending, function(value) {
          var parentId = $helper.getUID();
          tx.execSql("INSERT INTO TypeSpending(name, icon, sicon, parent_id, type, oder, is_sync, email, ID) values(?, ?, ?, ?, ?, ?, 0, ?, ?)", [value.name, $helper.getIcon(value.icon, false), $helper.getIcon(value.icon, true), null, -1, value.oder, email, parentId], function (tx,rs){
              if(value.inner){
                  angular.forEach(value.inner, function(value1) {
                      tx.execSql("INSERT INTO TypeSpending(name, icon, sicon, parent_id, type, oder, is_sync, email, ID) values(?, ?, ?, ?, ?, ?, 0, ?, ?)", [value1.name, $helper.getIcon(value1.icon, false), $helper.getIcon(value1.icon, true), parentId, -1, value1.oder, email, $helper.getUID()]);
                  });
              }
          });
        });

        return {
          done: fcDone
        };

      });
            
    },
    setup: function(fcDone){
      var toStringInsert = function (fields){            
        var str = "'{";
        for(var i in fields){
            var f = fields[i];
            var name = f;
            var type = "text";
            if(f.indexOf('-') == 0){
                name = f.split('-')[1];
                type = "number";
            }                
            if(str.length > 2){
                str += ",";
            }
            str += "\"" + name + "\":' || case when new." + name + " is null then 'null' else " + (type=="text" ? "'\"' || " : "") + "new." + name + " || '" + (type=="text" ? "\"" : "") + "' end || '";
        }
        str += ", \"is_sync\": 1}'";
        return str;
      };
      this.transaction(function(tx){          

        tx.execSql("DROP TABLE IF EXISTS Wallet");
        tx.execSql("DROP TABLE IF EXISTS TypeSpending");
        tx.execSql("DROP TABLE IF EXISTS Spending");

        tx.execSql("CREATE TABLE IF NOT EXISTS Wallet       (ID TEXT PRIMARY KEY, name TEXT, icon TEXT, sicon TEXT, money REAL DEFAULT 0, avail INTEGER DEFAULT 1, server_id TEXT, symb TEXT, is_sync NUMBER DEFAULT 1, email TEXT, removed INTEGER DEFAULT 0, oder DEFAULT 1)");
        tx.execSql("CREATE TABLE IF NOT EXISTS TypeSpending (ID TEXT PRIMARY KEY, name TEXT, icon TEXT, sicon TEXT, parent_id TEXT, type INTEGER  DEFAULT -1, oder INTEGER DEFAULT 1000, server_id TEXT, is_sync NUMBER DEFAULT 1, email TEXT, removed INTEGER DEFAULT 0)");
        tx.execSql("CREATE TABLE IF NOT EXISTS Spending     (ID TEXT PRIMARY KEY, money REAL, created_date INTEGER, created_day INTEGER, created_month INTEGER, created_year INTEGER, type_spending_id TEXT, wallet_id TEXT, des TEXT, udes TEXT, creditor_name TEXT, repayment_date INTEGER, type INTEGER  DEFAULT -1, is_report INTEGER default 1, server_id TEXT, is_sync NUMBER DEFAULT 1, email TEXT, removed INTEGER DEFAULT 0)");
        
        return {
          done: fcDone
        };

      });      
    },
    clear: function(fcDone){
      this.transaction(function(tx){
        tx.execSql("DELETE FROM Wallet");
        tx.execSql("DELETE FROM TypeSpending");
        tx.execSql("DELETE FROM Spending");
        return {
          done: fcDone
        };
      });
    },
    readTransaction: function(fc, tx){      
      // if(!window._dbo){
      //   if (window.sqlitePlugin !== undefined) {
      //     window._dbo = window.sqlitePlugin.openDatabase("SaveMoney");
      //   } else {
      //     window._dbo = window.openDatabase("SaveMoney", "1.0", "Save Money", 200000);
      //   }
      // }
      var _dbo = undefined;
      if (window.sqlitePlugin !== undefined) {
        _dbo = window.sqlitePlugin.openDatabase("SaveMoney");
      } else {
        _dbo = window.openDatabase("SaveMoney", "1.0", "Save Money", 200000);
      }
      var callback;
      if(!tx){
        _dbo.readTransaction(function(tx) {
          tx.execSql = function(query, prms, fcDone, fcError){
            tx.executeSql(query, prms, function(tx0, rs){
              rs.toBean = function(arr){
                for(var i=0; i<rs.rows.length; i++)
                  arr.push(rs.rows.item(i));
                return arr;
              };
              if(fcDone){
                tx0.execSql = tx.execSql;
                fcDone(tx0, rs);
              }                
            }, function(tx, e){
              e.query = query;
              e.prms = prms;
              if(fcError)
                fcError(e);              
              console.log(e);
            });
          };
          callback = fc(tx);
        }, function(e){
          console.log(e);
        }, function(){  
          if(callback && callback.done) callback.done();
          // _dbo.close(function(){
          //   console.log("DB Closed");
          // }, function(e){
          //   console.log("DB Error");
          // })
        }); 
      }else{
        fc(tx);
      }
    },
    transaction: function(fc, tx){      
      // if(!window._dbo){
      //   if (window.sqlitePlugin !== undefined) {
      //     window._dbo = window.sqlitePlugin.openDatabase("SaveMoney");
      //   } else {
      //     window._dbo = window.openDatabase("SaveMoney", "1.0", "Save Money", 200000);
      //   }
      // }
      var _dbo = undefined;
      if (window.sqlitePlugin !== undefined) {
        _dbo = window.sqlitePlugin.openDatabase("SaveMoney");
      } else {
        _dbo = window.openDatabase("SaveMoney", "1.0", "Save Money", 200000);
      }
      var callback;
      if(!tx){
        _dbo.transaction(function(tx) {
          tx.execSql = function(query, prms, fcDone, fcError){
            tx.executeSql(query, prms, function(tx0, rs){
              rs.toBean = function(arr){
                for(var i=0; i<rs.rows.length; i++)
                  arr.push(rs.rows.item(i));
                return arr;
              };
              if(fcDone){
                tx0.execSql = tx.execSql;
                fcDone(tx0, rs);
              }                
            }, function(tx, e){
              e.query = query;
              e.prms = prms;
              if(fcError)
                fcError(e);              
              console.log(e);
            });
          };
          callback = fc(tx);
        }, function(e){
          console.log(e);
        }, function(){  
          if(callback && callback.done) callback.done();
          // _dbo.close(function(){
          //   console.log("DB Closed");
          // }, function(e){
          //   console.log("DB Error");
          // });
        }); 
      }else{
        fc(tx);
      }
    }
  }
}])

.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}])

.directive('repeatFinished', [function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last) {
        scope.$evalAsync(attr.repeatFinished);
      }
    }
  }
}])

.directive('chartByMonth', [function () {
    return {
        restrict: 'A',
        scope: {
          id: '@',
          title: '@',
          subtitle: '=',
          event: '@',
          type: '@',
          start: '=',
          end: '=',
          select: '&'
        },
        replace: true,
        template: '<div id="{{id}}" style="width: 100%; height: 300px;"></div>',
        controller: ['$scope', '$element', '$filter', '$dbo', '$rootScope', function($scope, $element, $filter, $dbo, $rootScope){
          var loadData = function(start, end){            
            $dbo.readTransaction(function(tx) {
              tx.execSql("SELECT SUM(a.money) money, created_month, created_year, type from Spending a INNER JOIN Wallet c ON a.wallet_id = c.id WHERE created_date >= ? AND created_date <= ? AND is_report = 1 AND a.removed = 0 AND c.removed = 0 AND c.avail = 1 GROUP BY created_month, created_year, type ORDER BY created_year ASC, created_month ASC", [start, end], function (tx,rs){
                var chart = new CanvasJS.Chart($scope.id,
                {
                  title:{
                    text: $scope.title,
                    // fontSize: 15,
                    // horizontalAlign: 'left'
                    margin: 0, 
                    padding: 0
                  },
                  subtitles: [{
                    text: $scope.subtitle,
                    margin: 0, 
                    padding: 0
                  }],
                  animationEnabled: false,
                  theme: "theme3",
                  creditText: "", 
                  creditHref: "",
                  axisX:{
                    gridColor: "Silver",
                    tickColor: "silver",
                    valueFormatString: "MMM"
                  },
                  axisY:{
                    valueFormatString: "#,,. M",
                  },                                  
                  toolTip:{
                    contentFormatter: function(e){
                      return $scope.select({e: e});
                    },
                    shared:true
                  },
                  data: [
                    {        
                      type: "line",
                      showInLegend: true,
                      lineThickness: 2,
                      name: $rootScope.i18.common.earning,
                      color: "#00FF00",
                      dataPoints: []
                    },
                    {        
                      type: "line",
                      showInLegend: true,
                      name: $rootScope.i18.common.spending,
                      color: "#FF0000",
                      lineThickness: 2,
                      dataPoints: []
                    }
                  ]
                });
                if(rs.rows.length > 0){
                  var tmp = {};
                  var startDate = new Date(start);
                  while(startDate.getTime() <= end){
                    var key = startDate.getMonth() + "-" + startDate.getFullYear();
                    if(!tmp[key]) tmp[key] = {spending: {money: 0, created_month: startDate.getMonth(), created_year: startDate.getFullYear()}, earning: {money: 0, created_month: startDate.getMonth(), created_year: startDate.getFullYear()}};
                    startDate.setMonth(startDate.getMonth() + 1);
                  }
                  for(var i=0; i<rs.rows.length; i++){
                    var item = rs.rows.item(i);
                    var key = item.created_month + "-" + item.created_year;                  
                    if(item.type > 0)
                      tmp[key].earning = item;
                    else
                      tmp[key].spending = item;
                  }
                  for(var i in tmp){
                    var item = tmp[i];            
                    chart.options.data[0].dataPoints.push({x: new Date(item.earning.created_year, item.earning.created_month, 1, 0, 0, 0), y: item.earning.money});
                    chart.options.data[1].dataPoints.push({x: new Date(item.spending.created_year, item.spending.created_month, 1, 0, 0, 0), y: item.spending.money});
                  }
                }
                chart.render();
              });    
            });
          };
          loadData($scope.start, $scope.end);
            $scope.$on($scope.event, function(evt, res){
            loadData(res.start, res.end);
          });
        }]
    };
}])

.directive('chartBySpendingtype', [function () {
    return {
        restrict: 'A',
        scope: {
          id: '@',
          title: '@',
          subtitle: '=',
          event: '@',
          type: '@',
          start: '=',
          end: '='
        },
        replace: true,
        template: '<div id="{{id}}" style="width: 100%; height: 300px;"></div>',
        controller: ['$scope', '$element', '$filter', '$dbo', '$rootScope', function($scope, $element, $filter, $dbo, $rootScope){
          var loadData = function(start, end){        
            $dbo.readTransaction(function(tx) {
              tx.execSql("SELECT SUM(a.money) money, b.name from Spending a INNER JOIN TypeSpending b ON a.type_spending_id = b.ID INNER JOIN Wallet c ON a.wallet_id = c.id WHERE created_date >= ? and created_date <= ? and a.type = ? AND is_report = 1 AND a.removed = 0 AND c.avail = 1 AND c.removed = 0 GROUP BY type_spending_id",[start, end, $scope.type], function (tx,rs){
                var total = 0;
                var chart = new CanvasJS.Chart($scope.id,
                {
                  title:{
                    text: $scope.title,
                    // fontSize: 15,
                    // horizontalAlign: 'left'
                    margin: 0, 
                    padding: 0
                  },
                  subtitles: [{
                    text: $scope.subtitle,
                    margin: 0, 
                    padding: 0
                  }],
                  animationEnabled: false,
                  theme: "theme3",
                  creditText: "", 
                  creditHref: "",
                  legend: {
                    maxWidth: 350,
                    itemWidth: 120
                  },
                  toolTip:{
                  contentFormatter: function(e){
                    var content = "";
                    var d = e.entries[0].dataPoint.x;
                    //content += "<h4>" + moment(d).format('MMMM') + "</h4>";
                    for (var i = 0; i < e.entries.length; i++) {                    
                      content += e.entries[i].dataPoint.label + " : " + "<strong class='" + ($scope.type > 0 ? 'earning' : 'spending') + "'>" + $filter('number')(e.entries[i].dataPoint.y) + " " + $rootScope.pref.currency + "</strong>";
                      content += "<br/>";
                      content += $filter('percentage')(e.entries[i].dataPoint.y / total, 2);                 
                    }
                    return content;
                  },
                  shared:true
                },
                  data: [{                    
                    type: "pie",
                    showInLegend: true,
                    legendText: "{label}",
                    dataPoints: []
                  }]
                });
                if(rs.rows.length > 0){                
                  for(var i=0; i<rs.rows.length; i++){
                    total += rs.rows.item(i).money;
                    chart.options.data[0].dataPoints.push({label: rs.rows.item(i).name, y: rs.rows.item(i).money});
                  }                                    
                }
                recursionCount = 0;
                chart.render();
              });    
            });
          };
          loadData($scope.start, $scope.end);                   
          $scope.$on($scope.event, function(evt, res){
            loadData(res.start, res.end);
          });
        }]
    };
}])

.directive('selectOnClick', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('focus', function () {
                this.select();
            });
        }
    };
}])

.directive('pickIcon', ['$helper', function ($helper) {
    return {
        restrict: 'A',
        scope: {
          ngModel36: '=',
          ngModel24: '='
        },
        replace: true,
        template: '<div>' + 
                    '<md-button aria-label="icon" on-tap="pickIcon()" class="md-fab md-primary" style="width: 26px; height: 26px; min-height: 26px; line-height: 0px; margin: 20px 0px 0px 0px; padding: 0px; position: absolute;">' +
                      '<div class="sico" ng-style="{\'background-position\': ngModel24 }" style="margin-top: -12px !important; margin-left: 1px !important;"></div>' +
                    '</md-button>' +
                    '<div ng-show="isShow" style="width: 270px; padding: 5px; height: 200px; overflow-y: auto; position: absolute; margin-left: 5px; margin-top: 30px; background-color: white; box-shadow: 0px 0px 5px #333; border: solid 4px #eee; border-radius: 20px; z-index: 20;">' +
                      '<md-button aria-label="icon" on-tap="setWalletIcon(ico)" class="md-fab md-primary pull-left md-mini" style="width: 36px; height: 36px; min-height: 36px; line-height: 0px; margin: 3px 3px; padding: 0px; background-color: white;" ng-style="{\'background-color\': ngModel36 == ico.icon ? \'\' : \'white\'}" ng-repeat="ico in iconList">' +
                      '<div class="sico" ng-style="{\'background-position\': ico.sicon}" style="margin-top: -12px !important; margin-left: 6px"></div>' +
                      '</md-button>' +
                    '</div>' +
                  '</div>',
        controller: ['$scope', '$element', '$helper', function($scope, $element, $helper){
          $scope.iconList = [];
          for(var i=0; i<cf.ICON_LENGTH_X; i++){
            for(var j=0; j<cf.ICON_LENGTH_Y; j++) {
              var item = {icon: $helper.getIcon([i, j], false), sicon: $helper.getIcon([i, j], true)};
              $scope.iconList.push(item);
              if((!$scope.ngModel24 || !$scope.ngModel36) && i==11 && j==7){
                $scope.ngModel24 = item.sicon;
                $scope.ngModel36 = item.icon;
              }
            }
          }
          $scope.pickIcon = function(){
            $scope.isShow = !$scope.isShow;
          }
          $scope.setWalletIcon = function(ico){
            $scope.isShow = false;
            $scope.ngModel36 = ico.icon;
            $scope.ngModel24 = ico.sicon;
          }
        }]
    };
}])

;
