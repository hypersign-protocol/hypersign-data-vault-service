
import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable, Logger, Response } from "@nestjs/common";
import { createEdvDTO } from "../dto/edv.dto";
import { vaultRepository } from "src/storage/repository/vault.repository";
import { DocumentStorageProvider } from "src/storage/providers/documentStorage.provider";
import { generateDocId, getHash } from "src/utils";


@Injectable()
export class VaultService {
    constructor(private readonly vaultRepository: vaultRepository, private readonly documentStorage: DocumentStorageProvider) { }
    async createVault(createEdvDto: createEdvDTO) {
        Logger.debug(createEdvDto, "VaultService - CreateVault");
        try {
            const vault = await this.vaultRepository.createVault(createEdvDto);
            return { message: 'Vault created', ...vault }
        }
        catch (err) {
            if (err.code === 11000) {
                Logger.warn(`Vault id : ${createEdvDto.id} Already exists.  `, "VaultService - CreateVault")
                const vault = await this.vaultRepository.getVault(createEdvDto.id);
                throw new HttpException({
                    ...vault,
                    message: "Vault already exists",

                }, HttpStatus.CONFLICT,);
            } else {
                throw new HttpException(err, HttpStatus.BAD_REQUEST);
            }

        }



    }
    async createDocument({ id, document }) {
        const vault = await this.vaultRepository.getVault(id);
        if (!vault) {
            throw new HttpException({
                message: "Vault with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }
        Logger.debug(vault, "VaultService - createDocument");
        const docVaultId = getHash(id);
        if (document.id == undefined) {
            document.id = generateDocId(JSON.stringify(document));
        }
        await this.documentStorage.connectDB(docVaultId);
        const doc = await this.documentStorage.createDocument(document);
        // generate random document id
        Logger.debug(`document id : ${id}`, "VaultService - createDocument");
        return { message: 'document created', document: doc }
    }


    async getDocument({ id, documentId }) {

        // fetch vault

        const vault = await this.vaultRepository.getVault(id);

        if (!vault) {
            throw new HttpException({
                message: "Vault with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }

        Logger.debug(vault, "VaultService - getDocument");

        // generate document vault id
        const docVaultId = getHash(id);

        // connect to document vault
        await this.documentStorage.connectDB(docVaultId);

        // fetch document

        const document = await this.documentStorage.getDocument(documentId);

        if (!document) {
            throw new HttpException({
                message: "Document with given id does not exists",
            }, HttpStatus.NOT_FOUND)
        }

        Logger.debug(document, "VaultService - getDocument");

        return { message: 'document fetched', document: document}

    }
}