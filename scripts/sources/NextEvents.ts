/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */

/// <reference path="../../t6s-core/core-backend/scripts/server/SourceItf.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/EventCal.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/EventList.ts" />
/// <reference path="../CalendarNamespaceManager.ts" />

var ICAL : any = require("ical.js");
var request : any = require("request");
var moment : any = require("moment");

/**
 * Define a source which retrieves the event of a calendar which are coming until the limit is full.
 * This source takes those following parameters :
 *     - URL (string) : the URL of the iCalendar to parse (ICAL format)
 *     - Limit (integer) : the number of events to retrieve
 *     - InfoDuration (integer) : the duration of each information
 *     - Name (string) : Describe the current calendar
 *
 * @class NextEvents
 */
class NextEvents extends SourceItf {

	constructor(params : any, calendarNamespaceManager : CalendarNamespaceManager) {
		super(params, calendarNamespaceManager);

		Logger.debug("Call next events with params :");
		Logger.debug(params);

		this.run();
	}

	public run() {
		var self = this;
		request(this.getParams().URL, function (error, response, body) {
			if (error) {
				Logger.error("Error when retrieving the calendar from URL "+self.getParams().URL);
				Logger.error(error);
			} else if (response.statusCode != 200) {
				Logger.error("Error when retrieving the calendar from URL "+self.getParams().URL);
				Logger.error("Status Code: "+response.statusCode);
				Logger.error("Body: "+body);
			} else {
				var vevents = ICalParsing.getAllVEvents(body);

				var eventList : EventList = new EventList(uuid.v1());
				eventList.setName(self.getParams().Name);

				var retrievedEvents = 0;
				var limit = parseInt(self.getParams().Limit);
				var infoDuration = parseInt(self.getParams().InfoDuration);
				var limitNotReached = true;

				for (var i = 0; i < vevents.length && limitNotReached; i++) {
					var currentEvent = vevents[i];

					var endDate : any = ICalParsing.getEndDateFromVEvent(currentEvent);
					var now : any = moment();

					if (now.isBefore(endDate)) {
						var eventCal = ICalParsing.createEventCalFromVEvent(currentEvent);
						eventCal.setDurationToDisplay(infoDuration);
						eventList.addEvent(eventCal);

						retrievedEvents++;

						if (retrievedEvents == limit) {
							limitNotReached = false;
						}
					}
				}

				eventList.setDurationToDisplay(infoDuration * retrievedEvents);
				self.getSourceNamespaceManager().sendNewInfoToClient(eventList);

			}
		});
	}
}