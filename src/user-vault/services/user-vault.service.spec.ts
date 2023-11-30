import { Test, TestingModule } from '@nestjs/testing';
import { UserVaultService } from './user-vault.service';

describe('UserVaultService', () => {
  let service: UserVaultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserVaultService],
    }).compile();

    service = module.get<UserVaultService>(UserVaultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
