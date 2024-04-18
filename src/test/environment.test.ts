import { describe, it } from 'es-test/lib/testRunner.js';
import { environment } from '../env.js';
import { expect } from 'chai';

const full = /[a-z]+@[0-9]\.[0-9]\.[0-9](-(alpha|beta|pre|rc[0-9]*))?/;
const ver = /[0-9]\.[0-9]\.[0-9](-(alpha|beta|pre|rc[0-9]*))?/;

describe('Environment values',()=>{

    it('should contain values',()=>{
        expect(environment).to.have.property('DEBUG').to.be.a('boolean');
        expect(environment).to.have.property('IS_TESTING').to.be.a('boolean');
        expect(environment).to.have.property('FULL_MODULE_NAME').to.be.a('string');
        expect(environment).to.have.property('MODULE_NAME').to.be.a('string');
        expect(environment).to.have.property('MODULE_VERSION').to.be.a('string');
    });

    it('should match valid version values',()=>{
        expect(environment.FULL_MODULE_NAME).to.match(full);
        expect(environment.MODULE_NAME).to.match(/[a-z]+/);
        expect(environment.MODULE_VERSION).to.match(ver);
        expect(environment.DEBUG).to.be.not.equal(undefined);
        expect(environment.IS_TESTING).to.be.not.equal(undefined);
    });

});