import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import {  VaultsIndex } from "../model/vault.model";



@Injectable()
export class vaultRepository {

    constructor(
        @Inject('VaultIndexProvider') private readonly vaultProvider:Model<VaultsIndex>
    ) { }


    async createVault(vault: VaultsIndex ) {                
        const newVault = new this.vaultProvider(vault);
        return await newVault.save();
    }

    async getVault(vaultFilterQuery: Partial<VaultsIndex>) {
        const vault = await this.vaultProvider.findOne(
            vaultFilterQuery,
        );
        
        return vault;
    }
}