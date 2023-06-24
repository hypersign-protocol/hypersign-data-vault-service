import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { VaultController } from './controllers/vault.controller';
import { VaultService } from './services/vault.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';
import { vaultRepository } from 'src/storage/repository/vault.repository';
import { VaultIndexProvider } from 'src/storage/providers/vault.provider';
import { DocumentStorageProvider } from 'src/storage/providers/documentStorage.provider';

@Module({
    imports: [ConfigModule.forRoot({
        envFilePath: '',
        isGlobal: true,
        
      }),StorageModule],
    controllers: [VaultController],
    providers: [VaultService,...VaultIndexProvider,vaultRepository,DocumentStorageProvider],
    exports: []

})

export class EdvInitModule implements NestModule{

    configure(consumer: MiddlewareConsumer) {
         consumer.apply(AuthMiddleware).forRoutes('edv');
    }

}
