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
        throw("calendar id not found.");
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
  
  // ids
  var 
    eventFormId = '#fcm-add-event-form',
    addActionId = '#fcm-add-action',
    updateActionId = '#fcm-update-action',
    currentDayId = '#fcm-current-date',
    titleLabelId = '#fcm-labelId',
    cancelActionId = '#fcm-cancel-action';
    
  var registerEvents = function() {

    // add
    $(eventFormId + " input[name='add']").live('click', function(e) {
      var event = $(eventFormId).serializeObject();
      if (event.title != "") {
        // todo process date
        if (o.currentDate == null) {
          o.currentDate = $.fullCalendar.parseDate($(currentDayId).html());
        }

        event.start = o.currentDate;
        addEvent(event);
      }
    });

    // update
    $(eventFormId + " input[name='update']").live('click', function(e) {
      var event = $(eventFormId).serializeObject();
      updateEvent(event);
    });
    
    // cancel
    $(cancelActionId).live('click', function(e) {
      $(addActionId).show();
      $(updateActionId).hide();
      clearForm();
      e.preventDefault();
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
    $("#" + o.calendar).fullCalendar('updateEvent', o.currentEvent);
    $day = eventToDay(o.currentEvent);
    highlightDay($day);
    clearForm();
    $(addActionId).show();
    $(updateActionId).hide();
  };

  var buildContent = function() {
    var content =
      '<div class="fcm-current-day-wrapper"><p class="fcm-current-day" id="fcm-current-date">' + o.currentDate + '</p></div>' +
      '<form class="fcm-form" id="fcm-add-event-form">' +
      '<label><strong class="fcm-title" id="fcm-labelId">' + o.newEventLabel + '</strong></label><br />' +
      '<input type="text" name="title" value="" /><br />' +
      '<label><strong class="fcm-title">' + o.typeLabel + '</strong></label><br />' +
      '<select name="type">';

      for (var type in o.eventTypes) {
        content += '<option value="' + type + '">' + o.eventTypes[type] + '</option>';
      }

      content += '</select>' +
        '<hr class="fcm-hrcolor" />' +
        '<div class="fcm-action" id="fcm-add-action">' +
        '<input type="button" name="add" value="add Event" /></div>' +
        '<div class="fcm-action" id="fcm-update-action" style="display:none">' +
        '<input type="button" name="update" value="update Event" />' +
        '<a class="fcm-cancel" id="fcm-cancel-action" href="">cancel</a></div>' +
        '</form>';

    return content;
  }

  var clearForm = function() {
    $(eventFormId + ' input[name="title"]').val("");
  };

  var highlightDay = function($day) {
    unhighlightDay();
    $day.css("background-color", o.activeDayBackgroundColor);
    o.currentDay = $day;
  };
  
  var unhighlightDay = function() {
    if (o.currentDay != null) {
      o.currentDay.css("background-color", "#ffffff");
    }
  }

  // TODO fix it
  var eventToDay = function(event) {
    
    var eDay = $.fullCalendar.formatDate(event.start, "d");
    var eMonth = $.fullCalendar.formatDate(event.start, "MM");
    
    var d = $("#" + o.calendar).fullCalendar('getDate');
    var tMonth = $.fullCalendar.formatDate(d, "MM");
    
    var day = null;
    
    $('.fc-day-number').each(function(){
      if (parseInt($(this).html()) == eDay) {
        if (day == null) {
          day = $(this).parent();
        }
        else {
          if (tMonth < eMonth) {
            day = $(this).parent();
          }
        }
      }
    })
    return day;
  };
  
  var daysInMonth = function(month, year) {
	  return new Date(year, month, 0).getDate();
  };

  // public

  $.fn.fcManager.dayClickCallback = function(date, $day) {
    clearForm();
    $(titleLabelId).html(o.newEventLabel);
    $(addActionId).show();
    $(updateActionId).hide();
    $(currentDayId).html($.fullCalendar.formatDate(date, "MM/dd/yyyy"));
    $(eventFormId + " input[name='title']").focus();
    $day.css('background-color', '#FFFF88');
    o.currentDate = date;

    highlightDay($day);
  };

  $.fn.fcManager.eventClickCallback = function(event) {

    o.currentEvent = event;
    o.currentDate = event.start;
    $(titleLabelId).html(o.updateEventLabel);
    $(currentDayId).html($.fullCalendar.formatDate(event.start, "MM/dd/yyyy"));
    $('#fcm-add-event-form input[name="title"]').val(event.title);
   
    $day = eventToDay(o.currentEvent);
    highlightDay($day);
  
    $(addActionId).hide();
    $(updateActionId).show();
  };

  // default options
  var o = $.fn.fcManager.options = {
    eventTypes: {'appointment': 'Appointment', 'personal': 'Personal'},

    // labels
    newEventLabel: 'Add New Event:',
    updateEventLabel: 'Update Event:',
    typeLabel: 'Event Type:',

    calendar: 'calendar',
    
    // current
    currentDay: null,
    currentEvent: null,
    currentDate: null,
    activeDayBackgroundColor: '#F5F8F9'
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
