const FabricClient = require('./lib/fabric-client');
const PaymentProviderController = require('./controller/payment-provider');
const PaymentProviderService = require('./service/payment-provider');

class Init {
    constructor(app) {
        this.app = app;

        this.FabricClient = new FabricClient();

        this.PaymentProviderService = new PaymentProviderService(this.FabricClient);

        this.PaymentProviderController = new PaymentProviderController(this.PaymentProviderService);
    }

    async setupService() {
        await this.FabricClient.init();
    }

    async setupRoutes() {
        await this.setupService();
        this.app.get(
            '/healthcheck',
            (_, res) => {
                res.status(200).send('Payment Provider Dapps is healthy! ');
            },
        );

        this.app.use('/payment-provider', this.PaymentProviderController.getRouter());
    }
}

module.exports = Init;
