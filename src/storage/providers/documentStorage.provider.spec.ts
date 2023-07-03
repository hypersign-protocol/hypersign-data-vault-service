import { Test } from "@nestjs/testing";
import { DocSchema, DoucmentSchema, SchemaDoucment } from "../model/doucment.model";
import { DocumentStorageProvider } from "./documentStorage.provider";
import { ConfigService } from "@nestjs/config";
import mongoose, { Connection, FilterQuery } from "mongoose";
describe('DocumentStorageProvider', () => {
    let documentStorageProvider: DocumentStorageProvider;

    beforeAll(async () => {
        const module = await Test.createTestingModule({

            providers: [
                DocumentStorageProvider,
                {
                    provide: DocumentStorageProvider,
                    useValue: {
                        connectDB: jest.fn(
                            (dataBaseName: string) => {
                                return Promise.resolve(Connection);
                            }
                        ),
                        disconnectDB: jest.fn(() => {
                            return Promise.resolve(Connection);
                        }),
                        createDocument: jest.fn(
                            (document: DocSchema) => {

                                return Promise.resolve({
                                    _id: '5f9d4a3d9d9d9d9d9d9d9d9d',
                                    ...document,
                                });
                            }
                        ),
                        getDocument: jest.fn(
                            (documentFilterQuery) => {
                                const document: DocSchema = {
                                    indexed: [],
                                    jwe: {
                                        protected: "",
                                        recipients: {
                                            encrypted_key: "",
                                            header: {
                                                alg: "",
                                                apu: "",
                                                apv: "",
                                                epk: {
                                                    kty: "",
                                                    crv: "",
                                                    x: "",
                                                    y: ""
                                                },
                                                kid: ""
                                            }
                                        },
                                        iv: "",
                                        ciphertext: "",
                                        tag: ""
                                    },
                                    encryptedData: {
                                        ciphertext: "",
                                        ephemPublicKey: "",
                                        nonce: "",
                                        reipients: {
                                            encrypted_Key: "",
                                            keyId: ""
                                        },
                                        version: ""
                                    }
                                    ,
                                    // random Id
                                    id: documentFilterQuery.id,


                                }
                                return Promise.resolve({
                                    _id: '5f9d4a3d9d9d9d9d9d9d9d9d',
                                    ...document,

                                });
                            }
                        ),
                        updateDocument: jest.fn(
                            (documentFilterQuery, document) => {
                                return Promise.resolve({
                                    _id: '5f9d4a3d9d9d9d9d9d9d9d9d',
                                    ...document,
                                });
                            }
                        ),
                        getAllDocuments: jest.fn(
                            (documentFilterQuery) => {
                                const document: DocSchema = {
                                    indexed: [],
                                    jwe: {
                                        protected: "",
                                        recipients: {
                                            encrypted_key: "",
                                            header: {
                                                alg: "",
                                                apu: "",
                                                apv: "",
                                                epk: {
                                                    kty: "",
                                                    crv: "",
                                                    x: "",
                                                    y: ""
                                                },
                                                kid: ""
                                            }
                                        },
                                        iv: "",
                                        ciphertext: "",
                                        tag: ""
                                    },
                                    encryptedData: {
                                        ciphertext: "",
                                        ephemPublicKey: "",
                                        nonce: "",
                                        reipients: {
                                            encrypted_Key: "",
                                            keyId: ""
                                        },
                                        version: ""
                                    }
                                    ,
                                    // random Id
                                    id: documentFilterQuery.id,
                            }

                                return Promise.resolve([{
                                    _id: '5f9d4a3d9d9d9d9d9d9d9d9d',
                                    ...document,
                                }]);
                            }
                        ),

                    },

                },
                {
                    provide: ConfigService,
                    useValue: {
                        // get: jest.fn().mockReturnValue('mongodb+srv://pratap:Pratap%402018@cluster0.exdezcw.mongodb.net'),
                    },
                }
            ],

        }).compile();
        documentStorageProvider = module.get<DocumentStorageProvider>(DocumentStorageProvider);
        await documentStorageProvider.connectDB('nestjs-test');
    });

    afterAll(async () => {
        // Disconnect from the test database
        await documentStorageProvider.disconnectDB();

    });


    describe('createDocument', () => {
        it('should create a new document', async () => {
            const document: DocSchema = {
                indexed: [],
                jwe: {
                    protected: "",
                    recipients: {
                        encrypted_key: "",
                        header: {
                            alg: "",
                            apu: "",
                            apv: "",
                            epk: {
                                kty: "",
                                crv: "",
                                x: "",
                                y: ""
                            },
                            kid: ""
                        }
                    },
                    iv: "",
                    ciphertext: "",
                    tag: ""
                },
                encryptedData: {
                    ciphertext: "",
                    ephemPublicKey: "",
                    nonce: "",
                    reipients: {
                        encrypted_Key: "",
                        keyId: ""
                    },
                    version: ""
                }
                ,
                // random Id
                id: Math.random().toString(36).substring(7),


            }


            const createdDocument = await documentStorageProvider.createDocument(document);

            expect(createdDocument).toBeDefined();
            expect(createdDocument).toMatchObject(document);
        });
    });

    describe('getDocument', () => {
        it('should retrieve a document based on the filter query', async () => {
            const filterQuery = {
                id: Math.random().toString(36).substring(7),

            }
            const retrievedDocument = await documentStorageProvider.getDocument(filterQuery);

            expect(retrievedDocument).toBeDefined();
            expect(retrievedDocument.id).toEqual(filterQuery.id);
            expect(retrievedDocument.encryptedData).toBeDefined();
            expect(retrievedDocument.jwe).toBeDefined();
            expect(retrievedDocument.indexed).toBeDefined();

        });
    });


    describe('updateDocument', () => {
        it('should update a document based on the filter query', async () => {
            const filterQuery = {
                id: Math.random().toString(36).substring(7),
            }
            const document: DocSchema = {
                indexed: [],
                jwe: {
                    protected: "",
                    recipients: {
                        encrypted_key: "",
                        header: {
                            alg: "",
                            apu: "",
                            apv: "",
                            epk: {
                                kty: "",
                                crv: "",
                                x: "",
                                y: ""
                            },
                            kid: ""
                        }
                    },
                    iv: "",
                    ciphertext: "",
                    tag: ""
                },
                encryptedData: {
                    ciphertext: "",
                    ephemPublicKey: "",
                    nonce: "",
                    reipients: {
                        encrypted_Key: "",
                        keyId: ""
                    },
                    version: ""
                }
                ,
                // random Id
                id: filterQuery.id,

            }

            const updatedDocument = await documentStorageProvider.updateDocument(filterQuery, document);

            expect(updatedDocument).toBeDefined();
            expect(updatedDocument.id).toEqual(filterQuery.id);
            expect(updatedDocument.encryptedData).toBeDefined();
            expect(updatedDocument.jwe).toBeDefined();
            expect(updatedDocument.indexed).toBeDefined();
        });
    });


    describe('getAllDocuments', () => {
        it('should retrieve all documents based on the filter query', async () => {
            const filterQuery = {
                id: Math.random().toString(36).substring(7),
            }
            const retrievedDocuments = await documentStorageProvider.getAllDocuments(filterQuery);

            expect(retrievedDocuments).toBeDefined();
            expect(retrievedDocuments[0].id).toEqual(filterQuery.id);
            expect(retrievedDocuments[0].encryptedData).toBeDefined();
            expect(retrievedDocuments[0].jwe).toBeDefined();
            expect(retrievedDocuments[0].indexed).toBeDefined();
        });
    });

    // Add tests for other methods (updateDocument, getAllDocuments, queryDocuments) in a similar way

});

