require('../fetchUtils-BAlG765A.cjs');
require('../bufferUtils-S5_-2eN4.cjs');
const require_ClientRequest = require('../ClientRequest-OY5NnrOh.cjs');
require('../handleRequest-DUPo40Df.cjs');
require('../node-DIKcnzhK.cjs');
const require_XMLHttpRequest = require('../XMLHttpRequest-C1KTngEF.cjs');
require('../hasConfigurableGlobal-Befl_QJD.cjs');
const require_fetch = require('../fetch-B9UiBg-M.cjs');

//#region src/presets/node.ts
/**
* The default preset provisions the interception of requests
* regardless of their type (http/https/XMLHttpRequest).
*/
var node_default = [
	new require_ClientRequest.ClientRequestInterceptor(),
	new require_XMLHttpRequest.XMLHttpRequestInterceptor(),
	new require_fetch.FetchInterceptor()
];

//#endregion
module.exports = node_default;
//# sourceMappingURL=node.cjs.map