import { Connection } from 'mongoose';

import { DoucmentSchema } from '../schemas/doucment.schema';

export const DocumentProviders = [
  {
    provide: 'DOCUMENT_MODEL',
    useFactory: (connection: Connection) => connection.model('Document', DoucmentSchema),
    inject: ['UserVaultDatabaseProvider'],
  },
];
