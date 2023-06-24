import { Module } from '@nestjs/common';
import { EdvInitModule } from './vault/vault.module';
import { VaultService } from './vault/services/vault.service';
import { VaultController } from './vault/controllers/vault.controller';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';
import { VaultIndexProvider } from './storage/providers/vault.provider';
import { vaultRepository } from './storage/repository/vault.repository';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './handlers/exception/AllExceptionFilter';
import { DocumentStorageProvider } from './storage/providers/documentStorage.provider';


@Module({
  imports: [ EdvInitModule,
    ConfigModule.forRoot({
      envFilePath: '',
      isGlobal: true,
    }),
    StorageModule],
  controllers: [VaultController,],
  providers: [VaultService,...VaultIndexProvider,vaultRepository,DocumentStorageProvider,{
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  }],
})
export class AppModule {

}
