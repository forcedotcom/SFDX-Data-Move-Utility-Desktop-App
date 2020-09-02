/*!
 * bootstrap-tooltip-custom-class
 * v1.1.0
 * Extends Bootstrap Tooltips and Popovers by adding custom classes.
 * Copyright (c) 2017 - 2020 Andrei Victor Bulearca - https://github.com/andreivictor/bootstrap-tooltip-custom-class#readme
 * License: MIT
 */


!function(o){if(!o.fn.tooltip)throw new Error("Bootstrap Tooltip must be included first!");var t=o.fn.tooltip.Constructor;o.extend(t.Default,{customClass:""});var s=t.prototype.show;t.prototype.show=function(){if(s.apply(this),this.config.customClass){var t=this.getTipElement();o(t).addClass(this.config.customClass)}}}(window.jQuery);