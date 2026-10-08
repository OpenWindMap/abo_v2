import Stripe from 'stripe';
import { config } from '#lib/server/config.js';

const stripe = new Stripe(config.stripe_key);

const status = (code) => new Response(null, { status: code });

function validateInput(data) {
	if (isNaN(parseInt(data.station_id))) throw new Error('invalid station_id');
	if (data.email !== data.email_confirmation) return false;
	for (let field in data) {
		if (!data[field]) return false;
	}
	return true;
}

async function getStation(id) {
	const response = await fetch(`https://api.pioupiou.fr/v1/live/${id}?contract=true`);
	if (response.status === 404) {
		return null;
	} else if (response.status !== 200) {
		throw new Error(`pioupiou api answered ${response.status}`);
	} else {
		return response.json();
	}
}

export async function POST({ request }) {
	try {
		const data = await request.json();
		if (!validateInput(data)) return status(400);

		const station = await getStation(data.station_id);
		if (!station) return status(404);

		// 409 Conflict : cette balise n'a pas besoin de contrat de communication (pas de Sigfox...)
		if (!(station.data.contract || station.data.contract === null)) return status(409);

		const paymentSession = await stripe.checkout.sessions.create({
			customer_email: data.email,
			client_reference_id: `communication-contract-${data.station_id}`,
			mode: 'payment',
			payment_intent_data: {
				metadata: data
			},
			line_items: [
				{
					price_data: {
						currency: 'eur',
						product_data: {
							name: `Abonnement balise météo n°${data.station_id}`
						},
						unit_amount: 2000
					},
					quantity: 1
				}
			],
			cancel_url: 'https://abo.openwindmap.com/',
			success_url: 'https://abo.openwindmap.com//thank-you'
		});

		return Response.json({ redirect: paymentSession.url });
	} catch (e) {
		console.error(e);
		return status(500);
	}
}
