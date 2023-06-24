import { Connection } from "mongoose";

import { VaultIndexSchema } from "../model/vault.model";

export const VaultIndexProvider = [
    {
        provide: 'VaultIndexProvider',
        useFactory: (connection: Connection) => connection.model('VaultsIndex', VaultIndexSchema),
        inject: ['StorageProvider'],
    },
    
];