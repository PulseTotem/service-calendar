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
			var mockAlbum = sandbox.mock(Album.prototype);
			mockAlbum.expects('run').never();

			var params = { ApiKey: 'Toto', InfoDuration: '10'};

			var stubNSManager : any = sinon.createStubInstance(BeepeersNamespaceManager);
			new Album(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter InfoDuration is missing', function () {
			var mockAlbum = sandbox.mock(Album.prototype);
			mockAlbum.expects('run').never();

			var params = { Limit: '10', ApiKey: 'toto'};

			var stubNSManager : any = sinon.createStubInstance(BeepeersNamespaceManager);
			new Album(params, stubNSManager);
			mockAlbum.verify();
		});

		it('should not launch run if the parameter ApiKey is missing', function () {
			var mockAlbum = sandbox.mock(Album.prototype);
			mockAlbum.expects('run').never();

			var params = { Limit: '10', InfoDuration: '10'};

			var stubNSManager : any = sinon.createStubInstance(BeepeersNamespaceManager);
			new Album(params, stubNSManager);
			mockAlbum.verify();
		});
	});
});