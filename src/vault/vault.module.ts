import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { VaultController } from './controllers/vault.controller';
import { VaultService } from './services/vault.service';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { VaultRepository } from './repository/vault.repository';
import { VaultIndexProvider } from './providers/vault.provider';
import { StorageProvider } from './providers/storage.provider';


@Module({
    imports: [ConfigModule.forRoot({
        envFilePath: '',
        isGlobal: true,
        
      })],
    controllers: [VaultController],
    providers: [
        VaultService,
        VaultRepository,
        StorageProvider,
        ...VaultIndexProvider],
    exports: [StorageProvider,VaultRepository]

})

export class EdvInitModule implements NestModule{

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('vault');
    }

}
