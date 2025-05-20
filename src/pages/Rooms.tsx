
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bed, Search, Filter, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Room, Booking, Customer } from "@/types";
import { generateMockRooms, generateMockCustomers } from "@/lib/mockData";

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  
  const [bookingForm, setBookingForm] = useState({
    customerId: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfDays: 1,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedRooms = localStorage.getItem("rooms");
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    } else {
      // Generate mock rooms data if none exists
      const generatedRooms = generateMockRooms();
      setRooms(generatedRooms);
      localStorage.setItem("rooms", JSON.stringify(generatedRooms));
    }
    
    const savedBookings = localStorage.getItem("bookings");
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
    
    const savedCustomers = localStorage.getItem("customers");
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      // Generate mock customer data if none exists
      const generatedCustomers = generateMockCustomers();
      setCustomers(generatedCustomers);
      localStorage.setItem("customers", JSON.stringify(generatedCustomers));
    }
  }, []);

  // Save rooms and bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }, [rooms]);
  
  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }, [bookings]);
  
  // Calculate number of days between check-in and check-out
  useEffect(() => {
    if (bookingForm.checkInDate && bookingForm.checkOutDate) {
      const checkIn = new Date(bookingForm.checkInDate);
      const checkOut = new Date(bookingForm.checkOutDate);
      
      // Calculate difference in days
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setBookingForm(prev => ({ ...prev, numberOfDays: diffDays }));
      } else {
        setBookingForm(prev => ({ ...prev, numberOfDays: 1 }));
      }
    }
  }, [bookingForm.checkInDate, bookingForm.checkOutDate]);
  
  const handleBookRoom = (room: Room) => {
    if (room.status !== 'available') {
      toast.error(`Room ${room.roomNumber} is currently ${room.status}. Cannot book.`);
      return;
    }
    
    setSelectedRoom(room);
    setBookingForm({
      customerId: "",
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      numberOfDays: 1,
    });
    setErrors({});
    setIsDialogOpen(true);
  };
  
  const validateBookingForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!bookingForm.customerId) {
      newErrors.customerId = "Please select a customer";
    }
    
    if (!bookingForm.checkInDate) {
      newErrors.checkInDate = "Check-in date is required";
    }
    
    if (!bookingForm.checkOutDate) {
      newErrors.checkOutDate = "Check-out date is required";
    } else if (bookingForm.checkInDate && new Date(bookingForm.checkOutDate) <= new Date(bookingForm.checkInDate)) {
      newErrors.checkOutDate = "Check-out date must be after check-in date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBookingForm() || !selectedRoom) {
      return;
    }
    
    const totalAmount = selectedRoom.price * bookingForm.numberOfDays;
    
    // Create new booking
    const newBooking: Booking = {
      id: `BK${Date.now().toString()}`,
      roomId: selectedRoom.id,
      customerId: bookingForm.customerId,
      customerName: customers.find(c => c.id === bookingForm.customerId)?.name || "Unknown",
      checkInDate: bookingForm.checkInDate,
      checkOutDate: bookingForm.checkOutDate,
      status: 'active',
      totalAmount,
    };
    
    // Update room status
    setRooms(rooms.map(room => 
      room.id === selectedRoom.id 
        ? { ...room, status: 'booked' } 
        : room
    ));
    
    // Add booking
    setBookings([...bookings, newBooking]);
    
    toast.success(`Room ${selectedRoom.roomNumber} booked successfully!`);
    resetForm();
  };
  
  const resetForm = () => {
    setSelectedRoom(null);
    setBookingForm({
      customerId: "",
      checkInDate: "",
      checkOutDate: "",
      numberOfDays: 1,
    });
    setErrors({});
    setIsDialogOpen(false);
  };
  
  // Filter rooms based on search term and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      room.roomNumber.includes(searchTerm);
      
    const matchesStatus = filterStatus === "all" || room.status === filterStatus;
    const matchesType = filterType === "all" || room.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const getRoomStatusBadge = (status: string) => {
    switch(status) {
      case 'available':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Available
        </span>;
      case 'booked':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-hotel-secondary text-hotel-primary">
          <Bed className="w-3 h-3 mr-1" /> Booked
        </span>;
      case 'maintenance':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <XCircle className="w-3 h-3 mr-1" /> Maintenance
        </span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rooms..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="AC">AC</SelectItem>
              <SelectItem value="Non-AC">Non-AC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No rooms found.</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No matching rooms found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room ID</TableHead>
                    <TableHead>Room No.</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow 
                      key={room.id}
                      className={
                        room.status === 'available' 
                          ? 'cursor-pointer hover:bg-green-50' 
                          : room.status === 'booked' 
                          ? 'hover:bg-blue-50' 
                          : 'hover:bg-amber-50'
                      }
                      onClick={() => handleBookRoom(room)}
                      onMouseEnter={() => setHoveredRoom(room.id)}
                      onMouseLeave={() => setHoveredRoom(null)}
                    >
                      <TableCell className="font-medium">{room.id}</TableCell>
                      <TableCell>{room.roomNumber}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>₹{room.price}</TableCell>
                      <TableCell>{getRoomStatusBadge(room.status)}</TableCell>
                      <TableCell>
                        {hoveredRoom === room.id && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant={room.status === 'available' ? "default" : "outline"} 
                                size="sm"
                                disabled={room.status !== 'available'}
                              >
                                {room.status === 'available' ? 'Book Now' : 'Unavailable'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0">
                              <div className="p-4">
                                <h4 className="font-medium mb-2">Room {room.roomNumber}</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {room.status === 'available' 
                                    ? 'This room is available for booking. Click anywhere on this row to book.' 
                                    : room.status === 'booked' 
                                    ? 'This room is currently booked and not available.' 
                                    : 'This room is under maintenance and not available for booking.'}
                                </p>
                                {room.status === 'available' && (
                                  <Button 
                                    className="w-full" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBookRoom(room);
                                    }}
                                  >
                                    Book Room
                                  </Button>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                        {hoveredRoom !== room.id && (
                          <Button 
                            variant={room.status === 'available' ? "outline" : "ghost"} 
                            size="sm" 
                            disabled={room.status !== 'available'}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (room.status === 'available') {
                                handleBookRoom(room);
                              }
                            }}
                          >
                            {room.status === 'available' ? 'Book Room' : 'Unavailable'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Room {selectedRoom?.roomNumber}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitBooking} className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Display selected room details */}
              {selectedRoom && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-md mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Room Type</p>
                    <p className="font-medium">{selectedRoom.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price per Day</p>
                    <p className="font-medium">₹{selectedRoom.price}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="customer">Select Customer</Label>
                <Select 
                  value={bookingForm.customerId} 
                  onValueChange={(value) => setBookingForm(prev => ({ ...prev, customerId: value }))}
                >
                  <SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length > 0 ? (
                      customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.id})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No customers available. Add customers first.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>}
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkInDate">Check-in Date</Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={bookingForm.checkInDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, checkInDate: e.target.value }))}
                    className={errors.checkInDate ? "border-red-500" : ""}
                  />
                  {errors.checkInDate && <p className="text-red-500 text-xs mt-1">{errors.checkInDate}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="checkOutDate">Check-out Date</Label>
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={bookingForm.checkOutDate}
                    min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, checkOutDate: e.target.value }))}
                    className={errors.checkOutDate ? "border-red-500" : ""}
                  />
                  {errors.checkOutDate && <p className="text-red-500 text-xs mt-1">{errors.checkOutDate}</p>}
                </div>
              </div>
              
              {/* Show price calculation */}
              <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                <div className="flex justify-between py-1">
                  <span>Room Price:</span>
                  <span>₹{selectedRoom?.price || 0} × {bookingForm.numberOfDays} {bookingForm.numberOfDays > 1 ? 'days' : 'day'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg py-1">
                  <span>Total Amount:</span>
                  <span>₹{(selectedRoom?.price || 0) * bookingForm.numberOfDays}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                Confirm Booking
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rooms;
