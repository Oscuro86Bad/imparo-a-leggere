# 🦉 IMPARO A LEGGERE

**App online:** https://oscuro86bad.github.io/imparo-a-leggere/

Applicazione educativa **PWA (Progressive Web App)** per aiutare i bambini di prima elementare
(circa 6 anni) a imparare a leggere: riconoscimento delle lettere, sillabe, parole reali e
inventate, associazione parola-immagine.

- ✅ Funziona su smartphone Android, iPhone, tablet, iPad e computer.
- ✅ Installabile sulla schermata Home (PWA).
- ✅ Funziona **completamente offline** (unica eccezione: la lettura delle parole da
  foto scarica una volta il motore OCR, poi resta in cache sul dispositivo).
- ✅ Le parole sono lette da una **voce registrata** (neurale, chiara anche su iPad),
  non dalla sintesi vocale del telefono.
- ✅ Nessuna pubblicità, nessun tracciamento.
- ✅ Multi-profilo: ogni bambino ha lettere, esercizi e progressi indipendenti.
- ✅ I dati restano sul dispositivo (privacy, GDPR: nessun dato dei minori raccolto online).

---

## 🚀 Come usare l'app subito (senza installare nulla)

1. Apri il file `index.html` con un doppio clic (l'app funziona anche così).
2. Crea il profilo del bambino (nome + mascotte).
3. Entra in **AREA GENITORI → Lettere** e attiva le lettere già studiate a scuola
   (es. vocali + P + M).
4. Ogni consonante attivata in **Lettere** porta con sé **automaticamente** le sue
   sillabe (PA, PE, PI…): se serve, in **Combinazioni** togli quelle non ancora
   studiate o attiva strutture speciali (doppie, gruppi, GN, GLI…).
5. Il bambino usa **SOLO LETTURA**, **UNISCI LE SILLABE**, **LEGGI E GUARDA**, **DICO LA PAROLA**,
   **VEDI E SCEGLI**, **ASCOLTA E SELEZIONA**, **COMPLETA LA PAROLA**,
   **COLLEGA L'IMMAGINE** e **LEGGI LA FRASE** (cinque sezioni con etichetta NEW).
   **ASCOLTA LENTO** è temporaneamente nascosta: il codice è pronto e basta
   `IAL.CONFIG.SHOW_SLOW_LISTEN = true` per farla ricomparire.

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
- Pulsanti: **NUOVO**, **CORRETTO**, **🔊 SENTI**, **TORNA AL MENU**.
- Stelle e messaggi incoraggianti, senza obiettivi né premi: l'app serve solo come ripasso.
- Anti-ripetizione: gli ultimi 15 esercizi non vengono riproposti subito.
- Dopo **CORRETTO** l'app **pronuncia la parola** e poi passa alla successiva:
  il bambino collega ciò che ha letto al suono giusto.
- Le **parole inventate** includono anche combinazioni curate a mano
  (TATU, TATO, MIMI, LOLO…), sempre leggibili con le sillabe già studiate.

### UNISCI LE SILLABE (novità — NEW)
1. Compaiono i riquadri delle sillabe di **una parola reale**, **sempre mescolati**
   (es. `[ MMA ] + [ MA ]` invece di `[ MA ] + [ MMA ]`): il bambino deve
   riconoscere l'ordine giusto e toccare i riquadri uno alla volta fino a formare
   **MAMMA**. Non sono mai disegnati già in fila nell'ordine corretto.
2. Le doppie compaiono solo se attivate nell'Area Genitori: con vocali + P/M/N/L/T
   si uniscono parole come `ME + LA = MELA`, `PA + NE = PANE`, `LU + NA = LUNA`.
3. Vengono usate **solo parole reali interamente leggibili**, con 2–4 sillabe già
   studiate: nessuna parola inventata e nessuna lettera nuova può entrare di nascosto.
4. Se l'ordine è sbagliato non c'è una X rossa: i riquadri si scuotono piano e
   compare un suggerimento gentile («Prima MA, poi MMA»). Si riprova senza penalty;
   il riquadro già scelto resta evidenziato, così il bambino vede cosa manca.
5. Il pulsante **🔊 SENTI LA PAROLA** pronuncia sempre **la parola intera da
   comporre** (non la sola prossima sillaba), così il bambino sa cosa ricostruire.
   A fusione completata la parola viene **pronunciata** con l'audio preregistrato,
   compare l'immagine come premio (se disponibile) e arriva una stellina.
6. **🔄 NUOVA** passa a un'altra parola; l'anti-ripetizione evita il ripetersi
   della stessa parola due volte di seguito.

### LEGGI E GUARDA
1. Compare **una parola completa reale** → il bambino legge ad alta voce.
2. Il genitore conferma con **CORRETTO**.
3. Compare l'immagine associata con la parola completa (PANE → 🍞).
4. Solo parole che la bambina può leggere con le **lettere e le sillabe conosciute**.
5. Sezione **svincolata dalla lunghezza** selezionata nell'Area Genitori; mai la
   stessa parola due volte di seguito.
6. Dopo **CORRETTO** la parola viene **pronunciata** insieme al disegno.

### DICO LA PAROLA
1. Compare **una parola completa reale** (mai sillabe) → il bambino la legge
   a voce alta quando è pronto.
2. Il microfono **non** è attivo in automatico: il bambino preme il pulsante
   **🎤 VERIFICA** e l'app ascolta (riconoscimento vocale in italiano). Se non
   sente bene, **ri-ascolta da solo** (fino a 3 volte) senza che il bambino
   debba ripremere.
3. Feedback immediato: la parola si **illumina di VERDE** se pronunciata bene
   (passaggio automatico alla successiva), di **ROSSO** se sbagliata.
4. In caso di errore **nessuna voce rivela la parola**: parte solo un breve
   **segnale acustico di errore** (due note discendenti, generato dall'app,
   funziona anche offline), il messaggio dice «Ho sentito: …» e torna il
   pulsante **🎤 VERIFICA** per riprovare sulla stessa parola — a pronunciarla
   bene pensa il genitore leggendola a schermo.
5. La valutazione è **tollerante con le voci infantili**: usa tutte le
   alternative del riconoscitore e un confronto "fuzzy" (distanza di
   Levenshtein), così piccoli errori di trascrizione (P/B, T/D…) non fanno
   segnare sbagliate parole pronunciate bene; il messaggio dice sempre
   «Ho sentito: …». Il riconoscimento richiede internet.
6. Se il microfono non è disponibile (es. iPhone/iPad con Safari), il genitore
   conferma con i pulsanti ✅ / ❌.
7. Sezione **svincolata dalla lunghezza** selezionata nell'Area Genitori: valgono
   solo le lettere e le sillabe conosciute.

### VEDI E SCEGLI
1. Compare **solo l'immagine** della parola (senza scriverla), es. ⚽.
2. Sotto, **scelta multipla** con 2–4 opzioni: l'inizio della parola
   (prime due lettere), es. **PA / PE / MA / PU** per ⚽ PALLA.
3. Le opzioni sono **solo sillabe studiate e attive** nell'Area Genitori.
4. La parola deve iniziare con una sillaba conosciuta: il resto può contenere
   lettere ancora da studiare → archivio molto ricco (oltre 370 parole, quasi tutte con immagine).
5. Risposta giusta → opzione **VERDE**, stellina, **parola completa rivelata**
   e pronunciata, poi **passaggio automatico** alla parola successiva.
6. Risposta sbagliata → opzione **ROSSA** disabilitata; si riprova sulle altre.
7. Pulsante **🔊 SENTI** per riascoltare la parola in qualsiasi momento.

### ASCOLTA E SELEZIONA (novità — NEW-BETA)
1. L'app **pronuncia una parola** senza scriverla (la nuvoletta «NEW-BETA»
   segnala la sezione appena introdotta).
