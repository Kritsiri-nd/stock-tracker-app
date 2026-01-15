import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE } from '@/lib/nodemailer/templates';

export const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

export const sendWelcomeEmail = async ({email, name, intro}: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace(`{{name}}`, name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"Charttroll" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: 'Welcome to ChartTroll!',
        text: "Thank you for signing up to ChartTroll. We're excited to have you on board!",
        html: htmlTemplate,
    };

    await transport.sendMail(mailOptions);

}