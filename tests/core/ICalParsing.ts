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
            var idEvent = "jk59ph9kalsc9q5rn0b6gvun28@google.com"; // Fiesta @Lille

            var vevent = searchVeventById(idEvent);

            var expectedMoment = moment("20160628193000","YYYYMMDDHHmmss");
            assert.equal(ICalParsing.getStartDateFromVEvent(vevent).unix(), expectedMoment.unix());
        });

        it('should return a moment object corresponding to the date of the first event in case of recurring vevent', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !

            var vevent = searchVeventById(idEvent);

            var expectedMoment = moment("20160627180000","YYYYMMDDHHmmss");
            assert.equal(ICalParsing.getStartDateFromVEvent(vevent).unix(), expectedMoment.unix());
        });
    });

    describe('getEndDateFromVEvent', function () {
        it('should return a moment object corresponding to the date of the given vevent', function () {
            var idEvent = "jk59ph9kalsc9q5rn0b6gvun28@google.com";

            var vevent = searchVeventById(idEvent);

            var expectedMoment = moment("29/06/2016 03:00:00","DD/MM/YYYY HH:mm:ss");
            assert.deepEqual(ICalParsing.getEndDateFromVEvent(vevent).unix(), expectedMoment.unix());
        });

        it('should return a moment object corresponding to the date of the first event in case of recurring vevent', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !

            var vevent = searchVeventById(idEvent);

            var expectedMoment = moment("27/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss");
            assert.equal(ICalParsing.getEndDateFromVEvent(vevent).unix(), expectedMoment.unix());
        });
    });

    describe('getNextVEventsOfARecurringEventInARange', function () {
        it('should return the occurence in the range (here only 1 occurence)', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("29/06/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("30/06/2016 00:00:00","DD/MM/YYYY HH:mm:ss");

            var icalEvents : Array<EventCal> = ICalParsing.getNextVEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

            assert.equal(icalEvents.length, 1);

            var eventCal = icalEvents[0];

            var expectedStartMoment = moment("29/06/2016 18:00:00","DD/MM/YYYY HH:mm:ss"); // 29/06/2016 18:00:00
            var expectedEndMoment = moment("29/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss"); // 29/06/2016 20:00:00

            assert.deepEqual(eventCal.getStart(), expectedStartMoment.toDate());
            assert.deepEqual(eventCal.getEnd(), expectedEndMoment.toDate());
        });

        it('should throws an exception if the given event is not reccuring', function () {
           var idEvent = "pcnorj276h9pvngd0iiclmgjn0@google.com";

            var falseReccurringVEvent = searchVeventById(idEvent);
            var startTime = moment("29/06/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            assert.throws(() => {ICalParsing.getNextVEventsOfARecurringEventInARange(falseReccurringVEvent, startTime.toDate())}, Error);
        });

        it('should return the occurence in the range (here 4 occurences)', function () {
            var idEvent = "4kniaf0minfuvqgo6fnh0b0t1s@google.com"; // Loyer
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("15/09/2016 00:00:00","DD/MM/YYYY HH:mm:ss"); // 15/09/2016 00:00:00
            var endTime = moment("04/01/2017 00:00:00","DD/MM/YYYY HH:mm:ss"); // 04/01/2017 00:00:00

            var icalEvents : Array<EventCal> = ICalParsing.getNextVEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

            assert.equal(icalEvents.length, 4);

            var vevent = icalEvents[0];

            var expectedStartMoment = moment("01/10/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            var expectedEndMoment = moment("02/10/2016 00:00:00","DD/MM/YYYY HH:mm:ss");

            assert.deepEqual(vevent.getStart(), expectedStartMoment.toDate(), "start date of first occurence should be 01/10/2016 at noon");
            assert.deepEqual(vevent.getEnd(), expectedEndMoment.toDate(), "end date of first occurence should be 02/10/2016 at noon");
            assert.equal(vevent.getName(), "Loyer", "summary of the event should be 'Loyer'");

            vevent = icalEvents[1];

            expectedStartMoment = moment("01/11/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            expectedEndMoment = moment("02/11/2016 00:00:00","DD/MM/YYYY HH:mm:ss");

            assert.deepEqual(vevent.getStart(), expectedStartMoment.toDate(), "start date of second occurence should be 01/11/2016 at noon");
            assert.deepEqual(vevent.getEnd(), expectedEndMoment.toDate(), "end date of second occurence should be 02/11/2016 at noon");
            assert.equal(vevent.getName(), "Loyer", "summary of the event should be 'Loyer'");

            vevent = icalEvents[2];

            expectedStartMoment = moment("01/12/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            expectedEndMoment = moment("02/12/2016 00:00:00","DD/MM/YYYY HH:mm:ss");

            assert.deepEqual(vevent.getStart(), expectedStartMoment.toDate(), "start date of third occurence should be 01/12/2016 at noon");
            assert.deepEqual(vevent.getEnd(), expectedEndMoment.toDate(), "end date of third occurence should be 02/12/2016 at noon");
            assert.equal(vevent.getName(), "Loyer", "summary of the event should be 'Loyer'");

            vevent = icalEvents[3];

            expectedStartMoment = moment("01/01/2017 00:00:00","DD/MM/YYYY HH:mm:ss");
            expectedEndMoment = moment("02/01/2017 00:00:00","DD/MM/YYYY HH:mm:ss");

            assert.deepEqual(vevent.getStart(), expectedStartMoment.toDate(), "start date of fourth occurence should be 01/01/2017 at noon");
            assert.deepEqual(vevent.getEnd(), expectedEndMoment.toDate(), "end date of fourth occurence should be 02/01/2016 at noon");
            assert.equal(vevent.getName(), "Loyer", "summary of the event should be 'Loyer'");
        });

        it('should return the occurences (here 2 occurences) in the range with no limit recurring events', function () {
            var idEvent = "l4ml42vrjpaoloigl2fvu45q74@google.com"; // Anniversaire Simon
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("15/05/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("04/09/2017 00:00:00","DD/MM/YYYY HH:mm:ss");

            var icalEvents : Array<EventCal> = ICalParsing.getNextVEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

            assert.equal(icalEvents.length, 2);

            var vevent = icalEvents[0];

            var expectedStartMoment = moment("04/07/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            var expectedEndMoment = moment("05/07/2016 00:00:00","DD/MM/YYYY HH:mm:ss");

            assert.deepEqual(vevent.getStart(), expectedStartMoment.toDate(), "start date of first occurence should be 01/10/2016 at noon");
            assert.deepEqual(vevent.getEnd(), expectedEndMoment.toDate(), "end date of first occurence should be 02/10/2016 at noon");
            assert.equal(vevent.getName(), "Anniversaire Simon", "summary of the event should be 'Loyer'");

            vevent = icalEvents[1];

            expectedStartMoment = moment("04/07/2017 00:00:00","DD/MM/YYYY HH:mm:ss");
            expectedEndMoment = moment("05/07/2017 00:00:00","DD/MM/YYYY HH:mm:ss");

            assert.deepEqual(vevent.getStart(), expectedStartMoment.toDate(), "start date of second occurence should be 01/11/2016 at noon");
            assert.deepEqual(vevent.getEnd(), expectedEndMoment.toDate(), "end date of second occurence should be 02/11/2016 at noon");
            assert.equal(vevent.getName(), "Anniversaire Simon", "summary of the event should be 'Loyer'");
        });

        it('should throws an error if used with a no limit reccuring events without an endDate', function () {
            var idEvent = "l4ml42vrjpaoloigl2fvu45q74@google.com"; // Anniversaire Simon
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("15/05/2016 00:00:00","DD/MM/YYYY HH:mm:ss");

            assert.throws(() => { ICalParsing.getNextVEventsOfARecurringEventInARange(recurringVevent, startTime.toDate())}, Error);
        })
    })


});