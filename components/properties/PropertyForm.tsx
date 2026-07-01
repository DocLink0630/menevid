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
  PropertyStatus,
  FurnishingStatus,
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
  OwnerSelect,
  type OwnerEntry,
} from "@/components/properties/OwnerSelect";
import { createProperty,
  updateProperty,
  type PropertyFormData,
} from "@/lib/actions/properties";

const optionalNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
}, z.number().optional());

const formSchema = z
  .object({
    name: z.string().min(1, "Property name is required"),
    unitNumber: z.string().optional(),
    type: z.nativeEnum(PropertyType),
    purpose: z.nativeEnum(ListingPurpose),
    squareFootage: optionalNumber,
    bedrooms: z.preprocess((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const n = Number(val);
      return Number.isNaN(n) ? undefined : Math.trunc(n);
    }, z.number().int().optional()),
    furnishing: z.nativeEnum(FurnishingStatus).optional(),
    monthlyRent: optionalNumber,
    salePrice: optionalNumber,
    status: z.nativeEnum(PropertyStatus),
    temporaryUnavailableUntil: z.string().optional(),
    availableFrom: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.purpose === "RENT" || data.purpose === "RENT_AND_SALE") &&
      !data.monthlyRent
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Monthly rent is required",
        path: ["monthlyRent"],
      });
    }
    if (
      (data.purpose === "SALE" || data.purpose === "RENT_AND_SALE") &&
      !data.salePrice
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Sale price is required",
        path: ["salePrice"],
      });
    }
    if (
      data.status === "TEMPORARILY_UNAVAILABLE" &&
      !data.temporaryUnavailableUntil
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Unavailable until date is required",
        path: ["temporaryUnavailableUntil"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

type PropertyFormProps = {
  propertyId?: string;
  defaultValues?: Partial<FormValues>;
  defaultOwners?: OwnerEntry[];
  fromListingId?: string;
};

function toDateInput(date?: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function PropertyForm({
  propertyId,
  defaultValues,
  defaultOwners = [],
  fromListingId,
}: PropertyFormProps) {
  const router = useRouter();
  const [owners, setOwners] = useState<OwnerEntry[]>(defaultOwners);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      unitNumber: "",
      type: "APARTMENT",
      purpose: "RENT",
      status: "AVAILABLE",
      ...defaultValues,
      temporaryUnavailableUntil: toDateInput(
        defaultValues?.temporaryUnavailableUntil,
      ),
      availableFrom: toDateInput(defaultValues?.availableFrom),
    },
  });

  const watchType = form.watch("type");
  const watchPurpose = form.watch("purpose");
  const watchStatus = form.watch("status");
  const showBedrooms = watchType !== "LAND";
  const showFurnishing =
    watchType !== "LAND" && watchType !== "COMMERCIAL";
  const showRent =
    watchPurpose === "RENT" || watchPurpose === "RENT_AND_SALE";
  const showSale =
    watchPurpose === "SALE" || watchPurpose === "RENT_AND_SALE";

  async function onSubmit(values: FormValues) {
    if (owners.length === 0) {
      const message = "At least one owner is required";
      setError(message);
      toast.error(message);
      return;
    }
    setLoading(true);
    setError(null);

    const payload: PropertyFormData = {
      ...values,
      owners: owners.map((o) => ({
        ownerId: o.ownerId,
        isPrimary: o.isPrimary,
      })),
      fromListingId,
    };

    const result = propertyId
      ? await updateProperty(propertyId, payload)
      : await createProperty(payload);

    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    toast.success(propertyId ? "Property updated" : "Property created");
    if (propertyId) {
      router.push(`/properties/${propertyId}`);
    } else if ("data" in result && result.data) {
      router.push(`/properties/${(result.data as { id: string }).id}`);
    }
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Number</FormLabel>
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PropertyType).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ListingPurpose).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="squareFootage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Square Footage</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showBedrooms ? (
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        {showFurnishing ? (
          <FormField
            control={form.control}
            name="furnishing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Furnishing Status</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(FurnishingStatus).map((f) => (
                      <SelectItem key={f} value={f}>
                        {f.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        {showRent ? (
          <FormField
            control={form.control}
            name="monthlyRent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rent (LKR)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        {showSale ? (
          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price (LKR)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PropertyStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchStatus === "TEMPORARILY_UNAVAILABLE" ? (
          <FormField
            control={form.control}
            name="temporaryUnavailableUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temporarily Unavailable Until</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <FormField
          control={form.control}
          name="availableFrom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available From</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <FormLabel>Owners *</FormLabel>
          <OwnerSelect owners={owners} onChange={setOwners} />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : propertyId ? "Update Property" : "Create Property"}
        </Button>
      </form>
    </Form>
  );
}
