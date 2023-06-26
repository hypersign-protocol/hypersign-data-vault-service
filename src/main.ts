import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded } from 'express';
import { LogLevel, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { lightTheme, outline } from './theme';
async function bootstrap() {

  const log_levels: Array<LogLevel> = process.env.LOG_LEVEL ? process.env.LOG_LEVEL.split(',') as Array<LogLevel> : ['log'];

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    logger: log_levels,


  });

  app.useGlobalPipes(new ValidationPipe({
    validateCustomDecorators: true,
  }));

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
    swaggerOptions: {
      filter: true,
    },

    customSiteTitle: 'Encrypted Data Vault API',
    //  toggle button js
    customJsStr: `
const label = document.createElement('label');
label.className = 'switch';

const input = document.createElement('input');
input.id = 'toggle';
input.type = 'checkbox';
input.checked = true;

const span = document.createElement('span');
span.className = 'slider round';

label.appendChild(input);
label.appendChild(span);



const css=\`  
*{
  border: 0;
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;

}
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #3b4151;
}

input:focus + .slider {
  box-shadow: 0 0 1px #3b4151;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}


.switch {
  float: right;
  margin-right: 10px;
  top: 10px;
}
\`



document.head.insertAdjacentHTML('beforeend', \`<style>\${css}</style>\`)
window.addEventListener('load', function() {

  document.querySelector('.topbar').insertAdjacentElement('afterEnd', label);
  document.getElementById('toggle').addEventListener('change', function() {
    
    if (this.checked) {
    // override default css
      

      

      document.body.style.backgroundColor = '#fff';
      
      document.querySelector('.swagger-ui').style.backgroundColor = '#000';
      document.querySelector('.swagger-ui .info .title').style.color = '#8c8c8c';
      document.querySelector('.swagger-ui .info p').style.color = '#8c8c8c';
     
      document.querySelector('.swagger-ui').style.color = '#fff';
      document.querySelector('.swagger-ui').style.fill = '#fff';
      document.querySelector('.swagger-ui').style.stroke = '#fff';
      document.querySelector('.swagger-ui').style.border = '1px solid #fff';
      document.querySelector('.swagger-ui').style.boxShadow = '0 0 10px #fff';

      // change only color and bakcground color properties of css 
      document.querySelector('.opblock-tag').style.color = '#8c8c8c';


      const collection=document.getElementsByClassName('opblock-summary-path')
      
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.color = '#8c8c8c';
      }

      
     
     


      
    }else{
      document.body.style.backgroundColor = '#000';
      document.querySelector('.swagger-ui').style.backgroundColor = '#fff';
      document.querySelector('.swagger-ui .info .title').style.color = '#000';
      document.querySelector('.swagger-ui .info p').style.color = '#000';

      document.querySelector('.swagger-ui').style.color = '#000';
      document.querySelector('.swagger-ui').style.fill = '#000';
      document.querySelector('.swagger-ui').style.stroke = '#000';
      document.querySelector('.swagger-ui').style.border = '1px solid #000';
      document.querySelector('.swagger-ui').style.boxShadow = '0 0 10px #000';

      // change only color and bakcground color properties of css
      document.querySelector('.opblock-tag').style.color = '#000';

      const collection=document.getElementsByClassName('opblock-summary-path')

      for (let i = 0; i < collection.length; i++) {

        collection[i].style.color = '#000';

      }



    }
  })
})

`
    ,


  






  });
  await app.listen(process.env.PORT);
  Logger.log(`Server running on http://localhost:${process.env.PORT}`, 'VaultServerBootstrap');
}
bootstrap();
