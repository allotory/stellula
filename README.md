# Stellula JS Validator

## What is Stellula JS Validator?

This is a javascript form validation library named "Stellula".

## Features

* Validate form fields from over a dozen rules.
* No dependencies(jquery.js not necessary, can remove it easily).
* Customizable Messages and message style.

## How to use
* Include the JavaScript file in your source.

		<script type="text/javascript" src="stellula.js"></script>
* Create the validation object with your desired rules. This needs to be in a `script` tag located just before your closing `body` tag.

		<script type="text/javascript">
			var form;			
			$(
			function(){
				var uf = new FormValidator(
					[new Field({
						id:"requiredId",					//待校验字段id
						rule:["required"],					//校验规则数组
						success:function(text){				//校验成功时执行的方法
							$('#requiredTip').text('字段格式正确.');
							$('#requiredTip').attr('class','suc');
						},
						errors:function(text){				//校验失败时执行的方法
							$('#requiredTip').text(text);
							$('#requiredTip').attr('class','error');
						}
					})
				]);
				uf.setSubmit(
					"submit",
					function(form){
						//在该方法中进行提交
						alert("表单已经提交了～");
					}
				);
			}
			);
		</script>

* Create HTML elements.

		<input type="text" id="requiredId" name="requiredfield"/>
		<span id="requiredTip"></span>
		<input type="button" id="submit" value="提交"/>
* **FormValidator** - The FormValidator object is attached to the window upon loading stellula.js, the parameter is a Field array.
* **Field** - Field array must contain objects containing these properties:
	* id - The id attribute of element.
	* rule - An array of one or more rules.
	* success - Show the success message when the field validate success.
	* errors - Show the failure message when the field validate failure.
* Custom Validation Rules

	Stellula.js supports the ability for you to include your own validation rules. This will allow you to extend stellula.js to suit your needs.

	First, you need to add another rule to the field. It must always be prefaced with "custom_".

		new Field({
			id:"customId",
			rule:["custom_check_field[hello]"],
			success:function(text){
				$('#customTip').text('字段格式正确.');
				$('#customTip').attr('class','suc');
			},
			errors:function(text){
				$('#customTip').text(text);
				$('#customTip').attr('class','error');
			}
		})
	Then you must call registerCallback function on your instance of the FormValidator with the name of your custom rule and a function taking one parameter. This function will be called with two argument(`self` and `fieldId`) at least. if your custom rule has a parameter, you must add another argument to this function.

		var tip = "该字段必须为'hello'.";		//校验完成时提示信息
		uf.registerCallback('check_field', function(self, fieldId, value) {
			var fieldValue = self.data(fieldId);
			if(fieldValue != value){
				self.onFail(tip);			//字段设置为校验失败
				return false;
			}
			self.onSucc(tip);				//将字段设置为校验成功
			return true;
		}).setMessage("check_field", tip);	//设置提示信息
	If validate success, need to call the function `onSucc(tip)` and return true.

		self.onSucc(tip);
		return true;
	else if validate failure, also need to call the function `onFail(tip)` and return false.

		self.onFail(tip);
		return false;
* Remote Validate

	Stellula.js can validate field from remote server, and you need an url and a remote validate file such as Serlet. 

	first, you need to create a `Field` Object.This rule include two parameters `url` and `message`.
	
		new Field({
			id:"remoteId",
			rule:["remote[ValidateServlet,远程校验失败.]"],
			success:function(text){
				$('#remoteTip').text('字段格式正确.');
				$('#remoteTip').attr('class','suc');
			},
			errors:function(text){
				$('#remoteTip').text(text);
				$('#remoteTip').attr('class','error');
			}
		})

	then, you must create a remote validate file,like this serlet file.

		protected void doGet(HttpServletRequest request,
				HttpServletResponse response) throws ServletException, IOException {
			try {
				request.setCharacterEncoding("utf-8");
				response.setContentType("text/html; charset=utf-8");
				PrintWriter out = response.getWriter();
				String value = request.getParameter("fieldValue");
				System.out.println(value);
				if (value.equals("aaa")) {
					System.out.println(true);
					// 校验成功
					out.print("true");
				} else {
					System.out.println(false);
					out.print("false");
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

	in serlet file must call `out.print()` function, return a string `true` or `false`.

* Available Rules

	<table>
		<tr>
			<th>Rule</th>
			<th>Description</th>
			<th>Parameter</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>required</td>
			<td>the field is required.</td>
			<td>no</td>
			<td>required</td>
		</tr>
		<tr>
			<td>numeric</td>
			<td>the field must contain only numbers.</td>
			<td>no</td>
			<td>numeric</td>
		</tr>
		<tr>
			<td>integer</td>
			<td>the field must contain an integer.</td>
			<td>no</td>
			<td>integer</td>
		</tr>
		<tr>
			<td>decimal</td>
			<td>the field must contain a decimal number.</td>
			<td>no</td>
			<td>decimal</td>
		</tr>
		<tr>
			<td>email</td>
			<td>the field must contain a valid email address.</td>
			<td>no</td>
			<td>email</td>
		</tr>
		<tr>
			<td>alpha</td>
			<td>the field must only contain alphabetical characters.</td>
			<td>no</td>
			<td>alpha</td>
		</tr>
		<tr>
			<td>alpha_numeric</td>
			<td>the field must only contain alpha-numeric characters.</td>
			<td>no</td>
			<td>alpha_numeric</td>
		</tr>
		<tr>
			<td>alpha_dash</td>
			<td>the field must only contain alpha-numeric characters, underscores, and dashes.</td>
			<td>no</td>
			<td>alpha_dash</td>
		</tr>
		<tr>
			<td>natural</td>
			<td>the field must contain only positive numbers.</td>
			<td>no</td>
			<td>natural</td>
		</tr>
		<tr>
			<td>natural_no_zero</td>
			<td>the field must contain a number greater than zero.</td>
			<td>no</td>
			<td>natural_no_zero</td>
		</tr>
		<tr>
			<td>ip</td>
			<td>the field must contain a valid IP.</td>
			<td>no</td>
			<td>ip</td>
		</tr>
		<tr>
			<td>url</td>
			<td>the field must contain a valid URL.</td>
			<td>no</td>
			<td>url</td>
		</tr>
		<tr>
			<td>min_length</td>
			<td>the field must be at least n characters in length.</td>
			<td>yes</td>
			<td>min_length[6]</td>
		</tr>
		<tr>
			<td>max_length</td>
			<td>the field must not exceed n characters in length.</td>
			<td>yes</td>
			<td>max_length[15]</td>
		</tr>
	</table>

## Contributing

Pull requests are being accepted! If you would like to contribute, simply fork
the project and make your changes.

##Support:

Support now is given by me.

## License

The GPL License.
