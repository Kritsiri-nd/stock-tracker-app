import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import { sendWelcomeEmail } from "../nodemailer";
import { step } from "inngest";
import { getAllUserForNewsEmail } from "../actions/user.actions";


export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created' },
    async ({ event, step }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(`{{userProfile}}`, userProfile);

        const response = await step.ai.infer(`generate-welcome-intro`, {
            model: step.ai.models.gemini({
                model: 'gemini-2.5-flash-lite',
            }),
            body: {
                contents: [
                    {
                        role: `user`,
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]

            }
        })
        await step.run(`send-welcome-email`, async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && `text` in part ? part.text : null) || `Thanks for joining Charttroll. You now have the tools to track markets and make smarter moves`

            const {data: {email, name}} = event
            return await sendWelcomeEmail({email, name, intro: introText})
        })
        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary' },
    [ {event: 'app/send.daily.news'}, {cron: '0 12 * * *'}],
    async ({ step}) => {
        // step 1 : Get all users for news email
        const users = await step.run('get-all-users', getAllUserForNewsEmail);

        if(!users || users.length ===0) return { success: false, message: 'No users found for news email' };
        }  
        // step 2 : Fetch personalized news for each user
        
        // step 3 : Summarize news via AI for each user
        // step 4 : Send email to each user

)
