'use strict';

/**
 * corp service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::corp.corp');
