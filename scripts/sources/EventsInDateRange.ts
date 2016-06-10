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
 * Define a source which retrieves the event of a calendar which are coming until the limit is full.
 * This source takes those following parameters :
 *     - URL (string) : the URL of the iCalendar to parse (ICAL format)
 *     - Limit (integer) : the number of events to retrieve
 *     - InfoDuration (integer) : the duration of each information
 *     - Name (string) : Describe the current calendar
 *     - StartDate (date) : Describe the date to start range
 *     - EndDate (date) : Describe the date maximum to pick datas
 *
 * @class EventsInDateRange
 */
class EventsInDateRange extends SourceItf {

	constructor(params : any, calendarNamespaceManager : CalendarNamespaceManager) {
		super(params, calendarNamespaceManager);

		if (this.checkParams(["Limit", "InfoDuration", "URL", "Name", "StartDate", "EndDate"])) {
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
				var eventList : EventList = new EventList(uuid.v1());
				eventList.setName(self.getParams().Name);

				var limit = parseInt(self.getParams().Limit);
				var infoDuration = parseInt(self.getParams().InfoDuration);

				var dateStart = moment(parseInt(self.getParams().StartDate));
				var dateEnd = moment(parseInt(self.getParams().EndDate));

				try {
					var events : Array<EventCal> = ICalParsing.getEventsOfACalendarInARange(body, dateStart.toDate(), dateEnd.toDate());

					if (limit > events.length) {
						limit = events.length;
					}

					for (var i = 0; i < limit; i++) {
						var event : EventCal = events[i];
						event.setDurationToDisplay(infoDuration);

						eventList.addEvent(event);
					}
					eventList.setDurationToDisplay(infoDuration * limit);
					self.getSourceNamespaceManager().sendNewInfoToClient(eventList);
				} catch (err) {
					Logger.error("Error while getting events from ICS with following range: "+dateStart+" -> "+dateEnd);
					Logger.error(err);
				}


			}
		});
	}
}