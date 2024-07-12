import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty, IsObject, IsString, isObject } from "class-validator";
import { Document } from "mongoose";


export type SchemaDoucment = DocSchema & Document;



class EncryptedDataRecipient{
   

    @Prop()
    encrypted_Key: string;

    @Prop()
    keyId: string;
}
class EncryptedData{

    @Prop()
    ciphertext: string;

    @Prop()
    ephemPublicKey: string;

    @Prop()
    nonce: string;

    @Prop({
        type: [EncryptedDataRecipient]
    })
    reipients: EncryptedDataRecipient

    @Prop()
    version: string;

}



class Ihmac {

    @Prop()
    readonly id: string;

    @Prop()
    readonly type: string;
}

class IAttributes {
    @Prop()
    readonly name: string;

    @Prop()
    readonly value: string;

    @Prop()
    readonly unique: boolean;

}

export class IIndexed {
    @Prop()
    hmac: Ihmac;

    @Prop()
    attributes: IAttributes;
}

class Epk {
    @Prop()
    kty: string;

    @Prop()
    crv: string;

    @Prop()
    x: string;

    @Prop({ required: false })
    y: string;
}

class JWEHeader {
    @Prop()
    alg: string;

    @Prop()
    apu: string;

    @Prop()
    apv: string;

    @Prop()
    epk: Epk;

    @Prop()
    kid: string;


}

class JWERecipient {

    @Prop()
    encrypted_key: string;

    @Prop()
    header: JWEHeader;


}

class JWE {
    @Prop({
        required: true
    })
    protected: string;

    @Prop({
        required: true,
        type: [JWERecipient]
    })
    recipients: JWERecipient;

    @Prop({
        required: true
    })
    iv: string;

    @Prop({
        required: true
    })
    ciphertext: string;

    @Prop({
        required: true
    })
    tag: string;


}

@Schema({timestamps:true})
export class DocSchema {

    @Prop({ type: Object })
    @IsObject()
    indexed: Array<IIndexed>;
    @Prop({ type: JWE , required:false })
    @IsObject()
    jwe:JWE;

    @Prop({ type: EncryptedData })
    @IsObject()
    encryptedData: EncryptedData;

    @Prop({ required: true })
    @IsString()
    @IsNotEmpty()
    id: string;




}


export const DoucmentSchema = SchemaFactory.createForClass(DocSchema);

DoucmentSchema.index({ "id": 1 }, { unique: true, background:true, });