2. Sotto compaiono **4 parole scritte**: si sceglie quella sentita.
   I distrattori sono parole simili (stessa lunghezza o stesso inizio),
   così serve ascoltare e leggere con attenzione.
3. **🔊 RIPETI** riascolta la parola, **⏭️ SALTA** passa a una nuova parola.
   La scelta è **immediata**: non serve premere «Corretto».
4. Risposta giusta → parola **VERDE**, stellina, parola pronunciata e
   **passaggio automatico** alla successiva.
   Risposta sbagliata → parola **ROSSA** disabilitata: si sceglie un'altra
   parola e si riprova.
5. Si usano parole reali. Con molte lettere attive le scelte sono **tutte
   interamente leggibili** con le lettere e sillabe studiate; quando sono
   poche (per esempio con la **sola consonante T**) il vocabolario si
   allarga a parole reali con **al massimo una lettera nuova**, così
   l'esercizio non si esaurisce in tre parole.

### COMPLETA LA PAROLA (novità — NEW-BETA)
1. Compare l'**immagine** di una parola reale e più lunga (es. 🍞 PANE),
   scritta però **senza le ultime due lettere**: si vedono le lettere che
   restano e **due spazi vuoti**.
2. Il bambino **scrive le due lettere mancanti con il dito** sulla lavagna
   (canvas) qui sotto: è il "campo di scrittura" a mano libera.
