import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Percent, Package } from 'lucide-react';
import { useProductionStore } from '../stores/productionStore';
import { useSalesStore } from '../stores/salesStore';
import { format, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface StockItem {
  itemCode: string;
  quantity: number;
  productionCost: number;
}

interface StockByCode {
  [key: string]: {
    produced: number;
    sold: number;
    inStock: number;
    averageCost: number;
  };
}

interface TimeSeriesData {
  name: string;
  date: string;
  sales: number;
  production: number;
}

function Dashboard() {
  const productionData = useProductionStore((state) => state.items);
  const salesData = useSalesStore((state) => state.items);
  const [stockByCode, setStockByCode] = useState<StockByCode>({});
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [roi, setRoi] = useState(0);
  const [chartType, setChartType] = useState<'salesVsProduction' | 'salesOverTime'>('salesVsProduction');
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    // Calculate stock and financial metrics
    const stockMap: StockByCode = {};
    let investmentTotal = 0;
    let salesTotal = 0;

    // Process production data
    productionData.forEach((item) => {
      if (!stockMap[item.itemCode]) {
        stockMap[item.itemCode] = {
          produced: 0,
          sold: 0,
          inStock: 0,
          averageCost: 0,
        };
      }
      stockMap[item.itemCode].produced += Number(item.quantity);
      const itemCost = Number(item.quantity) * Number(item.productionCost);
      investmentTotal += itemCost;
      
      // Update average cost
      stockMap[item.itemCode].averageCost = 
        (stockMap[item.itemCode].averageCost * (stockMap[item.itemCode].produced - Number(item.quantity)) + 
         Number(item.productionCost) * Number(item.quantity)) / 
        stockMap[item.itemCode].produced;
    });

    // Process sales data
    salesData.forEach((item) => {
      if (stockMap[item.itemCode]) {
        stockMap[item.itemCode].sold += Number(item.quantity);
        salesTotal += Number(item.quantity) * Number(item.sellingPrice);
      }
    });

    // Calculate final in-stock quantities
    Object.keys(stockMap).forEach((itemCode) => {
      stockMap[itemCode].inStock = 
        stockMap[itemCode].produced - stockMap[itemCode].sold;
    });

    setStockByCode(stockMap);
    setTotalInvestment(investmentTotal);
    setTotalSales(salesTotal);
    setRoi(((salesTotal - investmentTotal) / investmentTotal) * 100);
  }, [productionData, salesData]);

  // Calculate total items in stock
  const totalItemsInStock = Object.values(stockByCode).reduce(
    (total, item) => total + item.inStock,
    0
  );

  // Prepare stock details for display
  const stockDetails = Object.entries(stockByCode)
    .filter(([_, data]) => data.inStock > 0)
    .map(([itemCode, data]) => ({
      itemCode,
      inStock: data.inStock,
      averageCost: data.averageCost.toFixed(2),
      totalValue: (data.inStock * data.averageCost).toFixed(2),
    }));

  const prepareTimeSeriesData = () => {
    const now = new Date();
    let start: Date;
    let intervals: Date[];

    // Determine start date and intervals based on timeFrame
    switch (timeFrame) {
      case 'weekly':
        // Get last 4 weeks
        start = new Date(now);
        start.setDate(start.getDate() - 28); // 4 weeks back
        intervals = eachWeekOfInterval({ start, end: now });
        break;
      case 'monthly':
        // Get last 6 months
        start = new Date(now);
        start.setMonth(start.getMonth() - 6);
        intervals = eachMonthOfInterval({ start, end: now });
        break;
      case 'yearly':
        start = startOfYear(now);
        intervals = eachMonthOfInterval({ start, end: now });
        break;
      default: // daily - last 7 days
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        intervals = eachDayOfInterval({ start, end: now });
    }

    // Initialize data points for each interval
    const timeSeriesData = intervals.map(date => ({
      name: format(date, 
        timeFrame === 'yearly' ? 'MMM' : 
        timeFrame === 'monthly' ? 'MMM yyyy' :
        timeFrame === 'weekly' ? "'Week' w" : 
        'MMM d'
      ),
      date: date.toISOString(),
      sales: 0,
      production: 0,
    }));

    // Aggregate data based on timeFrame
    [...productionData, ...salesData].forEach(item => {
      const itemDate = new Date(item.date);
      const dataPoint = timeSeriesData.find(point => {
        const pointDate = new Date(point.date);
        switch (timeFrame) {
          case 'weekly':
            return (
              itemDate >= startOfWeek(pointDate) &&
              itemDate < new Date(pointDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            );
          case 'monthly':
            return (
              itemDate.getMonth() === pointDate.getMonth() &&
              itemDate.getFullYear() === pointDate.getFullYear()
            );
          case 'yearly':
            return itemDate.getMonth() === pointDate.getMonth();
          default:
            return format(itemDate, 'yyyy-MM-dd') === format(pointDate, 'yyyy-MM-dd');
        }
      });

      if (dataPoint) {
        if ('productionCost' in item) {
          dataPoint.production += Number(item.quantity);
        } else {
          dataPoint.sales += Number(item.quantity);
        }
      }
    });

    return timeSeriesData;
  };

  const renderChart = () => {
    const data = prepareTimeSeriesData();

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <button
              onClick={() => setChartType('salesVsProduction')}
              className={`px-4 py-2 rounded-lg ${
                chartType === 'salesVsProduction'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            >
              Sales vs Production
            </button>
            <button
              onClick={() => setChartType('salesOverTime')}
              className={`px-4 py-2 rounded-lg ${
                chartType === 'salesOverTime'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            >
              Sales Over Time
            </button>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setTimeFrame('daily')}
              className={`px-4 py-2 rounded-lg ${
                timeFrame === 'daily'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeFrame('weekly')}
              className={`px-4 py-2 rounded-lg ${
                timeFrame === 'weekly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            >
              Last 4 Weeks
            </button>
            <button
              onClick={() => setTimeFrame('monthly')}
              className={`px-4 py-2 rounded-lg ${
                timeFrame === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeFrame('yearly')}
              className={`px-4 py-2 rounded-lg ${
                timeFrame === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            >
              This Year
            </button>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                angle={timeFrame === 'monthly' ? -45 : 0}
                textAnchor={timeFrame === 'monthly' ? 'end' : 'middle'}
                height={timeFrame === 'monthly' ? 80 : 30}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartType === 'salesVsProduction' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="production"
                    name="Production"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Investment"
          value={`$${totalInvestment.toFixed(2)}`}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Sales"
          value={`$${totalSales.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="ROI"
          value={`${roi.toFixed(2)}%`}
          icon={Percent}
          color="bg-purple-500"
        />
        <StatCard
          title="Items in Stock"
          value={totalItemsInStock.toString()}
          icon={Package}
          color="bg-orange-500"
        />
      </div>

      {/* Stock Details Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/30 backdrop-blur-xl p-6 rounded-xl border border-white/20"
      >
        <h2 className="text-xl font-semibold mb-4">Current Stock Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Item Code</th>
                <th className="text-right py-3 px-4">Quantity in Stock</th>
                <th className="text-right py-3 px-4">Average Cost</th>
                <th className="text-right py-3 px-4">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {stockDetails.map((item) => (
                <tr key={item.itemCode} className="border-b border-gray-200">
                  <td className="py-3 px-4">{item.itemCode}</td>
                  <td className="text-right py-3 px-4">{item.inStock}</td>
                  <td className="text-right py-3 px-4">${item.averageCost}</td>
                  <td className="text-right py-3 px-4">${item.totalValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Updated Chart section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/30 backdrop-blur-xl p-6 rounded-xl border border-white/20"
      >
        <h2 className="text-xl font-semibold mb-4">Data Visualization</h2>
        {renderChart()}
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${color} p-6 rounded-xl text-white`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-80" />
      </div>
    </motion.div>
  );
}

export default Dashboard;