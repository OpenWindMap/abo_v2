# abo.openwindmap.org — abonnements de communication

Formulaire de paiement des abonnements des balises OpenWindMap (Stripe + VosFactures + Mailgun),
hébergé sur Netlify

Stack : SvelteKit 3, Svelte 5, Vite 8, `@sveltejs/adapter-netlify`. Node ≥ 22.17 requis.

## Développement

```bash
cp .env.example .env     # puis remplir les valeurs (clés Stripe en mode test !)
npm install
npm run dev
```

Tester le webhook Stripe en local : `stripe listen --forward-to localhost:5173/backend/stripe-webhook`

## Variables d'environnement

Déclarées dans `src/env.js`. Elles doivent être définies **au build et à l'exécution**
(Netlify → Site configuration → Environment variables, portée « Builds » + « Functions »).
Si l'une manque, le build échoue en listant les noms manquants.

| Variable                                       | Rôle                                         |
| ---------------------------------------------- | -------------------------------------------- |
| `CONFIG_STRIPE_KEY`                            | clé secrète Stripe                           |
| `CONFIG_STRIPE_WEBHOOK_KEY`                    | secret de signature du webhook (`whsec_...`) |
| `CONFIG_VOSFACTURES_KEY` / `_DOMAIN` / `_TEST` | facturation VosFactures                      |
| `CONFIG_ACTIVATE_KEY`                          | activation des contrats sur api.pioupiou.fr  |
| `CONFIG_MAILGUN_ID` / `CONFIG_MAILGUN_KEY`     | notifications e-mail (région EU)             |

## Déploiement Netlify

1. Netlify → _Add new site → Import from Git_ → choisir le dépôt (build : `npm run build`, détecté via `netlify.toml`).
2. Renseigner les variables ci-dessus.
3. Vérifier dans Stripe que le webhook (événement `payment_intent.succeeded`) pointe vers
   `https://abo.openwindmap.org/backend/stripe-webhook`.

## Tests et qualité

```bash
npm run lint      # prettier + eslint
npm run test      # Playwright (nécessite: npx playwright install chromium)
```

## Changements par rapport à l'ancienne version

- SvelteKit « next » 2022 → SvelteKit 3 ; Svelte 3 → 5 ; Vite 3 → 8.
- Routes migrées : `index.svelte` → `+page.svelte`, `backend/*.js` → `backend/*/+server.js` (mêmes URLs).
- Config : `svelte.config.js` supprimé, options dans `vite.config.js` ; alias `$lib` → `#lib` (`package.json > imports`).
- Variables d'environnement validées via `src/env.js` (`$app/env/private`).
- Stripe 9 → 23 (`new Stripe(...)`, `constructEventAsync`), mailgun.js 7 → 14 (`FormData` natif, plus de `form-data` ni `node-fetch`).
- Webhook : les e-mails de notification sont désormais attendus (`await`) avant de répondre, sinon la fonction
  serverless pouvait être coupée avant leur envoi.
- Retiré : le bandeau « Maintenance » codé en dur dans `app.html`, qui masquait tout le site.
- Corrections mineures : balise `<p>` mal fermée, labels reliés à leurs champs, nom de la balise qui s'effaçait
  quand elle n'avait pas de contrat, `console.log` de données personnelles dans `prepare-payment`.

## Licence

Voir `LICENSE`.