3. **✅ HO SCRITTO** mostra le lettere giuste negli spazi: il bambino
   confronta ciò che ha scritto e conferma con **✅ È GIUSTO** (stellina,
   parola pronunciata e passaggio automatico) oppure **🔁 RIPROVO**
   (si cancella la lavagna e si riscrive la stessa parola).
4. **🧽 CANCELLA** pulisce la lavagna, **⏭️ SALTA** cambia parola.
5. La sezione è **svincolata da lunghezze, livelli e sillabe** dell'Area
   Genitori: le parole possono essere lunghe e ricche (TAZZINA, TELEVISORE,
   CIOCCOLATO, MARTELLO, TETTOIA…). I vincoli sono due: la parola contiene
   **almeno una consonante attiva** e le **due lettere da scrivere** sono
   sempre tra quelle conosciute (vocali + consonanti attive), così il bambino
   può davvero tracciarle. L'app preferisce comunque le parole con **poche
   lettere nuove** (prima quelle note, poi con una sola lettera nuova…).

### COLLEGA L'IMMAGINE (novità — NEW-BETA)
1. Compaiono **8 immagini** di parole che il bambino sa già leggere e, sotto,
   i loro **inizi (prime due lettere)** dentro riquadri bianchi.
2. Si **trascina** l'inizio sopra la sua immagine (dito o mouse). In alternativa
   si può **toccare** l'inizio e poi l'immagine: più facile per le dita piccole.
3. Coppia giusta → i due riquadri diventano **verdi**, arriva una **stellina**,
   la parola viene **pronunciata** e i due riquadri **spariscono**.
4. Coppia sbagliata → i riquadri diventano **rossi** per un attimo e quello
   trascinato **torna al suo posto**; nessuna voce rivela la parola.
5. Quando tutte le coppie sono collegate, il pulsante **🔄 RICOMINCIA** in
   basso prepara **parole nuove** (si può usare anche prima di finire).
6. Solo **parole reali con immagine**, interamente leggibili con le lettere e le
   sillabe attive. Ogni inizio è diverso dagli altri: c'è **una sola immagine
   giusta** per ogni riquadro. Se le parole disponibili sono meno di 8, si gioca
   con tutte quelle che ci sono.

### LEGGI LA FRASE (novità — NEW)
1. Compare **una frase italiana compiuta** in caratteri grandi dentro una
   nuvoletta di testo: soggetto + verbo + complemento, oppure una domanda
   completa (es. «IO AMO LA MAMMA.», «CHI E?», «DOVE E LA MELA?»).
   **Nessuna immagine e nessuna vignetta**: solo testo grande.
   La frase si può ascoltare con **🔊 SENTI LA FRASE** (voce normale) oppure
   con **🐢 ASCOLTA LENTO**: la voce rallenta e la parola letta si illumina,
   con la sillaba corrente evidenziata dentro la parola. Se il browser non
   invia l'evento `onboundary` (tipico su iOS), un timer interno avanza
   comunque parola per parola. Uscendo dalla schermata la voce si ferma.
2. **🔄 NUOVA** passa a un'altra frase; **✅ HO LETTO** dà una stellina e passa
   alla successiva dopo averla pronunciata.
