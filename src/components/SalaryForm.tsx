
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface SalaryFormProps {
  onSubmit: (salary: number) => void;
}

const SalaryForm = ({ onSubmit }: SalaryFormProps) => {
  const [salary, setSalary] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numSalary = Number(salary);
    if (isNaN(numSalary) || numSalary <= 0) {
      toast({
        title: "ข้อมูลไม่ถูกต้อง",
        description: "กรุณาใส่จำนวนเงินที่มากกว่า 0",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(numSalary);
    setSalary("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
          จำนวนเงิน (บาท)
        </label>
        <div className="relative">
          <Input
            id="salary"
            type="number"
            step="0.01"
            placeholder="ใส่จำนวนเงินเดือน"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="pl-10 border-blue-200 focus:border-blue-500"
            required
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">฿</span>
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        เพิ่มข้อมูล
      </Button>
    </form>
  );
};

export default SalaryForm;
