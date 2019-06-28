const commander = require('commander');
const logger = require('utils/logger');
const process = require('process');
const Jsdoc = require('./index');
const path = require('path');
const fs = require('fs');
const dumper = require('utils/dumper');
const shelljs = require('shelljs');

function list(val) {
	return val.split(',');
}

const plugins = [
	'commentConvert',
	'commentsOnly',
	'escapeHtml',
	'eventDumper',
	'overloadHelper',
	'partial',
	'postman',
	'railsTemplate',
	'shout',
	'sourcetag',
	'summarize',
	'underscore'
];
commander
	.version('0.0.1')
	.option('-p, --plugin <items>', `
        default: [postman]
        plugin supported:
            ${plugins.join('\n')}
    `, (val) => {
		const values = val.split(',');
		const ret = [];
		values.forEach((value) => {
			if (plugins.indexOf(value) === -1) {
				logger.error(`not support plugin: ${value}`);
			} else {
				ret.push(value);
			}
		});
		return ret;
	})
	.option('-f, --files <items>', 'the files you want to parse', list)
	.option('-o, --out [out]', 'out dir')
	.parse(process.argv);

const outDir = commander.out || process.cwd();
const files = commander.files || ['.'];
const plugin = commander.plugin || [];

console.log(process.execPath)
new Jsdoc({
	sourceFiles: files,
	plugins: plugin.concat(['postman']),
	converters: {
		postman(collections) {
			if (collections && collections.length) {
				collections.forEach((collection) => {
					const name = collection.info.name;
					logger.info('write json file:', path.join(outDir, `${name}.json`));
					fs.writeFileSync(path.join(outDir, `${name}.json`), dumper.dump(collection));
					console.log(`./newman run ${name}.json`);
					shelljs.exec(`${path.resolve(__dirname, '../.bin/newman')} run ${name}.json`);
				});
			}
		}
	}
}).runCommand();