3. La frase compare solo se **tutte le sue lettere** — vocali comprese — sono
   attivate nell'Area Genitori. Se anche una sola lettera non è attiva, la
   frase non viene proposta. La **H è una consonante** (muta), non una vocale.
4. **Lunghezza e difficoltà crescono con le consonanti conosciute**: con 1
   consonante fino a 3 parole (livello 1); con 2–3 consonanti fino a 4 parole;
   con 4–5 fino a 5; con 6 fino a 6; con 7 o più fino a 9 parole e livello 4.
5. L'archivio contiene **1597 frasi** (`js/data/sentences.js`): 337 brevi
   (livello 1), 607 facili (livello 2), 402 più lunghe (livello 3) e 251
   ricche (livello 4). Le 1400 frasi storiche sono state conservate e si
   aggiungono le 197 frasi chieste dall'utente (142 nuove dopo le prime 55).
   Ogni consonante, H e Q comprese, compare in almeno
   60 frasi. Niente virgole tra le parole, nessuna vignetta e nessun campo
   `e`/immagine nei dati. Le frasi sono generate da lessico e modelli
   italiani curati (`tools/generate_sentences.py`), senza ripetere la stessa
   frase due volte di seguito.

### ASCOLTA LENTO (codice pronto, nascosto per ora)
> Temporaneamente disattivata su richiesta: né la voce nel menu né il pulsante
> interno compaiono. Il codice resta integro; per riattivarla basta il flag.
1. È una **voce propria nel menu** (colore corallo, accanto a LEGGI LA FRASE):
   non va cercata dentro un'altra sezione. Un tocco apre una frase e la legge
   subito piano, senza bisogno di premere un pulsante interno.
2. Il titolo della schermata diventa **ASCOLTA LENTO** e compare la spiegazione
   «La frase si legge piano 🐢 e le parole si illuminano».
3. La parola pronunciata si illumina in giallo e, dentro di essa, si accende
   anche la sillaba corrente. Se il browser non invia `onboundary` (tipico su
   iOS), un timer interno avanza comunque parola per parola.
4. **🔄 NUOVA** passa a un'altra frase e la rilegge piano automaticamente;
   **✅ HO LETTO** dà la stellina e passa alla frase successiva sempre in
   modalità lenta. Uscendo dalla schermata la voce si ferma.
5. Lo stesso comando è disponibile anche come pulsante **🐢 ASCOLTA LENTO**
   dentro LEGGI LA FRASE, per chi vuole alternare lettura normale e lenta.

### PAROLE PERSONALIZZATE
1. Il genitore scrive le parole da far leggere (nomi della famiglia, oggetti,
   parole del quaderno…): restano salvate sul dispositivo.
2. **📸 Scatta foto / 🖼️ Galleria**: il genitore fotografa una pagina (quaderno, libro,
   elenco) oppure sceglie una foto già scattata. «Scatta foto» apre direttamente la
   fotocamera posteriore del telefono (scatto in tempo reale).
   L'app legge le parole **sul telefono** (OCR con Tesseract.js in WebAssembly:
   nessuna immagine viene inviata a un server), ne ricava le parole una per una
   e le mostra in un elenco modificabile: si possono correggere o togliere prima
   di aggiungerle. Parole spezzate a fine riga (`PAR-` / `LA`) vengono ricomposte,
   numeri e righe di rumore vengono scartati.
   Come funziona la lettura: la foto viene raddrizzata nella luminosità (ombre,
   luce gialla e foglio storto), poi il testo viene letto **più volte** con
   impostazioni diverse (pagina intera, parole sparse, bianco e nero) e si tiene
   per ogni parola il risultato con il punteggio di sicurezza più alto. Gli errori
   tipici vengono corretti (`0→O`, `1→I`, `5→S`, `8→B`); le parole poco credibili
   vengono scartate.
   *La prima volta il browser scarica il motore OCR (~8 MB da CDN); poi resta in cache
   e la funzione lavora anche offline. Con il testo stampato dei libri la lettura è
   molto affidabile; con la scrittura a mano è meglio controllare l'elenco prima di
   aggiungere.*
3. **🗑️ Cancella tutte le parole**: svuota l'elenco (con conferma) per ripartire da zero;
   stelline e progressi restano.
