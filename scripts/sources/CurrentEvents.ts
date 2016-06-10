/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */
/// <reference path="../core/ICalParsing.ts" />
/// <reference path="../../t6s-core/core-backend/scripts/server/SourceItf.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/EventCal.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/EventList.ts" />
/// <reference path="../CalendarNamespaceManager.ts" />

/**
 * Get the current events from an ICS Calendar.
 * Parameters are :
 * - URL of the ICS Calendar,
 * - Limit of the numer of events to retrieve (0 = no limit),
 * - InfoDuration for each information
 * - Name of the calendar
 *
 * @class CurrentEvents
 */
class CurrentEvents extends SourceItf {

	constructor(params : any, calendarNamespaceManager : CalendarNamespaceManager) {
		super(params, calendarNamespaceManager);

		if (this.checkParams(["Limit", "InfoDuration", "URL", "Name"])) {
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
				var startDate = moment();
				var endDate = moment().add(10, "minutes");

				try {
					var events : Array<EventCal> = ICalParsing.getEventsOfACalendarInARange(body, startDate.toDate(), endDate.toDate());
					var eventList : EventList = new EventList(uuid.v1());
					eventList.setName(self.getParams().Name);

					var limit = parseInt(self.getParams().Limit);
					var infoDuration = parseInt(self.getParams().InfoDuration);

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
					Logger.error("Error while getting events from ICS with following range: "+startDate+" -> "+endDate);
					Logger.error(err);
				}



			}
		});
	}
}