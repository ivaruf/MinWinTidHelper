// Warning! This file contains silly and or sarcastic comments.
// If you do not like this kind of stuff, feel free to not read
// this code.


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
        angular.element(inntid).triggerHandler('input');

        // wait some more
        await new Promise(r => setTimeout(r, 1000));

        var uttid = timeInputs[1];
        uttid.value = endTime
        angular.element(uttid).triggerHandler('input');

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

    var absencelist = document.getElementById("absencelist")

    absencelist.click();

    await new Promise(r => setTimeout(r, 1000));

    var rowHeaders = $("[role='rowheader']");
    for(var i = 0; i < rowHeaders.length; i++) {
        var rowHeader = rowHeaders[i];
        console.log(rowHeader.innerHTML)
        if(rowHeader.innerHTML.indexOf("Trening") > 0) {
            rowHeader.click();
            break;
        }
    }

    await new Promise(r => setTimeout(r, 100));

    let innTid = document.getElementById("createAbsence-hours-first");
    innTid.value = "11:00";
    let uttid = document.getElementById("createAbsence-hours-last");
    uttid.value = "12:00";

    angular.element(innTid).triggerHandler('input');
    angular.element(uttid).triggerHandler('input');

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