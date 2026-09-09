/**
 * Auto-generated typed API factory. Do not edit by hand.
 */
import { createClientFromMap } from '../client-factory';
import type { ProtoClientConfig } from '../types';
import { methodMap } from './method-map';
import { defaultCodecs } from './messages';
import type {
  AddUserRequest,
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserByEmailRequest,
  GetUserByPhoneRequest,
  GetUserRequest,
  ListUsersRequest,
  ListUsersResponse,
  UpdateUserRequest,
  User,
} from './message-types';

export type UserServiceApi = {
  addUser: (request?: AddUserRequest, options?: { signal?: AbortSignal }) => Promise<User>;
  getUser: (request?: GetUserRequest, options?: { signal?: AbortSignal }) => Promise<User>;
  getUserByEmail: (request?: GetUserByEmailRequest, options?: { signal?: AbortSignal }) => Promise<User>;
  listUsers: (request?: ListUsersRequest, options?: { signal?: AbortSignal }) => Promise<ListUsersResponse>;
  updateUser: (request?: UpdateUserRequest, options?: { signal?: AbortSignal }) => Promise<User>;
  deleteUser: (request?: DeleteUserRequest, options?: { signal?: AbortSignal }) => Promise<DeleteUserResponse>;
  getUserByPhone: (request?: GetUserByPhoneRequest, options?: { signal?: AbortSignal }) => Promise<User>;
};

export type GeneratedApi = {
  userService: UserServiceApi;
  readonly config: ProtoClientConfig;
};

export function createApi(config: ProtoClientConfig): GeneratedApi {
  return createClientFromMap(config, methodMap, defaultCodecs) as unknown as GeneratedApi;
}

export { methodMap, defaultCodecs };
