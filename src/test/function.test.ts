import { describe, it } from '@efekos/es-test/bin/testRunner.js';
import { expect } from 'chai';
import { getLocalAppDataPath } from '../utils.js';

describe('Working function tests',()=>{

    it('utils.getLocalAppDataPath',()=>{

        const path = getLocalAppDataPath();
        expect(path).to.be.a('string').to.be.not.equal(undefined);

    });

});