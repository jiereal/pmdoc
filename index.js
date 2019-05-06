const stripBom = require('utils/stripbom');
const stripJsonComments = require('strip-json-comments');
const Promise = require('bluebird');
const process = require('process');
const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');
const defaultConfig = require('./default.config');
const resolve = require('utils/resolve');
const logger = require('utils/logger');

module.exports = class JsDoc {
	constructor(options) {
		options = merge(options, defaultConfig);

		let jsdocPath = __dirname;
		const pwd = process.cwd();

		if (fs.statSync(jsdocPath).isSymbolicLink()) {
			jsdocPath = path.resolve(path.dirname(jsdocPath), fs.readlinkSync(jsdocPath));
		}

		this.dirname = jsdocPath; // jsdoc的工作目录
		options.pwd = pwd; // node执行目录
		this.version = {};
		this.docs = [];
		this.packageJson = null;
		this.sourceFiles = [];
		this.run = {
			start: new Date(),
			finish: null
		};
		this.version = {
			number: null,
			revision: null
		};
		this.resolvePaths = [options.pwd, this.dirname, ...(options.resolvePaths || [])];
		if (options.source.exclude && Array.isArray(options.source.exclude)) {
			options.source.exclude = options.source.exclude.map((filename) => resolve(filename, this.resolvePaths));
		}
		this.options = options;
		this.parser = this.createParser();
		this.installConverters();

		global.debug = options.debug;
		global.pwd = pwd;
	}

	setVersionInfo() {
		const info = JSON.parse(stripBom.strip(fs.readFileSync(path.join(this.dirname, 'package.json'), 'utf8')));

		this.version = {
			number: info.version,
			revision: new Date(parseInt(info.revision, 10)).toUTCString()
		};

		return this;
	}

	runCommand() {
		return this.main();
	}

	main() {
		this.scanFiles();

		if (this.sourceFiles.length === 0) {
			return Promise.reject(new Error('There are no input files to process.'));
		} else {
			this.parseFiles();
			this.installConverters().forEach(({module, callback}) => {
				module.exec(this.docs, callback);
			});
			this.run.finish = new Date();
			return Promise.resolve(this.docs);
		}
	}

	installConverters() {
		const converters = this.options.converters;
		const modules = [];
		Object.keys(converters).forEach((name) => {
			try {
				modules.push({
					module: require(resolve(`converters/${name}`, this.resolvePaths)).install(this.options),
					callback: converters[name]
				});
			} catch (e) {
				logger.fatal(`not support converter ${name}`);
			}
		});
		return modules;
	}

	static readPackageJson(filepath) {
		try {
			return stripJsonComments(fs.readFileSync(filepath, 'utf8'));
		} catch (e) {
			console.error('Unable to read the package file "%s"', filepath);

			return null;
		}
	}

	buildSourceList() {
		const Readme = require('core/readme');

		const options = this.options;
		let packageJson;
		let readmeHtml;
		let sourceFile;
		let sourceFiles = options.sourceFiles;

		if (options.source && options.source.include) {
			sourceFiles = sourceFiles.concat(options.source.include);
		}

		// load the user-specified package/README files, if any
		if (options.package) {
			packageJson = JsDoc.readPackageJson(options.package);
		}
		if (options.readme) {
			readmeHtml = new Readme(options.readme, options).html;
		}

		// source files named `package.json` or `README.md` get special treatment, unless the user
		// explicitly specified a package and/or README file
		for (let i = 0, l = sourceFiles.length; i < l; i++) {
			sourceFile = sourceFiles[i];

			if (!options.package && /\bpackage\.json$/i.test(sourceFile)) {
				packageJson = JsDoc.readPackageJson(sourceFile);
				sourceFiles.splice(i--, 1);
			}

			if (!options.readme && /(\bREADME|\.md)$/i.test(sourceFile)) {
				readmeHtml = new Readme(sourceFile).html;
				sourceFiles.splice(i--, 1);
			}
		}

		this.packageJson = packageJson;
		options.readme = readmeHtml;

		return sourceFiles.map((f) => resolve(f, this.resolvePaths));
	}

	scanFiles() {
		const Filter = require('core/filter').Filter;
		const {Scanner} = require('core/scanner');
		const options = this.options;
		const sources = this.buildSourceList();

		// are there any files to scan and parse?
		if (options.source && sources.length) {
			const filter = new Filter(options.source);
			const scanner = new Scanner();

			this.sourceFiles = scanner.scan(sources,
				(options.recurse ? options.recurseDepth : undefined), filter);
		}

		return this;
	}

	resolvePluginPaths(paths) {
		const pluginPaths = [];

		paths.forEach(plugin => {
			const pluginPath = resolve(`${this.dirname}/lib/plugins/${plugin}`, this.resolvePaths);

			if (!pluginPath) {
				console.error('Unable to find the plugin "%s"', plugin);

				return;
			}

			pluginPaths.push(pluginPath);
		});

		return pluginPaths;
	}

	createParser() {
		const handlers = require('core/handlers');
		const Parser = require('core/parser');
		const plugins = require('core/plugins');
		const options = this.options;

		const parser = Parser.createParser(options.parser, this.options);

		if (options.plugins && options.plugins.length) {
			options.plugins = this.resolvePluginPaths(options.plugins);
			plugins.installPlugins(options.plugins, this.parser, options);
		}

		handlers.attachTo(parser);
		return parser;
	}

	parseFiles() {
		const augment = require('core/augment');
		const borrow = require('core/borrow');
		const Package = require('core/package').Package;

		let docs;
		let packageDocs;

		this.docs = docs = this.parser.parse(this.sourceFiles, this.options.encoding);
		// If there is no package.json, just create an empty package
		packageDocs = new Package(this.packageJson);
		packageDocs.files = this.sourceFiles || [];
		docs.push(packageDocs);
		console.debug('Adding inherited symbols, mixins, and interface implementations...');
		augment.augmentAll(docs);
		console.debug('Adding borrowed doclets...');
		borrow.resolveBorrows(docs);
		console.debug('Post-processing complete.');

		this.parser.fireProcessingComplete(docs);

		return this;
	}

	resolveTutorials() {
		const resolver = require('tutorial/resolver');

		if (this.options.tutorials) {
			resolver.load(this.options.tutorials, this.resolvePaths);
			resolver.resolve();
		}

		return this;
	}

	generateDocs() {
		this.resolveTutorials();
		const resolver = require('tutorial/resolver');
		const taffy = require('taffydb').taffy;
		const options = this.options;
		let template;

		const publish = `templates/${options.template || 'default'}`;
		const templatePath = resolve(publish, this.resolvePaths);

		try {
			template = require(`${templatePath}/publish`);
		} catch (e) {
			logger.fatal(`Unable to load template: ${e.message}` || e);
		}

		// templates should include a publish.js file that exports a "publish" function
		if (template.publish && typeof template.publish === 'function') {
			let publishPromise;

			console.info('Generating output files...');
			publishPromise = template.publish(
				taffy(this.docs),
				options,
				resolver.root
			);

			return Promise.resolve(publishPromise);
		} else {
			console.fatal(`${options.template} does not export a "publish" function. Global "publish" functions are no longer supported.`);
		}

		return Promise.resolve();
	}
};
