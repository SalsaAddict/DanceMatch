/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/facebook-js-sdk/facebook-js-sdk.d.ts" />
var DanceMatch;
(function (DanceMatch) {
    DanceMatch.debugEnabled = true;
    DanceMatch.fbAppId = "478292336279902";
    DanceMatch.fbGraphApiVersion = "v3.3";
    function Config() {
        var config = function ($routeProvider, $logProvider) {
            $routeProvider
                .when("/home", { name: "home", templateUrl: "views/home.html" })
                .when("/profile/:userId", { name: "profile", templateUrl: "views/profile.html", controller: Profile.Controller, controllerAs: "ctrl" })
                .otherwise({ redirectTo: "/home" })
                .caseInsensitiveMatch = true;
            $logProvider.debugEnabled(true);
        };
        config.$inject = ["$routeProvider", "$logProvider"];
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
            function Service($http, $q, $routeParams, $log) {
                this.$http = $http;
                this.$q = $q;
                this.$routeParams = $routeParams;
                this.$log = $log;
            }
            Service.prototype.execute = function (name, routeParams, parameters) {
                var _this = this;
                if (routeParams === void 0) { routeParams = true; }
                var deferred = this.$q.defer();
                var procedure = { name: name, parameters: {} };
                if (angular.isArray(routeParams)) {
                    angular.forEach(routeParams, function (name) {
                        procedure.parameters[name] = _this.$routeParams[name];
                    });
                }
                else if (routeParams === true) {
                    angular.forEach(this.$routeParams, function (value, key) {
                        procedure.parameters[key] = value;
                    });
                }
                if (angular.isObject(parameters)) {
                    angular.extend(procedure.parameters, parameters);
                }
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
            Service.$inject = ["$http", "$q", "$routeParams", "$log"];
            return Service;
        }());
        Database.Service = Service;
    })(Database = DanceMatch.Database || (DanceMatch.Database = {}));
    var Authentication;
    (function (Authentication) {
        var Service = /** @class */ (function () {
            function Service($rootScope, $window, dmDatabase, $log) {
                var _this = this;
                this.$log = $log;
                $window.fbAsyncInit = function () {
                    FB.init({ appId: DanceMatch.fbAppId, version: DanceMatch.fbGraphApiVersion, status: true });
                    FB.Event.subscribe('auth.authResponseChange', function (authResponse) {
                        _this.$log.debug("dm:fb:authResponse", authResponse);
                        try {
                            if (authResponse.status === "connected") {
                                FB.api("/me", { fields: ["id", "name"] }, function (response) {
                                    _this.$log.debug("dm:fb:me", response);
                                    dmDatabase.execute("Login", false, response).then(function () { _this._user = response; }, function () { delete _this._user; });
                                });
                            }
                            else {
                                delete _this._user;
                            }
                        }
                        catch (ex) {
                            delete _this._user;
                        }
                        finally {
                            $rootScope.$apply();
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
            Service.prototype.toggle = function (event) {
                cancel(event);
                if (this.authenticated)
                    FB.logout(angular.noop);
                else
                    FB.login(angular.noop);
            };
            Service.$inject = ["$rootScope", "$window", "dmDatabase", "$log"];
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
    var Profile;
    (function (Profile) {
        var Controller = /** @class */ (function () {
            function Controller($scope, dmDatabase, $routeParams) {
                this.$scope = $scope;
                this.dmDatabase = dmDatabase;
                this.$routeParams = $routeParams;
                dmDatabase.execute("Profile", true).then(function (response) {
                    $scope.profile = response[0];
                    dmDatabase.execute("Age", false).then(function (response) {
                        $scope.ages = response;
                        dmDatabase.execute("Country", false).then(function (response) {
                            $scope.countries = response;
                            dmDatabase.execute("Quality", true).then(function (response) {
                                $scope.qualities = response;
                            });
                        });
                    });
                });
            }
            Controller.$inject = ["$scope", "dmDatabase", "$routeParams"];
            return Controller;
        }());
        Profile.Controller = Controller;
    })(Profile = DanceMatch.Profile || (DanceMatch.Profile = {}));
})(DanceMatch || (DanceMatch = {}));
angular.module("DanceMatch", ["ngRoute", "ngAnimate"])
    .config(DanceMatch.Config())
    .run(DanceMatch.Run())
    .service("dmDatabase", DanceMatch.Database.Service)
    .service("dmAuth", DanceMatch.Authentication.Service)
    .controller("dmMenuController", DanceMatch.Menu.Controller);
//# sourceMappingURL=dancematch.js.map