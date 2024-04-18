import { describe, it } from 'es-test/lib/testRunner.js';
import { arg } from '../module/arg.js';
import { expect } from 'chai';

describe('Argument handler', () => {

    arg.resolve(['help', '--watch', '-arg', 'yes']);

    it('should parse commands correctly', () => {
        expect(arg.getCommand()).to.equal('help');
    });

    it('should parse flags correctly', () => {
        expect(arg.getFlags()).to.include('watch');
        expect(arg.hasFlag('watch')).to.equal(true);
    });

    it('should parse arguments correctly', () => {
        expect(arg.getArgument('arg')).to.equal('yes');
    });

});