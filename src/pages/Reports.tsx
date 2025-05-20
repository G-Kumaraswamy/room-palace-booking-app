
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, Room, Customer } from "@/types";
import { BarChart, FileText, Printer, Download, Users } from "lucide-react";

interface Payment {
  id: string;
  bookingId: string;
  customerName: string;
  roomNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
}

const Reports = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reportPeriod, setReportPeriod] = useState("all");
  const [reportType, setReportType] = useState("bookings");
  const { user } = useAuth();

  // Load data from localStorage
  useEffect(() => {
    const savedBookings = localStorage.getItem("bookings");
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }

    const savedRooms = localStorage.getItem("rooms");
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }

    const savedCustomers = localStorage.getItem("customers");
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }

    const savedPayments = localStorage.getItem("payments");
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  // Filter data based on time period
  const filterDataByPeriod = (date: string) => {
    const today = new Date();
    const itemDate = new Date(date);

    switch (reportPeriod) {
      case "today":
        return itemDate.toDateString() === today.toDateString();
      case "week":
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= lastWeek;
      case "month":
        return itemDate.getMonth() === today.getMonth() && 
               itemDate.getFullYear() === today.getFullYear();
      default:
        return true; // "all" case
    }
  };

  // Calculate summary statistics
  const totalBookings = bookings.filter(booking => 
    filterDataByPeriod(booking.checkInDate)
  ).length;

  const activeBookings = bookings.filter(booking => 
    booking.status === 'active' && filterDataByPeriod(booking.checkInDate)
  ).length;

  const completedBookings = bookings.filter(booking => 
    booking.status === 'completed' && filterDataByPeriod(booking.checkInDate)
  ).length;

  const totalRevenue = payments
    .filter(payment => filterDataByPeriod(payment.paymentDate))
    .reduce((sum, payment) => sum + payment.amount, 0);

  const occupancyRate = rooms.length > 0 
    ? (rooms.filter(room => room.status === 'booked').length / rooms.length * 100).toFixed(1) 
    : "0";

  // Filtered data for reports
  const filteredBookings = bookings.filter(booking => 
    filterDataByPeriod(booking.checkInDate)
  );

  const filteredPayments = payments.filter(payment => 
    filterDataByPeriod(payment.paymentDate)
  );

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={printReport}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Header for print */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">KH Hotels</h1>
        <p className="text-sm text-muted-foreground">SINGNAYAKANAHALLI, Bengaluru</p>
        <h2 className="text-xl mt-4">
          {reportType === "bookings" ? "Bookings Report" : 
           reportType === "revenue" ? "Revenue Report" : 
           "Occupancy Report"}
        </h2>
        <p className="text-sm">
          Period: {
            reportPeriod === "all" ? "All Time" :
            reportPeriod === "today" ? "Today" :
            reportPeriod === "week" ? "This Week" :
            "This Month"
          }
        </p>
        <p className="text-sm">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-2xl font-bold">{totalBookings}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-2xl font-bold">{activeBookings}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-2xl font-bold">₹{totalRevenue}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-2xl font-bold">{occupancyRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs 
        defaultValue="bookings" 
        value={reportType}
        onValueChange={setReportType}
        className="print:hidden"
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="bookings">
            <Calendar className="h-4 w-4 mr-2" /> Bookings
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <BarChart className="h-4 w-4 mr-2" /> Revenue
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" /> Customers
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No bookings found for the selected period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map(booking => {
                        const room = rooms.find(r => r.id === booking.roomId);
                        
                        return (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.id}</TableCell>
                            <TableCell>{booking.customerName}</TableCell>
                            <TableCell>{room?.roomNumber || "Unknown"}</TableCell>
                            <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                booking.status === 'active' ? 'bg-green-100 text-green-800' : 
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </TableCell>
                            <TableCell>₹{booking.totalAmount}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No payments found for the selected period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.id}</TableCell>
                          <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                          <TableCell>{payment.customerName}</TableCell>
                          <TableCell>{payment.roomNumber}</TableCell>
                          <TableCell>₹{payment.amount}</TableCell>
                          <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {filteredPayments.length > 0 && (
                <div className="flex justify-between border-t mt-4 pt-4">
                  <span className="font-medium">Total Revenue:</span>
                  <span className="font-bold">₹{totalRevenue}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Total Bookings</TableHead>
                      <TableHead>Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No customers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map(customer => {
                        const customerBookings = bookings.filter(
                          b => b.customerId === customer.id && filterDataByPeriod(b.checkInDate)
                        );
                        
                        const customerPayments = payments.filter(p => {
                          const booking = bookings.find(b => b.id === p.bookingId);
                          return booking && booking.customerId === customer.id && filterDataByPeriod(p.paymentDate);
                        });
                        
                        const totalSpent = customerPayments.reduce((sum, p) => sum + p.amount, 0);
                        
                        // Only show customers with activity in the selected period
                        if (reportPeriod !== "all" && customerBookings.length === 0) {
                          return null;
                        }
                        
                        return (
                          <TableRow key={customer.id}>
                            <TableCell>{customer.id}</TableCell>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customerBookings.length}</TableCell>
                            <TableCell>₹{totalSpent}</TableCell>
                          </TableRow>
                        );
                      }).filter(Boolean)
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Print view content */}
      <div className="hidden print:block">
        {reportType === "bookings" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map(booking => {
                const room = rooms.find(r => r.id === booking.roomId);
                return (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>{room?.roomNumber || "Unknown"}</TableCell>
                    <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.status}</TableCell>
                    <TableCell>₹{booking.totalAmount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {reportType === "revenue" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell>{payment.roomNumber}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">Total Revenue:</TableCell>
                <TableCell colSpan={2} className="font-bold">₹{totalRevenue}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

        {reportType === "customers" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map(customer => {
                const customerBookings = bookings.filter(
                  b => b.customerId === customer.id && filterDataByPeriod(b.checkInDate)
                );
                
                const customerPayments = payments.filter(p => {
                  const booking = bookings.find(b => b.id === p.bookingId);
                  return booking && booking.customerId === customer.id && filterDataByPeriod(p.paymentDate);
                });
                
                const totalSpent = customerPayments.reduce((sum, p) => sum + p.amount, 0);
                
                // Only show customers with activity in the selected period
                if (reportPeriod !== "all" && customerBookings.length === 0) {
                  return null;
                }
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customerBookings.length}</TableCell>
                    <TableCell>₹{totalSpent}</TableCell>
                  </TableRow>
                );
              }).filter(Boolean)}
            </TableBody>
          </Table>
        )}

        <div className="text-center text-sm text-muted-foreground mt-8 pt-4 border-t">
          <p>Report generated by {user?.username} ({user?.role})</p>
          <p>KH Hotels Management System © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
