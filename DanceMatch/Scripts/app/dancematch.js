/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/facebook-js-sdk/facebook-js-sdk.d.ts" />
var DanceMatch;
(function (DanceMatch) {
    DanceMatch.debugEnabled = true;
    DanceMatch.fbAppId = "478292336279902";
    DanceMatch.fbGraphApiVersion = "v3.3";
    function Config() {
        var config = function ($logProvider) {
            $logProvider.debugEnabled(true);
        };
        config.$inject = ["$logProvider"];
        return config;
    }
    DanceMatch.Config = Config;
    function Run() {
        var run = function ($log) {
            $log.debug("dm:run");
        };
        run.$inject = ["$log"];
        return run;
    }
    DanceMatch.Run = Run;
    function cancel(event) {
        if (angular.isUndefined(event))
            return;
        event.preventDefault();
        event.stopPropagation();
    }
    var Database;
    (function (Database) {
        var Service = /** @class */ (function () {
            function Service($http, $q, $log) {
                this.$http = $http;
                this.$q = $q;
                this.$log = $log;
            }
            Service.prototype.execute = function (name, parameters) {
                var _this = this;
                var deferred = this.$q.defer();
                var procedure = { name: name, parameters: parameters };
                this.$http.post("execute.ashx", procedure).then(function (response) {
                    _this.$log.debug("dm:execute:success", procedure, response);
                    deferred.resolve(response.data);
                }, function (response) {
                    _this.$log.debug("dm:execute:error", procedure, response);
                    _this.$log.error("dm:execute:error", "An unexpected error occurred.");
                    deferred.reject(response.data);
                });
                return deferred.promise;
            };
            Service.$inject = ["$http", "$q", "$log"];
            return Service;
        }());
        Database.Service = Service;
    })(Database = DanceMatch.Database || (DanceMatch.Database = {}));
    var Authentication;
    (function (Authentication) {
        var Service = /** @class */ (function () {
            function Service($document, $window, dmDatabase, $log) {
                var _this = this;
                this.$document = $document;
                this.$window = $window;
                this.dmDatabase = dmDatabase;
                this.$log = $log;
                $window.fbAsyncInit = function () {
                    FB.init({ appId: DanceMatch.fbAppId, status: true, xfbml: true, version: DanceMatch.fbGraphApiVersion });
                    FB.Event.subscribe('auth.authResponseChange', function (authResponse) {
                        _this.$log.debug("dm:fb:authResponse", authResponse);
                        try {
                            if (authResponse.status === "connected") {
                                FB.api("/me", { fields: ["id", "name"] }, function (response) {
                                    _this.$log.debug("dm:fb:me", response);
                                    dmDatabase.execute("Login", response).then(function () { _this._user = response; }, function () { delete _this._user; });
                                });
                            }
                            else {
                                delete _this._user;
                            }
                        }
                        catch (ex) {
                            delete _this._user;
                        }
                    });
                    $log.debug("dm:fb:init");
                };
            }
            Object.defineProperty(Service.prototype, "user", {
                get: function () { return this._user; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Service.prototype, "authenticated", {
                get: function () { return angular.isDefined(this._user); },
                enumerable: true,
                configurable: true
            });
            Service.prototype.login = function (event) { cancel(event); FB.login(angular.noop); };
            Service.prototype.logout = function (event) { cancel(event); FB.logout(angular.noop); };
            Service.$inject = ["$document", "$window", "dmDatabase", "$log"];
            return Service;
        }());
        Authentication.Service = Service;
    })(Authentication = DanceMatch.Authentication || (DanceMatch.Authentication = {}));
    var Menu;
    (function (Menu) {
        var Controller = /** @class */ (function () {
            function Controller(dmAuth) {
                this.dmAuth = dmAuth;
            }
            Controller.prototype.$postLink = function () { };
            Controller.$inject = ["dmAuth"];
            return Controller;
        }());
        Menu.Controller = Controller;
    })(Menu = DanceMatch.Menu || (DanceMatch.Menu = {}));
})(DanceMatch || (DanceMatch = {}));
angular.module("DanceMatch", ["ngRoute", "ngAnimate"])
    .config(DanceMatch.Config())
    .run(DanceMatch.Run())
    .service("dmDatabase", DanceMatch.Database.Service)
    .service("dmAuth", DanceMatch.Authentication.Service)
    .controller("dmMenuController", DanceMatch.Menu.Controller);
//# sourceMappingURL=dancematch.js.map