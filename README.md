# abo.openwindmap.org — abonnements de communication

Formulaire de paiement des abonnements des balises OpenWindMap (Stripe + VosFactures + SMTP),
hébergé sur Coolify.

Stack : SvelteKit 3, Svelte 5, Vite 8, `@sveltejs/adapter-node`. Node ≥ 22.17 requis.

## Développement

```bash
cp .env.example .env     # puis remplir les valeurs (clés Stripe en mode test !)
npm install
npm run dev
```

Tester le webhook Stripe en local : `stripe listen --forward-to localhost:5173/backend/stripe-webhook`

## Variables d'environnement

Déclarées dans `src/env.js`. Elles doivent être définies **au build et à l'exécution**
(Coolify → resource → Environment variables, portée « Builds » + « Functions »).
Si l'une manque, le build échoue en listant les noms manquants.

| Variable                                       | Rôle                                         |
| ---------------------------------------------- | -------------------------------------------- |
| `CONFIG_STRIPE_KEY`                            | clé secrète Stripe                           |
| `CONFIG_STRIPE_WEBHOOK_KEY`                    | secret de signature du webhook (`whsec_...`) |
| `CONFIG_VOSFACTURES_KEY` / `_DOMAIN` / `_TEST` | facturation VosFactures                      |
| `CONFIG_ACTIVATE_KEY`                          | activation des contrats sur api.pioupiou.fr  |
| `CONFIG_SMTP_HOST` / `_PORT` / `_USER` / `_PASSWORD` / `_FROM` | notifications e-mail par SMTP (465 = TLS, 587 = STARTTLS) |

## Déploiement Coolify
 
Le dépôt contient un `Dockerfile` (build multi-stage, Node 22 Alpine, port **3000**) et un `.dockerignore`.
 
1. Coolify → _New Resource_ → _Public/Private Repository_ → choisir le dépôt.
2. _Build Pack_ : **Dockerfile** (base directory `/`, fichier `/Dockerfile`).
3. _Ports Exposes_ : **3000**.
4. _Domains_ : `https://abo.openwindmap.org` (DNS : enregistrement A vers l'IP du serveur ;
   Traefik et Let's Encrypt gèrent le HTTPS).
5. _Environment Variables_ : renseigner toutes les variables du tableau ci-dessus, plus
   `ORIGIN=https://abo.openwindmap.org` (nécessaire derrière le reverse proxy).
   - cocher **« Available at Runtime »** ;
   - décocher « Available at Buildtime » : le `Dockerfile` utilise des valeurs factices au build,
     les vrais secrets ne servent qu'au démarrage et n'entrent pas dans l'image ;
   - ne **pas** cocher « Is Multiline? » (sinon les variables peuvent ne pas arriver au conteneur) ;
   - valeurs sans guillemets, aucune variable vide.
6. _Deploy_. Après toute modification de variable, faire **Redeploy** (un simple restart ne suffit pas).
7. Vérifier dans Stripe que le webhook (événement `payment_intent.succeeded`) pointe vers
   `https://abo.openwindmap.org/backend/stripe-webhook`, et que `CONFIG_STRIPE_WEBHOOK_KEY` contient
   le secret `whsec_...` de ce webhook.
8. Optionnel : activer le déploiement automatique (webhook GitHub/GitLab) et un healthcheck `GET /` sur le port 3000.
Serveur conseillé : 2 vCPU / 2 Go de RAM minimum pour le build et l'exécution.
 
### Dépannage
 
- **404 `page not found`** (texte brut) : c'est Traefik, aucun conteneur sain n'est routé. Regarder l'onglet
  _Logs_ de l'application.
- **Conteneur en `Restarting` + `env_invalid`** : variables absentes au runtime (voir étape 5).
- **POST refusés en 403** : `ORIGIN` ne correspond pas à l'URL utilisée. Pour tester sur une URL `sslip.io`,
  mettre temporairement `ORIGIN` sur cette URL.
### Tester l'image en local
 
```bash
docker build -t abo .
docker run --rm -p 3000:3000 --env-file .env -e ORIGIN=http://localhost:3000 abo
```
 
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
- Stripe 9 → 23 (`new Stripe(...)`, `constructEventAsync`).
- Webhook : les e-mails de notification sont désormais attendus (`await`) avant de répondre, sinon la fonction
  serverless pouvait être coupée avant leur envoi.
- Retiré : le bandeau « Maintenance » codé en dur dans `app.html`, qui masquait tout le site.
- Corrections mineures : balise `<p>` mal fermée, labels reliés à leurs champs, nom de la balise qui s'effaçait
  quand elle n'avait pas de contrat, `console.log` de données personnelles dans `prepare-payment`.

## Licence

Voir `LICENSE`.
