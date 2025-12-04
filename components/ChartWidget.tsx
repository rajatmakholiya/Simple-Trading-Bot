import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MarketData } from '../types';

interface ChartWidgetProps {
  data: MarketData[];
  symbol: string;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ data, symbol }) => {
  const latestPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const startPrice = data.length > 0 ? data[0].price : 0;
  const isPositive = latestPrice >= startPrice;

  const color = isPositive ? "#22c55e" : "#ef4444"; // Green or Red

  return (
    <div className="h-[300px] w-full bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-xl flex flex-col">
      <div className="flex justify-between items-baseline mb-4">
        <div>
           <h2 className="text-xl font-bold text-white">{symbol}</h2>
           <span className="text-xs text-slate-400">Perpetual Futures</span>
        </div>
        <div className="text-right">
           <div className={`text-2xl font-mono font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
             ${latestPrice.toFixed(2)}
           </div>
           <div className="text-xs text-slate-500">Live Data</div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="time" 
              hide={true} 
            />
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right" 
              tick={{fill: '#94a3b8', fontSize: 12}}
              tickFormatter={(value) => value.toFixed(1)}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '4px'}}
              itemStyle={{color: '#e2e8f0'}}
              labelStyle={{display: 'none'}}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartWidget;