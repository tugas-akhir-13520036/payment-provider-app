const { Gateway, Wallets } = require('fabric-network');
const FabricCAClient = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const CertAuthUtil = require('../util/cert-authority');

const {
    WALLET_PATH, CHANNEL, CHAINCODES, orgConfig,
} = require('./constant');
const logger = require('../../util/logger');

class FabricClient {
    constructor() {
        this.channelName = CHANNEL.DEFAULT;
        this.gateway = new Gateway();
    }

    async init() {
        const ccpPath = path.resolve(__dirname, orgConfig.ccpPath);
        const walletPath = path.join(process.cwd(), WALLET_PATH);

        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const caClient = CertAuthUtil.buildCAClient(FabricCAClient, ccp, orgConfig.caHostName);

        this.wallet = await Wallets.newFileSystemWallet(walletPath);

        logger.info('Enrolling Admin');
        await CertAuthUtil.enrollAdmin(caClient, this.wallet, orgConfig.mspId);

        logger.info('Registering and Enrolling User');
        await CertAuthUtil.registerAndEnrollUser(
            caClient,
            this.wallet,
            orgConfig.mspId,
            orgConfig.userId,
            orgConfig.affiliation,
        );

        logger.info('Connecting to Fabric gateway');
        await this.gateway.connect(ccp, {
            wallet: this.wallet,
            identity: orgConfig.userId,
            discovery: { enabled: true, asLocalhost: true },
        });
        this.network = await this.gateway.getNetwork(this.channelName);

        logger.info('Connected to Fabric gateway');

        logger.info('Creating Payment Channel');
        this.paymentChannelId = await this.createPaymentChannel();
        logger.info('Payment Channel created');
    }

    async getAttributes() {
        const contract = this.network.getContract(CHAINCODES.MERCHANT_ATTR);
        const result = await contract.submitTransaction('getAttributesList');
        return JSON.parse(result.toString());
    }

    async createPaymentChannel() {
        const uuid = uuidv4();
        const date = new Date().toISOString();

        const contract = this.network.getContract(CHAINCODES.CHANNEL_POLICY);
        const result = await contract.submitTransaction('createPaymentChannel', 'payment-provider1', uuid, date);
        return result.toString();
    }

    async fetchChannelData() {
        const contract = this.network.getContract(CHAINCODES.CHANNEL_POLICY);
        const result = await contract.submitTransaction('fetchChannelData', this.paymentChannelId);
        return JSON.parse(result.toString());
    }

    async upsertChannelPolicy(policyName, policyValue, operator) {
        const date = new Date().toISOString();
        const contract = this.network.getContract(CHAINCODES.CHANNEL_POLICY);
        await contract.submitTransaction('upsertChannelPolicy', this.paymentChannelId, policyName, policyValue, operator, date);
    }

    async fetchHistory() {
        const contract = this.network.getContract(CHAINCODES.CHANNEL_POLICY);
        const result = await contract.evaluateTransaction('queryHistory', this.paymentChannelId);
        return JSON.parse(result.toString());
    }
}

module.exports = FabricClient;
