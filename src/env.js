import { defineEnvVars } from '@sveltejs/kit/env';

// Variables lues au démarrage du serveur (Coolify > Resource > Environment variables).
export const variables = defineEnvVars({
	CONFIG_STRIPE_KEY: { description: 'Clé secrète Stripe (sk_...)' },
	CONFIG_STRIPE_WEBHOOK_KEY: { description: 'Secret de signature du webhook Stripe (whsec_...)' },
	CONFIG_VOSFACTURES_KEY: { description: 'Token API VosFactures' },
	CONFIG_VOSFACTURES_DOMAIN: { description: 'Domaine VosFactures (xxx.vosfactures.fr)' },
	CONFIG_VOSFACTURES_TEST: { description: 'Mode test VosFactures ("true" / "false")' },
	CONFIG_ACTIVATE_KEY: { description: "Clé d'activation des contrats (api.pioupiou.fr)" },
	CONFIG_SMTP_HOST: { description: 'Serveur SMTP (ex. smtp.example.org)' },
	CONFIG_SMTP_PORT: { description: 'Port SMTP (465 = TLS implicite, 587 = STARTTLS)' },
	CONFIG_SMTP_USER: { description: 'Identifiant SMTP' },
	CONFIG_SMTP_PASSWORD: { description: 'Mot de passe SMTP' },
	CONFIG_SMTP_FROM: { description: 'Adresse expéditeur (ex. abo@openwindmap.org)' }
});
