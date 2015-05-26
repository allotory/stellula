/*
 * stellula.js
 * Copyright (c) 2015 Ellery
 * stellula.js is open sourced under the MIT license.
 */

/*
 * 定义默认的提示消息及正则表达式
 */
 var defaults = {
	 msg: {
		required: "该'%s'字段不能为空.",
		numeric: "该'%s'字段只能包含数字.",
		min_length: "该'%s'字段必须至少'%n'个字符.",
		max_length: "该'%s'字段必须最多'%n'个字符.",
		integer: "该'%s'字段只能包含一个整数.",
		decimal: "该'%s'字段只能包含一个小数.",
		email: "该'%s'字段必须是一个合法的Email地址.",
		alpha: "该'%s'字段必须只能包含字母符号.",
		alpha_numeric: "该'%s'字段只能包含字母数字字符.",
		alpha_dash: "该'%s'字段只能包含字母数字字符，下划线以及破折号.",
		natural: "该'%s'字段只能是0或一个正整数.",
		natural_no_zero: "该'%s'字段只能是一个正整数.",
		ip: "该'%s'字段必须是一个合法的IP地址.",
		base64: "该'%s'字段必须是一个Base64编码的字符串.",
		numeric_dash: "该'%s'字段只能包含数字及破折号.",
		url: "该'%s'字段必须是一个合法的URL地址."
	},
	regex : {
		ruleRegex : /^(.+?)\[(.+)\]$/,
		numericRegex : /^[0-9]+$/,
		integerRegex : /^\-?[0-9]+$/,
		decimalRegex : /^\-?[0-9]*\.?[0-9]+$/,
		emailRegex : /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
		alphaRegex : /^[a-z]+$/i,
		alphaNumericRegex : /^[a-z0-9]+$/i,
		alphaDashRegex : /^[a-z0-9_\-]+$/i,
		naturalRegex : /^[0-9]+$/i,
		naturalNoZeroRegex : /^[1-9][0-9]*$/i,
		ipRegex : /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
		base64Regex : /[^a-zA-Z0-9\/\+=]/i,
		numericDashRegex : /^[\d\-\s]+$/,
		urlRegex : /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/
	}
 };

/*
 * 自定义规则函数及提示消息
 */
 var customs = {
	handlers : {},
	messages : {}
 };

/*
 * 描述对字段校验类
 * @param - fieldId - 要校验的字段的ID
 * @param - validators - 校验器对象数组
 * @param - success - 当校验成功的时候执行的事件,包括消息及样式显示
 * @param - failure - 当校验失败的时候执行的事件,包括消息及样式显示
 * @param - checked - 当前字段是否通过校验
 */
function Field(params) {
	this.fieldId = params.id;
	this.validators = params.rule;
	this.success = params.success;
	this.failure = params.errors;
	this.checked = false;
}

/*
 * 扩展Field，加入校验方法，循环校验器对象数组进行校验
 */
Field.prototype.validate = function(){
	//循环每一个校验器
	for(item in this.validators){	
		//将校验规则转换为校验器对象
		//获取到规则及其参数
		var parts = defaults.regex.ruleRegex.exec(this.validators[item]);
		var method = this.validators[item];
		var param = null;
		//如果规则带参数则将其分割
		if (parts) {
			method = parts[1];
			param = parts[2];
		}
		//如果规则带'!'则截取去掉
		if (method.charAt(0) === '!') {
			method = method.substring(1, method.length);
		}

		//判断规则是自带默认规格还是自定义规则
		if(typeof this.hooks[method] === 'function') {		//默认规则
			if(!this.hooks[method].apply(this, [this, this.fieldId, param])) {
				break;
			}
		}else if (method.substring(0, 7) === 'custom_') {	//自定义规则
			method = method.substring(7, method.length);
			if (typeof customs.handlers[method] === 'function') {
				if(!customs.handlers[method].apply(this, [this, this.fieldId, param])) {
					break;
				}
				
			}
		}else {
			alert("system error!");
		}
	}
}

/*
 * 默认校验方法
 * @param - fieldId - field字段id
 */
