import { zoo } from './zoo.js';

describe('zoo', () => {
  it('should work', () => {
    const result = zoo();
    expect(result).toMatch(/^\[ZOO\] (cow|dog|pig) says (moo|woof|oink)!$/);
  });
});
