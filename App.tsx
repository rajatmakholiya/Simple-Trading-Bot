import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Terminal as TerminalIcon, ShieldCheck, PlayCircle, Zap } from 'lucide-react';
import { MarketData, OrderSide, OrderType, LogEntry, Trade } from './types';
import Terminal from './components/Terminal';
import OrderForm from './components/OrderForm';
import ChartWidget from './components/ChartWidget';
import { connectToBinanceStream } from './services/binanceService';
import { analyzeMarketTrend, generatePythonCode } from './services/geminiService';

const SYMBOL = 'BTCUSDT';
const MAX_DATA_POINTS = 50;

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const marketDataRef = useRef<MarketData[]>([]);

  // Logging Utility
  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  // Initialize
  useEffect(() => {
    addLog('INFO', 'Initializing Binance Testnet Controller...');
    addLog('INFO', `Connecting to WebSocket stream for ${SYMBOL}...`);
    
    // Connect to WebSocket
    const cleanup = connectToBinanceStream(SYMBOL, (price) => {
      const newDataPoint = { time: Date.now(), price };
      
      setMarketData(prev => {
        const updated = [...prev, newDataPoint].slice(-MAX_DATA_POINTS);
        marketDataRef.current = updated; // Keep ref updated for async access
        return updated;
      });
      
      // Basic order matching logic (Paper Trading)
      setTrades(currentTrades => {
         return currentTrades.map(trade => {
            if (trade.status === 'OPEN') {
               if (trade.type === OrderType.MARKET) {
                   // Market orders fill instantly at current price
                   addLog('SUCCESS', `Market Order FILLED: ${trade.side} ${trade.quantity} @ ${price}`);
                   return { ...trade, status: 'FILLED', price: price };
               } else if (trade.type === OrderType.LIMIT) {
                   // Simple limit matching
                   if ((trade.side === OrderSide.BUY && price <= trade.price) || 
                       (trade.side === OrderSide.SELL && price >= trade.price)) {
                        addLog('SUCCESS', `Limit Order FILLED: ${trade.side} ${trade.quantity} @ ${trade.price}`);
                        return { ...trade, status: 'FILLED' };
                   }
               }
            }
            return trade;
         });
      });
    });

    return () => cleanup();
  }, [addLog]);

  // Handle Order Placement
  const handlePlaceOrder = (side: OrderSide, type: OrderType, quantity: number, price?: number) => {
    const currentPrice = marketDataRef.current[marketDataRef.current.length - 1]?.price || 0;
    const executionPrice = type === OrderType.MARKET ? currentPrice : (price || currentPrice);
    
    addLog('INFO', `Sending order: ${side} ${quantity} ${SYMBOL} (${type})`);
    
    // Simulate API Latency
    setTimeout(() => {
      const newTrade: Trade = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: SYMBOL,
        side,
        type,
        quantity,
        price: executionPrice,
        timestamp: Date.now(),
        status: 'OPEN'
      };

      setTrades(prev => [newTrade, ...prev]);
      
      if (type === OrderType.MARKET) {
         // Log success immediately for market orders (filled in next tick effectively)
         // But purely for UI feedback:
         addLog('INFO', `Order accepted by matching engine. ID: ${newTrade.id}`);
      } else {
         addLog('INFO', `Limit order active. Waiting for trigger price ${executionPrice}...`);
      }
    }, 300);
  };

  // Handle AI Analysis
  const handleAnalyze = async () => {
    if (marketData.length < 10) {
      addLog('WARN', 'Insufficient data for analysis. Collecting more price points...');
      return;
    }
    
    setIsAnalyzing(true);
    addLog('INFO', 'Requesting market analysis from Gemini 2.5 Flash...');
    
    const result = await analyzeMarketTrend(SYMBOL, marketDataRef.current);
    setAiAnalysis(result);
    addLog('SUCCESS', 'Analysis received.');
    setIsAnalyzing(false);
  };

  // Handle Code Generation
  const handleGenerateCode = async (side: OrderSide, type: OrderType, quantity: number, price?: number) => {
    setIsAnalyzing(true);
    addLog('INFO', 'Generating Python-Binance code via Gemini...');
    const code = await generatePythonCode(SYMBOL, side, type, quantity, price);
    setGeneratedCode(code);
    addLog('SUCCESS', 'Code snippet generated.');
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Zap className="text-yellow-400 fill-yellow-400" />
              Binance Testnet AI Trader
            </h1>
            <p className="text-slate-400 mt-1">Paper Trading Environment & Strategy Simulator</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-700/50 rounded-full">
            <ShieldCheck size={16} className="text-green-400" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">System Operational</span>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Chart & Logs */}
          <div className="lg:col-span-2 space-y-6">
            <ChartWidget data={marketData} symbol={SYMBOL} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order History */}
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-64 flex flex-col">
                <h3 className="text-sm font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                  <Activity size={16} /> Active Orders
                </h3>
                <div className="flex-1 overflow-y-auto pr-1">
                   {trades.length === 0 ? (
                     <div className="h-full flex items-center justify-center text-slate-600 text-sm">No active orders</div>
                   ) : (
                     <div className="space-y-2">
                       {trades.map(trade => (
                         <div key={trade.id} className="bg-slate-800 p-2 rounded border border-slate-700 flex justify-between items-center text-xs">
                           <div>
                              <span className={`font-bold ${trade.side === OrderSide.BUY ? 'text-green-400' : 'text-red-400'}`}>{trade.side}</span>
                              <span className="ml-2 text-slate-300">{trade.quantity} BTC</span>
                              <div className="text-slate-500 mt-0.5">@{trade.price.toFixed(2)} ({trade.type})</div>
                           </div>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                             trade.status === 'FILLED' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                           }`}>
                             {trade.status}
                           </span>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>

              {/* Terminal */}
              <Terminal logs={logs} />
            </div>
          </div>

          {/* Right Column: Controls & AI */}
          <div className="space-y-6">
            <OrderForm 
              currentPrice={marketData.length > 0 ? marketData[marketData.length - 1].price : 0} 
              onPlaceOrder={handlePlaceOrder}
              onGenerateCode={handleGenerateCode}
              isGenerating={isAnalyzing}
            />

            {/* AI Advisor Panel */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
               <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 border-b border-indigo-500/30 flex justify-between items-center">
                 <h2 className="text-white font-semibold flex items-center gap-2">
                   <PlayCircle size={18} className="text-indigo-400" />
                   Gemini Market Analyst
                 </h2>
                 <button 
                   onClick={handleAnalyze} 
                   disabled={isAnalyzing}
                   className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                 >
                   {isAnalyzing ? 'Thinking...' : 'Analyze Trend'}
                 </button>
               </div>
               <div className="p-4 min-h-[120px] text-sm text-slate-300 leading-relaxed">
                 {aiAnalysis ? (
                   <p className="animate-in fade-in duration-500">{aiAnalysis}</p>
                 ) : (
                   <p className="text-slate-500 italic">Click analyze to get AI insights on the current {SYMBOL} price action.</p>
                 )}
               </div>
            </div>

            {/* Code Generation Output */}
             {generatedCode && (
              <div className="bg-slate-950 rounded-lg border border-slate-800 shadow-xl overflow-hidden">
                 <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">generated_script.py</span>
                    <button 
                      onClick={() => setGeneratedCode(null)}
                      className="text-xs text-slate-500 hover:text-white"
                    >
                      Close
                    </button>
                 </div>
                 <pre className="p-4 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap max-h-[300px] custom-scrollbar">
                   {generatedCode}
                 </pre>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;