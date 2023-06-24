import { Module } from '@nestjs/common';
import { StorageProvider } from './providers/storage.provider';
import { VaultIndexProvider } from './providers/vault.provider';

@Module({
 
  providers: [StorageProvider,...VaultIndexProvider],
  exports: [StorageProvider,...VaultIndexProvider]
})
export class StorageModule {}
