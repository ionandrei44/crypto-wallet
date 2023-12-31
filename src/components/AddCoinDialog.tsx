"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { PlusIcon, ChevronRight } from "lucide-react";
import { Input } from "./ui/input";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "./ui/badge";
import { CoinData, SelectedCoinInfo } from "@/utils/interfaces";
import { useWallet } from "@/providers/WalletProvider";

const AddCoinDialog = () => {
  const { selectedCoin, selectCoin, unselectCoin } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedCoinInfo, setSelectedCoinInfo] = useState<SelectedCoinInfo>({
    quantity: 0,
    pricePerCoin: 0,
  });

  const {
    data: coins,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      const response = await fetch(`api/getCoins?symbol=${inputValue}`);

      return response.json();
    },
    queryKey: ["coins"],
    enabled: false,
  });

  const searchTerm = inputValue.trim().length > 0;

  const searchCoin = () => {
    if (searchTerm) {
      if (!hasSearched) {
        setHasSearched(true);
      }
      refetch();
    }
  };

  const resetDialogState = () => {
    unselectCoin();
    setInputValue("");
    setHasSearched(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      resetDialogState();
    }
  }, [isModalOpen]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Button variant="ghost" onClick={() => setIsModalOpen(true)}>
        <PlusIcon className="mr-2" /> Add asset
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a coin</DialogTitle>
        </DialogHeader>
        <div className="my-2 flex flex-col gap-3">
          {!selectedCoin ? (
            <>
              <Input
                placeholder="Search"
                value={inputValue}
                onChange={(e) => {
                  if (hasSearched) {
                    setHasSearched(false);
                  }

                  setInputValue(e.target.value);
                }}
              />

              <div className="flex flex-col gap-3">
                {isLoading || isFetching ? (
                  <div>Loading...</div>
                ) : hasSearched ? (
                  coins?.length > 0 ? (
                    coins.map((coinObj: any) => {
                      const coin: CoinData = coinObj[Object.keys(coinObj)[0]];
                      return (
                        <Badge
                          onClick={() => {
                            selectCoin(coin);

                            if (coin.quote.USD.price) {
                              setSelectedCoinInfo((prev) => ({
                                ...prev,
                                pricePerCoin: coin.quote.USD.price ?? 0,
                              }));
                            }
                          }}
                          className="py-2 rounded-md w-full cursor-pointer flex-container-center justify-between"
                          key={coin.id}
                          variant="secondary"
                        >
                          <p>
                            {coin.name} {coin.symbol} -{" "}
                            {coin.quote.USD.price
                              ? `$${coin.quote.USD.price.toFixed(2)}`
                              : "Price not provided"}
                          </p>
                          <ChevronRight />
                        </Badge>
                      );
                    })
                  ) : (
                    <Badge className="py-2" variant="destructive">
                      Coin not found
                    </Badge>
                  )
                ) : null}
                <Button
                  type="button"
                  disabled={!searchTerm || isLoading}
                  onClick={searchCoin}
                >
                  Search
                </Button>
              </div>
            </>
          ) : (
            <>
              <Input
                value={`${selectedCoin.name} ${selectedCoin.symbol}`}
                disabled
              />
              <div className="flex-container-center gap-2">
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0.00"
                    value={selectedCoinInfo.quantity}
                    onChange={(e) =>
                      setSelectedCoinInfo((prev) => ({
                        ...prev,
                        quantity: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="ppc">Price Per Coin</Label>
                  <Input
                    id="ppc"
                    type="number"
                    placeholder="0.00"
                    value={selectedCoinInfo.pricePerCoin.toFixed(2)}
                    onChange={(e) =>
                      setSelectedCoinInfo((prev) => ({
                        ...prev,
                        pricePerCoin: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="bg-secondary p-3 rounded-md">
                <h6 className="font-bold mb-1">Total Spent</h6>
                <p>
                  ${" "}
                  {(
                    selectedCoinInfo.quantity * selectedCoinInfo.pricePerCoin
                  ).toFixed(2)}
                </p>
              </div>
              <Button
                type="button"
                disabled={
                  !selectedCoinInfo.quantity || !selectedCoinInfo.pricePerCoin
                }
                onClick={searchCoin}
              >
                Add Transaction
              </Button>
            </>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          {selectedCoin && (
            <Button type="button" variant="outline" onClick={resetDialogState}>
              Back
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCoinDialog;
