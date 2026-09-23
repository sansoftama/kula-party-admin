import type {
  AdminHealth,
  AdminLeaderboardEntry,
  AdminLeaderboardsPage,
  AdminPayment,
  AdminPaymentsPage,
  AdminReport,
  AdminReportsPage,
  AdminUser,
  AdminUsersPage,
  LeaderboardBoard,
  PaymentStatus,
  ReportStatus,
} from "@/lib/admin-types";

const MOCK_USERS: AdminUser[] = [
  {
    id: "usr_01HZXK8A",
    username: "amara",
    displayName: "Amara K.",
    status: "active",
    createdAt: "2026-01-12T08:14:00.000Z",
  },
  {
    id: "usr_01HZY2M1",
    username: "leo.waves",
    displayName: "Leo",
    status: "active",
    createdAt: "2026-02-03T16:41:00.000Z",
  },
  {
    id: "usr_01J0AAN4",
    username: "nabila",
    displayName: "Nabila S.",
    status: "suspended",
    createdAt: "2026-03-18T11:02:00.000Z",
  },
  {
    id: "usr_01J0BBP8",
    username: "dj_kito",
    displayName: "Kito",
    status: "active",
    createdAt: "2026-04-02T21:19:00.000Z",
  },
  {
    id: "usr_01J1CCQ2",
    username: "mira.room",
    displayName: "Mira",
    status: "banned",
    createdAt: "2026-04-21T09:55:00.000Z",
  },
  {
    id: "usr_01J2DDR6",
    username: "sami",
    status: "active",
    createdAt: "2026-05-09T14:27:00.000Z",
  },
  {
    id: "usr_01J3EES0",
    username: "host.ada",
    displayName: "Ada N.",
    status: "active",
    createdAt: "2026-06-01T18:08:00.000Z",
  },
  {
    id: "usr_01J4FFT4",
    username: "ghostline",
    displayName: "Ghost",
    status: "suspended",
    createdAt: "2026-07-14T07:33:00.000Z",
  },
];

export function mockHealth(): AdminHealth {
  return {
    ok: true,
    service: "kula-party-backend",
    version: "0.0.0-mock",
    time: new Date().toISOString(),
    checks: {
      api: "up",
      database: "up",
    },
  };
}

