# Site Builder — Architettura E-commerce
Documento decisionale con dettagli tecnici per la valutazione e implementazione del modulo e-commerce.

---

## Gateway di Pagamento — Stripe vs PayPal

| | Stripe | PayPal | Note |
|---|---|---|---|
| **Onboarding merchant** | Richiede apertura account (10 min) | Spesso già ce l'hanno | Con PayPal il merchant incolla Client ID e Secret, trovabili in 2 minuti su developer.paypal.com |
| **Carte di credito** | Sì | Sì | Entrambi accettano carte senza che il cliente abbia un account |
| **Checkout hosted** | Sì, pagina Stripe | Sì, pagina PayPal | Il cliente viene portato su una pagina esterna per pagare — entrambi funzionano uguale |
| **Checkout embedded** | Sì, Stripe Elements | Sì, PayPal JS SDK | Il form di pagamento appare direttamente nel sito — entrambi lo supportano |
| **Webhook** | Eccellenti | Buoni | Notifiche che il gateway manda al Worker quando un pagamento va a buon fine. PayPal funziona, storicamente meno robusto ma non è un problema reale in V1 |
| **API qualità** | Eccellente | Buona | Differenza percepita dallo sviluppatore, non dall'utente finale. PayPal ha qualche edge case in più da gestire ma niente di bloccante |
| **Fatturazione automatica** | Sì, Stripe Invoicing | No | Generazione PDF fattura + invio email automatico. **Non serve per B2C** — in e-commerce consumer la ricevuta via email basta. Rilevante solo in B2B dove ogni ordine richiede fattura intestata all'azienda |
| **IVA automatica** | Sì, Stripe Tax (V3) | No | **Non serve se i prezzi sono già IVA inclusa** (es. €49,99 sul prodotto). Stripe Tax serve solo se vuoi mostrare scorporo IVA dinamico o vendere in più paesi con aliquote diverse. Per B2C italiano: irrilevante |
| **Metadata ordini** | Sì | Limitato | Dati custom associati all'ordine (es. customer_id). Con PayPal si usa il campo `custom_id` — funziona, è solo meno elegante |
| **Esperienza sviluppatore** | Best in class | Buona | Differenza di qualità della documentazione e degli SDK. Irrilevante per l'utente finale |
| **Diffusione merchant IT** | Alta | Altissima | La maggior parte dei merchant italiani ha già PayPal, molti non hanno Stripe |
| **Commissioni EU** | ~1.5% + €0.25 | ~3.4% + €0.35 | PayPal costa circa il doppio per transazione — su €100 di venduto: Stripe €1.75, PayPal €3.75 |

### Raccomandazione

**V1 → PayPal.** I merchant italiani lo hanno già, onboarding zero, copre tutto il necessario per validare il prodotto rapidamente.

**V2 → aggiungi Stripe** come opzione alternativa. Il merchant sceglie nelle impostazioni del progetto quale usare.

---

## Stack

| Componente | Tecnologia | Costo |
|---|---|---|
| Hosting siti | Cloudflare Pages | €0 |
| API / Webhook | Cloudflare Workers | €0 (100k req/giorno free) |
| Database | Supabase | €0 (free tier) |
| Storage file digitali | Cloudflare R2 | €0 (10GB free) |
| Pagamenti V1 | PayPal | €0 fisso · ~3.4% + €0.35 per transazione |
| Pagamenti V2 | Stripe | €0 fisso · ~1.5% + €0.25 per transazione |
| Email transazionali | Resend | €0 (3k email/mese free) |

---

## Perché serve un Worker

I siti pubblicati su SitiVetrina sono HTML statici su Cloudflare Pages. Un file HTML non può tenere credenziali segrete (PayPal Secret, Stripe Secret Key) né chiamare API di pagamento in modo sicuro.

