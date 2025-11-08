/**
 * InmateInfo Component
 * Displays CDCR inmate information and parole hearing history
 *
 * Usage:
 *   <InmateInfo cdcrNumber="D54803" />
 */

import { useEffect, useState } from 'react';
import { InmateService } from '@/services/inmates';
import { Inmate, ParoleHearing } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InmateInfoProps {
  cdcrNumber: string | null;
}

export function InmateInfo({ cdcrNumber }: InmateInfoProps) {
  const [inmate, setInmate] = useState<Inmate | null>(null);
  const [hearings, setHearings] = useState<ParoleHearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInmateData() {
      if (!cdcrNumber) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [inmateData, hearingsData] = await Promise.all([
          InmateService.getInmateByCDCR(cdcrNumber),
          InmateService.getParoleHearings(cdcrNumber),
        ]);

        setInmate(inmateData);
        setHearings(hearingsData);
      } catch (err) {
        console.error('Error fetching inmate data:', err);
        setError('Failed to load inmate information');
      } finally {
        setLoading(false);
      }
    }

    fetchInmateData();
  }, [cdcrNumber]);

  if (!cdcrNumber) {
    return (
      <Alert>
        <AlertDescription>
          No CDCR number available for this transcript
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inmate Information</CardTitle>
          <CardDescription>CDCR Number: {cdcrNumber}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!inmate) {
    return (
      <Alert>
        <AlertDescription>
          No inmate data found for CDCR number {cdcrNumber}.
          Run the scraper to fetch this information.
        </AlertDescription>
      </Alert>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Inmate Information</CardTitle>
          <CardDescription>CDCR Number: {inmate.cdcr_number}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base font-semibold">{inmate.name || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p className="text-base font-semibold">{inmate.age || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Admission Date</p>
              <p className="text-base">{formatDate(inmate.admission_date)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Location</p>
              <p className="text-base">{inmate.current_location || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Commitment County</p>
              <p className="text-base">{inmate.commitment_county || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Parole Eligible Date</p>
              <p className="text-base font-semibold text-primary">
                {formatDate(inmate.parole_eligible_date)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Data last updated: {formatDate(inmate.last_scraped_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Parole Hearings */}
      {hearings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Board of Parole Hearings</CardTitle>
            <CardDescription>
              {hearings.length} hearing{hearings.length !== 1 ? 's' : ''} on record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hearings.map((hearing) => (
                  <TableRow key={hearing.id}>
                    <TableCell className="font-medium">
                      {formatDate(hearing.hearing_date)}
                    </TableCell>
                    <TableCell>{hearing.action || 'N/A'}</TableCell>
                    <TableCell>
                      {hearing.status && (
                        <Badge variant="secondary">{hearing.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{hearing.outcome || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
