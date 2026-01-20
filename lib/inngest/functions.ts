import { inngest } from "@/lib/inngest/client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "@/lib/inngest/prompts";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import {
  getAllUserForNewsEmail,
  NewsEmailUser,
} from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";

const formatNewsDate = () =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const buildFallbackNewsHtml = (news: MarketNewsArticle[]) =>
  news
    .map(
      (article) => `
<div class="dark-info-box" style="background-color: #212328; padding: 24px; margin: 20px 0; border-radius: 8px;">
  <h4 class="dark-text" style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #FFFFFF; line-height: 1.4;">
    ${article.headline}
  </h4>
  <p class="mobile-text dark-text-secondary" style="margin: 0 0 14px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">
    ${article.summary}
  </p>
  <div style="margin: 12px 0 0 0;">
    <a href="${article.url}" style="color: #FDD458; text-decoration: none; font-weight: 500; font-size: 14px;" target="_blank" rel="noopener noreferrer">
      Read Full Story ->
    </a>
  </div>
</div>`
    )
    .join("");

export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
      - Country: ${event.data.country}
      - Investment goals: ${event.data.investmentGoals}
      - Risk tolerance: ${event.data.riskTolerance}
      - Preferred industry: ${event.data.preferredIndustry}
    `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({
        model: "gemini-2.5-flash-lite",
      }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining Charttroll. You now have the tools to track markets and make smarter moves.";

      const {
        data: { email, name },
      } = event;
      return await sendWelcomeEmail({ email, name, intro: introText });
    });

    return {
      success: true,
      message: "Welcome email sent successfully",
    };
  }
);

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news-summary" },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  async ({ step }) => {
    const users = await step.run("get-all-users", getAllUserForNewsEmail);

    if (!users || users.length === 0) {
      return { success: true };
    }

    const typedUsers: NewsEmailUser[] = users;
    const formattedDate = formatNewsDate();

    for (const user of typedUsers) {
      try {
        const symbols = await getWatchlistSymbolsByEmail(user.email);
        const news = await getNews(symbols);

        if (!news || news.length === 0) {
          continue;
        }

        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(news)
        );

        const aiSummary = await step.ai.infer(`summarize-news-${user.id}`, {
          model: step.ai.models.gemini({
            model: "gemini-2.5-flash-lite",
          }),
          body: {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          },
        });

        const part = aiSummary.candidates?.[0]?.content?.parts?.[0];
        const summaryHtml =
          (part && "text" in part ? part.text : null) ||
          buildFallbackNewsHtml(news);

        await step.run(`send-news-email-${user.id}`, async () =>
          sendNewsSummaryEmail({
            email: user.email,
            date: formattedDate,
            newsContent: summaryHtml,
          })
        );
      } catch (e) {
        console.error(`Failed to process news for ${user.email}`, e);
      }
    }

    return { success: true };
  }
);
