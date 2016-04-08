/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/EventCal.ts" />


/**
 * Utility class to parse and manipulate an ICal and return proper Event information for different sources
 *
 * @class ICalParsing
 */
class ICalParsing {

	/**
	 * Return all VEvents containing in an ICS
	 *
	 * @method getAllVEvents
	 * @param data Data containing in an ICS
	 * @returns {Array} The Array of VEvents
	 */
	public static getAllVEvents(data : String) : Array<any> {
		var jCalData = ICAL.parse(data);

		var comp = new ICAL.Component(jCalData);

		// Fetch the VEVENT part
		var vevents = comp.getAllSubcomponents('vevent');

		return vevents;
	}

	public static getNextVEventsOfARecurringEventInARange(reccuringVevent : any, dateStart : any, dateEnd : any = null) : Array<EventCal> {
		var reccuringEvent = new ICAL.Event(reccuringVevent);
		var recurExpansion : any = reccuringEvent.iterator();

		var results = [];
		var timeOccurence = recurExpansion.next();
		var event = null;
		var occNumber = 0;
		while (!recurExpansion.complete) {
			var momentTimeOcc = moment(timeOccurence.toJSDate());

			if (momentTimeOcc.isAfter(dateStart)) {
				if (dateEnd == null || momentTimeOcc.isBefore(dateEnd)) {
					var occurenceDetails = reccuringEvent.getOccurrenceDetails(timeOccurence);

					var uid = reccuringEvent.uid+"_"+occNumber;
					var eventCal : EventCal = new EventCal(uid);
					eventCal.setName(reccuringEvent.summary);
					eventCal.setDescription(reccuringEvent.description);
					eventCal.setLocation(reccuringEvent.location);
					eventCal.setStart(occurenceDetails.startDate.toJSDate());
					eventCal.setEnd(occurenceDetails.endDate.toJSDate());
					results.push(eventCal);
				} else if (dateEnd !== null && momentTimeOcc.isAfter(dateEnd)) {
					break;
				}
			}

			timeOccurence = recurExpansion.next();
			occNumber++;
		}

		return results;
	}

	public static createEventCalFromVEvent(vevent : any) : EventCal {
		var event : any = new ICAL.Event(vevent);

		var eventCal : EventCal = new EventCal(event.uid);
		eventCal.setName(event.summary);
		eventCal.setDescription(event.description);
		eventCal.setLocation(event.location);
		eventCal.setStart(event.startDate.toJSDate());
		eventCal.setEnd(event.endDate.toJSDate());
		eventCal.setObsoleteDate(event.endDate.toJSDate());

		return eventCal;
	}

	public static getStartDateFromVEvent(vevent : any) : any {
		var event : any = new ICAL.Event(vevent);

		var startDate = event.startDate.toJSDate();

		return moment(startDate);
	}

	public static getEndDateFromVEvent(vevent : any) : any {
		var event : any = new ICAL.Event(vevent);

		var endDate = event.endDate.toJSDate();

		return moment(endDate);
	}
}