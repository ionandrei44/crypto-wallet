"use client";

import Loader from "@/components/Loader";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAsCurrency, formatNumber } from "@/utils/functions";
import { CoinData } from "@/utils/interfaces";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function Home() {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cryptocurrencies, setCryptocurrencies] = useState<CoinData[]>([]);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/external/get-top-coins");
        setCryptocurrencies(response.data.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "There was a problem with your request.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoins();
  }, []);

  if (isLoading || status === "loading") {
    return (
      <main className="wrapper">
        <Loader />
      </main>
    );
  }

  if (status === "unauthenticated") {
    return redirect("/signin");
  }

  return (
    <main className="wrapper">
      <Table>
        <TableCaption>
          A list of the most popular cryptocurrencies.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>1h %</TableHead>
            <TableHead>24h %</TableHead>
            <TableHead>7d %</TableHead>
            <TableHead>Market Cap</TableHead>
            <TableHead>Volume (24h)</TableHead>
            <TableHead>Circulating Supply</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cryptocurrencies?.map((coin: CoinData) => {
            return (
              <TableRow key={coin.id}>
                <TableCell className="font-medium">{coin.cmc_rank}</TableCell>
                <TableCell>{`${coin.name} ${coin.symbol}`}</TableCell>
                <TableCell>{formatNumber(coin.quote.USD.price ?? 0)}</TableCell>
                <TableCell
                  className={
                    (coin.quote.USD.percent_change_1h ?? 0) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {formatNumber(coin.quote.USD.percent_change_1h ?? 0, false)}%
                </TableCell>
                <TableCell
                  className={
                    (coin.quote.USD.percent_change_24h ?? 0) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {formatNumber(coin.quote.USD.percent_change_24h ?? 0, false)}%
                </TableCell>
                <TableCell
                  className={
                    (coin.quote.USD.percent_change_7d ?? 0) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {formatNumber(coin.quote.USD.percent_change_7d ?? 0, false)}%
                </TableCell>
                <TableHead>
                  {formatAsCurrency(
                    +(coin?.quote?.USD?.market_cap?.toFixed(2) ?? 0)
                  )}
                </TableHead>
                <TableHead>
                  {formatAsCurrency(
                    +(coin.quote.USD.volume_24h?.toFixed(2) ?? 0)
                  )}
                </TableHead>
                <TableHead>
                  {formatAsCurrency(
                    +(coin.circulating_supply?.toFixed(2) ?? 0)
                  )}
                </TableHead>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