4. Le parole girano **in ordine casuale**, senza mai ripetersi di seguito.
5. Pulsanti **CORRETTO** (+stellina, con **pronuncia della parola** e passaggio
   automatico), **RITENTA** e **NUOVO**.
6. Si possono aggiungere o togliere parole a piacere da 📝 GESTISCI LE PAROLE.
7. Sezione svincolata da lettere attive e livelli: la parola è scelta
   apposta da un adulto.

### 🔊 VOCE E PRONUNCIA
- Dopo ogni risposta corretta l'app **pronuncia la parola** e poi passa alla
  successiva (in LEGGI E GUARDA la pronuncia accompagna il disegno).
- Ogni sezione con le parole ha anche il pulsante **🔊 SENTI** per riascoltare.
- **Le parole reali usano un audio preregistrato** con una voce neurale italiana
  (485 parole, ~5 MB): è chiaro anche su iPhone/iPad, dove Safari spesso espone
  solo le voci "compact" robotiche. Gli audio sono file MP3 in `audio/w/`,
  elencati in `js/data/audio.js`.
- **Sillabe, parole inventate e parole personalizzate** usano la voce del
  dispositivo (non ha senso registrarle tutte): l'app sceglie la voce italiana
  migliore disponibile e pronuncia il testo in minuscolo (su iOS le parole tutte
  maiuscole vengono a volte compitate lettera per lettera).
- Se un audio manca o il browser blocca la riproduzione, l'app ripiega in
  automatico sulla sintesi vocale: l'esercizio non si blocca mai.
- **Offline**: gli audio vengono scaricati in background dopo il primo avvio e
  conservati in una cache separata (`imparo-a-leggere-audio-v1`) che non viene
  cancellata dagli aggiornamenti dell'app.
