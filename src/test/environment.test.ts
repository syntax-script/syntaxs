import { describe, it } from '@efekos/es-test/bin/testRunner.js';
import { environment } from '../env.js';
import { expect } from 'chai';

const full = /[a-z]+@[0-9]\.[0-9]\.[0-9](-(alpha|beta|pre|rc[0-9]*))?/;
const ver = /[0-9]\.[0-9]\.[0-9](-(alpha|beta|pre|rc[0-9]*))?/;

describe('Environment values',()=>{

    it('should contain values',()=>{
        expect(environment).to.have.property('DEBUG').to.be.a('boolean').to.be.equal(false);
        expect(environment).to.have.property('IS_TESTING').to.be.a('boolean').to.be.equal(true);
        expect(environment).to.have.property('FULL_MODULE_NAME').to.be.a('string').to.be.not.equal('').to.be.not.equal(undefined);
        expect(environment).to.have.property('MODULE_NAME').to.be.a('string').to.be.not.equal('').to.be.not.equal(undefined);
        expect(environment).to.have.property('MODULE_VERSION').to.be.a('string').to.be.not.equal('').to.be.not.equal(undefined);
    });

    it('should match valid version values',()=>{
        expect(environment.FULL_MODULE_NAME).to.be.a('string').to.match(full);
        expect(environment.MODULE_NAME).to.be.a('string').to.match(/[a-z]+/);
        expect(environment.MODULE_VERSION).to.be.a('string').to.match(ver);
        expect(environment.DEBUG).to.be.not.equal(undefined);
        expect(environment.IS_TESTING).to.be.not.equal(undefined);
    });

});