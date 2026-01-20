import nodemailer from 'nodemailer';
import {
    NEWS_SUMMARY_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
} from '@/lib/nodemailer/templates';

export const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

export const sendWelcomeEmail = async ({email, name, intro}: WelcomeEmailData) => {
    const appUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BETTER_AUTH_URL || "";
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace(`{{name}}`, name)
        .replace('{{intro}}', intro)
        .replace('{{appUrl}}', appUrl);

    const mailOptions = {
        from: `"ChartTroll" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: 'Welcome to ChartTroll!',
        text: "Thank you for signing up to ChartTroll. We're excited to have you on board!",
        html: htmlTemplate,
    };

    await transport.sendMail(mailOptions);

}

type NewsSummaryEmailData = {
    email: string;
    date: string;
    newsContent: string;
};

export const sendNewsSummaryEmail = async ({
    email,
    date,
    newsContent,
}: NewsSummaryEmailData) => {
    const appUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BETTER_AUTH_URL || "";
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent)
        .replace('{{appUrl}}', appUrl);

    const mailOptions = {
        from: `"ChartTroll" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: 'Your Daily Market News Summary',
        text: 'Your daily market news summary is ready.',
        html: htmlTemplate,
    };

    await transport.sendMail(mailOptions);
};
