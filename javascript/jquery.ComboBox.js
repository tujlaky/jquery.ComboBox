/*
 *	JQuery based ComboBox
 *	To add new combobox $("select").replaceWithComboBox();
 *	Author: UJLAKY Tibor <tujlaky@adverticum.com>
 * 	$Id$
 */
(function($) {
	/* i18n */
	$.fn.ComboBox = function() {}
 	$.fn.ComboBox.regional = new Array();
	$.fn.ComboBox.setRegional = function($lang) {
		$.extend(regional["default"], $lang);
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
			var $text_field = $select_div.find("input.combobox_input");
			var text = $text_field.val();
			var results = null;
			results = this.searchInElements(text);

			var $options_div = $text_field.parent().find("div.option_fields");
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
			this.scroller($("div.hovered-item").first());
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
			var $container = $select_div.find("div.option_fields");
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
			$select_div = $(this).parent().parent();
			$combobox = $select_div.data("combobox");
			if ($combobox.mouseIsEnabled() == false) {
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
			var $select_div = $(this).parent().parent();
			var $combobox = $select_div.data("combobox");
			if ($combobox.mouseIsEnabled() == false) {
				return;
			}
			$(this).removeClass("hovered-item");
		}
		/*
		 * Disable mouse actions on select elements
		 */
		this.disableMouse = function() {
			if (this.mouse_enabled == true) {
				$("div.combobox_item").css('cursor', 'text');
				this.mouse_enabled = false;
			}
		}
		/*
		 * Enable mouse actions on select
		 */
		this.enableMouse = function() {
			if (this.mouse_enabled == false) {
				$("div.combobox_item").css('cursor', 'pointer');
				this.mouse_enabled = true;
			}
		}

		/*
		 * Test mouse state
		 */
		this.mouseIsEnabled = function() {
			return this.mouse_enabled;
		}

		/*
		 * Action for arrows press
		 */
		this.arrowPressed = function(e) {
			var $selected = null;
			var $select_div = $(this).parent();
			var $combobox = $select_div.data("combobox");
			$combobox.disableMouse();


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

				$combobox.scroller($("div.hovered-item").first());
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
				$combobox.scroller($("div.hovered-item").first());
				return false;
			} else if (e.keyCode == "13") {
				$select_div.find("div.selected").removeClass("selected");
				$select_div.find("div.hovered-item").addClass("selected").removeClass("hovered-item");
				$select_div.find("input.hidden_input").val($("div.selected").text());
				$(this).val($("div.selected").text());
				$select_div.find("div.option_fields").hide().addClass("inactive_fields");
				return false;
			// HOME
			} else if (e.keyCode == "36") {
				$("div.hovered-item").removeClass("hovered-item").removeClass("scrolled_with_keyboard");
				$("div.combobox_item").first().addClass("hovered-item").addClass("scrolled_with_keyboard");
				$combobox.scroller($("div.hovered-item").first());
			// END
			} else if (e.keyCode == "35") {
				$("div.hovered-item").removeClass("hovered-item").removeClass("scrolled_with_keyboard");
				$("div.combobox_item").last().addClass("hovered-item").addClass("scrolled_with_keyboard");
				$combobox.scroller($("div.hovered-item").first());
			}
			return true;
		}
		/*
		 * Create combobox
		 */
		this.initComboBox = function($select) {
			$select.hide();
			var $select_div = this.$select_div;

			$select_div.appendTo($select.parent());
			var i=0;
			var combobox = this;
			$select_div.find("div.option_fields > div.combobox_item").each(function() {
				combobox.Elements[i] = $(this).text();
				i++;
			});
			
			this.scroller($select_div.find("div.select"));
			$select_div.find("input.combobox_input").bind("keydown", this.arrowPressed );

			$select_div.find("input.combobox_input").bind("keyup", function(e) {
				var $select_div = $(this).parent();
				var $combobox = $select_div.data("combobox");
				if ($.inArray(e.keyCode, new Array(40,38,13, 36, 35)) > -1) {
					return false;
				}
				if ($combobox.timer != null) {
					clearTimeout($combobox.timer);
				}
				$combobox.search();
//				$this.timer = setTimeout("$this.search()", 100);
				return false;
			});
			$("div.combobox_item").live("click", function() {
				$("div.selected").removeClass("selected");
				$(this).addClass("selected");
				$select_div.find("input.combobox_input").val($(this).text());
				$select_div.find("div.option_fields").hide().addClass("inactive_fields");
				$select_div.find("input.hidden_input").val($(this).text());
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
					$fields.show();
					$fields.removeClass("inactive_fields");
				} else {
					$fields.hide();
					$fields.addClass("inactive_fields");
				}
				return false;

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

		var $hidden = $(document.createElement("input"))
					.attr("type", "hidden")
					.addClass("hidden_input")
					.appendTo($div)
					.attr("name", $select.attr("name"))
					.val("");

		$select.attr("name", "");
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
					$hidden.val($(this).val());
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
			$combobox.$select_div = $select_div;
			$select_div.data("combobox", $combobox);
			$combobox.initComboBox($(this));
		});
	}

})(jQuery);
