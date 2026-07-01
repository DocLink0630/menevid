"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PropertyStatusBadge } from "@/components/properties/PropertyStatusBadge";
import { StatusChangeDialog } from "@/components/properties/StatusChangeDialog";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { PropertyStatus } from "@prisma/client";

type PropertyDetailProps = {
  property: {
    id: string;
    name: string;
    unitNumber: string | null;
    type: string;
    purpose: string;
    squareFootage: number | null;
    bedrooms: number | null;
    furnishing: string | null;
    monthlyRent: number | null;
    salePrice: number | null;
    status: PropertyStatus;
    temporaryUnavailableUntil: Date | null;
    availableFrom: Date | null;
    notes: string | null;
    owners: {
      ownerId: string;
      fullName: string;
      phone: string | null;
      email: string | null;
      isPrimary: boolean;
    }[];
    statusLogs: {
      id: string;
      status: PropertyStatus;
      note: string | null;
      changedAt: Date;
    }[];
    leases: {
      id: string;
      tenantName: string;
      startDate: Date;
      endDate: Date;
      rentAmount: number;
      status: string;
    }[];
    inquiries: {
      id: string;
      name: string;
      status: string;
      createdAt: Date;
    }[];
    reminders: {
      id: string;
      title: string;
      message: string;
      dueDate: Date;
      status: string;
    }[];
  };
};

export function PropertyDetailView({ property }: PropertyDetailProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const activeLease = property.leases.find((l) => l.status === "ACTIVE");
  const pastLeases = property.leases.filter((l) => l.status !== "ACTIVE");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <ButtonLink href={`/properties/${property.id}/edit`}>Edit</ButtonLink>
        <Button variant="outline" onClick={() => setStatusOpen(true)}>
          Change Status
        </Button>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="history">Status History</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {property.name}
                <PropertyStatusBadge status={property.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Unit:</span> {property.unitNumber ?? "—"}</div>
              <div><span className="text-muted-foreground">Type:</span> {property.type}</div>
              <div><span className="text-muted-foreground">Purpose:</span> {property.purpose.replace(/_/g, " ")}</div>
              <div><span className="text-muted-foreground">Bedrooms:</span> {property.bedrooms ?? "—"}</div>
              <div><span className="text-muted-foreground">Sqft:</span> {property.squareFootage ?? "—"}</div>
              <div><span className="text-muted-foreground">Furnishing:</span> {property.furnishing?.replace(/_/g, " ") ?? "—"}</div>
              <div><span className="text-muted-foreground">Monthly Rent:</span> {formatCurrency(property.monthlyRent)}</div>
              <div><span className="text-muted-foreground">Sale Price:</span> {formatCurrency(property.salePrice)}</div>
              <div><span className="text-muted-foreground">Available From:</span> {formatDate(property.availableFrom)}</div>
              {property.notes ? (
                <div className="sm:col-span-2"><span className="text-muted-foreground">Notes:</span> {property.notes}</div>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Owners</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {property.owners.map((o) => (
                  <li key={o.ownerId} className="text-sm">
                    {o.fullName} {o.isPrimary ? "(Primary)" : ""}
                    {o.phone ? ` · ${o.phone}` : ""}
                    {o.email ? ` · ${o.email}` : ""}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.statusLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell><PropertyStatusBadge status={log.status} /></TableCell>
                      <TableCell>{log.note ?? "—"}</TableCell>
                      <TableCell>{formatDate(log.changedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leases" className="space-y-4">
          {activeLease ? (
            <Card>
              <CardHeader><CardTitle>Active Lease</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Tenant: {activeLease.tenantName}</p>
                <p>Period: {formatDate(activeLease.startDate)} – {formatDate(activeLease.endDate)}</p>
                <p>Rent: {formatCurrency(activeLease.rentAmount)}</p>
                <ButtonLink size="sm" className="mt-2" href={`/leases/${activeLease.id}`}>
                  View Lease
                </ButtonLink>
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">No active lease</p>
          )}
          {pastLeases.length > 0 ? (
            <Card>
              <CardHeader><CardTitle>Lease History</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastLeases.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.tenantName}</TableCell>
                        <TableCell>{formatDate(l.startDate)} – {formatDate(l.endDate)}</TableCell>
                        <TableCell>{l.status}</TableCell>
                        <TableCell>
                          <ButtonLink variant="ghost" size="xs" href={`/leases/${l.id}`}>
                            View
                          </ButtonLink>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="reminders">
          <Card>
            <CardContent className="pt-6">
              {property.reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active reminders</p>
              ) : (
                <ul className="space-y-3">
                  {property.reminders.map((r) => (
                    <li key={r.id} className="text-sm border-b pb-2">
                      <p className="font-medium">{r.title}</p>
                      <p className="text-muted-foreground">{r.message}</p>
                      <p className="text-xs text-muted-foreground">Due {formatDate(r.dueDate)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card>
            <CardContent className="pt-6">
              {property.inquiries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inquiries</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {property.inquiries.map((inq) => (
                      <TableRow key={inq.id}>
                        <TableCell>{inq.name}</TableCell>
                        <TableCell>{inq.status}</TableCell>
                        <TableCell>{formatDate(inq.createdAt)}</TableCell>
                        <TableCell>
                          <ButtonLink variant="ghost" size="xs" href={`/crm/inquiries/${inq.id}`}>
                            View
                          </ButtonLink>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StatusChangeDialog
        propertyId={property.id}
        currentStatus={property.status}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </div>
  );
}
