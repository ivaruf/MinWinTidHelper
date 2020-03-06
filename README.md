# !["logo"](https://github.com/ivaruf/MinWinTidHelper/blob/master/owl-head.png?raw=true) MinWinTidHelper
En chrome extension til å forenkle føring av timer i minWINTID. Denne er til deg som går inn hver dag og fyller ut de samme tallene. Her er det mange klikk å spare!
Dager hvor du ikke jobber din normale arbeidstid må du fylle ut manuelt som tidligere.

## Bruk
*To nye knapper kommer frem i Vedlikeholds vinduet:*

1: **Fyll ut dag** ved siden av "Beregn" knappen vil automatisk fylle inn 09:00 til 16:35 for denne dagen.

2: **Auto-fyll mnd** ved siden over kalendervsningen: fyll ut 09:00 til 16:35 for alle dager som ikke har noen registreringer og som forventer 07:35 timers arbeidstid. Helger, helligdager og "halve" dager blir ikke fylt ut automatisk.
Du kan auto-fylle så mange ganger du ønsker i løpet av en måned, da verdier aldri blir overskrevet, og den stopper når den kommer til dagen i dag (minWINTID tillater ikke å føre frem i tid).

Normal arbeidsflyt vil være å fylle unntak i løpet av en måned, og så klikke en gang på "Auto-fyll mnd" når måned er over.

## Brukervalg
Klikk på extension-icon i chrome og velg "options". Du kan nå sette en annen start og slutt tid som stemmer mer med hvordan du vanligvis jobber. Det kan være mer eller mindre enn 07:35 timer.

Beregn manuelt: sjekk av denne boksen dersom du ikke ønsker at MinWinTidHelper skal beregene for hver dag som fylles ut.
dette sparer litt tid, men du må da selv huske å trykke beregn senere.

Her kan du også velge om du vil spille Muzak (heis-musikk) mens måneds-fylling pågår =)

## Installasjon
1. Klon eller last ned git repositroy
2. Åpne chrome
3. Gå til  ```chrome:\\extensions```
4. Skru på "developer mode" toggle i øverste høyre hjørne
5. Klikk "Load unpacked" knapp
6. Velg mappen du lastet ned i steg 1
7. Ferdig!
