
import { Room, Booking, Customer } from "@/types";

export const generateMockRooms = (): Room[] => {
  const mockRooms: Room[] = [];
  for (let i = 1; i <= 20; i++) {
    const floor = Math.ceil(i / 5);
    const roomNumber = `${floor}0${i % 5 === 0 ? 5 : i % 5}`;
    mockRooms.push({
      id: `RM${100 + i}`,
      roomNumber,
      type: i % 3 === 0 ? 'Non-AC' : 'AC',
      price: i % 3 === 0 ? 1200 : 2000,
      status: i % 7 === 0 ? 'maintenance' : (i % 4 === 0 ? 'booked' : 'available'),
      floor: `${floor}`,
    });
  }
  return mockRooms;
};

export const generateMockCustomers = (): Customer[] => {
  const mockCustomers: Customer[] = [
    {
      id: "CUST001",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "9876543210",
      address: "123 Main St, Mumbai, India",
      idType: "Aadhar",
      idNumber: "1234-5678-9012"
    },
    {
      id: "CUST002",
      name: "Priya Singh",
      email: "priya.singh@example.com",
      phone: "8765432109",
      address: "456 Park Ave, Delhi, India",
      idType: "PAN",
      idNumber: "ABCDE1234F"
    },
    {
      id: "CUST003",
      name: "Amit Patel",
      email: "amit.patel@example.com",
      phone: "7654321098",
      address: "789 Oak St, Bangalore, India",
      idType: "Aadhar",
      idNumber: "5678-9012-3456"
    },
    {
      id: "CUST004",
      name: "Ananya Desai",
      email: "ananya.desai@example.com",
      phone: "6543210987",
      address: "101 Pine Rd, Hyderabad, India",
      idType: "Driving License",
      idNumber: "DL98765432"
    },
    {
      id: "CUST005",
      name: "Vikram Malhotra",
      email: "vikram.malhotra@example.com",
      phone: "9876123456",
      address: "202 Cedar Ln, Chennai, India",
      idType: "Passport",
      idNumber: "P1234567"
    }
  ];
  return mockCustomers;
};

export const generateMockBookings = (rooms: Room[], customers: Customer[]): Booking[] => {
  // Find booked rooms
  const bookedRooms = rooms.filter(room => room.status === 'booked');
  
  if (bookedRooms.length === 0 || customers.length === 0) return [];
  
  const mockBookings: Booking[] = [];
  
  bookedRooms.forEach((room, index) => {
    const customerId = customers[index % customers.length].id;
    const customerName = customers[index % customers.length].name;
    
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() - Math.floor(Math.random() * 5));
    
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 1 + Math.floor(Math.random() * 5));
    
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    mockBookings.push({
      id: `BK${1000 + index}`,
      roomId: room.id,
      customerId,
      customerName,
      checkInDate: checkInDate.toISOString().split('T')[0],
      checkOutDate: checkOutDate.toISOString().split('T')[0],
      status: 'active',
      totalAmount: room.price * diffDays,
    });
  });
  
  return mockBookings;
};
