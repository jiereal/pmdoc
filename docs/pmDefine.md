### @pmDefine

* `@pmDefine collection`

	定义一个[collection](https://learning.getpostman.com/docs/postman/collections/intro_to_collections/)

	```
	/**
	 * @pmDefine collection - collectionName
	 * @property {string} description - collectionDescription
	 * @property {string} schema - https://schema.getpostman.com/json/collection/v2.1.0/collection.json
	 */
	```
* `@pmDefine item`

	定义一个[API请求](https://learning.getpostman.com/docs/postman/sending_api_requests/requests/)
	
	```
	/**
	 * 定义一个Api
	 * @pmDefine item - B
	 * @property {string} description - 定义一个Api
	 * @pmUrl {{hostname}}/p/a/t/h
	 * @pmMethod POST
	 * @pmHeaders
	 *    Content-Type = application/x-www-form-urlencoded
	 * @pmBody formdata
	 *    username = username
	 *    password = password
	 * @pmPreRequest
	 *     pm.variables.set('hostname', 'http://www.baidu.com')
	 * @pmTest
	 *     const response = pm.response.json();
	 *     pm.test('返回一个tk' , () => {
	 *	       pm.expect(response.obj.tk).to.be.a('string')
	 *     })
	 *     pm.environment.set('var1', 'var1');
	 * @pmBefore A // 在A之后执行
	 * @pmItemOf collectionName // 是collectionName的子元素，添加到item属性之中
	 */
	```
* `@pmDefine folder`

	定义一个子级文件夹
	```
	/**
	 * 定义一个子级文件夹
	 * @pmDefine folder - folderName
	 * @property {string} description - folderDescription
	 * @pmPreRequest
	 *     pm.variables.set('hostname', 'http://www.baidu.com')
	 * @pmTest
	 *     const response = pm.response.json();
	 *     pm.test('返回一个tk' , () => {
	 *	       pm.expect(response.obj.tk).to.be.a('string')
	 *     })
	 *     pm.environment.set('var1', 'var1');
	 * @pmItemOf collectionName // 是collectionName的子元素，添加到item属性之中
	 */
	```
* `@pmDefine event`

	定义一个`prerequest`或者`test`脚本 [文档](https://learning.getpostman.com/docs/postman/scripts/intro_to_scripts)
	
	```
	/**
	 * 定义test脚本
	 * @pmDefine event - testEvent
	 * @property {string} listen - test
	 * @property {string} script
	 *    pm.test('status 200', () => {
	 *      pm.response.to.have.status(200);
	 * 	  })
	 * @pmItemOf fslinker_web_console
	 */
	```
	```
	/**
	 * 定义prerequest脚本
	 * @pmDefine event - testEvent
	 * @property {string} listen - prerequest
	 * @property {string} script
	 *    pm.variables.set('vars', 1)
	 * @pmItemOf fslinker_web_console
	 */
	```

* `@pmDefine variable`

	定义一个变量
	```
	/**
	 * 定义变量
	 * @pmDefine variable - test = 1
	 * @pmItemOf fslinker_web_console
	 */
	```

