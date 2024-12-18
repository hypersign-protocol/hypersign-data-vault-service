import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { Scope, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VaultRepository } from '../../vault/repository/vault.repository';
import { Request } from 'express';
import { getHash } from 'src/utils';
import * as NodeCache from 'node-cache';
const connectionPromises: Record<string, Promise<Connection>> = {};

async function tenantConnection(tenantDB, uri) {
  Logger.log(
    `No active connection found for tenantDB = ${tenantDB}. Establishing a new one.`,
    'tenant-mongoose-connections',
  );
  // // Find existing connection
  const foundConn = mongoose.connections.find((con: Connection) => {
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

  if (!foundConn) {
    if (!connectionPromises[tenantDB]) {
      connectionPromises[tenantDB] = mongoose
        .createConnection(uri, {
          maxConnecting: 10,
          maxPoolSize: 100,
          maxStalenessSeconds: 100,
          maxIdleTimeMS: 500000,
          serverSelectionTimeoutMS: 500000,
          socketTimeoutMS: 500000,
          connectTimeoutMS: 500000,
        })
        .asPromise();
    }

    const newConnection = await connectionPromises[tenantDB];
    delete connectionPromises[tenantDB]; // Remove the promise after resolution

    newConnection.on('disconnected', () => {
      Logger.log(
        'DB connection ' + newConnection.name + ' is disconnected',
        'tenant-mongoose-connections',
      );
    });

    newConnection.on('error', (err: Error) => {
      Logger.error(
        `Error in connection for tenantDB = ${tenantDB}: ${err.message}`,
        'tenant-mongoose-connections',
      );
    });
    return newConnection;
  }
}

const nodeCache = new NodeCache();
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
        'Number of open connections: ' + mongoose.connections.length,
        'tenant-mongoose-connections',
      );

      const params = request.params;
      if (!params.vaultId) {
        throw new Error('vaultId request params is null or empty');
      }
      let vault;
      if (nodeCache.has(params.vaultId)) {
        vault = nodeCache.get(params.vaultId);
      } else {
        vault = await vaultRepository.getVault({
          id: params.vaultId,
        });

        nodeCache.set(params.vaultId, vault);
      }
      if (vault == undefined || vault == null) {
        throw new HttpException(
          {
            message: `Vault with given id  ${params.vaultId} does not exists`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      let tenantDB;
      if (nodeCache.has(params.vaultId + vault.invoker)) {
        tenantDB = nodeCache.get(params.vaultId + vault.invoker);
      } else {
        tenantDB = getHash(params.vaultId + vault.invoker);
        nodeCache.set(params.vaultId + vault.invoker, tenantDB);
      }
      Logger.log('VaultId ' + tenantDB, 'UserVaultProviders');

      // // Find existing connection

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
      const newConnectionPerApp = await tenantConnection(tenantDB, uri);

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
