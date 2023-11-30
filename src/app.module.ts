import { Module } from '@nestjs/common';
import { EdvInitModule } from './vault/vault.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './handlers/exception/AllExceptionFilter';
import { UserVaultModule } from './user-vault/user-vault.module';


@Module({
  imports: [ 
    EdvInitModule,
    ConfigModule.forRoot({
      envFilePath: '',
      isGlobal: true,
    }),
    UserVaultModule],
  providers: [{
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  }],
})
export class AppModule {

}
