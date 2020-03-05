"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* global chrome, browser */
const manifest_json_1 = require("../manifest.json");
/** Detect which runtime variable to use so that this extension is compatible with chrome, firefox, opera, and safari */
exports.IS_CHROME = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
/** Selects a runtime variable based on the browser */
exports.GLOBAL_RUNTIME = exports.IS_CHROME ? chrome.runtime : browser.runtime;
/**
 * The host of the webcheckout system. Needed on requestions in firefox due to
 * https://github.com/greasemonkey/greasemonkey/issues/2680
 */
exports.HOST = "https://webcheckout2.coe.uga.edu";
/** Version of the extension pulled from the manifest */
exports.VERSION = manifest_json_1.default.version;
/** Name of the localStorage list used to hold information about when the user has seen */
exports.SEEN_LIST = "webcheckout_seen_list";
