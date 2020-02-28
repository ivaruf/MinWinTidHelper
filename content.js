// content.js

// Warning! This file contains silly and or sarcastic comments.
// If you do not like this kind of stuff, feel free to not read
// this code.

async function fillOut() {
    var dayIsEmpty = $("#registrations")[0].innerHTML.indexOf("Ingen registreringer denne dagen") > 0;

    if(!dayIsEmpty) {
        alert("Kan bare fylle ut for en tom dag");
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

var script = document.createElement('script');
script.textContent = fillOut.toString();
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

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

console.log("Trying to add button");
$(document).ready(function() {
    console.log($("#editing-day ul"));
    $("#editing-day ul").append('<li> <button onClick="fillOut()" class="auto-filler" start-time="'+startTime+'" end-time="'+endTime+'" type="button"> Fyll ut dag </button></li>');
    console.log("In ready functino and adding button");

    document.addEventListener('fillOutEvent', function() {
        fillOut();
    });
});