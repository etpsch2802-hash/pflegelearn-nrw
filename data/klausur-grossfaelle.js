/* PLAN NRW - Grosse Fallklausuren (durchgehender Fall, ~12 Fragen je Fall).
   Struktur nach PflAPrV § 14: eine Fallsituation, die sich ueber den Verlauf
   entwickelt (Aufnahme -> Assessment -> Massnahmen -> Komplikation -> Aufloesung).
   Variiert nach Versorgungskontext, Altersstufe, Pflegeanlass.
   Status: Freigabe durch Jessica Schenkelberger ausstehend (aktiv:false).
   Antwort-Positionen gleichmaessig verteilt. Nicht direkt bearbeiten. */
var KLAUSUR_GROSSFAELLE = [
  {
    "id": "gf-herzinsuff-geriatrie",
    "aktiv": true,
    "kontext": "Krankenhaus, internistische Station",
    "titel": "Herr Berger, 78 Jahre - dekompensierte Herzinsuffizienz",
    "einleitung": "Herr Berger, 78 Jahre, wird vom Hausarzt mit zunehmender Luftnot und geschwollenen Beinen eingewiesen. Er lebt allein, seine Frau ist vor einem Jahr verstorben. Bekannt sind eine chronische Herzinsuffizienz, Vorhofflimmern und ein leichter Diabetes mellitus Typ 2. Bei Aufnahme: RR 165/95 mmHg, Puls 98/min unregelmaessig, SpO2 89 % bei Raumluft, Atemfrequenz 26/min, Temperatur 36,8 Grad. Er kann nur mit erhoehtem Oberkoerper atmen.",
    "fragen": [
      {
        "kapitel": "Aufnahme",
        "frage": "Welches Aufnahmezeichen weist am deutlichsten auf eine akute kardiale Dekompensation mit Sauerstoffmangel hin?",
        "opt": [
          "Die SpO2 von 89 % mit erhoehter Atemfrequenz",
          "Die Temperatur von 36,8 Grad",
          "Der unregelmaessige Puls",
          "Das Alter von 78 Jahren"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Eine SpO2 von 89 % zusammen mit einer Atemfrequenz von 26/min zeigt eine respiratorische Belastung durch die Dekompensation. Der unregelmaessige Puls passt zum bekannten Vorhofflimmern, erklaert aber nicht die akute Luftnot."
      },
      {
        "kapitel": "Aufnahme",
        "frage": "Wie lagerst du Herrn Berger bei der Aufnahme, um seine Atmung zu erleichtern?",
        "opt": [
          "Eine flache Rueckenlage ganz ohne Erhoehung des Oberkoerpers",
          "Herzbettlagerung: Oberkoerper hoch, Beine tief",
          "Die stabile Seitenlage wie bei bewusstlosen Patienten",
          "Eine durchgehende Bauchlage zur Entlastung des Rueckens"
        ],
        "k": 1,
        "s": "leicht",
        "erkl": "Die Herzbettlagerung senkt durch die tiefe Beinposition den venoesen Rueckstrom (Vorlast) und entlastet so das Herz. Der erhoehte Oberkoerper erleichtert zusaetzlich die Atemarbeit."
      },
      {
        "kapitel": "Assessment",
        "frage": "Der Arzt ordnet eine Fluessigkeitsbilanzierung an. Was erfasst du dafuer vollstaendig?",
        "opt": [
          "Nur die Trinkmenge",
          "Nur die Urinausscheidung",
          "Gesamte Ein- und Ausfuhr im Vergleich",
          "Nur das Koerpergewicht"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Eine korrekte Bilanz erfasst die vollstaendige Einfuhr (Trinken, Infusionen) und Ausfuhr (Urin, Drainagen) und stellt sie gegenueber. Das taegliche Wiegen ergaenzt die Bilanz, ersetzt sie aber nicht."
      },
      {
        "kapitel": "Assessment",
        "frage": "Warum ist bei Herrn Berger das taegliche Wiegen besonders aussagekraeftig?",
        "opt": [
          "Weil er im Rahmen der Behandlung gezielt abnehmen soll",
          "Weil das Koerpergewicht die genaue Medikamentendosis bestimmt",
          "Weil sich daran die Einstellung seines Diabetes ablesen laesst",
          "Weil eine rasche Gewichtszunahme Fluessigkeitseinlagerung anzeigt"
        ],
        "k": 3,
        "s": "mittel",
        "erkl": "Eine kurzfristige Gewichtszunahme ist das sensibelste Zeichen einer Fluessigkeitsretention bei Herzinsuffizienz. Gewogen wird unter gleichen Bedingungen (morgens, nuechtern, gleiche Kleidung)."
      },
      {
        "kapitel": "Massnahmen",
        "frage": "Herr Berger erhaelt nach Anordnung ein Diuretikum. Welche Beobachtung ist jetzt besonders wichtig?",
        "opt": [
          "Urinausscheidung, Elektrolyte und Kreislauf",
          "Ausschliesslich die Farbe und das Aussehen der Haut",
          "Ausschliesslich die gemessene Koerpertemperatur",
          "Ausschliesslich das taeglich erfasste Koerpergewicht"
        ],
        "k": 0,
        "s": "schwer",
        "erkl": "Diuretika steigern die Ausscheidung - dabei koennen Kalium und andere Elektrolyte entgleisen und der Kreislauf kann bei zu starker Entwaesserung absacken. Ausscheidung, Elektrolytwerte (nach Anordnung) und Kreislauf sind zu ueberwachen."
      },
      {
        "kapitel": "Massnahmen",
        "frage": "Herr Berger moechte trotz Luftnot nachts allein zur Toilette. Wie handelst du sicher?",
        "opt": [
          "Ihm das naechtliche Aufstehen zur Toilette streng verbieten",
          "Sturzrisiko einschaetzen, Hilfe anbieten, Rufanlage in Reichweite legen",
          "Ihn ganz ohne weitere Sicherungsmassnahmen gewaehren lassen",
          "Ein hochgestelltes Bettgitter allein als ausreichende Massnahme ansehen"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Bei Luftnot, Diuretika (Harndrang) und hohem Alter besteht ein deutliches Sturzrisiko. Sturzassessment, angebotene Begleitung und eine erreichbare Rufanlage erhalten Sicherheit und Selbstbestimmung. Bettgitter allein sind keine Sturzprophylaxe und koennen freiheitsentziehend sein."
      },
      {
        "kapitel": "Verschlechterung",
        "frage": "In der zweiten Nacht wird Herr Berger ploetzlich stark kurzatmig, hustet schaumig-rosa Sekret und hat Todesangst. Was vermutest du?",
        "opt": [
          "Eine Erkaeltung",
          "Normale naechtliche Unruhe",
          "Ein akutes Lungenoedem",
          "Eine Magenverstimmung"
        ],
        "k": 2,
        "s": "schwer",
        "erkl": "Schaumig-rosa (blutig tingiertes) Sekret, akute schwere Luftnot und Angst sind Leitzeichen eines akuten Lungenoedems - ein Notfall, der sofortiges Handeln und aerztliche Alarmierung erfordert."
      },
      {
        "kapitel": "Verschlechterung",
        "frage": "Was ist deine erste Massnahme bei Verdacht auf ein akutes Lungenoedem?",
        "opt": [
          "Flach hinlegen und abwarten",
          "Ihm etwas zu trinken geben",
          "Ihn allein lassen und spaeter kontrollieren",
          "Oberkoerper hoch, Beine tief, Hilfe rufen und beruhigen"
        ],
        "k": 3,
        "s": "schwer",
        "erkl": "Sofort Oberkoerper hoch/Beine tief zur Vorlastsenkung, umgehend aerztliche Hilfe holen, Sauerstoff nach Anordnung, ruhige Praesenz gegen die Panik. Flachlagerung wuerde die Situation verschlimmern."
      },
      {
        "kapitel": "Verschlechterung",
        "frage": "Welche Vitalzeichen-Kombination bestaetigt die kritische Verschlechterung am deutlichsten?",
        "opt": [
          "SpO2 82 %, AF 34, Puls 118, RR 180/100",
          "RR 130/80, Puls 76, SpO2 97 %, AF 15",
          "RR 120/75, Puls 70, SpO2 98 %, AF 14",
          "SpO2 95 %, AF 18, Puls 82, RR 135/85"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Eine SpO2 von 82 % mit stark erhoehter Atem- und Herzfrequenz sowie hypertensiven Werten zeigt die akute respiratorische und kardiale Krise beim Lungenoedem - klar behandlungsbeduerftig."
      },
      {
        "kapitel": "Stabilisierung",
        "frage": "Nach aerztlicher Behandlung stabilisiert sich Herr Berger. Was gehoert jetzt zur pflegerischen Ueberwachung?",
        "opt": [
          "Keine weitere Beobachtung noetig",
          "Engmaschige Vitalzeichen, Atmung, Bilanz und Bewusstsein",
          "Nur einmal taeglich Blutdruck",
          "Nur das Gewicht am Entlassungstag"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Nach einer akuten Dekompensation bleibt die Situation instabil. Engmaschige Kontrolle von Vitalzeichen, Atmung, Fluessigkeitsbilanz und Bewusstsein erkennt eine erneute Verschlechterung fruehzeitig."
      },
      {
        "kapitel": "Entlassung",
        "frage": "Zur Entlassung beraetst du Herrn Berger. Welcher Hinweis ist zur Vermeidung einer erneuten Dekompensation zentral?",
        "opt": [
          "Sich moeglichst wenig bewegen und koerperliche Schonung einhalten",
          "Reichlich salzhaltige Speisen zur Kreislaufanregung essen",
          "Taeglich wiegen und bei rascher Zunahme den Arzt kontaktieren",
          "Die verordneten Medikamente bei einsetzender Besserung absetzen"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Taegliches Wiegen deckt eine erneute Fluessigkeitseinlagerung fruehzeitig auf. Bei rascher Zunahme (z. B. 2 kg in wenigen Tagen) soll aerztlicher Rat gesucht werden. Salzreduktion und Therapietreue sind ebenfalls wichtig - Medikamente werden nie eigenmaechtig abgesetzt."
      },
      {
        "kapitel": "Entlassung",
        "frage": "Herr Berger lebt allein und wirkt seit dem Tod seiner Frau niedergeschlagen. Was ist pflegerisch angemessen?",
        "opt": [
          "Das ist seine Privatsache und fuer die Pflege nicht von Bedeutung",
          "Ihn dazu auffordern, sich zusammenzureissen und nach vorn zu blicken",
          "Ausschliesslich die koerperlichen Aspekte seiner Erkrankung beachten",
          "Die psychosoziale Situation ernst nehmen und Unterstuetzung (z. B. ambulante Hilfen, Gespraech) anbieten"
        ],
        "k": 3,
        "s": "mittel",
        "erkl": "Soziale Isolation und Trauer beeinflussen Gesundheit, Selbstversorgung und Therapietreue erheblich. Eine ganzheitliche Pflege nimmt die psychosoziale Situation ernst und vermittelt passende Unterstuetzungsangebote."
      }
    ]
  },
  {
    "id": "gf-polytrauma-chirurgie",
    "aktiv": true,
    "kontext": "Krankenhaus, chirurgische Station nach OP",
    "titel": "Frau Cakir, 24 Jahre - nach Verkehrsunfall und Bein-OP",
    "einleitung": "Frau Cakir, 24 Jahre, wurde nach einem Fahrradunfall mit einem offenen Unterschenkelbruch operiert (Osteosynthese). Sie kommt am OP-Tag auf die Station. Sie hat starke Schmerzen (NRS 7/10), ist blass und aengstlich. Der Wundverband am rechten Unterschenkel ist trocken, eine Redon-Drainage foerdert maessig blutig. RR 105/65, Puls 92, Temperatur 37,2 Grad. Sie fragt immer wieder, ob ihr Bein 'wieder normal' werde.",
    "fragen": [
      {
        "kapitel": "Aufnahme",
        "frage": "Frau Cakir hat NRS 7/10. Was ist deine vorrangige Massnahme?",
        "opt": [
          "Schmerzmedikation nach Anordnung zeitnah verabreichen und Wirkung kontrollieren",
          "Sie freundlich bitten, die Schmerzen noch eine Weile auszuhalten",
          "Erst am Abend im Rahmen der Routineversorgung darauf reagieren",
          "Sie ausschliesslich durch Gespraeche vom Schmerz ablenken"
        ],
        "k": 0,
        "s": "leicht",
        "erkl": "Ein Schmerz von 7/10 ist behandlungsbeduerftig. Die angeordnete Analgesie wird zeitnah gegeben und die Wirkung nach angemessener Zeit erneut mit der Schmerzskala kontrolliert. Gute Schmerzkontrolle ist Voraussetzung fuer Mobilisation und Genesung."
      },
      {
        "kapitel": "Aufnahme",
        "frage": "Frau Cakir ist blass und tachykard. Welche Ursache musst du postoperativ zuerst ausschliessen?",
        "opt": [
          "Ein einfaches Hungergefuehl aufgrund der laengeren Nuechternheit",
          "Eine Nachblutung / beginnender Volumenmangel",
          "Eine harmlose Langeweile nach dem langen Liegen im Bett",
          "Eine zu warm eingestellte Bettdecke mit leichtem Waermestau"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Blaesse und erhoehte Herzfrequenz koennen nach einer OP Zeichen einer Nachblutung mit Volumenmangel sein. Wichtig sind Kontrolle von Verband, Drainagenmenge, Vitalzeichen und ggf. aerztliche Information. Schmerz und Angst koennen ebenfalls beitragen."
      },
      {
        "kapitel": "Assessment",
        "frage": "Wie kontrollierst du die Durchblutung, Motorik und Sensibilitaet (DMS) am operierten Bein?",
        "opt": [
          "Gar nicht, da diese Kontrolle ausschliesslich der Arzt durchfuehrt",
          "Ausschliesslich den angelegten Verband von aussen ansehen",
          "Hautfarbe/Temperatur, Zehenbeweglichkeit und Gefuehl regelmaessig pruefen und vergleichen",
          "Nur ein einziges Mal am Tag der geplanten Entlassung"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Die DMS-Kontrolle (Durchblutung, Motorik, Sensibilitaet) erkennt Durchblutungsstoerungen oder Nervenschaeden fruehzeitig. Verglichen wird mit dem gesunden Bein; Auffaelligkeiten werden dokumentiert und gemeldet."
      },
      {
        "kapitel": "Assessment",
        "frage": "Welches Zeichen am operierten Unterschenkel wuerde dich an ein Kompartmentsyndrom denken lassen?",
        "opt": [
          "Ein leichtes Ziehen, das auf die uebliche Schmerzmedikation gut anspricht",
          "Ein durchgehend trockener und sauber sitzender Wundverband",
          "Eine gemessene Koerpertemperatur von rund 37,2 Grad",
          "Zunehmender, kaum beeinflussbarer Schmerz, praller Unterschenkel, Gefuehlsstoerung"
        ],
        "k": 3,
        "s": "schwer",
        "erkl": "Ein Kompartmentsyndrom zeigt sich durch unverhaeltnismaessig starken, auf Analgesie kaum ansprechenden Schmerz, prallgespannte Muskellogen, Gefuehls- und spaeter Durchblutungsstoerungen. Das ist ein Notfall und muss sofort gemeldet werden."
      },
      {
        "kapitel": "Massnahmen",
        "frage": "Welche Prophylaxen sind bei Frau Cakir postoperativ besonders wichtig?",
        "opt": [
          "Thrombose-, Pneumonie- und Dekubitusprophylaxe",
          "Ausschliesslich die Vorbeugung von Druckgeschwueren (Dekubitus)",
          "Gar keine Prophylaxen, da sie noch jung und belastbar ist",
          "Ausschliesslich die Vorbeugung von Stuerzen bei Mobilisation"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Auch junge Patienten sind durch OP und Immobilitaet gefaehrdet. Thromboseprophylaxe (Bewegung, ggf. Medikamente/Struempfe), Pneumonieprophylaxe (Atemuebungen) und Dekubitusprophylaxe (Bewegung, Hautpflege) gehoeren zum Standard."
      },
      {
        "kapitel": "Massnahmen",
        "frage": "Bei der ersten Mobilisation wird Frau Cakir schwindelig und blass. Wie reagierst du?",
        "opt": [
          "Sie trotz der Beschwerden zum Weitergehen und Durchhalten draengen",
          "Mobilisation stoppen, sicher hinsetzen/lagern, Vitalzeichen und Kreislauf kontrollieren",
          "Sie zur weiteren Kreislaufanregung kurz allein stehen lassen",
          "Zunaechst nur das Fenster oeffnen und die Entwicklung abwarten"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Schwindel und Blaesse bei der ersten Mobilisation deuten auf eine orthostatische Kreislaufreaktion. Die Mobilisation wird unterbrochen, die Patientin sicher gelagert und der Kreislauf kontrolliert. Die naechste Mobilisation erfolgt langsamer und begleitet."
      },
      {
        "kapitel": "Verschlechterung",
        "frage": "Am dritten Tag klagt Frau Cakir ueber ploetzliche Atemnot und stechenden Brustschmerz beim Einatmen. Woran musst du denken?",
        "opt": [
          "Muskelkater",
          "Sodbrennen",
          "Eine Lungenembolie",
          "Aufregung wegen Besuch"
        ],
        "k": 2,
        "s": "schwer",
        "erkl": "Ploetzliche Atemnot und atemabhaengiger Brustschmerz nach einer Bein-OP sind Warnzeichen einer Lungenembolie (verschleppter Thrombus). Das ist ein lebensbedrohlicher Notfall - sofort Vitalzeichen erheben und aerztliche Hilfe alarmieren."
      },
      {
        "kapitel": "Verschlechterung",
        "frage": "Wie verhaeltst du dich bis zum Eintreffen des Arztes bei Verdacht auf Lungenembolie?",
        "opt": [
          "Die Patientin flach hinlegen und zur Beobachtung allein lassen",
          "Sie zur Foerderung des Kreislaufs zur Mobilisation auffordern",
          "Ihr zur Staerkung zunaechst etwas zu essen anbieten",
          "Oberkoerper hoch, beruhigen, Vitalzeichen/SpO2 ueberwachen, Sauerstoff nach Anordnung"
        ],
        "k": 3,
        "s": "schwer",
        "erkl": "Oberkoerperhochlagerung erleichtert die Atmung, ruhige Praesenz reduziert Panik, kontinuierliche Ueberwachung von Vitalzeichen und Sauerstoffsaettigung ist entscheidend. Koerperliche Belastung wird vermieden. Sauerstoff nur nach Anordnung."
      },
      {
        "kapitel": "Stabilisierung",
        "frage": "Frau Cakir aeussert nach dem Zwischenfall grosse Angst, erneut etwas 'Schlimmes' zu bekommen. Wie begegnest du ihr?",
        "opt": [
          "Angst ernst nehmen, altersgerecht informieren und Sicherheit durch Praesenz und Aufklaerung geben",
          "Ihre geaeusserte Angst als deutlich uebertrieben abtun",
          "Das belastende Thema meiden und bewusst nicht ansprechen",
          "Ihr sagen, sie solle einfach nicht so viel darueber nachdenken"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Nach einem bedrohlichen Ereignis ist Angst normal. Ernstnehmen, verstaendlich informieren und verlaessliche Praesenz geben Sicherheit. Gerade bei einer jungen Patientin ist die psychische Verarbeitung Teil der Genesung."
      },
      {
        "kapitel": "Rehabilitation",
        "frage": "Frau Cakir sorgt sich um die Zukunft ihres Beins. Welche Haltung ist angemessen?",
        "opt": [
          "Ihr eine vollstaendige Heilung garantieren",
          "Ehrlich, aber zuversichtlich informieren und auf das Reha-Team verweisen",
          "Sagen, das wisse niemand, und das Thema beenden",
          "Ihr raten, sich keine Hoffnung zu machen"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Falsche Garantien und Entmutigung sind beide unangebracht. Ehrliche, zugleich zuversichtliche Information im Rahmen der eigenen Kompetenz - und der Verweis auf Physiotherapie und aerztliche Einschaetzung - geben realistische Perspektive."
      },
      {
        "kapitel": "Rehabilitation",
        "frage": "Welche Beobachtung an der OP-Wunde wuerde auf eine Wundinfektion hindeuten?",
        "opt": [
          "Ein durchgehend trockener und reizloser Wundverband",
          "Ein leichter Juckreiz, der erst nach einigen Tagen auftritt",
          "Zunehmende Roetung, Ueberwaermung, Schwellung, Schmerz und ggf. Fieber",
          "Eine blasse, unauffaellige Narbe nach mehreren Wochen"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Klassische Infektzeichen sind Roetung, Ueberwaermung, Schwellung, zunehmender Schmerz und Funktionseinschraenkung, oft mit Fieber. Sie muessen erkannt, dokumentiert und aerztlich abgeklaert werden."
      },
      {
        "kapitel": "Entlassung",
        "frage": "Zur Entlassung: Welcher Hinweis zur Thromboseprophylaxe zu Hause ist wichtig?",
        "opt": [
          "Strikte Bettruhe halten, bis die Wunde vollstaendig verheilt ist",
          "Die verordnete Prophylaxe sofort nach der Entlassung beenden",
          "Moeglichst viel mit haengenden Beinen sitzen und sich schonen",
          "In Bewegung bleiben, verordnete Prophylaxe (z. B. Spritzen/Struempfe) korrekt fortfuehren"
        ],
        "k": 3,
        "s": "mittel",
        "erkl": "Bewegung aktiviert die Muskelpumpe und beugt Thrombosen vor. Die aerztlich verordnete Prophylaxe (medikamentoes und/oder Kompression) wird zu Hause konsequent fortgefuehrt. Langes Sitzen mit haengenden Beinen und einseitige Bettruhe erhoehen das Risiko."
      }
    ]
  },
  {
    "id": "gf-depression-ambulant",
    "aktiv": true,
    "kontext": "Ambulante psychiatrische Pflege",
    "titel": "Herr Novak, 55 Jahre - Depression nach Jobverlust",
    "einleitung": "Herr Novak, 55 Jahre, wird nach einem Klinikaufenthalt wegen einer schweren depressiven Episode ambulant weiterbetreut. Er hat vor einem Jahr seinen Arbeitsplatz verloren, lebt getrennt und hat wenig sozialen Kontakt. Beim ersten Hausbesuch wirkt die Wohnung ungepflegt, er ist unrasiert, spricht leise und verlangsamt. Er sagt, er nehme seine Medikamente 'meistens', und Essen sei ihm 'egal'.",
    "fragen": [
      {
        "kapitel": "Erstkontakt",
        "frage": "Welche Grundhaltung ist beim Erstkontakt mit Herrn Novak am wichtigsten?",
        "opt": [
          "Empathisch, geduldig und wertschaetzend eine Beziehung aufbauen",
          "Ihn mit Aufgaben unter Druck setzen",
          "Ihm sagen, er solle sich zusammenreissen",
          "Distanziert nur die Fakten abfragen"
        ],
        "k": 0,
        "s": "leicht",
        "erkl": "Vertrauen ist die Basis jeder psychiatrischen Pflege. Empathie, Geduld und Wertschaetzung ermoeglichen eine tragfaehige Beziehung. Druck und Bagatellisierung ('zusammenreissen') schaden und verstaerken Rueckzug und Scham."
      },
      {
        "kapitel": "Erstkontakt",
        "frage": "Herr Novak sagt, Essen sei ihm 'egal'. Warum ist das pflegerisch bedeutsam?",
        "opt": [
          "Es ist unwichtig, solange er seine Medikamente zuverlaessig einnimmt",
          "Appetitverlust und Vernachlaessigung koennen Krankheitszeichen sein und die Gesundheit gefaehrden",
          "Ausschliesslich sein aktuelles Koerpergewicht ist dabei entscheidend",
          "Das betrifft allein den behandelnden Arzt und nicht die Pflege"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Appetitverlust, Antriebsstoerung und Selbstvernachlaessigung sind typische Symptome der Depression. Sie koennen zu Mangelernaehrung und koerperlicher Verschlechterung fuehren - die Ernaehrungssituation ist deshalb pflegerelevant."
      },
      {
        "kapitel": "Assessment",
        "frage": "Er berichtet, die Medikamente nur 'meistens' zu nehmen. Wie gehst du damit um?",
        "opt": [
          "Ihn wegen der unregelmaessigen Einnahme beschuldigen und ermahnen",
          "Ihm die Medikamente ohne sein Wissen heimlich ins Essen geben",
          "Nicht-wertend nach Gruenden fragen und ueber die Bedeutung der regelmaessigen Einnahme informieren",
          "Die unregelmaessige Einnahme uebergehen und nicht ansprechen"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Non-Adhaerenz hat oft Gruende (Nebenwirkungen, Hoffnungslosigkeit, Vergessen). Ein nicht-wertendes Gespraech, Aufklaerung ueber Wirkung und Wichtigkeit sowie praktische Hilfen (z. B. Dosierhilfe) foerdern die Einnahmetreue. Heimliche Gabe ist unzulaessig."
      },
      {
        "kapitel": "Assessment",
        "frage": "Welche Aussage von Herrn Novak erfordert deine hoechste Aufmerksamkeit?",
        "opt": [
          "Die Aussage, dass er in letzter Zeit sehr schlecht schlafe",
          "Die Aussage, dass er kaum noch Appetit auf Essen habe",
          "Die Aussage, dass er sich tagsueber oft muede und erschoepft fuehle",
          "'Manchmal denke ich, es waere besser, nicht mehr da zu sein.'"
        ],
        "k": 3,
        "s": "schwer",
        "erkl": "Aeusserungen, die auf lebensmuede Gedanken hindeuten, haben hoechste Prioritaet. Sie muessen ernst genommen und aktiv angesprochen werden, um Suizidalitaet einzuschaetzen und Schutz zu organisieren."
      },
      {
        "kapitel": "Krise",
        "frage": "Du sprichst ihn direkt auf Suizidgedanken an. Warum ist dieses offene Nachfragen richtig?",
        "opt": [
          "Offenes Ansprechen erhoeht das Risiko nicht, sondern entlastet und ermoeglicht Hilfe",
          "Das offene Ansprechen bringt ihn erst auf entsprechende Gedanken",
          "Ein solches Thema sollte man im Gespraech besser ganz vermeiden",
          "Ueber Suizidgedanken darf ausschliesslich der Arzt sprechen"
        ],
        "k": 0,
        "s": "schwer",
        "erkl": "Ein verbreiteter Irrtum ist, dass Nachfragen Suizidalitaet ausloese. Das Gegenteil ist der Fall: Direktes, einfuehlsames Ansprechen entlastet Betroffene und ist Voraussetzung, um Gefahr einzuschaetzen und Hilfe einzuleiten."
      },
      {
        "kapitel": "Krise",
        "frage": "Herr Novak bestaetigt Suizidgedanken, verneint aber einen konkreten Plan. Was ist jetzt richtig?",
        "opt": [
          "Den Hausbesuch wie geplant in Ruhe und ohne weitere Schritte zu Ende bringen",
          "Situation ernst nehmen, nicht allein lassen bzw. Sicherheit organisieren und umgehend aerztliche/therapeutische Hilfe einbeziehen",
          "Ihm ein Beruhigungsmittel aus der eigenen Hausapotheke zur Entspannung anbieten",
          "Das belastende Thema erst beim naechsten vereinbarten Hausbesuch wieder aufgreifen"
        ],
        "k": 1,
        "s": "schwer",
        "erkl": "Auch ohne konkreten Plan ist Suizidalitaet ernst. Die Pflegekraft sorgt fuer Sicherheit, laesst die Person nicht ungeschuetzt allein und bindet umgehend aerztliche bzw. therapeutische Hilfe ein. Eigenmaechtige Medikamentengabe ist unzulaessig."
      },
      {
        "kapitel": "Stabilisierung",
        "frage": "In den folgenden Wochen bessert sich Herr Novaks Antrieb, die Stimmung bleibt aber gedrueckt. Warum ist gerade jetzt Aufmerksamkeit wichtig?",
        "opt": [
          "Weil mit der Besserung nun keinerlei Gefahr mehr besteht",
          "Weil die pflegerische Betreuung an dieser Stelle regulaer endet",
          "Weil mit zurueckkehrendem Antrieb das Suizidrisiko voruebergehend steigen kann",
          "Weil eine weitere Beobachtung jetzt ueberfluessig geworden ist"
        ],
        "k": 2,
        "s": "schwer",
        "erkl": "In der Phase beginnender Besserung kann der Antrieb zurueckkehren, bevor sich die Stimmung stabilisiert. Dadurch kann voruebergehend die Gefahr steigen, Suizidgedanken umzusetzen. Diese Phase erfordert besondere Wachsamkeit."
      },
      {
        "kapitel": "Foerderung",
        "frage": "Wie foerderst du Herrn Novaks Selbstversorgung (Koerperpflege, Haushalt) am besten?",
        "opt": [
          "Ihm saemtliche anfallenden Aufgaben vollstaendig abnehmen",
          "Ihn nachdruecklich zu allen Taetigkeiten gleichzeitig draengen",
          "Es ihm ganz allein ueberlassen, ohne jede Unterstuetzung",
          "Kleinschrittig aktivieren, erreichbare Ziele setzen und Erfolge anerkennen"
        ],
        "k": 3,
        "s": "mittel",
        "erkl": "Aktivierende Pflege bei Depression bedeutet, in kleinen, machbaren Schritten zu foerdern, realistische Ziele zu vereinbaren und Erreichtes wertzuschaetzen. Komplette Uebernahme foerdert Passivitaet, Ueberforderung fuehrt zu Misserfolg."
      },
      {
        "kapitel": "Foerderung",
        "frage": "Welche Massnahme wirkt der sozialen Isolation von Herrn Novak entgegen?",
        "opt": [
          "Gemeinsam Kontakt- und Tagesstrukturangebote (z. B. Tagesstaette, Gruppen) erarbeiten",
          "Ihm raten, sich zum Schutz besser weiter zurueckzuziehen",
          "Besuche bei ihm grundsaetzlich und moeglichst ganz vermeiden",
          "Ihn ohne Ruecksicht zu sozialen Kontakten draengen und zwingen"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Soziale Isolation verstaerkt Depression. Gemeinsam - im Tempo des Betroffenen - Kontaktmoeglichkeiten und eine Tagesstruktur zu entwickeln, foerdert Teilhabe. Zwang ist kontraproduktiv, Rueckzug zu bestaerken ebenfalls."
      },
      {
        "kapitel": "Verlauf",
        "frage": "Herr Novak fragt, ob er die Medikamente absetzen koenne, da es ihm besser gehe. Wie antwortest du?",
        "opt": [
          "'Ja, wenn Sie sich deutlich besser fuehlen, koennen Sie damit aufhoeren.'",
          "'Das entscheidet der Arzt - Antidepressiva werden nicht eigenmaechtig abgesetzt, auch bei Besserung.'",
          "'Nehmen Sie ab jetzt einfach nur noch die halbe Dosis ein.'",
          "'Ob Sie die Medikamente nehmen, ist letztlich Ihre eigene Sache.'"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Antidepressiva werden auch nach Besserung ueber laengere Zeit weitergenommen und nur in aerztlicher Absprache langsam reduziert. Eigenmaechtiges Absetzen erhoeht das Rueckfallrisiko. Die Pflegekraft informiert und verweist an den Arzt."
      },
      {
        "kapitel": "Angehoerige",
        "frage": "Herrn Novaks erwachsene Tochter meldet sich und moechte helfen, weiss aber nicht wie. Was ist sinnvoll?",
        "opt": [
          "Ihr mitteilen, sie solle sich aus der Behandlung heraushalten",
          "Ihr auch ohne seine Zustimmung alle Einzelheiten weitergeben",
          "Sie - mit Einverstaendnis von Herrn Novak - einbeziehen und ueber unterstuetzenden Umgang informieren",
          "Ihr Angebot uebergehen und die Tochter nicht weiter einbeziehen"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Angehoerige sind eine wichtige Ressource. Mit Einverstaendnis des Betroffenen (Schweigepflicht!) koennen sie einbezogen und beraten werden, wie sie unterstuetzend begleiten, ohne zu ueberfordern. Ohne Zustimmung duerfen keine Details weitergegeben werden."
      },
      {
        "kapitel": "Verlauf",
        "frage": "Woran erkennst du insgesamt, dass die ambulante psychiatrische Pflege bei Herrn Novak wirkt?",
        "opt": [
          "Dass er im weiteren Verlauf eher zufaellig wieder etwas an Koerpergewicht zunimmt",
          "Dass er in den Gespraechen insgesamt deutlich weniger mit dir spricht als anfangs",
          "Dass seine Wohnung unveraendert im gleichen ungepflegten Zustand bleibt",
          "Bessere Selbstversorgung, stabilere Einnahmetreue, mehr Kontakte und Tagesstruktur, keine akute Suizidalitaet"
        ],
        "k": 3,
        "s": "mittel",
        "erkl": "Wirksamkeit zeigt sich an konkreten, beobachtbaren Verbesserungen: Selbstversorgung, Medikamententreue, sozialer Teilhabe, Tagesstruktur und Abwesenheit akuter Suizidalitaet. Solche Ziele werden gemeinsam ueberprueft und angepasst."
      }
    ]
  }
];
