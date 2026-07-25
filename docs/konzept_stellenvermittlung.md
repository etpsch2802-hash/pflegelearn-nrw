# Konzept: Stellenvermittlung nach bestandenem Examen

Stand 25.07.2026 · Status: **Planung, noch nicht gebaut**

Umsatzquelle Priorität 1. Absolventen willigen ein, dass PLAN ihr Profil an
Partnerkliniken vermittelt. Vergütung: 150–400 € pro qualifiziertem Lead.

---

## 1. Rechtliche Grundlage — der kritische Teil

Hier steckt das eigentliche Risiko, nicht in der Technik. Es werden
personenbezogene Daten von Berufseinsteigern erhoben und **an Dritte zu
kommerziellen Zwecken weitergegeben**. Das ist DSGVO-relevant und teils
arbeitsvermittlungsrechtlich reguliert.

### 1.1 Einwilligung (Art. 6 Abs. 1 lit. a, Art. 7 DSGVO)
- **Getrennte, aktive Einwilligung.** Eigene Checkbox, nicht vorausgewählt,
  nicht mit AGB oder App-Nutzung gekoppelt (Kopplungsverbot, Art. 7 Abs. 4).
- **Granular:** getrennt für (a) Speicherung des Vermittlungsprofils und
  (b) Weitergabe an Partner. Der Nutzer muss (a) ohne (b) wählen können.
- **Zweck konkret benennen:** an welche Art von Partnern, wofür, wie lange.
- **Jederzeit widerrufbar** — ein Button im Profil, Widerruf so einfach wie
  die Erteilung. Nach Widerruf: keine weitere Weitergabe, Löschung auf Wunsch.
- **Nachweisbar:** Zeitpunkt, Text-Version und Umfang der Einwilligung werden
  gespeichert (accountability, Art. 5 Abs. 2). Deshalb `einwilligung_version`.

### 1.2 Datenweitergabe
- Jede Weitergabe an einen Partner wird protokolliert (wer, wann, welche Felder).
- Mit jeder Partnerklinik ist zu klären, ob ein **Auftragsverarbeitungsvertrag
  (Art. 28)** nötig ist oder eine **gemeinsame Verantwortlichkeit (Art. 26)**
  vorliegt. Faustregel: Gibt PLAN Daten zur eigenen Verwendung des Partners
  weiter, sind beide getrennt Verantwortliche und es braucht saubere Verträge.
- **AVV mit jedem Partner vor der ersten Weitergabe.** Ohne Vertrag kein Lead.

### 1.3 Gewerberecht — vorab klären
- Reine **Kontaktvermittlung** (Profil an Klinik, Klinik meldet sich selbst)
  ist i. d. R. keine erlaubnispflichtige Arbeitsvermittlung.
- Sobald PLAN aktiv Arbeitsverhältnisse anbahnt oder erfolgsabhängig von der
  *Einstellung* (statt vom Lead) vergütet wird, kann § 296 SGB III
  (Vermittlungsvertrag, Schriftform, Vergütung nur vom Arbeitgeber) greifen.
- **To-do Patrick:** einmalig steuerlich/rechtlich abklären, in welche
  Kategorie das Modell fällt. Das entscheidet über die Vertragsgestaltung
  mit den Kliniken, nicht über die App-Technik.

### 1.4 Datenschutzerklärung
- Neuer Abschnitt „Vermittlungsservice": Zweck, Empfängerkategorien,
  Speicherdauer, Widerrufsrecht, Rechtsgrundlage.
- Verzeichnis von Verarbeitungstätigkeiten (Art. 30) um diesen Zweck ergänzen.

---

## 2. Erhobene Daten (Wunsch: vollständiges Profil)

| Feld | Zweck | Pflicht |
|---|---|---|
| Name | Ansprache durch Partner | ja |
| E-Mail | Kontakt | ja |
| Telefon | Kontakt (optional) | nein |
| PLZ / Region | regionale Zuordnung | ja |
| Fachrichtung | passende Stellen (ATA, OTA, Intensiv, allgemein …) | ja |
| Wunsch-Arbeitszeit | Voll-/Teilzeit, Schicht ja/nein | ja |
| Examensdatum | Verfügbarkeit ab wann | ja |
| Verfügbarkeit | „sofort", „in 3 Monaten" … | ja |
| Umkreis in km | wie weit pendelbereit | ja |

Datenminimierung (Art. 5 Abs. 1 lit. c): nur erheben, was ein Partner für die
Erstansprache wirklich braucht. Alles darüber später und freiwillig.

---

## 3. Technisches Konzept (später umzusetzen)

### 3.1 Supabase-Tabelle `vermittlung_leads`
```
id                uuid   pk default gen_random_uuid()
created_at        timestamptz default now()
name              text
email             text
telefon           text
plz               text
region            text
fachrichtung      text
arbeitszeit       text
examen_datum      date
verfuegbar_ab     text
umkreis_km        int
einwilligung_speicher   boolean   -- (a) Profil speichern
einwilligung_weitergabe boolean   -- (b) an Partner geben
einwilligung_version    text      -- welcher Text-Stand galt
einwilligung_am         timestamptz
status            text default 'neu'  -- neu | vermittelt | widerrufen | geloescht
widerruf_am       timestamptz
```
Dauerregel des Projekts: GRANT + Policies für **anon, authenticated,
service_role**. Schreiben nur mit gültiger Einwilligung; Lesen nur service_role
(kein Client darf fremde Leads sehen).

### 3.2 Tabelle `vermittlung_weitergaben` (Protokoll)
```
id, lead_id (fk), partner text, felder text[], weitergegeben_am timestamptz
```
Erfüllt die Nachweispflicht bei jeder Weitergabe.

### 3.3 Profil-Bereich in der App
- Eigener Abschnitt „Nach dem Examen: Stellenvermittlung" im Profil-Tab.
- Formular mit den Feldern aus Abschnitt 2.
- **Zwei getrennte Checkboxen** (Speicher / Weitergabe), unvorausgewählt.
- Sichtbarer Widerruf-Button, sobald eine Einwilligung vorliegt.
- Speicherung über neuen Endpunkt `api/vermittlung.js` (Muster: `api/lead.js`).

### 3.4 Admin
- Liste der Leads (nur Admin-Token), Filter nach Region/Fachrichtung.
- Export für einen Partner erzeugt automatisch einen Eintrag in
  `vermittlung_weitergaben`.

---

## 4. Reihenfolge der Umsetzung

1. **Recht zuerst** (Patrick): Gewerbeeinordnung 1.3, Muster-AVV, Datenschutz-
   erklärung erweitern. Ohne das kein Go.
2. Tabellen + Policies anlegen.
3. Profil-Formular + `api/vermittlung.js`, Einwilligung sauber getrennt.
4. Admin-Liste + Weitergabe-Protokoll.
5. Erst wenn ein realer Partner mit AVV existiert: Weitergabe scharfschalten.

Bis Schritt 5 werden nur Einwilligungen und Profile gespeichert, es verlässt
kein Datensatz das System.

---

## 5. Offene Fragen an Patrick

- Erfolgsvergütung pro **Lead** oder pro **Einstellung**? (entscheidet über 1.3)
- Gibt es schon einen konkreten Partner, oder erst Profile sammeln?
- Soll die Vermittlung nur Examinierten offenstehen oder auch Azubis im
  letzten Jahr (Frühbindung)?
