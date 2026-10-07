import { expect, test } from '@playwright/test';

test('la page d’accueil affiche le formulaire d’abonnement', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Abonnement');
	await expect(page.getByRole('button', { name: 'Aller au paiement' })).toBeVisible();
});

test('la page de remerciement est accessible', async ({ page }) => {
	await page.goto('/thank-you');
	await expect(page.locator('h1')).toHaveText('Merci');
});
