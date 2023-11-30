import {
  DocSchema
} from '../schemas/doucment.schema';
import { FilterQuery, Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DocumentRepository {
  constructor(
    @Inject('DOCUMENT_MODEL') private readonly documentModel: Model<DocSchema>,
  ) {}

  async createDocument(document: DocSchema) {
    const newDocument = new this.documentModel(document);
    return await newDocument.save();
  }

  async getDocument(documentFilterQuery: FilterQuery<DocSchema>) {
    return await this.documentModel.findOne(
      documentFilterQuery,
    );
  }

  async updateDocument(documentFilterQuery: FilterQuery<DocSchema>, document: Partial<DocSchema>) {
    return await this.documentModel.findOneAndUpdate(
      documentFilterQuery,
      document,
      { new: true }
    );
  }

  async getAllDocuments(documentFilterQuery: FilterQuery<DocSchema>): Promise<DocSchema[]> {
    return await this.documentModel.find().limit(documentFilterQuery.limit).skip(documentFilterQuery.skip);
  }

  async queryDocuments(queryDocumentFilter: FilterQuery<DocSchema>) {
    return await this.documentModel.find(queryDocumentFilter, {
      'id': 1,
    });
  }
  
  async queryDocumentsWithPagination(queryDocumentFilter: FilterQuery<DocSchema>, limit: number, skip: number) {
    return await this.documentModel.find(queryDocumentFilter, {
      'id': 1,
    }).limit(limit).skip(skip);
  }

}
