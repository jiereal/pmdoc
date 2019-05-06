const path = require('path');
const fs = require('fs');
/**
 * 解析文件路径
 * @param {string} filename - 文件名
 * @param {array} context - resolve 上下文
 * @returns {*}
 */

module.exports = (filename, context = []) => {
	let result = null;

	function exists(p) {
		try {
			fs.statSync(p);

			return true;
		} catch (e) {
			return false;
		}
	}

	function resolve(p) {
		try {
			return require.resolve(p);
		} catch (e) {
			return null;
		}
	}

	function find(p) {
		// does the requested path exist?
		if (exists(p)) {
			result = p;
		} else {
			// can `require()` find the requested path?
			result = resolve(p);
		}

		return Boolean(result);
	}

	// is the filepath absolute? if so, just use it
	if (path.isAbsolute(filename)) {
		find(filename);
	} else {
		context.some(searchDir => {
			if (searchDir) {
				return find(path.resolve(path.join(searchDir, filename)));
			} else {
				return false;
			}
		});
	}

	// if we still haven't found the resource, maybe it's an installed module
	if (!result) {
		result = resolve(filename);
	}

	return result;
};
