import { describe, it } from '@efekos/es-test/bin/testRunner.js';
import { arg } from '../module/arg.js';
import { expect } from 'chai';

describe('Argument handler', () => {

    arg.resolve(['help', '--watch', '-arg', 'yes']);

    it('should parse commands correctly', () => {
        expect(arg.getCommand()).to.be.a('string').to.be.equal('help');
    });

    it('should parse flags correctly', () => {
        expect(arg.getFlags()).to.be.a('array').to.have.lengthOf(1).to.include('watch');
        expect(arg.hasFlag('watch')).to.be.a('boolean').to.be.equal(true);
    });

    it('should parse arguments correctly', () => {
        expect(arg.getArgument('arg')).to.be.a('string').to.be.equal('yes');
    });

});