export type Permission =
  | "manageStaff"
  | "manageRoles"
  | "manageCatalog"
  | "voidInvoices"
  | "editResults"
  | "deleteRecords"
  | "viewAuditLog";

export const ALL_PERMISSIONS: Permission[] = [
  "manageStaff",
  "manageRoles",
  "manageCatalog",
  "voidInvoices",
  "editResults",
  "deleteRecords",
  "viewAuditLog",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  manageStaff: "Manage staff (add, suspend, reset password, remove)",
  manageRoles: "Manage roles",
  manageCatalog: "Manage test catalog",
  voidInvoices: "Void invoices",
  editResults: "Enter and edit lab results",
  deleteRecords: "Delete patients and tests",
  viewAuditLog: "View the organization's activity log",
};

export interface RolePermissions extends Record<Permission, boolean> {}

const EMPTY_PERMISSIONS: RolePermissions = {
  manageStaff: false,
  manageRoles: false,
  manageCatalog: false,
  voidInvoices: false,
  editResults: false,
  deleteRecords: false,
  viewAuditLog: false,
};

export const STANDARD_TIERS = [
  {
    weight: 100,
    name: "Super Admin",
    defaults: {
      manageStaff: true,
      manageRoles: true,
      manageCatalog: true,
      voidInvoices: true,
      editResults: true,
      deleteRecords: true,
      viewAuditLog: true,
    },
  },
  {
    weight: 200,
    name: "Admin",
    defaults: {
      manageStaff: true,
      manageRoles: true,
      manageCatalog: true,
      voidInvoices: true,
      editResults: true,
      deleteRecords: true,
      viewAuditLog: false,
    },
  },
  {
    weight: 300,
    name: "Lab Technician",
    defaults: {
      ...EMPTY_PERMISSIONS,
      editResults: true,
    },
  },
  {
    weight: 400,
    name: "Accountant",
    defaults: {
      ...EMPTY_PERMISSIONS,
      voidInvoices: true,
    },
  },
  {
    weight: 500,
    name: "Front Desk",
    defaults: { ...EMPTY_PERMISSIONS },
  },
] as const;

/**
 * A custom role always starts from one of the five standard tiers (its
 * `weight` identifies which) and can only ever *add* capabilities beyond
 * that tier's defaults, never take them away - so a permission checkbox
 * already granted by the base tier can't be unchecked in the UI, and the
 * question "why can this role do X?" always has a simple answer: either
 * it's the base tier's default, or someone explicitly checked it.
 */
export function tierDefaultsForWeight(weight: number): RolePermissions {
  const tier = [...STANDARD_TIERS].reverse().find((t) => weight >= t.weight);
  return { ...EMPTY_PERMISSIONS, ...(tier?.defaults ?? {}) };
}

export function getEffectivePermissions(role: {
  weight: number;
  permissionOverrides?: Partial<RolePermissions>;
}): RolePermissions {
  const defaults = tierDefaultsForWeight(role.weight);
  const overrides = role.permissionOverrides ?? {};
  const effective = { ...defaults };
  for (const permission of ALL_PERMISSIONS) {
    if (overrides[permission]) effective[permission] = true;
  }
  return effective;
}

export function hasPermission(
  role: { weight?: number; permissionOverrides?: Partial<RolePermissions> } | null | undefined,
  permission: Permission
): boolean {
  if (!role || typeof role.weight !== "number") return false;
  return getEffectivePermissions({ weight: role.weight, permissionOverrides: role.permissionOverrides })[
    permission
  ];
}
