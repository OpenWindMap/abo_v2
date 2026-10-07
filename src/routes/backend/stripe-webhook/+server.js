import Stripe from 'stripe';
import Mailgun from 'mailgun.js';
import { config } from '#lib/server/config.js';

const stripe = new Stripe(config.stripe_key);
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
	username: config.mailgun_id,
	key: config.mailgun_key,
	url: 'https://api.eu.mailgun.net'
});

const status = (code) => new Response(null, { status: code });

async function createInvoice(data, payment) {
	// const date = new Date(payment.created * 1000).toISOString().substr(0, 10)
	// TODO : date should be CET/CEST and not UTC

	const amountTxt = (payment.amount / 100).toFixed(2);

	const invoiceData = {
		api_token: config.vosfactures_key,
		invoice: {
			kind: 'vat',
			// 'sell_date': date,
			test: config.vosfactures_test,
			buyer_name: `${data.invoice_name} (${data.station_id})`,
			buyer_street: data.invoice_street,
			buyer_city: data.invoice_city,
			buyer_post_code: data.invoice_post_code,
			buyer_country: data.invoice_country,
			status: 'paid',
			// 'paid_date': date,
			payment_type: 'Carte bancaire internet',
			paid: amountTxt,
			buyer_email: data.email,
			payment_to_kind: 'off',
			positions: {
				name: `Abonnement de communication`,
				description: `Balise météo n°${data.station_id}\nDurée : 1 an`,
				quantity: '1',
				tax: '20',
				total_price_gross: amountTxt
			}
		}
	};

	const creationResponse = await fetch(`https://${config.vosfactures_domain}/invoices.json`, {
		method: 'POST',
		body: JSON.stringify(invoiceData),
		headers: { 'Content-Type': 'application/json' }
	});
	if (!creationResponse.ok) throw new Error('Could not create invoice');
	const invoice = await creationResponse.json();

	const emailResponse = await fetch(
		`https://${config.vosfactures_domain}/invoices/${invoice.id}/send_by_email.json`,
		{
			method: 'POST',
			body: JSON.stringify({
				force: 'true',
				api_token: config.vosfactures_key
			}),
			headers: { 'Content-Type': 'application/json' }
		}
	);
	if (!emailResponse.ok) throw new Error('Could not send invoice');
}

async function activateContract(data) {
	const response = await fetch(`https://api.pioupiou.fr/v1/contract/activate/${data.station_id}`, {
		method: 'POST',
		body: JSON.stringify({
			key: config.activate_key,
			sponsor: data.sponsor
		}),
		headers: { 'Content-Type': 'application/json' }
	});
	if (!response.ok) throw new Error('Could not activate communications');
}

// Sur Netlify (fonction serverless), la fonction peut être arrêtée dès que la réponse part :
// on attend donc l'envoi des e-mails, sans jamais laisser une erreur d'envoi casser le webhook.
async function notify(subject, text) {
	try {
		await mg.messages.create('ml.openwindmap.org', {
			from: 'abo@ml.openwindmap.org',
			to: 'contact@openwindmap.org',
			subject,
			text
		});
	} catch (e) {
		console.error('Mailgun notification failed', e);
	}
}

export async function POST({ request }) {
	const body = await request.text(); // corps brut, nécessaire à la vérification de signature

	try {
		let event;
		try {
			event = await stripe.webhooks.constructEventAsync(
				body,
				request.headers.get('stripe-signature'),
				config.stripe_webhook_key
			);
		} catch (e) {
			console.error(e);
			return status(400);
		}
		if (event.type !== 'payment_intent.succeeded') return status(400);

		const payment = event.data.object;
		if (payment.status !== 'succeeded') return status(400);

		const data = payment.metadata;

		if (!data.station_id) return status(200); // webhook sans rapport avec les abonnements : on ignore

		await activateContract(data);
		await createInvoice(data, payment);
		await notify(`[AUTO] renew ${data.station_id}`, JSON.stringify(data, null, 2));

		return status(200);
	} catch (e) {
		console.error(e);
		await notify('[AUTO] Erreur abo', String(e.stack) + '\n\n' + body);
		return status(204); // succès côté Stripe, pour éviter que Stripe ne rejoue l'événement
	}
}
