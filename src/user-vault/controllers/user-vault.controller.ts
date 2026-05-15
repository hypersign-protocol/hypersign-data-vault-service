import { UserVaultService } from '../services/user-vault.service';
import {
  ApiBody,
  ApiHeader,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  RawBodyRequest,
  Redirect,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthHeader } from '../../decorators/authHeader.decorator';
import {
  CreateDocumentDTO,
  DocumentQueryDTO,
  DocumentResponseDTO,
  UpdateDoumentDTO,
} from '../dto/document.dto';

@ApiTags('Vault Endpoints')
@Controller('vault')
export class UserVaultController {
  constructor(private readonly vaultService: UserVaultService) {}

  @AuthHeader()
  @Post(':vaultId/document')
  @ApiResponse({ status: 201, type: DocumentResponseDTO })
  async createDocument(
    @Param() _params,
    @Req() _req,
    @Body() _body: CreateDocumentDTO,
  ): Promise<DocumentResponseDTO> {
    const id = _params.vaultId;
    const invoker = _req.headers.vermethodid;
    return await this.vaultService.createDocument({
      id,
      document: _body,
      invoker,
    });
  }

  @AuthHeader()
  @Delete(':vaultId/document/:documentId')
  @ApiResponse({ status: 200 })
  async deleteDocument(@Param() _params, @Req() _req): Promise<any> {
    const id = _params.vaultId;
    const docId = _params.documentId;
    const invoker = _req.headers.vermethodid;
    return await this.vaultService.deleteDocument({
      id,
      documentId: docId,
      invoker,
    });
  }
  @AuthHeader()
  @Delete('/:vaultId')
  @ApiResponse({ status: 200 })
  async deleteVault(@Param() _params, @Req() _req) {
    const id = _params.vaultId;
    const invoker = _req.headers.vermethodid;

    return await this.vaultService.deleteVault({ id, invoker });
  }

  @AuthHeader()
  @ApiResponse({ status: 200, type: DocumentResponseDTO })
  @Get(':vaultId/document/:documentId')
  async getEdv(@Param() _params, @Req() _req): Promise<any> {
    const documentId = _params.documentId;
    const id = _params.vaultId;
    const invoker = _req.headers.vermethodid;
    if (!id || id == undefined || id == 'undefined') {
      throw new BadRequestException({ message: 'Please pass vault id' });
    }
    if (!documentId || documentId == undefined || documentId == 'undefined') {
      throw new BadRequestException({ message: 'Please pass document id' });
    }
    if (!invoker || invoker == undefined || invoker == 'undefined') {
      throw new BadRequestException({
        message: 'Please pass vermethodid in header',
      });
    }
    return await this.vaultService.getDocument({ id, documentId, invoker });
  }

  @AuthHeader()
  @ApiResponse({ status: 200, type: DocumentResponseDTO })
  @Put(':vaultId/document')
  async updateDocument(
    @Param() _params,
    @Body() _body: UpdateDoumentDTO,
    @Res() _res,
  ): Promise<DocumentResponseDTO> {
    const id = _params.vaultId;
    return _res
      .status(HttpStatus.OK)
      .send(await this.vaultService.updateDocument({ id, document: _body }));
  }

  @AuthHeader()
  @ApiResponse({ status: 302, type: [DocumentResponseDTO] })
  @ApiQuery({
    name: 'limit',
    required: true,
    description: 'Number of documents to return',
  })
  @ApiQuery({ name: 'page', required: true, description: 'Page number' })
  @Get(':vaultId/documents')
  async getAllDocuments(
    @Param() _params,
    @Query() _query,
    @Res() _res,
  ): Promise<DocumentResponseDTO[]> {
    const id = _params.vaultId;
    const limit = _query.limit ? _query.limit : 10;
    const page = _query.page ? _query.page : 1;
    return _res
      .status(HttpStatus.FOUND)
      .send(await this.vaultService.getAllDocuments(id, page, limit));
  }

  @AuthHeader()
  @ApiResponse({ status: 200, type: [DocumentResponseDTO] })
  @Post(':vaultId/query')
  async queryDocuments(
    @Param() _params,
    @Body() _body: DocumentQueryDTO,
    @Res() _res,
  ): Promise<DocumentResponseDTO[]> {
    const id = _params.vaultId;
    return _res
      .status(HttpStatus.OK)
      .send(await this.vaultService.queryDocuments(id, _body));
  }
}
