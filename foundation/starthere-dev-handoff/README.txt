StartHere developer handoff
===========================

The two scripts end in .txt so email will accept them.
Rename them before use:

  lessons/seed-lessons.js.txt           -> seed-lessons.js
  scamcheck-eval/run-scamcheck-eval.js.txt -> run-scamcheck-eval.js

Contents
  lessons/lessons.json                  10 micro lessons for the Firestore "lessons" collection
  lessons/seed-lessons.js               Seeds lessons into Firestore (needs firebase-admin)
  scamcheck-eval/scamcheck-testset.json 30 labelled messages (15 scam, 15 legit) + pass criteria
  scamcheck-eval/scamcheck-testset.csv  Same test set as a spreadsheet
  scamcheck-eval/run-scamcheck-eval.js  Runs the test set against the scamCheckEval endpoint

Full spec (architecture, features, data model, AI design): see the shared StartHere spec doc.
