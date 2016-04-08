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

	/**
	 * Return all occurences of a reccurring event in the range given by two dates.
	 * This method throws error if the given event is not reccuring or if the recursion has not limit and no dateEnd is given.
	 *
	 * @param reccuringVevent An ICS event on the form of a ICAL.Component
	 * @param dateStart The date to start the range as a JSDate
	 * @param dateEnd The date to end the range as a JSDate. This argument is optionnal if the event has a limit of occurrences.
	 * @returns {Array} An array of EventCal
     */
	public static getNextVEventsOfARecurringEventInARange(reccuringVevent : any, dateStart : any, dateEnd : any = null) : Array<EventCal> {
		var reccuringEvent = new ICAL.Event(reccuringVevent);
		if (!reccuringEvent.isRecurring()) {
			throw new Error("The passing event is not reccuring.");
		}

		var rrule = reccuringVevent.getFirstProperty('rrule');
		var count = rrule.getFirstValue().count;

		if (count == null && dateEnd == null) {
			throw new Error("Your reccurring event has not count limit: you must give a dateEnd.");
		}

		if (dateEnd != null && moment(dateStart).isAfter(dateEnd)) {
			throw new Error("The given dateStart argument is after dateEnd : "+dateStart+ " > "+dateEnd);
		}

		var recurExpansion : any = reccuringEvent.iterator();

		var results = [];
		var timeOccurence;
		var occNumber = 0;
		var momentTimeOcc;

		while (!recurExpansion.complete) {

			timeOccurence = recurExpansion.next();
			if (timeOccurence != null) {
				momentTimeOcc = moment(timeOccurence.toJSDate());

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

				occNumber++;
			}
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