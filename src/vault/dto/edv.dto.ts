import {ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Validate } from "class-validator";
import mongoose from "mongoose";

enum keyAgreementKeyTypes{
}

class keyAgreementKeyDto{
    @ApiProperty()
    readonly id: string;

    @ApiProperty()
    readonly type: string;

   
}

class hmacDto{
    @ApiProperty()
    readonly id: string;

    @ApiProperty()
    readonly type: string;
}
export class createEdvDTO{


    @ApiProperty(

        {
            description: 'The id of the vault',
            type: String,
            required: true,
        }
    )
    readonly id: string;

    @ApiProperty({
        description: 'The controller of the vault',
        type: String,
        required: true,
    })
    readonly controller: string;

    @ApiProperty({
        description: 'The reference id of the vault',
        type: String,

        required:false
    })
    readonly referenceId: string;

    @ApiProperty({
        type:keyAgreementKeyDto,
        required:false,
        description:'The key agreement key of the vault'
    })
    @Type(() => keyAgreementKeyDto)
    readonly keyAgreementKey:keyAgreementKeyDto ;

    @ApiProperty({
        type:hmacDto,
        required:false,
        description:'The hmac of the vault'
    })
    @Type(() => hmacDto)
    readonly hmac: hmacDto;

    @ApiProperty({
        description: 'The sequence of the vault',
        type: Number,
        required: false,
    })
    readonly sequence: number;

    @ApiProperty({
        description: 'Invoker of the vault',
        type: String,
        required: true,
    })
    readonly invoker: string;
    
    @ApiProperty({
        description: 'Delegator of the vault.',
        type: String,
        required: true,
    })
    readonly delegator: string;
    
    
}






export class createEdvResponseDTO {
    @ApiProperty({
        description: 'The message of the response',
        type: String,
    })
    readonly message: string;

    @ApiProperty({
        type: createEdvDTO,
        description: 'The vault created',

    })

    vault: createEdvDTO;



}
