import { Test, TestingModule } from '@nestjs/testing';
import { UserVaultController } from './user-vault.controller';
import { UserVaultService } from '../services/user-vault.service';

describe('UserVaultController', () => {
  let controller: UserVaultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserVaultController],
      providers: [UserVaultService],
    }).compile();

    controller = module.get<UserVaultController>(UserVaultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
