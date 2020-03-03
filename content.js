// content.js

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

async function fillOut(skipAlert = false) {
    var dayIsEmpty = $("#registrations")[0].innerHTML.indexOf("Ingen registreringer denne dagen") > 0;
    // TODO check how many "day-checkin" we have ... and skip if you cannot find it.
    if(!dayIsEmpty) {
        console.log("Skipping filled day");
        if(!skipAlert) {
            alert("Kan bare auto-fylle ut for en tom dag.");
        }
    } else {
        var fillButton = $(".auto-filler");
        var startTime = fillButton.attr("start-time");
        var endTime = fillButton.attr("end-time")

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
        return true;
    }
}

async function fillMonth() {
    const playMusic = $(".fyll-mnd").attr("music") === "true";
    if(playMusic) {
        $("#audio-player")[0].play();
    }

    $(".loader-overlay-main").removeClass("ng-hide");
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
        console.log(node)
        if(node.length === 1 && node[0].cellIndex === 6 || node[0].cellIndex === 7) {
            console.log("Weekend day... skipping");
            continue;
        }
        node.click();
        await waitAwhileAndListen("Venter på lasting av side ...");

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
    $(".loader-overlay-main").addClass("ng-hide");
    if(playMusic) {
        $("#audio-player")[0].pause();
    }
}


var script = document.createElement('script');
script.textContent = fillOut.toString() + fillMonth.toString() + waitAwhileAndListen.toString() ;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

chrome.storage.sync.get(
    {
        startTime: '09:00',
        endTime: '16:35',
        music: false
    },
    function(settings) {
        startTime = settings.startTime;
        endTime = settings.endTime;
        music = settings.music;
    }
);

jQuery(document).ready(function() {
    if (music === true) {
        var sound      = document.createElement('audio');
        sound.id       = 'audio-player';
        sound.controls = 'controls';
        sound.loop     = 'true';
        sound.src      = chrome.runtime.getURL("music/elevator.mp3");
        sound.type     = 'audio/mpeg';
        (document.head||document.documentElement).appendChild(sound);
    }

    jQuery("#editing-day ul").append('<li> <button onClick="fillOut()" class="auto-filler" start-time="'+startTime+'" end-time="'+endTime+'" type="button"> Fyll ut dag </button></li>');
    jQuery("#calendar-nav").prepend('<button onClick="fillMonth()" music="'+music+'" class="warning fyll-mnd" type="button"> Auto-fyll mnd </button>');
    document.addEventListener('fillOutEvent', function() {
        fillOut();
    });
});