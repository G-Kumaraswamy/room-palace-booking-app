
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Booking, Customer, Room } from "@/types";
import { toast } from "sonner";
import { CreditCard, Receipt, Printer } from "lucide-react";

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

const Payments = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: "cash",
    notes: "",
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBookings = localStorage.getItem("bookings");
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }

    const savedRooms = localStorage.getItem("rooms");
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }

    const savedPayments = localStorage.getItem("payments");
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      localStorage.setItem("payments", JSON.stringify([]));
    }
  }, []);

  // Save payments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("payments", JSON.stringify(payments));
  }, [payments]);

  // Filter unpaid bookings
  const unpaidBookings = bookings.filter(booking => {
    // Check if payment exists for this booking
    const paymentExists = payments.some(payment => 
      payment.bookingId === booking.id && payment.status === 'completed'
    );
    
    return booking.status === 'active' && !paymentExists;
  });

  const handlePayment = (booking: Booking) => {
    // Find room details
    const room = rooms.find(r => r.id === booking.roomId);
    
    setSelectedBooking(booking);
    setPaymentForm({
      amount: booking.totalAmount,
      paymentMethod: "cash",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const processPayment = () => {
    if (!selectedBooking) return;

    const room = rooms.find(r => r.id === selectedBooking.roomId);
    
    const newPayment: Payment = {
      id: `PAY${Date.now().toString()}`,
      bookingId: selectedBooking.id,
      customerName: selectedBooking.customerName,
      roomNumber: room ? room.roomNumber : "Unknown",
      amount: paymentForm.amount,
      paymentMethod: paymentForm.paymentMethod,
      paymentDate: new Date().toISOString(),
      status: 'completed',
    };

    setPayments([...payments, newPayment]);
    toast.success("Payment processed successfully!");
    
    // Show receipt
    setSelectedPayment(newPayment);
    setIsDialogOpen(false);
    setReceiptDialogOpen(true);
  };

  const printReceipt = () => {
    window.print();
  };

  const generateReport = (payment: Payment) => {
    const booking = bookings.find(b => b.id === payment.bookingId);
    const room = rooms.find(r => r.id === booking?.roomId);
    
    setSelectedPayment(payment);
    setReceiptDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Payment Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {unpaidBookings.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-muted-foreground">No pending payments.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidBookings.map((booking) => {
                    const room = rooms.find(r => r.id === booking.roomId);
                    
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.id}</TableCell>
                        <TableCell>{booking.customerName}</TableCell>
                        <TableCell>{room?.roomNumber || "Unknown"}</TableCell>
                        <TableCell>₹{booking.totalAmount}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePayment(booking)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" /> Process Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-muted-foreground">No payment history yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...payments].reverse().slice(0, 5).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.roomNumber}</TableCell>
                      <TableCell>₹{payment.amount}</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => generateReport(payment)}
                        >
                          <Receipt className="h-4 w-4 mr-1" /> View Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Collect payment for booking {selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedBooking && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-md mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-medium">₹{selectedBooking.totalAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-in</p>
                  <p className="font-medium">{new Date(selectedBooking.checkInDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-out</p>
                  <p className="font-medium">{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value)})}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup 
                value={paymentForm.paymentMethod} 
                onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethod: value})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add payment notes if any"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={processPayment}>
                <CreditCard className="h-4 w-4 mr-2" />
                Complete Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payment Receipt</span>
              <Button variant="outline" size="sm" onClick={printReceipt}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4 print:p-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">KH Hotels</h2>
                <p className="text-sm text-muted-foreground">SINGNAYAKANAHALLI, Bengaluru</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt #:</span>
                  <span className="font-medium">{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(selectedPayment.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="border rounded-md p-3 space-y-2">
                <h3 className="font-semibold">Customer Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p>{selectedPayment.customerName}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-3 space-y-2">
                <h3 className="font-semibold">Booking Details</h3>
                {(() => {
                  const booking = bookings.find(b => b.id === selectedPayment.bookingId);
                  
                  return booking ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Booking ID</p>
                        <p>{booking.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Room Number</p>
                        <p>{selectedPayment.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Check-in</p>
                        <p>{new Date(booking.checkInDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Check-out</p>
                        <p>{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Booking details not available</p>
                  );
                })()}
              </div>

              <div className="border rounded-md p-3 space-y-2">
                <h3 className="font-semibold">Payment Details</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-semibold">₹{selectedPayment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="capitalize">{selectedPayment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground border-t pt-4 mt-8">
                <p>Thank you for staying with KH Hotels!</p>
                <p>For any queries, please contact reception.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;
