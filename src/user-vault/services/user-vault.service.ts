import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Response,
} from '@nestjs/common';
import { VaultRepository } from '../../vault/repository/vault.repository';
import { generateDocId, getHash } from 'src/utils';
import {
  DocumentQueryDTO,
  DocumentResponseDTO,
  UpdateDoumentDTO,
} from '../dto/document.dto';
import { DocumentRepository } from '../repository/document.repository';

@Injectable()
export class UserVaultService {
  constructor(
    private readonly vaultRepository: VaultRepository,
    private readonly documentRepository: DocumentRepository,
  ) {}
  async queryDocuments(
    id: any,
    _body: DocumentQueryDTO,
  ): Promise<Array<DocumentResponseDTO>> {
    // const vault = await this.vaultRepository.getVault({
    //     id,
    // });

    // if (vault == undefined || vault == null) {
    //     throw new HttpException({
    //         message: "Vault with given id does not exists",
    //     }, HttpStatus.NOT_FOUND)
    // }

    // const documentVaultId = getHash(id + vault.invoker);
    let query;
    let flag = false;
    if (_body.equals.length > 0) {
      flag = true;
      query = {
        equals: _body.equals,
      };
    }

    if (_body.has.length > 0) {
      flag = false;
      query = {
        has: _body.has,
      };
    }

    // await this.documentRepository.connectDB(documentVaultId);

    const documents = flag
      ? await (async () => {
          const equalsDbQuery = [];

          query.equals?.forEach((e) => {
            equalsDbQuery.push({
              'indexed.attributes.name': Object.keys(e)[0],
              'indexed.attributes.value': Object.values(e)[0],
            });
          });

          return await this.documentRepository.queryDocuments({
            $and: equalsDbQuery,
          });
        })()
      : await (async () => {
          const hasDbQuery = [];

          query.has?.forEach((e) => {
            hasDbQuery.push({
              'indexed.attributes.name': e,
            });
          });

          return await this.documentRepository.queryDocuments({
            $and: hasDbQuery,
          });
        })();

    return documents as unknown as Array<DocumentResponseDTO>;
  }
  async getAllDocuments(
    id: string,
    page,
    limit,
  ): Promise<Array<DocumentResponseDTO>> {
    // const vault = await this.vaultRepository.getVault({
    //     id,
    // });

    // if (vault == undefined || vault == null) {
    //     throw new HttpException({
    //         message: "Vault with given id does not exists",
    //     }, HttpStatus.NOT_FOUND)
    // }

    // const documentVaultId = getHash(id + vault.invoker);
    // await this.documentRepository.connectDB(documentVaultId);
    const documents = await this.documentRepository.getAllDocuments({
      skip: (page - 1) * limit,
      limit,
    });

    // await this.documentRepository.disconnectDB();
    return documents as any as Array<DocumentResponseDTO>;
  }
  async createDocument({
    id,
    document,
    invoker,
  }): Promise<DocumentResponseDTO> {
    const vault = await this.vaultRepository.getVault({
      id,
      invoker,
    });

    if (vault == undefined || vault == null) {
      throw new HttpException(
        {
          message: `Vault with given id : ${id} with invocationCapability : ${invoker} does not exists`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (document.id == undefined) {
      document.id = generateDocId(JSON.stringify(document));
    }

    // await this.documentRepository.connectDB(docVaultId);
    const doc = await this.documentRepository.createDocument(document);
    // await this.documentRepository.disconnectDB();

    // generate random document id
    return { message: 'document created', document: doc };
  }
  async getDocument({ id, documentId, invoker }) {
    // fetch vault
    const vault = await this.vaultRepository.getVault({
      id,
    });
    if (!vault) {
      throw new HttpException(
        {
          message: 'Vault with given id does not exists',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    // const docVaultId = getHash(id + vault.invoker);
    // await this.documentRepository.connectDB(docVaultId);
    if (invoker !== vault.invoker) {
      Logger.debug(
        `Invoker : ${invoker} is not authorized to access document : ${documentId} `,
        'VaultService - GetDocument',
      );
      let document;
      if (!invoker.includes('eip')) {
        document = await this.documentRepository.getDocument({
          id: documentId,
          'jwe.recipients.header.kid': vault.keyAgreementKey.id,
        });
      } else {
        Logger.debug(
          `KeyType : ${vault.keyAgreementKey.type} `,
          `VaultService - GetDocument`,
        );
        document = await this.documentRepository.getDocument({
          id: documentId,
          'encryptedData.recipients.keyId': vault.keyAgreementKey.id,
        });
      }
      // await this.documentRepository.disconnectDB();
      return {
        message: 'document fetched',
        document: document,
        capability: 'Read',
      };
    } else {
      const document = await this.documentRepository.getDocument({
        id: documentId,
      });
      if (!document) {
        throw new HttpException(
          {
            message: 'Document with given id does not exists',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      // await this.documentRepository.disconnectDB();
      return { message: 'document fetched', document: document };
    }
  }
  async updateDocument({
    id,
    document,
  }: {
    id: string;
    document: UpdateDoumentDTO;
  }): Promise<DocumentResponseDTO> {
    // if (document.id == undefined || document.id == null) {
    //     throw new HttpException({
    //         message: "Document id is required",
    //     }, HttpStatus.BAD_REQUEST)
    // }

    // generate document vault id
    // const docVaultId = getHash(id + vault.invoker);

    // connect to document vault
    // await this.documentRepository.connectDB(docVaultId);

    // fetch document

    const doc = await this.documentRepository.getDocument({
      id: document.id,
    });

    if (!doc) {
      throw new HttpException(
        {
          message: 'Document with given id does not exists',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // update document

    const updatedDoc = await this.documentRepository.updateDocument(
      { id: document.id },
      document,
    );

    // await this.documentRepository.disconnectDB();

    return {
      message: 'document updated',
      document: updatedDoc as unknown as UpdateDoumentDTO,
    };
  }

  async deleteDocument({ id, documentId, invoker }) {
    // fetch vault
    const vault = await this.vaultRepository.getVault({
      id,
    });
    if (!vault) {
      throw new HttpException(
        {
          message: 'Vault with given id does not exists',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    // const docVaultId = getHash(id + vault.invoker);
    // await this.documentRepository.connectDB(docVaultId);
    if (invoker !== vault.invoker) {
      Logger.debug(
        `Invoker : ${invoker} is not authorized to access document : ${documentId} `,
        'VaultService - GetDocument',
      );
      let document;
      if (!invoker.includes('eip')) {
        document = await this.documentRepository.getDocument({
          id: documentId,
          'jwe.recipients.header.kid': vault.keyAgreementKey.id,
        });
      } else {
        Logger.debug(
          `KeyType : ${vault.keyAgreementKey.type} `,
          `VaultService - GetDocument`,
        );
        document = await this.documentRepository.getDocument({
          id: documentId,
          'encryptedData.recipients.keyId': vault.keyAgreementKey.id,
        });
      }
      // await this.documentRepository.disconnectDB();
      return {
        message: 'document fetched',
        document: document,
        capability: 'Read',
      };
    } else {
      const document = await this.documentRepository.getDocument({
        id: documentId,
      });
      if (!document) {
        throw new HttpException(
          {
            message: 'Document with given id does not exists',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const result = await this.documentRepository.deleteDocument({
        id: documentId,
      });
      console.log(result);

      return { message: 'document deleted', result: result };
    }
  }

  async deleteVault({ id, invoker }) {
    const vault = await this.vaultRepository.getVault({
      id,
      invoker,
    });

    if (vault == undefined || vault == null) {
      throw new HttpException(
        {
          message: `Vault with given id : ${id} with invocationCapability : ${invoker} does not exists`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.documentRepository.deleteVault();
  }
}
