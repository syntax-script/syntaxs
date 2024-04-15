import { existsSync, readdirSync, rmSync, statSync } from 'fs';
import chalk from 'chalk';
import { getLocalAppDataPath } from '../utils.js';
import { join } from 'path';
import { log } from '../module/log.js';

/**
 * Runs the clean command.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export function runClean(){
    
    const path = join(getLocalAppDataPath(),'syntaxs-cache');

    if(!existsSync(path)) {
        log.info('There is nothing to clean.');
    }

    function del(p:string){
        const files = readdirSync(p);
        files.forEach(f=>{
            const fPath = join(p,f);
            const stat = statSync(fPath);
            if(stat.isFile()) {
                log.info(`Deleting file: ${chalk.gray(fPath)}`); rmSync(fPath);
            } else del(fPath);
        });
    }

    log.info('Stating clean');
    del(path);
    log.info('Successfully cleaned all cache files and log files.');
    
}