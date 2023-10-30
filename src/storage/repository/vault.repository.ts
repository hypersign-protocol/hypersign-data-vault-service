import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import {  VaultsIndex } from "../model/vault.model";



@Injectable()
export class vaultRepository {

    constructor(
        @Inject('VaultIndexProvider') private readonly vaultProvider:Model<VaultsIndex>
    ) { }


    async createOrFetchVault(vault: VaultsIndex ) {    
        if(vault.id){
            // check if vault already exists with this id,
            // if so, just return that vault. 
            const oldVault = await this.getVault({
                id: vault.id
            })

            if(oldVault){
                return oldVault;
            }
        }        
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