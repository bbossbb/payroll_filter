
import { BanknoteBreakdown } from "@/types/salary";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BanknoteDisplayProps {
  breakdown: BanknoteBreakdown;
  showLabels?: boolean;
}

const BanknoteDisplay = ({ breakdown, showLabels = false }: BanknoteDisplayProps) => {
  // Order of denominations to display
  const denominationOrder = ['1000', '500', '100', '50', '20', '10', '5'] as const;
  
  // Colors for different denominations
  const denominationColors: Record<string, string> = {
    '1000': 'bg-red-100 text-red-800 border-red-200',
    '500': 'bg-purple-100 text-purple-800 border-purple-200',
    '100': 'bg-amber-100 text-amber-800 border-amber-200',
    '50': 'bg-blue-100 text-blue-800 border-blue-200',
    '20': 'bg-green-100 text-green-800 border-green-200',
    '10': 'bg-orange-100 text-orange-800 border-orange-200',
    '5': 'bg-gray-100 text-gray-800 border-gray-200',
  };

  // Count total banknotes/coins
  const totalItems = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {denominationOrder.map(denom => {
        const count = breakdown[denom];
        if (count <= 0) return null;
        
        return (
          <TooltipProvider key={denom}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  className={`${denominationColors[denom]} hover:opacity-80 transition-opacity border shadow-sm`}
                  variant="outline"
                >
                  {showLabels ? `${denom}฿: ` : ''}
                  {count} {showLabels ? 'ใบ' : `×${denom}฿`}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-sans">
                <p>จำนวน {denom} บาท {count} ใบ/เหรียญ</p>
                {totalItems > 0 && (
                  <p className="text-xs text-gray-500">
                    {((count / totalItems) * 100).toFixed(1)}% ของธนบัตร/เหรียญทั้งหมด
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default BanknoteDisplay;
