# [readme.md](https://pbs.twimg.com/media/E4Xh-V1XoAE9v0-?format=jpg&name=small)

## Umfang / Features

- Verkürzung eines gegebenen Links in ein Kürzel bestehend aus zufälligen Emojis
- Zugriff auf eine MongoDB Datenbank, in welche der original Links, Kürzel, Zeitpunkt der Erstellung, Admin-Link, Aufrufanzahl und die User-IP gespeichert werden.
- Funktion diese Datenbank Einträge abzurufen, zu suchen, zu ändern und zu löschen.
- API-Ratelimiter, welcher die Möglichkeit einen verkürzten Link zu erstellen auf 100 pro 15 Minuten limitiert. 

## Structure / Aufbau

**Wichtige Variablen des link-shorteners**
- **originalURL**: zu verkürzender Link, auf den der User weitergeleitet wird.
- **shortCode**: Abkürzung unter welcher der Link gespeichert wird. Besteht meistens aus 3 Emojis.
- **clickCounter**: Aufrufanzahl des Links.
- **dateCreated**: Datum der Erstellung der Abkürzung.
- **adminCode**: Zugangscode zur Oberfläche um den gekürzte Link zu bearbeiten & zu löschen.
- **clientIpAdress**: IP Adresse des Users, wird bei der Linkerstellung mitgespeichert.

**Verfügbare API-Endpoints** 

- **GET'** */code/:"abkürzung"* -Original URL wird zurückgegeben, und die Aufrufanzahl ("click-counter") des Links wird um eins erhöht.
- **POST** */code/generate* -Generiert Abkürzung und gibt diese zurück, wenn eine URL mitgegeben wird.
- **POST** */code/generateManual* -Generiert Abkürzung mit bereits definierten Emojis, prüft ob dieser Eintrag in der Datenbank vorhanden ist und legt einen neuen Antrag an (falls noch nicht vorhanden selbstverständlich) 
- **POST** */code/updateExisting* -Nimmt den AdminCode & eine neue URL entgegen. Bei richtigem AdminCode wird der zugehörige Eintrag in der Datenbank mit der neuen URL ergänzt.
- **POST** */code/deleteExisting* -Nimmt den AdminCode entgegen. Bei korrektem AdminCode wird der zugehörige Eintrag in der Datenbank gelöscht.
- **GET** */admin/:"adminCode"* -Gibt zugehörigen Datenbank Eintrag zurück.
- **GET** */adminDashboard/getAllEntries* -Gibt alle Einträge der Datenbank als Objekt zurück.

## Zentrale Funktionen des link-shorteners

- `shortenUrl()`: Funktion, welche 3 zufällige Emojis zurückgibt. 
- `saveGeneratedAbbrevationDB(shortened, url, adminLink, ipAdress)`: Funktion, die das Kürzel (*shortened*), die Original-Url (*url*), den admin Link (*adminLink*) und die IP-Adresse des Erstellers  (*ipAdress*) entgegennimmt und mit diesen Werten einen neuen Datenbank-Eintrag anlegt.
- `validateURL(uri)`: Diese Funktion nimmt die Original-URL entgegen und überprüft mittels eines (link-zuMozilla)[HEAD-Requests] ob diese URL erreichbar ist um nur "echte" oder "lebendige" URL's kürzen zu lassen.
- `updateLinkClickCounter(linkID, oldClickCounter)`: Nimmt die _id des Datenbank-Eintrags und die alte Aufrufzahl des Eintrags entgegen. Dier alte Aufruf-Wert wird um Eins erhöht und der zugehöroge Eintrag in der Datenbank aktualisiert.
- `getDBentryByCode(code)`: Diese Funktion sucht mithilfe des Kürzels nach dem passenden Eintrag in der Datenbank. Falls vorhanden gibt die Funktion den entsprechenden Eintrag als vollständiges Objekt zurück. 
- `getDBentryByAdminCode(code)`: Findet den Datenbank-Eintrag mithilfe des admin-Kürzels und gibt diesen als Objekt zurück. 

