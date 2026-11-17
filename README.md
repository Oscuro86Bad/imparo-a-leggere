# 🦉 IMPARO A LEGGERE

**App online:** https://oscuro86bad.github.io/imparo-a-leggere/

Applicazione educativa **PWA (Progressive Web App)** per aiutare i bambini di prima elementare
(circa 6 anni) a imparare a leggere: riconoscimento delle lettere, sillabe, parole reali e
inventate, associazione parola-immagine.

- ✅ Funziona su smartphone Android, iPhone, tablet, iPad e computer.
- ✅ Installabile sulla schermata Home (PWA).
- ✅ Funziona **completamente offline**.
- ✅ Nessuna pubblicità, nessun tracciamento.
- ✅ Multi-profilo: ogni bambino ha lettere, esercizi e progressi indipendenti.
- ✅ I dati restano sul dispositivo (privacy, GDPR: nessun dato dei minori raccolto online).

---

## 🚀 Come usare l'app subito (senza installare nulla)

1. Apri il file `index.html` con un doppio clic (l'app funziona anche così).
2. Crea il profilo del bambino (nome + mascotte).
3. Entra in **AREA GENITORI → Lettere** e attiva le lettere già studiate a scuola
   (es. vocali + P + M).
4. Entra in **AREA GENITORI → Combinazioni** e attiva solo le sillabe davvero studiate
   (es. PA, PE, PI, PO, PU…).
5. Il bambino usa **SOLO LETTURA** e **LEGGI E GUARDA**.

> Nota: per l'installazione come PWA e l'offline completo serve servire l'app via `http(s)`
> (GitHub Pages, o un mini-server locale, vedi sotto). Aprendo il file direttamente
> (`file://`) l'app funziona lo stesso, ma il service worker non viene registrato.

### Mini-server locale (consigliato per provare la PWA)

Con Python installato:
```
cd "IMPARO A LEGGERE"
python -m http.server 8080
```
poi apri `http://localhost:8080`.
In alternativa basta l'estensione *Live Server* di VS Code.

---

## 🖼️ Funzionalità

### SOLO LETTURA
- Categorie: **lettere** (vocali/consonanti), **sillabe**, **parole reali**,
  **parole inventate** foneticamente corrette (contrassegnate come «senza significato»).
- Tipo di parole selezionabile dal genitore: solo reali / solo inventate / miste.
- Lunghezza selezionabile: 2, 3, 4, 5, 6 lettere.
- Pulsanti: **NUOVO**, **RIPETI**, **CORRETTO**, **RITENTA**, **TORNA AL MENU**.
- Stelle e messaggi incoraggianti, senza obiettivi né premi: l'app serve solo come ripasso.
- Anti-ripetizione: gli ultimi 15 esercizi non vengono riproposti subito.

### LEGGI E GUARDA
1. Compare una sillaba o parola → il bambino legge ad alta voce.
2. Il genitore conferma con **CORRETTO**.
3. Compare l'immagine associata con la parola completa (PA → 🦆 PAPERA).
4. Le parole inventate mostrano una mascotte divertente, **mai** un falso significato.
5. Le associazioni vengono proposte **solo** se la parola associata rispetta le lettere
   e le combinazioni abilitate.

### AREA GENITORI (protetta da PIN opzionale a 4 cifre)
- **Profili**: profili multipli indipendenti, modifica, eliminazione.
- **Lettere**: alfabeto italiano completo, vocali e consonanti distinte, attivazione
  individuale, pulsante «Tutte le vocali», salvataggio automatico.
- **Combinazioni**: per ogni consonante attiva si scelgono le sillabe studiate
  (PA, PE…) + strutture ortografiche speciali: doppie, gruppi consonantici,
  SC, GN, GLI. *Attivare una lettera non attiva automaticamente le combinazioni.*
- **Esercizi**: tipo di parole, lunghezze, categorie,
  6 livelli di progressione (sempre sotto controllo del genitore, niente avanzamento automatico).
- **Progressi**: stelline, corretti, da ripetere, statistiche
  per lettera e per giorno.
- **Sicurezza**: PIN, esportazione/importazione backup JSON, note privacy.

---

## 🧠 Motore di generazione (controllo linguistico reale)

Nessuna parola casuale: il motore verifica **prima** di proporre qualunque esercizio:

1. tutte le lettere della parola sono abilitate dal genitore;
2. ogni sillaba è stata studiata (sillabe CV per consonante, oppure strutture
   doppiette/gruppi/SC/GN/GLI se e solo se le relative opzioni sono attive);
3. la lunghezza corrisponde a quella selezionata;
4. la classificazione reale/inventata è corretta: le parole inventate sono costruite
   **solo con sillabe studiate** e se per caso coincidono con una parola reale
   dell'archivio vengono classificate come reali (es. PUMA).

Archivio incluso: ~80 parole italiane reali, classificate per lunghezza, difficoltà,
struttura sillabica e disponibilità di immagine (`js/data/words.js`).

---

## 📁 Struttura del progetto

```
IMPARO A LEGGERE/
├── index.html              # app (nessuna build necessaria)
├── manifest.webmanifest    # PWA
├── sw.js                   # service worker (offline)
├── css/style.css
├── js/
│   ├── config.js           # alfabeto, sillabe, livelli, messaggi
│   ├── data/words.js       # archivio parole reali (con immagini)
│   ├── data/associations.js# associazioni sillaba→parola→immagine
│   ├── state/store.js      # profili, impostazioni, progressi (localStorage)
│   ├── engine/generator.js # motore di generazione con controlli didattici
│   ├── ui/*.js             # schermate: home, lettura, leggi e guarda, area genitori
│   └── app.js              # avvio
├── icons/                  # icone (generate con scripts/make-icon.ps1)
├── scripts/make-icon.ps1   # rigenera le icone (Windows, senza dipendenze)
├── supabase/schema.sql     # schema database online (opzionale, vedi sotto)
├── .github/workflows/deploy.yml  # pubblicazione automatica su GitHub Pages
├── test.html               # collaudo automatico del motore
└── README.md
```

---

## ☁️ Pubblicazione online (link condivisibile con la classe)

1. Crea un repository su GitHub (es. `imparo-a-leggere`).
2. Carica tutti i file di questa cartella (branch `main`).
3. In GitHub → **Settings → Pages** → Source: **GitHub Actions**.
4. Il workflow incluso (`.github/workflows/deploy.yml`) pubblica l'app a ogni aggiornamento:
   il link resterà sempre
   **https://oscuro86bad.github.io/imparo-a-leggere/**
   anche dopo le successive modifiche. Repository: https://github.com/Oscuro86Bad/imparo-a-leggere
5. Condividi il link nel gruppo WhatsApp della classe: ogni famiglia crea il proprio profilo.

Gli aggiornamenti del codice **non cancellano i dati**: sono nel localStorage dei dispositivi
delle famiglie. Per non perdere i dati a lungo termine, ogni famiglia può esportare un
backup JSON dall'Area Genitori.

---

## 🔁 Sincronizzazione online tra dispositivi (Supabase) — OPZIONALE, NON ATTIVA

**Stato attuale: NON attiva.** L'app non finge nulla: finché non configuri Supabase, i dati
vivono solo sul dispositivo (con backup JSON manuale).

Per attivarla (richiede un intervento del proprietario):

1. Crea un progetto gratuito su [supabase.com](https://supabase.com).
2. In **SQL Editor** esegui tutto il file `supabase/schema.sql` (include tabelle,
   statistiche e policy **Row Level Security**: ogni famiglia vede solo i suoi dati).
3. In **Authentication → Providers → Email** abilita l'accesso con email (con recupero password).
4. In **Settings → API** copia l'**URL** e la chiave pubblica **anon key**
   (la chiave anon è pensata per il frontend e protetta dalle policy RLS; la
   `service_role key` NON va mai messa nel codice frontend).
5. Sviluppo: integrare `@supabase/supabase-js` nel frontend, mappare
   `js/state/store.js` su tabelle `children`, `child_settings`, `child_stats`,
   `activity`, con coda di sincronizzazione offline (il service worker + `activity`
   permettono di risincronizzare senza duplicati usando un `client_id` esercizio).

Il progetto è già predisposto: schema completo, separazione netta tra dati
(perché il motore non cambia) e policy di sicurezza.

---

## 🧪 Collaudo

Due pagine di collaudo automatico (apribili da browser, anche da `file://`):
- `test.html` — motore di generazione: nessuna lettera non abilitata, nessuna combinazione
  non studiata, correttezza reali/inventate, filtro lunghezza, zero esercizi se tutto spento.
- `uitest.html` — interfaccia completa: creazione profilo, 30 esercizi in SOLO LETTURA con
  controllo delle lettere, ciclo CORRETTO/AVANTI in LEGGI E GUARDA, tutte le schede
  dell'Area Genitori, PIN, stelline e statistiche.

Checklist manuale consigliata (2 minuti):
- [ ] Attiva solo vocali + P: nessuna parola con altre lettere compare.
- [ ] Disattiva PA: la sillaba PA sparisce dagli esercizi.
- [ ] Attiva «Doppie»: compaiono MAMMA, MAPPA, LATTE…
- [ ] Modalità «solo inventate»: le parole mostrano la dicitura «senza significato».
- [ ] CORRETTO aumenta le stelline.
- [ ] PIN: l'Area Genitori è inaccessibile ai bambini senza codice.

---

## 🛠️ Manutenzione

- **Aggiungere parole**: aggiungi una riga in `js/data/words.js`
  (`{ w, s, img, diff }`, con sillabazione e vincoli impliciti).
- **Aggiungere immagini/associazioni**: aggiorna `js/data/associations.js`
  e il campo `img` in `words.js`.
- **Rigenerare le icone**: `powershell -ExecutionPolicy Bypass -File scripts/make-icon.ps1`
- **Funzionalità future predisposte**: pronuncia audio (Web Speech API),
  riconoscimento vocale della lettura, frasi brevi (livello 6), esercizi
  personalizzati sugli errori. Il riconoscimento vocale **non è implementato**:
  sarà aggiunto solo quando effettivamente funzionante.

---

## 🔒 Privacy e GDPR

- Nessun account richiesto, nessun dato inviato online (finché non si attiva Supabase).
- Il bambino non inserisce mai password o dati personali.
- Salvo solo: nome (max 14 caratteri), mascotte, lettere abilitate e progressi di lettura.
- Nessun cookie di tracciamento, nessuna pubblicità, nessun servizio terzo.
- Cancellazione immediata: eliminazione profilo o azzeramento dall'Area Genitori.
