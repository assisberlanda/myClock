import "../fetchUtils-Bq0Mdmkv.mjs";
import "../bufferUtils-DxPxwff_.mjs";
import { t as ClientRequestInterceptor } from "../ClientRequest-BquJl6T-.mjs";
import "../handleRequest-u6jpjgrr.mjs";
import "../node-lsdNwZEW.mjs";
import { t as XMLHttpRequestInterceptor } from "../XMLHttpRequest-Cj07Pos7.mjs";
import "../hasConfigurableGlobal-jN_-v3gp.mjs";
import { t as FetchInterceptor } from "../fetch-UxWd1aQX.mjs";

//#region src/presets/node.ts
/**
* The default preset provisions the interception of requests
* regardless of their type (http/https/XMLHttpRequest).
*/
var node_default = [
	new ClientRequestInterceptor(),
	new XMLHttpRequestInterceptor(),
	new FetchInterceptor()
];

//#endregion
export { node_default as default };
//# sourceMappingURL=node.mjs.map