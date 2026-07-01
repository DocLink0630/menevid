"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { InquiryStatus } from "@prisma/client";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { createInquiry, updateInquiry } from "@/lib/actions/crm";
import { searchProperties } from "@/lib/actions/properties";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
  propertyId: z.string().optional(),
  remarks: z.string().optional(),
  status: z.nativeEnum(InquiryStatus).optional(),
});

type FormValues = z.infer<typeof schema>;

type InquiryFormProps = {
  inquiryId?: string;
  defaultValues?: Partial<FormValues>;
  defaultPropertyName?: string;
};

export function InquiryForm({
  inquiryId,
  defaultValues,
  defaultPropertyName,
}: InquiryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [propertyQuery, setPropertyQuery] = useState("");
  const [propertyResults, setPropertyResults] = useState<
    { id: string; name: string; unitNumber: string | null }[]
  >([]);
  const [selectedProperty, setSelectedProperty] = useState(
    defaultPropertyName ?? "",
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      status: "NEW",
      ...defaultValues,
    },
  });

  async function handlePropertySearch(q: string) {
    setPropertyQuery(q);
    if (q.length < 1) return;
    const results = await searchProperties(q);
    setPropertyResults(results);
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    const result = inquiryId
      ? await updateInquiry(inquiryId, values)
      : await createInquiry(values);
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success(inquiryId ? "Inquiry updated" : "Inquiry created");
    if (inquiryId) {
      router.push(`/crm/inquiries/${inquiryId}`);
    } else if ("data" in result && result.data) {
      router.push(`/crm/inquiries/${(result.data as { id: string }).id}`);
    }
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="propertyId" render={({ field }) => (
          <FormItem>
            <FormLabel>Linked Property</FormLabel>
            <Popover open={propertyOpen} onOpenChange={setPropertyOpen}>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-between",
                )}
              >
                {selectedProperty || "Select property..."}
                <ChevronsUpDown className="size-4 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search..." value={propertyQuery} onValueChange={handlePropertySearch} />
                  <CommandList>
                    <CommandEmpty>No properties found.</CommandEmpty>
                    <CommandGroup>
                      {propertyResults.map((p) => (
                        <CommandItem key={p.id} onSelect={() => {
                          field.onChange(p.id);
                          setSelectedProperty(`${p.name}${p.unitNumber ? ` (${p.unitNumber})` : ""}`);
                          setPropertyOpen(false);
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
        {inquiryId ? (
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>{Object.values(InquiryStatus).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
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
