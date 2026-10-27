import { jest } from "@jest/globals";

const RealDate = globalThis.Date;
let clock = 0;

/** Freeze `Date`/`Date.now` at the given instant for the current test. */
export function installMockDate(iso: string): void {
  clock = new RealDate(iso).getTime();
  const DateMock = function (...args: unknown[]) {
    return args.length === 0 ? new RealDate(clock) : new RealDate(...(args as []));
  } as unknown as typeof RealDate;
  const dateSpy = jest
    .spyOn(globalThis, "Date")
    .mockImplementation(
      DateMock as unknown as (value: string | number | Date) => Date
    );
  Object.assign(dateSpy, {
    now: () => clock,
    parse: RealDate.parse,
    UTC: RealDate.UTC,
  });
}

/** Advance the mocked clock without changing the time of day. */
export function advanceMinutes(minutes: number): void {
  clock += minutes * 60 * 1000;
}
