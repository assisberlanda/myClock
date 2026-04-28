require('../createRequestId-DOf8Ktjs.cjs');
require('../getRawRequest-B6GjFKAr.cjs');
require('../bufferUtils-Uc0eRItL.cjs');
require('../hasConfigurableGlobal-B5o6PHq3.cjs');
require('../handleRequest-BIte-8l8.cjs');
const require_fetch = require('../fetch-BmrYPMQ0.cjs');
const require_XMLHttpRequest = require('../XMLHttpRequest-DNly-bu0.cjs');

//#region src/presets/browser.ts
/**
* The default preset provisions the interception of requests
* regardless of their type (fetch/XMLHttpRequest).
*/
var browser_default = [new require_fetch.FetchInterceptor(), new require_XMLHttpRequest.XMLHttpRequestInterceptor()];

//#endregion
module.exports = browser_default;
//# sourceMappingURL=browser.cjs.map