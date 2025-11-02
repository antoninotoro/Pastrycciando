# 🧁 Pastrycciando

Pastrycciando è una web app moderna di pasticceria potenziata dall'intelligenza artificiale. Crea, esplora e personalizza ricette di pasticceria con l'aiuto di Claude AI.

## ✨ Funzionalità

### 🏠 Home Page
- **Griglia Ricette Interattive**: Visualizza tutte le tue ricette in card moderne e responsive
- **Ricerca Avanzata**: Cerca ricette per nome o categoria
- **Caricamento JSON**: Importa ricette da file JSON con un semplice drag & drop

### 🤖 Funzionalità AI

#### Suggerimenti da Dispensa
Elenca gli ingredienti che hai a disposizione e ricevi suggerimenti per 3-5 ricette creative che puoi preparare.

#### Creazione Ricette con AI
Descrivi la ricetta che desideri e l'AI la genererà per te con:
- Lista ingredienti completa con quantità
- Procedimento dettagliato
- Consigli pratici
- Possibilità di salvare la ricetta

### 📖 Pagina Dettaglio Ricetta

#### Scaling Dinamico
- Slider per modificare le quantità (25% - 400%)
- Ricalcolo in tempo reale di tutti gli ingredienti
- Visualizzazione percentuali ingredienti

#### Grafico Nutrizionale
- Valori calcolati con AI
- Calorie totali e per porzione
- Grafico a torta per macronutrienti (Proteine, Grassi, Carboidrati)
- Breakdown dettagliato in grammi

#### AI - Bilanciamento Ingredienti
- Analisi delle regole di pasticceria
- Range min-max per ogni ingrediente
- Suggerimenti per ottenere risultati specifici (es: "più leggero", "più soffice")

#### AI - Sostituzione Ingredienti
- 3-5 alternative per ogni ingrediente
- Rapporti di sostituzione precisi
- Impatto su sapore, texture e aspetto
- Note e accorgimenti pratici

## 🛠️ Setup

### Prerequisiti
- Node.js 18+ installato
- Account Supabase (gratuito)
- API Key di Anthropic Claude

### 1. Configura Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Vai su **Settings → API** e copia:
   - Project URL
   - anon/public key
3. Vai su **SQL Editor** e esegui lo script `supabase-schema.sql`

### 2. Configura Anthropic API

1. Vai su [console.anthropic.com](https://console.anthropic.com)
2. Crea una API Key

### 3. Configura le Variabili d'Ambiente

Copia il file `.env.local.example` in `.env.local`:

```bash
cp .env.local.example .env.local
```

Modifica `.env.local` con le tue credenziali:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Installa e Avvia

```bash
# Installa le dipendenze (già fatto se hai seguito il setup)
npm install

# Avvia il server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📁 Struttura del Progetto

```
pastrycciando/
├── app/
│   ├── api/ai/          # API routes per funzionalità AI
│   ├── recipe/[id]/     # Pagina dettaglio ricetta
│   ├── layout.tsx       # Layout principale
│   ├── page.tsx         # Home page
│   └── globals.css      # Stili globali
├── components/
│   ├── ui/              # Componenti UI (shadcn)
│   ├── navbar.tsx
│   ├── recipe-card.tsx
│   ├── recipe-upload.tsx
│   ├── pantry-suggestions.tsx
│   ├── recipe-creator.tsx
│   ├── nutrition-chart.tsx
│   ├── ingredient-balance.tsx
│   └── ingredient-substitution.tsx
├── lib/
│   ├── supabase.ts      # Client Supabase e types
│   └── utils.ts         # Utility functions
├── .env.local           # Variabili d'ambiente (NON committare!)
├── supabase-schema.sql  # Schema database
└── ricette-esempio.json # File di esempio per importazione
```

## 🎨 Design e Tecnologie

### Stack Tecnologico
- **Framework**: Next.js 14 con App Router
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Charts**: Recharts
- **Icons**: Lucide React

### Design System
- **Colori**: Palette calda con toni ambrati che richiamano la pasticceria
- **Tipografia**: Font Geist per un look moderno
- **Componenti**: Card con effetti hover e transizioni fluide
- **Responsive**: Design mobile-first

## 📝 Formato Ricette JSON

Per caricare ricette, usa questo formato:

```json
{
  "nome": "Nome della Ricetta",
  "categoria": "Torte/Biscotti/etc",
  "ingredienti": [
    {
      "nome": "Nome Ingrediente",
      "quantita": 100,
      "unita": "g",
      "percentuale": 50
    }
  ],
  "procedimento": "Istruzioni dettagliate...",
  "consigli": "Consigli pratici..."
}
```

Vedi `ricette-esempio.json` per esempi completi.

## 🚀 Deploy

### Vercel (Consigliato)

1. Push del codice su GitHub
2. Importa il progetto su [vercel.com](https://vercel.com)
3. Aggiungi le variabili d'ambiente
4. Deploy!

### Altre Piattaforme
L'app funziona su qualsiasi piattaforma che supporti Next.js 14.

## 📄 Licenza

MIT License - sentiti libero di usare questo progetto come base per le tue applicazioni!

## 🙏 Crediti

- UI Components: [shadcn/ui](https://ui.shadcn.com/)
- Icons: [Lucide](https://lucide.dev/)
- AI: [Anthropic Claude](https://www.anthropic.com/)
- Database: [Supabase](https://supabase.com/)

---

**Buona pasticceria! 🧁**
