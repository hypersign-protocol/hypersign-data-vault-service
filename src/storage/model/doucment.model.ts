import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty, IsObject, IsString, isObject } from "class-validator";
import {  Document } from "mongoose";
import { IIndexed } from "src/vault/dto/document.dto";


export type SchemaDoucment=DocSchema & Document;



@Schema()
export class DocSchema {

    @Prop({type:Object})
    @IsObject()
    indexed:Array<IIndexed>;
    @Prop({type:Object})
    @IsObject()
    jwe:object;

    @Prop({type:Object})
    @IsObject()
    encryptedData:object;

    @Prop({required:true})
    @IsString()
    @IsNotEmpty()
    id:string;




}


export const DoucmentSchema = SchemaFactory.createForClass(DocSchema);

DoucmentSchema.index({ "id": 1 }, { unique: true });


