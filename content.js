// content.js

// Warning! This file contains silly and or sarcastic comments.
// If you do not like this kind of stuff, feel free to not read
// this code.

async function fillOut() {
    // The id of a filled filed is 32400, naturally.
    var filledTime = $("#reg-input-32400");

    if(filledTime !== undefined) {
        alert("Kan bare fylle ut for en tom dag");
    } else {
        document.getElementById("addInOut").click();

        // We wait a bit to load the inn/out page
        await new Promise(r => setTimeout(r, 1000));

        //Why yes, all the input id-s are reg-input-0, of course.
        document.getElementById("reg-input-0").value = "09:00";
        var inntid = $("#reg-input-0")

        // Simulate some user activity to trigger the change
        inntid.keydown();
        inntid.keypress();
        inntid.keyup();
        inntid.blur();

        // wait some more
        await new Promise(r => setTimeout(r, 1000));

        // Oh look, the id has changed to reg-input-86400, how quaint.
        document.getElementById("reg-input-86400").value = "16:35";
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

jQuery(document).ready(function() {
    jQuery("#editing-day ul").append('<li> <button onClick="fillOut()" type="button"> Fyll ut dag </button></li>');
    document.addEventListener('fillOutEvent', function() {
        fillOut();
    });
});