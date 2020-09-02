/*!
 * bootstrap-tooltip-custom-class
 * v1.1.0
 * Extends Bootstrap Tooltips and Popovers by adding custom classes.
 * Copyright (c) 2017 - 2020 Andrei Victor Bulearca - https://github.com/andreivictor/bootstrap-tooltip-custom-class#readme
 * License: MIT
 */


!function(t){if(!t.fn.popover)throw new Error("Bootstrap Popover must be included first!");var o=t.fn.popover.Constructor;t.extend(o.Default,{customClass:""});var s=o.prototype.show;o.prototype.show=function(){if(s.apply(this),this.config.customClass){var o=this.getTipElement();t(o).addClass(this.config.customClass)}}}(window.jQuery);