const fs = require('fs');
const file = 'src/Components/AdminPanelComponents/GameStats.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
function UnifiedDashboardPanel({ row, inModal, onOpenModal }: { row: RoundRow, inModal: boolean, onOpenModal?: () => void }) {
  if (!row.fullStats) return null;
  const tot = row.totalBetAmount || 1;

  // Highest Liability / Max Risk
  let houseProfits = Object.entries(row.fullStats.profitLossByNumber || {}).map(([n, d]) => ({ num: n, profit: d.profit, payout: d.payout }));
  houseProfits.sort((a,b) => a.profit - b.profit); // lowest profit (max loss) first
  
  const mostFavoredNo = [...Object.entries(row.fullStats.totalByNumber || {})].sort((a,b) => b[1].amount - a[1].amount)[0] || ['-', {amount: 0}];
  const hotColor = [...Object.entries(row.fullStats.totalByColor || {})].sort((a,b) => b[1].amount - a[1].amount)[0] || ['-', {amount: 0}];
  const hotSize = [...Object.entries(row.fullStats.totalBySize || {})].sort((a,b) => b[1].amount - a[1].amount)[0] || ['-', {amount: 0}];

  const amounts = {
    Red: row.fullStats.totalByColor?.['Red']?.amount || 0,
    Green: row.fullStats.totalByColor?.['Green']?.amount || 0,
    Violet: row.fullStats.totalByColor?.['Violet']?.amount || 0
  };
  const sizeAmounts = {
    Big: getSizeBucket(row.fullStats.totalBySize, "Big").amount,
    Small: getSizeBucket(row.fullStats.totalBySize, "Small").amount
  };

  const getPct = (val: number) => ((val/tot)*100).toFixed(1);
  const fmt = (val: number) => val >= 100000 ? (val/1000).toFixed(1) + 'k' : val.toLocaleString('en-IN', {maximumFractionDigits: 0});

  let numOffset = 0, colorOffset = 0, sizeOffset = 0;

  return (
    <div className={\`flex flex-col h-full \${!inModal ? 'p-6 transition-all duration-300 ease-linear overflow-hidden' : 'p-6 overflow-y-auto w-full custom-scrollbar flex-1 bg-gray-50/30'}\`}>
      {!inModal && onOpenModal && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-bold text-sm">Quick Overview</h3>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenModal(); }}
            className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            Open Full Screen Charts
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-full">
        {/* Unified Mega Pie Chart */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm ring-1 ring-black/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-70 z-0 pointer-events-none"></div>
          <h3 className="absolute top-4 left-5 text-base font-bold text-gray-800 flex items-center gap-2 z-10 w-full">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path></svg>
            Omni Distribution Engine
          </h3>
          
          <div className="relative w-72 h-72 z-10 mt-8 group flex items-center justify-center">
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm">Total Pool</span>
               <span className="text-2xl font-black text-gray-800 leading-none mt-1 drop-shadow-sm">₹{fmt(row.totalBetAmount)}</span>
            </div>

            <svg viewBox="-10 -10 220 220" className="w-full h-full transform -rotate-90 filter drop-shadow-md">
              {/* Size Ring (Inner) - Radius 40 - Circ 251.3 */}
              <circle cx="100" cy="100" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
              {['Big', 'Small'].map(s => {
                 const am = sizeAmounts[s as keyof typeof sizeAmounts] || 0;
                 const pct = (am / tot);
                 const dashArray = pct * 251.32;
                 const circle = (
                   <circle key={s} cx="100" cy="100" r="40" fill="transparent" 
                     stroke={s==='Big'?'#eab308':'#60a5fa'} strokeWidth="12"
                     strokeDasharray={\`\${dashArray} \${251.32 - dashArray}\`} strokeDashoffset={-sizeOffset}
                     className="transition-all duration-1000 ease-out hover:stroke-width-[16px] cursor-pointer"
                   ><title>{s}: ₹{am} ({getPct(am)}%)</title></circle>
                 );
                 sizeOffset += dashArray;
                 return circle;
              })}

              {/* Color Ring (Middle) - Radius 60 - Circ 377.0 */}
              <circle cx="100" cy="100" r="60" fill="transparent" stroke="#f3f4f6" strokeWidth="16" />
              {['Red', 'Green', 'Violet'].map(c => {
                 const am = amounts[c as keyof typeof amounts] || 0;
                 const pct = (am / tot);
                 const dashArray = pct * 376.99;
                 const circle = (
                   <circle key={c} cx="100" cy="100" r="60" fill="transparent" 
                     stroke={c==='Red'?'#ef4444':c==='Green'?'#22c55e':'#a855f7'} strokeWidth="16"
                     strokeDasharray={\`\${dashArray} \${376.99 - dashArray}\`} strokeDashoffset={-colorOffset}
                     className="transition-all duration-1000 ease-out hover:stroke-width-[20px] cursor-pointer"
                   ><title>{c}: ₹{am} ({getPct(am)}%)</title></circle>
                 );
                 colorOffset += dashArray;
                 return circle;
              })}

              {/* Number Ring (Outer) - Radius 85 - Circ 534.1 */}
              <circle cx="100" cy="100" r="85" fill="transparent" stroke="#f3f4f6" strokeWidth="20" />
              {[0,1,2,3,4,5,6,7,8,9].map(n => {
                 const am = row.fullStats!.totalByNumber?.[n.toString()]?.amount || 0;
                 const pct = (am / tot);
                 const dashArray = pct * 534.07;
                 // Assign varying shades of green/teal based on number to make it look cool, or just slate
                 const colors = ['#0f172a','#1e293b','#334155','#475569','#64748b','#94a3b8','#cbd5e1','#f1f5f9','#14b8a6','#0f766e'];
                 const circle = (
                   <circle key={n} cx="100" cy="100" r="85" fill="transparent" 
                     stroke={colors[n]} strokeWidth="20"
                     strokeDasharray={\`\${dashArray} \${534.07 - dashArray}\`} strokeDashoffset={-numOffset}
                     className="transition-all duration-1000 ease-out fill-transparent hover:stroke-width-[24px] cursor-pointer"
                   ><title>No.{n}: ₹{am} ({getPct(am)}%)</title></circle>
                 );
                 numOffset += dashArray;
                 return circle;
              })}
            </svg>
          </div>

          {/* Legend Bottom */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 z-10 scale-90">
             <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-100"><div className="w-2 h-2 bg-yellow-500 rounded"></div><span className="text-[10px] font-bold">Inner: Size</span></div>
             <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-100"><div className="w-2 h-2 bg-green-500 rounded"></div><span className="text-[10px] font-bold">Mid: Color</span></div>
             <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-100"><div className="w-2 h-2 bg-slate-600 rounded"></div><span className="text-[10px] font-bold">Outer: Number</span></div>
          </div>
        </div>

        {/* Intelligence / Analytics Panel (Creative Stats) */}
        <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col ring-1 ring-black/5 relative overflow-hidden text-gray-800">
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-50 rounded-full blur-3xl opacity-60 z-0"></div>
           <h3 className="text-sm font-bold border-b border-gray-100 pb-2 mb-3 flex items-center gap-1.5 z-10"><svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Active Analytics</h3>
           
           <div className="flex flex-col gap-3 z-10 overflow-y-auto custom-scrollbar flex-1 pr-1">
             <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex justify-between items-center group hover:bg-white transition-colors hover:shadow-sm">
                <span className="text-[11px] font-semibold text-gray-500">Highest Liability No.</span>
                <span className="font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded shadow-inner text-xs">{houseProfits[0]?.num ?? '-'}</span>
             </div>
             <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex justify-between items-center group hover:bg-white transition-colors hover:shadow-sm">
                <span className="text-[11px] font-semibold text-gray-500">Max Est. House Loss</span>
                <span className="font-black text-rose-600 text-xs">{(houseProfits[0]?.profit < 0 ? \`-\₹\${fmt(Math.abs(houseProfits[0].profit))}\` : 'None')}</span>
             </div>
             <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex justify-between items-center group hover:bg-white transition-colors hover:shadow-sm">
                <span className="text-[11px] font-semibold text-gray-500">Max Est. House Profit</span>
                <span className="font-black text-green-600 text-xs">{(houseProfits[houseProfits.length-1]?.profit > 0 ? \`+\₹\${fmt(houseProfits[houseProfits.length-1].profit)}\` : 'None')}</span>
             </div>
             <div className="h-px bg-gray-100 my-1"></div>
             <div className="flex items-center gap-3">
               <div className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 p-2.5 rounded-lg border border-indigo-100/50 hover:shadow-md transition-shadow">
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Hot Number</span>
                  <span className="text-xl font-black text-indigo-700 leading-none">{mostFavoredNo[0]}</span>
                  <span className="block text-[10px] text-gray-500 mt-1 font-semibold truncate">₹{fmt(mostFavoredNo[1]?.amount || 0)}</span>
               </div>
               <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 p-2.5 rounded-lg border border-purple-100/50 hover:shadow-md transition-shadow">
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-purple-400 mb-1">Hot Color</span>
                  <div className="flex items-center gap-1">
                    <div className={\`w-2.5 h-2.5 rounded-full shadow-sm \${hotColor[0]==='Red'?'bg-red-500':hotColor[0]==='Green'?'bg-green-500':'bg-purple-500'}\`}></div>
                    <span className="text-sm font-black text-purple-700 leading-none">{hotColor[0]}</span>
                  </div>
                  <span className="block text-[10px] text-gray-500 mt-1.5 font-semibold truncate">₹{fmt(hotColor[1]?.amount || 0)}</span>
               </div>
             </div>
           </div>
        </div>

        {/* Existing Result Projections / Risk Profiler */}
        <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[380px] ring-1 ring-black/5">
          <div className="flex flex-col gap-2 mb-3 border-b border-gray-100 pb-2 flex-shrink-0">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              Payout Projections
            </h3>
            {row.winningNumber !== undefined && row.winningNumber !== null && (
              <div className="flex items-center gap-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-500">Winner:</span>
                <span className="font-black text-xl text-gray-800 leading-none">{row.winningNumber}</span>
                <div className="flex gap-1 ml-1 cursor-default">
                  {row.winningColor?.map(c => (
                    <span key={c} title={c} className={\`w-3 h-3 rounded-full shadow-sm \${c.toLowerCase() === 'red' ? 'bg-red-500' : c.toLowerCase() === 'green' ? 'bg-green-500' : 'bg-purple-500'}\`}></span>
                  ))}
                </div>
                <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded shadow-sm ml-auto tracking-widest">{row.winningSize}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 flex-1 min-h-0 custom-scrollbar pb-1">
            {Object.entries(row.fullStats.profitLossByNumber || {}).sort((a,b) => Number(a[0]) - Number(b[0])).map(([num, data]) => (
              <div key={num} className={\`border \${row.winningNumber === Number(num) ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-sm' : 'border-gray-100 bg-white'} rounded-xl p-2 flex flex-col items-center hover:shadow-md transition-all h-full justify-between\`}>
                <div className="flex gap-1 mb-0.5 items-center w-full justify-center">
                  <span className="text-xl font-black text-gray-900 leading-none">{num}</span>
                  <div className="flex flex-col gap-0.5 ml-1">
                    {data.colors.map((c: string, i: number) => (
                      <div key={i} className={\`w-1.5 h-1.5 rounded-full \${c === 'Red' ? 'bg-red-500' : c === 'Green' ? 'bg-green-500' : 'bg-purple-500'}\`}></div>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase w-full text-center tracking-widest mb-1">{data.size}</span>
                <div className="mt-auto w-full flex flex-col gap-0.5 border-t border-gray-100 pt-1.5 bg-gray-50/50 -mx-2 -mb-2 px-2 pb-1.5 rounded-b-xl">
                  <div className="flex flex-col items-center justify-center w-full">
                    <span className="text-[8px] text-gray-500 font-medium uppercase">Payout</span>
                    <span className="text-[9.5px] text-gray-700 font-bold truncate w-full text-center" title={\`₹\${data.payout.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`}>
                      ₹{fmt(data.payout)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center w-full mt-0.5">
                    <span className="text-[8px] text-gray-500 font-medium uppercase">Profit</span>
                    <span 
                      className={\`text-[10px] font-black truncate w-full text-center \${data.profit >= 0 ? 'text-green-600' : 'text-red-500'}\`}
                      title={\`\${data.profit > 0 ? '+' : ''}\${data.profit.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`}
                    >
                      {data.profit > 0 ? '+' : ''}{fmt(data.profit)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
         </div>
      </div>
    </div>
  );
}

export default function GameStats({ token: propToken }:`;

content = content.replace('export default function GameStats({ token: propToken }:', replacement);

fs.writeFileSync(file, content);
