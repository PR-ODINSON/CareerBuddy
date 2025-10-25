'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw, Users } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface UserGrowthData {
  period: string;
  data: Array<{
    date: string;
    count: number;
    displayDate: string;
  }>;
  totalNewUsers: number;
}

interface UserGrowthChartProps {
  period?: string;
  onPeriodChange?: (period: string) => void;
  showControls?: boolean;
  height?: number;
}

export default function UserGrowthChart({ 
  period = '30d', 
  onPeriodChange, 
  showControls = true,
  height = 300 
}: UserGrowthChartProps) {
  const [data, setData] = useState<UserGrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState(period);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/analytics/user-growth?period=${currentPeriod}`);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch user growth data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user growth data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPeriod]);

  const handlePeriodChange = (newPeriod: string) => {
    setCurrentPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.displayDate}</p>
          <p className="text-blue-600">
            <span className="font-semibold">{payload[0].value}</span> new users
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            User Growth
          </CardTitle>
          <CardDescription>User registration trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              User Growth
            </CardTitle>
            <CardDescription>
              User registration trends over time
              {data && (
                <span className="ml-2 text-blue-600 font-medium">
                  (+{data.totalNewUsers} new users)
                </span>
              )}
            </CardDescription>
          </div>
          {showControls && (
            <div className="flex items-center space-x-2">
              <Select value={currentPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data && data.data.length > 0 ? (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No user growth data available</p>
              <p className="text-sm text-gray-400 mt-2">
                Data will appear as users register on the platform
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
