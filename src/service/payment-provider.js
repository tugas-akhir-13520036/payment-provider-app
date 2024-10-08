const logger = require('../util/logger');

class AdminService {
    constructor(fabricClient) {
        this.fabricClient = fabricClient;
    }

    async fetchAttributes() {
        logger.info('Fetching attributes');
        const res = await this.fabricClient.getAttributes();
        return res;
    }

    async fetchChannelData() {
        logger.info('Fetching channel data');
        const res = await this.fabricClient.fetchChannelData();
        return res;
    }

    async upsertChannelPolicy(policyName, policyValue, operator) {
        logger.info('Upserting channel policy');
        const res = await this.fabricClient.upsertChannelPolicy(policyName, policyValue, operator);
        return res;
    }

    async fetchHistory() {
        logger.info('Fetching history');
        const res = await this.fabricClient.fetchHistory();
        return res;
    }

    async deleteChannelPolicy(policyName) {
        logger.info('Deleting channel policy');
        const res = await this.fabricClient.deleteChannelPolicy(policyName);
        return res;
    }
}

module.exports = AdminService;
