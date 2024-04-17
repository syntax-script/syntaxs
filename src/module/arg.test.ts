import {expect,test} from '@jest/globals';
import { arg } from './arg.js';

test('Argument resolver should work.',()=>{
    const args = arg.resolve(['help','--watch','-version','1.0']);
    expect(arg.getCommand()).toBe('hello');
    expect(arg.hasFlag('watch')).toBe(true);
    expect(arg.getArgument('version')).toBe('1.0');
});