Field.prototype.hooks = {
	min_length: function(self, fieldId, length) {
		//处理替换提示消息内容
		var fieldName = self.name(fieldId);
		var message = defaults.msg.min_length.replace("%s", fieldName).replace("%n", length);
		//获取需要校验字段值
		var fieldValue = self.data(fieldId);
		if((fieldValue.length < length)){
			self.onFail(message);		//字段设置为校验失败
			return false;
		}
		self.onSucc(message);			//将字段设置为校验成功
		return true;
	},
	max_length: function(self, fieldId, length) {
		//处理替换提示消息内容
		var fieldName = self.name(fieldId);
		var message = defaults.msg.max_length.replace("%s", fieldName).replace("%n", length);
		//获取需要校验字段值
		var fieldValue = self.data(fieldId);
		if((fieldValue.length > length)){
			self.onFail(message);		//字段设置为校验失败
			return false;
		}
		self.onSucc(message);			//将字段设置为校验成功
		return true;
	},
	required : function(self, fieldId) {	//字段不能为空校验器
		var fieldName = self.name(fieldId);
		var message = defaults.msg.required.replace("%s", fieldName);
		//获取需要校验字段值
		var fieldValue = self.data(fieldId);
		if(!fieldValue || fieldValue === "" || fieldValue === undefined || fieldValue === null) {
			self.onFail(message);			//字段设置为校验失败
			return false;
		}
		self.onSucc(message);				//将字段设置为校验成功
		return true;

	},
	numeric: function(self, fieldId) {			//只能包含数字校验器
		return self.regExp(fieldId, defaults.msg.numeric, defaults.regex.numericRegex);
	},
	integer : function(self, fieldId) {			//整数校验器
		return self.regExp(fieldId, defaults.msg.integer, defaults.regex.integerRegex);
	},
	decimal : function(self, fieldId) {			//小数校验器
		return self.regExp(fieldId, defaults.msg.decimal, defaults.regex.decimalRegex);
	},
	email : function(self, fieldId) {			//邮件地址校验器
		return self.regExp(fieldId, defaults.msg.email, defaults.regex.emailRegex);
	},
	alpha : function(self, fieldId) {			//只能包含字母校验器
		return self.regExp(fieldId, defaults.msg.alpha, defaults.regex.alphaRegex);
	},
	alpha_numeric : function(self, fieldId) {	//只能包含字母数字校验器
		return self.regExp(fieldId, defaults.msg.alpha_numeric, defaults.regex.alphaNumericRegex);
	},
	alpha_dash : function(self, fieldId) {		//字母数字、下划线及破折号校验器
		return self.regExp(fieldId, defaults.msg.alpha_dash, defaults.regex.alphaDashRegex);
	},
	natural : function(self, fieldId) {			//0或正整数校验器
		return self.regExp(fieldId, defaults.msg.natural, defaults.regex.naturalRegex);
	},
	natural_no_zero : function(self, fieldId) {	//正整数校验器
		return self.regExp(fieldId, defaults.msg.natural_no_zero, defaults.regex.naturalNoZeroRegex);
	},
	ip : function(self, fieldId) {				//IP地址校验器
		return self.regExp(fieldId, defaults.msg.ip, defaults.regex.ipRegex);
	},
	base64 : function(self, fieldId) {			//Base64编码校验器
		return self.regExp(fieldId, defaults.msg.base64, defaults.regex.base64Regex);
	},
	numeric_dash : function(self, fieldId) {	//数字及破折号校验器
		return self.regExp(fieldId, defaults.msg.numeric_dash, defaults.regex.numericDashRegex);
	},
	url : function(self, fieldId) {				//URL地址校验器
		return self.regExp(fieldId, defaults.msg.url, defaults.regex.urlRegex);
	}
}

/*
 * 校验器正则表达式校验方法
 * @param - validator - field字段类中校验器数组的一个元素，即一个校验器
 */
Field.prototype.regExp = function(fieldId, tip, regex) {
	var self = this;
	var fieldName = self.name(fieldId);
	var message = tip.replace("%s", fieldName);
	//获取需要校验字段值
	var fieldValue = self.data(fieldId);
	//字段为空时直接判断校验失败
	if(!fieldValue || fieldValue === "" || fieldValue === undefined || fieldValue === null) {
		self.onFail(message);		//字段设置为校验失败
		return false;
	}
	//进行正则表达式校验
	if(regex.test(fieldValue)){
		self.onSucc(message);		//将字段设置为校验成功
		return true;
	}else{
		self.onFail(message);		//字段设置为校验失败
		return false;
	}
}

