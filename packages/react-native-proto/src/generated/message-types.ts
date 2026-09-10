/**
 * Auto-generated TypeScript message types. Do not edit by hand.
 * Field names are camelCase (proto snake_case mapped). Prefer these
 * Request / Response types with createApi().
 * Also exports constructor helpers so editors suggest fields, matching dart_proto:
 *   getActiveProfile(GetActiveProfileRequest({ latLng: LatLng({ ... }) }))
 * Colliding simple names across packages are prefixed (e.g. DriverAdminV1…).
 */

// Well-known / external stubs referenced by vendored protos
export type LatLng = { latitude?: number; longitude?: number };
export type Timestamp = { seconds?: number; nanos?: number };
export type Duration = { seconds?: number; nanos?: number };
export type Empty = Record<string, never>;
export type FieldMask = { paths?: string[] };
export type Money = { currencyCode?: string; units?: number; nanos?: number };

/** Construct a LatLng (same pattern as dart_proto named constructors). */
export function LatLng(init: LatLng = {}): LatLng {
  return { ...init };
}

/** Construct a Timestamp (same pattern as dart_proto named constructors). */
export function Timestamp(init: Timestamp = {}): Timestamp {
  return { ...init };
}

/** Construct a Duration (same pattern as dart_proto named constructors). */
export function Duration(init: Duration = {}): Duration {
  return { ...init };
}

/** Construct a Empty (same pattern as dart_proto named constructors). */
export function Empty(init: Empty = {}): Empty {
  return { ...init };
}

/** Construct a FieldMask (same pattern as dart_proto named constructors). */
export function FieldMask(init: FieldMask = {}): FieldMask {
  return { ...init };
}

/** Construct a Money (same pattern as dart_proto named constructors). */
export function Money(init: Money = {}): Money {
  return { ...init };
}

export type AddUserRequest = {
  name?: string;
  email?: string;
  age?: number;
  phone?: string;
};

/** Construct a AddUserRequest (same pattern as dart_proto named constructors). */
export function AddUserRequest(init: AddUserRequest = {}): AddUserRequest {
  return { ...init };
}

export type DeleteUserRequest = {
  id?: string;
};

/** Construct a DeleteUserRequest (same pattern as dart_proto named constructors). */
export function DeleteUserRequest(init: DeleteUserRequest = {}): DeleteUserRequest {
  return { ...init };
}

export type DeleteUserResponse = {
  success?: boolean;
  id?: string;
};

/** Construct a DeleteUserResponse (same pattern as dart_proto named constructors). */
export function DeleteUserResponse(init: DeleteUserResponse = {}): DeleteUserResponse {
  return { ...init };
}

export type GetUserByEmailRequest = {
  email?: string;
};

/** Construct a GetUserByEmailRequest (same pattern as dart_proto named constructors). */
export function GetUserByEmailRequest(init: GetUserByEmailRequest = {}): GetUserByEmailRequest {
  return { ...init };
}

export type GetUserByPhoneRequest = {
  phone?: string;
};

/** Construct a GetUserByPhoneRequest (same pattern as dart_proto named constructors). */
export function GetUserByPhoneRequest(init: GetUserByPhoneRequest = {}): GetUserByPhoneRequest {
  return { ...init };
}

export type GetUserRequest = {
  id?: string;
};

/** Construct a GetUserRequest (same pattern as dart_proto named constructors). */
export function GetUserRequest(init: GetUserRequest = {}): GetUserRequest {
  return { ...init };
}

export type ListUsersRequest = {
  page?: number;
  pageSize?: number;
  pageToken?: string;
  query?: string;
};

/** Construct a ListUsersRequest (same pattern as dart_proto named constructors). */
export function ListUsersRequest(init: ListUsersRequest = {}): ListUsersRequest {
  return { ...init };
}

export type ListUsersResponse = {
  users?: User[];
  nextPageToken?: string;
  totalCount?: number;
};

/** Construct a ListUsersResponse (same pattern as dart_proto named constructors). */
export function ListUsersResponse(init: ListUsersResponse = {}): ListUsersResponse {
  return { ...init };
}

export type UpdateUserRequest = {
  id?: string;
  name?: string;
  email?: string;
  age?: number;
  phone?: string;
};

/** Construct a UpdateUserRequest (same pattern as dart_proto named constructors). */
export function UpdateUserRequest(init: UpdateUserRequest = {}): UpdateUserRequest {
  return { ...init };
}

export type User = {
  id?: string;
  name?: string;
  email?: string;
  age?: number;
  phone?: string;
  createdAt?: number;
  updatedAt?: number;
};

/** Construct a User (same pattern as dart_proto named constructors). */
export function User(init: User = {}): User {
  return { ...init };
}
