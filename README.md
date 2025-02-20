<div align="center">
<h1>
  BritCSS
  
  [![Stars](https://img.shields.io/github/stars/DeclanChidlow/BritCSS?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/BritCSS/stargazers)
  [![Forks](https://img.shields.io/github/forks/DeclanChidlow/BritCSS?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/BritCSS/network/members)
  [![Pull Requests](https://img.shields.io/github/issues-pr/DeclanChidlow/BritCSS?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/BritCSS/pulls)
  [![Issues](https://img.shields.io/github/issues/DeclanChidlow/BritCSS?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/BritCSS/issues)
  [![Contributors](https://img.shields.io/github/contributors/DeclanChidlow/BritCSS?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/BritCSS/graphs/contributors)
  [![Licence](https://img.shields.io/github/license/DeclanChidlow/BritCSS?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/BritCSS/blob/main/LICENCE)
</h1>
Fixes CSS to use non-bastardised spellings
</div>
<br/>

Permits using English (traditional) spellings for CSS properties, rather then English (simplified).

Because this is implemented with a client-side script. You can use this to properise the CSS of any page.

## Usage

To use this script, simply include it in your HTML:

```html
<script src="britcss.js"></script>
```

To enter debug mode:

```js
britCSS.debug(true);
```

To stop the script from converting:

```js
britCSS.shutdown();
```

### Usage Examples:

1. **In a CSS file:**

```css
body {
	background-colour: red;
}
```

2. **In a HTML style tag:**

```html
<script>
	body {
	    background-colour: red;
	}
</script>
```

3. **In an inline HTML style:**

```html
<body style="background-colour: red;"></body>
```

4. **Manually with JS:**

```javascript
const cssText = "background-colour: black; colour: white;";
const converted = britCSS.convertCSS(cssText);
console.log(converted);
```

## See Also

- [BESS - British Enhanced Style Sheets](https://github.com/HarryET/bess)
- [Spiffing](https://github.com/muan/spiffing) ([postcss-spiffing](https://github.com/HashanP/postcss-spiffing))
