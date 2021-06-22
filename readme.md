# [readme.md](https://pbs.twimg.com/media/E4Xh-V1XoAE9v0-?format=jpg&name=small)

## Structure / Aufbau

**Wichtige Variablen des link-shorteners**
- **originalURL**: zu verkürzender Link, auf den der User weitergeleitet wird.
- **shortCode**: Abkürzung unter welcher der Link gespeichert wird. Besteht meistens aus 3 Emojis.
- **clickCounter**: Aufrufanzahl des Links.
- **dateCreated**: Datum der Erstellung der Abkürzung.
- adminCode: Zugangscode zur Oberfläche um den gekürzte Link zu bearbeiten & zu löschen.
- clientIpAdress: IP Adresse des Users, wird bei der Linkerstellung mitgespeichert.

**Verfügbare API-Endpoints** 

- GET /code/:"abkürzung" -Original URL wird zurückgegeben, und die Aufrufanzahl ("click-counter") des Links wird um eins erhöht.
- POST /code/generate -Generiert Abkürzung und gibt diese zurück, wenn eine URL mitgegeben wird.
- POST /code/updateExisting -Nimmt den AdminCode & eine neue URL entgegen. Bei richtigem AdminCode wird der zugehörige Eintrag in der Datenbank mit der neuen URL ergänzt.
- POST /code/deleteExisting -Nimmt den AdminCode entgegen. Bei korrektem AdminCode wird der zugehörige Eintrag in der Datenbank gelöscht.
- GET /admin/:"adminCode" -Gibt zugehörigen Datenbank Eintrag zurück.
- GET /adminDashboard/getAllEntries -Gibt alle Einträge der Datenbank als Objekt zurück.

## Zentrale Funktionen des link-shorteners

**


