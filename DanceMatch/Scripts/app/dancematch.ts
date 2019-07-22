/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/facebook-js-sdk/facebook-js-sdk.d.ts" />

namespace DanceMatch {
    export const debugEnabled: boolean = true;
    export const fbAppId: string = "478292336279902";
    export const fbGraphApiVersion: string = "v3.3";
    export function Config(): ng.Injectable<Function> {
        let config: Function = function (
            $routeProvider: ng.route.IRouteProvider,
            $logProvider: ng.ILogProvider): void {
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
    export function Run(): ng.Injectable<Function> {
        let run: ng.Injectable<Function> = function (
            $log: ng.ILogService): void {
            $log.debug("dm:run");
        };
        run.$inject = ["$log"];
        return run;
    }
    function cancel(event: ng.IAngularEvent): void {
        if (angular.isUndefined(event)) return;
        event.preventDefault();
        event.stopPropagation();
    }
    export interface IUser { id: string; name: string; }
    export namespace Database {
        export interface IProcedure { name: string; parameters: IParameters }
        export interface IParameters { [name: string]: any; }
        export type TRouteParams = boolean | string[];
        export class Service {
            static $inject: string[] = ["$http", "$q", "$routeParams", "$log"];
            constructor(
                private $http: ng.IHttpService,
                private $q: ng.IQService,
                private $routeParams: angular.route.IRouteParamsService,
                private $log: ng.ILogService) { }
            public execute<T>(name: string, routeParams: TRouteParams = true, parameters?: IParameters): ng.IPromise<T> {
                let deferred: ng.IDeferred<T> = this.$q.defer();
                let procedure: IProcedure = { name: name, parameters: {} };
                if (angular.isArray(routeParams)) {
                    angular.forEach(routeParams, (name: string): void => {
                        procedure.parameters[name] = this.$routeParams[name];
                    });
                } else if (routeParams === true) {
                    angular.forEach(this.$routeParams, (value: any, key: string): void => {
                        procedure.parameters[key] = value;
                    });
                }
                if (angular.isObject(parameters)) {
                    angular.extend(procedure.parameters, parameters);
                }
                this.$http.post("execute.ashx", procedure).then(
                    (response: ng.IHttpPromiseCallbackArg<T>): void => {
                        this.$log.debug("dm:execute:success", procedure, response);
                        deferred.resolve(response.data);
                    },
                    (response: ng.IHttpPromiseCallbackArg<string>): void => {
                        this.$log.debug("dm:execute:error", procedure, response);
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
            static $inject: string[] = ["$rootScope", "$window", "dmDatabase", "$log"];
            constructor(
                $rootScope: ng.IScope,
                $window: IWindowService,
                dmDatabase: Database.Service,
                private $log: ng.ILogService) {
                $window.fbAsyncInit = (): void => {
                    FB.init({ appId: fbAppId, version: fbGraphApiVersion, status: true });
                    FB.Event.subscribe('auth.authResponseChange', (authResponse: fb.AuthResponse): void => {
                        this.$log.debug("dm:fb:authResponse", authResponse);
                        try {
                            if (authResponse.status === "connected") {
                                FB.api("/me", { fields: ["id", "name"] }, (response: IUser) => {
                                    this.$log.debug("dm:fb:me", response);
                                    dmDatabase.execute("Login", false, response).then(
                                        (): void => { this._user = response; },
                                        (): void => { delete this._user; });
                                });
                            } else { delete this._user; }
                        }
                        catch (ex) { delete this._user; }
                        finally { $rootScope.$apply(); }
                    });
                    $log.debug("dm:fb:init");
                };
            }
            private _user: IUser;
            public get user(): IUser { return this._user; }
            public get authenticated(): boolean { return angular.isDefined(this._user); }
            public toggle(event: ng.IAngularEvent): void {
                cancel(event);
                if (this.authenticated)
                    FB.logout(angular.noop);
                else
                    FB.login(angular.noop);
            }
        }
    }
    export namespace Menu {
        export class Controller implements ng.IController {
            static $inject: string[] = ["dmAuth"];
            constructor(public dmAuth: Authentication.Service) { }
            public $postLink(): void { }
        }
    }
    export namespace Profile {
        interface IProfile { roleId: boolean; ageId: number; countryId: string; }
        interface IAge { id: number; description: string; }
        interface ICountry { id: string; name: string; }
        interface IImportance { id: number; description: string; ratingId: number; }
        interface IScope extends ng.IScope { profile: IProfile; ages: IAge[]; countries: ICountry[]; qualities: IImportance[]; }
        export class Controller {
            static $inject: string[] = ["$scope", "dmDatabase", "$routeParams"];
            constructor(
                private $scope: IScope,
                private dmDatabase: Database.Service,
                private $routeParams: ng.route.IRouteParamsService) {
                dmDatabase.execute("Profile", true).then(
                    (response: IProfile[]): void => {
                        $scope.profile = response[0];
                        dmDatabase.execute("Age", false).then(
                            (response: IAge[]): void => {
                                $scope.ages = response;
                                dmDatabase.execute("Country", false).then(
                                    (response: ICountry[]): void => {
                                        $scope.countries = response;
                                        dmDatabase.execute("Quality", true).then(
                                            (response: IImportance[]): void => {
                                                $scope.qualities = response;
                                            })
                                    })
                            })
                    });
            }
        }
    }
}

angular.module("DanceMatch", ["ngRoute", "ngAnimate"])
    .config(DanceMatch.Config())
    .run(DanceMatch.Run())
    .service("dmDatabase", DanceMatch.Database.Service)
    .service("dmAuth", DanceMatch.Authentication.Service)
    .controller("dmMenuController", DanceMatch.Menu.Controller);