import React, { useState } from 'react';
import { OrderSide, OrderType } from '../types';
import { Bot, Code } from 'lucide-react';
import clsx from 'clsx';

interface OrderFormProps {
  currentPrice: number;
  onPlaceOrder: (side: OrderSide, type: OrderType, quantity: number, price?: number) => void;
  onGenerateCode: (side: OrderSide, type: OrderType, quantity: number, price?: number) => void;
  isGenerating: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ currentPrice, onPlaceOrder, onGenerateCode, isGenerating }) => {
  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const [type, setType] = useState<OrderType>(OrderType.MARKET);
  const [quantity, setQuantity] = useState<string>('0.001');
  const [price, setPrice] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const p = type !== OrderType.MARKET ? parseFloat(price) : undefined;
    
    if (qty > 0) {
      onPlaceOrder(side, type, qty, p);
    }
  };

  const handleGenerate = () => {
     const qty = parseFloat(quantity);
     const p = type !== OrderType.MARKET ? parseFloat(price) : undefined;
     onGenerateCode(side, type, qty, p);
  }

  // Auto-fill price if empty and Limit is selected
  React.useEffect(() => {
    if (type === OrderType.LIMIT && !price && currentPrice > 0) {
      setPrice(currentPrice.toString());
    }
  }, [type, currentPrice, price]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-xl">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Bot size={20} className="text-indigo-400" />
        Bot Configuration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSide(OrderSide.BUY)}
            className={clsx(
              "py-2 px-4 rounded-md text-sm font-bold transition-all",
              side === OrderSide.BUY 
                ? "bg-green-600 text-white shadow-lg" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            BUY / LONG
          </button>
          <button
            type="button"
            onClick={() => setSide(OrderSide.SELL)}
            className={clsx(
              "py-2 px-4 rounded-md text-sm font-bold transition-all",
              side === OrderSide.SELL 
                ? "bg-red-600 text-white shadow-lg" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            SELL / SHORT
          </button>
        </div>

        {/* Order Type */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium">Order Type</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as OrderType)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value={OrderType.MARKET}>Market</option>
            <option value={OrderType.LIMIT}>Limit</option>
            <option value={OrderType.STOP_LIMIT}>Stop Limit</option>
          </select>
        </div>

        {/* Quantity */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium">Quantity (BTC)</label>
          <input
            type="number"
            step="0.001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono"
          />
        </div>

        {/* Price (Conditional) */}
        {(type === OrderType.LIMIT || type === OrderType.STOP_LIMIT) && (
          <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs text-slate-400 font-medium">Limit Price (USDT)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono"
            />
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 grid grid-cols-5 gap-2">
           <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="col-span-1 bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-md font-medium transition-colors flex items-center justify-center border border-slate-600"
            title="Generate Python Code"
          >
            <Code size={18} />
          </button>
          <button
            type="submit"
            className={clsx(
              "col-span-4 p-3 rounded-md font-bold text-white transition-all shadow-lg active:scale-[0.98]",
              side === OrderSide.BUY ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"
            )}
          >
            {type === OrderType.MARKET ? 'Market' : 'Place'} {side}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;