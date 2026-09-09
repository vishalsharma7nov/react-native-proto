/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import type { Type } from 'protobufjs';
import { createCodecRegistry } from '../codecs';
// Auto-generated wrapper. Do not edit by hand.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pb = require('./messages.pb.js');

function isType(value: unknown): value is Type {
  if (!value) return false;
  if (typeof value !== 'object' && typeof value !== 'function') return false;
  return typeof (value as Type).encode === 'function' && typeof (value as Type).decode === 'function';
}

function collectTypes(obj: any, prefix = '', acc: Record<string, Type> = {}) {
  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return acc;
  if (isType(obj) && prefix) acc[prefix] = obj;
  for (const key of Object.keys(obj)) {
    if (['encode','decode','create','fromObject','toObject','encodeDelimited','decodeDelimited','verify','getTypeUrl'].includes(key)) continue;
    const next = obj[key];
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (isType(next)) {
      acc[nextPrefix] = next;
      continue;
    }
    if (next && typeof next === 'object') collectTypes(next, nextPrefix, acc);
  }
  return acc;
}

export const messageTypes = collectTypes(pb);
export const defaultCodecs = createCodecRegistry(messageTypes);

export const demo = pb.demo;
export const AddUserRequest = pb?.demo?.AddUserRequest as Type;
export const DeleteUserRequest = pb?.demo?.DeleteUserRequest as Type;
export const DeleteUserResponse = pb?.demo?.DeleteUserResponse as Type;
export const GetUserByEmailRequest = pb?.demo?.GetUserByEmailRequest as Type;
export const GetUserByPhoneRequest = pb?.demo?.GetUserByPhoneRequest as Type;
export const GetUserRequest = pb?.demo?.GetUserRequest as Type;
export const ListUsersRequest = pb?.demo?.ListUsersRequest as Type;
export const ListUsersResponse = pb?.demo?.ListUsersResponse as Type;
export const UpdateUserRequest = pb?.demo?.UpdateUserRequest as Type;
export const User = pb?.demo?.User as Type;

export default pb;
