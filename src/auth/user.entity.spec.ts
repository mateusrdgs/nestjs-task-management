import * as bcrypt from 'bcrypt';
import { mocked } from 'ts-jest/utils';

import { User } from './user.entity';

describe('UserEntity', () => {
  describe('validatePassword', () => {
    let user: User;
    const mockedBcrypt = mocked(bcrypt, true);

    beforeEach(() => {
      user = new User();
      user.password = 'testPassword';
      user.salt = 'testSalt';

      mockedBcrypt.hash = jest.fn();
    });

    it('returns true when password is valid', async () => {
      mockedBcrypt.hash.mockResolvedValue('testPassword');

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('123456');

      expect(mockedBcrypt.hash).toHaveBeenCalled();
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('123456', user.salt);
      expect(result).toBe(true);
    });

    it('returns false when password is invalid', async () => {
      mockedBcrypt.hash.mockResolvedValue('wrongPassword');

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('123456');

      expect(mockedBcrypt.hash).toHaveBeenCalled();
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('123456', user.salt);
      expect(result).toBe(false);
    });
  });
});