const MOCK_REPORTS: AdminReport[] = [
  {
    id: "rpt_01K8OPEN01",
    reporterId: "usr_01HZXK8A",
    reporterUsername: "amara",
    targetType: "user",
    targetId: "usr_01J1CCQ2",
    targetLabel: "mira.room",
    reason:
      "Repeated insults in the Friday karaoke room after hosts asked them to stop. Transcript attached by the reporter runs for several minutes.",
    status: "open",
    createdAt: "2026-09-18T21:14:00.000Z",
  },
  {
    id: "rpt_01K8OPEN02",
    reporterId: "usr_01J0BBP8",
    reporterUsername: "dj_kito",
    targetType: "room",
    targetId: "room_karaoke_night",
    targetLabel: "Karaoke Night",
    reason:
      "Room title and chat are advertising off-platform paid follows. The pinned message has been up since the room opened.",
    status: "open",
    createdAt: "2026-09-17T18:02:00.000Z",
  },
  {
    id: "rpt_01K8RSLV01",
    reporterId: "usr_01HZY2M1",
    reporterUsername: "leo.waves",
    targetType: "user",
    targetId: "usr_01J4FFT4",
    targetLabel: "ghostline",
    reason: "Spam links dropped into three rooms in under a minute.",
    status: "resolved",
    createdAt: "2026-09-12T09:41:00.000Z",
  },
  {
    id: "rpt_01K8DSMS01",
    reporterId: "usr_01J3EES0",
    reporterUsername: "host.ada",
    targetType: "room",
    targetId: "room_late_lobby",
    targetLabel: "Late Lobby",
    reason: "Loud background audio made the room unusable. Hosts already muted the source.",
    status: "dismissed",
    createdAt: "2026-09-11T23:18:00.000Z",
  },
  {
    id: "rpt_01K8OPEN03",
    reporterId: "usr_01J0AAN4",
    reporterUsername: "nabila",
    targetType: "user",
    targetId: "usr_01J2DDR6",
    targetLabel: "sami",
    reason:
      "Private messages asking for account credentials after a room ended. Reporter blocked the account and saved two screenshots.",
    status: "open",
    createdAt: "2026-09-10T14:27:00.000Z",
  },
  {
    id: "rpt_01K8RSLV02",
    reporterId: "usr_01HZXK8A",
    reporterUsername: "amara",
    targetType: "room",
    targetId: "room_afrobeats",
    targetLabel: "Afrobeats Hour",
    reason: "Duplicate rooms were created to squat the same name. The extra room was closed.",
    status: "resolved",
    createdAt: "2026-09-08T16:05:00.000Z",
  },
  {
    id: "rpt_01K8OPEN04",
    reporterId: "usr_01J4FFT4",
    reporterUsername: "ghostline",
    targetType: "user",
    targetId: "usr_01J0BBP8",
    targetLabel: "dj_kito",
    reason: "Harassment during a guest takeover. The reporter says the host kept unmuting them to shout.",
    status: "open",
    createdAt: "2026-09-07T20:44:00.000Z",
  },
  {
    id: "rpt_01K8DSMS02",
    reporterId: "usr_01J2DDR6",
    targetType: "room",
    targetId: "room_study_hall",
    reason: "Reported as spam by mistake. The room is a quiet study session.",
    status: "dismissed",
    createdAt: "2026-09-06T11:12:00.000Z",
  },
  {
    id: "rpt_01K8OPEN05",
    reporterId: "usr_01HZY2M1",
    reporterUsername: "leo.waves",
    targetType: "room",
    targetId: "room_open_mic",
    targetLabel: "Open Mic",
    reason:
      "A listener shared another person's phone number in chat and refused to delete it when asked.",
    status: "open",
    createdAt: "2026-09-05T08:33:00.000Z",
  },
  {
    id: "rpt_01K8RSLV03",
    reporterId: "usr_01J0AAN4",
    reporterUsername: "nabila",
    targetType: "user",
    targetId: "usr_01J1CCQ2",
    targetLabel: "mira.room",
    reason: "Impersonating a staff account with a similar display name. The display name was reset.",
    status: "resolved",
    createdAt: "2026-09-02T19:55:00.000Z",
  },
  {
    id: "rpt_01K8OPEN06",
    reporterId: "usr_01J3EES0",
    reporterUsername: "host.ada",
    targetType: "user",
    targetId: "usr_01HZY2M1",
    targetLabel: "leo.waves",
    reason: "Inappropriate comments directed at another listener. Host removed the speaker and filed this report.",
    status: "open",
    createdAt: "2026-08-29T22:07:00.000Z",
  },
  {
    id: "rpt_01K8DSMS03",
    reporterId: "usr_01J0BBP8",
    reporterUsername: "dj_kito",
    targetType: "user",
    targetId: "usr_01HZXK8A",
    targetLabel: "amara",
    reason: "Disagreement about song order. No rule violation in the attached clip.",
    status: "dismissed",
    createdAt: "2026-08-26T15:21:00.000Z",
  },
  {
    id: "rpt_01K8OPEN07",
    reporterId: "usr_01J1CCQ2",
    reporterUsername: "mira.room",
    targetType: "room",
    targetId: "room_afterparty",
    targetLabel: "Afterparty",
    reason:
      "Room description links to a phishing page that copies the Kula login screen. Several listeners said they entered a password there.",
    status: "open",
    createdAt: "2026-08-22T17:48:00.000Z",
  },
  {
    id: "rpt_01K8RSLV04",
    reporterId: "usr_01J4FFT4",
    reporterUsername: "ghostline",
    targetType: "room",
    targetId: "room_city_pop",
    targetLabel: "City Pop",
    reason: "Copyrighted album was streamed in full. The room owner removed the track.",
    status: "resolved",
    createdAt: "2026-08-18T12:16:00.000Z",
  },
  {
    id: "rpt_01K8OPEN08",
    reporterId: "usr_01HZXK8A",
    reporterUsername: "amara",
    targetType: "user",
    targetId: "usr_01J0AAN4",
    targetLabel: "nabila",
    reason: "Threats in chat after a vote. The messages are still visible to the room.",
    status: "open",
    createdAt: "2026-08-14T10:03:00.000Z",
  },
  {
    id: "rpt_01K8DSMS04",
    reporterId: "usr_01HZY2M1",
    reporterUsername: "leo.waves",
    targetType: "room",
    targetId: "room_quiet_chill",
    targetLabel: "Quiet Chill",
    reason: "Reporter thought the room was abandoned. It was a scheduled listening session.",
    status: "dismissed",
    createdAt: "2026-08-09T06:40:00.000Z",
  },
  {
    id: "rpt_01K8RSLV05",
    reporterId: "usr_01J2DDR6",
    reporterUsername: "sami",
    targetType: "user",
    targetId: "usr_01J3EES0",
    targetLabel: "host.ada",
    reason: "Account was sharing a referral code in every message. The messages were removed.",
    status: "resolved",
    createdAt: "2026-08-04T13:29:00.000Z",
  },
  {
    id: "rpt_01K8OPEN09",
    reporterId: "usr_01J0BBP8",
    reporterUsername: "dj_kito",
    targetType: "room",
    targetId: "room_sunrise",
    targetLabel: "Sunrise Set",
    reason:
      "Hate speech in the room topic. The topic was changed once and then set back by a co-host.",
    status: "open",
    createdAt: "2026-07-30T04:11:00.000Z",
  },
  {
    id: "rpt_01K8OPEN10",
    reporterId: "usr_01J3EES0",
    reporterUsername: "host.ada",
    targetType: "user",
    targetId: "usr_01J4FFT4",
    targetLabel: "ghostline",
    reason: "New account flooding the lobby with the same sticker for an hour.",
    status: "open",
    createdAt: "2026-07-21T19:36:00.000Z",
  },
  {
    id: "rpt_01K8RSLV06",
    reporterId: "usr_01J0AAN4",
    reporterUsername: "nabila",
    targetType: "room",
    targetId: "room_welcome",
    targetLabel: "Welcome Desk",
    reason: "Bot accounts were joining and leaving to inflate the listener count. They were removed.",
    status: "resolved",
    createdAt: "2026-07-15T08:52:00.000Z",
  },
  {
    id: "rpt_01K8DSMS05",
    reporterId: "usr_01J1CCQ2",
    reporterUsername: "mira.room",
    targetType: "user",
    targetId: "usr_01J2DDR6",
    targetLabel: "sami",
    reason: "Reporter later said this was a joke between friends and asked to withdraw it.",
    status: "dismissed",
    createdAt: "2026-07-02T21:09:00.000Z",
  },
  {
    id: "rpt_01K8RSLV07",
    reporterId: "usr_01HZXK8A",
    reporterUsername: "amara",
    targetType: "room",
    targetId: "room_archive",
    reason: "Old room kept an outdated unsafe link in the description. The link was cleared.",
    status: "resolved",
    createdAt: "2026-06-20T15:47:00.000Z",
  },
];

