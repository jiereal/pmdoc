/**
 * @module core/scanner
 */
const EventEmitter = require('events').EventEmitter;
const fs = require('utils/fs');
const logger = require('utils/logger');

/**
 * @extends module:events.EventEmitter
 */
class Scanner extends EventEmitter {
	/**
	 * Recursively searches the given searchPaths for js files.
	 * @param {Array.<string>} searchPaths - 搜索路径
	 * @param {number} [depth]
	 * @param {function} filter - 过滤器
	 */
	scan(searchPaths = [], depth = 1, filter) {
		let currentFile;
		let filePaths = [];

		searchPaths.forEach(filepath => {
			try {
				currentFile = fs.statSync(filepath);
			} catch (e) {
				logger.error('Unable to find the source file or directory %s', filepath);

				return;
			}

			if (currentFile.isFile()) {
				filePaths.push(filepath);
			} else {
				filePaths = filePaths.concat(fs.ls(filepath, depth));
			}
		});

		filePaths = filePaths.filter($ => filter.isIncluded($));

		return filePaths;
	}
}

exports.Scanner = Scanner;
