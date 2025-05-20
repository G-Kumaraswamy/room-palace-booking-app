
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, Calendar as CalendarIcon, DollarSign, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Booking, Customer } from '@/types';

const Reports = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookingReports, setBookingReports] = useState<any[]>([]);
  const [customerReports, setCustomerReports] = useState<any[]>([]);
  const [revenueReports, setRevenueReports] = useState<any[]>([]);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<'bookings' | 'customers' | 'revenue' | 'customerBookings'>('bookings');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');

      const selectedDate = date ? format(date, 'yyyy-MM-dd') : null;

      // Filter data based on selected date
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

      // Generate reports
      const generatedBookingReport = generateBookingReport(filteredBookings);
      const generatedCustomerReport = generateCustomerReport(filteredCustomers);
      const generatedRevenueReport = generateRevenueReport(filteredPayments);
      const generatedCustomerBookings = generateCustomerBookingsReport(filteredBookings, customers, rooms);

      // Update state with generated reports
      setBookingReports(generatedBookingReport);
      setCustomerReports(generatedCustomerReport);
      setRevenueReports(generatedRevenueReport);
      setCustomerBookings(generatedCustomerBookings);
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

  const generateCustomerBookingsReport = (bookings: Booking[], customers: Customer[], rooms: any[]) => {
    // Create detailed report of customer bookings
    return bookings.map(booking => {
      const customer = customers.find(c => c.id === booking.customerId);
      const room = rooms.find(r => r.id === booking.roomId);
      
      return {
        bookingId: booking.id,
        customerName: customer ? customer.name : 'Unknown',
        customerContact: customer ? customer.phone : 'N/A',
        roomNumber: room ? room.roomNumber : 'Unknown',
        roomType: room ? room.type : 'Unknown',
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        status: booking.status,
        totalAmount: booking.totalAmount
      };
    });
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportTitle = 
      selectedReport === 'bookings' ? 'Booking Report' :
      selectedReport === 'customers' ? 'Customer Report' :
      selectedReport === 'revenue' ? 'Revenue Report' : 'Customer Bookings Report';

    let reportContent = '';

    if (selectedReport === 'customerBookings') {
      reportContent = `
        <h2>Customer Booking Details</h2>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${customerBookings.map(booking => `
              <tr>
                <td>${booking.bookingId}</td>
                <td>${booking.customerName}</td>
                <td>${booking.customerContact}</td>
                <td>${booking.roomNumber} (${booking.roomType})</td>
                <td>${new Date(booking.checkInDate).toLocaleDateString()}</td>
                <td>${new Date(booking.checkOutDate).toLocaleDateString()}</td>
                <td>${booking.status}</td>
                <td>₹${booking.totalAmount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      const reportData = 
        selectedReport === 'bookings' ? bookingReports :
        selectedReport === 'customers' ? customerReports : revenueReports;

      reportContent = `
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>Category</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${selectedReport === 'revenue' ? '₹' : ''}${item.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const reportDate = date ? format(date, 'PPP') : 'All dates';

    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; text-align: center; }
            .report-header { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f2f2f2; }
            th, td { padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>KH Hotels</h1>
            <p>SingNAYAKANAHALLI, Bengaluru</p>
            <h2>${reportTitle}</h2>
            <p>Date: ${reportDate}</p>
          </div>
          ${reportContent}
          <p style="text-align: center; margin-top: 30px;">
            Generated on ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
              onClick={() => setIsCalendarOpen(prev => !prev)}
              readOnly
              className="pl-8 pr-3 py-2 rounded-md border cursor-pointer"
            />
            {isCalendarOpen && (
              <div className="absolute top-10 right-0 z-50 bg-white border shadow-md rounded-md">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </div>
            )}
          </div>
          <Button onClick={() => fetchReports()} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Reports'}
          </Button>
          <Button variant="outline" onClick={printReport} disabled={isLoading}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bookings" onValueChange={(value) => setSelectedReport(value as any)}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
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
          <TabsTrigger value="customerBookings" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Customer Bookings</span>
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

        <TabsContent value="customerBookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              {customerBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-2 border">Booking ID</th>
                        <th className="text-left p-2 border">Customer</th>
                        <th className="text-left p-2 border">Room</th>
                        <th className="text-left p-2 border">Check-in</th>
                        <th className="text-left p-2 border">Check-out</th>
                        <th className="text-left p-2 border">Status</th>
                        <th className="text-left p-2 border">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerBookings.map((booking) => (
                        <tr key={booking.bookingId} className="hover:bg-muted">
                          <td className="p-2 border">{booking.bookingId}</td>
                          <td className="p-2 border">{booking.customerName}</td>
                          <td className="p-2 border">{booking.roomNumber} ({booking.roomType})</td>
                          <td className="p-2 border">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                          <td className="p-2 border">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                          <td className="p-2 border">
                            <span className={`px-2 py-1 rounded text-xs font-medium
                              ${booking.status === 'active' ? 'bg-green-100 text-green-800' : 
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-2 border">₹{booking.totalAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">No booking data available. Generate reports first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
