// Warning! This file contains silly and or sarcastic comments.
// If you do not like this kind of stuff, feel free to not read
// this code.


async function waitAwhileAndListen(message = "laster") {
    while(true) {
        await new Promise(r => setTimeout(r, 1000));
        console.log(message)
        if ($("#loading-image:hidden").length > 0) {
            break;
        }
    }
}

// Simulate some user activity to trigger the change
function jiggle(element) {
    element.keydown();
    element.keypress();
    element.keyup();
    element.blur();
}

async function fillOut(skipAlert = false) {
    var dayIsEmpty = $("#registrations")[0].innerHTML.indexOf("Ingen registreringer denne dagen") > 0;
    // TODO check how many "day-checkin" we have ... and skip if you cannot find it.
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

        await new Promise(r => setTimeout(r, 1000));

        document.getElementById("addInOut").click();

        // We wait a bit to load the inn/out page
        await waitAwhileAndListen()

        if($("#registrations .day-time-in").length === 2) {
            alert("Kan ikke auto-fylle for den dag som ikke er over.")
            return false;
        }

        //Why yes, all the input id-s are reg-input-0, of course.
        document.getElementById("reg-input-0").value = startTime;
        var inntid = $("#reg-input-0")

        jiggle(inntid);

        // wait some more
        await new Promise(r => setTimeout(r, 1000));

        // Oh look, the id has changed to reg-input-86400, how quaint.
        // ... actually it is 86400 / 3600 = 24. In other words midnight
        // You can see what time is in the input based on the id that change ...
        // Amazing!
        document.getElementById("reg-input-86400").value = endTime;
        var uttid = $("#reg-input-86400");

        // Simulate some more user motion
        jiggle(uttid)

        // Good to go, hit it!
        if(manual === "true") {
            document.getElementById("lagreknapp").click();
        }
        else {
            document.getElementById("calculate-button").click();
        }
        return true;
    }
}

async function fillTrene() {
    document.getElementById("expand-absence").click();;

    var absencelist = document.getElementById("absencelist")
    absencelist.selectedIndex = 33;
    absencelist.dispatchEvent(new Event("change"));

    await new Promise(r => setTimeout(r, 100));
    document.getElementById("createAbsence-hours-first").value = "11:00";
    document.getElementById("createAbsence-hours-last").value = "12:00";
    document.getElementById("delavdag").click();
    await new Promise(r => setTimeout(r, 100));
    document.getElementById("createAbsence-hours-first").dispatchEvent(new Event("change"));
    document.getElementById("createAbsence-hours-last").dispatchEvent(new Event("change"));
    await new Promise(r => setTimeout(r, 100));
    document.getElementById("addAbsencebutton").click();
}

async function fillMonth() {
    const playMusic = $(".fyll-mnd").attr("music") === "true";
    if(playMusic) {
        $("#audio-player")[0].play();
    }

    $(".loader-overlay-main")[0].setAttribute("style", "display: block")
    for (let day = 1; day < 32; day++) {
        var node = $("[data-cy=maintenance-calendar-day-"+day+"]").not(".fc-other-month");

        // If we can't find the node, then we skip that day.
        if(node.length === 0 || node === undefined) {
            continue
        }

        // Do not even click if it already has a correction. (pruple dot)
        if($("[data-cy=maintenance-calendar-day-"+day+"] .day-correction").length > 0) {
            continue;
        }
        if(node.length === 1 && node[0].cellIndex === 6 || node[0].cellIndex === 7) {
            console.log("Weekend day... skipping");
            continue;
        }
        node.click();
        await waitAwhileAndListen("Venter på lasting av side ...");
        if($(".ui-dialog:visible").length > 0) {
             alert("Last inn siden på nytt for å auto-fylle mnd.");
             break;
        }

        const dayIsEmpty = $("#registrations")[0].innerHTML.indexOf("Ingen registreringer denne dagen") > 0;
        const dayIsWorkDay = $("#mustering-length")[0].value === "07:35";
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

console.log("Ran helper script! From github!")