/**
 * Manager for FullCalendar  v0.1
 * http://github.com/mkuklis/fcmanager
 *
 * Use fcmanager.css for basic styling.
 *
 * Copyright (c) 2010 Michal Kuklis
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Date: Thu Feb 25 2010
 *
 */

(function($) {
			
	$.fn.fcManager = function(options) {
	
		o = $.extend({}, o, options);
		
		return this.each(function() {
			if (o.calendar == undefined) {
				throw("instance of fullCalendar not found.");
			}
			
			if (o.currentDate == undefined) {
				var date = new Date();
				o.currentDate = date.getMonth() + 1 + "/" + date.getDate() +  "/" + date.getFullYear();
			}
			
			var element = $(this).addClass('fcm');
			element.html(buildContent());
			registerEvents();
    });
	};
	
	// private
	
	var registerEvents = function() {
		
		// add
		$("#" + o.eventFormId + " input[name='add']").live('click', function(e) {
		 	var event = $("#" + o.eventFormId).serializeObject();
		 	if (event.title != "") {
			 	// todo process date
			 	if (o.currentDate == null) {
			 		o.currentDate = $.fullCalendar.parseDate($('#' + o.currentDayId).html());
			 	}
			 
			 	event.start = o.currentDate;
			 	addEvent(event);
		 	}
		});

		// update
		$("#" + o.eventFormId + " input[name='update']").live('click', function(e) {
			var event = $("#" + o.eventFormId).serializeObject();
			updateEvent(event);
		});
	}
	
	var addEvent = function(event) {
		$('#' + o.calendar).fullCalendar('renderEvent', event, true);
		highlightDay(o.currentDay);
		clearForm();
	};
	
	var updateEvent = function(event) {
		// remove chosen event
		o.currentEvent.title = event.title;
		$('#' + o.calendar).fullCalendar('updateEvent', o.currentEvent);
		$day = eventToDay(o.currentEvent);
		highlightDay($day);
		clearForm();
		$("#" + o.addActionId).show();
		$("#" + o.updateActionId).hide();
	};
	
	var buildContent = function() {
		var content =
				'<form class="fcm-form" id="' + o.eventFormId + '">' + 
				'<p class="fcm-current-day" id="' + o.currentDayId + '">' + o.currentDate + '</p>' +
				'<label><strong class="fcm-title" id="' + o.titleLabelId + '">' + o.titleLabel + '</strong></label><br />' +
				'<input type="text" name="title" value="" /><br />' +
				'<label><strong class="fcm-title">' + o.typeLabel + '</strong></label><br />' + 
				'<select name="type">';
				
			for (var type in o.eventTypes) {
				content += '<option value="' + type + '">' + o.eventTypes[type] + '</option>';
			}

			content += '</select>' +
				'<hr class="fcm-hrcolor" />' +
				'<div class="fcm-action" id="' + o.addActionId + '">' +
				'<input type="button" name="add" value="add Event" /></div>' +
				'<div class="fcm-action" id="' + o.updateActionId + '" style="display:none">' + 
				'<input type="button" name="update" value="update Event" /><a href="">cancel</a></div>' +
				'</form>';
				
		return content;
	}
	
	var clearForm = function() {
		$("#" + o.eventFormId + ' input[name="title"]').val("");
	};
	
	var highlightDay = function($day) {
		if (o.currentDay != null) {
			o.currentDay.css("background-color", "#ffffff");
		}
		$day.css("background-color", "#FFFF88");
		o.currentDay = $day;
	};
	
	var eventToDay = function(event) {
		var day = $.fullCalendar.formatDate(event.start, "d");
		return $('.fc-day' + day);
	};
	
	// public 
	
	$.fn.fcManager.eventRenderCallback = function(event) {
		
  };
  
  $.fn.fcManager.dayClickCallback = function(date, $day) {
 		
		clearForm();	
		$("#" + o.titleLabelId).html("Add new Event");
		$("#" + o.addActionId).show();
		$("#" + o.updateActionId).hide();
		
		$("#" + o.currentDayId).html($.fullCalendar.formatDate(date, "MM/dd/yyyy"));
		$("#" + o.eventFormId + " input[name='title']").focus();
		$day.css('background-color', '#FFFF88');
		o.currentDate = date;
		
		highlightDay($day);
	
	};
	
	$.fn.fcManager.eventClickCallback = function(event) {
		
		o.currentEvent = event;
		o.currentDate = event.start;
		$("#" + o.titleLabelId).html("Update Event");
		$("#" + o.currentDayId).html($.fullCalendar.formatDate(event.start, "MM/dd/yyyy"));
		$("#" + o.eventFormId + ' input[name="title"]').val(event.title);	
		
		$day = eventToDay(event);
		highlightDay($day);
		
		$("#" + o.addActionId).hide();
		$("#" + o.updateActionId).show();

	};
		
	// default options
	var o = $.fn.fcManager.options = {
		eventTypes: {'appointment': 'Appointment', 'persion': 'Personal'},
		
		// labels
		titleLabel: 'Add New Event:',
		typeLabel: 'Event Type:',
		
		// ids
		eventFormId: 'add-event-form',
		addActionId: 'add-action',
		updateActionId: 'update-action',
		currentDayId: 'current-date',
		titleLabelId: 'labelId',
		calendar: 'calendar',
		
		// current
		currentDay: null,
		currentEvent: null,
		currentDate: null
	};
	
	// utils 
	
	$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
	};
		
})(jQuery);
