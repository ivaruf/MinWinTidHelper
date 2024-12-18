// content.js

chrome.storage.sync.get(
    {
        startTime: '09:00',
        endTime: '16:35',
        dayLength: '07:35',
        music: false,
        manual: false,
        randomness : false
    },
    function(settings) {
        startTime = settings.startTime;
        endTime = settings.endTime;
        dayLength = settings.dayLength;
        music = settings.music;
        manual = settings.manual;
        randomness = settings.randomness;
    }
);

$(document).ready(async function() {

    var inputEvent = new Event('input', {
        bubbles: true,
        cancelable: true,
    });

    // helpers start
    async function waitAwhileAndListen(message = "laster") {
        while(true) {
            await new Promise(r => setTimeout(r, 1000));
            console.log(message)
            if (!$(".loader-overlay-main").is(":visible")) {
                break;
            }
        }
    }


    async function fillOut(skipAlert = false) {
        var dayIsEmpty = $("#registrations")[0].innerHTML.indexOf("Ingen registreringer denne dagen") > 0;
        if(!dayIsEmpty) {
            if(!skipAlert) {
                alert("Kan bare auto-fylle ut for en tom dag.");
            }
        } else {
            var fillButton = $(".auto-filler");
            var startTime = fillButton.attr("start-time");
            var endTime = fillButton.attr("end-time");
            var manual = fillButton.attr("manual");
            var randomness = fillButton.attr("randomness");

            if(randomness === "true") {
                var range = 30

                var minutes = Math.floor(Math.random() * range + 1);  // Allow half an hour shuffle.
                var shuffle = minutes * 60 * 1000
                shuffle *= Math.round(Math.random()) ? 1 : -1; // Randomly late or early from setpoint

                startTimes = startTime.split(":")
                endTimes = endTime.split(":")

                // Year , month and day does not matter, we only use this to add / subtract from hour/min
                var startDate = new Date(2011, 6, 15, startTimes[0], startTimes[1], 0, 0);
                var endDate = new Date(2011, 6, 15, endTimes[0], endTimes[1], 0, 0);

                var newStartDate = new Date(startDate - shuffle);
                var newEndDate = new Date(endDate - shuffle)

                var startTime = newStartDate.toTimeString().substr(0,5)
                var endTime = newEndDate.toTimeString().substr(0,5)
            }

            // TODO this is unsafe, find a better way to wait - could cause problems if the page is slow to load
            await new Promise(r => setTimeout(r, 1000));

            document.getElementById("addInOut").click();

            // We wait a bit to load the inn/out page
            await waitAwhileAndListen()

            var timeInputs = $("[data-cy='time-input']");

            if(timeInputs.length !== 2) {
                alert("Kan ikke auto-fylle for den dag som ikke er over.")
                return false;
            }

            var inntid = timeInputs[0];
            inntid.value = startTime;

            inntid.dispatchEvent(inputEvent);

            // wait some more
            await new Promise(r => setTimeout(r, 1000));

            var uttid = timeInputs[1];
            uttid.value = endTime
            uttid.dispatchEvent(inputEvent);

            //wait
            await new Promise(r => setTimeout(r, 1000));

            // Good to go, hit it!
            if(manual === "true") {
                document.getElementById("save-registrations-button").click();
            }
            else {
                document.getElementById("calculate-button").click();
            }
            return true;
        }
    }

    async function fillTrene() {
        document.getElementById("expand-absence").click();
        await new Promise(r => setTimeout(r, 1000));

        var absencelist = document.getElementById("absence-list")

        absencelist.click();

        await new Promise(r => setTimeout(r, 2000));

        var tbodyElements = $('[id^="vue-scroll-table"] tbody');


        for (var i = 0; i < tbodyElements.length; i++) {
            var tbody = tbodyElements[i];
            // Get the row (tr) within this tbody
            var row = tbody.querySelector('tr');
            // Check if the row exists (it should, but just in case)
            if (row) {
                // Get all cells (td) in the row
                var cells = row.querySelectorAll('td');
                // Iterate over the cells to find the target text
                for (var j = 0; j < cells.length; j++) {
                    var cell = cells[j];
                    if (cell.innerHTML.indexOf("Trening") > 0) {
                        cell.click()
                    }
                }
            }
        }

        await new Promise(r => setTimeout(r, 1000));

        let innTid = document.getElementById("createAbsence-hours-first");
        innTid.value = "11:00";
        let uttid = document.getElementById("createAbsence-hours-last");
        uttid.value = "12:00";

        innTid.dispatchEvent(inputEvent);
        uttid.dispatchEvent(inputEvent);

        await new Promise(r => setTimeout(r, 1000));

        document.getElementById("save-absence-form").click();
    }

    async function fillFlekse() {
        document.getElementById("expand-absence").click();
        await new Promise(r => setTimeout(r, 1000));

        var absencelist = document.getElementById("absence-list")

        absencelist.click();

        await new Promise(r => setTimeout(r, 2000));

        var tbodyElements = $('[id^="vue-scroll-table"] tbody');


        for (var i = 0; i < tbodyElements.length; i++) {
            var tbody = tbodyElements[i];
            // Get the row (tr) within this tbody
            var row = tbody.querySelector('tr');
            // Check if the row exists (it should, but just in case)
            if (row) {
                // Get all cells (td) in the row
                var cells = row.querySelectorAll('td');
                // Iterate over the cells to find the target text
                for (var j = 0; j < cells.length; j++) {
                    var cell = cells[j];
                    if (cell.innerHTML.indexOf("Avvikling fleks") > 0) {
                        cell.click()
                    }
                }
            }
        }

        await new Promise(r => setTimeout(r, 1000));

        document.getElementById("save-absence-form").click();
    }

    async function fillMonth() {
        const playMusic = $(".fyll-mnd").attr("music") === "true";
        if(playMusic) {
            $("#audio-player")[0].play();
        }


        $(".loader-overlay-main")[0].setAttribute("style", "display: block")


        var dayElements = $(".day-container").not(".day-outside-month");
        // loop dayElements
        var today = new Date();
        for(var i = 0; i < dayElements.length; i++) {

            var dayElement = dayElements[i];
            var correction = dayElement.getElementsByClassName("day-correction")

            // Skip if day has a correction (purple dot)
            if(correction.length > 0) {
                continue;
            }

            var dayTitle = dayElement.getAttribute("title").substr(0, 10);
            var [day, month, year] = dayTitle.split('.');
            var elementDate = new Date(+year, month - 1, +day);

            // Skip if we are in the future
            if(today <= elementDate) {
                continue;
            }

            dayElement.click();

            // this is unsafe ... might fill out saturdays etc if it is not loaded ...
            await new Promise(r => setTimeout(r, 1000));

            var dayIsEmpty = $("[data-cy='no-registrations-on-day']").length === 1;
            var dayIsWorkDay = $("#scheme_length_input_attendance")[0].value === dayLength




            if (dayIsWorkDay && dayIsEmpty) {
                console.log("Filling out!");
                var didFill = await fillOut(true);
                if(!didFill) {
                    break;
                }
                await waitAwhileAndListen("Beregner fremdeles ...");
            } else {
                console.log("Ikke arbeidsdag, eller finnes registrering for: " + day);
            }

        }

        $(".loader-overlay-main")[0].setAttribute("style", "display: none")
        if (playMusic) {
            $("#audio-player")[0].pause();
        }

    }

// Helper to get displayed month/year
    function getDisplayedMonthYear() {
        var caption = $(".month-table caption").text().trim();
        var monthsMap = {
            "Januar":0,"Februar":1,"Mars":2,"April":3,"Mai":4,"Juni":5,
            "Juli":6,"August":7,"September":8,"Oktober":9,"November":10,"Desember":11
        };
        var parts = caption.split(" ");
        var monthName = parts[0];
        var year = parseInt(parts[1],10);
        var monthIndex = monthsMap[monthName];
        return {year: year, monthIndex: monthIndex};
    }

    function getDaysInMonth(year, monthIndex) {
        return new Date(year, monthIndex+1, 0).getDate();
    }

// Approve a range of days in the current month
    async function approveDayRange(startDay, endDay) {
        var {year, monthIndex} = getDisplayedMonthYear();
        var daysInMonth = getDaysInMonth(year, monthIndex);
        if (endDay > daysInMonth) endDay = daysInMonth;

        var dayElements = $(".day-container").not(".day-outside-month");
        var dayMap = {};
        for (var i = 0; i < dayElements.length; i++) {
            var el = dayElements[i];
            var dayTitle = el.getAttribute("title").substr(0, 10);
            var [d,m,y] = dayTitle.split('.');
            var dayNum = parseInt(d,10);
            var thisYear = parseInt(y,10);
            var thisMonth = parseInt(m,10)-1;
            if (thisYear === year && thisMonth === monthIndex) {
                dayMap[dayNum] = el;
            }
        }

        for (var dayNum = startDay; dayNum <= endDay; dayNum++) {
            var el = dayMap[dayNum];
            if (!el) continue;
            el.click();
            await waitAwhileAndListen()

            var approveBtn = document.querySelector('[data-cy="btn-approve-day"]');
            if (approveBtn && !approveBtn.disabled) {
                approveBtn.click();
                await waitAwhileAndListen()

            } else {
                console.log("No approve button or already approved for day " + dayNum);
            }
        }
        console.log("Approved days " + startDay + " to " + endDay);
    }

    function getApprovalRanges() {
        var {year, monthIndex} = getDisplayedMonthYear();
        var firstOfMonth = new Date(year, monthIndex, 1);
        var weekdayOfFirst = firstOfMonth.getDay(); // 0=Sunday,1=Monday,...6=Saturday
        var daysInMonth = getDaysInMonth(year, monthIndex);

        // Find first Monday
        var firstMonday = 1 + ((1 - weekdayOfFirst + 7) % 7);
        if (firstMonday === 0) firstMonday = 7; // fallback, normally not needed

        let firstRangeStart, firstRangeEnd, secondRangeStart, secondRangeEnd;

        if (weekdayOfFirst === 0) {
            // Starts on Sunday
            // "Godkjenn første": days 1–15 (1 partial day (Sunday) + 2 full weeks)
            // "Godkjenn andre": days 16–end of month
            firstRangeStart = 1;
            firstRangeEnd = Math.min(15, daysInMonth);
            secondRangeStart = 16;
            secondRangeEnd = daysInMonth;

        } else {
            // Not Sunday start
            // "Godkjenn første": from day 1 to (firstMonday+13)
            // covers partial (if any) plus two full weeks starting from firstMonday
            firstRangeStart = 1;
            firstRangeEnd = Math.min(firstMonday+13, daysInMonth);

            // "Godkjenn andre": from (firstMonday+14) to end of month
            secondRangeStart = firstMonday+14;
            if (secondRangeStart > daysInMonth) {
                secondRangeStart = daysInMonth; // If we run out of days, no harm
            }
            secondRangeEnd = daysInMonth;
        }

        return {
            firstRange: [firstRangeStart, firstRangeEnd],
            secondRange: [secondRangeStart, secondRangeEnd]
        };
    }
    // ############## helpers end ##############

    await new Promise(r => setTimeout(r, 1000));
    if (typeof music !== 'undefined' && music === true) {
        var sound      = document.createElement('audio');
        sound.id       = 'audio-player';
        sound.controls = 'controls';
        sound.loop     = 'true';
        sound.src      = chrome.runtime.getURL("music/elevator.mp3");
        sound.type     = 'audio/mpeg';
        (document.head||document.documentElement).appendChild(sound);
    }

    $("#editing-day").
        append('<button style="margin-left:5px" title="Fyll ut dag med din vanlige arbeidstid" id="dagKnapp" class="auto-filler" start-time="'+startTime+'" end-time="'+endTime+'" manual="'+manual+'" randomness="'+randomness+'" type="button"> Fyll ut dag </button>').
        append('<button style="margin-left:5px" title="Trykk for å legge til trening" id="treneKnapp" class="auto-filler">Trene?</button>').
        append('<button style="margin-left:5px" title="Trykk for hel fleks dag" id="fleksKnapp" class="auto-filler">Fleks?</button>');

    $("#addApprovalBtn").after('<button title="Fyll ut alle dager uten registreringer med din vanlige abreidstid" id="mndKnapp" music="'+music+'" class="fyll-mnd" type="button"> Auto-fyll mnd </button>');
    $("#mndKnapp").after('<button title="Godkjenn halve" id="approveFirst" class="approve-weeks" type="button">Godkjenn halve</button>');



    document.getElementById("dagKnapp").addEventListener("click", fillOut);
    document.getElementById("treneKnapp").addEventListener("click", fillTrene);
    document.getElementById("mndKnapp").addEventListener("click", fillMonth);
    document.getElementById("fleksKnapp").addEventListener("click", fillFlekse);

    document.getElementById("approveFirst").addEventListener("click", async function() {
        var {firstRange} = getApprovalRanges();
        await approveDayRange(firstRange[0], firstRange[1]);
    });
});