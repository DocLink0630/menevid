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
  Form,
  FormControl,
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

const schema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  tenantName: z.string().min(1),
  tenantPhone: z.string().optional(),
  tenantEmail: z.string().optional(),
  tenantNic: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  rentAmount: z.coerce.number().positive(),
  depositAmount: z.coerce.number().optional(),
  paymentDueDay: z.coerce.number().int().min(1).max(28),
});

type FormValues = z.infer<typeof schema>;

type PropertyOption = { id: string; name: string; unitNumber: string | null };

type LeaseFormProps = {
  properties: PropertyOption[];
  leaseId?: string;
  defaultValues?: Partial<FormValues>;
};

export function LeaseForm({ properties, leaseId, defaultValues }: LeaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");

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
    const result = leaseId
      ? await updateLease(leaseId, values)
      : await createLease(values);
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success(leaseId ? "Lease updated" : "Lease created");
    if (leaseId) {
      router.push(`/leases/${leaseId}`);
    } else if ("data" in result && result.data) {
      router.push(`/leases/${(result.data as { id: string }).id}`);
    }
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <FormField control={form.control} name="propertyId" render={({ field }) => (
          <FormItem>
            <FormLabel>Property *</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                disabled={!!leaseId}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-between",
                )}
              >
                {selectedProperty || "Select property..."}
                <ChevronsUpDown className="size-4 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList>
                    <CommandEmpty>No properties available.</CommandEmpty>
                    <CommandGroup>
                      {properties.map((p) => (
                        <CommandItem key={p.id} onSelect={() => {
                          field.onChange(p.id);
                          setSelectedProperty(`${p.name}${p.unitNumber ? ` (${p.unitNumber})` : ""}`);
                          setOpen(false);
                        }}>
                          <Check className={cn("mr-2 size-4", field.value === p.id ? "opacity-100" : "opacity-0")} />
                          {p.name}{p.unitNumber ? ` (${p.unitNumber})` : ""}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="tenantName" render={({ field }) => (
          <FormItem><FormLabel>Tenant Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="tenantPhone" render={({ field }) => (
            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="tenantEmail" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="tenantNic" render={({ field }) => (
          <FormItem><FormLabel>NIC/Passport</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="startDate" render={({ field }) => (
            <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="endDate" render={({ field }) => (
            <FormItem><FormLabel>End Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="rentAmount" render={({ field }) => (
            <FormItem><FormLabel>Rent Amount (LKR) *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="depositAmount" render={({ field }) => (
            <FormItem><FormLabel>Deposit (LKR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="paymentDueDay" render={({ field }) => (
          <FormItem><FormLabel>Payment Due Day (1–28) *</FormLabel><FormControl><Input type="number" min={1} max={28} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : leaseId ? "Update Lease" : "Create Lease"}
        </Button>
      </form>
    </Form>
  );
}
