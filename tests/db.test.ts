import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

describe('การต่อ database ในเทส', () => {
  it('ต่อติดแล้ว', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});