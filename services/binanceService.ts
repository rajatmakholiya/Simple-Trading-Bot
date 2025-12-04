// Simple WebSocket service for Binance Public Streams
// We use the aggregated trade stream for real-time price updates

type PriceCallback = (price: number) => void;

let ws: WebSocket | null = null;

export const connectToBinanceStream = (symbol: string, onPriceUpdate: PriceCallback) => {
  if (ws) {
    ws.close();
  }

  // Binance Futures Testnet WebSocket URL or Mainnet (Testnet streams are sometimes flaky, we'll use Mainnet for reliable data visualization in this demo)
  // NOTE: For a true testnet bot, we would use wss://stream.binancefuture.com/ws/${symbol.toLowerCase()}@aggTrade
  // But often testnet volumes are zero, making the chart look dead.
  // We will use MAINNET for DATA, but simulate orders locally.
  const endpoint = `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@aggTrade`;

  ws = new WebSocket(endpoint);

  ws.onopen = () => {
    console.log(`Connected to Binance stream for ${symbol}`);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // 'p' is the price in the aggTrade stream
      if (data && data.p) {
        onPriceUpdate(parseFloat(data.p));
      }
    } catch (err) {
      console.error("WebSocket Parse Error", err);
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket Error", err);
  };

  return () => {
    if (ws) {
      ws.close();
    }
  };
};
