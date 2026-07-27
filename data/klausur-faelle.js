/* PLAN NRW - Klausur-Fallbloecke (Schritt 2 Probeklausur).
   Ein Fall + mehrere fallbezogene MC-Aufgaben. Variiert nach PflAPrV § 14:
   Versorgungskontext, Altersstufe, Pflegeanlass.
   Fachlich geprueft: Jessica Schenkelberger. Nicht direkt bearbeiten.
   Antwort-Positionen bewusst gleichmaessig verteilt. */
var KLAUSUR_FAELLE = [
  {
    "id": "fall-herzinsuff",
    "kontext": "Krankenhaus, internistische Station",
    "titel": "Herzinsuffizienz, 74-jaehriger Mann",
    "fall": "Herr K., 74 Jahre, wird mit zunehmender Luftnot und geschwollenen Beinen stationaer aufgenommen. Er berichtet, nachts schlecht flach liegen zu koennen und in den letzten 3 Tagen 2,5 kg zugenommen zu haben. RR 158/94 mmHg, Puls 96/min unregelmaessig, SpO2 90 % bei Raumluft, Atemfrequenz 24/min. Bekannt sind eine chronische Herzinsuffizienz und Vorhofflimmern.",
    "fragen": [
      {
        "frage": "Welche Beobachtung deutet am deutlichsten auf eine kardiale Dekompensation mit Fluessigkeitseinlagerung hin?",
        "opt": [
          "Die Gewichtszunahme von 2,5 kg in 3 Tagen",
          "Der unregelmaessige Puls",
          "Der erhoehte Blutdruck",
          "Das Alter des Patienten"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Eine rasche Gewichtszunahme ist das sensibelste Zeichen einer Fluessigkeitsretention bei Herzinsuffizienz. Taegliches Wiegen unter gleichen Bedingungen gehoert deshalb zur Standardueberwachung. Der unregelmaessige Puls passt zum bekannten Vorhofflimmern, erklaert aber nicht die akute Verschlechterung."
      },
      {
        "frage": "Welche Lagerung entlastet Herrn K. bei akuter Luftnot am wirksamsten?",
        "opt": [
          "Flache Rueckenlage",
          "Oberkoerperhochlagerung mit haengenden Beinen (Herzbettlagerung)",
          "Stabile Seitenlage",
          "Kopftieflagerung"
        ],
        "k": 1,
        "s": "leicht",
        "erkl": "Die Herzbettlagerung (Oberkoerper hoch, Beine tief) verringert den venoesen Rueckstrom zum Herzen und senkt die Vorlast, was die Atemarbeit erleichtert. Flaches Liegen verstaerkt die Luftnot bei Herzinsuffizienz typischerweise."
      },
      {
        "frage": "Herr K. soll bilanziert werden. Was gehoert zwingend zur korrekten Fluessigkeitsbilanzierung?",
        "opt": [
          "Nur die Trinkmenge dokumentieren",
          "Nur die Urinausscheidung messen",
          "Ein- und Ausfuhr vollstaendig erfassen und gegenueberstellen",
          "Einmal taeglich den Blutdruck messen"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Eine Fluessigkeitsbilanz erfordert die vollstaendige Erfassung von Einfuhr (Trinken, Infusionen, Sondenkost) und Ausfuhr (Urin, Drainagen, Erbrechen) und deren Gegenueberstellung. Nur so laesst sich eine positive oder negative Bilanz erkennen."
      },
      {
        "frage": "Welche Kombination von Vitalwerten sollte umgehend an den Arzt gemeldet werden?",
        "opt": [
          "RR 120/80, Puls 72, SpO2 98 %, AF 14",
          "RR 130/85, Puls 80, SpO2 96 %, AF 16",
          "RR 125/78, Puls 68, SpO2 97 %, AF 15",
          "RR 158/94, Puls 96, SpO2 90 %, AF 24"
        ],
        "k": 3,
        "s": "mittel",
        "erkl": "Die erste Kombination zeigt eine Sauerstoffsaettigung von nur 90 % bei gleichzeitig erhoehter Atemfrequenz und Herzfrequenz - Zeichen einer respiratorischen Belastung bei Dekompensation. Das erfordert aerztliche Ruecksprache und ggf. Sauerstoffgabe nach Anordnung."
      }
    ]
  },
  {
    "id": "fall-postop",
    "kontext": "Krankenhaus, chirurgische Station",
    "titel": "Erster postoperativer Tag nach Hueft-TEP, 68-jaehrige Frau",
    "fall": "Frau M., 68 Jahre, ist am Vortag mit einer Hueft-Totalendoprothese versorgt worden. Am ersten postoperativen Tag klagt sie ueber Schmerzen (NRS 6/10) und moechte lieber im Bett bleiben. Der Verband ist trocken, die Wunddrainage foerdert maessig blutig. RR 110/70, Puls 88, Temperatur 37,8 Grad.",
    "fragen": [
      {
        "frage": "Warum ist die Fruehmobilisation trotz der Schmerzen wichtig?",
        "opt": [
          "Sie senkt das Risiko fuer Thrombose, Pneumonie und Dekubitus",
          "Sie beschleunigt die Wundheilung direkt",
          "Sie ist nur aus Kostengruenden vorgeschrieben",
          "Sie ersetzt die Schmerztherapie"
        ],
        "k": 0,
        "s": "leicht",
        "erkl": "Fruehmobilisation ist eine zentrale Prophylaxe: Bewegung aktiviert die Muskelpumpe (Thromboseprophylaxe), verbessert die Belueftung der Lunge (Pneumonieprophylaxe) und entlastet gefaehrdete Hautstellen (Dekubitusprophylaxe). Voraussetzung ist eine ausreichende Schmerztherapie."
      },
      {
        "frage": "Was ist vor der geplanten Mobilisation pflegerisch am wichtigsten?",
        "opt": [
          "Die Patientin ueberreden, es einfach zu versuchen",
          "Eine bedarfsgerechte Schmerzmedikation nach Anordnung rechtzeitig verabreichen",
          "Die Drainage sofort ziehen",
          "Die Mobilisation auf den naechsten Tag verschieben"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Schmerz ist das Haupthindernis der Mobilisation. Eine rechtzeitig - also mit Wirkeintritt vor der Mobilisation - verabreichte Schmerzmedikation nach aerztlicher Anordnung ermoeglicht ein schmerzarmes Aufstehen und foerdert die Kooperation."
      },
      {
        "frage": "Bei welchem Zeichen besteht der Verdacht auf eine tiefe Beinvenenthrombose?",
        "opt": [
          "Beidseitig warme Fuesse",
          "Trockener Wundverband",
          "Einseitige Schwellung, Ueberwaermung und Schmerz der Wade",
          "Temperatur von 37,8 Grad"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Eine einseitige Wadenschwellung mit Ueberwaermung, Spannungsgefuehl und Schmerz ist ein Warnzeichen fuer eine tiefe Beinvenenthrombose und muss aerztlich abgeklaert werden. Die leicht erhoehte Temperatur allein ist postoperativ zunaechst unspezifisch."
      },
      {
        "frage": "Die Wunddrainage foerdert ploetzlich stark hellrot und die Patientin wird blass und tachykard. Wie handelst du?",
        "opt": [
          "Abwarten und in einer Stunde erneut kontrollieren",
          "Die Drainage abklemmen und nichts dokumentieren",
          "Der Patientin etwas zu trinken geben",
          "Vitalzeichen kontrollieren und umgehend den Arzt informieren"
        ],
        "k": 3,
        "s": "schwer",
        "erkl": "Eine ploetzlich starke hellrote Foerderung mit Blaesse und Tachykardie kann auf eine Nachblutung mit beginnendem Volumenmangel hindeuten. Vitalzeichen erheben und sofortige aerztliche Information sind zwingend - das ist eine potenziell kritische Situation."
      }
    ]
  },
  {
    "id": "fall-geriatrie",
    "kontext": "Stationaere Langzeitpflege",
    "titel": "Verwirrtheit bei 85-jaehriger Bewohnerin",
    "fall": "Frau S., 85 Jahre, lebt seit zwei Jahren im Pflegeheim und ist normalerweise orientiert und freundlich. Seit gestern ist sie zunehmend verwirrt, zeitlich und oertlich desorientiert, unruhig und sieht Dinge, die nicht da sind. Sie hat seit zwei Tagen wenig getrunken und klagt beim Wasserlassen ueber Brennen.",
    "fragen": [
      {
        "frage": "Welche Ursache der ploetzlichen Verwirrtheit ist bei diesem Verlauf am wahrscheinlichsten?",
        "opt": [
          "Ein akutes Delir, moeglicherweise durch Harnwegsinfekt und Exsikkose",
          "Eine beginnende Demenz",
          "Normale Alterserscheinung",
          "Eine psychische Erkrankung, die schon lange besteht"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Ein ploetzlicher Beginn (Stunden bis Tage), fluktuierender Verlauf, Desorientierung und optische Halluzinationen sprechen fuer ein Delir - im Gegensatz zur schleichend beginnenden Demenz. Haeufige Ausloeser bei alten Menschen sind Infekte (hier Harnwegsinfekt) und Fluessigkeitsmangel."
      },
      {
        "frage": "Was ist die wichtigste pflegerische Sofortmassnahme?",
        "opt": [
          "Die Bewohnerin fixieren, damit sie sich nicht verletzt",
          "Reizarme, sichere Umgebung schaffen, Fluessigkeit anbieten und den Arzt informieren",
          "Sie allein lassen, bis sie sich beruhigt",
          "Ihr ein Schlafmittel geben"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Beim Delir gilt: Ausloeser behandeln lassen (Arzt informieren), Sicherheit und Reorientierung geben, ausreichend Fluessigkeit anbieten. Fixierung und pauschale Sedierung koennen ein Delir verschlimmern und sind nur letztes Mittel unter strengen Voraussetzungen."
      },
      {
        "frage": "Welche Massnahme beugt einem erneuten Delir am besten vor?",
        "opt": [
          "Moeglichst viel Bettruhe",
          "Die Bewohnerin taeglich testen",
          "Ausreichende Fluessigkeitszufuhr, Tag-Nacht-Rhythmus, Brille und Hoergeraet, Reorientierung",
          "Besuche der Angehoerigen verbieten"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Delirprophylaxe bedeutet, die haeufigen Ausloeser zu vermeiden: genug trinken, Orientierung foerdern (Uhr, Kalender, Tageslicht), Seh- und Hoerhilfen bereitstellen und vertraute Bezugspersonen einbeziehen. Immobilitaet und Isolation erhoehen das Risiko."
      },
      {
        "frage": "Warum ist die reduzierte Trinkmenge bei alten Menschen besonders kritisch?",
        "opt": [
          "Alte Menschen brauchen kaum Fluessigkeit",
          "Trinken spielt im Alter keine Rolle",
          "Nur die Nahrungsmenge ist wichtig",
          "Das Durstempfinden ist im Alter vermindert, wodurch ein Fluessigkeitsmangel leicht uebersehen wird"
        ],
        "k": 3,
        "s": "leicht",
        "erkl": "Im Alter nimmt das Durstempfinden physiologisch ab. Aeltere Menschen trinken dadurch oft zu wenig, ohne Durst zu verspueren - eine Exsikkose entsteht schleichend und kann Delir, Sturz und Nierenschaeden beguenstigen. Aktives Anbieten von Getraenken ist deshalb zentral."
      }
    ]
  },
  {
    "id": "fall-paediatrie",
    "kontext": "Krankenhaus, Kinderstation",
    "titel": "Fieberkrampf-Sorge bei 3-jaehrigem Kind",
    "fall": "Der 3-jaehrige Tim wird mit hohem Fieber (39,6 Grad) und einem Infekt der oberen Atemwege aufgenommen. Die Mutter ist sehr beunruhigt, weil Tim vor einer Stunde kurz 'komisch gezuckt' habe und danach schlaefrig gewesen sei. Tim ist jetzt wach, trinkt aber wenig.",
    "fragen": [
      {
        "frage": "Wie begegnest du der beunruhigten Mutter am besten?",
        "opt": [
          "Ruhig zuhoeren, die Sorge ernst nehmen und ueber das weitere Vorgehen informieren",
          "Ihr sagen, sie solle sich nicht so anstellen",
          "Das Thema wechseln",
          "Sie aus dem Zimmer schicken"
        ],
        "k": 0,
        "s": "leicht",
        "erkl": "Angehoerige - besonders Eltern - brauchen Ernstnahme und Information. Aktives Zuhoeren, Anerkennen der Sorge und transparente Aufklaerung ueber die naechsten Schritte reduzieren Angst und staerken das Vertrauen. Bagatellisieren ist immer falsch."
      },
      {
        "frage": "Welche Massnahme ist bei hohem Fieber pflegerisch sinnvoll?",
        "opt": [
          "Das Kind warm einpacken",
          "Ausreichend Fluessigkeit anbieten und nach Anordnung fiebersenkende Massnahmen durchfuehren",
          "Kaltes Wasser ueber das Kind giessen",
          "Nichts tun und abwarten"
        ],
        "k": 1,
        "s": "leicht",
        "erkl": "Bei Fieber steigt der Fluessigkeitsbedarf - regelmaessiges Anbieten kleiner Trinkmengen ist wichtig. Fiebersenkende Massnahmen (Medikamente, ggf. Wadenwickel) erfolgen nach aerztlicher Anordnung. Warmes Einpacken staut die Waerme, abruptes Abkuehlen ist schaedlich."
      },
      {
        "frage": "Was ist bei der Beobachtung eines fieberhaften Kleinkindes besonders zu beachten?",
        "opt": [
          "Nur die Koerpertemperatur",
          "Ausschliesslich das Gewicht",
          "Bewusstseinslage, Trinkverhalten, Hautkolorit und Atmung im Verlauf",
          "Nur die Herzfrequenz"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Bei Kleinkindern verschlechtert sich der Zustand schnell. Neben der Temperatur sind Bewusstsein, Trinkmenge (Dehydratationsgefahr), Hautfarbe und Atemmuster entscheidend, um eine Verschlechterung fruehzeitig zu erkennen."
      },
      {
        "frage": "Warum trinkt Tim zu wenig - und warum ist das ein Problem?",
        "opt": [
          "Kinder brauchen wenig Fluessigkeit; das ist unkritisch",
          "Trinken ist bei Kindern nebensaechlich",
          "Nur feste Nahrung zaehlt",
          "Fieber und Infekt erhoehen den Bedarf, waehrend krankheitsbedingt weniger getrunken wird - Dehydratationsgefahr"
        ],
        "k": 3,
        "s": "mittel",
        "erkl": "Kinder haben im Verhaeltnis zum Koerpergewicht einen hohen Fluessigkeitsbedarf und dehydrieren schneller als Erwachsene. Fieber steigert den Bedarf zusaetzlich. Trinkt das Kind gleichzeitig weniger, droht rasch eine Exsikkose - engmaschige Beobachtung und aktives Anbieten sind noetig."
      }
    ]
  },
  {
    "id": "fall-psychiatrie",
    "kontext": "Psychiatrische Klinik",
    "titel": "Antriebslosigkeit bei 22-jaehrigem Patienten mit Depression",
    "fall": "Herr L., 22 Jahre, ist wegen einer schweren depressiven Episode aufgenommen. Er bleibt fast den ganzen Tag im Bett, spricht wenig, vernachlaessigt die Koerperpflege und aeussert, dass 'alles sinnlos' sei. Beim Morgengespraech sagt er leise, er wisse nicht, ob er 'das alles noch durchhalten' koenne.",
    "fragen": [
      {
        "frage": "Wie reagierst du auf die Aeusserung, er wisse nicht, ob er 'das durchhalten' koenne?",
        "opt": [
          "Ihn direkt, ruhig und wertschaetzend auf moegliche Suizidgedanken ansprechen",
          "Die Aussage ignorieren, um ihn nicht zu beunruhigen",
          "Ihm sagen, er solle positiv denken",
          "Das Thema wechseln"
        ],
        "k": 0,
        "s": "schwer",
        "erkl": "Anzeichen moeglicher Suizidalitaet muessen direkt und offen angesprochen werden - das offene Fragen erhoeht das Risiko nicht, sondern entlastet und ermoeglicht Hilfe. Wichtig sind eine ruhige, wertschaetzende Haltung und die umgehende Information des Behandlungsteams."
      },
      {
        "frage": "Wie foerderst du die Koerperpflege bei ausgepraegter Antriebslosigkeit am besten?",
        "opt": [
          "Die Pflege komplett fuer ihn uebernehmen",
          "Kleinschrittig anleiten, Aktivitaeten anbieten und erreichbare Ziele setzen",
          "Ihn zur Pflege zwingen",
          "Die Koerperpflege ganz weglassen"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Bei depressionsbedingter Antriebsstoerung hilft aktivierende Pflege: kleinschrittige Anleitung, konkrete, erreichbare Ziele und Ermutigung ohne Ueberforderung. Komplette Uebernahme foerdert Passivitaet, Zwang schaedigt die Beziehung."
      },
      {
        "frage": "Welche Haltung ist im Umgang mit depressiven Menschen grundlegend?",
        "opt": [
          "Aufmunternde Sprueche wie 'Kopf hoch, wird schon'",
          "Distanz halten, um nicht zu belasten",
          "Empathisches, geduldiges Dasein ohne Bagatellisieren der Beschwerden",
          "Leistung einfordern"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Depressive Menschen erleben gut gemeinte Aufmunterung oft als Druck und Unverstandensein. Hilfreich sind Empathie, Geduld, verlaessliche Praesenz und das Ernstnehmen der Beschwerden - ohne sie kleinzureden."
      },
      {
        "frage": "Warum ist gerade die Phase beginnender Besserung bei Depression besonders zu beobachten?",
        "opt": [
          "Weil dann keine Gefahr mehr besteht",
          "Weil die Behandlung dann endet",
          "Weil Beobachtung dann ueberfluessig wird",
          "Weil mit wiederkehrendem Antrieb das Suizidrisiko voruebergehend steigen kann"
        ],
        "k": 3,
        "s": "schwer",
        "erkl": "In der Phase beginnender Besserung kann der Antrieb zurueckkehren, bevor sich die Stimmung stabilisiert - dadurch kann das Risiko, Suizidgedanken in die Tat umzusetzen, voruebergehend steigen. Diese Phase erfordert besondere Aufmerksamkeit."
      }
    ]
  },
  {
    "id": "fall-notfall",
    "kontext": "Krankenhaus, Akutsituation",
    "titel": "Akute Verschlechterung, ABCDE-Einschaetzung",
    "fall": "Du betrittst das Zimmer und findest Frau B., 59 Jahre, deutlich verschlechtert vor: Sie ist nur noch schwer erweckbar, atmet schnell und flach, die Lippen wirken blaeulich. Du bist allein im Zimmer.",
    "fragen": [
      {
        "frage": "Was ist dein allererster Schritt?",
        "opt": [
          "Ansprechbarkeit pruefen und Hilfe rufen / Notruf absetzen",
          "Die Blutdruckmanschette anlegen",
          "Erst die Kurve lesen",
          "Die Angehoerigen anrufen"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Bei einer akut kritischen Situation gilt: Bewusstsein pruefen und sofort Hilfe holen, damit weitere Kraefte und Material kommen. Alleiniges Handeln ohne Hilferuf verzoegert die Versorgung. Erst danach folgt die strukturierte Einschaetzung."
      },
      {
        "frage": "Nach welchem Schema schaetzt du die Situation strukturiert ein?",
        "opt": [
          "Von Kopf bis Fuss ohne Reihenfolge",
          "ABCDE: Atemweg, Atmung, Kreislauf, neurologischer Status, Umgebung",
          "Zuerst die Haut, dann alles Weitere",
          "Nur die Sauerstoffsaettigung"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Das ABCDE-Schema priorisiert nach Lebensbedrohlichkeit: A (Airway/Atemweg), B (Breathing/Atmung), C (Circulation/Kreislauf), D (Disability/neurologischer Status), E (Exposure/Umgebung). So wird das Gefaehrlichste zuerst erkannt und behandelt."
      },
      {
        "frage": "Die blaeulichen Lippen deuten worauf hin?",
        "opt": [
          "Auf Fieber",
          "Auf Kaelte im Zimmer allein",
          "Auf eine Zyanose als Zeichen von Sauerstoffmangel",
          "Auf eine harmlose Verfaerbung"
        ],
        "k": 2,
        "s": "leicht",
        "erkl": "Blaeuliche Lippen und Haut (Zyanose) sind ein Zeichen fuer eine unzureichende Sauerstoffversorgung des Blutes. Zusammen mit der schnellen, flachen Atmung und der Bewusstseinstruebung ist das ein Alarmzeichen (Problem bei A/B im ABCDE)."
      },
      {
        "frage": "Welche Information ist bei der Uebergabe an das eintreffende Team am wichtigsten?",
        "opt": [
          "Das Lieblingsessen der Patientin",
          "Nur der Name",
          "Die Zimmernummer allein",
          "Strukturierte Uebergabe: Situation, Vitalzeichen, Bewusstsein, bisherige Massnahmen"
        ],
        "k": 3,
        "s": "mittel",
        "erkl": "Eine strukturierte Uebergabe (z. B. nach ISBAR: Situation, Hintergrund, Einschaetzung, Empfehlung) mit Vitalzeichen, Bewusstseinslage und bereits ergriffenen Massnahmen ermoeglicht dem Team ein schnelles, sicheres Weiterhandeln."
      }
    ]
  },
  {
    "id": "fall-palliativ",
    "kontext": "Palliativversorgung / Hospiz",
    "titel": "Belastende Atemnot bei palliativer Patientin, 71 Jahre",
    "fall": "Frau W., 71 Jahre, befindet sich in der letzten Lebensphase bei fortgeschrittener Tumorerkrankung. Sie leidet unter belastender Atemnot und Angst. Die Angehoerigen sind anwesend und wirken hilflos und ueberfordert.",
    "fragen": [
      {
        "frage": "Was steht in der palliativen Pflege bei belastender Atemnot im Vordergrund?",
        "opt": [
          "Linderung der Symptome und des Leidens (Symptomkontrolle, Comfort)",
          "Die vollstaendige Heilung anzustreben",
          "Moeglichst viele diagnostische Massnahmen",
          "Die Patientin zur Mobilisation draengen"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Palliative Pflege zielt auf bestmoegliche Lebensqualitaet und Linderung von belastenden Symptomen, nicht auf Heilung. Bei Atemnot stehen Symptomkontrolle, beruhigende Praesenz, Lagerung und - nach Anordnung - medikamentoese Linderung im Vordergrund."
      },
      {
        "frage": "Welche pflegerische Massnahme kann die Atemnot unmittelbar lindern?",
        "opt": [
          "Flachlagerung",
          "Oberkoerperhochlagerung, ruhige Praesenz, frische Luft / kuehler Luftzug",
          "Das Fenster schliessen und allein lassen",
          "Zur Eile draengen"
        ],
        "k": 1,
        "s": "leicht",
        "erkl": "Eine aufrechte Lagerung erleichtert die Atmung, ruhige Anwesenheit reduziert die Angst (die Atemnot verstaerkt), und ein kuehler Luftzug (z. B. Ventilator, offenes Fenster) wird von vielen Betroffenen als lindernd empfunden."
      },
      {
        "frage": "Wie beziehst du die ueberforderten Angehoerigen ein?",
        "opt": [
          "Sie aus dem Zimmer bitten",
          "Ihnen sagen, sie sollen sich zusammenreissen",
          "Sie behutsam informieren, einfache Aufgaben anbieten und ihre Gefuehle zulassen",
          "Sie ignorieren"
        ],
        "k": 2,
        "s": "mittel",
        "erkl": "Angehoerige sind Teil der palliativen Begleitung. Behutsame Information, das Angebot einfacher Beteiligung (z. B. Hand halten, Mund befeuchten) und Raum fuer Gefuehle geben Halt und Handlungsfaehigkeit in einer belastenden Situation."
      },
      {
        "frage": "Welche Haltung ist in der Sterbebegleitung zentral?",
        "opt": [
          "Sachliche Distanz ohne Naehe",
          "Die Patientin moeglichst wenig stoeren, also gar nicht ins Zimmer gehen",
          "Ausschliesslich koerperliche Pflege",
          "Wuerde wahren, zuhoeren, da sein und individuelle Wuensche respektieren"
        ],
        "k": 3,
        "s": "leicht",
        "erkl": "Sterbebegleitung heisst, die Wuerde des Menschen zu wahren, zuzuhoeren, praesent zu sein und individuelle Beduerfnisse und Wuensche zu achten. Zugewandte Naehe und aufmerksame Begleitung sind ebenso wichtig wie die koerperliche Versorgung."
      }
    ]
  },
  {
    "id": "fall-ambulant",
    "kontext": "Ambulante Pflege, haeusliches Umfeld",
    "titel": "Diabetisches Fussulkus bei 66-jaehrigem Mann zu Hause",
    "fall": "Herr D., 66 Jahre, mit langjaehrigem Diabetes mellitus Typ 2, wird ambulant versorgt. Beim Hausbesuch entdeckst du an seinem rechten Fuss eine gerötete, druckempfindliche Stelle mit beginnender offener Wunde. Herr D. sagt, er habe davon nichts gespuert. Er lebt allein und kocht selten frisch.",
    "fragen": [
      {
        "frage": "Warum hat Herr D. die Wunde nicht gespuert?",
        "opt": [
          "Eine diabetische Polyneuropathie kann das Schmerz- und Druckempfinden herabsetzen",
          "Er stellt sich unempfindlich",
          "Die Wunde tut grundsaetzlich nicht weh",
          "Er hat zu dicke Socken getragen"
        ],
        "k": 0,
        "s": "mittel",
        "erkl": "Bei langjaehrigem Diabetes schaedigt eine Polyneuropathie die Nerven, wodurch Schmerz- und Druckempfinden am Fuss abnehmen. Verletzungen und Druckstellen werden dadurch oft zu spaet bemerkt - eine Hauptursache des diabetischen Fusssyndroms."
      },
      {
        "frage": "Was ist bei der Wundstelle pflegerisch vorrangig?",
        "opt": [
          "Die Stelle fest verbinden und abwarten",
          "Druckentlastung, fachgerechte Wundversorgung und aerztliche Abklaerung veranlassen",
          "Ein Hausmittel auftragen",
          "Die Wunde offen lassen und nichts weiter tun"
        ],
        "k": 1,
        "s": "mittel",
        "erkl": "Beim diabetischen Fussulkus sind konsequente Druckentlastung, fachgerechte (aseptische) Wundversorgung und die aerztliche Abklaerung entscheidend, um eine Ausbreitung und Infektion zu verhindern. Hausmittel sind ungeeignet."
      },
      {
        "frage": "Welche Beratung ist fuer Herrn D. zur Vorbeugung am wichtigsten?",
        "opt": [
          "Barfuss laufen zur Abhaertung",
          "Die Fuesse moeglichst wenig anschauen",
          "Taegliche Fussinspektion, gut passendes Schuhwerk und regelmaessige Fusspflege",
          "Enge Schuhe tragen"
        ],
        "k": 2,
        "s": "leicht",
        "erkl": "Zur Prophylaxe des diabetischen Fusssyndroms gehoeren tägliche Kontrolle der Fuesse (auch mit Spiegel/Angehoerigen), passendes, druckfreies Schuhwerk und sorgfaeltige Fusspflege. Barfusslaufen und enge Schuhe erhoehen das Verletzungsrisiko."
      },
      {
        "frage": "Herr D. lebt allein und kocht selten frisch. Welcher weitere Aspekt ist relevant?",
        "opt": [
          "Das ist ohne Bedeutung",
          "Nur die Wunde zaehlt",
          "Er sollte einfach mehr essen",
          "Ernaehrungssituation und Blutzuckereinstellung beeinflussen Wundheilung und Verlauf - ggf. weitere Unterstuetzung organisieren"
        ],
        "k": 3,
        "s": "mittel",
        "erkl": "Eine unausgewogene Ernaehrung und schlecht eingestellte Blutzuckerwerte verzoegern die Wundheilung erheblich. Die soziale Situation (Alleinleben, seltenes frisches Kochen) ist pflegerelevant - hier koennen z. B. Ernaehrungsberatung oder weitere Hilfen sinnvoll sein."
      }
    ]
  }
];
