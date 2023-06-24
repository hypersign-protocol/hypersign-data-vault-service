import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';
import {Document} from 'mongoose';




export type SchemaDoucment=VaultsIndex & Document;

@Schema()
export class VaultsIndex{

    @Prop()
    @IsString()
    @IsNotEmpty()
    id:string;

    @Prop()
    @IsString()
    @IsNotEmpty()
    controller:string;

    @Prop()
    @IsString()
    referenceId:string;

    @Prop({
        type:Object
    })
    @IsObject()
    keyAgreementKey:object;

    @Prop({
        type:Object
    })
    @IsObject()
    hmac:object;

    @Prop()
    @IsNumber()
    sequence:Number;

    @Prop()
    @IsString()
    invoker:string;


    @Prop()
    @IsString()
    delegator:string;

    


    


}


export const VaultIndexSchema = SchemaFactory.createForClass(VaultsIndex);
VaultIndexSchema.index({ "id": 1, "controller": 1 }, { unique: true });

VaultIndexSchema.index({ "id": 'text', "controller": 'text' }, { unique: true });

