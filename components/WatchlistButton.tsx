"use client";

import { useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { cn } from "@/lib/utils";

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const [added, setAdded] = useState(isInWatchlist);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (added) return;
    setError(null);
    startTransition(async () => {
      const result = await addToWatchlist({ symbol, company });

      if (result.success) {
        setAdded(true);
        onWatchlistChange?.(symbol, true);
        return;
      }

      setError(result.error ?? "Failed to add to watchlist.");
    });
  };

  const handleRemove = () => {
    if (!added) return;
    setError(null);
    startTransition(async () => {
      const result = await removeFromWatchlist(symbol);

      if (result.success) {
        setAdded(false);
        onWatchlistChange?.(symbol, false);
        return;
      }

      setError(result.error ?? "Failed to remove from watchlist.");
    });
  };

  return (
    <div className="space-y-2">
      <button
        className={cn("watchlist-btn", added && "watchlist-remove")}
        type="button"
        onClick={added ? handleRemove : handleAdd}
        disabled={isPending}
      >
        {added
          ? `Remove ${symbol.toUpperCase()} from Watchlist`
          : `Add ${symbol.toUpperCase()} to Watchlist`}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default WatchlistButton;