/*
 * 字段校验成功时调用
 * @param - tip - 字段校验提示信息
 */
Field.prototype.onSucc = function(tip) {
	var self = this;				//换一个名字来存储this，不然函数的闭包中会覆盖这个名字
	self.checked = true;			//将字段设置为校验成功        
	self.success(tip);
}

/*
 * 字段校验失败时调用
 * @param - tip - 字段校验提示信息
 */
Field.prototype.onFail = function(tip) {
	var self = this;				//换一个名字来存储this，不然函数的闭包中会覆盖这个名字
	self.checked = false;			//将字段设置为校验成功        
	self.failure(tip);
}

/*
 * 获取字段值的方法
 * @param - fieldId - 当前校验字段id
 */
Field.prototype.data = function(fieldId) {
	return document.getElementById(fieldId).value;
}

/*
 * 获取字段name值
 * @param - fieldId - 当前校验字段id
 */
Field.prototype.name = function(fieldId) {
	return document.getElementById(fieldId).name;
}

/*
 * 远程校验器
 * @param - url - 远程服务器地址
 * @param - tip - 校验完成时的提示消息
 */
function Remote_val(url,tip){
	this.p_url=url;
	this.tips=tip;
	this.on_suc=null;
	this.on_error=null;
}

/*
 * 扩展远程校验器，增加校验方法
 * @param - fd - 需要校验字段的值
 * @returns - {bool} - 校验失败，return false，否则返回true
 */
Remote_val.prototype.verify=function(fd){
	var self=this;
	$.post(this.p_url,{f:fd},
		function(data){
			if(data.rs){
				self.on_suc();
				return;
			}else{
				self.on_error();
			}
		},"json"
	);
	return false;
}

/*
 * 表单验证主方法入口,此时失去焦点即开始校验
 * @param - items - field对象数组
 */
function FormValidator(items){
	this.fieldItem = items;								//把字段校验对象数组复制给属性
	for(i=0; i<this.fieldItem.length; i++) {			//循环数组
		var fc = this.getCheck(this.fieldItem[i]);		//获取封装后的回调事件
		$("#" + this.fieldItem[i].fieldId).blur(fc);	//绑定到控件上
	}
}

/*
 * 绑定校验事件的处理器，为了避开循环对闭包的影响
 * @param - field - field对象
 */
FormValidator.prototype.getCheck = function(field) {
	return function(){		//返回包装了调用validate方法的事件
		field.validate();
	}
}

/*
 * 为自定义规则注册一个回调函数
 * @param - name - 自定义函数规则名称
 * @param - handler - 自定义函数
 */
FormValidator.prototype.registerCallback = function(name, handler) {
	if (name && typeof name === 'string' && handler && typeof handler === 'function') {
		customs.handlers[name] = handler;
	}

	return this;
};

/*
 * 为自定义规则提示消息
 * @param - name - 自定义函数规则名称
 * @param - handler - 自定义函数
 */
FormValidator.prototype.setMessage = function(rule, message) {
	customs.messages[rule] = message;
	return this;
};

/*
 * 绑定提交按钮的onclick事件
 * @param - bid - 提交按钮id
 * @param - bind - 提交时执行的方法
 */
FormValidator.prototype.setSubmit = function(bid,bind) {
	var self = this;
	$("#"+bid).click(
		function() {
			if(self.check()) {
				bind();
			}
		}
	);
}

/*
 * 提交时进行校验
 */
FormValidator.prototype.check = function() {
	var temp = 0;							//临时变量记录是否有字段校验失败
	for(idx in this.fieldItem) {			//循环每一个校验器
		this.fieldItem[idx].validate();		//再检测一遍
		if(!this.fieldItem[idx].checked) {   
			temp ++;						//如果错误则字段记录加一，阻止提交
		}
	}
	if(temp > 0) {							//有至少一个字段校验失败
		return false;
	}
	return true;							//一个都没错就返回成功执行提交
}