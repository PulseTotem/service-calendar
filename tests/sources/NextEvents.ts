/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */

/// <reference path="../../t6s-core/core-backend/t6s-core/core/libsdef/mocha.d.ts" />
/// <reference path="../../t6s-core/core-backend/libsdef/sinon.d.ts" />

/// <reference path="../../scripts/sources/NextEvents.ts" />

var assert = require("assert");
var sinon : SinonStatic = require("sinon");

describe('NextEvent', function() {
	var sandbox;
	beforeEach(function () {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('#constructor', function () {
		it('should not launch run if the parameter Limit is missing', function () {
			var mockAlbum = sandbox.mock(NextEvents.prototype);
			mockAlbum.expects('run').never();

			var params = { URL: 'Toto', InfoDuration: '10', Name: 'bidule', EndDate: '1460384994160'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new NextEvents(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter URL is missing', function () {
			var mockAlbum = sandbox.mock(NextEvents.prototype);
			mockAlbum.expects('run').never();

			var params = { Limit: '12', InfoDuration: '10', Name: 'bidule', EndDate: '1460384994160'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new NextEvents(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter InfoDuration is missing', function () {
			var mockAlbum = sandbox.mock(NextEvents.prototype);
			mockAlbum.expects('run').never();

			var params = { URL: 'Toto', Limit: '10', Name: 'bidule', EndDate: '1460384994160'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new NextEvents(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter Name is missing', function () {
			var mockAlbum = sandbox.mock(NextEvents.prototype);
			mockAlbum.expects('run').never();

			var params = { URL: 'Toto', Limit: '10', InfoDuration: '12', EndDate: '1460384994160'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new NextEvents(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter EndDate is missing', function () {
			var mockAlbum = sandbox.mock(NextEvents.prototype);
			mockAlbum.expects('run').never();

			var params = { URL: 'Toto', Limit: '10', InfoDuration: '12', Name: 'bidule'};

			var stubNSManager : any = sinon.createStubInstance(CalendarNamespaceManager);
			new NextEvents(params, stubNSManager);
			mockAlbum.verify();
		});
	});
});