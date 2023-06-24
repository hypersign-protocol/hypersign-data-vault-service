import { Injectable, Logger } from "@nestjs/common";
import { Connection, Model, createConnection } from "mongoose";
import { DocSchema, DoucmentSchema } from "../model/doucment.model";
@Injectable()
export class DocumentStorageProvider {
  private connection: Connection;
  private connectedDB: Model<DocSchema>;

  constructor() { }

  async connectDB(
    dataBaseName: string,
  ) {

    this.connection =await createConnection(process.env.DB_URL + `/${dataBaseName}`).asPromise();
    await this.initiate();
    return this.connection;

  }

  async disconnectDB() {
    await this.connection.close().then(() => {
      Logger.log('Connection closed', 'DocumentStorageProvider');
    })
  }


  private async initiate() {
    this.connectedDB = this.connection.model('Document', DoucmentSchema);
    Logger.log('Connection established', 'DocumentStorageProvider');

  }

  async createDocument(document: DocSchema) {
    const newDocument = new this.connectedDB(document);
    return await newDocument.save();
  }

  async getDocument(id:DocSchema['id']) {

    return await this.connectedDB.findOne(
      { id: id },
    );

  }












}