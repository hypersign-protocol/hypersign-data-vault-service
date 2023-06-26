
import { ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Header, Logger, Param, Post, Put, Query, RawBodyRequest, Redirect, Req, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { VaultService } from "../services/vault.service";
import { createEdvDTO, createEdvResponseDTO } from "../dto/edv.dto";
import { AuthHeader } from "../decorators/authHeader.decorator";
import { CreateDocumentDTO, DocumentResponseDTO, UpdateDoumentDTO } from "../dto/document.dto";



@Controller('vault')
@ApiTags('Vault Endpoints')
export class VaultController {
    constructor(private readonly vaultService: VaultService) { }

    @Post()
    @AuthHeader()
    @ApiBody({ type: createEdvDTO })
    @ApiResponse({ status: 201, type: createEdvResponseDTO, })
    async createEdv(@Req() _req, @Body() createEdvDto: createEdvDTO): Promise<createEdvResponseDTO> {
        return await this.vaultService.createVault(createEdvDto);
    }


    @AuthHeader()
    @Post(':documentId/document')
    @ApiResponse({ status: 201, type: DocumentResponseDTO, })
    async createDocument(@Param() _params, @Body() _body: CreateDocumentDTO): Promise<DocumentResponseDTO> {
        const id = _params.documentId;
        return await this.vaultService.createDocument({ id, document: _body });

    }





    @AuthHeader()
    @ApiResponse({ status: 200, type: DocumentResponseDTO, })
    @Get(':vaultId/document/:documentId')
    async getEdv(@Param() _params): Promise<any> {
        const documentId = _params.documentId;
        const id = _params.vaultId;
        return await this.vaultService.getDocument({ id, documentId });
    }

    @AuthHeader()
    @ApiResponse({ status: 200, type: DocumentResponseDTO })
    @Put(':vaultId/document')
    async updateDocument(@Param() _params, @Body() _body: UpdateDoumentDTO): Promise<DocumentResponseDTO> {
        const id = _params.vaultId;
        return await this.vaultService.updateDocument({ id, document: _body });
    }

    @AuthHeader()
    @ApiResponse({ status: 200, type: [DocumentResponseDTO] })
    @ApiQuery({ name: 'limit', required: true, description: 'Number of documents to return' })
    @ApiQuery({ name: 'page', required: true, description: 'Page number' })
    @Get(':vaultId/documents')
    async getAllDocuments(@Param() _params, @Query() _query): Promise<DocumentResponseDTO[]> {
        const id = _params.vaultId;
        const limit = _query.limit ? _query.limit : 10;
        const page = _query.page ? _query.page : 1;
        return await this.vaultService.getAllDocuments(id, page, limit);
    }

}


