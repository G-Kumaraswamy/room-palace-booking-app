
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Room, Booking, Customer } from "@/types";
import { generateMockRooms, generateMockCustomers, generateMockBookings } from "@/lib/mockData";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Bed, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Load or generate rooms
    const savedRooms = localStorage.getItem("rooms");
    const roomsData = savedRooms ? JSON.parse(savedRooms) : generateMockRooms();
    setRooms(roomsData);
    
    // Load or generate customers
    const savedCustomers = localStorage.getItem("customers");
    const customersData = savedCustomers ? JSON.parse(savedCustomers) : generateMockCustomers();
    setCustomers(customersData);
    
    // Load or generate bookings
    const savedBookings = localStorage.getItem("bookings");
    const bookingsData = savedBookings 
      ? JSON.parse(savedBookings) 
      : generateMockBookings(roomsData, customersData);
    setBookings(bookingsData);
    
    // Save generated data if not already in localStorage
    if (!savedRooms) localStorage.setItem("rooms", JSON.stringify(roomsData));
    if (!savedCustomers) localStorage.setItem("customers", JSON.stringify(customersData));
    if (!savedBookings) localStorage.setItem("bookings", JSON.stringify(bookingsData));
  }, []);

  // Calculate statistics
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(room => room.status === 'available').length;
  const bookedRooms = rooms.filter(room => room.status === 'booked').length;
  const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;

  const occupancyRate = totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0;
  
  const activeBookings = bookings.filter(booking => booking.status === 'active').length;
  const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
  
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  
  const acRooms = rooms.filter(room => room.type === 'AC').length;
  const nonAcRooms = rooms.filter(room => room.type === 'Non-AC').length;

  // Chart data
  const roomStatusData = [
    { name: 'Available', value: availableRooms, color: '#22c55e' },
    { name: 'Booked', value: bookedRooms, color: '#3b82f6' },
    { name: 'Maintenance', value: maintenanceRooms, color: '#f59e0b' },
  ];
  
  const roomTypeData = [
    { name: 'AC', value: acRooms, color: '#8b5cf6' },
    { name: 'Non-AC', value: nonAcRooms, color: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex flex-col gap-2 items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white">
              <Bed className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase text-blue-700 tracking-wider font-semibold mt-1">Total Rooms</p>
            <h3 className="text-3xl font-bold text-blue-900">{totalRooms}</h3>
            <p className="text-sm text-blue-600 mt-1">Current Capacity</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex flex-col gap-2 items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500 text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase text-green-700 tracking-wider font-semibold mt-1">Available Rooms</p>
            <h3 className="text-3xl font-bold text-green-900">{availableRooms}</h3>
            <p className="text-sm text-green-600 mt-1">Ready for Booking</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 flex flex-col gap-2 items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-500 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase text-amber-700 tracking-wider font-semibold mt-1">Active Bookings</p>
            <h3 className="text-3xl font-bold text-amber-900">{activeBookings}</h3>
            <p className="text-sm text-amber-600 mt-1">Current Occupancy</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 flex flex-col gap-2 items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-500 text-white">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase text-purple-700 tracking-wider font-semibold mt-1">Total Customers</p>
            <h3 className="text-3xl font-bold text-purple-900">{customers.length}</h3>
            <p className="text-sm text-purple-600 mt-1">Registered Guests</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Occupancy Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Room Occupancy Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{Math.round(occupancyRate)}%</span>
              <span className="text-sm text-muted-foreground">{bookedRooms} of {totalRooms} rooms occupied</span>
            </div>
            <Progress value={occupancyRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roomStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roomTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {roomTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Revenue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Total Bookings</p>
              <h3 className="text-2xl font-bold">{bookings.length}</h3>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Completed Bookings</p>
              <h3 className="text-2xl font-bold">{completedBookings}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
