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

            var consideredVEvent = searchVeventById(idEvent);

            var computedEvent = ICalParsing.createEventCalFromVEvent(consideredVEvent);
            assert.deepEqual(computedEvent, expectedEvent);
        });
    });

    describe('getEventsOfARecurringEventInARange', function () {
        it('should return the occurence in the range (here only 1 occurence)', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("29/06/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("30/06/2016 00:00:00","DD/MM/YYYY HH:mm:ss");

            var icalEvents : Array<EventCal> = ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

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
            assert.throws(() => {ICalParsing.getEventsOfARecurringEventInARange(falseReccurringVEvent, startTime.toDate())}, Error);
        });

        it('should return the occurence in the range (here 4 occurences)', function () {
            var idEvent = "4kniaf0minfuvqgo6fnh0b0t1s@google.com"; // Loyer
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("15/09/2016 00:00:00","DD/MM/YYYY HH:mm:ss"); // 15/09/2016 00:00:00
            var endTime = moment("04/01/2017 00:00:00","DD/MM/YYYY HH:mm:ss"); // 04/01/2017 00:00:00

            var icalEvents : Array<EventCal> = ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

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

            var icalEvents : Array<EventCal> = ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

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

            assert.throws(() => { ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate())}, Error);
        });

        it('should return an empty array if the begin date is after the last occurence', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("29/10/2016 00:00:00","DD/MM/YYYY HH:mm:ss");

            var icalEvents : Array<EventCal> = ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate());

            assert.equal(icalEvents.length, 0);
        });

        it('should return an empty array if there is no occurence in the given range', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("29/10/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("29/10/2016 01:00:00","DD/MM/YYYY HH:mm:ss");

            var icalEvents : Array<EventCal> = ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

            assert.equal(icalEvents.length, 0);
        });

        it('should throws an exception if endDate is before startDate', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !
            var recurringVevent = searchVeventById(idEvent);

            var endTime = moment("29/10/2016 00:00:00","DD/MM/YYYY HH:mm:ss");
            var startTime = moment("29/10/2016 01:00:00","DD/MM/YYYY HH:mm:ss");

            assert.throws(() => { ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate())}, Error);
        });

        it('should return an occurence if the event started before the range but ended during the range', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("29/06/2016 19:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("29/06/2016 21:00:00","DD/MM/YYYY HH:mm:ss");

            var icalEvents : Array<EventCal> = ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

            assert.equal(icalEvents.length, 1);

            var eventCal = icalEvents[0];

            var expectedStartMoment = moment("29/06/2016 18:00:00","DD/MM/YYYY HH:mm:ss"); // 29/06/2016 18:00:00
            var expectedEndMoment = moment("29/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss"); // 29/06/2016 20:00:00

            assert.deepEqual(eventCal.getStart(), expectedStartMoment.toDate());
            assert.deepEqual(eventCal.getEnd(), expectedEndMoment.toDate());
        });

        it('should return an occurence if the event started during the range but ended after the range', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("29/06/2016 17:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("29/06/2016 19:00:00","DD/MM/YYYY HH:mm:ss");

            var icalEvents : Array<EventCal> = ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

            assert.equal(icalEvents.length, 1);

            var eventCal = icalEvents[0];

            var expectedStartMoment = moment("29/06/2016 18:00:00","DD/MM/YYYY HH:mm:ss"); // 29/06/2016 18:00:00
            var expectedEndMoment = moment("29/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss"); // 29/06/2016 20:00:00

            assert.deepEqual(eventCal.getStart(), expectedStartMoment.toDate());
            assert.deepEqual(eventCal.getEnd(), expectedEndMoment.toDate());
        });

        it('should return an occurence if the event started before the range and ended after the range', function () {
            var idEvent = "g35n1rar4ncpsdbu5b2mn0hgfo@google.com"; // Apéro !
            var recurringVevent = searchVeventById(idEvent);

            var startTime = moment("29/06/2016 19:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("29/06/2016 19:30:00","DD/MM/YYYY HH:mm:ss");

            var icalEvents : Array<EventCal> = ICalParsing.getEventsOfARecurringEventInARange(recurringVevent, startTime.toDate(), endTime.toDate());

            assert.equal(icalEvents.length, 1);

            var eventCal = icalEvents[0];

            var expectedStartMoment = moment("29/06/2016 18:00:00","DD/MM/YYYY HH:mm:ss"); // 29/06/2016 18:00:00
            var expectedEndMoment = moment("29/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss"); // 29/06/2016 20:00:00

            assert.deepEqual(eventCal.getStart(), expectedStartMoment.toDate());
            assert.deepEqual(eventCal.getEnd(), expectedEndMoment.toDate());
        });
    });

    describe('compare', function () {
        it('should return 1 if the first event start after the second one', function () {

            var event1start = moment("27/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss");

            var event1 = new EventCal();
            event1.setName("toto");
            event1.setDescription("toto");
            event1.setStart(event1start.toDate());
            event1.setEnd(event1start.clone().add(7, 'h').toDate());

            var event2start = event1start.clone().subtract(2, 'h');

            var event2 = new EventCal();
            event2.setName("toto");
            event2.setDescription("toto");
            event2.setStart(event2start.toDate());
            event2.setEnd(event2start.clone().add(10, 'h').toDate());

            assert.equal(ICalParsing.compare(event1, event2), 1);
        });

        it('should return -1 if the first event start before the second one', function () {

            var event1start = moment("27/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss");

            var event1 = new EventCal();
            event1.setName("toto");
            event1.setDescription("toto");
            event1.setStart(event1start.toDate());
            event1.setEnd(event1start.clone().add(7, 'h').toDate());

            var event2start = event1start.clone().subtract(2, 'h');

            var event2 = new EventCal();
            event2.setName("tata");
            event2.setDescription("toto");
            event2.setStart(event2start.toDate());
            event2.setEnd(event2start.clone().add(10, 'h').toDate());

            assert.equal(ICalParsing.compare(event2, event1), -1);
        });

        it('should return 0 if the first event start at the same as than the second one', function () {

            var event1start = moment("27/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss");

            var event1 = new EventCal();
            event1.setName("toto");
            event1.setDescription("toto");
            event1.setStart(event1start.toDate());
            event1.setEnd(event1start.clone().add(7, 'h').toDate());

            var event2start = event1start.clone();

            var event2 = new EventCal();
            event2.setName("tata");
            event2.setDescription("toto");
            event2.setStart(event2start.toDate());
            event2.setEnd(event2start.clone().add(10, 'h').toDate());

            assert.equal(ICalParsing.compare(event2, event1), 0);
            assert.equal(ICalParsing.compare(event1, event2), 0);
        })
    });

    describe('getEventsOfACalendarInARange', function () {
        it('should return an empty array if there is no events in the given range', function () {
            var startMoment = moment("01/02/2016 03:00:00","DD/MM/YYYY HH:mm:ss");
            var endMoment = moment("02/02/2016 03:00:00","DD/MM/YYYY HH:mm:ss");

            var events = ICalParsing.getEventsOfACalendarInARange(agendaContent, startMoment.toDate(), endMoment.toDate());

            assert.equal(events.length, 0);
        });

        it('should throw an exception if the end date of the range is before the start date', function () {
            var startMoment = moment("01/02/2016 03:00:00","DD/MM/YYYY HH:mm:ss");
            var endMoment = moment("02/02/2016 03:00:00","DD/MM/YYYY HH:mm:ss");

            assert.throws(() => { ICalParsing.getEventsOfACalendarInARange(agendaContent, endMoment.toDate(), startMoment.toDate()) }, Error);
        });

        it('should return the events of the range in the right order (scenario without recurring events and with all events between range)', function () {
            var startTime = moment("29/06/2016 07:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("29/06/2016 15:00:00","DD/MM/YYYY HH:mm:ss");

            var event0 = new EventCal();
            event0.setId("g5fvv131625e7olclgefbm79t0@google.com");
            event0.setName("Remise de gueule de bois");
            event0.setStart(moment("29/06/2016 08:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event0.setEnd(moment("29/06/2016 12:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event1 = new EventCal();
            event1.setId("59chc311898qf0o8njm2baqqps@google.com");
            event1.setName("Petit dej");
            event1.setStart(moment("29/06/2016 09:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event1.setEnd(moment("29/06/2016 10:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event2 = new EventCal();
            event2.setId("pcnorj276h9pvngd0iiclmgjn0@google.com");
            event2.setName("Pétanque");
            event2.setStart(moment("29/06/2016 09:30:00","DD/MM/YYYY HH:mm:ss").toDate());
            event2.setEnd(moment("29/06/2016 14:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var expected = [event0, event1, event2];

            var events : Array<EventCal> = ICalParsing.getEventsOfACalendarInARange(agendaContent, startTime.toDate(), endTime.toDate());

            assert.deepEqual(events, expected);
        });

        it('should return the events of the range in the right order (scenario without recurring events and with some events starting before the range and some ending after and some starting and ending out of the range)', function () {
            var startTime = moment("29/06/2016 09:20:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("29/06/2016 10:40:00","DD/MM/YYYY HH:mm:ss");

            var event0 = new EventCal();
            event0.setId("g5fvv131625e7olclgefbm79t0@google.com");
            event0.setName("Remise de gueule de bois");
            event0.setStart(moment("29/06/2016 08:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event0.setEnd(moment("29/06/2016 12:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event1 = new EventCal();
            event1.setId("59chc311898qf0o8njm2baqqps@google.com");
            event1.setName("Petit dej");
            event1.setStart(moment("29/06/2016 09:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event1.setEnd(moment("29/06/2016 10:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event2 = new EventCal();
            event2.setId("pcnorj276h9pvngd0iiclmgjn0@google.com");
            event2.setName("Pétanque");
            event2.setStart(moment("29/06/2016 09:30:00","DD/MM/YYYY HH:mm:ss").toDate());
            event2.setEnd(moment("29/06/2016 14:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var expected = [event0, event1, event2];

            var events : Array<EventCal> = ICalParsing.getEventsOfACalendarInARange(agendaContent, startTime.toDate(), endTime.toDate());

            assert.deepEqual(events, expected);
        });

        it('should return the events of the range in the right order (scenario with one occurence of a reccurring event)', function () {
            var startTime = moment("28/06/2016 19:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("29/06/2016 10:00:00","DD/MM/YYYY HH:mm:ss");

            var event0 = new EventCal();
            event0.setId("g35n1rar4ncpsdbu5b2mn0hgfo@google.com_1");
            event0.setName("Apéro !");
            event0.setStart(moment("28/06/2016 18:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event0.setEnd(moment("28/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event1 = new EventCal();
            event1.setId("jk59ph9kalsc9q5rn0b6gvun28@google.com");
            event1.setName("Fiesta @Lille");
            event1.setDescription("Soirée d'anniversaire de Jue à Lille \\o/");
            event1.setLocation("Lille\, France");
            event1.setStart(moment("28/06/2016 19:30:00","DD/MM/YYYY HH:mm:ss").toDate());
            event1.setEnd(moment("29/06/2016 03:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event2 = new EventCal();
            event2.setId("g5fvv131625e7olclgefbm79t0@google.com");
            event2.setName("Remise de gueule de bois");
            event2.setStart(moment("29/06/2016 08:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event2.setEnd(moment("29/06/2016 12:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event3 = new EventCal();
            event3.setId("59chc311898qf0o8njm2baqqps@google.com");
            event3.setName("Petit dej");
            event3.setStart(moment("29/06/2016 09:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event3.setEnd(moment("29/06/2016 10:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event4 = new EventCal();
            event4.setId("pcnorj276h9pvngd0iiclmgjn0@google.com");
            event4.setName("Pétanque");
            event4.setStart(moment("29/06/2016 09:30:00","DD/MM/YYYY HH:mm:ss").toDate());
            event4.setEnd(moment("29/06/2016 14:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var expected = [event0, event1, event2, event3, event4];

            var events : Array<EventCal> = ICalParsing.getEventsOfACalendarInARange(agendaContent, startTime.toDate(), endTime.toDate());
            assert.equal(events.length, 5);
            assert.deepEqual(events, expected);
        });

        it('should return the events of the range in the right order (scenario with multiple occurences of reccurring events)', function () {
            var startTime = moment("28/06/2016 19:00:00","DD/MM/YYYY HH:mm:ss");
            var endTime = moment("01/01/2017 10:00:00","DD/MM/YYYY HH:mm:ss");

            var event0 = new EventCal();
            event0.setId("g35n1rar4ncpsdbu5b2mn0hgfo@google.com_1");
            event0.setName("Apéro !");
            event0.setStart(moment("28/06/2016 18:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event0.setEnd(moment("28/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event1 = new EventCal();
            event1.setId("jk59ph9kalsc9q5rn0b6gvun28@google.com");
            event1.setName("Fiesta @Lille");
            event1.setDescription("Soirée d'anniversaire de Jue à Lille \\o/");
            event1.setLocation("Lille\, France");
            event1.setStart(moment("28/06/2016 19:30:00","DD/MM/YYYY HH:mm:ss").toDate());
            event1.setEnd(moment("29/06/2016 03:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event2 = new EventCal();
            event2.setId("g5fvv131625e7olclgefbm79t0@google.com");
            event2.setName("Remise de gueule de bois");
            event2.setStart(moment("29/06/2016 08:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event2.setEnd(moment("29/06/2016 12:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event3 = new EventCal();
            event3.setId("59chc311898qf0o8njm2baqqps@google.com");
            event3.setName("Petit dej");
            event3.setStart(moment("29/06/2016 09:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event3.setEnd(moment("29/06/2016 10:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event4 = new EventCal();
            event4.setId("pcnorj276h9pvngd0iiclmgjn0@google.com");
            event4.setName("Pétanque");
            event4.setStart(moment("29/06/2016 09:30:00","DD/MM/YYYY HH:mm:ss").toDate());
            event4.setEnd(moment("29/06/2016 14:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event5 = new EventCal();
            event5.setId("g35n1rar4ncpsdbu5b2mn0hgfo@google.com_2");
            event5.setName("Apéro !");
            event5.setStart(moment("29/06/2016 18:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event5.setEnd(moment("29/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event6 = new EventCal();
            event6.setId("g35n1rar4ncpsdbu5b2mn0hgfo@google.com_3");
            event6.setName("Apéro !");
            event6.setStart(moment("30/06/2016 18:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event6.setEnd(moment("30/06/2016 20:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event7 = new EventCal();
            event7.setId("4kniaf0minfuvqgo6fnh0b0t1s@google.com_0");
            event7.setName("Loyer");
            event7.setStart(moment("01/07/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event7.setEnd(moment("02/07/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event8 = new EventCal();
            event8.setId("g35n1rar4ncpsdbu5b2mn0hgfo@google.com_4");
            event8.setName("Apéro !");
            event8.setStart(moment("01/07/2016 18:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event8.setEnd(moment("01/07/2016 20:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event9 = new EventCal();
            event9.setId("g35n1rar4ncpsdbu5b2mn0hgfo@google.com_5");
            event9.setName("Apéro !");
            event9.setStart(moment("02/07/2016 18:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event9.setEnd(moment("02/07/2016 20:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event10 = new EventCal();
            event10.setId("g35n1rar4ncpsdbu5b2mn0hgfo@google.com_6");
            event10.setName("Apéro !");
            event10.setStart(moment("03/07/2016 18:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event10.setEnd(moment("03/07/2016 20:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event11 = new EventCal();
            event11.setId("l4ml42vrjpaoloigl2fvu45q74@google.com_0");
            event11.setName("Anniversaire Simon");
            event11.setStart(moment("04/07/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event11.setEnd(moment("05/07/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event12 = new EventCal();
            event12.setId("4kniaf0minfuvqgo6fnh0b0t1s@google.com_1");
            event12.setName("Loyer");
            event12.setStart(moment("01/08/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event12.setEnd(moment("02/08/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event13 = new EventCal();
            event13.setId("4kniaf0minfuvqgo6fnh0b0t1s@google.com_2");
            event13.setName("Loyer");
            event13.setStart(moment("01/09/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event13.setEnd(moment("02/09/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event14 = new EventCal();
            event14.setId("4kniaf0minfuvqgo6fnh0b0t1s@google.com_3");
            event14.setName("Loyer");
            event14.setStart(moment("01/10/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event14.setEnd(moment("02/10/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event15 = new EventCal();
            event15.setId("4kniaf0minfuvqgo6fnh0b0t1s@google.com_4");
            event15.setName("Loyer");
            event15.setStart(moment("01/11/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event15.setEnd(moment("02/11/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event16 = new EventCal();
            event16.setId("4kniaf0minfuvqgo6fnh0b0t1s@google.com_5");
            event16.setName("Loyer");
            event16.setStart(moment("01/12/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event16.setEnd(moment("02/12/2016 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var event17 = new EventCal();
            event17.setId("4kniaf0minfuvqgo6fnh0b0t1s@google.com_6");
            event17.setName("Loyer");
            event17.setStart(moment("01/01/2017 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());
            event17.setEnd(moment("02/01/2017 00:00:00","DD/MM/YYYY HH:mm:ss").toDate());

            var expected = [event0, event1, event2, event3, event4, event5, event6, event7, event8, event9, event10, event11, event12, event13, event14, event15, event16, event17];

            var events : Array<EventCal> = ICalParsing.getEventsOfACalendarInARange(agendaContent, startTime.toDate(), endTime.toDate());
            assert.equal(events.length, 18);
            assert.deepEqual(events, expected);
        });
    })
});