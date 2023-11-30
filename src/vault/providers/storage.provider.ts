import {  Logger } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';

export const StorageProvider = {
    provide: 'StorageProvider',
    useFactory: (): Promise<Connection>=>
        mongoose.createConnection(process.env.DB_URL + '/vault').asPromise()
        .then((connection)=>{
        
            Logger.log('Connection established', 'StorageProvider');
            return connection;
        })
        .catch((err)=>{
            Logger.error('Connection failed', 'StorageProvider');
            throw err;
        }
        )

           

}