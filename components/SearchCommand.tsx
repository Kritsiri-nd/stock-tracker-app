"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchCommandProps = {
  triggerClassName?: string;
};

const SearchCommand = ({ triggerClassName }: SearchCommandProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FinnhubSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    if (!hasQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Search failed");
        }
        const data = (await res.json()) as FinnhubSearchResponse;
        setResults(data.result || []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Search failed";
        setError(message);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, query, hasQuery]);

  const resultLabel = useMemo(() => {
    if (!hasQuery) return "Type to search";
    if (isLoading) return "Searching...";
    if (error) return "Search failed";
    return `Search results (${results.length})`;
  }, [hasQuery, isLoading, error, results.length]);

  const handleSelect = (symbol: string) => {
    setOpen(false);
    startTransition(() => {
      router.push(`/stocks/${symbol}`);
    });
  };

  return (
    <>
      <button
        className={triggerClassName ?? "search-btn"}
        type="button"
        onClick={() => setOpen(true)}
      >
        Search
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="search-dialog"
      >
        <div className="search-field">
          <CommandInput
            placeholder="Search stocks..."
            value={query}
            onValueChange={setQuery}
            className="search-input"
          />
        </div>
        <div className="search-count">{resultLabel}</div>
        <CommandList className="search-list">
          {error && <CommandEmpty>{error}</CommandEmpty>}
          {!error && !isLoading && hasQuery && results.length === 0 && (
            <CommandEmpty>Not found stock</CommandEmpty>
          )}
          {!error && !isLoading && !hasQuery && (
            <CommandEmpty>Start typing to search</CommandEmpty>
          )}
          <CommandGroup>
            {results.map((item) => (
              <CommandItem
                key={`${item.symbol}-${item.description}`}
                value={item.symbol}
                onSelect={() => handleSelect(item.symbol)}
                className="search-item"
              >
                <div className="w-full">
                  <div className="search-item-name">{item.symbol}</div>
                  <div className="text-xs text-gray-500">
                    {item.description}
                    {item.type ? ` | ${item.type.toUpperCase()}` : ""}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchCommand;
