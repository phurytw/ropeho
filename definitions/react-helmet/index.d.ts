// Type definitions for react-helmet 5
// Project: https://github.com/nfl/react-helmet
// Definitions by: Evan Bremer <https://github.com/evanbb>, Isman Usoh <https://github.com/isman-usoh>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1

/// <reference types="react" />

declare module "react-helmet" {
    import * as React from "react";

    export class Helmet extends React.Component<any, any> {
        static peek(): HelmetData;
        static rewind(): HelmetData;
        static renderStatic(): HelmetData;
        static canUseDOM: boolean;
    }

    export interface HelmetData {
        base: HelmetDatum;
        bodyAttributes: HelmetDatum;
        htmlAttributes: HelmetDatum;
        link: HelmetDatum;
        meta: HelmetDatum;
        noscript: HelmetDatum;
        script: HelmetDatum;
        style: HelmetDatum;
        title: HelmetDatum;
        titleAttributes: HelmetDatum;
    }

    export interface HelmetDatum {
        toString(): string;
        toComponent(): React.Component<any, any>;
    }

    export const peek: () => HelmetData;
    export const rewind: () => HelmetData;
    export const renderStatic: () => HelmetData;
    export const canUseDOM: boolean;
    export default Helmet;
}
