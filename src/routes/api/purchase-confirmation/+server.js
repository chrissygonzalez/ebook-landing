import { json } from '@sveltejs/kit';
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY } from "$env/static/private";

sgMail.setApiKey(SENDGRID_API_KEY);

const PDF_GUIDE_URL = 'https://narrify-public.s3.eu-central-1.amazonaws.com/sample.pdf';

export async function POST({ request }) {
    const requestBody = await request.json();
    console.log(requestBody);

    const response = await fetch(PDF_GUIDE_URL);
    const pdfBuffer = await response.arrayBuffer();
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

    const customerEmail = requestBody.data.object.customer_details.email;
    const customerName = requestBody.data.object.customer_details.name;

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
}