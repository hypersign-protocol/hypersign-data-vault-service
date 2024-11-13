import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { Scope, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VaultRepository } from '../../vault/repository/vault.repository';
import { Request } from 'express';
import { getHash } from 'src/utils';

const connections: Connection[] = mongoose.connections;
export const UserVaultProviders = [
  {
    provide: 'UserVaultDatabaseProvider',
    scope: Scope.REQUEST,
    useFactory: async (
      request: Request,
      config: ConfigService,
      vaultRepository: VaultRepository,
    ): Promise<Connection> => {
      Logger.log(
        'Db connection database provider',
        'tenant-mongoose-connections',
      );

      Logger.log(
        'Number of open connections: ' + connections.length,
        'tenant-mongoose-connections',
      );

      const params = request.params;
      if (!params.vaultId) {
        throw new Error('vaultId request params is null or empty');
      }

      const vault = await vaultRepository.getVault({
        id: params.vaultId,
      });

      if (vault == undefined || vault == null) {
        throw new HttpException(
          {
            message: `Vault with given id  ${params.vaultId} does not exists`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const tenantDB = getHash(params.vaultId + vault.invoker);
      Logger.log('VaultId ' + tenantDB, 'UserVaultProviders');

      // // Find existing connection
      const foundConn = connections.find((con: Connection) => {
        return con.name === tenantDB;
      });

      // Return the same connection if it exist
      if (foundConn && foundConn.readyState === 1) {
        Logger.log(
          'Found connection tenantDB = ' + tenantDB,
          'tenant-mongoose-connections',
        );
        return foundConn;
      } else {
        Logger.log(
          'No connection found for tenantDB = ' + tenantDB,
          'tenant-mongoose-connections',
        );
      }

      // TODO: take this from env using configService
      const BASE_DB_PATH = config.get('DB_URL');
      if (!BASE_DB_PATH) {
        throw new Error('No DB_URL set in env');
      }

      const uri = `${BASE_DB_PATH}/${tenantDB}${process.env.DB_CONFIG}`;
      Logger.debug('connecting ' + tenantDB, 'DB Provider');
      Logger.log(uri, 'tenant-mongoose-connections');
      Logger.log(
        'Before creating new db connection...',
        'tenant-mongoose-connections',
      );
      const newConnectionPerApp = await mongoose.createConnection(uri);

      newConnectionPerApp.on('disconnected', () => {
        Logger.log(
          'DB connection ' + newConnectionPerApp.name + ' is disconnected',
          'tenant-mongoose-connections',
        );
      });

      return newConnectionPerApp;
    },
    inject: [REQUEST, ConfigService, VaultRepository],
  },
];
