/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */

/// <reference path="../../t6s-core/core-backend/t6s-core/core/libsdef/mocha.d.ts" />
/// <reference path="../../t6s-core/core-backend/libsdef/sinon.d.ts" />

/// <reference path="../../scripts/sources/EventsForNextYHours.ts" />

var assert = require("assert");
var sinon : SinonStatic = require("sinon");

describe('EventsForNextYHours', function() {
	var sandbox;
	beforeEach(function () {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('#constructor', function () {
		it('should not launch run if the parameter Limit is missing', function () {
			var mockAlbum = sandbox.mock(EventsForNextYHours.prototype);
			mockAlbum.expects('run').never();

			var params = { URL: 'Toto', InfoDuration: '10', Name: 'bidule', TimeWindow: '2'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new EventsForNextYHours(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter URL is missing', function () {
			var mockAlbum = sandbox.mock(EventsForNextYHours.prototype);
			mockAlbum.expects('run').never();

			var params = { Limit: '12', InfoDuration: '10', Name: 'bidule', TimeWindow: '2'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new EventsForNextYHours(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter InfoDuration is missing', function () {
			var mockAlbum = sandbox.mock(EventsForNextYHours.prototype);
			mockAlbum.expects('run').never();

			var params = { URL: 'Toto', Limit: '10', Name: 'bidule', TimeWindow: '2'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new EventsForNextYHours(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter Name is missing', function () {
			var mockAlbum = sandbox.mock(EventsForNextYHours.prototype);
			mockAlbum.expects('run').never();

			var params = { URL: 'Toto', Limit: '10', InfoDuration: '20', TimeWindow: '2'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new EventsForNextYHours(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter TimeWindow is missing', function () {
			var mockAlbum = sandbox.mock(EventsForNextYHours.prototype);
			mockAlbum.expects('run').never();

			var params = { URL: 'Toto', Limit: '10', InfoDuration: '20', Name: 'Bidule'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new EventsForNextYHours(params, stubNSManager);
			mockAlbum.verify();
		});
	});
});