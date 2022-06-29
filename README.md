# !["logo"](https://github.com/ivaruf/MinWinTidHelper/blob/master/owl-head.png?raw=true) MinWinTidHelper
En chrome extension til å forenkle føring av timer i minWINTID. Denne er til deg som går inn hver dag og fyller ut de samme tallene. Her er det mange klikk og mye manuell tasting å spare!

(Faktisk 419 operasjoner spart, på en 30 dagers måned uten unntak =)

Dager hvor du ikke jobber din normale arbeidstid må du fylle ut manuelt som tidligere.

## Installasjon
1. Klon eller last ned git repositroy (bruk eventuelt direktelink: https://cutt.ly/minwintidhelper)
2. Pakk ut (unzip) hvis du lastet ned direkte
3. Åpne chrome
4. Gå til  ```chrome:\\extensions```
5. Skru på "developer mode" toggle i øverste høyre hjørne
6. Klikk "Load unpacked" knapp
7. Velg mappen du klonet / pakket ut
8. Ferdig!

## Bruk
*Tre nye knapper kommer frem i Vedlikeholds vinduet:*

1: **Fyll ut dag** ved siden av "Beregn" knappen vil automatisk fylle inn 09:00 til 16:35 for denne dagen, eller start slutt tid man har satt i brukervalg.

2: **Auto-fyll mnd** ved siden over kalendervsningen: fyll ut 09:00 til 16:35 (eller start slutt tid man har satt i brukervalg) for alle dager som ikke har noen registreringer og som forventer 07:35 timers arbeidstid. Helger, helligdager og "halve" dager blir ikke fylt ut automatisk.
Du kan auto-fylle så mange ganger du ønsker i løpet av en måned, da verdier aldri blir overskrevet, og den stopper når den kommer til dagen i dag (minWINTID tillater ikke å føre frem i tid).

Normal arbeidsflyt vil være å fylle unntak i løpet av en måned, og så klikke en gang på "Auto-fyll mnd" når måned er over.

3: **Trene?** ved siden av fyll ut dag knappen. Denne legger til fravær av typen trening i arbeidstiden fra kl 11 - > 12. Denne kan kjøres selv etter at timer er regisrert på dagen.


**OBS!**

* MinWinTidHelper vil aldri overskrive noe som allerede er ført og vil kun auto-fylle ut dager som har teksten __"Ingen registreringer denne dagen"__ dette gjelder også "Fyll ut dag" knappen.

* Kun dager med normal arbeidslenge (7:35 timer i Oslo Kommune) vil automatisk fylles ut når man auto-fyller måned. Den manuelle "Fyll ut dag" knappen ved siden av beregn, vil alltid forsøke å fylle ut dag i henhold til dine brukerinstillinger så lenge det ikke finnes registreringer på dagen.

* Du er selv ansvarlig for at det som er ført er riktig, selv om du bruker MinWinTidHelper, det kan være lurt å føre dager med fravær / sykdom / ferie eller avvik før man velger auto-fyll måned, slik at man ikke glemmer dette.

## Brukervalg
Klikk på extension-icon i chrome og velg "options". Du kan nå sette en annen start og slutt tid som stemmer mer med hvordan du vanligvis jobber. Det kan være nøyaktig 07:35 timer, mer eller mindre. Det er viktig at det skrives inn nøyaktig på format "xx:xx" hvor x er et tall og tilsammen blir et gyldig klokkeslett.

Beregn manuelt: sjekk av denne boksen dersom du ikke ønsker at MinWinTidHelper skal beregene for hver dag som fylles ut.
dette sparer litt tid, men du må da selv huske å trykke beregn senere.

Her kan du også velge om du vil spille Muzak (heis-musikk) mens måneds-fylling pågår =)
