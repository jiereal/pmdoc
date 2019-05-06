const Schema = require('postman/schema');
const DocKeys = Schema.DocKeys;
const deepmerge = require('deepmerge');
const {combine} = require('core/doclet');

/**
 * 转换器
 * jsdoc.json -> postman-collections.json
 * @module Converters.postman
 **/

/**
 * 删除节点data属性，并把data的内容merge到父节点
 */
function removeDataAttr(obj) {
	if (obj instanceof Array) {
		obj.forEach((o) => removeDataAttr(o));
	}
	if (obj.hasOwnProperty('pmData')) {
		const data = obj.pmData;
		delete obj.pmData;
		Object.assign(obj, deepmerge(obj, data));
	}
	Object.keys(obj).forEach((key) => {
		if (obj[key] && typeof obj[key] === 'object') {
			removeDataAttr(obj[key]);
		}
	});
}

function resortItems(collection) {
	if (collection && collection.item && collection.item.length) {
		const item = collection.item.sort((a, b) => {
			if (a.pmBefore && a.pmBefore.length) return 1;
			if (b.pmBefore && b.pmBefore.length) return -1;
			return 0;
		});
		// 选择排序, 先找最小依赖的item
		const len = item.length;
		for (let i = 0; i < len; i++) {
			if (item[i].item) {
				resortItems(item[i]);
			}
			if (!item[i].pmBefore || item[i].pmBefore.length === 0) {
				continue;
			}

			let temp;
			for (let j = i; j < len; j++) {
				const pmBefore = [...(item[j].pmBefore || [])];
				for (let k = 0; k < i; k++) {
					const index = pmBefore.indexOf(item[k].name);
					if (index !== -1) {
						pmBefore.splice(index, 1);
					}
				}

				if (pmBefore.length === 0) {
					temp = item[i];
					item[i] = item[j];
					item[j] = temp;
				}
			}
		}
		collection.item = item;
	}
}

const isclone = ({kind}) => kind === 'pmClone';
module.exports = {
	/**
	 * 装载
	 * @param options
	 * @returns {{}}
	 */
	install(options) {
		return {
			exec(doclets, callback) {
				const index = doclets.index;
				const getByName = (name) => {
					return index.documented[name] instanceof Array ? index.documented[name] : (index.documented[name] ? [index.documented[name]] : []);
				};
				doclets.forEach((doclet) => {
					if (doclet.deprecated) return;
					const isClone = isclone(doclet);
					if (isClone) {
						const source = getByName(doclet.pmDef && doclet.pmDef.source).reduce((pri, sec) => combine(pri, sec), {});
						if (source.pmDef) {
							doclet.pmDef = deepmerge(source.pmDef, doclet.pmDef);
						}
					}
					if (doclet.pmDef) {
						const docType = doclet.pmDef.type;
						const itemOf = doclet.pmDef.itemOf;
						const parentNodes = getByName(itemOf);
						parentNodes.forEach(({pmDef: {pmData: parent}}) => {
							if (parent) {
								switch (docType) {
									case DocKeys.CollectionItem:
									case DocKeys.CollectionItemFolder:
										parent.item = parent.item || [];
										parent.item.push(doclet.pmDef);
										break;
									case DocKeys.CollectionEvent:
										parent.event = parent.event || [];
										parent.event.push(doclet.pmDef.pmData);
										break;
									case DocKeys.CollectionRequest:
										parent.request = doclet.pmDef.pmData;
										break;
									case DocKeys.CollectionRequestBody:
										parent.request.body = doclet.pmDef.pmData;
										break;
									case DocKeys.CollectionRequestHeader:
										parent.request.header = parent.request.header || [];
										parent.request.header.push(doclet.pmDef.pmData);
										break;
									case DocKeys.CollectionVariable:
										parent.variable = parent.variable || [];
										parent.variable = parent.variable.concat(doclet.pmDef.pmData);
										break;
									default:
										break;
								}
							}
						});
					}
				});

				const result = [];
				doclets.filter((doclet) => doclet && doclet.pmDef && doclet.pmDef.type === DocKeys.Collection).forEach((collection) => {
					resortItems(collection.pmDef.pmData);
					result.push(collection.pmDef.pmData);
				});

				removeDataAttr(result);

				callback(result);
			}
		};
	}
};
