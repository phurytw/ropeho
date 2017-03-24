/// <reference types="node" />
/// <reference types="socket.io" />
/// <reference path="../../definitions/http-proxy/index.d.ts" />
/// <reference path="../../definitions/react-router-config/index.d.ts" />
/// <reference path="../../definitions/react-helmet/index.d.ts" />
/// <reference path="../ropeho.d.ts" />

interface Window {
    __REDUX_STATE__: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}

// Remove those when type definitions are available
interface NodeModule {
    hot: {
        accept: (pathToRootComponent: string, callback: () => void) => void
    };
}

declare module "react-hot-loader" {
    const AppContainer: () => JSX.Element;
}

declare module "serialize-javascript" {
    namespace serializeJavascript { }
    function serializeJavascript(any: any, options?: any): string;
    export = serializeJavascript;
}