export function mockUsers(limit: number, cursor?: string): AdminUsersPage {
  const start = cursor === undefined ? 0 : Number(cursor);
  if (!Number.isInteger(start) || start < 0 || start > MOCK_USERS.length) {
    return { items: [], nextCursor: null };
  }

  const items = MOCK_USERS.slice(start, start + limit);
  const nextIndex = start + limit;
  return {
    items,
    nextCursor: nextIndex < MOCK_USERS.length ? String(nextIndex) : null,
  };
}

const MOCK_PAYMENTS: AdminPayment[] = [
  {
    id: "pay_01K9PND01",
    userId: "usr_01HZXK8A",
    username: "amara",
    amount: 49000,
    currency: "IDR",
    status: "pending",
    provider: "play",
    providerPaymentId: "GPA.3341-2201-8810-00011",
    createdAt: "2026-09-21T09:12:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9SUC01",
    userId: "usr_01HZY2M1",
    username: "leo.waves",
    amount: 150000,
    currency: "IDR",
    status: "succeeded",
    provider: "stripe",
    providerPaymentId: "pi_3NxLeo150000",
    createdAt: "2026-09-20T16:41:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9FLD01",
    userId: "usr_01J0AAN4",
    username: "nabila",
    amount: 500000,
    currency: "IDR",
    status: "failed",
    provider: "play",
    providerPaymentId: "GPA.3341-2201-8810-00042",
    createdAt: "2026-09-19T11:05:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9RFD01",
    userId: "usr_01J2DDR6",
    username: "sami",
    amount: 49000,
    currency: "IDR",
    status: "refunded",
    provider: "play",
    providerPaymentId: "GPA.3341-2201-8810-00018",
    createdAt: "2026-09-18T08:22:00.000Z",
    refundedAt: "2026-09-19T14:03:00.000Z",
  },
  {
    id: "pay_01K9PND02",
    userId: "usr_01J0BBP8",
    username: "dj_kito",
    amount: 25000,
    currency: "IDR",
    status: "pending",
    provider: "manual",
    createdAt: "2026-09-17T21:18:00.000Z",
  },
  {
    id: "pay_01K9SUC02",
    userId: "usr_01J3EES0",
    username: "host.ada",
    amount: 499,
    currency: "USD",
    status: "succeeded",
    provider: "stripe",
    providerPaymentId: "pi_3NxAda0499",
    createdAt: "2026-09-16T18:44:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9FLD02",
    userId: "usr_01J1CCQ2",
    username: "mira.room",
    amount: 1599,
    currency: "USD",
    status: "failed",
    provider: "stripe",
    providerPaymentId: "pi_3NxMira1599",
    createdAt: "2026-09-15T07:31:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9RFD02",
    userId: "usr_01J4FFT4",
    username: "ghostline",
    amount: 1299,
    currency: "EUR",
    status: "refunded",
    provider: "stripe",
    providerPaymentId: "pi_3NxGhost1299",
    createdAt: "2026-09-14T12:09:00.000Z",
    refundedAt: "2026-09-15T09:40:00.000Z",
  },
  {
    id: "pay_01K9PND03",
    userId: "usr_01J2DDR6",
    amount: 75000,
    currency: "IDR",
    status: "pending",
    provider: "play",
    providerPaymentId: "GPA.3390-1102-4400-00007",
    createdAt: "2026-09-12T04:55:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9SUC03",
    userId: "usr_01HZXK8A",
    username: "amara",
    amount: 120000,
    currency: "IDR",
    status: "succeeded",
    provider: "play",
    providerPaymentId: "GPA.3341-2201-8810-00055",
    createdAt: "2026-09-10T19:27:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9FLD03",
    userId: "usr_01J0BBP8",
    username: "dj_kito",
    amount: 10000,
    currency: "IDR",
    status: "failed",
    provider: "manual",
    createdAt: "2026-09-08T15:16:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9RFD03",
    userId: "usr_01HZY2M1",
    username: "leo.waves",
    amount: 75000,
    currency: "IDR",
    status: "refunded",
    provider: "manual",
    providerPaymentId: "man_20260906_leo",
    createdAt: "2026-09-06T10:02:00.000Z",
    refundedAt: "2026-09-07T11:28:00.000Z",
  },
  {
    id: "pay_01K9PND04",
    userId: "usr_01J4FFT4",
    username: "ghostline",
    amount: 200000,
    currency: "IDR",
    status: "pending",
    provider: "stripe",
    providerPaymentId: "pi_3NxGhostPending",
    createdAt: "2026-09-04T22:47:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9SUC04",
    userId: "usr_01J0AAN4",
    username: "nabila",
    amount: 89000,
    currency: "IDR",
    status: "succeeded",
    createdAt: "2026-09-02T13:33:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9FLD04",
    userId: "usr_01J3EES0",
    username: "host.ada",
    amount: 45000,
    currency: "IDR",
    status: "failed",
    provider: "play",
    providerPaymentId: "GPA.3341-2201-8810-00090",
    createdAt: "2026-08-29T06:14:00.000Z",
    refundedAt: null,
  },
  {
    id: "pay_01K9RFD04",
    userId: "usr_01J1CCQ2",
    username: "mira.room",
    amount: 15000,
    currency: "IDR",
    status: "refunded",
    provider: "play",
    providerPaymentId: "GPA.3341-2201-8810-00073",
    createdAt: "2026-08-24T17:51:00.000Z",
    refundedAt: "2026-08-25T08:12:00.000Z",
  },
  {
    id: "pay_01K9SUC05",
    userId: "usr_01J4FFT4",
    username: "ghostline",
    amount: 35000,
    currency: "IDR",
    status: "succeeded",
    provider: "play",
    providerPaymentId: "GPA.3390-1102-4400-00021",
    createdAt: "2026-08-18T09:05:00.000Z",
    refundedAt: null,
  },
];

