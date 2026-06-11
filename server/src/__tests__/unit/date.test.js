import { getLocalDateKey } from '../../utils/date.js';

describe('getLocalDateKey', () => {
  it('formats a date as YYYY-MM-DD', () => {
    const d = new Date(2024, 5, 9); // June 9, 2024 (local)
    expect(getLocalDateKey(d)).toBe('2024-06-09');
  });

  it('zero-pads month and day', () => {
    const d = new Date(2024, 0, 1); // Jan 1
    expect(getLocalDateKey(d)).toBe('2024-01-01');
  });

  it('handles end of year', () => {
    const d = new Date(2023, 11, 31); // Dec 31
    expect(getLocalDateKey(d)).toBe('2023-12-31');
  });
});
