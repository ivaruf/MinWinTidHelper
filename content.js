// content.js

chrome.storage.sync.get(
    {
        startTime: '09:00',
        endTime: '16:35',
        music: false,
        manual: false,
        randomness : false
    },
    function(settings) {
        startTime = settings.startTime;
        endTime = settings.endTime;
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

        var tbodyElements = $('#vue-scroll-table5 tbody');


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
            var dayIsWorkDay = $("#scheme_length_input_attendance")[0].value === '07:35'




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
        append('<button style="margin-left:5px" title="Trykk for å legge til trening" id="treneKnapp" class="auto-filler">Trene?</button>');
    $("#addApprovalBtn").after('<button title="Fyll ut alle dager uten registreringer med din vanlige abreidstid" id="mndKnapp" music="'+music+'" class="fyll-mnd" type="button"> Auto-fyll mnd </button>');

    document.getElementById("dagKnapp").addEventListener("click", fillOut);
    document.getElementById("treneKnapp").addEventListener("click", fillTrene);
    document.getElementById("mndKnapp").addEventListener("click", fillMonth);
});