import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserVaultService } from './services/user-vault.service';
import { UserVaultController } from './controllers/user-vault.controller';
import { UserVaultProviders } from './providers/databaseProviders';
import { DocumentProviders } from './providers/document.provider';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { DocumentRepository } from './repository/document.repository';
import { EdvInitModule } from 'src/vault/vault.module';

@Module({
  controllers: [UserVaultController],
  imports: [EdvInitModule],
  providers: [
    UserVaultService,
    DocumentRepository,
    ...UserVaultProviders,
    ...DocumentProviders
  ]
})

export class UserVaultModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(UserVaultController);
  }
}

