"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { OrderShippingAddress } from "@/models/order"
import { MapPin, Phone, Mail, Home, Building, Map, User } from "lucide-react"

interface ShippingAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (address: OrderShippingAddress) => void
  initialAddress?: OrderShippingAddress
  title?: string
  description?: string
}

export function ShippingAddressDialog({
  open,
  onOpenChange,
  onSave,
  initialAddress,
  title = "Update Shipping Address",
  description = "Update the shipping address for this order."
}: ShippingAddressDialogProps) {
  const [address, setAddress] = useState<OrderShippingAddress>(initialAddress || {
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    apartment: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    deliveryInstructions: "",
    addressType: "home",
    isDefault: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(address)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="contactName">Full Name</Label>
                <Input
                  id="contactName"
                  value={address.contactName}
                  onChange={(e) => setAddress({ ...address, contactName: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  value={address.contactPhone}
                  onChange={(e) => setAddress({ ...address, contactPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={address.contactEmail}
                  onChange={(e) => setAddress({ ...address, contactEmail: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address Details
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="123 Main Street"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apartment">Apartment/Suite</Label>
                <Input
                  id="apartment"
                  value={address.apartment}
                  onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                  placeholder="Apt 4B"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="New York"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="NY"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input
                    id="zip"
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    placeholder="10001"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    placeholder="United States"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="addressType">Address Type</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select the type of address
                </p>
              </div>
              <Select
                value={address.addressType}
                onValueChange={(value: 'home' | 'business' | 'other') => setAddress({ ...address, addressType: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="business">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>Business</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      <span>Other</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isDefault">Set as Default</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Use this address for future orders
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={address.isDefault}
                onCheckedChange={(checked) => setAddress({ ...address, isDefault: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
              <Textarea
                id="deliveryInstructions"
                value={address.deliveryInstructions}
                onChange={(e) => setAddress({ ...address, deliveryInstructions: e.target.value })}
                placeholder="Add any special delivery instructions..."
                className="h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              Save Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 