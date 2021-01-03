import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { mocked } from 'ts-jest/utils';

import { User } from './user.entity';
import { UserRepository } from './user.repository';

const mockCredentialsDto = {
  username: 'TestUsername',
  password: 'TestPassword',
};

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save: jest.Mock;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('successfully signs up the user', async () => {
      (save as jest.Mock).mockResolvedValue(undefined);

      await expect(
        userRepository.signUp(mockCredentialsDto),
      ).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '23505' });

      await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws an internal server error exception', async () => {
      save.mockRejectedValue({ code: '' });

      await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUserPassword', () => {
    const mockDto = {
      username: 'Test username',
      password: 'Test password',
    };

    let user: User;

    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'test username';
      user.validatePassword = jest.fn();
    });

    it('returns the username as validation is successful', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (user.validatePassword as jest.Mock).mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(mockDto);

      expect(result).toBe(user.username);
    });

    it('returns null when user cannot be found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.validateUserPassword(mockDto);

      expect(result).toBeNull();
    });

    it('returns null when password is invalid', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (user.validatePassword as jest.Mock).mockResolvedValue(false);

      const result = await userRepository.validateUserPassword(mockDto);

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      const mockedBcrypt = mocked(bcrypt, true);
      mockedBcrypt.hash = jest.fn().mockResolvedValue('testHash');

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();

      const result = await userRepository.hashPassword(
        'testPassword',
        'testSalt',
      );

      expect(mockedBcrypt.hash).toHaveBeenCalled();
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        'testPassword',
        'testSalt',
      );
      expect(result).toBe('testHash');
    });
  });
});
