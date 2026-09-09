import type {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

type UnaryFn<TReq, TRes> = (request: TReq) => Promise<TRes>;

/**
 * Thin React Query wrapper around a generated unary client method.
 */
export function useProtoQuery<TReq extends object, TRes>(
  method: UnaryFn<TReq, TRes>,
  request: TReq,
  options?: Omit<
    UseQueryOptions<TRes, Error, TRes, QueryKey>,
    'queryKey' | 'queryFn'
  > & { queryKey?: QueryKey }
) {
  const queryKey = options?.queryKey ?? ['proto', method.name, request];
  return useQuery({
    ...options,
    queryKey,
    queryFn: () => method(request),
  });
}

/**
 * Thin React Query mutation wrapper around a generated unary client method.
 */
export function useProtoMutation<TReq extends object, TRes>(
  method: UnaryFn<TReq, TRes>,
  options?: UseMutationOptions<TRes, Error, TReq>
) {
  return useMutation({
    ...options,
    mutationFn: (request: TReq) => method(request),
  });
}
