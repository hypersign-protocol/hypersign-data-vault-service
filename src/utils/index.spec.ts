
import { Test } from "@nestjs/testing";
import { getHash,generateDocId } from ".";

describe("utils", () => {

    describe("index", () => {
    
        it("should be defined", async () => {
        const module = await Test.createTestingModule({
            providers: [],
        }).compile();
    
        expect(module).toBeDefined();
        });

        it("should be able to create Hash", async () => {

            const hash = getHash("test");
            expect(hash).toBeDefined();
            expect(hash).toContain("hs:vault:");
            expect(hash).toEqual("hs:vault:qUqP5cyxm6YcTAhz05Hph5gvu9M");
            expect(typeof hash).toEqual("string");
            

        })

        it("should be able to generate DocId", async () => {
                
                const hash = generateDocId("test");
                expect(hash).toBeDefined();
                expect(hash).toContain("hs:doc:");
                expect(hash).toEqual("hs:doc:n4bqgyhmfwwal-qgxvrqfao_txsrc4is0v1sfbdwcgg");
                expect(typeof hash).toEqual("string");
        })

    
    });



})
