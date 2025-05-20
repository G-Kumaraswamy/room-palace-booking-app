
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Customer } from "@/types";
import { generateMockCustomers } from "@/lib/mockData";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [customerForm, setCustomerForm] = useState<Omit<Customer, "id">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    idType: "",
    idNumber: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load customers from localStorage on component mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem("customers");
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      // Generate mock customers if none exist
      const generatedCustomers = generateMockCustomers();
      setCustomers(generatedCustomers);
      localStorage.setItem("customers", JSON.stringify(generatedCustomers));
    }
  }, []);
  
  // Save customers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);
  
  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      // Editing existing customer
      setIsEditing(true);
      setSelectedCustomerId(customer.id);
      setCustomerForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || "",
        idType: customer.idType || "",
        idNumber: customer.idNumber || "",
      });
    } else {
      // Adding new customer
      setIsEditing(false);
      setSelectedCustomerId(null);
      setCustomerForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        idType: "",
        idNumber: "",
      });
    }
    
    setErrors({});
    setIsDialogOpen(true);
  };
  
  const validateCustomerForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerForm.name.trim()) {
      newErrors.name = "Customer name is required";
    }
    
    if (!customerForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerForm.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!customerForm.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(customerForm.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone number should be 10 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCustomerForm()) {
      return;
    }
    
    if (isEditing && selectedCustomerId) {
      // Update existing customer
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomerId 
          ? { ...customer, ...customerForm }
          : customer
      ));
      toast.success("Customer updated successfully!");
    } else {
      // Add new customer
      const newCustomer: Customer = {
        id: `CUST${(customers.length + 1).toString().padStart(3, '0')}`,
        ...customerForm
      };
      
      setCustomers([...customers, newCustomer]);
      toast.success("Customer added successfully!");
    }
    
    resetForm();
  };
  
  const resetForm = () => {
    setCustomerForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      idType: "",
      idNumber: "",
    });
    setErrors({});
    setIsDialogOpen(false);
  };
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
            Add New Customer
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center p-10">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Customers Found</h3>
              <p className="text-muted-foreground mt-2 mb-4">You haven't added any customers yet.</p>
              <Button onClick={() => handleOpenDialog()}>Add Your First Customer</Button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No matching customers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>ID Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted">
                      <TableCell className="font-medium">{customer.id}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.idType || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(customer)}
                        >
                          Edit
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitCustomer} className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Enter customer name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className={errors.phone ? "border-red-500" : ""}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="Customer's address"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type (Optional)</Label>
                  <Input
                    id="idType"
                    value={customerForm.idType}
                    onChange={(e) => setCustomerForm({ ...customerForm, idType: e.target.value })}
                    placeholder="Aadhar, PAN, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number (Optional)</Label>
                  <Input
                    id="idNumber"
                    value={customerForm.idNumber}
                    onChange={(e) => setCustomerForm({ ...customerForm, idNumber: e.target.value })}
                    placeholder="ID document number"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Customer" : "Add Customer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
