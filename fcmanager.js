/**
 * Manager for FullCalendar  v0.1
 * http://github.com/mkuklis/fcmanager
 *
 * Use fcmanager.css for basic styling.
 *
 * Copyright (c) 2010 Michal Kuklis
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.htmlc
 *
 * Date: Thu Feb 25 2010
 *
 */

// TODO
// * add simple pub/sub
// * replace actions with events (bind/trigger or publish/subscribe)

(function($) {

  $.fn.fcManager = function(options) {
    o = $.extend({}, o, options);

    return this.each(function() {
      if (o.calendar == undefined) {
        throw("calendar id not found.");
      }

      var element = $(this).addClass('fcm');
      element.html(buildContent());
      
      if (o.currentDate == undefined) {
        updateCurrentDate($("#" + o.calendar).fullCalendar('getDate'));         
      }
      bindEvents();
      $.publish(PLUGIN_READY);
    });
  };

  // public
  
  $.fn.fcManager.dayClickCallback = function(date, $day) {
    updateCurrentDate(date);
    o.currentDay = $day;
    highlightDay($day);
    $.publish(DAY_CLICKED);
  };

  $.fn.fcManager.eventClickCallback = function(event) {
    o.currentEvent = event;
    updateCurrentDate(event.start);
    o.currentDay = eventToDay(event);
    highlightDay(o.currentDay);
    $.publish(EVENT_CLICKED, [event]);
  };
  
  // default options
  var o = $.fn.fcManager.options = {
    
    // labels
    eventTypes: {'appointment': 'Appointment', 'personal': 'Personal'},
    newEventLabel: 'Add New Event:',
    updateEventLabel: 'Update Event:',
    typeLabel: 'Event Type:',
    
    // calendar id
    calendar: 'calendar',
    
    // current
    currentDay: null,
    currentEvent: null,
    
    // date associated with the current day or event 
    currentDate: null,
    currentDateFormat: "MM/dd/yyyy",
    activeDayBackgroundColor: '#F5F8F9'
    
  };

  // private
  
  var 
    // event constants
    EVENT_CLICKED = "eventClicked",
    CURRENT_EVENT_CLICKED = "currentEventClicked",
    DAY_CLICKED = "dayClicked",
    FORM_BUTTON_CLICKED = "formButtonClicked",
    CANCEL_LINK_CLICKED = "cancelClicked",
    PLUGIN_READY = "pluginReady",
    
    // ids
    eventFormId = '#fcm-add-event-form',
    addActionId = '#fcm-add-action',
    updateActionId = '#fcm-update-action',
    currentDayId = '#fcm-current-date',
    titleLabelId = '#fcm-labelId',
    cancelActionId = '#fcm-cancel-action',
    currentEventsId = '#fcm-events',
    
    // classes
    fcmEvent = '.fcm-event';
  
  var bindEvents = function() {

    $.subscribe($(currentEventsId), EVENT_CLICKED, loadCurrentDayEvents);
    $.subscribe($(currentEventsId), PLUGIN_READY, loadCurrentDayEvents);
    $.subscribe($(currentEventsId), DAY_CLICKED, loadCurrentDayEvents);
    $.subscribe($(currentEventsId), FORM_BUTTON_CLICKED, loadCurrentDayEvents);
    $.subscribe($(eventFormId), EVENT_CLICKED, showEditForm);
    $.subscribe($(eventFormId), CURRENT_EVENT_CLICKED, showEditForm);
    $.subscribe($(eventFormId), DAY_CLICKED, showNewForm);
    $.subscribe($(eventFormId), FORM_BUTTON_CLICKED, showNewForm);
    $.subscribe($(eventFormId), CANCEL_LINK_CLICKED, showNewForm);
    
    // add
    $(eventFormId + " input[name='add']").live('click', function(e) {
      var event = $(eventFormId).serializeObject();
      if (event.title != "") {
        // todo process date
        if (o.currentDate == null) {
          // FIX ME
          o.currentDate = $.fullCalendar.parseDate($(currentDayId).html());
        }

        event.start = o.currentDate;
        $('#' + o.calendar).fullCalendar('renderEvent', event, true);
        $.publish(FORM_BUTTON_CLICKED, [o.currentEvent]);
      }
    });
    
    // edit
    $(eventFormId + " input[name='update']").live('click', function(e) {
      var event = $(eventFormId).serializeObject();
      o.currentEvent.title = event.title;
      $("#" + o.calendar).fullCalendar('updateEvent', o.currentEvent);
      $.publish(FORM_BUTTON_CLICKED, [o.currentEvent]);
    });
    
    // update
    $(fcmEvent).live('click', function(e) {
      $(fcmEvent).removeClass('fcm-event-active');
      $(this).addClass('fcm-event-active');
      var event = $(this).data('event');
      o.currentEvent = event;
      $.publish(CURRENT_EVENT_CLICKED, [event]);
    });
    
    // cancel
    $(cancelActionId).live('click', function(e) {
      $.publish(CANCEL_LINK_CLICKED, o.currentEvent);
      e.preventDefault();
    });
  }
  
  var updateCurrentDate = function(date) {
    o.currentDate = date;
    
    var prettyDate = $.fullCalendar.formatDate(date, o.currentDateFormat);
    $(currentDayId).html(prettyDate); 
  };

  var buildContent = function() {
    var content =
      '<div class="fcm-current-day-wrapper"><p class="fcm-current-day" id="fcm-current-date"></p></div>' +
      '<div class="fcm-events" id="fcm-events"></div>' +
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
  };
    
  var loadCurrentDayEvents = function() {
    var $that = $(this);
    $that.html('');   
    $.each(getEvents(), function(index, event){
      if (datesEqual(event.start, o.currentDate)) {                
        var $event = $('<div class="fcm-event">' + event.title + '</div>');
        $event.appendTo($(currentEventsId));
        $event.data('event', event);
      }
    });
  };
    
  var showNewForm = function(e, event) {
    var $event = $(this).find('input[name="title"]');
    $event.val("");
    $event.focus();
    $(titleLabelId).html(o.newEventLabel);
    $(addActionId).show();
    $(updateActionId).hide();
  };
  
  var showEditForm = function(e, event) {
    $(titleLabelId).html(o.updateEventLabel);  
    $(this).find('input[name="title"]').val(event.title);
    $(addActionId).hide();
    $(updateActionId).show();
  };
  
  var getEvents = function() {
    return $('#' + o.calendar).fullCalendar('clientEvents');
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
  };
  
  // TODO find some better way
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
    });
    
    return day;
  };

  // helpers
  
  var getMonth = function(date) {
     return $.fullCalendar.formatDate(date, "MM");
  };
  
  var getDay = function(date) {
     return $.fullCalendar.formatDate(date, "d");
  };
  
  var datesEqual = function (date1, date2) {
    if (getMonth(date1) === getMonth(date2) 
      &&  getDay(date1) === getDay(date2)) {
      return true;
    }
    return false;
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
  
  // pub/sub stuff
  
  var subs = [];
  
  $.subscribe = function(element, event, action){
    if (subs[event] == undefined) {
      subs[event] = [element];
    }
    else {
      subs[event] = $.grep(subs[event], function(n){
      	// is this good enough?
        return n.selector != element.selector;
      });  
      subs[event].push(element);
    }
    element.unbind(event);
    element.bind(event, action);
  };
  
  $.publish = function(event, params) {
    $.each(subs[event], function(i, v){
      subs[event][i].trigger(event, params);
    });
  };

})(jQuery);
