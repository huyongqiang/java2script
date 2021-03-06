/*! jQuery UI - v1.9.2 - 2015-05-28
 * http://jqueryui.com
 * Includes: jquery.ui.slider.js
 * Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */

// BH 7/21/2018 fix for ScrollPane scroll bars not clicking on tracks 
// note -- still no support for unit (deprecated anyway) or block increments
// BH 2/28/2017 7:06:57 AM fix for vertical inverted and slider jump when clicked
// BH 11/22/2016 7:46:54 PM adding postMouseEvent
// adjusted for SwingJS for smoother operation 
// added j2sslider("getState")
;
(function() {

	if (J2S._isResourceLoaded("swingjs/jquery/jquery-ui-j2sslider.js", true))
		return;

	;
	(function($, undefined) {

		// number of pages in a slider
		// (how many times can you page 3/down to go through the whole range)
		var numPages = 5;

		var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle;

		$
				.widget(
						"ui.j2sslider",
						$.ui.mouse,
						{
							version : "1.9.2",
							widgetEventPrefix : "slide",

							options : {
								jslider : null,
								animate : false,
								distance : 0,
								scaleX : 1, // diamond cursor scaling X
								scaleY : 1, // diamand cursor scaling Y
								max : 100,
								min : 0,
								isScrollBar : false,
								orientation : "horizontal",
								range : false,
								step : 1,
								value : 0,
								inverted : false,
								values : null
							},

							_create : function() {
								var i, handleCount, o = this.options, existingHandles = this.element
										.find(".ui-j2sslider-handle")
										.addClass(
												"ui-state-default ui-corner-all"), handle = "<a class='ui-j2sslider-handle ui-state-default ui-corner-all' href='#'></a>", handles = [];

								this._keySliding = false;
								this._mouseSliding = false;
								this._animateOff = true;
								this._handleIndex = null;
								this._detectOrientation();
								this._mouseInit();
								this.isScrollBar = o.isScrollBar;
								this.handleSize = 0; // ScrollPane scrollbar only
								this.handleFraction = 0;
								this.element
										.addClass("ui-j2sslider"
												+ " ui-j2sslider-"
												+ this.orientation
												+ " ui-widget"
												+ " ui-widget-content"
												+ " ui-corner-all"
												+ (o.disabled ? " ui-j2sslider-disabled ui-disabled"
														: ""));

								this.range = $([]);

								if (o.range) {
									if (o.range === true) {
										if (!o.values) {
											o.values = [ this._valueMin(),
													this._valueMin() ];
										}
										if (o.values.length
												&& o.values.length !== 2) {
											o.values = [ o.values[0],
													o.values[0] ];
										}
									}

									this.range = $("<div></div>")
											.appendTo(this.element)
											.addClass(
													"ui-j2sslider-range"
															+
															// note: this isn't
															// the most
															// fittingly
															// semantic
															// framework class
															// for this element,
															// but worked best
															// visually with a
															// variety of themes
															" ui-widget-header"
															+ ((o.range === "min" || o.range === "max") ? " ui-j2sslider-range-"
																	+ o.range
																	: ""));
								}

								var me = this;

								var postMouseEvent = function(xye, id) {
									// set target to the handle
									xye.ev.currentTarget
											&& (xye.ev.target = xye.ev.currentTarget);
									// pass event to JSlider in case there is a
									// mouse listener implemented for that
									// InputEvent.BUTTON1 +
									// InputEvent.BUTTON1_DOWN_MASK;
									// same call here as in j2sApplet
									me.options.jslider.getFrameViewer$()
											.processMouseEvent$I$I$I$I$J$O$I(
													id, xye.x, xye.y, 1040,
													System.currentTimeMillis$(),
													xye.ev);
								};

								var fDown = function(xye, id) {
									me._doMouseCapture(xye.ev);
									postMouseEvent(xye, id);
								};

								var fDownTrack = function(event, id) {
									me._doMouseCapture(event, true);
									me._mouseSliding = false;
								};

								var fDrag = function(xye, id) {
									if (me.options.disabled)
										return;
									var event = xye.ev;
									var position = {
										x : event.pageX,
										y : event.pageY
									};

									// touch event? get position from touch
									if (!event.pageX) {
										position.x = event.originalEvent.touches[0].pageX;
										position.y = event.originalEvent.touches[0].pageY;
									}
									var normValue = me
											._normValueFromMouse(position);
									me
											._slide(event, me._handleIndex,
													normValue);
									postMouseEvent(xye, id);
								};

								var fUp = function(xye, id) {
									if (me.options.disabled)
										return;
									var event = xye.ev;
									me.handles.removeClass("ui-state-active");
									me._mouseSliding = false;
									me._stop(event, me._handleIndex);
									me._change(event, me._handleIndex);
									me._handleIndex = null;
									me._clickOffset = null;
									me._animateOff = false;
									postMouseEvent(xye, id);
								};

								handleCount = (o.values && o.values.length) || 1;

								for (i = 0; i < handleCount; i++) {
									handles.push(handle);
								}

								this.handles = existingHandles.add($(
										handles.join(""))
										.appendTo(this.element));

								for (i = 0; i < handleCount; i++) {
									handle = this.handles[i];
									handle.index = i;
									J2S._setDraggable(handle, [ fDown, fDrag,
											fUp ]);
								}
								
								if (handleCount == 1)
									$(this.element).mousedown(fDownTrack);

								this.handle = this.handles.eq(0);

								this.handles.add(this.range).filter("a").click(
										function(event) {
											event.preventDefault();
										})
								this.handles.each(function(i) {
									$(this)
											.data("ui-j2sslider-handle-index",
													i);
								});


								this.elementSize = {
										width : this.element.outerWidth(),
										height : this.element.outerHeight()
									};

								this._refreshValue();
								this._animateOff = false;


							},

							_destroy : function() {
								this.handles.remove();
								this.range.remove();

								this.element.removeClass("ui-j2sslider"
										+ " ui-j2sslider-horizontal"
										+ " ui-j2sslider-vertical"
										+ " ui-j2sslider-disabled"
										+ " ui-widget" + " ui-widget-content"
										+ " ui-corner-all");

								this._mouseDestroy();
							},

							_doMouseCapture : function(event, isTrackClick) {
								var that = this, o = this.options;

								if (o.disabled) {
									return false;
								}

								this.elementSize = {
									width : this.element.outerWidth(),
									height : this.element.outerHeight()
								};
								this.elementOffset = this.element.offset();

								position = {
									x : event.pageX,
									y : event.pageY
								};

								// touch event? get position from touch
								if (!event.pageX) {
									position.x = event.originalEvent.touches[0].pageX;
									position.y = event.originalEvent.touches[0].pageY;
								}
								distance = this._valueMax() - this._valueMin()
										+ 1;

								index = event.target.index;
								closestHandle = $(event.target);// handles[index];//$(
																// this );

								// workaround for bug #3736 (if both handles of
								// a range are at 0,
								// the first is always used as the one with
								// least distance,
								// and moving it is obviously prevented by
								// preventing negative ranges)
								if (o.range === true
										&& this.values(1) === o.min) {
									index += 1;
									closestHandle = $(this.handles[index]);
								}

								allowed = this._start(event, index);
								if (allowed === false) {
									return false;
								}
								this._mouseSliding = true;

								this._handleIndex = index;

								if (!isTrackClick)
								closestHandle.addClass("ui-state-active")
										.focus();


								offset = closestHandle.offset();
								mouseOverHandle = !isTrackClick && $(event.target).parents()
										.andSelf().is(".ui-j2sslider-handle");
								this.closestHandle = closestHandle;
								this._clickOffset = (mouseOverHandle ? {
									left : position.x
											- offset.left
											- (closestHandle.width() / 2 * this.options.scaleX)
											,
									top : position.y
											- offset.top
											- (closestHandle.height() / 2 * this.options.scaleY)
											- (parseInt(closestHandle
													.css("borderTopWidth"), 10) || 0)
											- (parseInt(closestHandle
													.css("borderBottomWidth"),
													10) || 0)
											+ (parseInt(closestHandle
													.css("marginTop"), 10) || 0)
								}
										: {
											left : 0,
											top : 0
										});
							
								normValue = this._normValueFromMouse(position, isTrackClick);
								if (!this.handles.hasClass("ui-state-hover")) {
									this._slide(event, index, normValue);
								}
								this._animateOff = true;
								return true;
							},

							_detectOrientation : function() {
								this.orientation = (this.options.orientation === "vertical") ? "vertical"
										: "horizontal";
							},

							_normValueFromMouse : function(position, isTrackClick) {

								if (!this.elementSize)
									return;


								var pixelTotal, pixelMouse, fMouse, valueTotal, valueMouse;

								if (this.orientation === "horizontal") {
									
									pixelTotal = this.elementSize.width;
									pixelMouse = position.x
											- this.elementOffset.left
											- (this._clickOffset ? this._clickOffset.left
													: 0);
								} else {
									pixelTotal = this.elementSize.height;
									pixelMouse = position.y
											- this.elementOffset.top
											- (this._clickOffset ? this._clickOffset.top
													: 0);
								}
								if (this.isScrollBar) {
									pixelMouse = pixelMouse - this.handleSize/2;
								}
								
								fMouse = (pixelMouse / pixelTotal);
															

								if (fMouse > 1) {
									fMouse = 1;
								}
								if (fMouse < 0) {
									fMouse = 0;
								}
								if (this.orientation === "vertical") {
									fMouse = 1 - fMouse;
								}
								if (this.options.inverted) {
									fMouse = 1 - fMouse;
								}

								valueTotal = this._valueMax()
										- this._valueMin();
								valueMouse = this._valueMin() + fMouse
										* valueTotal;

								return this._trimAlignValue(valueMouse);
							},

							_start : function(event, index) {
								var uiHash = {
									handle : this.handles[index],
									value : this.value()
								};
								if (this.options.values
										&& this.options.values.length) {
									uiHash.value = this.values(index);
									uiHash.values = this.values();
								}
								return this._trigger("start", event, uiHash);
							},

							_slide : function(event, index, newVal) {
								var otherVal, newValues, allowed;

								if (this.options.values
										&& this.options.values.length) {
									otherVal = this.values(index ? 0 : 1);

									if ((this.options.values.length === 2 && this.options.range === true)
											&& ((index === 0 && newVal > otherVal) || (index === 1 && newVal < otherVal))) {
										newVal = otherVal;
									}

									if (newVal !== this.values(index)) {
										newValues = this.values();
										newValues[index] = newVal;
										// A slide can be canceled by returning
										// false from the slide callback
										allowed = this
												._trigger(
														"slide",
														event,
														{
															handle : this.handles[index],
															value : newVal,
															values : newValues
														});
										otherVal = this.values(index ? 0 : 1);
										if (allowed !== false) {
											this.values(index, newVal, true);
										}
									}
								} else {
									if (newVal !== this.value()) {
										// A slide can be canceled by returning
										// false from the slide callback
										allowed = this
												._trigger(
														"slide",
														event,
														{
															handle : this.handles[index],
															value : newVal
														});
										if (allowed !== false) {
											this.value(newVal);
										}
									}
								}
							},

							_stop : function(event, index) {
								var uiHash = {
									handle : this.handles[index],
									value : this.value()
								};
								if (this.options.values
										&& this.options.values.length) {
									uiHash.value = this.values(index);
									uiHash.values = this.values();
								}

								this._trigger("stop", event, uiHash);
							},

							_change : function(event, index) {
								if (!this._keySliding && !this._mouseSliding) {
									var uiHash = {
										handle : this.handles[index],
										value : this.value()
									};
									if (this.options.values
											&& this.options.values.length) {
										uiHash.value = this.values(index);
										uiHash.values = this.values();
									}

									this._trigger("change", event, uiHash);
								}
							},

							getState : function() {
								return this.options
							},

							value : function(newValue) {
								if (arguments.length) {

									this.options.value = this
											._trimAlignValue(newValue);
									this._refreshValue();
									this._change(null, 0);
									return;
								}

								return this._value();
							},

							values : function(index, newValue) {
								var vals, newValues, i;

								if (arguments.length > 1) {
									this.options.values[index] = this
											._trimAlignValue(newValue);
									this._refreshValue();
									this._change(null, index);
									return;
								}

								if (arguments.length) {
									if ($.isArray(arguments[0])) {
										vals = this.options.values;
										newValues = arguments[0];
										for (i = 0; i < vals.length; i += 1) {
											vals[i] = this
													._trimAlignValue(newValues[i]);
											this._change(null, i);
										}
										this._refreshValue();
									} else {
										if (this.options.values
												&& this.options.values.length) {
											return this._values(index);
										} else {
											return this.value();
										}
									}
								} else {
									return this._values();
								}
							},

							_setOption : function(key, value) {
								var i, valsLength = 0;

								if ($.isArray(this.options.values)) {
									valsLength = this.options.values.length;
								}

								$.Widget.prototype._setOption.apply(this,
										arguments);

								switch (key) {
								case "disabled":
									if (value) {
										this.handles.filter(".ui-state-focus")
												.blur();
										this.handles
												.removeClass("ui-state-hover");
										this.handles.prop("disabled", true);
										this.element.addClass("ui-disabled");
									} else {
										this.handles.prop("disabled", false);
										this.element.removeClass("ui-disabled");
									}
									break;
								case "orientation":
									this._detectOrientation();
									this.element
											.removeClass(
													"ui-j2sslider-horizontal ui-j2sslider-vertical")
											.addClass(
													"ui-j2sslider-"
															+ this.orientation);
									this._refreshValue();
									break;
								case "value":
									this._animateOff = true;
									this._refreshValue();
									this._change(null, 0);
									this._animateOff = false;
									break;
								case "values":
									this._animateOff = true;
									this._refreshValue();
									for (i = 0; i < valsLength; i += 1) {
										this._change(null, i);
									}
									this._animateOff = false;
									break;
								case "min":
								case "max":
									this._animateOff = true;
									this._refreshValue();
									this._animateOff = false;
								break;
								case "handleSize":
 									this.isScrollBar = this.options.isScrollBar = true;
 									this.handleFraction = value;
									if (this.orientation === "horizontal")
										$(this.handles[0]).width(this.handleSize = value * this.element.outerWidth());
									else
										$(this.handles[0]).height(this.handleSize = value * this.element.outerHeight());
									this._animateOff = true;
									this._refreshValue();
									this._animateOff = false;
								break;
								}
							},

							// internal value getter
							// _value() returns value trimmed by min and max,
							// aligned by step
							_value : function() {
								var val = this.options.value;
								val = this._trimAlignValue(val);

								return val;
							},

							// internal values getter
							// _values() returns array of values trimmed by min
							// and max, aligned by step
							// _values( index ) returns single value trimmed by
							// min and max, aligned by step
							_values : function(index) {
								var val, vals, i;

								if (arguments.length) {
									val = this.options.values[index];
									val = this._trimAlignValue(val);

									return val;
								} else {
									// .slice() creates a copy of the array
									// this copy gets trimmed by min and max and
									// then returned
									vals = this.options.values.slice();
									for (i = 0; i < vals.length; i += 1) {
										vals[i] = this._trimAlignValue(vals[i]);
									}

									return vals;
								}
							},

							// returns the step-aligned value that val is
							// closest to, between (inclusive) min and max
							_trimAlignValue : function(val) {
								if (val <= this._valueMin()) {
									return this._valueMin();
								}
								var max = (this._valueMax() - this._valueMin()) * (1-this.handleFraction) + this._valueMin();
								if (val >= max) {
									return max;
								}
								var step = (this.options.step > 0) ? this.options.step
										: 1, valModStep = (val - this
										._valueMin())
										% step, alignValue = val - valModStep;

								if (Math.abs(valModStep) * 2 >= step) {
									alignValue += (valModStep > 0) ? step
											: (-step);
								}

								// Since JavaScript has problems with large
								// floats, round
								// the final value to 5 digits after the decimal
								// point (see #4124)
								return parseFloat(alignValue.toFixed(5));
							},

							_valueMin : function() {
								return this.options.min;
							},

							_valueMax : function() {
								return this.options.max;
							},

							_getValPercent : function(i) {
								var dif = this._valueMax() - this._valueMin();
								var valPercent = (dif == 0 ? 0
										: ((i >= 0 ? this.values(i) : this
												.value()) - this._valueMin())
												/ dif * 100);
								return (this.options.inverted && !this.isScrollBar ? 100 - valPercent
										: valPercent);
							},

							_refreshValue : function() {
								var lastValPercent, valPercent, value, valueMin, valueMax, oRange = this.options.range, o = this.options, that = this, animate = (!this._animateOff) ? o.animate
										: false, _set = {};
								if (this.options.values
										&& this.options.values.length) {
									this.handles
											.each(function(i) {
												valPercent = that
														._getValPercent(i);
												_set[that.orientation === "horizontal" ? "left"
														: "bottom"] = valPercent
														+ "%";
												$(this).stop(1, 1)[animate ? "animate"
														: "css"](_set,
														o.animate);
												if (that.options.range === true) {
													if (that.orientation === "horizontal") {
														if (i === 0) {
															that.range.stop(1,
																	1)[animate ? "animate"
																	: "css"]
																	(
																			{
																				left : valPercent
																						+ "%"
																			},
																			o.animate);
														}
														if (i === 1) {
															that.range[animate ? "animate"
																	: "css"]
																	(
																			{
																				width : (valPercent - lastValPercent)
																						+ "%"
																			},
																			{
																				queue : false,
																				duration : o.animate
																			});
														}
													} else {
														if (i === 0) {
															that.range.stop(1,
																	1)[animate ? "animate"
																	: "css"]
																	(
																			{
																				bottom : (valPercent)
																						+ "%"
																			},
																			o.animate);
														}
														if (i === 1) {
															that.range[animate ? "animate"
																	: "css"]
																	(
																			{
																				height : (valPercent - lastValPercent)
																						+ "%"
																			},
																			{
																				queue : false,
																				duration : o.animate
																			});
														}
													}
												}
												lastValPercent = valPercent;
											});
								} else {
									// just one handle
									valPercent = this._getValPercent(-1);
									var val;
									var isHorizontal = (this.orientation === "horizontal");
									val = "" + valPercent + "%";
									_set[isHorizontal ? "left"
											: this.isScrollBar ? "top" : "bottom"] = val;
									this.handle.stop(1, 1)[animate ? "animate"
											: "css"](_set, o.animate);

									if (oRange === "min" && isHorizontal) {
										this.range.stop(1, 1)[animate ? "animate"
												: "css"]({
											width : valPercent + "%"
										}, o.animate);
									}
									if (oRange === "max" && isHorizontal) {
										this.range[animate ? "animate" : "css"]
												({
													width : (100 - valPercent)
															+ "%"
												}, {
													queue : false,
													duration : o.animate
												});
									}
									if (oRange === "min"
											&& this.orientation === "vertical") {
										this.range.stop(1, 1)[animate ? "animate"
												: "css"]({
											height : valPercent + "%"
										}, o.animate);
									}
									if (oRange === "max"
											&& this.orientation === "vertical") {
										this.range[animate ? "animate" : "css"]
												({
													height : (100 - valPercent)
															+ "%"
												}, {
													queue : false,
													duration : o.animate
												});
									}
								}
							}

						});

	})(J2S.__$);

})();
