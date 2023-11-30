import { Connection } from "mongoose";

import { VaultIndexSchema } from "../schemas/vault.schemas";

export const VaultIndexProvider = [
    {
        provide: 'VAULT_MODEL',
        useFactory: (connection: Connection) => connection.model('VaultsIndex', VaultIndexSchema),
        inject: ['StorageProvider'],
    },
    
];