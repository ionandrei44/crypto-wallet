"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import React, { Dispatch, SetStateAction, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Session, Watchlist } from "@/utils/interfaces";
import axios from "axios";
import { useToast } from "./ui/use-toast";

const CreateWatchlistDialog = ({
  open,
  onOpenChange,
  setIsModalOpen,
  setWatchlists,
  setSelectedWatchlist,
}: {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setWatchlists: Dispatch<SetStateAction<Watchlist[]>>;
  setSelectedWatchlist: Dispatch<SetStateAction<Watchlist | null>>;
}) => {
  const [watchlistDetails, setWatchlistDetails] = useState({
    name: "",
    description: "",
  });

  const { toast } = useToast();

  const { data } = useSession();

  const session = data as Session | null;

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (newWatchlist: {
      userId: string;
      watchlistName: string;
      description: string;
    }) => {
      return axios.post("/api/watchlist/add-watchlist", newWatchlist);
    },
    onSuccess: (res) => {
      setWatchlists(res.data.updatedWatchlists);
      setSelectedWatchlist(res.data.newWatchlist);
      toast({
        title: "Watchlist created",
        description: "Your watchlist has been created successfully.",
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

  const handleWatchlistCreation = async () => {
    try {
      if (session?.user?.id) {
        const newWatchlistData = {
          userId: session.user.id,
          watchlistName: watchlistDetails.name,
          description: watchlistDetails.description,
        };

        await mutateAsync(newWatchlistData);
      }
    } catch (error) {
      console.error("Error creating watchlist: ", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new watchlist</DialogTitle>
        </DialogHeader>
        <div className="my-2 flex flex-col gap-3">
          <Input
            placeholder="Watchlist description"
            value={watchlistDetails.name}
            onChange={(e) =>
              setWatchlistDetails((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            placeholder="Watchlist name"
            value={watchlistDetails.description}
            onChange={(e) =>
              setWatchlistDetails((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />

          <Button
            type="button"
            onClick={handleWatchlistCreation}
            disabled={
              isPending || !!(watchlistDetails.name.trim().length === 0)
            }
          >
            Create
          </Button>
        </div>

        <DialogFooter className="sm:justify-end">
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

export default CreateWatchlistDialog;