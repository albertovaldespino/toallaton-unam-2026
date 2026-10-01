import type { Site } from "@/data/sedes";
export type Donation = {
  id: string;
  sequence: string;
  site_id: string;
  site_name: string;
  quantity: number;
  donor: string | null;
  notes: string | null;
  created_at: string;
};
export type Stats = {
  total: number;
  count: number;
  sites: (Site & { total: number; count: number })[];
  latest: Donation | null;
};
