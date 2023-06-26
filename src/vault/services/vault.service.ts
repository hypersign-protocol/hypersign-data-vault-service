
import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable, Logger, Response } from "@nestjs/common";
import { createEdvDTO, createEdvResponseDTO } from "../dto/edv.dto";
import { vaultRepository } from "src/storage/repository/vault.repository";
import { DocumentStorageProvider } from "src/storage/providers/documentStorage.provider";
import { generateDocId, getHash } from "src/utils";
import { DocumentResponseDTO, UpdateDoumentDTO } from "../dto/document.dto";
import { DocSchema } from "src/storage/model/doucment.model";
import { VaultsIndex } from "src/storage/model/vault.model";



@Injectable()
export class VaultService {
    async getAllDocuments(id: string,page,limit): Promise<any> {

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

        this.documentStorage.disconnectDB();
        return documents;




    }
    constructor(private readonly vaultRepository: vaultRepository, private readonly documentStorage: DocumentStorageProvider) { }
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
                    message: "Vault already exists",

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
    async createDocument({ id, document }): Promise<DocumentResponseDTO> {
        const vault = await this.vaultRepository.getVault({
            id,
        });

        if (vault == undefined || vault == null) {
            throw new HttpException({
                message: "Vault with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }
        const docVaultId = getHash(id + vault.invoker);
        if (document.id == undefined) {
            document.id = generateDocId(JSON.stringify(document));
        }

        await this.documentStorage.connectDB(docVaultId);
        const doc = await this.documentStorage.createDocument(document);
        // generate random document id
        return { message: 'document created', document: doc }
    }


    async getDocument({ id, documentId }) {

        // fetch vault

        const vault = await this.vaultRepository.getVault({
            id
        });

        if (!vault) {
            throw new HttpException({
                message: "Vault with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }


        // generate document vault id
        const docVaultId = getHash(id + vault.invoker);

        // connect to document vault
        await this.documentStorage.connectDB(docVaultId);

        // fetch document

        const document = await this.documentStorage.getDocument({
            id: documentId
        });

        if (!document) {
            throw new HttpException({
                message: "Document with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }


        return { message: 'document fetched', document: document }

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


        return { message: 'document updated', document: updatedDoc as unknown as UpdateDoumentDTO }
    }
}