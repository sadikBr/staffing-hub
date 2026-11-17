import { describe, expect, it } from 'vitest';
import { ApiError, unwrap } from './errors';

const response = (status: number) => new Response(null, { status });

describe('unwrap', () => {
  it('returns the data of successful responses', async () => {
    await expect(unwrap(Promise.resolve({ data: { id: '1' }, response: response(200) }))).resolves.toEqual({ id: '1' });
  });

  it('throws an ApiError carrying the problem detail and field errors', async () => {
    const problem = { status: 400, detail: 'The request contains invalid fields.', errors: { label: 'must not be blank' } };
    const error = await unwrap(Promise.resolve({ error: problem, response: response(400) })).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).message).toBe('The request contains invalid fields.');
    expect((error as ApiError).fieldErrors).toEqual({ label: 'must not be blank' });
  });

  it('recognises stale-version conflicts', () => {
    const stale = new ApiError(409, { detail: 'The employee was changed by someone else since you loaded it (...)' });
    const duplicate = new ApiError(409, { detail: "A role with the label 'Dev' already exists" });
    expect(stale.isStaleVersion).toBe(true);
    expect(duplicate.isStaleVersion).toBe(false);
  });
});
