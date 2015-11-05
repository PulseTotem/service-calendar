/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */

/// <reference path="../../t6s-core/core-backend/scripts/server/SourceItf.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/EventCal.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/EventList.ts" />
/// <reference path="../CalendarNamespaceManager.ts" />
/// <reference path="../core/ICalParsing.ts" />

var ICAL : any = require("ical.js");
var request : any = require("request");
var moment : any = require("moment");

/**
 * Define a source which retrieves Y events of a calendar which are coming in the following X hours.
 * This source takes those following parameters :
 *     - URL (string) : the URL of the iCalendar to parse (ICAL format)
 *     - Limit (integer) : the maximum number of events to retrieve (0 = no limit)
 *     - InfoDuration (integer) : the duration of each information
 *     - Name (string) : Describe the current calendar
 *
 * @class NextEvents
 */
class EventsForNextYHours extends SourceItf {

	constructor(params : any, calendarNamespaceManager : CalendarNamespaceManager) {
		super(params, calendarNamespaceManager);

		Logger.debug("Call next events with params :");
		Logger.debug(params);

		if (this.checkParams(["Limit", "InfoDuration", "URL", "TimeWindow", "Name"])) {
			this.run();
		}
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
				var timeWindow = parseInt(self.getParams().TimeWindow);
				var limitNotReached = true;
				var now : any = moment();

				var futureNow = now.add(timeWindow, "hours");

				for (var i = 0; i < vevents.length && limitNotReached; i++) {
					var currentEvent = vevents[i];

					var endDate : any = ICalParsing.getEndDateFromVEvent(currentEvent);
					var startDate : any = ICalParsing.getStartDateFromVEvent(currentEvent);


					if (now.isBefore(startDate) && futureNow.isAfter(startDate)) {
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