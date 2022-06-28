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

$(document).ready(function() {
    var helpers = document.createElement('script');
    helpers.src = chrome.extension.getURL('helpers.js');
    document.head.appendChild(helpers);
    if (typeof music !== 'undefined' && music === true) {
        var sound      = document.createElement('audio');
        sound.id       = 'audio-player';
        sound.controls = 'controls';
        sound.loop     = 'true';
        sound.src      = chrome.runtime.getURL("music/elevator.mp3");
        sound.type     = 'audio/mpeg';
        (document.head||document.documentElement).appendChild(sound);
    }

    $("#editing-day ul").append('<li> <button title="Fyll ut dag med din vanlige arbeidstid" onClick="fillOut()" class="auto-filler" start-time="'+startTime+'" end-time="'+endTime+'" manual="'+manual+'" randomness="'+randomness+'" type="button"> Fyll ut dag </button></li>');
    $(".calendar-nav-buttons").prepend('<button title="Fyll ut alle dager uten registreringer med din vanlige abreidstid" onClick="fillMonth()" music="'+music+'" class="fyll-mnd" type="button"> Auto-fyll mnd </button>');
});