/** The error body the backend returns (RFC 9457 problem detail). */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  /** Validation errors, by field name. */
  errors?: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetail;

  constructor(status: number, problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  get fieldErrors(): Record<string, string> {
    return this.problem.errors ?? {};
  }

  /** Someone else changed the record since it was loaded (optimistic locking). */
  get isStaleVersion(): boolean {
    return this.status === 409 && /changed by someone else/i.test(this.message);
  }
}

interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/** Returns the response data, or throws an {@link ApiError} for any non-2xx response. */
export async function unwrap<T>(request: Promise<FetchResult<T>>): Promise<T> {
  const { data, error, response } = await request;
  if (!response.ok) {
    const problem = (typeof error === 'object' && error !== null ? error : {}) as ProblemDetail;
    throw new ApiError(response.status, problem);
  }
  return data as T;
}
