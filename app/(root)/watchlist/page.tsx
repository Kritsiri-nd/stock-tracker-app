import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { getWatchlistByEmail } from "@/lib/actions/watchlist.actions";
import {
  getFinancials,
  getNews,
  getProfile,
  getQuote,
} from "@/lib/actions/finnhub.actions";
import { ArrowUpRight } from "lucide-react";

const WatchlistPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const items = await getWatchlistByEmail(session.user.email);
  const watchlistWithData = await Promise.all(
    items.map(async (item) => {
      const symbol = item.symbol.toUpperCase();
      const [quote, profile, financials] = await Promise.all([
        getQuote(symbol),
        getProfile(symbol),
        getFinancials(symbol),
      ]);

      return {
        ...item,
        symbol,
        quote,
        profile,
        financials,
      };
    })
  );
  const watchlistSymbols = watchlistWithData.map((item) => item.symbol);
  const news = await getNews(watchlistSymbols);

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  const formatPrice = (value?: number) =>
    typeof value === "number" ? currency.format(value) : "-";
  const formatPercent = (value?: number) =>
    typeof value === "number" ? `${value.toFixed(2)}%` : "-";
  const formatMarketCap = (value?: number) =>
    typeof value === "number" ? compact.format(value * 1_000_000) : "-";
  const formatPE = (value?: number) =>
    typeof value === "number" ? value.toFixed(1) : "-";

  return (
    <section className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-100">
          Watchlist
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="watchlist-empty-container">
          <div className="watchlist-empty">
            <p className="empty-title">No stocks yet</p>
            <p className="empty-description">
              Add a stock from the stock detail page to see it here.
            </p>
          </div>
        </div>
      ) : (
        <div className="watchlist-table overflow-hidden rounded-lg border border-gray-600">
          <table className="w-full text-left">
            <thead>
              <tr className="table-header-row">
                <th className="table-header py-3 px-4">Company</th>
                <th className="table-header py-3 px-4">Symbol</th>
                <th className="table-header py-3 px-4">Price</th>
                <th className="table-header py-3 px-4">Change</th>
                <th className="table-header py-3 px-4">Market Cap</th>
                <th className="table-header py-3 px-4">P/E Ratio</th>
                <th className="table-header py-3 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody>
              {watchlistWithData.map((item) => {
                const change = item.quote?.dp;
                const changeClass =
                  typeof change === "number"
                    ? change >= 0
                      ? "text-green-500"
                      : "text-red-500"
                    : "text-gray-400";
                const companyName =
                  item.profile?.name?.trim() || item.company || item.symbol;

                return (
                <tr
                  key={`${item.symbol}-${item.addedAt.toString()}`}
                  className="table-row"
                >
                  <td className="table-cell py-3 px-4">
                    <Link
                      href={`/stocks/${item.symbol}`}
                      className="text-gray-100 hover:text-yellow-500 transition-colors"
                    >
                      {companyName}
                    </Link>
                  </td>
                  <td className="table-cell py-3 px-4 text-gray-400">
                    <Link
                      href={`/stocks/${item.symbol}`}
                      className="hover:text-yellow-500 transition-colors"
                    >
                      {item.symbol}
                    </Link>
                  </td>
                  <td className="table-cell py-3 px-4 text-gray-400">
                    {formatPrice(item.quote?.c)}
                  </td>
                  <td className={`table-cell py-3 px-4 ${changeClass}`}>
                    {formatPercent(change)}
                  </td>
                  <td className="table-cell py-3 px-4 text-gray-400">
                    {formatMarketCap(item.profile?.marketCapitalization)}
                  </td>
                  <td className="table-cell py-3 px-4 text-gray-400">
                    {formatPE(item.financials?.metric?.peTTM)}
                  </td>
                  <td className="table-cell py-3 px-4 text-right">
                    <Link
                      href={`/stocks/${item.symbol}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-600 text-yellow-500 hover:text-yellow-400 hover:border-yellow-500 transition-colors"
                      aria-label={`View ${item.symbol} details`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-100 mb-4">
          News
        </h2>
        {news.length === 0 ? (
          <div
            className="text-gray-500"
            dangerouslySetInnerHTML={{ __html: "No market news available today." }}
          />
        ) : (
          <div className="watchlist-news">
            {news.map((article) => (
              <a
                key={`${article.id}-${article.url}`}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="news-item"
              >
                <span className="news-tag">
                  {(article.related || article.category || "News").toUpperCase()}
                </span>
                <h3 className="news-title">{article.headline}</h3>
                <p className="news-meta">
                  {article.source}
                  {" • "}
                  {new Date(article.datetime * 1000).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="news-summary">{article.summary}</p>
                <span className="news-cta">Read more →</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WatchlistPage;
