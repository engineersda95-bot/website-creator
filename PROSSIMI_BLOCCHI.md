# Roadmap Blocchi per l'Editor (Prioritizzata)

Questa lista tiene conto degli schemi di conversione classici per le landing page (analizzando i framework inseriti nelle immagini: Hero > Social Proof > Benefits > How it works > Testimonials > FAQ > CTA) e si adatta alla natura di **siti web puramente statici (NO BACKEND)**. Questo significa che sfrutteremo al massimo le risorse esterne (iframe, form webhook) per le parti dinamiche.

*I blocchi attuali già presenti: Main Nav, Hero, Simple Text, Footer.*

---

## 1. Loghi Aziende (Trusted By / Social Proof)
*Spesso posizionato subito sotto la Hero. Risponde subito al "perché dovrei fidarmi?" mettendo in mostra loghi di clienti o partner.*
- **Contenuto**: Testo introduttivo (es. "Scelti da"), Array di Loghi.
- **Immagini**: Molteplici immagini (loghi aziendali).
- **Stili/Personalizzazioni**:
  - Layout: Nastro scorrevole animato (Marquee/Ticker) o Griglia statica/Allineamento centrato.
  - Filtri: Converti tutti i loghi in scala di grigi per dare unicità di stile e non far "a cazzotti" coi colori del brand.
  - Opacità dei loghi.

## 2. Immagine con Testo (Image & Text / Split Section)
*La sezione base per i framework PAS (Problem, Agitation, Solution) o WHO/WHY/WHAT.*
- **Contenuto**: Titolo, Paragrafo, Etichetta CTA, Link CTA.
- **Immagini**: 1 Immagine o Illustrazione associata al testo.
- **Stili/Personalizzazioni**:
  - Posizione Immagine: Sinistra o Destra.
  - Aspect Ratio dell'immagine.
  - Allineamento testo (Verticale: Sopra, Centro, Sotto).

## 3. Vantaggi / Benefici (Features & Benefits Grid)
*Perché l'utente dovrebbe sceglierti? "Le feature raccontano, ma sono i benefici che vendono".*
- **Contenuto**: Titolo sezione, Sottotitolo, Array di card (Icona, Titolo del Vantaggio, Spiegazione).
- **Immagini**: Per le icone (piccoli SVG o emoji/immagini in scala ridotta).
- **Stili/Personalizzazioni**:
  - Layout colonne: 2, 3 o 4 in griglia orizzontale.
  - Stile box: "Card" con bordi e ombra vs Testo puro.

## 4. Come Funziona (How It Works / Steps)
*Spezza la complessità del servizio o prodotto in 3-5 facili passaggi visivi.*
- **Contenuto**: Titolo sezione, Array di Step (Numero step, Titolo, Descrizione).
- **Immagini**: Nessuna (solitamente si usano numeri o piccole check).
- **Stili/Personalizzazioni**:
  - Layout: Timeline Verticale o Griglia Orizzontale a blocchi.

## 5. Testimonianze (Recensioni / Casi Studio)
*Un altro pilastro della Trust. Validazione sociale tramite pareri di terzi.*
- **Contenuto**: Titolo, Array di recensioni (Testo recensione, Nome utente, Ruolo o Azienda, Valutazione a stelle).
- **Immagini**: Foto avatar cliente per ogni recensione (opzionale).
- **Stili/Personalizzazioni**:
  - Layout: Griglia vs Slider orizzontale drag & drop.
  - Stile: Visualizzazione stelline o virgolette ("Quote").

## 6. Call to Action (CTA Banner Finale)
*Alla fine del viaggio visivo dell'utente, la CTA finale serve per la conversione. Alto contrasto, testo "Action-oriented".*
- **Contenuto**: Heading deciso, Subheading motivazionale ("Why you should do it"), Pulsante Primario ben visibile.
- **Immagini**: Sfondo pattern o immagine coperta da opacità.
- **Stili/Personalizzazioni**:
  - Layout centrato.
  - Sfondo ad elevato contrasto rispetto agli altri blocchi della pagina.

## 7. Media & Embeds (Mappe, Video, Social, Iframe)
*Il cuore del contenuto multimediale "serverless". Perfetto per i siti statici che necessitano di integrazioni.*
- **Contenuto**:
  - Selettore "Tipo Embed": Google Maps / YouTube / Instagram Embed / X Embed / Iframe Generico.
  - URL Risorsa o Codice Iframe (nel caso del custom HTML).
- **Immagini**: Generate dinamicamente dall'embed stesso.
- **Stili/Personalizzazioni**:
  - Larghezza (Width): Full width vs Contained (centrato e ristretto).
  - Proporzioni (Aspect ratio, utile per preservare i video su mobile).
  - Altezza mappa (Height custom).

## 8. FAQ (Domande Frequenti)
*Piccole risposte chiare ai dubbi più comuni. Mantiene la pagina ordinata con le tendine.*
- **Contenuto**: Titolo ("FAQ"), Domande e Risposte (Accordion).
- **Immagini**: Nessuna.
- **Stili/Personalizzazioni**:
  - Stile divisori (solo riga di confine vs caselle con sfondo).

## 9. Modulo di Contatto (Form "Statico")
*Dato che siamo "Serverless", raccoglie i dati e gestisce l'invio bypassando database proprietari.*
- **Contenuto**: Email di ricezione o Testo azienda (Indirizzo, telefono).
- **Immagini**: Nessuna.
- **Stili/Personalizzazioni**:
  - Metodo di invio: `mailto:` nudo e crudo vs Endpoint Webhook Custom (tipo Formspree, Netlify Forms o Make).
  - Modalità layout: Modulo integrato con indirizzi affiancati.

## 10. Galleria Immagini (Portfolio Visuale)
*Fondamentale per attività ristorative, artigianali ed eventi.*
- **Contenuto**: Set multiplo di immagini.
- **Immagini**: Array selezionabile.
- **Stili/Personalizzazioni**:
  - Layout: Griglia Regolare (quadrati allineati) o "Masonry" (stile Pinterest per immagini ad altezze sfasate).
  - Apertura Lightbox a pieno schermo.
