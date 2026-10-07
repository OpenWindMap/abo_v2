import { defineEnvVars } from '@sveltejs/kit/env';

// Variables lues au démarrage du serveur (Netlify > Site settings > Environment variables).
export const variables = defineEnvVars({
	CONFIG_STRIPE_KEY: { description: 'Clé secrète Stripe (sk_...)' },
	CONFIG_STRIPE_WEBHOOK_KEY: { description: 'Secret de signature du webhook Stripe (whsec_...)' },
	CONFIG_VOSFACTURES_KEY: { description: 'Token API VosFactures' },
	CONFIG_VOSFACTURES_DOMAIN: { description: 'Domaine VosFactures (xxx.vosfactures.fr)' },
	CONFIG_VOSFACTURES_TEST: { description: 'Mode test VosFactures ("true" / "false")' },
	CONFIG_ACTIVATE_KEY: { description: "Clé d'activation des contrats (api.pioupiou.fr)" },
	CONFIG_MAILGUN_ID: { description: 'Identifiant Mailgun (username)' },
	CONFIG_MAILGUN_KEY: { description: 'Clé API Mailgun' }
});
