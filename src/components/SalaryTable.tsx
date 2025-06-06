
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalaryData } from "@/types/salary";
import BanknoteDisplay from "./BanknoteDisplay";

interface SalaryTableProps {
  salaries: SalaryData[];
}

const SalaryTable = ({ salaries }: SalaryTableProps) => {
  if (salaries.length === 0) {
    return <p className="text-center py-8 text-gray-500">ไม่มีข้อมูลเงินเดือน</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-50">
            <TableHead className="w-[80px] font-medium text-blue-700">ลำดับ</TableHead>
            <TableHead className="font-medium text-blue-700">จำนวนเงินเดิม (บาท)</TableHead>
            <TableHead className="font-medium text-blue-700">จำนวนเงินหลังปัดเศษ (บาท)</TableHead>
            <TableHead className="font-medium text-blue-700">ส่วนต่าง (บาท)</TableHead>
            <TableHead className="text-right font-medium text-blue-700">รายละเอียดธนบัตร/เหรียญ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salaries.map((salary, index) => {
            const difference = salary.rounded - salary.original;
            return (
              <TableRow 
                key={salary.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{salary.original.toFixed(2)}</TableCell>
                <TableCell>{salary.rounded.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={difference > 0 ? "text-green-600" : difference < 0 ? "text-red-600" : "text-gray-500"}>
                    {difference > 0 ? "+" : ""}{difference.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <BanknoteDisplay breakdown={salary.breakdown} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalaryTable;
