/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/facebook-js-sdk/facebook-js-sdk.d.ts" />
var Application;
(function (Application) {
    Application.debugEnabled = true;
    Application.fbAppId = "478292336279902";
    Application.fbGraphApiVersion = "v3.3";
    function cancel(event) {
        if (angular.isUndefined(event))
            return;
        event.preventDefault();
        event.stopPropagation();
    }
    Application.cancel = cancel;
})(Application || (Application = {}));
(function (Application) {
    function Config() {
        var config = function ($routeProvider, $logProvider) {
            $routeProvider
                .when("/home", { name: "home", templateUrl: "views/home.html" })
                .when("/profile", { name: "profile", templateUrl: "views/demographics.html", controller: Demographics.Controller, controllerAs: "ctrl" })
                .otherwise({ redirectTo: "/home" })
                .caseInsensitiveMatch = true;
            $logProvider.debugEnabled(true);
        };
        config.$inject = ["$routeProvider", "$logProvider"];
        return config;
    }
    Application.Config = Config;
    function Run() {
        var run = function ($location, $log) {
            $location.path("/login");
            $log.debug("dm:run");
        };
        run.$inject = ["$location", "$log"];
        return run;
    }
    Application.Run = Run;
    var Database;
    (function (Database) {
        var Service = /** @class */ (function () {
            function Service($q, $http, $routeParams, $log) {
                this.$q = $q;
                this.$http = $http;
                this.$routeParams = $routeParams;
                this.$log = $log;
            }
            Service.prototype.execute = function (name, parameters) {
                var _this = this;
                if (parameters === void 0) { parameters = {}; }
                var deferred = this.$q.defer(), procedure = {
                    name: name,
                    routeParams: this.$routeParams || {},
                    parameters: parameters || {},
                    token: null
                };
                this.$http.post("execute.ashx", procedure).then(function (response) {
                    _this.$log.debug("dm:execute:success", procedure, response);
                    deferred.resolve(response.data);
                }, function (response) {
                    if (Application.debugEnabled)
                        _this.$log.error("dm:execute:error", procedure, response);
                    else
                        _this.$log.error("dm:execute:error", "An unexpected error occurred.");
                    deferred.reject(response.data);
                });
                return deferred.promise;
            };
            Service.$inject = ["$q", "$http", "$routeParams", "$log"];
            return Service;
        }());
        Database.Service = Service;
    })(Database = Application.Database || (Application.Database = {}));
    var Authentication;
    (function (Authentication) {
        var Service = /** @class */ (function () {
            function Service($rootScope, $window, dmDatabase, $location, $log) {
                var _this = this;
                this.$rootScope = $rootScope;
                this.$window = $window;
                this.dmDatabase = dmDatabase;
                this.$location = $location;
                this.$log = $log;
                $window.fbAsyncInit = function () {
                    FB.init({ appId: Application.fbAppId, version: Application.fbGraphApiVersion, status: true });
                    FB.Event.subscribe('auth.authResponseChange', function (authResponse) {
                        _this.$log.debug("dm:fb:authResponse", authResponse);
                        try {
                            if (authResponse.status === "connected") {
                                FB.api("/me", { fields: ["id", "name"] }, function (response) {
                                    _this.$log.debug("dm:fb:me2", response);
                                    dmDatabase.execute("Login", response).then(function () {
                                        response.accessToken = authResponse.authResponse.accessToken;
                                        _this._login(response);
                                    }, function () { _this._logout(); });
                                });
                            }
                            else {
                                _this._logout();
                            }
                        }
                        catch (ex) {
                            _this._logout();
                        }
                        finally {
                            $rootScope.$apply();
                        }
                    });
                    $log.debug("dm:fb:init");
                };
            }
            Service.prototype._login = function (user) { this.$window.localStorage.setItem("user", angular.toJson(user, false)); };
            Service.prototype._logout = function () { this.$window.localStorage.removeItem("user"); };
            Object.defineProperty(Service.prototype, "authenticated", {
                get: function () { return this.$window.localStorage.getItem("user") != null; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Service.prototype, "user", {
                get: function () { return (this.authenticated) ? angular.fromJson(this.$window.localStorage.getItem("user")) : null; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Service.prototype, "name", {
                get: function () { return (this.authenticated) ? this.user.name : null; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Service.prototype, "accessToken", {
                get: function () { return (this.authenticated) ? this.user.accessToken : null; },
                enumerable: true,
                configurable: true
            });
            Service.prototype.toggle = function (event) {
                Application.cancel(event);
                if (this.authenticated)
                    FB.logout(angular.noop);
                else
                    FB.login(angular.noop);
            };
            Service.prototype.goHomeIfNotAuthenticated = function () {
                if (this.authenticated)
                    return false;
                this.$location.path("/home");
                return true;
            };
            Service.$inject = ["$rootScope", "$window", "dmDatabase", "$location", "$log"];
            return Service;
        }());
        Authentication.Service = Service;
    })(Authentication = Application.Authentication || (Application.Authentication = {}));
    var Menu;
    (function (Menu) {
        var Controller = /** @class */ (function () {
            function Controller(dmAuth, $rootScope) {
                var _this = this;
                this.dmAuth = dmAuth;
                this.$rootScope = $rootScope;
                this.collapsed = true;
                $rootScope.$on("$routeChangeSuccess", function () { _this.collapsed = true; });
            }
            Controller.prototype.toggle = function () { this.collapsed = !this.collapsed; };
            Controller.prototype.$postLink = function () { };
            Controller.$inject = ["dmAuth", "$rootScope"];
            return Controller;
        }());
        Menu.Controller = Controller;
    })(Menu = Application.Menu || (Application.Menu = {}));
    var Demographics;
    (function (Demographics) {
        var Controller = /** @class */ (function () {
            function Controller($scope, dmAuth, dmDatabase) {
                this.$scope = $scope;
                this.dmAuth = dmAuth;
                this.dmDatabase = dmDatabase;
                if (dmAuth.goHomeIfNotAuthenticated())
                    return;
                dmDatabase.execute("Profile").then(function (response) {
                    $scope.demographics = response[0];
                    dmDatabase.execute("Age").then(function (response) {
                        $scope.ages = response;
                        dmDatabase.execute("Country").then(function (response) {
                            $scope.countries = response;
                            dmDatabase.execute("Quality").then(function (response) {
                                $scope.qualities = response;
                            });
                        });
                    });
                });
            }
            Controller.prototype.save = function () {
                var _this = this;
                if (this.$scope.form.$valid) {
                    this.dmDatabase.execute("DemographicsUpdate", this.$scope.demographics)
                        .then(function (response) { _this.$scope.form.$setPristine(); });
                }
                else {
                    this.$scope.form.$setSubmitted();
                    return;
                }
            };
            Controller.$inject = ["$scope", "dmAuth", "dmDatabase"];
            return Controller;
        }());
        Demographics.Controller = Controller;
    })(Demographics = Application.Demographics || (Application.Demographics = {}));
    var Profile;
    (function (Profile) {
        var Controller = /** @class */ (function () {
            function Controller($scope, dmDatabase, $routeParams) {
                this.$scope = $scope;
                this.dmDatabase = dmDatabase;
                this.$routeParams = $routeParams;
                dmDatabase.execute("Profile").then(function (response) {
                    $scope.profile = response[0];
                    dmDatabase.execute("Age").then(function (response) {
                        $scope.ages = response;
                        dmDatabase.execute("Country").then(function (response) {
                            $scope.countries = response;
                            dmDatabase.execute("Quality").then(function (response) {
                                $scope.qualities = response;
                            });
                        });
                    });
                });
            }
            Controller.prototype.setDemographics = function () {
                this.dmDatabase.execute("SetDemographics", this.$scope.profile);
            };
            Controller.prototype.setImportance = function (quality, ratingId) {
                this.dmDatabase.execute("SetImportance", { qualityId: quality.id, ratingId: ratingId })
                    .then(function (response) { quality.ratingId = ratingId; });
            };
            Controller.$inject = ["$scope", "dmDatabase", "$routeParams"];
            return Controller;
        }());
        Profile.Controller = Controller;
    })(Profile = Application.Profile || (Application.Profile = {}));
})(Application || (Application = {}));
angular.module("DanceMatch", ["ngRoute", "ngAnimate"])
    .config(Application.Config())
    .run(Application.Run())
    .service("dmDatabase", Application.Database.Service)
    .service("dmAuth", Application.Authentication.Service)
    .controller("dmMenuController", Application.Menu.Controller);
//# sourceMappingURL=dancematch.js.map