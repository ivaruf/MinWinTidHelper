// content.js

// Warning! This file contains silly and or sarcastic comments.
// If you do not like this kind of stuff, feel free to not read
// this code.


async function fillOut(skipAlert = false) {
    var dayIsEmpty = $("#registrations")[0].innerHTML.indexOf("Ingen registreringer denne dagen") > 0;
    // TODO check how many "day-checkin" we have ... and skip if you cannot find it.
    if(!dayIsEmpty) {
        console.log("Skipping filled day");
        if(!skipAlert) {
            alert("Kan bare fylle ut for en tom dag");
        }
    } else {
        var fillButton = $(".auto-filler");
        var startTime = fillButton.attr("start-time");
        var endTime = fillButton.attr("end-time")

        document.getElementById("addInOut").click();

        // We wait a bit to load the inn/out page
        await new Promise(r => setTimeout(r, 1000));

        //Why yes, all the input id-s are reg-input-0, of course.
        document.getElementById("reg-input-0").value = startTime;
        var inntid = $("#reg-input-0")

        // Simulate some user activity to trigger the change
        inntid.keydown();
        inntid.keypress();
        inntid.keyup();
        inntid.blur();

        // wait some more
        await new Promise(r => setTimeout(r, 1000));

        // Oh look, the id has changed to reg-input-86400, how quaint.
        // ... actually it is 86400 / 3600 = 24. In other words midnight
        // You can see what time is in the input based on the id that change ...
        // Amazing!
        document.getElementById("reg-input-86400").value = endTime;
        var uttid = $("#reg-input-86400");

        // Simulate some more user motion
        uttid.keydown();
        uttid.keypress();
        uttid.keyup();
        uttid.blur();

        // Good to go, hit it!
        document.getElementById("calculate-button").click();
    }
}

async function fillMonth() {
    $(".loader-overlay-main").removeClass("ng-hide");
    for (let day = 1; day < 32; day++) {
        var node = $("[data-cy=maintenance-calendar-day-"+day+"]")
        if (node !== undefined) {
            node.click();
            await new Promise(r => setTimeout(r, 5000));
            const dayIsEmpty = $("#registrations")[0].innerHTML.indexOf("Ingen registreringer denne dagen") > 0;
            const dayIsWorkDay = $("#mustering-length")[0].value === "07:35";
            if (dayIsWorkDay && dayIsEmpty) {
                console.log("Filling out!");
                await fillOut(true);
                await new Promise(r => setTimeout(r, 15000));
            } else {
                console.log("No for day " + day);
            }
        } else {
            console.log("Day " + day + " not found.");
        }
    }
    $(".loader-overlay-main").addClass("ng-hide");
}


var script = document.createElement('script');
script.textContent = fillOut.toString();
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

var script2 = document.createElement('script');
script2.textContent = fillMonth.toString();
(document.head||document.documentElement).appendChild(script2);
script2.parentNode.removeChild(script2);


chrome.storage.sync.get(
    {
        startTime: '09:00',
        endTime: '16:35'
    },
    function(settings) {
        startTime = settings.startTime;
        endTime = settings.endTime
    }
);

jQuery(document).ready(function() {
    jQuery("#editing-day ul").append('<li> <button onClick="fillOut()" class="auto-filler" start-time="'+startTime+'" end-time="'+endTime+'" type="button"> Fyll ut dag </button></li>');
    jQuery("#calendar-nav").prepend('<button onClick="fillMonth()" class="warning" type="button"> Auto-fyll mnd </button>');
    document.addEventListener('fillOutEvent', function() {
        fillOut();
    });
});