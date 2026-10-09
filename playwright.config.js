/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	testDir: 'tests',
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		// valeurs factices : suffisent pour afficher la page, sans appeler Stripe & co
		env: {
			CONFIG_STRIPE_KEY: 'sk_test_dummy',
			CONFIG_STRIPE_WEBHOOK_KEY: 'whsec_dummy',
			CONFIG_VOSFACTURES_KEY: 'dummy',
			CONFIG_VOSFACTURES_DOMAIN: 'dummy.example',
			CONFIG_VOSFACTURES_TEST: 'true',
			CONFIG_ACTIVATE_KEY: 'dummy',
			CONFIG_SMTP_HOST: 'localhost',
			CONFIG_SMTP_PORT: '587',
			CONFIG_SMTP_USER: 'dummy',
			CONFIG_SMTP_PASSWORD: 'dummy',
			CONFIG_SMTP_FROM: 'dummy@example.org'
		}
	}
};

export default config;
