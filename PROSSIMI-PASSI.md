# 🚀 Prossimi Passi per Avviare Pastrycciando

Congratulazioni! L'applicazione **Pastrycciando** è stata creata con successo. Segui questi passi per configurarla e avviarla.

## ✅ Cosa è stato fatto

- ✅ Progetto Next.js 14 con TypeScript configurato
- ✅ Tailwind CSS e shadcn/ui installati
- ✅ Tutte le pagine e componenti implementati
- ✅ API routes per funzionalità AI create
- ✅ Database schema SQL preparato
- ✅ File di esempio ricette incluso
- ✅ Build verificato e funzionante

## 📋 Cosa devi fare ora

### 1. Configura Supabase (5 minuti)

1. Vai su [https://supabase.com](https://supabase.com) e accedi al tuo account
2. Crea un nuovo progetto:
   - Nome: `pastrycciando`
   - Password database: (scegli una password sicura)
   - Region: (scegli la più vicina a te)
3. Aspetta che il progetto venga creato (1-2 minuti)
4. Vai su **Settings → API**:
   - Copia il `Project URL`
   - Copia la chiave `anon public`
5. Vai su **SQL Editor**:
   - Clicca "New Query"
   - Apri il file `supabase-schema.sql` e copia tutto il contenuto
   - Incolla nell'editor SQL
   - Clicca "Run" per creare le tabelle

### 2. Configura Anthropic API (3 minuti)

1. Vai su [https://console.anthropic.com](https://console.anthropic.com)
2. Accedi o crea un account
3. Vai su **API Keys**
4. Clicca "Create Key"
5. Copia la chiave generata

### 3. Configura le Variabili d'Ambiente (2 minuti)

1. Apri il file `.env.local` nella root del progetto
2. Compila con le credenziali ottenute:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...
```

3. Salva il file

### 4. Avvia l'Applicazione

```bash
# Assicurati di essere nella directory pastrycciando
cd pastrycciando

# Avvia il server di sviluppo
npm run dev
```

Apri il browser su [http://localhost:3000](http://localhost:3000)

## 🎯 Testa le Funzionalità

### Test 1: Carica Ricette di Esempio
1. Nella home page, clicca "Carica Ricette"
2. Seleziona il file `ricette-esempio.json`
3. Verifica che le 3 ricette vengano caricate correttamente

### Test 2: Crea una Ricetta con AI
1. Vai alla tab "Crea Ricetta con AI"
2. Scrivi: "crea una ricetta di cookies al cioccolato"
3. Clicca "Genera Ricetta"
4. Aspetta la generazione
5. Clicca "Salva" per salvare la ricetta

### Test 3: Visualizza Dettagli Ricetta
1. Clicca su una card ricetta nella home
2. Verifica:
   - Lo slider per scaling funziona
   - Il grafico nutrizionale si carica
   - Le funzionalità AI (Bilancia/Sostituisci) funzionano

### Test 4: Suggerimenti da Dispensa
1. Torna alla home
2. Vai alla tab "Suggerimenti da Dispensa"
3. Scrivi: "farina, zucchero, uova, cioccolato"
4. Clicca "Suggerisci Ricette"
5. Verifica i suggerimenti generati

## 🎨 Personalizzazioni Possibili

### Cambia i Colori
Modifica `app/globals.css` alle linee 46-78 per cambiare la palette colori.

### Aggiungi Nuove Categorie
Le categorie sono flessibili - puoi usare qualsiasi nome nelle ricette.

### Modifica i Prompt AI
I system prompt per le funzionalità AI sono in `app/api/ai/*/route.ts` - puoi personalizzarli per ottenere risultati diversi.

## 🐛 Risoluzione Problemi

### Errore "supabaseUrl is required"
- Verifica di aver configurato `.env.local` correttamente
- Riavvia il server di sviluppo (Ctrl+C e poi `npm run dev`)

### Le ricette non si caricano
- Verifica di aver eseguito lo script SQL su Supabase
- Controlla la console del browser per errori (F12)
- Verifica le credenziali Supabase in `.env.local`

### Le funzionalità AI non funzionano
- Verifica che la chiave Anthropic sia corretta
- Controlla di avere crediti disponibili sul tuo account Anthropic
- Guarda i log del server (terminale dove hai eseguito `npm run dev`)

### Il grafico nutrizionale non si visualizza
- Assicurati che recharts sia installato: `npm install recharts`
- Riavvia il server

## 📚 Risorse Utili

- [Documentazione Next.js](https://nextjs.org/docs)
- [Documentazione Supabase](https://supabase.com/docs)
- [Documentazione Anthropic](https://docs.anthropic.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🚀 Deploy in Produzione

Quando sei pronto per pubblicare l'app:

1. Push del codice su GitHub
2. Vai su [vercel.com](https://vercel.com)
3. Importa il repository
4. Aggiungi le variabili d'ambiente (Settings → Environment Variables)
5. Deploy!

## 💡 Suggerimenti

- Inizia caricando alcune ricette di esempio
- Sperimenta con diverse richieste AI per vedere cosa può fare
- Personalizza i colori per renderla tua
- Aggiungi immagini alle ricette modificando il campo `image_url`

---

**Buon divertimento con Pastrycciando! 🧁**

Se hai domande o problemi, controlla il README.md o la documentazione delle tecnologie utilizzate.
