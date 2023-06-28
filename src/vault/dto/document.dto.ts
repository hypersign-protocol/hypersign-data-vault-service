import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEmpty, IsObject, IsString, ValidateNested } from "class-validator";




class Ihmac{

      @ApiProperty()
    readonly id: string;

    @ApiProperty()
    readonly type: string;
}

class IAttributes{
    @ApiProperty()
    readonly name: string;

    @ApiProperty()
    readonly value: string;

    @ApiProperty()
    readonly unique: boolean;

}

export class IIndexed{
    @ApiProperty()
    hmac:Ihmac;

    @ApiProperty()
    attributes:IAttributes;
}

class Epk{
    @ApiProperty({required:true})
    kty: string;

    @ApiProperty({required:true})
    crv: string;

    @ApiProperty({required:true})
    x: string;

    @ApiProperty({required:false})
    y: string;
}

class JWEHeader{
    @ApiProperty({required:true})
    alg: string;

    @ApiProperty({required:true})
    apu: string;

    @ApiProperty({required:true})
    apv: string;

    @ApiProperty({required:true,
        type: Epk})
    epk: Epk;

    @ApiProperty({required:true})
    kid: string;


}

class JWERecipient{

    @ApiProperty({required:true})
    encrypted_key: string;

    @ApiProperty({required:true})
    header: JWEHeader;


}

class JWE{
    @ApiProperty({
        required:true
    })
    protected: string;

    @ApiProperty({
        required:true,
        type:[JWERecipient]
    })
    recipients: JWERecipient;

    @ApiProperty({
        required:true
    })
    iv: string;

    @ApiProperty({
        required:true
    })
    ciphertext: string;

    @ApiProperty({
        required:true
    })
    tag: string;

   
}



class EncryptedDataRecipient{
   

    @ApiProperty({
        required:true
    })
    encrypted_Key: string;

    @ApiProperty({
        required:true
    })
    keyId: string;
}
class EncryptedData{

    @ApiProperty({
        required:true
    })
    ciphertext: string;

    @ApiProperty({
        required:true
    })
    ephemPublicKey: string;

    @ApiProperty({
        required:true
    })
    nonce: string;

    @ApiProperty({
        required:true,
        type: [EncryptedDataRecipient]
        
    })
    reipients: EncryptedDataRecipient

    @ApiProperty({
        required:true
    })
    version: string;

}

export class CreateDocumentDTO{
    
    @ApiProperty({
        required:false
    })
    readonly id?: string;

    @ApiProperty({
        type: [IIndexed],
        required:false
    })
    @Type(() => IIndexed)
    @ValidateNested({each:true})
    readonly indexed?: IIndexed[];

    @ApiProperty({
        required:false
    })
    readonly jwe?:JWE ;



    @ApiProperty({
        required:false
    })

    readonly encryptedData?:EncryptedData;

}


export class UpdateDoumentDTO{
    
    @ApiProperty({
        required:true
    })
    readonly id: string;

    @ApiProperty({
        type: [IIndexed],
        required:false
    })
    @Type(() => IIndexed)
    @ValidateNested({each:true})
    readonly indexed: IIndexed[];

    @ApiProperty({
        required:false
    })
    readonly jwe?:JWE ;



    @ApiProperty({
        required:false
    })

    readonly encryptedData?:EncryptedData;

}




export class DocumentResponseDTO{

    @ApiProperty({
        description:'Message of the response',
    })
    message: string;

    @ApiProperty({
        description:'The document',
        type:CreateDocumentDTO
    })
    document: CreateDocumentDTO;

}


export class DocumentQueryDTO{

    @ApiProperty({
        required:true,
        type:[Object]
    })
    equals:Array<Object>;

    @ApiProperty({
        required:true,
        type:[String]
        
    })
    has:Array<String>;

    @ApiProperty({

        required:true,
        type:String

    })

    index:string

}