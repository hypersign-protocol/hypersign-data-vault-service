
import { ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Header, HttpStatus, Logger, Param, Post, Put, Query, RawBodyRequest, Redirect, Req, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { VaultService } from "../services/vault.service";
import { createEdvDTO, createEdvResponseDTO } from "../dto/edv.dto";
import { AuthHeader } from "../decorators/authHeader.decorator";
import { CreateDocumentDTO, DocumentQueryDTO, DocumentResponseDTO, UpdateDoumentDTO } from "../dto/document.dto";



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
    async createDocument(@Param() _params, @Req() _req, @Body() _body: CreateDocumentDTO): Promise<DocumentResponseDTO> {
        const id = _params.documentId;

        const invoker = _req.headers.vermethodid;
        

        return await this.vaultService.createDocument({ id, document: _body ,invoker});

    }





    @AuthHeader()
    @ApiResponse({ status: 200, type: DocumentResponseDTO, })
    @Get(':vaultId/document/:documentId')
    async getEdv(@Param() _params,@Req() _req): Promise<any> {
        const documentId = _params.documentId;
        const id = _params.vaultId;
        const invoker = _req.headers.vermethodid;

        return await this.vaultService.getDocument({ id, documentId ,invoker});
    }

    @AuthHeader()
    @ApiResponse({ status: 200, type: DocumentResponseDTO })
    @Put(':vaultId/document')
    async updateDocument(@Param() _params, @Body() _body: UpdateDoumentDTO,@Res() _res): Promise<DocumentResponseDTO> {
        const id = _params.vaultId;
        return  _res.status(HttpStatus.OK).send(await this.vaultService.updateDocument({ id, document: _body }))
    }

    @AuthHeader()
    @ApiResponse({ status: 302, type: [DocumentResponseDTO] })
    @ApiQuery({ name: 'limit', required: true, description: 'Number of documents to return' })
    @ApiQuery({ name: 'page', required: true, description: 'Page number' })
    @Get(':vaultId/documents')
    async getAllDocuments(@Param() _params, @Query() _query,@Res() _res): Promise<DocumentResponseDTO[]> {
        const id = _params.vaultId;
        const limit = _query.limit ? _query.limit : 10;
        const page = _query.page ? _query.page : 1;
        return  _res.status(HttpStatus.FOUND).send ( await this.vaultService.getAllDocuments(id, page, limit));
    }


    @AuthHeader()
    @ApiResponse({ status: 302, type: [DocumentResponseDTO] })
    @Post(':vaultId/query')
    async queryDocuments(@Param() _params, @Body() _body:DocumentQueryDTO,@Res() _res): Promise<DocumentResponseDTO[]> {
        const id = _params.vaultId;
        return  _res.status(HttpStatus.FOUND).send(await this.vaultService.queryDocuments(id, _body));
    }

}


