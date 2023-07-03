import { Injectable, Logger } from "@nestjs/common";
import mongoose, { Connection, FilterQuery, Model, Mongoose, createConnection } from "mongoose";
import { DocSchema, DoucmentSchema } from "../model/doucment.model";
import { DocumentQueryDTO } from "src/vault/dto/document.dto";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class DocumentStorageProvider {
 

  private connection: Connection;
  private connectedDB: Model<DocSchema>;

  constructor(
    private configService: ConfigService,
  ) { }

  async connectDB(
    dataBaseName: string,
  ) {    
    this.connection = await createConnection(this.configService.get<string>('DB_URL') + `/${dataBaseName}`).asPromise();

    await this.initiate();
    return this.connection;

  }

  async disconnectDB() {
    await this.connection.close()
    Logger.log('Connection closed', 'DocumentStorageProvider');

  }


  private async initiate() {
    this.connectedDB = this.connection.model('Document', DoucmentSchema);
    Logger.log('Connection established', 'DocumentStorageProvider');

  }

  async createDocument(document: DocSchema) {
    const newDocument = new this.connectedDB(document);
    return await newDocument.save();
  }

  async getDocument(documentFilterQuery: FilterQuery<DocSchema>) {

    return await this.connectedDB.findOne(
      documentFilterQuery,

    ) ;

  }

  async updateDocument(documentFilterQuery: FilterQuery<DocSchema>, document: Partial<DocSchema>) {
    return await this.connectedDB.findOneAndUpdate(
      documentFilterQuery,
      document,
      { new: true }
    );

  }


  async getAllDocuments(documentFilterQuery: FilterQuery<DocSchema>): Promise<DocSchema[]> {
    return await this.connectedDB.find().limit(documentFilterQuery.limit).skip(documentFilterQuery.skip);
  }

  async queryDocuments(queryDocumentFilter:FilterQuery<DocSchema>){
    return await this.connectedDB.find(queryDocumentFilter);
  } 














}