- Se non si sente nulla: alzare il volume dei **contenuti multimediali**,
  togliere il **silenzioso** (su iPhone è l'interruttore laterale).
- Nell'**Area Genitori → Esercizi** c'è **🔊 Prova la voce**: pronuncia una parola
  registrata e mostra quale voce del dispositivo è in uso per le sillabe.
- Su iPhone/iPad si possono migliorare anche le sillabe scaricando una voce
  **Migliorata** o **Premium**: *Impostazioni → Accessibilità → Contenuto letto →
  Voci → Italiano*.

### AREA GENITORI (protetta da PIN opzionale a 4 cifre)
- **Profili**: profili multipli indipendenti, modifica, eliminazione.
- **Lettere**: alfabeto italiano completo, vocali e consonanti distinte, attivazione
  individuale, pulsante «Tutte le vocali», salvataggio automatico.
- **Combinazioni**: si attivano **automaticamente** quando si attiva una consonante;
  qui si possono togliere/riattivare le singole sillabe (PA, PE…) + strutture
  ortografiche speciali: doppie, gruppi consonantici, sillabe vocalica+consonante
  (ER, OR, AL), SC, GN, GLI.
- **Esercizi**: tipo di parole, lunghezze, categorie e 6 livelli di progressione che limitano
  automaticamente lunghezza e difficoltà degli esercizi (sempre sotto controllo del genitore,
  niente avanzamento automatico). **LEGGI E GUARDA** e **DICO LA PAROLA** usano solo parole
  complete reali con le lettere conosciute e sono svincolate da lunghezze e categorie.
- **Progressi**: stelline, corretti, da ripetere, statistiche
  per lettera e per giorno.
- **Sicurezza**: PIN opzionale a 4 cifre per proteggere l'Area Genitori.

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

Archivio incluso: **2056 parole italiane reali**, di cui **2040 con immagine**, più 172 parole
aggiuntive per COMPLETA LA PAROLA (`js/data/words.js`). Un blocco curato di 20 parole
(OLIO, PIANO, MULINO, NATALE, TANA, LINEA, UMANO, LUMI, TOPINI, PINI, NIPOTI,
MANINA, TOPOLINA, PANINI, OMINO, PULITI, TONNO, LETTI, TETTI, TUTTI) dà più varietà
quando sono attivate solo le vocali e le consonanti **M, N, L, T, P**. Tutte le **74 combinazioni
consonante+vocale** (Q incluso) hanno almeno una parola illustrata e una parola che inizia
con quella sillaba. Le combinazioni più rare sono coperte da
parole concrete: QUOTA (QUO), QUI (QUI), QUESTO (QUE), VULCANO (VU), ZIA/ZIO/ZIBIBBO (ZI).

Il vocabolario esteso proviene dalle annotazioni CLDR italiane (emoji validate con `pyphen`
e le regole sillabiche del motore), con inflessioni reali attestate da `wordfreq`.

Ogni parola illustrata ha il suo **MP3 preregistrato** (2252 voci in `audio/w/`, manifesto
`js/data/audio.js`): la voce neurale è sempre disponibile anche offline, senza ricorrere alla
sintesi vocale del dispositivo.

Per **LEGGI LA FRASE** l'archivio aggiunge **1597 frasi italiane compiute** in
`js/data/sentences.js`: 337 brevi (livello 1), 607 facili (livello 2),
402 più lunghe (livello 3) e 251 ricche (livello 4). Ogni frase richiede solo
lettere già attivate, vocali comprese (H come consonante), e non contiene
immagini. Le frasi non hanno MP3 dedicati: la lettura usa la voce del
dispositivo, mentre le singole parole dell'archivio restano preregistrate.

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
│   ├── data/sentences.js   # 1597 frasi compiute, senza immagini
│   ├── data/associations.js# associazioni sillaba→parola→immagine
│   ├── data/audio.js       # elenco parole → audio preregistrato
│   ├── state/store.js      # profili, impostazioni, progressi (localStorage)
│   ├── engine/generator.js # motore di generazione con controlli didattici
│   ├── ui/*.js             # schermate: home, lettura, leggi e guarda, area genitori, parole personalizzate
│   ├── ui/blend.js         # UNISCI LE SILLABE (riquadri mescolati da toccare in ordine)
│   ├── ui/sentences.js     # LEGGI LA FRASE + ASCOLTA LENTO (solo testo, evidenziatore)
│   ├── ui/ocr.js           # lettura parole da FOTO (Tesseract.js, tutto in locale)
│   └── app.js              # avvio
├── audio/w/                # 2252 MP3 preregistrati (voce neurale italiana)
├── icons/                  # icone (generate con scripts/make-icon.ps1)
├── img/                    # disegni delle parole (SVG: mimo, magia, lago, merenda, pirata)
├── scripts/make-icon.ps1   # rigenera le icone (Windows, senza dipendenze)
├── tools/generate_audio.py # rigenera gli audio delle parole (edge-tts)
├── tools/generate_sentences.py # rigenera l'archivio frasi (lessico curato)
├── tools/audio-words.txt   # elenco delle parole da registrare
├── supabase/schema.sql     # schema database online (opzionale, vedi sotto)
├── .github/workflows/deploy.yml  # pubblicazione automatica su GitHub Pages
├── test.html               # collaudo automatico del motore
├── uitest.html             # collaudo automatico dell'interfaccia
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
  non studiata, correttezza reali/inventate, filtro lunghezza, zero esercizi se tutto spento,
  copertura di tutte le 74 sillabe CV e audio preregistrato di tutte le parole illustrate
  (114 controlli).
- `uitest.html` — interfaccia completa: creazione profilo, 30 esercizi in SOLO LETTURA con
  controllo delle lettere, ciclo CORRETTO/AVANTI in LEGGI E GUARDA, tutte le schede
  dell'Area Genitori, PIN, stelline e statistiche, uso dell'audio preregistrato e
  fallback alla sintesi vocale, sillabe mescolate, SENTI LA PAROLA e
  ASCOLTA LENTO nascosto ma pronto (174 controlli).

Checklist manuale consigliata (2 minuti):
- [ ] Attiva solo vocali + P: nessuna parola con altre lettere compare.
- [ ] Disattiva PA: la sillaba PA sparisce dagli esercizi.
- [ ] Attiva «Doppie»: compaiono MAMMA, MAPPA, LATTE…
- [ ] UNISCI LE SILLABE: i riquadri sono mescolati; **🔊 SENTI LA PAROLA** dice la parola intera; toccandoli in ordine si forma la parola e si sente l'audio.
- [ ] ASCOLTA LENTO: per ora nascosta sia dal menu sia da LEGGI LA FRASE.
- [ ] Modalità «solo inventate»: le parole mostrano la dicitura «senza significato».
- [ ] CORRETTO aumenta le stelline.
- [ ] PIN: l'Area Genitori è inaccessibile ai bambini senza codice.

---

## 🛠️ Manutenzione

- **Aggiungere parole**: aggiungi una riga in `js/data/words.js`
  (`{ w, s, img, diff }`, con sillabazione e vincoli impliciti).
- **Aggiungere immagini/associazioni**: aggiorna `js/data/associations.js`
  e il campo `img` in `words.js`. Nel campo `img` va un'emoji (`'🍞'`) **oppure
  il percorso di un disegno** (`'img/mimo.svg'`): in quel caso l'app lo mostra
  come immagine vera (es. MAGIA, MIMO, LAGO, MERENDA, PIRATA). I disegni nuovi vanno messi in `img/`
  e aggiunti a `ASSETS` in `sw.js` per averli anche offline.
- **Rigenerare le icone**: `powershell -ExecutionPolicy Bypass -File scripts/make-icon.ps1`
- **Rigenerare gli audio delle parole** (dopo aver aggiunto parole nuove):
  1. `pip install edge-tts`
  2. aggiorna `tools/audio-words.txt` con le parole in maiuscolo (una per riga)
  3. `python tools/generate_audio.py` → crea gli MP3 mancanti in `audio/w/` e
     riscrive `js/data/audio.js`.
  Voce predefinita: `it-IT-ElsaNeural`, velocità `-30%` (si può cambiare con
  `--voice` e `--rate`). Se gli audio cambiano, aggiorna `AUDIO_CACHE` in
  `sw.js` (es. `imparo-a-leggere-audio-v2`) per farli riscaricare.
- **Funzionalità presenti**: pronuncia con audio preregistrato + sintesi vocale
  come riserva, riconoscimento vocale della lettura in **DICO LA PAROLA**
  (Web Speech API).
- **Rigenerare le frasi** (dopo aver aggiunto parole): `python tools/generate_sentences.py`
  riscrive `js/data/sentences.js` e stampa i conteggi per livello e consonante.
- **Funzionalità future predisposte**: esercizi personalizzati sugli errori.

---

## 💻 Lavorare al progetto da un altro terminale

Il codice sorgente completo vive su GitHub, quindi si può modificare da qualsiasi PC:

1. Installa [git](https://git-scm.com) (e, facoltativo, [GitHub CLI](https://cli.github.com)).
2. Scarica il progetto:
   ```
   git clone https://github.com/Oscuro86Bad/imparo-a-leggere.git
   cd imparo-a-leggere
   ```
3. Apri `index.html` nel browser per provare, modifica i file, poi:
   ```
   git add -A
   git commit -m "descrizione della modifica"
   git push
   ```
4. Il push su `main` **ripubblica automaticamente** il sito online in ~30 secondi
   (workflow GitHub Actions incluso in `.github/workflows/deploy.yml`): il link resta
   sempre https://oscuro86bad.github.io/imparo-a-leggere/

Per autenticarsi da un nuovo terminale serve un accesso GitHub: il modo più semplice
è [GitHub CLI](https://cli.github.com) (`gh auth login`) oppure un *Personal Access Token*
(Servings → Developer settings) al posto della password quando git lo chiede.

Le pagine `test.html` e `uitest.html` sono i collaudi automatici: aprile nel browser
dopo ogni modifica per verificare che tutto funzioni (motore, interfaccia, livelli e categorie).

---

## 🔒 Privacy e GDPR

- Nessun account richiesto, nessun dato inviato online (finché non si attiva Supabase).
- Il bambino non inserisce mai password o dati personali.
- Salvo solo: nome (max 14 caratteri), mascotte, lettere abilitate e progressi di lettura.
- Nessun cookie di tracciamento, nessuna pubblicità, nessun servizio terzo.
- Cancellazione immediata: eliminazione profilo o azzeramento dall'Area Genitori.
