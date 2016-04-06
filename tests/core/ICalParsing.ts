/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */

/// <reference path="../../t6s-core/core-backend/t6s-core/core/libsdef/mocha.d.ts" />
/// <reference path="../../t6s-core/core-backend/libsdef/sinon.d.ts" />
/// <reference path="../../scripts/core/ICalParsing.ts" />

var fs = require('fs');
var moment = require('moment');

describe('ICalParsing', function() {

    var agendaContent;

    var searchVeventById = function (id) {
        var allEvents = ICalParsing.getAllVEvents(agendaContent);

        for (var i = 0; i < allEvents.length; i++) {
            var vevent = allEvents[i];
            var event =  new ICAL.Event(vevent);
            if (event.uid == id) {
                return vevent;
            }
        }
        return null;
    };

    before(function () {
        agendaContent = fs.readFileSync("./tests-resources/Agenda-test.ics",{encoding: 'utf-8'});
    });

    describe('getAllVEvents', function () {
        it('returns seven events contained in the calendar', function () {
            var datas = ICalParsing.getAllVEvents(agendaContent);

            assert.equal(datas.length, 7);
        });
    });

    describe('createEventCalFromVEvent', function () {
        it('should create the right object given ICS properties', function () {
            var idEvent = "jk59ph9kalsc9q5rn0b6gvun28@google.com";
            var expectedEvent : EventCal = new EventCal(idEvent);
            expectedEvent.setName("Fiesta @Lille");
            expectedEvent.setDescription("Soirée d'anniversaire de Jue à Lille \\o/");
            expectedEvent.setLocation("Lille, France");

            var startDate = moment("20160628193000","YYYYMMDDHHmmss");
            var endDate = moment("20160629030000","YYYYMMDDHHmmss");

            expectedEvent.setStart(startDate.toDate());
            expectedEvent.setEnd(endDate.toDate());
            expectedEvent.setObsoleteDate(endDate.toDate());

            var consideredVEvent = searchVeventById(idEvent);

            var computedEvent = ICalParsing.createEventCalFromVEvent(consideredVEvent);
            assert.deepEqual(computedEvent, expectedEvent);
        });
    });

    describe('getStartDateFromVEvent', function () {
        it('should return a moment object corresponding to the date of the given vevent', function () {
            var idEvent = "jk59ph9kalsc9q5rn0b6gvun28@google.com";

            var vevent = searchVeventById(idEvent);

            var expectedMoment = moment("20160628193000","YYYYMMDDHHmmss");
            assert.equal(ICalParsing.getStartDateFromVEvent(vevent).unix(), expectedMoment.unix());
        });
    });

    describe('getEndDateFromVEvent', function () {
        it('should return a moment object corresponding to the date of the given vevent', function () {
            var idEvent = "jk59ph9kalsc9q5rn0b6gvun28@google.com";

            var vevent = searchVeventById(idEvent);

            var expectedMoment = moment("20160629030000","YYYYMMDDHHmmss");
            assert.deepEqual(ICalParsing.getEndDateFromVEvent(vevent).unix(), expectedMoment.unix());
        });
    })
});