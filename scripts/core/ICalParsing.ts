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
	 * Comparison method between two EventCal: this function should be used in Array.sort()
	 * EventCal are compared given their startDate only.
	 * @param event1 An EventCal
	 * @param event2 Another EventCal
	 * @returns {number} 1 if event1 started after event2; -1 if event2 started after event1 and 0 if they started at the exact same time.
     */
	public static compare(event1 : EventCal, event2 : EventCal) {
		if (moment(event1.getStart()).isBefore(event2.getStart())) {
			return -1;
		} else if (moment(event1.getStart()).isAfter(event2.getStart())) {
			return 1;
		} else {
			return 0;
		}
	}

	/**
	 * Return all VEvents containing in an ICS
	 *
	 * @method getAllVEvents
	 * @param data Data containing in an ICS
	 * @returns {ICAL.Component[]} An of ICAL.Component (see http://mozilla-comm.github.io/ical.js/api/ICAL.Component.html)
	 */
	public static getAllVEvents(data : String) : Array<any> {
		var jCalData = ICAL.parse(data);

		var comp = new ICAL.Component(jCalData);

		// Fetch the VEVENT part
		var vevents = comp.getAllSubcomponents('vevent');

		return vevents;
	}

	/**
	 * Return all occurences of a reccurring event in the range given by two dates: this method will return each events which overlaps the given time range.
	 * Then if an event start at 8 and finish at 10, ranges 7-11, 7-9, 9-11 or 9-9:30 will all return the event.
	 * This method throws error if the given event is not reccuring or if the recursion has not limit and no dateEnd is given.
	 *
	 * @param reccuringVevent An ICS event on the form of a ICAL.Component
	 * @param dateStart The date to start the range as a JSDate
	 * @param dateEnd The date to end the range as a JSDate. This argument is optionnal if the event has a limit of occurrences.
	 * @returns {EventCal[]} An array of EventCal
     */
	public static getEventsOfARecurringEventInARange(reccuringVevent : any, dateStart : any, dateEnd : any = null) : Array<EventCal> {
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
				var occurenceDetails = reccuringEvent.getOccurrenceDetails(timeOccurence);
				var startDate =  occurenceDetails.startDate.toJSDate();
				var endDate = occurenceDetails.endDate.toJSDate();

				if ((dateEnd == null && momentTimeOcc.isAfter(dateStart)) || moment(startDate).isBetween(dateStart, dateEnd) || moment(endDate).isBetween(dateStart, dateEnd) || moment(dateStart).isBetween(startDate, endDate) || moment(dateEnd).isBetween(startDate, endDate)) {
					var uid = reccuringEvent.uid+"_"+occNumber;
					var eventCal : EventCal = new EventCal(uid);
					eventCal.setName(reccuringEvent.summary);

					if (reccuringEvent.description) {
						eventCal.setDescription(reccuringEvent.description);
					}

					if (reccuringEvent.location) {
						eventCal.setLocation(reccuringEvent.location);
					}

					eventCal.setStart(occurenceDetails.startDate.toJSDate());
					eventCal.setEnd(occurenceDetails.endDate.toJSDate());
					results.push(eventCal);
				} else if (dateEnd !== null && momentTimeOcc.isAfter(dateEnd)) {
					break;
				}

				occNumber++;
			}
		}

		return results;
	}

	/**
	 * Retrieve all events of an ICS containing in the date range given by dateStart and dateEnd.
	 * As for (@see getEventsOfARecurringEventInARange) this method retrieves all events which overlaps the date range:
	 * if an event start at 8 and finish at 10, ranges 7-11, 7-9, 9-11 or 9-9:30 will all return the event.
	 * @param data A string representing an ICS
	 * @param dateStart the date (dateJS) to start the date range
	 * @param dateEnd the date (dateJS) to end the date range
	 * @returns {EventCal[]} An array of EventCal
     */
	public static getEventsOfACalendarInARange(data : String, dateStart : any, dateEnd : any) : Array<EventCal> {
		var allEvents : Array<any> = ICalParsing.getAllVEvents(data);

		if (moment(dateStart).isAfter(dateEnd)) {
			throw new Error("The given dateStart argument is after dateEnd : "+dateStart+ " > "+dateEnd);
		}

		var result : Array<EventCal> = [];
		for (var i = 0; i < allEvents.length; i++) {
			var event = allEvents[i];
			var icalEvent = new ICAL.Event(event);

			if (icalEvent.isRecurring()) {
				var recurEvents = ICalParsing.getEventsOfARecurringEventInARange(event, dateStart, dateEnd);

				recurEvents.forEach(function (eventCal) {
					result.push(eventCal);
				});
			} else {
				var startDate = icalEvent.startDate.toJSDate();
				var endDate = icalEvent.endDate.toJSDate();

				if (moment(startDate).isBetween(dateStart, dateEnd) || moment(endDate).isBetween(dateStart, dateEnd) || moment(dateStart).isBetween(startDate, endDate) || moment(dateEnd).isBetween(startDate, endDate)) {
					var eventCal = ICalParsing.createEventCalFromVEvent(event);
					result.push(eventCal);
				}
			}
		}

		return result.sort(ICalParsing.compare);
	}

	public static createEventCalFromVEvent(vevent : any) : EventCal {
		var event : any = new ICAL.Event(vevent);

		var eventCal : EventCal = new EventCal(event.uid);
		eventCal.setName(event.summary);

		if (event.description) {
			eventCal.setDescription(event.description);
		}

		if (event.location) {
			eventCal.setLocation(event.location);
		}

		eventCal.setStart(event.startDate.toJSDate());
		eventCal.setEnd(event.endDate.toJSDate());

		return eventCal;
	}

}