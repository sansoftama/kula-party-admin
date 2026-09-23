"use server";

import { patchAdminRoomFlag } from "@/lib/admin-api";
import type { AdminApiResult, AdminRoom, RoomFlag } from "@/lib/admin-types";

export async function updateRoomFlag(input: {
  id: string;
  flag: RoomFlag;
  enabled: boolean;
}): Promise<AdminApiResult<AdminRoom>> {
  return patchAdminRoomFlag(input);
}
