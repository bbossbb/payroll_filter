import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, Calculator, FileText, Users, Printer, List } from "lucide-react";
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

  const handlePrintSummary = () => {
    const printContent = `
      <html>
        <head>
          <title>สรุปจำนวนธนบัตร/เหรียญที่ต้องใช้</title>
          <style>
            @media print {
              @page { 
                margin: 1.2cm; 
                size: A4;
              }
              body { 
                font-family: 'Sarabun', 'Arial', sans-serif; 
                margin: 0; 
                padding: 0;
                color: #1a202c;
                line-height: 1.3;
                background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
              }
              .container {
                max-width: 100%;
                margin: 0 auto;
                padding: 20px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 15px 30px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 25px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                color: white;
                position: relative;
                overflow: hidden;
              }
              .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 8px,
                  rgba(255,255,255,0.1) 8px,
                  rgba(255,255,255,0.1) 16px
                );
                animation: float 20s linear infinite;
              }
              @keyframes float {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
              }
              .header h1 {
                font-size: 24px;
                margin: 0 0 10px 0;
                font-weight: bold;
                position: relative;
                z-index: 1;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              }
              .header p {
                margin: 0;
                font-size: 14px;
                position: relative;
                z-index: 1;
                opacity: 0.9;
              }
              .main-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
              }
              .card {
                background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 12px;
                padding: 18px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.06);
                border: 1px solid #e2e8f0;
                position: relative;
                overflow: hidden;
              }
              .card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #667eea, #764ba2);
              }
              .card h3 {
                color: #2d3748;
                font-size: 18px;
                margin: 0 0 15px 0;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .card h3::before {
                content: '💰';
                font-size: 18px;
              }
              .summary-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 15px;
              }
              .stat-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 6px 15px rgba(102, 126, 234, 0.3);
              }
              .stat-label {
                font-size: 11px;
                opacity: 0.9;
                margin-bottom: 4px;
                font-weight: 500;
              }
              .stat-value {
                font-size: 16px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
              }
              .breakdown-grid {
                display: grid;
                gap: 8px;
              }
              .breakdown-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
              }
              .denom-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 11px;
                min-width: 50px;
                justify-content: center;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
              }
              .denom-1000 { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #7f1d1d; border: 1px solid #fca5a5; }
              .denom-500 { background: linear-gradient(135deg, #ede9fe 0%, #e9d5ff 100%); color: #581c87; border: 1px solid #c4b5fd; }
              .denom-100 { background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%); color: #92400e; border: 1px solid #facc15; }
              .denom-50 { background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%); color: #1e40af; border: 1px solid #60a5fa; }
              .denom-20 { background: linear-gradient(135deg, #d1fae5 0%, #86efac 100%); color: #065f46; border: 1px solid #4ade80; }
              .denom-10 { background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); color: #9a3412; border: 1px solid #fb923c; }
              .denom-5 { background: linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%); color: #374151; border: 1px solid #9ca3af; }
              .breakdown-amount {
                font-weight: 600;
                color: #2d3748;
                font-size: 12px;
              }
              .summary-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
              }
              .summary-table tr {
                border-bottom: 1px solid #e2e8f0;
              }
              .summary-table tr:last-child {
                border-bottom: none;
              }
              .summary-table td {
                padding: 10px 12px;
                font-size: 13px;
              }
              .summary-table td:first-child {
                font-weight: 600;
                color: #4a5568;
                background: #f7fafc;
                width: 60%;
              }
              .summary-table td:last-child {
                font-weight: bold;
                text-align: right;
                color: #2d3748;
              }
              .footer {
                text-align: center;
                margin-top: 25px;
                padding: 15px;
                background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                border-radius: 8px;
                color: #4a5568;
                font-size: 11px;
                border: 1px solid #e2e8f0;
              }
              .company-logo {
                font-size: 24px;
                margin-bottom: 5px;
                display: block;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="company-logo">🏭</span>
              <h1>ระบบเบิกเงินสดเงินเดือน Bangkok Soap</h1>
              <p>สรุปจำนวนธนบัตร/เหรียญที่ต้องใช้</p>
              <p>วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}</p>
            </div>
            
            <div class="main-content">
              <div class="card">
                <h3>สรุปจำนวนธนบัตร/เหรียญที่ต้องใช้</h3>
                <div class="summary-stats">
                  <div class="stat-card">
                    <div class="stat-label">จำนวนเงินรวม</div>
                    <div class="stat-value">${roundedTotal.toLocaleString()} ฿</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">จำนวนธนบัตร/เหรียญรวม</div>
                    <div class="stat-value">${Object.values(totalCash).reduce((sum, count) => sum + count, 0)} ใบ</div>
                  </div>
                </div>
                <div class="breakdown-grid">
                  ${Object.entries(totalCash).map(([denom, count]) => {
                    if (count === 0) return '';
                    const denomClass = `denom-${denom}`;
                    return `
                      <div class="breakdown-item">
                        <div class="denom-badge ${denomClass}">${denom}฿</div>
                        <div class="breakdown-amount">${count} ใบ = ${(Number(denom) * count).toLocaleString()}฿</div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
              
              <div class="card">
                <h3>สรุปรายการ</h3>
                <table class="summary-table">
                  <tr>
                    <td>จำนวนรายการ:</td>
                    <td>${salaries.length} รายการ</td>
                  </tr>
                  <tr>
                    <td>ยอดเงินก่อนปัดเศษ:</td>
                    <td>${originalTotal.toLocaleString()} บาท</td>
                  </tr>
                  <tr>
                    <td>ยอดเงินหลังปัดเศษ:</td>
                    <td style="color: #667eea;">${roundedTotal.toLocaleString()} บาท</td>
                  </tr>
                  <tr>
                    <td>ส่วนต่างการปัดเศษ:</td>
                    <td style="color: ${roundingDifference >= 0 ? '#059669' : '#dc2626'};">
                      ${roundingDifference > 0 ? '+' : ''}${roundingDifference.toLocaleString()} บาท
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>🏢 Bangkok Soap Company</strong></p>
              <p>สร้างโดยระบบเบิกเงินสดเงินเดือนอัตโนมัติ</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
  };

  const handlePrintDetails = () => {
    const printContent = `
      <html>
        <head>
          <title>รายละเอียดรายการทั้งหมด</title>
          <style>
            @media print {
              @page { 
                margin: 1.5cm; 
                size: A4 landscape;
              }
              body { 
                font-family: 'Sarabun', 'Arial', sans-serif; 
                margin: 0; 
                padding: 0;
                color: #1a202c;
                line-height: 1.4;
                background: white;
              }
              .container {
                max-width: 100%;
                margin: 0 auto;
                padding: 20px;
                background: white;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 25px;
                background: linear-gradient(135deg, #4c51bf 0%, #667eea 100%);
                border-radius: 12px;
                color: white;
                position: relative;
                overflow: hidden;
              }
              .header h1 {
                font-size: 28px;
                margin: 0 0 12px 0;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              }
              .header p {
                margin: 0;
                font-size: 16px;
                opacity: 0.9;
              }
              .summary-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin: 25px 0;
              }
              .stat-box {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
              }
              .stat-label {
                font-size: 12px;
                opacity: 0.9;
                margin-bottom: 8px;
                font-weight: 500;
              }
              .stat-value {
                font-size: 20px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
              }
              .table-container {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                border: 1px solid #e2e8f0;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                background: white;
              }
              th { 
                background: linear-gradient(135deg, #4c51bf 0%, #667eea 100%);
                color: white;
                font-weight: bold;
                border: none;
                padding: 15px 12px; 
                text-align: left;
                font-size: 13px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
              }
              td { 
                border: none;
                border-bottom: 1px solid #e2e8f0;
                padding: 12px;
                text-align: left;
                font-size: 12px;
                background: white;
              }
              tr:nth-child(even) td { 
                background: #f8fafc; 
              }
              .breakdown-cell {
                max-width: 250px;
                word-wrap: break-word;
              }
              .breakdown-badge {
                display: inline-block;
                padding: 3px 8px;
                margin: 2px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: bold;
                text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
                border: 1px solid rgba(0,0,0,0.1);
              }
              .bg-red { background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%); color: #7f1d1d; }
              .bg-purple { background: linear-gradient(135deg, #e9d5ff 0%, #ede9fe 100%); color: #581c87; }
              .bg-amber { background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%); color: #92400e; }
              .bg-blue { background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%); color: #1e40af; }
              .bg-green { background: linear-gradient(135deg, #d1fae5 0%, #86efac 100%); color: #065f46; }
              .bg-orange { background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); color: #9a3412; }
              .bg-gray { background: linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%); color: #374151; }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                border-radius: 10px;
                color: #4a5568;
                font-size: 13px;
                border: 1px solid #e2e8f0;
              }
              .company-icon {
                font-size: 24px;
                margin-right: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1><span class="company-icon">🏭</span>ระบบเบิกเงินสดเงินเดือน Bangkok Soap</h1>
              <p>รายละเอียดรายการทั้งหมด</p>
              <p>วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}</p>
            </div>
            
            <div class="summary-stats">
              <div class="stat-box">
                <div class="stat-label">จำนวนรายการ</div>
                <div class="stat-value">${salaries.length}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">ยอดก่อนปัดเศษ</div>
                <div class="stat-value">${originalTotal.toLocaleString()}฿</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">ยอดหลังปัดเศษ</div>
                <div class="stat-value">${roundedTotal.toLocaleString()}฿</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">ส่วนต่างปัดเศษ</div>
                <div class="stat-value" style="color: ${roundingDifference >= 0 ? '#86efac' : '#fca5a5'};">
                  ${roundingDifference > 0 ? '+' : ''}${roundingDifference.toLocaleString()}฿
                </div>
              </div>
            </div>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 60px;">ลำดับ</th>
                    <th style="width: 120px;">จำนวนเงินเดิม (บาท)</th>
                    <th style="width: 120px;">จำนวนเงินหลังปัดเศษ (บาท)</th>
                    <th style="width: 100px;">ส่วนต่าง (บาท)</th>
                    <th>รายละเอียดธนบัตร/เหรียญ</th>
                  </tr>
                </thead>
                <tbody>
                  ${salaries.map((salary, index) => {
                    const difference = salary.rounded - salary.original;
                    const breakdownBadges = Object.entries(salary.breakdown)
                      .filter(([, count]) => count > 0)
                      .map(([denom, count]) => {
                        const colorMap: Record<string, string> = {
                          '1000': 'bg-red',
                          '500': 'bg-purple', 
                          '100': 'bg-amber',
                          '50': 'bg-blue',
                          '20': 'bg-green',
                          '10': 'bg-orange',
                          '5': 'bg-gray'
                        };
                        return `<span class="breakdown-badge ${colorMap[denom]}">${count} ×${denom}฿</span>`;
                      }).join(' ');
                    
                    return `
                      <tr>
                        <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                        <td style="text-align: right;">${salary.original.toFixed(2)}</td>
                        <td style="text-align: right; font-weight: bold; color: #4c51bf;">${salary.rounded.toFixed(2)}</td>
                        <td style="text-align: right; font-weight: bold; color: ${difference > 0 ? '#059669' : difference < 0 ? '#dc2626' : '#6b7280'};">
                          ${difference > 0 ? '+' : ''}${difference.toFixed(2)}
                        </td>
                        <td class="breakdown-cell">${breakdownBadges}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <p><strong>🏢 Bangkok Soap Company</strong></p>
              <p>สร้างโดยระบบเบิกเงินสดเงินเดือนอัตโนมัติ • เอกสารนี้มีการป้องกันการปลอมแปลงด้วยลายน้ำดิจิทัล</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
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
    <>
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
                    ระบบเบิกเงินสดเงินเดือน Bangkok Soap
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
            <>
              <div className="flex justify-between items-center mb-8 mt-12">
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

              {/* Print Buttons Section */}
              <Card className="p-6 mb-8 shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-green-800">
                  <Printer className="mr-3 h-6 w-6" />
                  ตัวเลือกการพิมพ์
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-700 flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      สรุปจำนวนธนบัตร/เหรียญและสรุปรายการ
                    </h4>
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePrintSummary}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <Printer className="h-4 w-4" />
                        พิมพ์
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-700 flex items-center">
                      <List className="mr-2 h-5 w-5" />
                      รายละเอียดรายการทั้งหมด
                    </h4>
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePrintDetails}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <Printer className="h-4 w-4" />
                        พิมพ์
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              
              <div id="summary-area">
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
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
              </div>
              
              <div id="details-area">
                <Card className="overflow-hidden shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                  <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <h3 className="text-xl font-medium">รายละเอียดรายการทั้งหมด</h3>
                  </div>
                  <SalaryTable salaries={salaries} />
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default Index;