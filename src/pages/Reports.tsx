import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookingReports, setBookingReports] = useState<any[]>([]);
  const [customerReports, setCustomerReports] = useState<any[]>([]);
  const [revenueReports, setRevenueReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<'bookings' | 'customers' | 'revenue'>('bookings');
  const [isLoading, setIsLoading] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const customers = JSON.parse(localStorage.getItem('users') || '[]');
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');

      const selectedDate = date ? format(date, 'yyyy-MM-dd') : null;

      const filteredBookings = selectedDate
        ? bookings.filter((booking: any) => booking.checkInDate === selectedDate)
        : bookings;

      const filteredCustomers = selectedDate
        ? customers.filter((customer: any) =>
            bookings.some((booking: any) => booking.customerId === customer.id && booking.checkInDate === selectedDate)
          )
        : customers;

      const filteredPayments = selectedDate
        ? payments.filter((payment: any) => payment.paymentDate === selectedDate)
        : payments;

      const generatedBookingReport = generateBookingReport(filteredBookings);
      const generatedCustomerReport = generateCustomerReport(filteredCustomers);
      const generatedRevenueReport = generateRevenueReport(filteredPayments);

      setBookingReports(generatedBookingReport);
      setCustomerReports(generatedCustomerReport);
      setRevenueReports(generatedRevenueReport);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBookingReport = (bookings: any[]) => {
    const activeBookings = bookings.filter((booking: any) => booking.status === 'active').length;
    const completedBookings = bookings.filter((booking: any) => booking.status === 'completed').length;
    const cancelledBookings = bookings.filter((booking: any) => booking.status === 'cancelled').length;

    return [
      { category: 'Active', value: activeBookings },
      { category: 'Completed', value: completedBookings },
      { category: 'Cancelled', value: cancelledBookings },
    ];
  };

  const generateCustomerReport = (customers: any[]) => {
    return [
      { category: 'Total Customers', value: customers.length },
    ];
  };

  const generateRevenueReport = (payments: any[]) => {
    const completedPayments = payments.filter((payment: any) => payment.status === 'completed');
    const totalRevenue = completedPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);

    return [
      { category: 'Total Revenue', value: totalRevenue },
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View and generate hotel reports</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={date ? format(date, 'PPP') : ''}
              readOnly
              className="pl-8 pr-3 py-2 rounded-md border cursor-pointer"
            />
            <div className="absolute top-10 right-0 z-50">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </div>
          </div>
          <Button onClick={() => fetchReports()}>
            Generate Reports
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bookings" onValueChange={(value) => setSelectedReport(value as any)}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="bookings" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Customers</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Revenue</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bookingReports}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={customerReports}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueReports}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default Reports;