Il Cloudflare Worker fa da "mini server" per ogni sito:
- riceve la richiesta di checkout dal browser del cliente
- usa le credenziali PayPal del merchant (salvate in Supabase, non nell'HTML)
- crea la sessione di pagamento
- gestisce i webhook in arrivo da PayPal

---

## Schema Supabase Completo

### `sites` (aggiunte allo schema esistente)

```sql
paypal_client_id        text
paypal_client_secret    text    -- cifrato
paypal_connected_at     timestamptz
ecommerce_enabled       boolean   default false
currency                text      default 'eur'
shipping_countries      jsonb     -- es. ['IT'] per solo Italia
```

### `products`

```sql
id                uuid          primary key
site_id           uuid          references sites(id)
name              text
slug              text          -- univoco per sito
description       text
price             integer       -- in centesimi (es. 4900 = €49)
stock             integer       -- null = illimitato (per digitale)
type              text          -- 'physical' | 'digital_download'
digital_file_key  text          -- chiave R2 per i file digitali
variants          jsonb         -- [{ name: 'Taglia', options: ['S','M','L'] }]
images            jsonb         -- array di URL
active            boolean       default true
created_at        timestamptz
```

### `orders`

```sql
id                  uuid    primary key
site_id             uuid    references sites(id)
customer_id         uuid    references customers(id)
paypal_order_id     text    -- ID ordine PayPal
paypal_capture_id   text    -- serve per i rimborsi
status              text    -- 'paid' | 'shipped' | 'completed' | 'refunded'
shipping_address    jsonb   -- null per prodotti digitali
total_amount        integer -- in centesimi
currency            text
created_at          timestamptz
```

### `order_items`

```sql
id            uuid    primary key
order_id      uuid    references orders(id)
product_id    uuid    references products(id)
product_name  text    -- snapshot al momento dell'acquisto
variant       text
quantity      integer
unit_price    integer -- snapshot al momento dell'acquisto
```

### `customers`

```sql
id              uuid    primary key
site_id         uuid    references sites(id)
email           text    -- univoco per sito (unique on site_id, email)
name            text
phone           text
company         text
custom_fields   jsonb   -- campi extra configurati dal merchant
tags            jsonb   -- es. ['VIP', 'newsletter']
status          text    -- 'lead' | 'customer'
created_at      timestamptz
updated_at      timestamptz
```

### `customer_events`

```sql
id                  uuid    primary key
customer_id         uuid    references customers(id)
site_id             uuid    references sites(id)
type                text    -- vedi tipi sotto
product_id          uuid    references products(id)  -- nullable
paypal_order_id     text    -- nullable
metadata            jsonb   -- dati extra per tipo evento
created_at          timestamptz
```

Tipi di evento:
- `form_submitted` — cliente ha compilato il form pre-acquisto
- `checkout_started` — redirect su PayPal Checkout
- `purchased` — pagamento completato
- `abandoned` — sessione PayPal scaduta senza pagamento
- `refunded` — ordine rimborsato

### `customer_notes`

```sql
id            uuid    primary key
customer_id   uuid    references customers(id)
site_id       uuid    references sites(id)
body          text
created_at    timestamptz
```

### `checkout_form_config`

Configurazione dei campi del form pre-acquisto per ogni sito:

```sql
id        uuid    primary key
site_id   uuid    references sites(id)
fields    jsonb
-- esempio fields:
-- [
--   { "name": "phone",   "label": "Telefono", "type": "text",     "required": false },
--   { "name": "company", "label": "Azienda",  "type": "text",     "required": false },
--   { "name": "notes",   "label": "Note",     "type": "textarea", "required": false }
-- ]
```

---

## Flussi Completi

### 1. Attivazione E-commerce (onboarding merchant)

```
Merchant nelle impostazioni progetto
  → inserisce PayPal Client ID e Client Secret
    (li trova su developer.paypal.com → My Apps)
  → clicca "Attiva pagamenti"
  → Worker verifica le credenziali con una chiamata PayPal test
  → ecommerce_enabled = true
```

Il merchant non lascia mai SitiVetrina. Le credenziali vengono salvate cifrate su Supabase.

### 2. Acquisto Prodotto Fisico

```
Cliente finale su /shop
  → sfoglia prodotti (fetch da Supabase via Worker)
  → aggiunge al carrello (state locale nel browser)
  → click "Checkout"
  → compila form pre-acquisto (nome, email, campi custom)
  → Worker salva/aggiorna customer su Supabase
      upsert su (site_id, email) → status: 'lead'
  → Worker inserisce evento 'form_submitted' su customer_events
  → Worker crea ordine PayPal
      PayPal Orders API v2: orders.create()
      amount, items, shipping_address_collection
  → Worker inserisce evento 'checkout_started' su customer_events
  → browser mostra PayPal button (JS SDK)
  → cliente paga su PayPal (carta o conto PayPal)

  [CASO A — Pagamento riuscito]
  → PayPal SDK chiama Worker /api/capture con paypal_order_id
  → Worker cattura il pagamento: orders.capture()
  → Worker:
      - decrementa stock prodotti fisici
      - crea ordine + order_items su Supabase
      - aggiorna customer.status → 'customer'
      - inserisce evento 'purchased' su customer_events
      - invia email conferma al cliente (via Resend)
      - invia email notifica al merchant (via Resend)

  [CASO B — Abbandono]
  → cliente chiude PayPal senza pagare
  → Worker inserisce evento 'abandoned' su customer_events
  → customer resta con status: 'lead'
```

### 3. Acquisto Prodotto Digitale

Identico al flusso fisico con queste differenze:
```
  → nessun campo indirizzo spedizione nel form
  → dopo orders.capture():
      → Worker genera presigned URL da Cloudflare R2
        (URL con scadenza 72h)
      → invia email al cliente con link di download
      → stock non decrementato (prodotto digitale = illimitato)
```

Il cliente riceve tutto via email — nessun account da creare, nessun login.

### 4. Rimborso (V1 — dal pannello merchant)

```
Merchant nel pannello ordini
  → trova l'ordine
  → click "Rimborsa"
  → Worker chiama PayPal Refunds API con paypal_capture_id
  → Worker aggiorna order.status → 'refunded'
  → Worker inserisce evento 'refunded' su customer_events
  → email rimborso inviata al cliente da PayPal automaticamente
```

---

## Cloudflare Workers

### `/api/checkout` — Crea ordine PayPal

```typescript
export default {
  async fetch(request: Request, env: Env) {
    const { cartItems, formData, siteId } = await request.json()

    // 1. Recupera configurazione sito
    const { data: site } = await supabase
      .from('sites')
      .select('paypal_client_id, paypal_client_secret, currency, shipping_countries')
      .eq('id', siteId)
      .single()

    // 2. Verifica stock per prodotti fisici
    for (const item of cartItems) {
      const { data: product } = await supabase
        .from('products')
        .select('stock, type')
        .eq('id', item.productId)
        .single()

      if (product.type === 'physical' && product.stock !== null && product.stock < item.quantity) {
        return new Response('Stock insufficiente', { status: 400 })
      }
    }

    // 3. Ottieni access token PayPal
    const auth = btoa(`${site.paypal_client_id}:${site.paypal_client_secret}`)
    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    })
    const { access_token } = await tokenRes.json()

    // 4. Salva/aggiorna customer
    const { data: customer } = await supabase
      .from('customers')
      .upsert({
        site_id: siteId,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        company: formData.company,
        custom_fields: formData.custom,
        status: 'lead',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'site_id,email' })
      .select()
      .single()

    // 5. Evento form_submitted
    await supabase.from('customer_events').insert({
      customer_id: customer.id,
      site_id: siteId,
      type: 'form_submitted',
    })

    // 6. Crea ordine PayPal
    const hasPhysical = cartItems.some((i: any) => i.type === 'physical')
    const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: site.currency.toUpperCase(),
            value: (cartItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0) / 100).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: site.currency.toUpperCase(),
                value: (cartItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0) / 100).toFixed(2),
              }
            }
          },
          items: cartItems.map((item: any) => ({
            name: item.name,
            quantity: String(item.quantity),
            unit_amount: {
              currency_code: site.currency.toUpperCase(),
              value: (item.price / 100).toFixed(2),
            }
          })),
          custom_id: `${siteId}|${customer.id}`, // metadata per il capture
          ...(hasPhysical && {
            shipping: { type: 'SHIPPING' }
          }),
        }],
      }),
    })
    const order = await orderRes.json()

    // 7. Evento checkout_started
    await supabase.from('customer_events').insert({
      customer_id: customer.id,
      site_id: siteId,
      type: 'checkout_started',
      paypal_order_id: order.id,
    })

    return Response.json({ orderId: order.id })
  }
}
```

### `/api/capture` — Cattura pagamento dopo approvazione cliente

```typescript
export default {
  async fetch(request: Request, env: Env) {
    const { paypalOrderId, siteId } = await request.json()

    // 1. Recupera credenziali sito
    const { data: site } = await supabase
      .from('sites')
      .select('paypal_client_id, paypal_client_secret')
      .eq('id', siteId)
      .single()

    // 2. Access token
    const auth = btoa(`${site.paypal_client_id}:${site.paypal_client_secret}`)
    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    })
    const { access_token } = await tokenRes.json()

    // 3. Cattura pagamento
    const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    })
    const capture = await captureRes.json()

    if (capture.status !== 'COMPLETED') {
      return new Response('Pagamento non completato', { status: 400 })
    }

    const captureId = capture.purchase_units[0].payments.captures[0].id
    const [capturedSiteId, customerId] = capture.purchase_units[0].custom_id.split('|')
    const shippingAddress = capture.purchase_units[0].shipping?.address

    // 4. Crea ordine su Supabase
    const { data: order } = await supabase.from('orders').insert({
      site_id: capturedSiteId,
      customer_id: customerId,
      paypal_order_id: paypalOrderId,
      paypal_capture_id: captureId,
      status: 'paid',
      shipping_address: shippingAddress ?? null,
      total_amount: Math.round(parseFloat(capture.purchase_units[0].amount.value) * 100),
      currency: capture.purchase_units[0].amount.currency_code.toLowerCase(),
    }).select().single()

    // 5. Aggiorna customer
    await supabase.from('customers')
      .update({ status: 'customer' })
      .eq('id', customerId)

    // 6. Evento purchased
    await supabase.from('customer_events').insert({
      customer_id: customerId,
      site_id: capturedSiteId,
      type: 'purchased',
      paypal_order_id: paypalOrderId,
    })

    // 7. Email conferma + eventuale link download digitale
    await sendConfirmationEmail(capture, order)

    return Response.json({ success: true })
  }
}
```

### `/api/refund` — Rimborso dal pannello merchant

```typescript
export default {
  async fetch(request: Request, env: Env) {
    const { orderId, siteId } = await request.json()

    const { data: order } = await supabase
      .from('orders')
      .select('paypal_capture_id, customer_id')
      .eq('id', orderId)
      .single()

    const { data: site } = await supabase
      .from('sites')
      .select('paypal_client_id, paypal_client_secret')
      .eq('id', siteId)
      .single()

    const auth = btoa(`${site.paypal_client_id}:${site.paypal_client_secret}`)
    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    })
    const { access_token } = await tokenRes.json()

    await fetch(`https://api-m.paypal.com/v2/payments/captures/${order.paypal_capture_id}/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    await supabase.from('orders').update({ status: 'refunded' }).eq('id', orderId)
    await supabase.from('customer_events').insert({
      customer_id: order.customer_id,
      site_id: siteId,
      type: 'refunded',
    })

    return Response.json({ success: true })
  }
}
```

---

## Prodotti Digitali — Download

```typescript
// Dopo il capture, se il prodotto è digitale
async function generateDownloadUrl(digitalFileKey: string, env: Env) {
  // Genera presigned URL da R2 con scadenza 72h
  const url = await env.R2.createPresignedUrl('GET', digitalFileKey, {
    expiresIn: 60 * 60 * 72, // 72 ore
  })
  return url
}
// L'URL viene incluso nell'email di conferma
// Il cliente clicca il link e scarica direttamente da R2
```

---

## Pannello Merchant — Pagine

### Impostazioni E-commerce
- Inserisci PayPal Client ID e Client Secret
- Valuta e paesi di spedizione accettati
- Configurazione form pre-acquisto (campi custom)

### Gestione Prodotti
- Lista prodotti con foto, prezzo, stock, tipo (fisico/digitale)
- Crea / modifica prodotto
- Upload immagini → R2
- Upload file digitale → R2 (solo per tipo `digital_download`)
- Attiva / disattiva prodotto

### Gestione Ordini
- Lista ordini con stato, importo, cliente
- Filtri: per stato, per data, ricerca per email
- Dettaglio ordine:
  - Dati cliente e indirizzo spedizione
  - Prodotti acquistati con quantità e prezzi (snapshot)
  - Cambio stato manuale: pagato → spedito → completato
  - Bottone "Rimborsa" → chiama `/api/refund`

### CRM Clienti
- Lista clienti: nome, email, status (lead/customer), tag, valore totale, ultimo evento
- Filtri: per status, per tag, per data, per prodotto acquistato
- Dettaglio cliente:
  - Dati anagrafici e campi custom
  - Tag (aggiungibili/rimovibili)
  - Valore totale acquisti
  - Timeline eventi completa
  - Lista ordini associati
  - Note manuali del merchant
- Export CSV lista clienti

---

## Componenti Sito (draggabili nel builder)

| Componente | Route | Note |
|---|---|---|
| Griglia prodotti | `/shop` | fetch da Supabase via Worker |
| Scheda prodotto | `/shop/[slug]` | varianti, immagini, tipo |
| Form pre-acquisto | — | campi configurati dal merchant |
| Carrello | — | state locale nel browser |
| Bottone PayPal | — | PayPal JS SDK, chiama `/api/checkout` poi `/api/capture` |
| Pagina successo | `/checkout/success` | messaggio post-acquisto |
| Pagina annullata | `/checkout/cancel` | invito a riprovare |

---

## Fiscalità e Spedizioni

### IVA
- V1: merchant imposta manualmente l'aliquota IVA nelle impostazioni (default 22% IT)
- V2: valutare Stripe Tax se si aggiunge Stripe come gateway

### Paesi di spedizione
- Configurabili nelle impostazioni del progetto (`shipping_countries`)
- Passati al form di checkout per bloccare indirizzi non supportati
- Default: solo Italia

### OSS (One Stop Shop)
- Rilevante solo per vendite cross-border in UE sopra €10.000/anno
- V1: non gestito — il merchant è responsabile
- V2: da valutare integrazione con software di contabilità

---

## Costi a Regime

| Voce | Chi paga | Importo |
|---|---|---|
| PayPal per transazione | Merchant | ~3.4% + €0.35 (carte EU) |
| Cloudflare Workers | Tu | €0 fino a scala |
| Cloudflare R2 | Tu | €0 fino a 10GB |
| Supabase | Tu | €0 free tier · $25/mese pro |
| Resend email | Tu | €0 fino a 3k email/mese |

Lato tuo: zero costi fissi per la V1.

---

## Roadmap

### V1 — Base funzionante
- Schema Supabase completo
- Onboarding merchant: inserimento credenziali PayPal nelle impostazioni
- Worker `/api/checkout`
- Worker `/api/capture`
- Worker `/api/refund`
- Componenti sito: griglia, scheda, form pre-acquisto, carrello, bottone PayPal
- Pannello merchant: prodotti + ordini
- CRM base: lista clienti, dettaglio, timeline eventi, note, tag
- Email conferma ordine (fisico e digitale)
- Download digitale via R2 presigned URL

### V2 — Miglioramenti
- Aggiungi Stripe come gateway alternativo
- Filtri avanzati CRM
- Export CSV clienti
- Email diretta al cliente dal pannello (via Resend)
- Tracking number spedizione
- Codici sconto
- Gestione IVA avanzata

### V3 — Opzionale
- Analytics vendite e conversioni
- Stripe Tax (IVA automatica cross-border)
- Multi-currency
- Prodotti con varianti a prezzi diversi
