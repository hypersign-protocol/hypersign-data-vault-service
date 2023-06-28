
import { HttpException, HttpStatus, Injectable, Logger, Response } from "@nestjs/common";
import { createEdvDTO, createEdvResponseDTO } from "../dto/edv.dto";
import { vaultRepository } from "src/storage/repository/vault.repository";
import { DocumentStorageProvider } from "src/storage/providers/documentStorage.provider";
import { generateDocId, getHash } from "src/utils";
import { DocumentQueryDTO, DocumentResponseDTO, UpdateDoumentDTO } from "../dto/document.dto";




@Injectable()
export class VaultService {
    constructor(private readonly vaultRepository: vaultRepository, private readonly documentStorage: DocumentStorageProvider) { }
    async queryDocuments(id: any, _body: DocumentQueryDTO): Promise<Array<DocumentResponseDTO>> {

        const vault = await this.vaultRepository.getVault({
            id,
        });

        if (vault == undefined || vault == null) {
            throw new HttpException({
                message: "Vault with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }

        const documentVaultId = getHash(id + vault.invoker);
        let query;
        let flag = false;
        if (_body.equals.length > 0) {
            flag = true;
            query = {
                equals: _body.equals
            }

        }

        if (_body.has.length > 0) {
            flag = false;
            query = {
                has: _body.has
            }

        }

        await this.documentStorage.connectDB(documentVaultId);







        const documents = flag ? await (async () => {

            const name = Object.keys(query.equals[0])
            const value = Object.values(query.equals[0])
            return await this.documentStorage.queryDocuments({
                'indexed.attributes.name': name[0],
                'indexed.attributes.value': value[0]
            })
        })()
            : await this.documentStorage.queryDocuments(
                {
                    'indexed.attributes.name': query.has[0]
                }
            );


        await this.documentStorage.disconnectDB();

        return documents as unknown as Array<DocumentResponseDTO>;

    }
    async getAllDocuments(id: string, page, limit): Promise<Array<DocumentResponseDTO>> {

        const vault = await this.vaultRepository.getVault({
            id,
        });

        if (vault == undefined || vault == null) {
            throw new HttpException({
                message: "Vault with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }

        const documentVaultId = getHash(id + vault.invoker);

        // connect to document storage provider

        await this.documentStorage.connectDB(documentVaultId);

        const documents = await this.documentStorage.getAllDocuments({
            skip: (page - 1) * limit,
            limit
        });

        await this.documentStorage.disconnectDB();
        return documents as any as Array<DocumentResponseDTO>;




    }

    async createVault(createEdvDto: createEdvDTO): Promise<createEdvResponseDTO> {
        try {
            const vault = await this.vaultRepository.createVault(createEdvDto);
            return { message: 'Vault created', vault }
        }
        catch (err) {
            if (err.code === 11000) {
                Logger.warn(`Vault id : ${createEdvDto.id} Already exists.  `, "VaultService - CreateVault")
                const vault = await this.vaultRepository.getVault({
                    id: createEdvDto.id,

                });
                throw new HttpException({
                    vault,
                    message: "Vault already exists with given id",

                }, HttpStatus.CONFLICT,);
            } else {
                throw new HttpException({
                    message: "Vault creation failed",
                    error: err
                }, HttpStatus.BAD_REQUEST, {
                    cause: err
                });
            }

        }



    }
    async createDocument({ id, document, invoker }): Promise<DocumentResponseDTO> {
        const vault = await this.vaultRepository.getVault({
            id,
            invoker

        });

        if (vault == undefined || vault == null) {
            throw new HttpException({
                message: `Vault with given id : ${id} with invocationCapability : ${invoker} does not exists`,
            }, HttpStatus.NOT_FOUND)
        }
        const docVaultId = getHash(id + vault.invoker);
        if (document.id == undefined) {
            document.id = generateDocId(JSON.stringify(document));
        }

        await this.documentStorage.connectDB(docVaultId);
        const doc = await this.documentStorage.createDocument(document);
        await this.documentStorage.disconnectDB();
        // generate random document id
        return { message: 'document created', document: doc }
    }


    async getDocument({ id, documentId, invoker }) {
        // fetch vault
        const vault = await this.vaultRepository.getVault({
            id,
        });
        if (!vault) {
            throw new HttpException({
                message: "Vault with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }
        const docVaultId = getHash(id + vault.invoker);
        await this.documentStorage.connectDB(docVaultId);
        if (invoker !== vault.invoker) {
            Logger.debug(`Invoker : ${invoker} is not authorized to access document : ${documentId} `, "VaultService - GetDocument")
            let document;
            if (!invoker.includes('eip')) {
                document = await this.documentStorage.getDocument({
                    id: documentId,
                    'jwe.recipients.header.kid': vault.keyAgreementKey.id
                })
            } else {
                Logger.debug(`KeyType : ${vault.keyAgreementKey.type} `, `VaultService - GetDocument`)
                document = await this.documentStorage.getDocument({
                    id: documentId,
                    'encryptedData.recipients.keyId': vault.keyAgreementKey.id
                })
            }
            await this.documentStorage.disconnectDB();
            return { message: 'document fetched', document: document, capability: 'Read' }
        } else {
            const document = await this.documentStorage.getDocument({
                id: documentId,
            });
            if (!document) {
                throw new HttpException({
                    message: "Document with given id does not exists",
                }, HttpStatus.NOT_FOUND)
            }
            await this.documentStorage.disconnectDB();
            return { message: 'document fetched', document: document }
        }
    }
    async updateDocument({ id, document }: { id: string, document: UpdateDoumentDTO }): Promise<DocumentResponseDTO> {

        // fetch vault
        const vault = await this.vaultRepository.getVault({
            id,
        });

        if (!vault) {
            throw new HttpException({
                message: "Vault with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }
        if (document.id == undefined || document.id == null) {
            throw new HttpException({
                message: "Document id is required",
            }, HttpStatus.BAD_REQUEST)
        }


        // generate document vault id
        const docVaultId = getHash(id + vault.invoker);

        // connect to document vault
        await this.documentStorage.connectDB(docVaultId);

        // fetch document

        const doc = await this.documentStorage.getDocument({
            id: document.id
        });

        if (!doc) {
            throw new HttpException({
                message: "Document with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }


        // update document

        const updatedDoc = await this.documentStorage.updateDocument({ id: document.id }, document);

        await this.documentStorage.disconnectDB();

        return { message: 'document updated', document: updatedDoc as unknown as UpdateDoumentDTO }
    }
}