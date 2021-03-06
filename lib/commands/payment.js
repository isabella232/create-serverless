'use strict'
const path = require('path'),
	fs = require('fs'),
	fsUtil = require('../util/fs-util'),
	commandUtil = require('../util/command-util')

module.exports = function generatePayment(options, optionalLogger) {
	const region = options['region'] || 'us-east-1',
	source = (options && options.source) || process.cwd(),
		projectPath = options['folder'] ? path.join(source, options['folder']) : source, //if not locally, then create a folder and generate

		validationError = function () {

			if (options['folder'] && fsUtil.isDir(path.join(source, options['folder']))) {
				return 'An folder with the same name exists in this folder';
			}

			if (!region) {
				return 'AWS region is missing. please specify with --region';
			}

			/*if (!options['stripe'] || !options['braintree']) {
				return 'Payment provider flag is missing. please specify either "--stripe" or "--braintree"';
			}*/
		},
		generateProject = function (projectPath) {
			let prepareFolder = options['folder'] ? fsUtil.makeDir(projectPath) : Promise.resolve()

			return prepareFolder
				.then(() => fsUtil.copy(path.join(__dirname, '../app-templates/stripe/index.js'), path.join(projectPath, 'index.js')))
				.then(() => commandUtil.genPackage(projectPath, region, false, path.join(__dirname, '../app-templates/stripe/package.json')))
				.then(() => {
					console.log('success')
					return Promise.resolve()
				})
		};

	if (validationError()){
		return Promise.reject(validationError());
	}

	return generateProject(projectPath)
}