/* global chrome, browser */
import manifest from '../manifest.json';

/** Detect which runtime variable to use so that this extension is compatible with chrome, firefox, opera, and safari */
export const IS_CHROME = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

/** Selects a runtime variable based on the browser */
export const GLOBAL_RUNTIME = IS_CHROME ? chrome.runtime : browser.runtime;

/**
 * The host of the webcheckout system. Needed on requestions in firefox due to
 * https://github.com/greasemonkey/greasemonkey/issues/2680
 */
export const HOST = "https://webcheckout.coe.uga.edu";

/** Version of the extension pulled from the manifest */
export const VERSION = manifest.version;

/** Name of the localStorage list used to hold information about when the user has seen */
export const SEEN_LIST = "webcheckout_seen_list";
