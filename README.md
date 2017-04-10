# amazeui-validator

> amazeui表单验证组件单独提取（依赖于jQuery）

## 前言

之所以要做amazeui中表单插件的提取移植，主要是因为新开项目前端技术选型时由于兼容性，框架大小，设计风格等一系列因素放弃了amazeui框架。而在后期进行项目开发过程中对于表单验证方面找不到更好的替代方案（主要是习惯问题），所以决定提取amazeui中的表单验证插件，加以改进，作为项目中的全局表单验证方案。

## 改进之处

1. amazeui中表单验证对于没有name的checkbox和radio挂载的minchecked属性是不做验证的，在此修复。
2. amazeui中表单验证对于参数alwaysRevalidate默认为false且没有相关介绍，导致某些验证通过后再次修改依然能够通过，例如：确认密码输入框验证通过后再去修改原密码框，此时点击提交验证是通过的，将alwaysRevalidate设置为true可在每次点击提交按钮时都重新进行全部验证，用或不用取决于项目。

## [Demo page](https://jinming6568.github.io/amazeui-validator/)

## 文档

## [原版插件介绍页面](http://amazeui.org/javascript/validator)

## 插件参数

| Name         | Type          | Default         | Description |
| ------------ | ------------- | --------------- | ----------- |
| debug        | Boolean       |  false          | 是否开启调试模式，开启后每次验证均会在控制台输出相关验证信息 |
| H5validation | Boolean       |  false          | 是否开启H5验证模式，默认为false  |
| activeClass  | String        | 'field-active'  | 当前选择域class |
| inValidClass | String        | 'field-invalid' | 验证未通过的域class |
| validClass   | String        | 'field-valid'   | 验证通过的域的class |
| activeParentClass   | String        | 'form-group-active'   | 当前选择域最近的'.form-group'的class |
| inValidParentClass   | String        | 'form-group-invalid'   | 验证未通过的域最近的'.form-group'的class |
| validParentClass   | String        | 'form-group-valid'   | 验证通过的域最近的'.form-group'的class |
| validateOnSubmit   | Boolean        | true   | 提交时是否验证 |
| alwaysRevalidate   | Boolean        | false   | 每次提交时是否都全部重新验证 |

## 表单域支持的验证方式

例如`<input type="text" required minlength="6" />`表示必须填写，且最少6个字符

* type 内置支持email,url,number三种类型验证
* required 必须填写项
* pattern 正则验证公式
* min 最小值
* max 最大值
* minlength 最小长度
* maxlength 最大长度

更多案例可以去amazeui官方项目中寻找

