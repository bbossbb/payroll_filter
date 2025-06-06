
import { BanknoteBreakdown } from "@/types/salary";

interface CashBreakdownProps {
  breakdown: BanknoteBreakdown;
  totalAmount: number;
}

// Thai baht descriptions for denominations
const denominationDescriptions: Record<string, { type: string; color: string; bgColor: string; borderColor: string }> = {
  '1000': { type: 'ธนบัตร', color: 'bg-red-500', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
  '500': { type: 'ธนบัตร', color: 'bg-purple-500', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
  '100': { type: 'ธนบัตร', color: 'bg-amber-500', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
  '50': { type: 'ธนบัตร', color: 'bg-blue-500', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
  '20': { type: 'ธนบัตร', color: 'bg-green-500', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
  '10': { type: 'เหรียญ', color: 'bg-orange-500', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
  '5': { type: 'เหรียญ', color: 'bg-gray-500', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
};

const CashBreakdown = ({ breakdown, totalAmount }: CashBreakdownProps) => {
  // Total number of banknotes/coins
  const totalItems = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
  
  // Calculate the total value of cash
  const totalCashValue = Object.entries(breakdown).reduce((sum, [denom, count]) => {
    return sum + (Number(denom) * count);
  }, 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">จำนวนเงินรวม</p>
          <p className="text-2xl font-bold text-gray-800">{totalAmount.toFixed(2)} บาท</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">จำนวนธนบัตร/เหรียญรวม</p>
          <p className="text-2xl font-bold text-gray-800">{totalItems} ใบ/เหรียญ</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(breakdown).map(([denom, count]) => {
          if (count === 0) return null;
          
          const { type, color, bgColor, borderColor } = denominationDescriptions[denom];
          const totalValue = Number(denom) * count;
          const percentage = (count / totalItems) * 100;
          
          return (
            <div key={denom} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-12 ${bgColor} rounded-md flex items-center justify-center border ${borderColor}`}>
                  <span className="font-bold text-gray-800">{denom}฿</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-700">{type} {denom} บาท</span>
                    <span className="text-gray-600">{count} ใบ/เหรียญ</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${color}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{percentage.toFixed(1)}% ของจำนวนใบทั้งหมด</span>
                    <span className="font-medium text-gray-700">{totalValue.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-2">
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">รวมมูลค่าธนบัตรและเหรียญ:</span>
          <span className="font-bold text-blue-600">{totalCashValue.toLocaleString()} บาท</span>
        </div>
      </div>
    </div>
  );
};

export default CashBreakdown;
