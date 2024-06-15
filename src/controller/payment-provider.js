const { Router } = require('express');
const handleAsync = require('../util/handle-async');

class PaymentProviderController {
    constructor(paymentProviderService) {
        this.paymentProviderService = paymentProviderService;
        this.router = Router();
        this.initRouter();
    }

    initRouter() {
        this.router.get('/attributes', handleAsync(this.getAttributeList.bind(this)));
        this.router.get('/channel-data', handleAsync(this.fetchChannelData.bind(this)));
        this.router.post('/channel-policy', handleAsync(this.upsertChannelPolicy.bind(this)));
        this.router.get('/history', handleAsync(this.fetchHistory.bind(this)));
    }

    getRouter() {
        return this.router;
    }

    async getAttributeList(req, res) {
        const attributeList = await this.paymentProviderService.fetchAttributes();
        return res.status(200).json(attributeList);
    }

    async fetchChannelData(req, res) {
        const channelData = await this.paymentProviderService.fetchChannelData();
        return res.status(200).json(channelData);
    }

    async upsertChannelPolicy(req, res) {
        const { policyName, policyValue, operator } = req.body;
        await this.paymentProviderService.upsertChannelPolicy(policyName, policyValue, operator);
        return res.status(200).json({ message: 'Channel policy updated successfully' });
    }

    async fetchHistory(req, res) {
        const history = await this.paymentProviderService.fetchHistory();
        return res.status(200).json(history);
    }
}

module.exports = PaymentProviderController;
