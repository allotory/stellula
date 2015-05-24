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
		numeric: '该字段只能包含数字.',
        required: '该字段不能为空.',
		integer: '该字段必须包含一个整数.',

        matches: 'The %s field does not match the %s field.',
        "default": 'The %s field is still set to default, please change.',
        valid_email: 'The %s field must contain a valid email address.',
        valid_emails: 'The %s field must contain all valid email addresses.',
        min_length: 'The %s field must be at least %s characters in length.',
        max_length: 'The %s field must not exceed %s characters in length.',
        exact_length: 'The %s field must be exactly %s characters in length.',
        greater_than: 'The %s field must contain a number greater than %s.',
        less_than: 'The %s field must contain a number less than %s.',
        alpha: 'The %s field must only contain alphabetical characters.',
        alpha_numeric: 'The %s field must only contain alpha-numeric characters.',
        alpha_dash: 'The %s field must only contain alpha-numeric characters, underscores, and dashes.',
        decimal: 'The %s field must contain a decimal number.',
        is_natural: 'The %s field must contain only positive numbers.',
        is_natural_no_zero: 'The %s field must contain a number greater than zero.',
        valid_ip: 'The %s field must contain a valid IP.',
        valid_base64: 'The %s field must contain a base64 string.',
        valid_credit_card: 'The %s field must contain a valid credit card number.',
        is_file_type: 'The %s field must contain only %s files.',
        valid_url: 'The %s field must contain a valid URL.'
    },
    regex : {
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
 * 描述对字段校验类
 * @param - fieldId - 要校验的字段的ID
 * @param - validators - 校验器对象数组
 * @param - success - 当校验成功的时候执行的事件,包括消息及样式显示
 * @param - failure - 当校验失败的时候执行的事件,包括消息及样式显示
 * @param - checked - 当前字段是否通过校验
 */
function Field(params) {
	this.fieldId = params.fid;
	this.validators = params.val;
	this.success = params.suc;
	this.failure = params.err;
	this.checked = false;
}

/*
 * 扩展Field，加入校验方法，循环校验器对象数组进行校验
 */
Field.prototype.validate = function(){
	//循环每一个校验器
	for(item in this.validators){
		//func = this.validators[item]
		var func;
		switch(this.validators[item]) {
			case "numeric" :
				func = new regExp(defaults.regex.numericRegex, defaults.msg.numeric);
				break;
			case "required" :
				func = new required(defaults.messages.required);
				break;
			case "integer" :
				func = new regExp(defaults.regex.integerRegex, defaults.msg.integer);
				break;
			default :

		}
		//给校验器添加校验成功和校验失败的回调事件
		this.setCallback(func);
		//执行校验器上的verify方法，校验是否符合规则
		if(!func.verify(this.data())){
			//一旦任意一个校验器失败就停止，即同一个字段需要多个校验器时，
			//第一次校验失败就跳出循环，并返回当前此次失败信息
			break; 
		}
	}
}

/*
 * 校验器回调函数的方法
 * @param - validator - field字段类中校验器数组的一个元素，即一个校验器
 */
Field.prototype.setCallback = function(validator) {
	var self = this;					//换一个名字来存储this，不然函数的闭包中会覆盖这个名字
	validator.onSucc = function(){		//校验成功执行的方法
		self.checked = true;			//将字段设置为校验成功        
		self.success(validator.tip);	//执行校验成功的事件
	}
	validator.onFail = function(){		//校验失败的时候执行的方法
		self.checked = false;			//字段设置为校验失败
		self.failure(validator.tip);	//执行校验失败的事件
	}
}

/*
 * 获取字段值的方法
 */
Field.prototype.data = function() {
	return document.getElementById(this.fieldId).value;
}

/*
 * 字段是否为空校验器类
 * @param - tip - 字段校验提示信息
 */
 function required(tip) {
	this.tip = tip;
 }

/*
 * 扩展字段是否为空校验器 
 * @param - fieldValue - 需要校验字段的值
 * @returns - {bool} - 校验失败，return false，否则返回true
 */
required.prototype.verify = function(fieldValue) {
	if(!fieldValue || fieldValue === "" || fieldValue === undefined || fieldValue === null) {
		this.onFail();	//字段为空，校验失败
		return false;
	}
	this.onSucc();		//校验成功
	return true;
}

/*
 * 长度校验的校验器类
 * @param - minLen - 校验字段的最小长度
 * @param - maxLen - 校验字段的最大长度
 * @param - tip - 字段校验完成时的提示信息
 * @param - onSucc - 校验成功
 * @param - onFail - 校验失败
*/
function fieldLength(minLen, maxLen, tip) {
	this.minLen = minLen;
	this.maxLen = maxLen;
	this.tip = tip;
	this.onSucc = null;
	this.onFail = null;
}

/*
 * 扩展长度校验器，增加校验方法
 * @param - fieldValue - 需要校验字段的值
 * @returns - {bool} - 校验失败，return false，否则返回true
 */
fieldLength.prototype.verify = function(fieldValue) {
	if((fieldValue.length < this.minLen) || (fieldValue.length > this.maxLen)){
		this.onFail();	//长度不足或超出范围，校验失败
		return false;
	}
	this.onSucc();		//校验成功
	return true;
}

/*
 * 正则表达式校验器
 * @param - expression - 校验使用的正则表达式
 * @param - tip - 校验完成时的提示消息
 */
function regExp(expression, tip) {
	this.expression = expression;
	this.tip = tip;
	this.onSucc = null;
	this.onFail = null;
}

/*
 * 扩展正则表达式校验器，增加校验方法
 * @param - fieldValue - 需要校验字段的值
 * @returns - {bool} - 校验失败，return false，否则返回true
 */
regExp.prototype.verify = function(fieldValue) {
	if(!fieldValue || fieldValue === "" || fieldValue === undefined || fieldValue === null) {
		this.onFail();	//字段为空，校验失败
		return false;
	}
	if(this.expression.test(fieldValue)){
		this.onSucc();	//正则表达式校验成功
		return true;
	}else{
		this.onFail();	//正则表达式校验失败
		return false;
	}
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
 * 自定义函数校验器
 * @param - tip - 校验完成时的提示消息
 * @param - func - 自定义的校验器
*/
function Man_val(tip,func){
	this.tips=tip;
	this.val_func=func;
	this.on_suc=null;
	this.on_error=null;
}

/*
 * 扩展自定义校验器，增加校验方法
 * @param - fd - 需要校验字段的值
 * @returns - {bool} - 校验失败，return false，否则返回true
 */
Man_val.prototype.verify=function(fd){
	if(this.val_func(fd)){
		this.on_suc();
	}else{
		this.on_error();
	}
}

/*
 * 表单验证主方法入口,此时失去焦点即开始校验
 * @param - items - field对象数组
 */
function FormValidator(items){
	this.fieldItem = items;								//把字段校验对象数组复制给属性
	for(i=0; i<this.fieldItem.length; i++) {			//循环数组
		//alert(this.f_item[idx].on_suc);
		var fc = this.getCheck(this.fieldItem[i]);		//获取封装后的回调事件
		$("#" + this.fieldItem[i].fieldId).blur(fc);	//绑定到控件上
		//alert(fc);
		//document.getElementById(this.f_item[idx].field_id).blur(fc);
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
 * 绑定提交按钮的onclick事件
 * @param - bid - 提交按钮id
 * @param - bind - 提交时执行的方法
 */
FormValidator.prototype.set_submit = function(bid,bind) {
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
	for(idx in this.fieldItem) {			//循环每一个校验器
		this.fieldItem[idx].validate();		//再检测一遍
		if(!this.fieldItem[idx].checked) {   
			return false;					//如果错误就返回失败，阻止提交
		}
	}
	return true;							//一个都没错就返回成功执行提交
}