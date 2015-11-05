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

		Logger.debug("Call next events with params :");
		Logger.debug(params);

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
					var startDate : any = ICalParsing.getStartDateFromVEvent(currentEvent);
					var now : any = moment();

					if (now.isBefore(endDate) && now.isAfter(startDate)) {
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