export function mockReports(
  limit: number,
  cursor?: string,
  status?: ReportStatus,
): AdminReportsPage {
  const source = status
    ? MOCK_REPORTS.filter((report) => report.status === status)
    : MOCK_REPORTS;
  const start = cursor === undefined ? 0 : Number(cursor);
  if (!Number.isInteger(start) || start < 0 || start > source.length) {
    return { items: [], nextCursor: null };
  }

  const items = source.slice(start, start + limit);
  const nextIndex = start + limit;
  return {
    items,
    nextCursor: nextIndex < source.length ? String(nextIndex) : null,
  };
}

export function mockPayments(
  limit: number,
  cursor?: string,
  status?: PaymentStatus,
): AdminPaymentsPage {
  const source = status
    ? MOCK_PAYMENTS.filter((payment) => payment.status === status)
    : MOCK_PAYMENTS;
  const start = cursor === undefined ? 0 : Number(cursor);
  if (!Number.isInteger(start) || start < 0 || start > source.length) {
    return { items: [], nextCursor: null };
  }

  const items = source.slice(start, start + limit);
  const nextIndex = start + limit;
  return {
    items,
    nextCursor: nextIndex < source.length ? String(nextIndex) : null,
  };
}

const MOCK_LEADERBOARDS: AdminLeaderboardEntry[] = [
  {
    id: "lb_daily_01",
    board: "daily",
    rank: 1,
    userId: "usr_01HZXK8A",
    username: "amara",
    score: 48200,
    updatedAt: "2026-09-23T18:41:00.000Z",
  },
  {
    id: "lb_daily_02",
    board: "daily",
    rank: 2,
    userId: "usr_01HZY2M1",
    username: "leo.waves",
    score: 45110,
    updatedAt: "2026-09-23T18:22:00.000Z",
  },
  {
    id: "lb_daily_03",
    board: "daily",
    rank: 3,
    userId: "usr_01J0AAN4",
    username: "nabila",
    score: 39840,
    updatedAt: "2026-09-23T17:05:00.000Z",
  },
  {
    id: "lb_daily_04",
    board: "daily",
    rank: 4,
    userId: "usr_01J0BBP8",
    username: "dj_kito",
    score: 30120,
    updatedAt: "2026-09-23T15:48:00.000Z",
  },
  {
    id: "lb_daily_05",
    board: "daily",
    rank: 5,
    userId: "usr_01J9NOUSER",
    score: 18840,
    updatedAt: "2026-09-23T11:02:00.000Z",
  },
  {
    id: "lb_weekly_01",
    board: "weekly",
    rank: 1,
    userId: "usr_01HZXK8A",
    username: "amara",
    score: 210400,
    updatedAt: "2026-09-23T18:41:00.000Z",
  },
  {
    id: "lb_weekly_02",
    board: "weekly",
    rank: 2,
    userId: "usr_01J3EES0",
    username: "host.ada",
    score: 188220,
    updatedAt: "2026-09-22T21:16:00.000Z",
  },
  {
    id: "lb_weekly_03",
    board: "weekly",
    rank: 3,
    userId: "usr_01J4FFT4",
    username: "ghostline",
    score: 162900,
    updatedAt: "2026-09-22T09:33:00.000Z",
  },
  {
    id: "lb_weekly_04",
    board: "weekly",
    rank: 4,
    userId: "usr_01J1CCQ2",
    username: "mira.room",
    score: 140110,
    updatedAt: "2026-09-21T19:08:00.000Z",
  },
  {
    id: "lb_all_01",
    board: "all_time",
    rank: 1,
    userId: "usr_01HZXK8A",
    username: "amara",
    score: 1204800,
    updatedAt: "2026-09-23T18:41:00.000Z",
  },
  {
    id: "lb_all_02",
    board: "all_time",
    rank: 2,
    userId: "usr_01HZY2M1",
    username: "leo.waves",
    score: 980220,
    updatedAt: "2026-09-20T14:12:00.000Z",
  },
  {
    id: "lb_all_03",
    board: "all_time",
    rank: 3,
    userId: "usr_01J0BBP8",
    username: "dj_kito",
    score: 844100,
    updatedAt: "2026-09-18T08:44:00.000Z",
  },
  {
    id: "lb_all_04",
    board: "all_time",
    rank: 4,
    userId: "usr_01J0AAN4",
    username: "nabila",
    score: 701550,
    updatedAt: "2026-09-12T16:27:00.000Z",
  },
  {
    id: "lb_all_05",
    board: "all_time",
    rank: 5,
    userId: "usr_01J2DDR6",
    username: "sami",
    score: 655040,
    updatedAt: "2026-09-04T11:19:00.000Z",
  },
];

export function mockLeaderboards(
  limit: number,
  cursor?: string,
  board?: LeaderboardBoard,
): AdminLeaderboardsPage {
  const source = board
    ? MOCK_LEADERBOARDS.filter((entry) => entry.board === board)
    : MOCK_LEADERBOARDS;
  const start = cursor === undefined ? 0 : Number(cursor);
  if (!Number.isInteger(start) || start < 0 || start > source.length) {
    return { items: [], nextCursor: null };
  }

  const items = source.slice(start, start + limit);
  const nextIndex = start + limit;
  return {
    items,
    nextCursor: nextIndex < source.length ? String(nextIndex) : null,
  };
}
