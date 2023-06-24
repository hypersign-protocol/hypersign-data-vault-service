import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded } from 'express';
import { LogLevel, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { lightTheme, outline } from './theme';
async function bootstrap() {

  const log_levels:Array<LogLevel>= process.env.LOG_LEVEL?  process.env.LOG_LEVEL.split(',') as Array<LogLevel>:['log'];  
  
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    logger: log_levels,
    
  });


  const config = new DocumentBuilder()
    .setTitle('Encrypted Data Vault API')
    .setDescription('Open API documentation for Encrypted Data Vault')
    .setVersion('v0.1')
    .build();
  app.setGlobalPrefix('api/v1');
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Encrypted Data Vault API',
    customCss: lightTheme,
    
    swaggerOptions: {
      filter: true,
      
    }
    





  });
  await app.listen(process.env.PORT);
  Logger.log(`Server running on http://localhost:${process.env.PORT}`, 'VaultServerBootstrap');
}
bootstrap();
