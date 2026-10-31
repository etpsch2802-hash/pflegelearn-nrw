#!/usr/bin/env python3
"""Baut das Morgen-Cockpit: python3 bauen.py daten.json cockpit.html"""
import json, sys, os
h = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(sys.argv[1]))
v = open(os.path.join(h, 'vorlage.html')).read()
out = v.replace('__DATEN__', json.dumps(d, ensure_ascii=False).replace('</', '<\\/'))
open(sys.argv[2], 'w').write(out)
print('ok', sys.argv[2])
