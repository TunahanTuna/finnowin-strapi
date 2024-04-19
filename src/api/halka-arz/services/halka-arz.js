'use strict';

/**
 * halka-arz service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::halka-arz.halka-arz');
