from base import *
from pypdf import PdfReader,PdfWriter
O='/mnt/user-data/outputs/'
parts=[('Prüfungsfragen-Sammlung','PLAN-NRW_Pruefungsfragen-Sammlung_300-Fragen.pdf','300 Fragen mit Erklärungen'),
 ('Mündliche Prüfungssimulation','PLAN-NRW_Muendliche-Pruefungssimulation.pdf','20 Fallbeispiele im Prüfungsdialog'),
 ('Taschenkarten-Set','PLAN-NRW_Taschenkarten-Set_40-Karten.pdf','40 Karten zum Ausschneiden'),
 ('Notfallkarten Anästhesie &amp; Intensiv','PLAN-NRW_Notfallkarten_Anaesthesie-Intensiv.pdf','19 Medikamente'),
 ('Prophylaxen-Kompendium','PLAN-NRW_Prophylaxen-Kompendium.pdf','16 Themen mit Standards'),
 ('Pflegeplanungs-Vorlagen','PLAN-NRW_Pflegeplanungs-Vorlagen.pdf','8 Formulare + Musterbeispiel'),
 ('Dokumentationsvorlagen','PLAN-NRW_Dokumentationsvorlagen.pdf','5 Formulare'),
 ('Reanimation &amp; Notfallalgorithmen','PLAN-NRW_Reanimations-Algorithmen.pdf','4 Algorithmus-Poster'),
 ('Examens-Spickzettel','PLAN-NRW_Examens-Spickzettel.pdf','60+ Kernfakten')]
pages=[len(PdfReader(O+f).pages) for _,f,_ in parts]
start=3; rows=''
for (t,f,d),p in zip(parts,pages):
    rows+=f'<tr><td><b>{t}</b><br><span style="color:#64748b">{d}</span></td><td style="text-align:right;font:700 10pt M;color:#14b8a6">S. {start}</td></tr>'; start+=p
total=start-1
b=cover('Das Komplettpaket fürs Pflegeexamen','Pflegeexamen-<br>Komplettpaket',f'Alle 9 PLAN-Lernhilfen in einem Paket – {total} Seiten Prüfungswissen, Fallbeispiele, Karten, Formulare und Notfall-Poster.',
 ['Schriftlich','Mündlich','Praxis','Notfall','Formulare'],[('9','Lernhilfen'),(str(total),'Seiten'),('A4','druckfertig')],
 'Lernhilfen für Ausbildung und Prüfung. Es gelten deine Lehrinhalte, aktuelle Leitlinien und die Standards deiner Einrichtung.',
 toc=[t for t,_,_ in parts[:8]]+['… und Examens-Spickzettel'])
b+=f'<h2>Inhalt des Komplettpakets</h2><p class="lead">Jede Lernhilfe beginnt mit einem eigenen Deckblatt. Seitenzahlen beziehen sich auf dieses Gesamt-PDF.</p><table class="kv" style="font-size:10pt">{rows}</table>'
build('/tmp/kp_cover.pdf','Pflegeexamen-Komplettpaket',b)
w=PdfWriter(); r=PdfReader('/tmp/kp_cover.pdf')
for pg in r.pages: w.add_page(pg)
pos=len(r.pages)
for (t,f,_),p in zip(parts,pages):
    for pg in PdfReader(O+f).pages: w.add_page(pg)
    w.add_outline_item(t.replace('&amp;','&'),pos); pos+=p
w.add_metadata({'/Title':'PLAN NRW – Pflegeexamen-Komplettpaket','/Author':'Patrick Schenkelberger · plan-nrw.de'})
w.write(O+'PLAN-NRW_Pflegeexamen-Komplettpaket.pdf'); print(len(r.pages),total,pos)
