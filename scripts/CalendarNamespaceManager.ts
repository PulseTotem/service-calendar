/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */

/// <reference path="../t6s-core/core-backend/scripts/server/SourceNamespaceManager.ts" />
/// <reference path="./sources/NextEvents.ts" />
/// <reference path="./sources/CurrentEvents.ts" />
/// <reference path="./sources/EventsForNextYHours.ts" />

class CalendarNamespaceManager extends SourceNamespaceManager {

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {any} socket - The socket.
	 */
	constructor(socket : any) {
		super(socket);

		this.addListenerToSocket("NextEvents", function (params, calendarNamespaceManager) { new NextEvents(params, calendarNamespaceManager); });
		this.addListenerToSocket("CurrentEvents", function (params, calendarNamespaceManager) { new CurrentEvents(params, calendarNamespaceManager); });
		this.addListenerToSocket("EventsForNextYHours", function (params, calendarNamespaceManager) { new EventsForNextYHours(params, calendarNamespaceManager); });
	}
}