import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";



@Injectable()
export class vaultRepository {

    constructor(
        @Inject('VaultIndexProvider') private readonly vaultProvider:Model<any>
    ) { }


    async createVault(vault: any ) {
        
        const newVault = new this.vaultProvider(vault);
        return await newVault.save();
    }

    async getVault(id: string) {
        const vault = await this.vaultProvider.findOne(
            { id: id },
        );
        return vault;
    }
}