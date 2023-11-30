
import { HttpException, HttpStatus, Injectable, Logger, Response } from "@nestjs/common";
import { createEdvDTO, createEdvResponseDTO } from "../dto/edv.dto";
import { VaultRepository } from "../repository/vault.repository";

@Injectable()
export class VaultService {
    constructor(private readonly vaultRepository: VaultRepository) { }
   
    async createVault(createEdvDto: createEdvDTO): Promise<createEdvResponseDTO> {
        try {
            const vault = await this.vaultRepository.createOrFetchVault(createEdvDto);
            return { message: 'Vault created or fetched', vault }
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
}