/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */

/// <reference path="../t6s-core/core-backend/scripts/server/SourceServer.ts" />
/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="./CalendarNamespaceManager.ts" />


/**
 * Represents the The 6th Screen Calendar Service.
 *
 * @class Calendar
 * @extends SourceServer
 */
class Calendar extends SourceServer {

	/**
	 * Constructor.
	 *
	 * @param {number} listeningPort - Server's listening port..
	 * @param {Array<string>} arguments - Server's command line arguments.
	 */
	constructor(listeningPort : number, arguments : Array<string>) {
		super(listeningPort, arguments);

		this.init();
	}

	/**
	 * Method to init the Notifier server.
	 *
	 * @method init
	 */
	init() {
		var self = this;

		this.addNamespace("Calendar", CalendarNamespaceManager);
	}
}

/**
 * Server's Calendar listening port.
 *
 * @property _CalendarListeningPort
 * @type number
 * @private
 */
var _CalendarListeningPort : number = process.env.PORT || 6014;

/**
 * Server's Calendar command line arguments.
 *
 * @property _CalendarArguments
 * @type Array<string>
 * @private
 */
var _CalendarArguments : Array<string> = process.argv;

var serverInstance = new Calendar(_CalendarListeningPort, _CalendarArguments);
serverInstance.run();