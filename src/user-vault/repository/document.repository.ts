import { DocSchema } from '../schemas/doucment.schema';
import { FilterQuery, Model } from 'mongoose';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DocumentRepository {
  constructor(
    @Inject('DOCUMENT_MODEL') private readonly documentModel: Model<DocSchema>,
  ) {}

  async createDocument(document: DocSchema) {
    const newDocument = new this.documentModel(document);

    const doc = await newDocument.save();
    return {
      ...doc?.toObject(),
      sizeInbytes: Buffer.byteLength(JSON.stringify(doc.toObject())),
    };
  }

  async getDocument(documentFilterQuery: FilterQuery<DocSchema>) {
    const doc = await this.documentModel.findOne(documentFilterQuery);
    if (!doc) {
      throw new BadRequestException(
        'Document with id ' + documentFilterQuery.id + 'not found.',
      );
    }
    return {
      ...doc?.toObject(),
      sizeInbytes: Buffer.byteLength(JSON.stringify(doc.toObject())),
    };
  }
  async getDocuments(documentFilterQuery: FilterQuery<DocSchema>) {
    const doc = await this.documentModel.find(documentFilterQuery);

    return doc;
  }

  async deleteDocument(documentFilterQuery: FilterQuery<DocSchema>) {
    const doc = await this.documentModel.deleteOne(documentFilterQuery);
    return doc;
  }

  async deleteVault() {
    const deletionResult = await this.documentModel.db.dropDatabase();
    return deletionResult;
  }

  async updateDocument(
    documentFilterQuery: FilterQuery<DocSchema>,
    document: Partial<DocSchema>,
  ) {
    const doc = await this.documentModel.findOneAndUpdate(
      documentFilterQuery,
      document,
      { new: true },
    );
    return {
      ...doc?.toObject(),
      sizeInbytes: Buffer.byteLength(JSON.stringify(doc.toObject())),
    };
  }

  async getAllDocuments(
    documentFilterQuery: FilterQuery<DocSchema>,
  ): Promise<DocSchema[]> {
    return await this.documentModel
      .find()
      .limit(documentFilterQuery.limit)
      .skip(documentFilterQuery.skip);
  }

  async queryDocuments(queryDocumentFilter: FilterQuery<DocSchema>) {
    return await this.documentModel.find(queryDocumentFilter, {
      id: 1,
    });
  }

  async queryDocumentsWithPagination(
    queryDocumentFilter: FilterQuery<DocSchema>,
    limit: number,
    skip: number,
  ) {
    return await this.documentModel
      .find(queryDocumentFilter, {
        id: 1,
      })
      .limit(limit)
      .skip(skip);
  }
}
