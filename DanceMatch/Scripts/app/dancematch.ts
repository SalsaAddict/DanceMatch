/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/facebook-js-sdk/facebook-js-sdk.d.ts" />

namespace DanceMatch {
    export const debugEnabled: boolean = true;
    export const fbAppId: string = "478292336279902";
    export const fbGraphApiVersion: string = "v3.3";
    export function Config(): ng.Injectable<Function> {
        let config: Function = function ($logProvider: ng.ILogProvider): void {
            $logProvider.debugEnabled(true);
        };
        config.$inject = ["$logProvider"];
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
        export class Service {
            static $inject: string[] = ["$http", "$q", "$log"];
            constructor(
                private $http: ng.IHttpService,
                private $q: ng.IQService,
                private $log: ng.ILogService) { }
            public execute<T>(name: string, parameters?: IParameters): ng.IPromise<T> {
                let deferred: ng.IDeferred<T> = this.$q.defer();
                let procedure: IProcedure = { name: name, parameters: parameters };
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
            static $inject: string[] = ["$document", "$window", "dmDatabase", "$log"];
            constructor(
                private $document: ng.IDocumentService,
                private $window: IWindowService,
                private dmDatabase: Database.Service,
                private $log: ng.ILogService) {
                $window.fbAsyncInit = (): void => {
                    FB.init({ appId: fbAppId, status: true, xfbml: true, version: fbGraphApiVersion });
                    FB.Event.subscribe('auth.authResponseChange', (authResponse: fb.AuthResponse): void => {
                        this.$log.debug("dm:fb:authResponse", authResponse);
                        try {
                            if (authResponse.status === "connected") {
                                FB.api("/me", { fields: ["id", "name"] }, (response: IUser) => {
                                    this.$log.debug("dm:fb:me", response);
                                    dmDatabase.execute("Login", response).then(
                                        (): void => { this._user = response; },
                                        (): void => { delete this._user; });
                                });
                            } else { delete this._user; }
                        }
                        catch (ex) { delete this._user; }
                    });
                    $log.debug("dm:fb:init");
                };
            }
            private _user: IUser;
            public get user(): IUser { return this._user; }
            public get authenticated(): boolean { return angular.isDefined(this._user); }
            public login(event: ng.IAngularEvent): void { cancel(event); FB.login(angular.noop); }
            public logout(event: ng.IAngularEvent): void { cancel(event); FB.logout(angular.noop); }
        }
    }
    export namespace Menu {
        export class Controller implements ng.IController {
            static $inject: string[] = ["dmAuth"];
            constructor(public dmAuth: Authentication.Service) { }
            public $postLink(): void { }
        }
    }
}

angular.module("DanceMatch", ["ngRoute", "ngAnimate"])
    .config(DanceMatch.Config())
    .run(DanceMatch.Run())
    .service("dmDatabase", DanceMatch.Database.Service)
    .service("dmAuth", DanceMatch.Authentication.Service)
    .controller("dmMenuController", DanceMatch.Menu.Controller);