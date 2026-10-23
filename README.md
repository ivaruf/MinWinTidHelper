# <img src="icons/icon-128.png" alt="" width="48" height="48"> MinWinTidHelper
En chrome extension til å forenkle føring av timer i minWINTID. Denne er til deg som går inn hver dag og fyller ut de samme tallene. Her er det mange klikk og mye manuell tasting å spare!

(Faktisk 419 operasjoner spart, på en 30 dagers måned uten unntak =)

Dager hvor du ikke jobber din normale arbeidstid må du fylle ut manuelt som tidligere.

Nytt i 2.0: en ugle 🦉 som bor i en fuglekasse nederst på siden (eller venter nede i hjørnet når fuglekassen ikke er synlig). Den flyr fra dag til dag mens den fører timer, viser hvor langt den har kommet, og sier fra når noe går galt.

## Installasjon
1. Klon eller last ned git repository (bruk eventuelt direktelink: https://cutt.ly/minwintidhelper)
2. Pakk ut (unzip) hvis du lastet ned direkte
3. Åpne chrome
4. Gå til ```chrome://extensions```
5. Skru på "developer mode" toggle i øverste høyre hjørne
6. Klikk "Load unpacked" knapp
7. Velg mappen du klonet / pakket ut
8. Ferdig!

**Oppdatere:** hent siste versjon, klikk på oppdater-ikonet på MinWinTidHelper i `chrome://extensions`, og last minWINTID-siden på nytt.

## Bruk
*Nye knapper kommer frem i Vedlikeholds vinduet:*

1: **⏱️ Fyll ut dag** ved siden av "Beregn" knappen vil automatisk fylle inn 09:00 til 16:35 for denne dagen, eller start slutt tid man har satt i brukervalg.

2: **🦉 Auto-fyll mnd** over kalendervisningen: fyll ut 09:00 til 16:35 (eller start slutt tid man har satt i brukervalg) for alle dager som ikke har noen registreringer og som forventer 07:35 timers arbeidstid. Helger, helligdager og "halve" dager blir ikke fylt ut automatisk.
Du kan auto-fylle så mange ganger du ønsker i løpet av en måned, da verdier aldri blir overskrevet, og den fyller ut til og med i dag, men aldri dager frem i tid.
Mens den jobber, legger siden seg bak et kort midt på skjermen som viser hvilken dag den er på og hvor langt den har kommet. Trykk **Stopp** for å avbryte etter dagen den holder på med. "Fyll ut dag", "Trene?" og "Fleks?" viser et lite kort med en spinner mens minWINTID jobber.

Normal arbeidsflyt vil være å fylle unntak i løpet av en måned, og så klikke en gang på "Auto-fyll mnd" når måned er over.

3: **💪 Trene?** ved siden av fyll ut dag knappen. Denne legger til fravær av typen trening i arbeidstiden fra kl 11 - > 12. Denne kan kjøres selv etter at timer er registrert på dagen.

4: **🌴 Fleks?** fører hele dagen som avvikling av fleks.

5: **✔️ Godkjenn halve** godkjenner første halvdel av måneden: fra den 1. til og med søndagen i den andre hele uken.

Klikk på ugla for et tips.

**OBS!**

* MinWinTidHelper vil aldri overskrive noe som allerede er ført og vil kun auto-fylle ut dager som har teksten __"Ingen registreringer denne dagen"__ dette gjelder også "Fyll ut dag" knappen.

* Kun dager med normal arbeidslengde (7:35 timer i Oslo Kommune) vil automatisk fylles ut når man auto-fyller måned. Den manuelle "Fyll ut dag" knappen ved siden av beregn, vil alltid forsøke å fylle ut dag i henhold til dine brukerinstillinger så lenge det ikke finnes registreringer på dagen.

* Du er selv ansvarlig for at det som er ført er riktig, selv om du bruker MinWinTidHelper, det kan være lurt å føre dager med fravær / sykdom / ferie eller avvik før man velger auto-fyll måned, slik at man ikke glemmer dette.

## Brukervalg
Klikk på fuglekassen 🏠 nederst til venstre på Vedlikehold-siden, eller på MinWinTidHelper-ikonet i Chrome. Innstillingene åpnes i en egen fane, som lukkes når du lagrer. Endringer gjelder med en gang, du trenger ikke laste siden på nytt.

**Arbeidstid:** sett en annen start- og sluttid som stemmer mer med hvordan du vanligvis jobber. Det kan være nøyaktig 07:35 timer, mer eller mindre. Skriv tiden som tt:mm (09:00). Du kan også skrive 900 eller 9:00, så rydder den opp for deg. Under feltene ser du hvor lang dagen blir.

Hvis du har arbeidsdager kortere enn 07:35 timer, f.eks. hvis du jobber 80%, 06:04 timer, kan du endre på "Arb. lengde" valget.

**Beregn manuelt:** skru på dette dersom du ikke ønsker at MinWinTidHelper skal beregne for hver dag som fylles ut. Dette sparer litt tid, men du må da selv huske å trykke beregn senere.

**Litt variasjon:** flytter start- og sluttid med mellom 1 og 30 minutter, likt for begge, så dagen blir like lang.

**Heisemusikk:** spill Muzak (heis-musikk) mens måneds-fylling pågår =)

**Vis ugla:** skru av hvis du vil jobbe i fred. Knappene og fremdriften fungerer som før.

## Musikk
"Local Forecast - Elevator" av Kevin MacLeod, lisensiert under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Se `music/Read.txt`.
