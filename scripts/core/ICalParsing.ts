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

	public static getNextVEventOfARecurringEventAfterDate(reccuringVevent : any, date : any) : any {
		var reccuringEvent = new ICAL.Event(reccuringVevent);
		var recurExpansion : any = reccuringEvent.iterator();

		var timeOccurence = recurExpansion.next();

		while (moment(timeOccurence.toJSDate()).isBefore(date) && !recurExpansion.complete) {
			timeOccurence = recurExpansion.next();
		}

		if (moment(timeOccurence.toJSDate()).isBefore(date)) {
			return null;
		} else {
			var occurenceDetails = reccuringEvent.getOccurrenceDetails(timeOccurence);
			var event = occurenceDetails.item;
			event.startDate = occurenceDetails.startDate;
			event.endDate = occurenceDetails.endDate;
			return event;
		}
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