/**
 * BritCSS - Use CSS properties with English (traditional) spelling
 *
 * This script allows you to write CSS the proper way. Tea and crumpets not included.
 * @version 1.0.2
 */

(function () {
	let DEBUG = false;
	const VERSION = "1.0.2";

	function log(...args) {
		if (DEBUG) {
			console.log("[BritCSS]", ...args);
		}
	}

	const britishPropsToCss = {
		"colour": "color",
		"background-colour": "background-color",
		"border-colour": "border-color",
		"border-top-colour": "border-top-color",
		"border-right-colour": "border-right-color",
		"border-bottom-colour": "border-bottom-color",
		"border-left-colour": "border-left-color",
		"outline-colour": "outline-color",
		"text-decoration-colour": "text-decoration-color",
		"caret-colour": "caret-color",
		"column-rule-colour": "column-rule-color",
		"accent-colour": "accent-color",
		"scrollbar-colour": "scrollbar-color",
		"colour-scheme": "color-scheme",
		"colour-adjust": "color-adjust",
		"colour-interpolation": "color-interpolation",
		"colour-interpolation-filters": "color-interpolation-filters",
	};

	const britishValuesToCss = {
		capitalise: "capitalize",
		centre: "center",
	};

	const camelCaseMappings = {};
	Object.keys(britishPropsToCss).forEach((key) => {
		if (key.includes("-")) {
			const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
			const camelValue = britishPropsToCss[key].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
			camelCaseMappings[camelKey] = camelValue;
		}
	});

	Object.assign(britishPropsToCss, camelCaseMappings);

	const propertyRegexCache = {};
	const valueRegexCache = {};

	function getPropertyRegex(britishProp) {
		if (!propertyRegexCache[britishProp]) {
			propertyRegexCache[britishProp] = new RegExp(`(^|;|\\s|{)${britishProp}\\s*:`, "g");
		}
		return propertyRegexCache[britishProp];
	}

	function getValueRegex(britishValue) {
		if (!valueRegexCache[britishValue]) {
			valueRegexCache[britishValue] = new RegExp(`(?<=:\\s*)${britishValue}(?=;|$)`, "gi");
		}
		return valueRegexCache[britishValue];
	}

	function convertBritishToCSS(css) {
		if (!css || typeof css !== "string") return css;

		let result = css;

		Object.keys(britishPropsToCss).forEach((britishProp) => {
			const propRegex = getPropertyRegex(britishProp);
			result = result.replace(propRegex, `$1${britishPropsToCss[britishProp]}:`);
		});

		Object.keys(britishValuesToCss).forEach((britishValue) => {
			const valueRegex = getValueRegex(britishValue);
			result = result.replace(valueRegex, britishValuesToCss[britishValue]);
		});

		return result;
	}

	function createBritishStyleProxy(element) {
		if (!element || !element.style) return null;

		const elementStyle = element.style;
		if (elementStyle._britishProxyApplied) return elementStyle._britishProxy;

		const proxy = new Proxy(elementStyle, {
			set(target, prop, value) {
				try {
					const cssProperty = britishPropsToCss[prop] || prop;

					log(`Setting style property: ${prop} → ${cssProperty} with value: ${value}`);
					target[cssProperty] = value;
					return true;
				} catch (e) {
					console.error("[BritCSS] Error setting style property:", e);
					return false;
				}
			},
			get(target, prop) {
				try {
					if (prop === "_britishProxyApplied") return true;

					const cssProperty = britishPropsToCss[prop] || prop;
					return target[cssProperty];
				} catch (e) {
					console.error("[BritCSS] Error getting style property:", e);
					return undefined;
				}
			},
		});

		elementStyle._britishProxy = proxy;
		elementStyle._britishProxyApplied = true;

		return proxy;
	}

	function processCSSRules(rules) {
		if (!rules) return;

		try {
			for (let i = 0; i < rules.length; i++) {
				const rule = rules[i];

				if (rule.style) {
					const originalCssText = rule.style.cssText;
					const convertedCssText = convertBritishToCSS(originalCssText);

					if (convertedCssText !== originalCssText) {
						log("Converting rule:", originalCssText, "→", convertedCssText);

						try {
							rule.style.cssText = convertedCssText;
						} catch (e) {
							log("Error applying converted CSS:", e.message);
						}
					}
				}

				// Handle nested rules (media queries, etc.)
				if (rule.cssRules || rule.rules) {
					processCSSRules(rule.cssRules || rule.rules);
				}
			}
		} catch (e) {
			log("Error processing CSS rules:", e.message);
		}
	}

	function processInlineStyles() {
		try {
			const elements = document.querySelectorAll("[style]");
			log(`Processing ${elements.length} inline styles`);

			elements.forEach((element) => {
				const style = element.getAttribute("style");
				if (!style) return;

				const newStyle = convertBritishToCSS(style);

				if (newStyle !== style) {
					log("Converting inline style:", style, "→", newStyle);
					element.setAttribute("style", newStyle);
				}
			});
		} catch (e) {
			log("Error processing inline styles:", e.message);
		}
	}

	function processStylesheets() {
		try {
			log(`Processing ${document.styleSheets.length} stylesheets`);

			for (let i = 0; i < document.styleSheets.length; i++) {
				try {
					const sheet = document.styleSheets[i];

					const rules = sheet.cssRules;

					if (rules) {
						log(`Processing stylesheet #${i}: ${sheet.href || "inline"} (${rules.length} rules)`);
						processCSSRules(rules);
					}
				} catch (e) {
					log(`Could not access rules in stylesheet #${i} (likely CORS issue)`);
				}
			}
		} catch (e) {
			log("Error processing stylesheets:", e.message);
		}
	}

	function processStyleElements() {
		try {
			const styleElements = document.querySelectorAll("style");
			log(`Processing ${styleElements.length} style elements`);

			styleElements.forEach((styleEl, index) => {
				try {
					const originalContent = styleEl.textContent;
					if (!originalContent) return;

					const convertedContent = convertBritishToCSS(originalContent);

					if (convertedContent !== originalContent) {
						log(`Converting style element #${index}`);
						styleEl.textContent = convertedContent;
					}
				} catch (e) {
					log(`Error processing style element #${index}:`, e.message);
				}
			});
		} catch (e) {
			log("Error processing style elements:", e.message);
		}
	}

	function setupMutationObserver() {
		try {
			let pendingProcessing = false;
			let timeout = null;

			const processChanges = () => {
				if (pendingProcessing) {
					processStyleElements();
					processInlineStyles();
					processStylesheets();
					pendingProcessing = false;
				}
			};

			const observer = new MutationObserver((mutations) => {
				let shouldProcessStyles = false;

				for (const mutation of mutations) {
					if (mutation.type === "attributes" && mutation.attributeName === "style") {
						const element = mutation.target;
						const style = element.getAttribute("style");
						if (!style) continue;

						const newStyle = convertBritishToCSS(style);

						if (newStyle !== style) {
							log("Converting new inline style:", style, "→", newStyle);
							element.setAttribute("style", newStyle);
						}
					}

					if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
						for (const node of mutation.addedNodes) {
							if (node.nodeType === Node.ELEMENT_NODE) {
								if (node.tagName === "STYLE" || node.tagName === "LINK" || node.hasAttribute("style")) {
									shouldProcessStyles = true;
									break;
								}
							}
						}
					}
				}

				if (shouldProcessStyles) {
					pendingProcessing = true;

					clearTimeout(timeout);
					timeout = setTimeout(processChanges, 100);
				}
			});

			observer.observe(document, {
				attributes: true,
				attributeFilter: ["style"],
				childList: true,
				subtree: true,
			});

			log("Mutation observer set up with throttling");
			return observer;
		} catch (e) {
			console.error("[BritCSS] Error setting up mutation observer:", e);
			return null;
		}
	}

	function overrideInsertRule() {
		try {
			const originalInsertRule = CSSStyleSheet.prototype.insertRule;
			CSSStyleSheet.prototype.insertRule = function (rule, index) {
				try {
					const convertedRule = convertBritishToCSS(rule);

					if (convertedRule !== rule) {
						log("Converting insertRule:", rule, "→", convertedRule);
					}

					return originalInsertRule.call(this, convertedRule, index === undefined ? 0 : index);
				} catch (e) {
					log("Error in insertRule override:", e.message);
					return originalInsertRule.call(this, rule, index === undefined ? 0 : index);
				}
			};
			log("Overrode CSSStyleSheet.prototype.insertRule");
			return true;
		} catch (e) {
			console.error("[BritCSS] Error overriding insertRule:", e);
			return false;
		}
	}

	window.britCSS = {
		/**
		 * Apply British style proxy to an element
		 * @param {HTMLElement} element - The element to apply British styling to
		 * @return {Proxy|null} A proxy for the element's style property
		 */
		apply: function (element) {
			return createBritishStyleProxy(element);
		},

		/**
		 * Convert a British CSS property to standard CSS
		 * @param {string} britishProp - The British property name
		 * @return {string} The standard CSS property name
		 */
		convertProperty: function (britishProp) {
			return britishPropsToCss[britishProp] || britishProp;
		},

		/**
		 * Convert a full CSS string from British to standard CSS
		 * @param {string} cssText - The CSS text to convert
		 * @return {string} The converted CSS text
		 */
		convertCSS: function (cssText) {
			return convertBritishToCSS(cssText);
		},

		/**
		 * Manually refresh all styles on the page
		 */
		refreshStyles: function () {
			processStyleElements();
			processInlineStyles();
			processStylesheets();
			log("All styles refreshed");
		},

		/**
		 * Enable or disable debug mode
		 * @param {boolean} [enabled] - Set to true to enable, false to disable. If undefined, returns current state.
		 * @return {boolean} The current debug state after the operation
		 */
		debug: function (enabled) {
			if (enabled === undefined) return DEBUG;
			DEBUG = !!enabled;
			log(`Debug mode ${DEBUG ? "enabled" : "disabled"}`);
			return DEBUG;
		},

		/**
		 * Add a custom British to CSS property mapping
		 * @param {string} britishProp - The British property name
		 * @param {string} cssProp - The standard CSS property name
		 * @return {boolean} True if successful
		 */
		addPropertyMapping: function (britishProp, cssProp) {
			if (!britishProp || !cssProp || typeof britishProp !== "string" || typeof cssProp !== "string") {
				return false;
			}

			britishPropsToCss[britishProp] = cssProp;

			if (britishProp.includes("-")) {
				const camelBritish = britishProp.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
				const camelCSS = cssProp.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
				britishPropsToCss[camelBritish] = camelCSS;

				delete propertyRegexCache[britishProp];
			}

			log(`Added property mapping: ${britishProp} → ${cssProp}`);
			return true;
		},

		/**
		 * Add a custom British to CSS value mapping
		 * @param {string} britishProp - The British value name
		 * @param {string} cssProp - The standard CSS value name
		 * @return {boolean} True if successful
		 */
		addValueMapping: function (britishValue, cssValue) {
			if (!britishValue || !cssValue || typeof britishValue !== "string" || typeof cssValue !== "string") {
				return false;
			}

			britishValuesToCss[britishValue] = cssValue;
			delete valueRegexCache[britishValue];

			log(`Added value mapping: ${britishValue} → ${cssValue}`);
			return true;
		},

		/**
		 * Get the version of BritCSS
		 * @return {string} The version string
		 */
		version: function () {
			return VERSION;
		},

		/**
		 * Get a list of all British mappings
		 * @return {Object} Object containing all mappings
		 */
		getMappings: function () {
			return { ...britishPropsToCss };
		},

		/**
		 * Get a list of all British property mappings
		 * @return {Object} Object containing property mappings
		 */
		getPropMappings: function () {
			return { ...britishPropsToCss };
		},

		/**
		 * Get a list of all British value mappings
		 * @return {Object} Object containing value mappings
		 */
		getValueMappings: function () {
			return { ...britishValuesToCss };
		},
	};

	let observer = null;

	function initialize() {
		try {
			log("Initializing BritCSS v" + VERSION);
			overrideInsertRule();
			processStyleElements();
			processInlineStyles();
			processStylesheets();
			observer = setupMutationObserver();
			log("BritCSS initialized successfully");

			console.log("%cBritCSS v" + VERSION + " loaded - now supporting proper English spelling in your CSS!", "font-weight: bold;");
		} catch (e) {
			console.error("[BritCSS] Error initializing:", e);
		}
	}

	function shutdown() {
		try {
			if (observer) {
				observer.disconnect();
				observer = null;
			}
			if (CSSStyleSheet.prototype.insertRule._originalInsertRule) {
				CSSStyleSheet.prototype.insertRule = CSSStyleSheet.prototype.insertRule._originalInsertRule;
			}
			log("BritCSS shutdown complete");
			return true;
		} catch (e) {
			console.error("[BritCSS] Error during shutdown:", e);
			return false;
		}
	}

	window.britCSS.shutdown = shutdown;

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize);
	} else {
		initialize();
	}
})();
