import { SquareClient, SquareEnvironment } from 'square';

let _client = null;

const getSquareClient = () => {
  if (!_client) {
    _client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
    });
  }
  return _client;
};

export default getSquareClient;
