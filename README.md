#About
**FCManager** is a jQuery plug-in which integrates with [FullCalendar](http://arshaw.com/fullcalendar/). It allows you to manage calendar events (add/edit/delete events). In order to use it you have to initialize fullCalendar first.


The usage example:

    var fullCalendar = $('#calendar').fullCalendar({
	    theme: true,
			editable: true,
    	eventClick: function(calEvent, jsEvent, view) {
    		$.fn.fcManager.eventClickCallback(calEvent);
    	},
    	dayClick: function(date, allDay, jsEvent, view) {
      	$.fn.fcManager.dayClickCallback(date, $(this), view);
    	}
		});
		
		$('#manager').fcManager({calendar:'calendar'});
    
    <!-- html -->
    <div id="calendar"></div>
		<div id="manager"></div>

## Demo
[Simple](http://michalkuklis.com/fcmanager/examples/index.html)

## Notes

This is a very early version and it's not production ready. Some functionality is still missing but I plan to implement it in the near future.
