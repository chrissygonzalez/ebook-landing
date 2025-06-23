import { json } from '@sveltejs/kit';
import sgMail from '@sendgrid/mail';
import Stripe from 'stripe';
import { SENDGRID_API_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_API_KEY } from "$env/static/private";

const stripe = new Stripe(STRIPE_API_KEY);
sgMail.setApiKey(SENDGRID_API_KEY);

const PDF_GUIDE_URL = 'https://narrify-public.s3.eu-central-1.amazonaws.com/sample.pdf';

export async function POST({ request }) {
    const body = await request.text(); // Get the raw body
    const signature = request.headers.get("stripe-signature") || "";

    try {
        const stripeEvent = stripe.webhooks.constructEvent(
            body,
            signature,
            STRIPE_WEBHOOK_SECRET
        );

        const customerEmail = stripeEvent.data.object.customer_details.email;
        const customerName = stripeEvent.data.object.customer_details.name;

        const response = await fetch(PDF_GUIDE_URL);
        const pdfBuffer = await response.arrayBuffer();
        const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

        const message = {
            to: customerEmail,
            from: 'chrissygonzalez@gmail.com',
            subject: 'Your Purchase Confirmation - Complete Spain Relocation Guide',
            html: `
        <h1>Thank you for your purchase, ${customerName}</h1>
        <p>Here's some more text</p>
        `,
            attachments: [{
                content: base64Pdf,
                filename: "Digital Ebook",
                type: "application/pdf",
                disposition: "attachment",
            }]
        }

        await sgMail.send(message);

        return json({ response: 'Email sent' })
    } catch (err) {
        return json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }
}