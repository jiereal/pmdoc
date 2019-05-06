const babelParser = require('@babel/parser');
const logger = require('utils/logger');
const deepmerge = require('deepmerge');

/**
 * @typedef parserOptions
 * @type {{allowSuperOutsideMethod: boolean, allowImportExportEverywhere: boolean, allowAwaitOutsideFunction: boolean, ranges: boolean, sourceType: string, plugins: *[], allowReturnOutsideFunction: boolean}}
 */
const parserOptions = exports.parserOptions = {
	allowAwaitOutsideFunction: true,
	allowImportExportEverywhere: true,
	allowReturnOutsideFunction: true,
	allowSuperOutsideMethod: true,
	plugins: [
		'asyncGenerators',
		'bigInt',
		'classPrivateMethods',
		'classPrivateProperties',
		'classProperties',
		['decorators', {
			decoratorsBeforeExport: true
		}],
		'doExpressions',
		'dynamicImport',
		'estree',
		'exportDefaultFrom',
		'exportNamespaceFrom',
		'functionBind',
		'functionSent',
		'importMeta',
		'jsx',
		'logicalAssignment',
		'nullishCoalescingOperator',
		'numericSeparator',
		'objectRestSpread',
		'optionalCatchBinding',
		'optionalChaining',
		['pipelineOperator', {
			proposal: 'minimal'
		}],
		'throwExpressions'
	],
	ranges: true,
	// sourceType: env.conf.sourceType
	sourceType: 'module'
};

/**
 *
 * @param {string} source - 文件内容
 * @param {string} filename - 文件名称
 * @param {parserOptions} options - 文件解析option
 * @returns {File}
 */
function parse(source, filename, options) {
	let ast;

	try {
		ast = babelParser.parse(source, deepmerge(parserOptions, options));
		// console.log(JSON.stringify(ast, null, 2));
	} catch (e) {
		logger.error('Unable to parse %s: %s', filename, e.message);
	}

	return ast;
}

// TODO: docs
class AstBuilder {
	constructor(options) {
		this.parserOptions = options;
	}

	/**
	 * 构建ast树
	 * @param source
	 * @param filename
	 * @returns {File}
	 */
	build(source, filename) {
		return parse(source, filename, this.parserOptions);
	}
}

exports.AstBuilder = AstBuilder;
