"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "./ui/badge";
import { CoinData, Session, WatchlistCoin } from "@/utils/interfaces";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { useWatchlist } from "@/providers/WatchlistProvider";
import { Checkbox } from "./ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Label } from "./ui/label";
import Loader from "./Loader";

const AddCoinToWatchlistDialog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  const [selectedCoins, setSelectedCoins] = useState<
    {
      id: number;
      name: string;
      cmcRank: number;
      price: number;
      oneHourChange: number;
      oneDayChange: number;
      sevenDaysChange: number;
      oneDayVolume: number;
      marketCap: number;
      circulatingSupply: number;
    }[]
  >([]);

  const { data } = useSession();
  const { selectedWatchlist, setSelectedWatchlist } = useWatchlist();
  const { toast } = useToast();

  const session = data as Session | null;
  const queryClient = useQueryClient();

  const {
    data: coins,
    isLoading,
    refetch,
    isFetching,
    error,
  } = useQuery({
    queryFn: async () => {
      const response = await fetch(
        `api/external/get-coins-by-symbol?symbol=${inputValue}`
      );

      return response.json();
    },
    queryKey: ["coins"],
    enabled: false,
    retry: false,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: {
      userId: string;
      watchlistId: string;
      coins: Array<WatchlistCoin>;
    }) => {
      return axios.post("/api/watchlist/add-coin", payload);
    },
    onSuccess: (res) => {
      setSelectedWatchlist(res.data);
      toast({
        title: "Coins Added",
        description: "The coins have been added to the wallet.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "There was a problem with your request.",
      });
    },
  });

  const searchTerm = inputValue.trim().length > 0;

  const searchCoin = () => {
    if (searchTerm) {
      refetch();
    }
  };

  const handleToggleCoin = (e: CheckedState, coin: CoinData) => {
    if (e) {
      setSelectedCoins((prev) => [
        ...prev,
        {
          id: coin.id ?? 0,
          name: `${coin.name} ${coin.symbol}`,
          cmcRank: coin.cmc_rank ?? 0,
          price: coin.quote.USD.price ?? 0,
          oneHourChange: coin.quote.USD.percent_change_1h ?? 0,
          oneDayChange: coin.quote.USD.percent_change_24h ?? 0,
          sevenDaysChange: coin.quote.USD.percent_change_7d ?? 0,
          oneDayVolume: coin.quote.USD.volume_24h ?? 0,
          marketCap: coin.quote.USD.market_cap ?? 0,
          circulatingSupply: coin.circulating_supply ?? 0,
        },
      ]);
    } else {
      const updatedList = selectedCoins.filter((c) => c.id !== coin.id);
      setSelectedCoins(updatedList);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      if (
        session?.user?.id &&
        selectedWatchlist?._id &&
        selectedCoins.length > 0
      ) {
        const payload = {
          userId: session.user.id,
          watchlistId: selectedWatchlist._id,
          coins: selectedCoins,
        };

        await mutateAsync(payload);
      }
    } catch (error) {
      console.error("Error adding coins to watchlist:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const resetDialogState = () => {
    setSelectedCoins([]);
    setInputValue("");
    queryClient.setQueryData(["coins"], null);
  };

  useEffect(() => {
    if (!isModalOpen) {
      resetDialogState();
    }
  }, [isModalOpen]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="w-full md:w-fit mx-auto"
      >
        <PlusIcon className="mr-2" /> Add asset
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a coin</DialogTitle>
        </DialogHeader>
        <div className="my-2 flex flex-col gap-6">
          <div className="label-input-container">
            <Label htmlFor="symbol">Coin symbol</Label>
            <Input
              id="symbol"
              placeholder="ETH"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            />
          </div>

          {isLoading || isFetching ? (
            <Loader size={50} />
          ) : !error ? (
            coins?.length > 0 && (
              <div className="flex flex-col gap-3">
                {coins?.map((coinObj: any) => {
                  const coin: CoinData = coinObj[Object.keys(coinObj)[0]];
                  const watchlistCoins = selectedWatchlist?.coins;
                  const coinExists = watchlistCoins?.find(
                    (c) => c.id === coin.id
                  );

                  return (
                    <Badge
                      className="py-2 rounded-md w-full flex-container-center justify-between"
                      key={coin.id}
                      variant="secondary"
                    >
                      <p>
                        {coin.name} {coin.symbol}
                      </p>
                      {!coinExists ? (
                        <Checkbox
                          checked={
                            !!selectedCoins.find((c) => c.id === coin.id)
                          }
                          onCheckedChange={(e) => handleToggleCoin(e, coin)}
                        />
                      ) : (
                        <p className="text-[10px]">Added</p>
                      )}
                    </Badge>
                  );
                })}
              </div>
            )
          ) : (
            <Badge className="py-2" variant="destructive">
              Coin not found
            </Badge>
          )}
          <Button
            type="button"
            disabled={!searchTerm || isLoading || isPending || isFetching}
            onClick={searchCoin}
          >
            Search
          </Button>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsModalOpen(false)}
            disabled={isPending || isLoading || isFetching}
          >
            Close
          </Button>
          <Button
            disabled={
              selectedCoins.length === 0 || isPending || isLoading || isFetching
            }
            onClick={handleAddToWatchlist}
          >
            Add selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCoinToWatchlistDialog;
