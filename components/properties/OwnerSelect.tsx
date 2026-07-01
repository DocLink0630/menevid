"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { searchOwners, createOwner } from "@/lib/actions/owners";
import { toast } from "sonner";

export type OwnerEntry = {
  ownerId: string;
  fullName: string;
  isPrimary: boolean;
};

type OwnerSelectProps = {
  owners: OwnerEntry[];
  onChange: (owners: OwnerEntry[]) => void;
};

export function OwnerSelect({ owners, onChange }: OwnerSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: string; fullName: string }[]
  >([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleSearch(q: string) {
    setQuery(q);
    const result = await searchOwners(q);
    if (result.success) {
      setResults(result.data);
    }
  }

  function addOwner(id: string, fullName: string) {
    if (owners.some((o) => o.ownerId === id)) return;
    onChange([
      ...owners,
      { ownerId: id, fullName, isPrimary: owners.length === 0 },
    ]);
    setOpen(false);
  }

  async function handleCreate() {
    setCreating(true);
    const result = await createOwner({
      fullName: newName,
      phone: newPhone,
      email: newEmail,
    });
    if ("error" in result && result.error) {
      toast.error(result.error);
      setCreating(false);
      return;
    }
    if (result.success && result.data) {
      addOwner(result.data.id, result.data.fullName);
      toast.success("Owner created");
      setCreateOpen(false);
      setNewName("");
      setNewPhone("");
      setNewEmail("");
    }
    setCreating(false);
  }

  function removeOwner(ownerId: string) {
    const filtered = owners.filter((o) => o.ownerId !== ownerId);
    if (filtered.length > 0 && !filtered.some((o) => o.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    onChange(filtered);
  }

  function setPrimary(ownerId: string) {
    onChange(
      owners.map((o) => ({ ...o, isPrimary: o.ownerId === ownerId })),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-1 justify-between",
            )}
          >
            Add existing owner
            <ChevronsUpDown className="size-4 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search owners..."
                value={query}
                onValueChange={handleSearch}
              />
              <CommandList>
                <CommandEmpty>No owners found.</CommandEmpty>
                <CommandGroup>
                  {results.map((owner) => (
                    <CommandItem
                      key={owner.id}
                      onSelect={() => addOwner(owner.id, owner.fullName)}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          owners.some((o) => o.ownerId === owner.id)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {owner.fullName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="outline"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          New
        </Button>
      </div>

      {owners.length > 0 ? (
        <div className="space-y-2 rounded-lg border p-3">
          {owners.map((owner) => (
            <div
              key={owner.ownerId}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-sm">{owner.fullName}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={owner.isPrimary ? "default" : "outline"}
                  size="xs"
                  onClick={() => setPrimary(owner.ownerId)}
                >
                  {owner.isPrimary ? "Primary" : "Set Primary"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => removeOwner(owner.ownerId)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Owner</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating || !newName}
              className="w-full"
            >
              {creating ? "Creating..." : "Create Owner"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
