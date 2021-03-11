#!/usr/bin/env node
import yargs from 'yargs';
import {getCurrentClass} from "./getCurrentClass";

yargs(process.argv.slice(2))
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Enable verbose logging',
        default: false
    })
    .command('getCurrentClass', 'get the current class', (yargs) => {
        yargs.option('email', {
            type: 'string',
            required: true
        });
        yargs.option('password', {
            type: 'string',
            required: true
        });
        yargs.option('home', {
            type: 'string',
            required: true
        });
    }, getCurrentClass)
    .strictCommands()
    .demandCommand(1)
    .argv;