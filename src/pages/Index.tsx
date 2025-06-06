
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, Calculator, FileText, Users } from "lucide-react";
import SalaryForm from "@/components/SalaryForm";
import SalaryTable from "@/components/SalaryTable";
import CashBreakdown from "@/components/CashBreakdown";
import { SalaryData } from "@/types/salary";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [salaries, setSalaries] = useState<SalaryData[]>([]);
  const [csvInput, setCsvInput] = useState("");
  const { toast } = useToast();

  const handleCsvSubmit = () => {
    try {
      // Process CSV input
      const rawValues = csvInput.split(",").map(val => val.trim());
      const validNumbers = rawValues
        .filter(val => val !== "")
        .map(val => {
          const num = Number(val);
          if (isNaN(num)) {
            throw new Error(`ไม่สามารถแปลงเป็นตัวเลขได้: ${val}`);
          }
          return num;
        });

      if (validNumbers.length === 0) {
        toast({
          title: "ไม่พบข้อมูล",
          description: "กรุณาใส่ข้อมูลเงินเดือนในรูปแบบ CSV",
          variant: "destructive",
        });
        return;
      }

      // Create salary data with rounded values
      const newSalaries = validNumbers.map((amount, index) => {
        const roundedAmount = roundAmount(amount);
        return {
          id: `emp-${Date.now()}-${index}`,
          original: amount,
          rounded: roundedAmount,
          breakdown: calculateBanknoteBreakdown(roundedAmount),
        };
      });

      setSalaries(newSalaries);
      setCsvInput("");
      toast({
        title: "นำเข้าข้อมูลสำเร็จ",
        description: `นำเข้าข้อมูลเงินเดือน ${newSalaries.length} รายการ`,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบรูปแบบ CSV",
        variant: "destructive",
      });
    }
  };
  const roundAmount = (amount: number): number => {
  const lastDigit = amount % 10;
  const base = amount - lastDigit;

  let rounded: number;

  if (lastDigit <= 2) {
    rounded = base; // round down to 0
  } else if (lastDigit <= 4) {
    rounded = base + 5; // round up to 5
  } else if (lastDigit <= 7) {
    rounded = base + 5; // round down to 5
  } else {
    rounded = base + 10; // round up to next 10
  }

  console.log(`Rounding ${amount}: lastDigit=${lastDigit}, rounded=${rounded}`);
  return rounded;
};

  // // Round according to new rules - fixed logic
  // const roundAmount = (amount: number): number => {
  //   const wholePart = Math.floor(amount);
  //   const decimalPart = amount - wholePart;
  //   const lastDigit = Math.round(decimalPart * 100) % 10; // Get the last digit of cents
  //   const secondLastDigit = Math.floor((decimalPart * 100) % 100 / 10); // Get second last digit
    
  //   console.log(`Rounding ${amount}: wholePart=${wholePart}, lastDigit=${lastDigit}, secondLastDigit=${secondLastDigit}`);
    
  //   // Look at the last digit only for rounding decision
  //   if (lastDigit >= 8) {
  //     // Round up to next 10
  //     const result = wholePart + Math.ceil((secondLastDigit + 1) / 10) * 10 - secondLastDigit;
  //     console.log(`Rounded to: ${result}`);
  //     return result;
  //   } else if (lastDigit >= 3) {
  //     // Round to 5
  //     const result = wholePart + secondLastDigit + 5 - (secondLastDigit % 10);
  //     console.log(`Rounded to: ${result}`);
  //     return result;
  //   } else {
  //     // Round down to 0
  //     const result = wholePart + secondLastDigit;
  //     console.log(`Rounded to: ${result}`);
  //     return result;
  //   }
  // };

  // Calculate banknote breakdown - fixed to handle whole numbers properly
  const calculateBanknoteBreakdown = (amount: number) => {
    console.log(`Calculating breakdown for: ${amount}`);
    
    // Work with whole numbers only since we don't use 0.5 baht coins
    let remainingAmount = Math.round(amount);
    
    const denominations = [
      { value: 1000, key: '1000' },
      { value: 500, key: '500' },
      { value: 100, key: '100' },
      { value: 50, key: '50' },
      { value: 20, key: '20' },
      { value: 10, key: '10' },
      { value: 5, key: '5' },
    ];
    
    const result = {
      '1000': 0,
      '500': 0,
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
    };

    // Process each denomination
    for (const denom of denominations) {
      const count = Math.floor(remainingAmount / denom.value);
      if (count > 0) {
        result[denom.key as keyof typeof result] = count;
        remainingAmount -= count * denom.value;
        console.log(`${denom.key}: ${count} notes/coins, remaining: ${remainingAmount}`);
      }
    }
    
    console.log('Final breakdown:', result);
    return result;
  };

  const handleAddSalary = (salary: number) => {
    const roundedAmount = roundAmount(salary);
    const newSalary: SalaryData = {
      id: `emp-${Date.now()}`,
      original: salary,
      rounded: roundedAmount,
      breakdown: calculateBanknoteBreakdown(roundedAmount),
    };

    setSalaries(prev => [...prev, newSalary]);
    toast({
      title: "เพิ่มเงินเดือนสำเร็จ",
      description: `เพิ่มเงินเดือน ${salary.toFixed(2)} บาท`,
    });
  };

  const handleReset = () => {
    setSalaries([]);
    setCsvInput("");
    toast({
      title: "รีเซ็ตข้อมูล",
      description: "ลบข้อมูลเงินเดือนทั้งหมดแล้ว",
    });
  };

  // Calculate totals correctly
  const originalTotal = salaries.reduce((sum, s) => sum + s.original, 0);
  const roundedTotal = salaries.reduce((sum, s) => sum + s.rounded, 0);
  const roundingDifference = roundedTotal - originalTotal;

  // Calculate total cash needed
  const totalCash = salaries.reduce((total, salary) => {
    return {
      '1000': total['1000'] + salary.breakdown['1000'],
      '500': total['500'] + salary.breakdown['500'],
      '100': total['100'] + salary.breakdown['100'],
      '50': total['50'] + salary.breakdown['50'],
      '20': total['20'] + salary.breakdown['20'],
      '10': total['10'] + salary.breakdown['10'],
      '5': total['5'] + salary.breakdown['5'],
    };
  }, {
    '1000': 0,
    '500': 0,
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-200/50">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Banknote className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                  ระบบเบิกเงินสดเงินเดือน
                </h1>
                <p className="text-gray-600 mt-1">คำนวณและแยกธนบัตรอัตโนมัติ</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="csv" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/70 backdrop-blur-sm border border-blue-200">
            <TabsTrigger value="csv" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              <span>นำเข้า CSV</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span>เพิ่มรายบุคคล</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <Card className="p-8 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-blue-800">
                <FileText className="mr-3 h-6 w-6" />
                นำเข้าข้อมูลเงินเดือน CSV
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="csv-input" className="block text-sm font-medium text-gray-700 mb-2">
                    ข้อมูล CSV (เช่น 4522, 5222, 6548, 2134, 4444)
                  </label>
                  <Textarea
                    id="csv-input"
                    placeholder="ใส่ตัวเลขคั่นด้วยเครื่องหมายคอมม่า (,)"
                    value={csvInput}
                    onChange={e => setCsvInput(e.target.value)}
                    className="h-40 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <Button 
                  onClick={handleCsvSubmit} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg shadow-lg transition-all duration-200"
                >
                  นำเข้าข้อมูล
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card className="p-8 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-blue-800">
                <Users className="mr-3 h-6 w-6" />
                เพิ่มข้อมูลเงินเดือนรายบุคคล
              </h2>
              <SalaryForm onSubmit={handleAddSalary} />
            </Card>
          </TabsContent>
        </Tabs>

        {salaries.length > 0 && (
          <div className="mt-12 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
                <Calculator className="h-8 w-8 mr-3 text-blue-600" />
                รายการเงินเดือน 
                <span className="ml-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-lg font-medium shadow-lg">
                  {salaries.length} รายการ
                </span>
              </h2>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 px-6 py-3"
              >
                รีเซ็ตข้อมูล
              </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-8 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                <h3 className="text-xl font-medium mb-6 text-blue-800 pb-3 border-b border-blue-200">
                  สรุปจำนวนธนบัตร/เหรียญที่ต้องใช้
                </h3>
                <CashBreakdown breakdown={totalCash} totalAmount={roundedTotal} />
              </Card>
              
              <Card className="p-8 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                <h3 className="text-xl font-medium mb-6 text-blue-800 pb-3 border-b border-blue-200">
                  สรุปรายการ
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-600">จำนวนรายการ:</span>
                    <span className="font-bold text-gray-800">{salaries.length} รายการ</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-600">ยอดเงินก่อนปัดเศษ:</span>
                    <span className="font-bold text-gray-800">{originalTotal.toFixed(2)} บาท</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-600">ยอดเงินหลังปัดเศษ:</span>
                    <span className="font-bold text-blue-600">{roundedTotal.toFixed(2)} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ส่วนต่างการปัดเศษ:</span>
                    <span className={`font-bold ${roundingDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {roundingDifference > 0 ? '+' : ''}{roundingDifference.toFixed(2)} บาท
                    </span>
                  </div>
                </div>
              </Card>
            </div>
            
            <Card className="overflow-hidden shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <h3 className="text-xl font-medium">รายละเอียดรายการทั้งหมด</h3>
              </div>
              <SalaryTable salaries={salaries} />
            </Card>
          </div>
        )}
      </main>
      
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-200/50 py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} ระบบเบิกเงินสดเงินเดือน
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
