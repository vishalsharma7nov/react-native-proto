/**
 * Auto-generated TypeScript message types. Do not edit by hand.
 * Parsed from .proto message field definitions (simple regex parser).
 */

export type AddUserRequest = {
  name?: string;
  email?: string;
  age?: number;
  phone?: string;
};

export type DeleteUserRequest = {
  id?: string;
};

export type DeleteUserResponse = {
  success?: boolean;
  id?: string;
};

export type GetUserByEmailRequest = {
  email?: string;
};

export type GetUserByPhoneRequest = {
  phone?: string;
};

export type GetUserRequest = {
  id?: string;
};

export type ListUsersRequest = {
  page?: number;
  page_size?: number;
  page_token?: string;
  query?: string;
};

export type ListUsersResponse = {
  users?: User[];
  next_page_token?: string;
  total_count?: number;
};

export type UpdateUserRequest = {
  id?: string;
  name?: string;
  email?: string;
  age?: number;
  phone?: string;
};

export type User = {
  id?: string;
  name?: string;
  email?: string;
  age?: number;
  phone?: string;
  created_at?: number;
  updated_at?: number;
};
