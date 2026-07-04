"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createLease, updateLease } from "@/lib/actions/leases";

const optionalNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
}, z.number().optional());

const requiredNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
}, z.number({ error: "Required" }).positive("Rent amount must be greater than 0"));

const paymentDueDayNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : Math.trunc(n);
}, z.number({ error: "Required" }).int().min(1).max(28));

const schema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  tenantName: z.string().min(1, "Tenant name is required"),
  tenantPhone: z.string().optional(),
  tenantEmail: z.string().optional(),
  tenantNic: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  rentAmount: requiredNumber,
  depositAmount: optionalNumber,
  paymentDueDay: paymentDueDayNumber,
});

type FormValues = z.infer<typeof schema>;

type PropertyOption = { id: string; name: string; unitNumber: string | null };

type LeaseFormProps = {
  properties: PropertyOption[];
  leaseId?: string;
  defaultValues?: Partial<FormValues>;
};

function propertyLabel(
  properties: PropertyOption[],
  propertyId: string | undefined,
) {
  if (!propertyId) return null;
  const p = properties.find((item) => item.id === propertyId);
  if (!p) return null;
  return `${p.name}${p.unitNumber ? ` (${p.unitNumber})` : ""}`;
}

export function LeaseForm({ properties, leaseId, defaultValues }: LeaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      paymentDueDay: 1,
      ...defaultValues,
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      const result = leaseId
        ? await updateLease(leaseId, values)
        : await createLease(values);
      if ("error" in result && result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(leaseId ? "Lease updated" : "Lease created");
      if (leaseId) {
        router.push(`/leases/${leaseId}`);
      } else if ("data" in result && result.data) {
        router.push(`/leases/${(result.data as { id: string }).id}`);
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onInvalid() {
    toast.error("Please fix the highlighted fields");
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{leaseId ? "Edit Lease" : "Lease Details"}</CardTitle>
        <CardDescription>
          {leaseId
            ? "Update tenant and lease terms"
            : "Select a property and enter tenant information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property *</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger
                      type="button"
                      disabled={!!leaseId}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full justify-between font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {propertyLabel(properties, field.value) ??
                        "Select property..."}
                      <ChevronsUpDown className="size-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search..." />
                        <CommandList>
                          <CommandEmpty>No properties available.</CommandEmpty>
                          <CommandGroup>
                            {properties.map((p) => (
                              <CommandItem
                                key={p.id}
                                value={p.id}
                                onSelect={() => {
                                  field.onChange(p.id);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    field.value === p.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {p.name}
                                {p.unitNumber ? ` (${p.unitNumber})` : ""}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tenantPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tenantEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="tenantNic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIC/Passport</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormDescription>
              Lease must be at least 6 months in duration.
            </FormDescription>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="rentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent Amount (LKR) *</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="depositAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit (LKR)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="paymentDueDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Due Day (1–28) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={28} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : leaseId ? "Update Lease" : "Create Lease"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
