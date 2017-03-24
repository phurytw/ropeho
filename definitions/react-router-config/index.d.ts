// Type definitions for react-router-config 1.0.0-beta.1
// Project: https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
// Definitions by: François Nguyen <https://github.com/lith-light-g>

declare module "react-router-config" {
    import * as React from "react";
    import { PartialRouteComponentProps, RouteComponentProps, match } from "react-router";
    import { Location } from "history";

    export interface RouteConfig {

        location?: Location;
        component?: React.SFC<PartialRouteComponentProps<any> | void> | React.ComponentClass<PartialRouteComponentProps<any> | void>;
        path?: string;
        exact?: boolean;
        strict?: boolean;
        routes?: RouteConfig[];
    }

    export interface MatchedRoute<T> {
        route: RouteConfig;
        match: match<T>
    }

    export function matchRoutes<T>(routes: RouteConfig[], pathname: string): MatchedRoute<T>[];

    export function renderRoutes(routes: RouteConfig[]): JSX.Element;
}
