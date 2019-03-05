import { LimitCharacterPipe } from './limit-character.pipe';

describe('LimitCharacterPipe', () => {
  it('create an instance', () => {
    const pipe = new LimitCharacterPipe();
    expect(pipe).toBeTruthy();
  });
});
