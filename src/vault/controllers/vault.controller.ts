
import { ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Header, HttpStatus, Logger, Param, Post, Put, Query, RawBodyRequest, Redirect, Req, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { VaultService } from "../services/vault.service";
import { createEdvDTO, createEdvResponseDTO } from "../dto/edv.dto";
import { AuthHeader } from "../../decorators/authHeader.decorator";
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

}


