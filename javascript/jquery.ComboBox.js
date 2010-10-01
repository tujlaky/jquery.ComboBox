/*
 *	JQuery based ComboBox
 *	To add new combobox $("select").replaceWithComboBox();
 *	Author: UJLAKY Tibor <tujlaky@adverticum.com>
 *	Homepage: http://github.com/hangyagy/jquery.ComboBox
 */
(function($) {
	/* i18n */
	$.fn.ComboBox = function() {}
 	$.fn.ComboBox.regional = new Array();
	$.fn.ComboBox.setRegional = function($lang) {
		$.extend($.fn.ComboBox.regional["default"], $lang);
	}

	$.fn.ComboBox.regional["default"] = {
		notfound: "Pattern not found",
		inputempty: "Select a value ..."
	}
	/* end of i18n */

 	function ComboBox() {
		// Main variables
		/* timer of search field */
		this.timer = null;
		/* elements of select*/
		this.Elements = Array();
		/* mouse state */
		this.mouse_enabled = true;
		/*div for implement box*/
		this.$select_div = null;
		this.$select = null;
		var _self = this;
		
		this.changeSelect = function(selected) {
			_self.$select.find("option").each(function() {
				if ($(this).val() == selected) {
					$(this).attr("selected", true);
				}
			});
			_self.$select.trigger("change");
		}

		this.showFields = function() {
			var min_zindex = 1000;
			var max = min_zindex;
			var $fields = _self.$select_div.find("div.option_fields");

			$("div.combobox_container").each(function() {
				var zindex = $(this).css("z-index"); 
				if (zindex > max) {
					max = zindex;
				}
			});
			$fields.show();
			_self.$select_div.css("z-index", max+1);
			$fields.removeClass("inactive_fields");
	
		}

		this.hideFields = function () {
			var $fields = _self.$select_div.find("div.option_fields");
			$fields.hide();
			_self.$select_div.css("z-index", 1);
			$fields.addClass("inactive_fields");
		}

		/*
		 *	Search text in Elements array
		 */
		this.searchInElements = function(text) {
			var matcher = new RegExp(text,"i");
			var reg = new RegExp("(.*?)("+text+")(.*)","i");
			var results = Array();
			var j=0;
			for (i=0; i<this.Elements.length; i++) {
				if (matcher.test(this.Elements[i])) {
					var match = this.Elements[i].match(reg);
					results[j] = match[1]+"<span class='matched'>"+match[2]+"</span>"+match[3];
					j++;
				}
			}
			return results;
		}

		/*
		 *	Handle search with value of input
		 */
		this.search = function() {
			var $text_field = _self.$select_div.find("input.combobox_input");
			var text = $text_field.val();
			var results = null;
			results = _self.searchInElements(text);

			var $options_div = _self.$select_div.find("div.option_fields");
			$options_div.empty();

			if (results.length == 0) {
				$(document.createElement("span"))
					.addClass("message")
					.html($.fn.ComboBox.regional["default"].notfound)
					.appendTo($options_div);
			}

			for (i=0; i<results.length; i++) {
				$item = $(document.createElement("div"))
					.addClass("combobox_item")
					.html(results[i])
					.appendTo($options_div);

				if (i==0) {
					$item.addClass("hovered-item").addClass("scrolled_with_keyboard");
				}
			}
			_self.scroller($("div.hovered-item").first());
			return false;
		}

		/*
		 * Select page scroller
		 */
		this.scroller = function($current) {
			if ($current.length == 0) {
				return;
			}
			var top = $current.position().top;
			var $container = _self.$select_div.find("div.option_fields");
			var scroll_top = $container.scrollTop();
			var line_height = $current.height()+3;
			var select_height = $container.height();
			if ((select_height-line_height) <= top) {
				$container.scrollTop(scroll_top+top-select_height+line_height);
			} else if (top<0) {
				$container.scrollTop(scroll_top+top);
			}
		}

		/*
		 * Mouse hover action
		 */
		this.hover_function = function(e) {
			if (_self.mouseIsEnabled() == false) {
				return;
			}
			if ($("div.hovered-item").hasClass("scrolled_with_keyboard")) {
				$("div.hovered-item").removeClass("hovered-item").removeClass("scrolled_with_keyboard");
			}
			$(this).addClass("hovered-item");

		}
		/*
		 * Mouse out action
		 */
		this.leave_function = function() {
			if (_self.mouseIsEnabled() == false) {
				return;
			}
			$(this).removeClass("hovered-item");
		}
		/*
		 * Disable mouse actions on select elements
		 */
		this.disableMouse = function() {
			if (_self.mouseIsEnabled() == true) {
				_self.$select_div.find("div.combobox_item").css('cursor', 'text');
				this.mouse_enabled = false;
			}
		}
		/*
		 * Enable mouse actions on select
		 */
		this.enableMouse = function() {
			if (_self.mouseIsEnabled() == false) {
				_self.$select_div.find("div.combobox_item").css('cursor', 'pointer');
				_self.mouse_enabled = true;
			}
		}

		/*
		 * Test mouse state
		 */
		this.mouseIsEnabled = function() {
			return this.mouse_enabled;
		}
		this.enterPressed = function(e) {
			if (e.keyCode == 13) {
				_self.$select_div.find("div.selected").removeClass("selected");
				_self.$select_div.find("div.hovered-item").addClass("selected").removeClass("hovered-item");
				var selected = _self.$select_div.find("div.selected").text();
				_self.changeSelect(selected);
				$(this).val(selected);
				_self.hideFields();
				var $next = _self.$select_div.parent().next();
				var $next_input = $next.find("div.combobox_container > input.combobox_input");
				if ($next_input.length != 0) {
					_self.hideFields();
					$next_input.focus();
				} else {
					var $next_input = _self.$select_div.parent().nextAll().find("input").first();
					$next_input.focus();
				}
				return false;	
			}
		}
		/*
		 * Action for arrows press
		 */
		this.arrowPressed = function(e, extra) {
			var $selected = null;
			var $select_div = _self.$select_div;
			_self.disableMouse();
			if (extra != null) {
				e.keyCode = extra;
			}
			// down
			if (e.keyCode == "40") {
				if ($("div.hovered-item").length > 0) {
					$selected = $select_div.find("div.hovered-item");
					var $next = $selected.nextAll("div.combobox_item:visible");
					if ($next.length != 0) {
						$select_div.find("div.hovered-item").removeClass("hovered-item").removeClass("scrolled_with_keyboard");
						$next.first().addClass("hovered-item").addClass("scrolled_with_keyboard");
					}
				} else {
					if ($("div.selected").length != 0) {
						$select_div.find("div.selected").first().addClass("hovered-item");
					} else {
						$("div.combobox_item").first().addClass("hovered-item");
					}
				}

				_self.scroller($select_div.find("div.hovered-item").first());
				return false;
				// up
			} else if (e.keyCode == "38") {
				if ($("div.hovered-item").length > 0) {
					$selected = $("div.hovered-item");
					var $prev = $selected.prevAll("div.combobox_item")
						if ($prev.length != 0) {
							$("div.hovered-item").removeClass("hovered-item").removeClass("scrolled_with_keyboard");
							$prev.first().addClass("hovered-item").addClass("scrolled_with_keyboard");
						}
				} else {
					$("div.combobox_item").first().addClass("hovered-item").addClass("scrolled_with_keyboard");
				}
				_self.scroller($select_div.find("div.hovered-item").first());
				return false;
			} else if (e.keyCode == "13") {
				return false;
			// HOME
			} else if (e.keyCode == "36") {
				$("div.hovered-item").removeClass("hovered-item").removeClass("scrolled_with_keyboard");
				$("div.combobox_item").first().addClass("hovered-item").addClass("scrolled_with_keyboard");
				_self.scroller($select_div.find("div.hovered-item").first());
			// END
			} else if (e.keyCode == "35") {
				$("div.hovered-item").removeClass("hovered-item").removeClass("scrolled_with_keyboard");
				$("div.combobox_item").last().addClass("hovered-item").addClass("scrolled_with_keyboard");
				_self.scroller($select_div.find("div.hovered-item").first());
			} else if (e.keyCode == "9") {
				var $next = _self.$select_div.parent().next();
				var $next_input = $next.find("div.combobox_container > input.combobox_input");
				if ($next_input.length != 0) {
					_self.hideFields();
					$next_input.focus();
				} else {
					var $next_input = _self.$select_div.parent().nextAll().find("input").first();
					$next_input.focus();
				}
				return false;
			}
			return true;
		}
		/*
		 * Create combobox
		 */
		this.initComboBox = function($select) {
			$select.hide();
			var $select_div = this.$select_div;

			$select_div.insertAfter($select);
			var i=0;
			var combobox = this;
			$select_div.find("div.option_fields > div.combobox_item").each(function() {
				combobox.Elements[i] = $(this).text();
				i++;
			});
			
			this.scroller($select_div.find("div.select"));
			$select_div.find("input.combobox_input").bind("keydown", this.arrowPressed );
			$select_div.find("input.combobox_input").bind("keypress", this.enterPressed );

			var $option_fields = $select_div.find("div.option_fields");

			$select_div.find("input.combobox_input").bind("keyup", function(e, extra) {
				if (extra != null) {
					e.keyCode = extra;
				}

				if ($option_fields.hasClass("inactive_fields") && e.keyCode != 13 && e.keyCode != 9) {
					_self.showFields();
					$(this).select();
				}

				if ($.inArray(e.keyCode, new Array(40,38,13, 36, 35)) > -1) {
					return false;
				}
				if (_self.timer != null) {
					clearTimeout(_self.timer);
				}
				_self.timer = setTimeout(_self.search, 100);
				return false;
			});
			$select_div.find("div.combobox_item").live("click", function() {
				$("div.selected").removeClass("selected");
				$(this).addClass("selected");
				$select_div.find("input.combobox_input").val($(this).text());
				_self.hideFields();
				_self.changeSelect($(this).text());
			});
			$select_div.find("option_fields").bind("keydown", function(e) {
				var $input = $(this).find("input.combobox_input");
				$input.trigger("keydown", e.keyCode);
			});

			$select_div.find("option_fields").bind("keyup", function(e) {
				var $input = $(this).find("input.combobox_input");
				$input.trigger("keyup", e.KeyCode);

			});

			$select_div.find("div.combobox_item").live("mouseenter", this.hover_function).
				find("div.combobox_item").css("cursor", "pointer");

			$("div.combobox_item").live("mouseleave", this.leave_function);

			$select_div.find("div.option_fields").live("mousemove", this.enableMouse);

			$select_div.find("a.open_box_button").live("click", function() {
				var $select_div = $(this).parent();
				var $fields = $select_div.find("div.option_fields");
				$select_div.find("input.combobox_input").focus().select();
				if ($fields.find("div.hovered-item").length == 0) {
					if ($fields.find("div.selected").length == 0) {
						$fields.find("div.combobox_item").first()
						.addClass("hovered-item")
						.addClass("scrolled_with_keyboard");
					}
				}
				if ($fields.hasClass("inactive_fields")) {
					_self.showFields();
				} else {
					_self.hideFields();
				}
				return false;

			});

			$select_div.find("input.combobox_input").live("click", function(event) {
				if (_self.$select_div.find("inactive_fields")) {
					_self.showFields();
					$(this).select();
				}

			});
		
			$("body").bind("click", function(e) {
				if (e.target != $select_div.find("input.combobox_input")[0]) {
					if (!$option_fields.hasClass("inactive_fields")) {
						_self.hideFields();
					}
				}
			});

		}
	}

	createComboBoxFromSelect = function($select) {
		var $div   = $(document.createElement("div")).addClass("combobox_container");
		var $input = $(document.createElement("input"))
					.addClass("combobox_input")
					.addClass("empty")
					.appendTo($div)
					.val($.fn.ComboBox.regional["default"].inputempty)
					.attr("autocomplete", "off");


		var $button = $(document.createElement("a"))
					.addClass("open_box_button")
					.appendTo($div)
					.attr("href", "#");
		var $fields = $(document.createElement("div"))
					.addClass("option_fields")
					.addClass("inactive_fields")
					.appendTo($div);
		$select.find("option").each(function() {
			if ($(this).val() != "") {
				var $option = $(document.createElement("div"))
							.addClass("combobox_item")
							.appendTo($fields)
							.html($(this).val());
				if ($(this).attr("selected") == true) {
					$option.addClass("selected");
					$input.val($(this).val());
				}
			}
		});

		return $div;
	}

	/*
	 * Replace select with combobox
	 */
	$.fn.replaceWithComboBox = function() {
		this.each(function() {
			$select_div = createComboBoxFromSelect($(this));
			$combobox = new ComboBox();
			$combobox.$select = $(this);
			$combobox.$select_div = $select_div;
			$combobox.initComboBox($(this));
		});
	}

})(jQuery);
