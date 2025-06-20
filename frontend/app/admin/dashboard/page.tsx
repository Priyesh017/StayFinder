"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Home,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/auth/useAuth";
import {
  useProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
} from "@/hooks/properties/useProperties";
import { useHostBookings } from "@/hooks/booking/useBooking";
import { Property } from "@/types/property";
import { Booking } from "@/types/booking";

export default function AdminDashboard() {
  const admin = useCurrentUser();
  const properties = useProperties();
  const addProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const bookings = useHostBookings();
  const { toast } = useToast();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [newProperty, setNewProperty] = useState({
    title: "",
    description: "",
    location: "",
    price: 0,
    type: "",
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    category: "",
    amenities: [] as string[],
    highlights: [] as string[],
    status: "active" as const,
  });

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login");
    }
  }, [admin, router]);

  if (!admin) {
    return null;
  }

  const filteredProperties = (properties.data?.data ?? []).filter(
    (property: Property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = (bookings.data?.data ?? []).reduce(
    (sum: number, booking: Booking) => sum + booking.totalPrice,
    0
  );
  const totalUsers = 150; // Mock data
  const activeProperties = (properties.data?.data ?? []).filter(
    (p: Property) => p.status === "active"
  ).length;

  const handleAddProperty = () => {
    if (!newProperty.title || !newProperty.location || !newProperty.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const propertyData = {
      ...newProperty,
      images: ["/placeholder.svg?height=300&width=400"],
      host: {
        id: "admin-host-id",
        name: "Admin Host",
        avatar: "/placeholder-user.jpg",
        joinDate: "2024",
        isSuperhost: false,
        responseRate: "100%",
        responseTime: "within an hour",
      },
      rating: 4.5,
      reviews: 0,
      amenities:
        newProperty.amenities.length > 0
          ? newProperty.amenities
          : ["WiFi", "Kitchen"],
      highlights:
        newProperty.highlights.length > 0
          ? newProperty.highlights
          : ["Great location", "Clean space"],
    };

    addProperty.mutate(propertyData);
    setIsAddDialogOpen(false);
    setNewProperty({
      title: "",
      description: "",
      location: "",
      price: 0,
      type: "",
      guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      category: "",
      amenities: [],
      highlights: [],
      status: "active",
    });
    toast({
      title: "Success",
      description: "Property added successfully",
    });
  };

  const handleEditProperty = () => {
    if (!editingProperty) return;

    updateProperty.mutate({ id: editingProperty.id, data: editingProperty });
    setIsEditDialogOpen(false);
    setEditingProperty(null);
    toast({
      title: "Success",
      description: "Property updated successfully",
    });
  };

  const handleDeleteProperty = (id: string) => {
    deleteProperty.mutate(id);
    toast({
      title: "Success",
      description: "Property deleted successfully",
    });
  };

  const handleAmenityToggle = (amenity: string, isNew = false) => {
    if (isNew) {
      setNewProperty((prev) => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      }));
    } else if (editingProperty) {
      setEditingProperty((prev) =>
        prev
          ? {
              ...prev,
              amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
            }
          : null
      );
    }
  };

  const availableAmenities = [
    "WiFi",
    "Kitchen",
    "Parking",
    "Pool",
    "Hot tub",
    "Fireplace",
    "Beach access",
    "Gym",
    "Rooftop",
    "Garden",
    "Ocean view",
    "Ski access",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {admin.data?.firstName}
              </p>
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem("stayfinder_host_token");
                router.push("/admin/login");
              }}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Properties
                  </CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeProperties}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {(properties.data?.data ?? []).length} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Bookings
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(bookings.data?.data ?? []).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest reservation activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(bookings.data?.data ?? [])
                      .slice(0, 5)
                      .map((booking: Booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <Image
                              src={
                                booking.listing.images[0] || "/placeholder.svg"
                              }
                              alt={booking.listing.title}
                              width={60}
                              height={45}
                              className="rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold truncate">
                                {booking.listing.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Host:{" "}
                                {booking.listing.host.firstName +
                                  " " +
                                  booking.listing.host.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.checkIn} - {booking.checkOut}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <Badge
                              variant={
                                booking.status === "CONFIRMED"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                            <span className="font-semibold">
                              ${booking.totalPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            {/* Properties Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Properties Management</CardTitle>
                      <CardDescription>
                        Manage all property listings
                      </CardDescription>
                    </div>
                    <Dialog
                      open={isAddDialogOpen}
                      onOpenChange={setIsAddDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Property
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Property</DialogTitle>
                          <DialogDescription>
                            Create a new property listing
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">Title *</Label>
                              <Input
                                id="title"
                                value={newProperty.title}
                                onChange={(e) =>
                                  setNewProperty({
                                    ...newProperty,
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Property title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location">Location *</Label>
                              <Input
                                id="location"
                                value={newProperty.location}
                                onChange={(e) =>
                                  setNewProperty({
                                    ...newProperty,
                                    location: e.target.value,
                                  })
                                }
                                placeholder="City, State"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={newProperty.description}
                              onChange={(e) =>
                                setNewProperty({
                                  ...newProperty,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Property description"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor="price">Price/night *</Label>
                              <Input
                                id="price"
                                type="number"
                                value={newProperty.price}
                                onChange={(e) =>
                                  setNewProperty({
                                    ...newProperty,
                                    price: Number(e.target.value),
                                  })
                                }
                                placeholder="120"
                              />
                            </div>
                            <div>
                              <Label htmlFor="guests">Guests</Label>
                              <Input
                                id="guests"
                                type="number"
                                value={newProperty.guests}
                                onChange={(e) =>
                                  setNewProperty({
                                    ...newProperty,
                                    guests: Number(e.target.value),
                                  })
                                }
                                placeholder="4"
                              />
                            </div>
                            <div>
                              <Label htmlFor="bedrooms">Bedrooms</Label>
                              <Input
                                id="bedrooms"
                                type="number"
                                value={newProperty.bedrooms}
                                onChange={(e) =>
                                  setNewProperty({
                                    ...newProperty,
                                    bedrooms: Number(e.target.value),
                                  })
                                }
                                placeholder="2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="bathrooms">Bathrooms</Label>
                              <Input
                                id="bathrooms"
                                type="number"
                                value={newProperty.bathrooms}
                                onChange={(e) =>
                                  setNewProperty({
                                    ...newProperty,
                                    bathrooms: Number(e.target.value),
                                  })
                                }
                                placeholder="1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="type">Property Type</Label>
                              <Select
                                value={newProperty.type}
                                onValueChange={(value) =>
                                  setNewProperty({
                                    ...newProperty,
                                    type: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Entire apartment">
                                    Entire apartment
                                  </SelectItem>
                                  <SelectItem value="Entire house">
                                    Entire house
                                  </SelectItem>
                                  <SelectItem value="Entire cabin">
                                    Entire cabin
                                  </SelectItem>
                                  <SelectItem value="Entire villa">
                                    Entire villa
                                  </SelectItem>
                                  <SelectItem value="Private room">
                                    Private room
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="category">Category</Label>
                              <Select
                                value={newProperty.category}
                                onValueChange={(value) =>
                                  setNewProperty({
                                    ...newProperty,
                                    category: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Beachfront">
                                    Beachfront
                                  </SelectItem>
                                  <SelectItem value="Cabins">Cabins</SelectItem>
                                  <SelectItem value="City">City</SelectItem>
                                  <SelectItem value="Countryside">
                                    Countryside
                                  </SelectItem>
                                  <SelectItem value="Luxury">Luxury</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Amenities</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                              {availableAmenities.map((amenity) => (
                                <label
                                  key={amenity}
                                  className="flex items-center space-x-2 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={newProperty.amenities.includes(
                                      amenity
                                    )}
                                    onChange={() =>
                                      handleAmenityToggle(amenity, true)
                                    }
                                    className="rounded"
                                  />
                                  <span className="text-sm">{amenity}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddProperty}>
                            Add Property
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search properties..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Location
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Price
                          </TableHead>
                          <TableHead className="hidden lg:table-cell">
                            Status
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProperties.map((property: Property) => (
                          <TableRow key={property.id}>
                            <TableCell>
                              <Image
                                src={property.images[0] || "/placeholder.svg"}
                                alt={property.title}
                                width={60}
                                height={45}
                                className="rounded-lg object-cover"
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {property.title}
                                </div>
                                <div className="text-sm text-gray-500 sm:hidden">
                                  {property.location}
                                </div>
                                <div className="text-sm text-gray-500 md:hidden">
                                  ${property.price}/night
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {property.location}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              ${property.price}/night
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge
                                variant={
                                  property.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {property.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingProperty(property);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteProperty(property.id)
                                    }
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Edit Property Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Property</DialogTitle>
                  <DialogDescription>
                    Update property information
                  </DialogDescription>
                </DialogHeader>
                {editingProperty && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={editingProperty.title}
                          onChange={(e) =>
                            setEditingProperty({
                              ...editingProperty,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-location">Location</Label>
                        <Input
                          id="edit-location"
                          value={editingProperty.location}
                          onChange={(e) =>
                            setEditingProperty({
                              ...editingProperty,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editingProperty.description}
                        onChange={(e) =>
                          setEditingProperty({
                            ...editingProperty,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="edit-price">Price/night</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          value={editingProperty.price}
                          onChange={(e) =>
                            setEditingProperty({
                              ...editingProperty,
                              price: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-guests">Guests</Label>
                        <Input
                          id="edit-guests"
                          type="number"
                          value={editingProperty.guests}
                          onChange={(e) =>
                            setEditingProperty({
                              ...editingProperty,
                              guests: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-bedrooms">Bedrooms</Label>
                        <Input
                          id="edit-bedrooms"
                          type="number"
                          value={editingProperty.bedrooms}
                          onChange={(e) =>
                            setEditingProperty({
                              ...editingProperty,
                              bedrooms: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-bathrooms">Bathrooms</Label>
                        <Input
                          id="edit-bathrooms"
                          type="number"
                          value={editingProperty.bathrooms}
                          onChange={(e) =>
                            setEditingProperty({
                              ...editingProperty,
                              bathrooms: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-type">Property Type</Label>
                        <Select
                          value={editingProperty.type}
                          onValueChange={(value) =>
                            setEditingProperty({
                              ...editingProperty,
                              type: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entire apartment">
                              Entire apartment
                            </SelectItem>
                            <SelectItem value="Entire house">
                              Entire house
                            </SelectItem>
                            <SelectItem value="Entire cabin">
                              Entire cabin
                            </SelectItem>
                            <SelectItem value="Entire villa">
                              Entire villa
                            </SelectItem>
                            <SelectItem value="Private room">
                              Private room
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-status">Status</Label>
                        <Select
                          value={editingProperty.status}
                          onValueChange={(
                            value: "active" | "inactive" | "pending"
                          ) =>
                            setEditingProperty({
                              ...editingProperty,
                              status: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Amenities</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {availableAmenities.map((amenity) => (
                          <label
                            key={amenity}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={editingProperty.amenities.includes(
                                amenity
                              )}
                              onChange={() =>
                                handleAmenityToggle(amenity, false)
                              }
                              className="rounded"
                            />
                            <span className="text-sm">{amenity}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditProperty}>Update Property</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Bookings Management</CardTitle>
                  <CardDescription>
                    View and manage all bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Guest
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Dates
                          </TableHead>
                          <TableHead className="hidden lg:table-cell">
                            Amount
                          </TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(bookings.data?.data ?? []).map((booking: Booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="font-medium">
                                {booking.listing.title}
                              </div>
                              <div className="text-sm text-gray-500 sm:hidden">
                                Guest: {booking.guests}
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {booking.listing.host.firstName +
                                " " +
                                booking.listing.host.lastName}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {booking.checkIn} - {booking.checkOut}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              ${booking.totalPrice}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  booking.status === "CONFIRMED"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Users Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      User Management
                    </h3>
                    <p className="text-gray-600">
                      User management features coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
