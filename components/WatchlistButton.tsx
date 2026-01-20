"use client";

import { useState, useTransition } from "react";
import { addToWatchlist } from "@/lib/actions/watchlist.actions";

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

  return (
    <div className="space-y-2">
      <button
        className="watchlist-btn"
        type="button"
        onClick={handleAdd}
        disabled={isPending || added}
      >
        {added
          ? "Added to Watchlist"
          : `Add ${symbol.toUpperCase()} to Watchlist`}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default WatchlistButton;
