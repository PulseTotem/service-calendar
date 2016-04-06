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

            var allEvents = ICalParsing.getAllVEvents(agendaContent);

            var consideredVEvent = null;
            for (var i = 0; i < allEvents.length; i++) {
                var vevent = allEvents[i];
                var event =  new ICAL.Event(vevent);
                if (event.uid == idEvent) {
                    consideredVEvent = vevent;
                }
            }

            var computedEvent = ICalParsing.createEventCalFromVEvent(consideredVEvent);
            assert.deepEqual(computedEvent, expectedEvent);
        })
    })
});