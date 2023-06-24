import {ApiProperty } from "@nestjs/swagger";


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
    @ApiProperty()
    readonly id: string;

    @ApiProperty()
    readonly controller: string;

    @ApiProperty()
    readonly referenceId: string;

    @ApiProperty()
    readonly keyAgreementKey:keyAgreementKeyDto ;

    @ApiProperty()
    readonly hmac: hmacDto;

    @ApiProperty()
    readonly sequence: number;

    @ApiProperty()
    readonly invoker: string;
    
    @ApiProperty()
    readonly delegator: string;
    
    
}