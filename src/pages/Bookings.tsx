
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle, XCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Booking, Room, Customer } from "@/types";
import { generateMockRooms, generateMockCustomers, generateMockBookings } from "@/lib/mockData";

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedRooms = localStorage.getItem("rooms");
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    } else {
      const generatedRooms = generateMockRooms();
      setRooms(generatedRooms);
      localStorage.setItem("rooms", JSON.stringify(generatedRooms));
    }
    
    const savedCustomers = localStorage.getItem("customers");
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      const generatedCustomers = generateMockCustomers();
      setCustomers(generatedCustomers);
      localStorage.setItem("customers", JSON.stringify(generatedCustomers));
    }
    
    const savedBookings = localStorage.getItem("bookings");
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else if (savedRooms && savedCustomers) {
      const roomsData = JSON.parse(savedRooms);
      const customersData = JSON.parse(savedCustomers);
      const generatedBookings = generateMockBookings(roomsData, customersData);
      setBookings(generatedBookings);
      localStorage.setItem("bookings", JSON.stringify(generatedBookings));
    }
  }, []);
  
  // Save bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }, [bookings]);
  
  // Save rooms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }, [rooms]);
  
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };
  
  const handleCancelBooking = () => {
    if (!selectedBooking) return;
    
    // Update booking status
    const updatedBookings = bookings.map(booking => 
      booking.id === selectedBooking.id 
        ? { ...booking, status: 'cancelled' } 
        : booking
    );
    setBookings(updatedBookings);
    
    // Update room status
    const updatedRooms = rooms.map(room => 
      room.id === selectedBooking.roomId 
        ? { ...room, status: 'available' } 
        : room
    );
    setRooms(updatedRooms);
    
    toast.success("Booking cancelled successfully!");
    setIsDialogOpen(false);
  };
  
  const handleCompleteBooking = () => {
    if (!selectedBooking) return;
    
    // Update booking status
    const updatedBookings = bookings.map(booking => 
      booking.id === selectedBooking.id 
        ? { ...booking, status: 'completed' } 
        : booking
    );
    setBookings(updatedBookings);
    
    // Update room status
    const updatedRooms = rooms.map(room => 
      room.id === selectedBooking.roomId 
        ? { ...room, status: 'available' } 
        : room
    );
    setRooms(updatedRooms);
    
    toast.success("Booking marked as completed!");
    setIsDialogOpen(false);
  };
  
  // Filter bookings based on search term and status filter
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomId.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getRoomDetails = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room 
      ? `${room.roomNumber} (${room.type})`
      : "Unknown Room";
  };
  
  const getBookingStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Active
        </span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Completed
        </span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" /> Cancelled
        </span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookings..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center p-10">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Bookings Found</h3>
              <p className="text-muted-foreground mt-2">There are no bookings in the system yet.</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No matching bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="cursor-pointer hover:bg-muted">
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>{getRoomDetails(booking.roomId)}</TableCell>
                      <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                      <TableCell>₹{booking.totalAmount}</TableCell>
                      <TableCell>{getBookingStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBooking(booking)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedBooking && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Booking ID: {selectedBooking.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-2">
              {/* Booking details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium">{getBookingStatusBadge(selectedBooking.status)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-medium">₹{selectedBooking.totalAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Room</p>
                  <p className="font-medium">{getRoomDetails(selectedBooking.roomId)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Guest</p>
                  <p className="font-medium">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-in Date</p>
                  <p className="font-medium">{new Date(selectedBooking.checkInDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-out Date</p>
                  <p className="font-medium">{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                {selectedBooking.status === 'active' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleCancelBooking}
                    >
                      Cancel Booking
                    </Button>
                    <Button 
                      className="w-full" 
                      onClick={handleCompleteBooking}
                    >
                      Mark as Completed
                    </Button>
                  </div>
                )}
                
                {(selectedBooking.status === 'completed' || selectedBooking.status === 'cancelled') && (
                  <p className="text-sm text-center text-muted-foreground">
                    This booking has been {selectedBooking.status}. No further actions available.
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Bookings;
