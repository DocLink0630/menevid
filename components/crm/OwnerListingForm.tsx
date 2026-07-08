"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  PropertyType,
  ListingPurpose,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createOwnerListing,
  updateOwnerListing,
} from "@/lib/actions/crm";

const schema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  propertyName: z.string().optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  purpose: z.nativeEnum(ListingPurpose).optional(),
  bedrooms: z.coerce.number().optional(),
  squareFootage: z.coerce.number().optional(),
  unitNumber: z.string().optional(),
  askingPrice: z.coerce.number().optional(),
  monthlyRent: z.coerce.number().optional(),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type OwnerListingFormProps = {
  listingId?: string;
  defaultValues?: Partial<FormValues>;
};

export function OwnerListingForm({
  listingId,
  defaultValues,
}: OwnerListingFormProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      fullName: "",
      ...defaultValues,
    },
  });

  const watchPurpose = form.watch("purpose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    const result = listingId
      ? await updateOwnerListing(listingId, values)
      : await createOwnerListing(values);
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success(listingId ? "Listing updated" : "Listing created");
    if (listingId) {
      router.push(`/crm/owner-listings/${listingId}`);
    } else if ("data" in result && result.data) {
      router.push(`/crm/owner-listings/${(result.data as { id: string }).id}`);
    }
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <FormField control={form.control} name="fullName" render={({ field }) => (
          <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="propertyName" render={({ field }) => (
          <FormItem><FormLabel>Property Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="propertyType" render={({ field }) => (
            <FormItem><FormLabel>Type</FormLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>{Object.values(PropertyType).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="purpose" render={({ field }) => (
            <FormItem><FormLabel>Purpose</FormLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>{Object.values(ListingPurpose).map((p) => <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField control={form.control} name="bedrooms" render={({ field }) => (
            <FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="squareFootage" render={({ field }) => (
            <FormItem><FormLabel>Sqft</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="unitNumber" render={({ field }) => (
            <FormItem><FormLabel>Unit No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        {(watchPurpose === "SALE" || watchPurpose === "RENT_AND_SALE") ? (
          <FormField control={form.control} name="askingPrice" render={({ field }) => (
            <FormItem><FormLabel>Asking Price (LKR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        ) : null}
        {(watchPurpose === "RENT" || watchPurpose === "RENT_AND_SALE") ? (
          <FormField control={form.control} name="monthlyRent" render={({ field }) => (
            <FormItem><FormLabel>Monthly Rent (LKR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        ) : null}
        <FormField control={form.control} name="remarks" render={({ field }) => (
          <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
      </form>
    </Form>
  );
}