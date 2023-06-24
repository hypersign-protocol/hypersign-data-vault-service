
import {  ApiBody, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Header, Param, Post, RawBodyRequest, Req, UsePipes, ValidationPipe } from "@nestjs/common";
import { VaultService } from "../services/vault.service";
import { createEdvDTO} from "../dto/edv.dto";
import { AuthHeader } from "../decorators/authHeader.decorator";
import { CreateDocumentDTO } from "../dto/document.dto";



@Controller('edv')
@ApiTags('Vault Endpoints')
@UsePipes(new ValidationPipe({ validateCustomDecorators: true }))

export class VaultController {
    constructor(private readonly vaultService: VaultService) { }

    @Post()
    @AuthHeader()
    @ApiBody({ type: createEdvDTO })
    async createEdv(@Req() _req,   @Body() createEdvDto: createEdvDTO) {
        // Get reqdata and pass it to service
        

        return await this.vaultService.createVault(createEdvDto);

    }


    @AuthHeader()
    @Post(':documentId/document')

    async createDocument(@Param() _params,@Body() _body :CreateDocumentDTO): Promise<any> {
        const id=_params.documentId;
        return await this.vaultService.createDocument({id,document:_body});

    }





    @AuthHeader()
    @Get(':vaultId/document/:documentId')
    async getEdv(@Param() _params): Promise<any> {
        const documentId =_params.documentId;
        const id=_params.vaultId;

        return await this.vaultService.getDocument({id,documentId});
    }
}


