// content.js

async function fillOut() {
    document.getElementById("addInOut").click();

    await new Promise(r => setTimeout(r, 1000));

    document.getElementById("reg-input-0").value = "09:00";
    var inntid = $("#reg-input-0")

    inntid.keydown();
    inntid.keypress();
    inntid.keyup();
    inntid.blur();


    await new Promise(r => setTimeout(r, 1000));

    document.getElementById("reg-input-86400").value = "16:35";
    var uttid = $("#reg-input-86400");

    uttid.keydown();
    uttid.keypress();
    uttid.keyup();
    uttid.blur();

    document.getElementById("calculate-button").click();
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