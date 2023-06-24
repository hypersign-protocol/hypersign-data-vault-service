import { SetMetadata, applyDecorators } from "@nestjs/common";
import { ApiHeader } from "@nestjs/swagger";






export const AuthHeader = ():PropertyDecorator=>{

  
    return applyDecorators(
        ApiHeader({
            name: 'Authorization',
            description: 'Auth Header',
            required: true,

        }),
        ApiHeader({
            name: 'Capability-invocation',
            description: 'Capability-invocation Header',
            required: true,
        }),
        ApiHeader({
            name:'Controller',
            description:'Controller Header',
            required:true,
        }),
        ApiHeader({
            name:'Digest',
            description:'Digest Header',
            required:true,
        }),
        ApiHeader({
            name:'VermethodId',
            description:'Verification Method Id Header',
            required:true,
        }),
        ApiHeader({
            name:'Host',
            description:'Host Header',
            required:true,
        }),
        ApiHeader({
            name:'Content-Length',
            description:'Content-Length Header',


        }),
              


    )
}