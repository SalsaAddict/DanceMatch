/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/facebook-js-sdk/facebook-js-sdk.d.ts" />

namespace Application { // Global Variables
    export const debugEnabled: boolean = true;
    export const fbAppId: string = "478292336279902";
    export const fbGraphApiVersion: string = "v3.3";
    export function cancel(event: ng.IAngularEvent): void {
        if (angular.isUndefined(event)) return;
        event.preventDefault();
        event.stopPropagation();
    }
}

namespace Application { // Interfaces
    export interface IUser { id: string; name: string; accessToken: string; }
    export interface IDemographics { roleId: boolean; ageId: number; countryId: string; }
    export interface IAge { id: number; description: string; }
    export interface ICountry { id: string; name: string; }
    export interface IQuality { id: number; description: string; ratingId: number; }
    export interface IProcedure { name: string; routeParams: ng.route.IRouteParamsService; parameters: IParameters; token: string; }
    export interface IParameters { [name: string]: any; }
}

namespace Application { // Config & Run
    export function Config(): ng.Injectable<Function> {
        let config: Function = function (
            $routeProvider: ng.route.IRouteProvider,
            $logProvider: ng.ILogProvider): void {
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
    export function Run(): ng.Injectable<Function> {
        let run: ng.Injectable<Function> = function (
            $location: ng.ILocationService,
            $log: ng.ILogService): void {
            $location.path("/login");
            $log.debug("dm:run");
        };
        run.$inject = ["$location", "$log"];
        return run;
    }
    export namespace Database {
        export class Service {
            static $inject: string[] = ["$q", "$http", "$routeParams", "$log"];
            constructor(
                private $q: ng.IQService,
                private $http: ng.IHttpService,
                private $routeParams: ng.route.IRouteParamsService,
                private $log: ng.ILogService) { }
            public execute<T>(name: string, parameters: IParameters = {}): ng.IPromise<T> {
                let deferred: ng.IDeferred<T> = this.$q.defer(),
                    procedure: IProcedure = {
                        name: name,
                        routeParams: this.$routeParams || {},
                        parameters: parameters || {},
                        token: null
                    };
                this.$http.post("execute.ashx", procedure).then(
                    (response: ng.IHttpPromiseCallbackArg<T>): void => {
                        this.$log.debug("dm:execute:success", procedure, response);
                        deferred.resolve(response.data);
                    },
                    (response: ng.IHttpPromiseCallbackArg<any>): void => {
                        if (Application.debugEnabled)
                            this.$log.error("dm:execute:error", procedure, response);
                        else
                            this.$log.error("dm:execute:error", "An unexpected error occurred.");
                        deferred.reject(response.data);
                    });
                return deferred.promise;
            }
        }
    }
    export namespace Authentication {
        interface IWindowService extends ng.IWindowService { fbAsyncInit: Function; }
        export class Service {
            static $inject: string[] = ["$rootScope", "$window", "dmDatabase", "$location", "$log"];
            constructor(
                private $rootScope: ng.IScope,
                private $window: IWindowService,
                private dmDatabase: Database.Service,
                private $location: ng.ILocationService,
                private $log: ng.ILogService) {
                $window.fbAsyncInit = (): void => {
                    FB.init({ appId: fbAppId, version: fbGraphApiVersion, status: true });
                    FB.Event.subscribe('auth.authResponseChange', (authResponse: fb.AuthResponse): void => {
                        this.$log.debug("dm:fb:authResponse", authResponse);
                        try {
                            if (authResponse.status === "connected") {
                                FB.api("/me", { fields: ["id", "name"] }, (response: IUser) => {
                                    this.$log.debug("dm:fb:me2", response);
                                    dmDatabase.execute("Login", response).then(
                                        (): void => {
                                            response.accessToken = authResponse.authResponse.accessToken;
                                            this._login(response);
                                        },
                                        (): void => { this._logout(); });
                                });
                            } else { this._logout(); }
                        }
                        catch (ex) { this._logout(); }
                        finally { $rootScope.$apply(); }
                    });
                    $log.debug("dm:fb:init");
                };
            }
            private _login(user: IUser): void { this.$window.localStorage.setItem("user", angular.toJson(user, false)); }
            private _logout(): void { this.$window.localStorage.removeItem("user"); }
            public get authenticated(): boolean { return this.$window.localStorage.getItem("user") != null; }
            public get user(): IUser { return (this.authenticated) ? angular.fromJson(this.$window.localStorage.getItem("user")) : null; }
            public get name(): string { return (this.authenticated) ? this.user.name : null; }
            public get accessToken(): string { return (this.authenticated) ? this.user.accessToken : null; }
            public toggle(event: ng.IAngularEvent): void { cancel(event); if (this.authenticated) FB.logout(angular.noop); else FB.login(angular.noop); }
            public goHomeIfNotAuthenticated(): boolean { if (this.authenticated) return false; this.$location.path("/home"); return true; }
        }
    }
    export namespace Menu {
        export class Controller implements ng.IController {
            static $inject: string[] = ["dmAuth", "$rootScope"];
            constructor(
                public dmAuth: Authentication.Service,
                private $rootScope: angular.IRootScopeService) {
                $rootScope.$on("$routeChangeSuccess", (): void => { this.collapsed = true; });
            }
            public collapsed: boolean = true;
            public toggle(): void { this.collapsed = !this.collapsed; }
            public $postLink(): void { }
        }
    }
    export namespace Demographics {
        interface IScope extends ng.IScope {
            form: ng.IFormController;
            demographics: IDemographics;
            ages: IAge[];
            countries: ICountry[];
            qualities: IQuality[];
        }
        export class Controller {
            static $inject: string[] = ["$scope", "dmAuth", "dmDatabase"];
            constructor(
                private $scope: IScope,
                private dmAuth: Authentication.Service,
                private dmDatabase: Database.Service) {
                if (dmAuth.goHomeIfNotAuthenticated()) return;
                dmDatabase.execute("Profile").then(
                    (response: IDemographics[]): void => {
                        $scope.demographics = response[0];
                        dmDatabase.execute("Age").then(
                            (response: IAge[]): void => {
                                $scope.ages = response;
                                dmDatabase.execute("Country").then(
                                    (response: ICountry[]): void => {
                                        $scope.countries = response;
                                        dmDatabase.execute("Quality").then(
                                            (response: IQuality[]): void => {
                                                $scope.qualities = response;
                                            })
                                    })
                            })
                    });
            }
            public save(): void {
                if (this.$scope.form.$valid) {
                    this.dmDatabase.execute("DemographicsUpdate", this.$scope.demographics)
                        .then((response: never): void => { this.$scope.form.$setPristine(); });
                } else {
                    this.$scope.form.$setSubmitted();
                    return;
                }
            }
        }
    }
    export namespace Profile {
        interface IScope extends ng.IScope { profile: IDemographics; ages: IAge[]; countries: ICountry[]; qualities: IQuality[]; }
        export class Controller {
            static $inject: string[] = ["$scope", "dmDatabase", "$routeParams"];
            constructor(
                private $scope: IScope,
                private dmDatabase: Database.Service,
                private $routeParams: ng.route.IRouteParamsService) {
                dmDatabase.execute("Profile").then(
                    (response: IDemographics[]): void => {
                        $scope.profile = response[0];
                        dmDatabase.execute("Age").then(
                            (response: IAge[]): void => {
                                $scope.ages = response;
                                dmDatabase.execute("Country").then(
                                    (response: ICountry[]): void => {
                                        $scope.countries = response;
                                        dmDatabase.execute("Quality").then(
                                            (response: IQuality[]): void => {
                                                $scope.qualities = response;
                                            })
                                    })
                            })
                    });
            }
            public setDemographics(): void {
                this.dmDatabase.execute("SetDemographics", this.$scope.profile);
            }
            public setImportance(quality: IQuality, ratingId: number): void {
                this.dmDatabase.execute("SetImportance", { qualityId: quality.id, ratingId: ratingId })
                    .then((response: never): void => { quality.ratingId = ratingId; });
            }
        }
    }
}

angular.module("DanceMatch", ["ngRoute", "ngAnimate"])
    .config(Application.Config())
    .run(Application.Run())
    .service("dmDatabase", Application.Database.Service)
    .service("dmAuth", Application.Authentication.Service)
    .controller("dmMenuController", Application.Menu.Controller);