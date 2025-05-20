
export interface Room {
  id: string;
  roomNumber: string;
  type: 'AC' | 'Non-AC';
  price: number;
  status: 'available' | 'booked' | 'maintenance';
  floor: string;
}

export interface Booking {
  id: string;
  roomId: string;
  customerId: string;
  customerName: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalAmount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  idType?: string;
  idNumber?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerName: string;
  roomNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
}
