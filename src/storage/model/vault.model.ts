import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import { IsNotEmpty, IsNumber, IsObject, IsString, Validate } from 'class-validator';
import { Hmac } from 'crypto';
import mongoose, { Document } from 'mongoose';




export type SchemaDoucment = VaultsIndex & Document;


class  keyAgreementKey{
    id: string
    type: string
}

class hmac  {
    id: string
    type: string
}

@Schema()
export class VaultsIndex {

    @Prop()
    @IsString()
    @IsNotEmpty()
    id: string;

    @Prop()
    @IsString()
    @IsNotEmpty()
    controller: string;

    @Prop()
    @IsString()
    referenceId: string;

    @Prop({
        type: keyAgreementKey
    })
  
    keyAgreementKey: keyAgreementKey;

    @Prop({
        type: hmac
    })
    hmac: hmac

    @Prop()
    @IsNumber()
    sequence: number;

    @Prop()
    @IsString()
    invoker: string;


    @Prop()
    @IsString()
    delegator: string;







}


export const VaultIndexSchema = SchemaFactory.createForClass(VaultsIndex);
VaultIndexSchema.index({ "id": 1, "controller": 1 }, { unique: true, background: true });
VaultIndexSchema.index({ "id": 1 }, { unique: true, background: true });
