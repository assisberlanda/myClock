import "../createRequestId-DYCsFHOi.mjs";
import "../getRawRequest-BP--nUwn.mjs";
import "../bufferUtils-BiiO6HZv.mjs";
import "../hasConfigurableGlobal-B39W0thh.mjs";
import "../handleRequest-CnDA8MVO.mjs";
import { t as FetchInterceptor } from "../fetch-BS6cxWzo.mjs";
import { t as XMLHttpRequestInterceptor } from "../XMLHttpRequest-DaQ73vVt.mjs";

//#region src/presets/browser.ts
/**
* The default preset provisions the interception of requests
* regardless of their type (fetch/XMLHttpRequest).
*/
var browser_default = [new FetchInterceptor(), new XMLHttpRequestInterceptor()];

//#endregion
export { browser_default as default };
//# sourceMappingURL=browser.mjs.map