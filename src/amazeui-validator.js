;(function($, window, document, undefined){
	var FormValid = function($element,options){
		var defaultOpts = {
			debug: false,
			H5validation: false,
			H5inputType: ['email', 'url', 'number'],
			patterns :{
				email: /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/,
				url: /^(http[s]?|ftp):\/\/[^\/\.]+?\..+\w$/i,
				number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/
			},
			activeClass: 'field-active',
			inValidClass: 'field-invalid',
			validClass: 'field-valid',
			activeParentClass: 'form-group-active',
			inValidParentClass: 'form-group-invalid',
			validParentClass: 'form-group-valid',
			validateOnSubmit:true,
			alwaysRevalidate: false,
			allFields: ':input:not(:submit,:button,:disabled)',
			ignore: ':hidden:not(.sync)',
			customEvents: 'validate',
			// Keyboard events
			keyboardFields: ':input:not(:submit, :button, :disabled ,[type="radio"],[type="checkbox"], .novalidate)',
			keyboardEvents: 'focusout, change', // keyup, focusin
			// Mouse events
			pointerFields: 'input[type="range"]:not(:disabled, .novalidate), ' +
			'input[type="radio"]:not(:disabled, .novalidate), ' +
			'input[type="checkbox"]:not(:disabled, .novalidate), ' +
			'select:not(:disabled, .novalidate), ' +
			'option:not(:disabled, .novalidate)',
			pointerEvents: 'click',
			onValid: function(validity) {
			},
			onInValid: function(validity) {
			},
			markValid: function(validity) {
				// this is Validator instance
				var options = this.options;
				var $field = $(validity.field);
				var $parent = $field.closest('.form-group');
				$field.addClass(options.validClass).removeClass(options.inValidClass);
				$parent.addClass(options.validParentClass).removeClass(options.inValidParentClass);
				options.onValid.call(this, validity);
			},
			markInValid: function(validity) {
				var options = this.options;
				var $field = $(validity.field);
				var $parent = $field.closest('.form-group');
				$field.addClass(options.inValidClass).removeClass(options.validClass);
				$parent.addClass(options.inValidParentClass).removeClass(options.validParentClass);
				options.onInValid.call(this, validity);
			},
			validate: function(validity) {
				// return validity;
			},
			submit:null
		};
		this.options = $.extend({},defaultOpts,options);
		this.$element = $element;
		this.init();
	};
	//初始化
	FormValid.prototype.init = function() {
		var _this = this;
		var $element = _this.$element;
		var options = _this.options;
		if (options.H5validation) {
			return false;
		}
		// disable HTML5 form validation
		$element.attr('novalidate', 'novalidate');
		$element.addClass('validator');
		//给H5标签input添加pattern便于逻辑统一
		function regexToPattern(regex) {
			var pattern = regex.toString();
			return pattern.substring(1, pattern.length - 1);
		}
		$.each(options.H5inputType, function(i, type) {
			var h5input = $element.find('input[type=' + type + ']');
			if (!h5input.attr('pattern')) {
				h5input.attr('pattern', regexToPattern(options.patterns[type]));
			}
		});
		//绑定注册事件
		$element.on('submit', function(e) {
			//自定义注册事件
			if (typeof options.submit === 'function') {
				return options.submit.call(_this, e);
			}
			if (options.validateOnSubmit) {
				var formValidity = _this.isFormValid();
				if ($.type(formValidity) === 'boolean') {
					return formValidity;
				}
				if ($element.data('checked')) {
					return true;
				} else {
					$.when(formValidity).then(function() {
						$element.data('checked', true).submit();
					}, function() {
						$element.data('checked', false).find('.' + options.inValidClass).eq(0).focus();
					});
					return false;
				}
			}
		});
		function bindEvents(fields, eventFlags) {
			var events = eventFlags.split(',');
			$.each(events, function(i, event) {
				$element.on(event,fields,function () {
					_this.validate(this);
				});
			});
		}
		//自定义事件
		bindEvents(':input', options.customEvents);
		//input change键盘事件
		bindEvents(options.keyboardFields, options.keyboardEvents);
		//click鼠标点击事件
		bindEvents(options.pointerFields, options.pointerEvents);
	};
	//单项验证是否通过
	FormValid.prototype.isValid = function(field) {
		var $field = $(field);
		var options = this.options;
		// 验证未验证过的域，开启alwaysRevalidate后会一直重新验证
		if ($field.data('validity') === undefined || options.alwaysRevalidate) {
			this.validate(field);
		}
		return $field.data('validity') && $field.data('validity').valid;
	};
	//单项具体验证
	FormValid.prototype.validate = function(field) {
		var _this = this;
		var $element = _this.$element;
		var options = _this.options;
		var $field = $(field);
		//确认密码，注意是选择器名称
		var equalTo = $field.data('equalTo');
		if (equalTo) {
			$field.attr('pattern', '^' + $element.find(equalTo).val() + '$');
		}
		var pattern = $field.attr('pattern') || false;
		var re = new RegExp(pattern);
		var $radioGroup = null;
		var $checkboxGroup = null;
		var value = '';
		if ($field.is('[type=checkbox]')) {
			if(!field.name){
				value = $(field).prop('checked')?1:0;
			}else{
				value = ($checkboxGroup = $element.find('input[name="' + field.name + '"]')).filter(':checked').length;
			}
		}else if($field.is('[type=radio]')){
			if(!field.name){
				value = $(field).prop('checked')?1:0;
			}else{
				value = ($radioGroup = $element.find('input[name="' + field.name + '"]')).filter(':checked').length;
			}
		}else{
			value = $field.val();
		}
		$field = ($checkboxGroup && $checkboxGroup.length)?$checkboxGroup.first() : $field;
		var required = ($field.attr('required') !== undefined) && ($field.attr('required') !== 'false');
		var maxLength = parseInt($field.attr('maxlength'), 10);
		var minLength = parseInt($field.attr('minlength'), 10);
		var min = Number($field.attr('min'));
		var max = Number($field.attr('max'));
		var validity = this.createValidity({field: $field[0], valid: true});
		// Debug
		if (options.debug && window.console) {
			console.log('Validate: value -> [' + value + ' ] , regex -> [' + re + '], required -> ' + required);
			console.log('Regex test: ' + re.test(value) + ', Pattern: ' + pattern);
		}
		//最大长度
		if (!isNaN(maxLength) && value.length > maxLength) {
			validity.valid = false;
			validity.tooLong = true;
		}
		//最小长度
		if (!isNaN(minLength) && value.length < minLength) {
			validity.valid = false;
			validity.customError = 'tooShort';
		}
		//最小值
		if (!isNaN(min) && Number(value) < min) {
			validity.valid = false;
			validity.rangeUnderflow = true;
		}
		//最大值
		if (!isNaN(max) && Number(value) > max) {
			validity.valid = false;
			validity.rangeOverflow = true;
		}
		//required
		if (required && !value) {
			validity.valid = false;
			validity.valueMissing = true;
		}else if (($checkboxGroup || $field.is('select[multiple="multiple"]')) &&
			value) {
			value = $checkboxGroup ? value : value.length;
			var minChecked = parseInt($field.attr('minchecked'), 10);
			var maxChecked = parseInt($field.attr('maxchecked'), 10);
			if (!isNaN(minChecked) && value < minChecked) {
				validity.valid = false;
				validity.customError = 'checkedUnderflow';
			}
			if (!isNaN(maxChecked) && value > maxChecked) {
				validity.valid = false;
				validity.customError = 'checkedOverflow';
			}
		}else if (pattern && !re.test(value) && value) { // check pattern
			validity.valid = false;
			validity.patternMismatch = true;
		}
		var validateComplete = function (validity) {
			this.markField(validity);
			$field.data('validity', validity);
			var $fields = $radioGroup || $checkboxGroup;
			if ($fields) {
				$fields.not($field).data('validity', validity).each(function() {
					validity.field = this;
					_this.markField(validity);
				});
			}
			return validity;
		};
		// Run custom validate
		var customValidate;
		if(typeof options.validate === 'function'){
			customValidate = options.validate.call(_this, validity);
		}
		// Deferred
		if (customValidate) {
			var dfd = new $.Deferred();
			$field.data('dfdValidity', dfd.promise());
			console.log(customValidate);
			return $.when(customValidate).always(function(validity) {
				dfd[validity.valid ? 'resolve' : 'reject'](validity);
				validateComplete.call(_this, validity);
			});
		}
		validateComplete.call(_this, validity);
	};
	//创建单个域的validate
	FormValid.prototype.createValidity = function(validity) {
		return $.extend({
			customError: validity.customError || false,  //自定义错误
			patternMismatch: validity.patternMismatch || false,  //pattern不匹配
			rangeOverflow: validity.rangeOverflow || false, //比最大值高
			rangeUnderflow: validity.rangeUnderflow || false, //比最小值低
			tooLong: validity.tooLong || false,  //length超出
			valueMissing: validity.valueMissing || false,  //缺少必填值
			valid: validity.valid || true  //验证结果
		}, validity);
	};
	//标记验证结果
	FormValid.prototype.markField = function(validity) {
		var options = this.options;
		var flag = 'mark' + (validity.valid ? '' : 'In') + 'Valid';
		if(options[flag]){
			options[flag].call(this, validity);
		}
	};
	//表单整体验证
	FormValid.prototype.validateForm = function() {
		var _this = this;
		var $element = this.$element;
		var options = this.options;
		var $allFields = $element.find(options.allFields).not(options.ignore);
		var radioNames = [];
		var valid = true;
		var formValidity = [];
		var $inValidFields = $([]);
		var promises = [];
		// for async validate
		var async = false;
		var $filteredFields = $allFields.filter(function(index) {
			var name;
			if (this.tagName === 'INPUT' && this.type === 'radio') {
				name = this.name;
				if (radioNames[name] === true) {
					return false;
				}
				radioNames[name] = true;
			}
			return true;
		});
		$filteredFields.each(function() {
			var $this = $(this);
			var fieldValid = _this.isValid(this);
			var fieldValidity = $this.data('validity');
			valid = !!fieldValid && valid;
			formValidity.push(fieldValidity);
			if (!fieldValid) {
				$inValidFields = $inValidFields.add($(this), $element);
			}
			// async validity
			var promise = $this.data('dfdValidity');
			if (promise) {
				promises.push(promise);
				async = true;
			} else {
				var dfd = new $.Deferred();
				promises.push(dfd.promise());
				dfd[fieldValid ? 'resolve' : 'reject'](fieldValidity);
			}
		});
		// NOTE: If there are async validity, the valid may be not exact result.
		var validity = {
			valid: valid,
			$invalidFields: $inValidFields,
			validity: formValidity,
			promises: promises,
			async: async
		};
		return validity;
	};
	FormValid.prototype.isFormValid = function() {
		var _this = this;
		var formValidity = _this.validateForm();
		if (formValidity.async) {
			var masterDfd = new $.Deferred();
			$.when.apply(null, formValidity.promises).then(function() {
				masterDfd.resolve();
			}, function() {
				masterDfd.reject();
			});
			return masterDfd.promise();
		} else {
			if (!formValidity.valid) {
				var $first = formValidity.$invalidFields.first();
				$first.focus();
				return false;
			}
			return true;
		}
	};

	$.fn.formValid = function(options){
		return new FormValid(this,options);//this是jquery对象
	};
})(jQuery, window, document);