"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowLeft, Calendar, Users, CreditCard, Shield, CheckCircle, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { format } from "date-fns"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  useReservationStore,
  type ReservationDetails,
  type GuestDetails,
  type PaymentDetails,
} from "@/stores/reservation-store"
import { useAuth } from "@/contexts/auth-context"
import { useBooking } from "@/contexts/booking-context"

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: ReservationDetails
}

export function ReservationModal({ isOpen, onClose, reservation }: ReservationModalProps) {
  const { user } = useAuth()
  const { addBooking } = useBooking()
  const { toast } = useToast()
  const router = useRouter()

  const {
    currentStep,
    guestDetails,
    paymentDetails,
    isProcessing,
    setCurrentStep,
    setGuestDetails,
    setPaymentDetails,
    setProcessing,
    nextStep,
    prevStep,
    resetReservation,
  } = useReservationStore()

  const [localGuestDetails, setLocalGuestDetails] = useState<GuestDetails>({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    specialRequests: "",
  })

  const [localPaymentDetails, setLocalPaymentDetails] = useState<PaymentDetails>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
  })

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
    } else {
      resetReservation()
    }
  }, [isOpen, setCurrentStep, resetReservation])

  const handleClose = () => {
    resetReservation()
    onClose()
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate guest details
      if (
        !localGuestDetails.firstName ||
        !localGuestDetails.lastName ||
        !localGuestDetails.email ||
        !localGuestDetails.phone
      ) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }
      setGuestDetails(localGuestDetails)
    } else if (currentStep === 2) {
      // Validate payment details
      if (
        !localPaymentDetails.cardNumber ||
        !localPaymentDetails.expiryDate ||
        !localPaymentDetails.cvv ||
        !localPaymentDetails.cardholderName
      ) {
        toast({
          title: "Missing Payment Information",
          description: "Please fill in all payment details",
          variant: "destructive",
        })
        return
      }
      setPaymentDetails(localPaymentDetails)
    }
    nextStep()
  }

  const handleConfirmBooking = async () => {
    setProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const booking = {
      propertyId: reservation.propertyId,
      propertyTitle: reservation.propertyTitle,
      propertyImage: reservation.propertyImage,
      hostName: reservation.hostName,
      checkIn: format(reservation.checkInDate, "yyyy-MM-dd"),
      checkOut: format(reservation.checkOutDate, "yyyy-MM-dd"),
      guests: reservation.guests.adults + reservation.guests.children,
      totalPrice: reservation.total,
      status: "confirmed" as const,
    }

    addBooking(booking)
    setProcessing(false)

    toast({
      title: "Booking Confirmed!",
      description: "Your reservation has been confirmed. You'll receive a confirmation email shortly.",
    })

    handleClose()
    router.push("/dashboard/bookings")
  }

  const stepTitles = ["Your trip", "Payment details", "Confirm and pay"]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Left side - Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {currentStep > 1 && (
                  <Button variant="ghost" size="sm" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{stepTitles[currentStep - 1]}</h2>
                  <p className="text-gray-600">Step {currentStep} of 3</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1 flex-1 rounded-full ${step <= currentStep ? "bg-rose-500" : "bg-gray-200"}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Guest Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Who's coming?</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First name *</Label>
                        <Input
                          id="firstName"
                          value={localGuestDetails.firstName}
                          onChange={(e) => setLocalGuestDetails((prev) => ({ ...prev, firstName: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last name *</Label>
                        <Input
                          id="lastName"
                          value={localGuestDetails.lastName}
                          onChange={(e) => setLocalGuestDetails((prev) => ({ ...prev, lastName: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={localGuestDetails.email}
                      onChange={(e) => setLocalGuestDetails((prev) => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={localGuestDetails.phone}
                      onChange={(e) => setLocalGuestDetails((prev) => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Special requests (optional)</Label>
                    <Textarea
                      id="specialRequests"
                      value={localGuestDetails.specialRequests}
                      onChange={(e) => setLocalGuestDetails((prev) => ({ ...prev, specialRequests: e.target.value }))}
                      placeholder="Any special requests or accessibility needs?"
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Your information is secure</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      We use secure encryption to protect your personal information.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payment method</h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={localPaymentDetails.cardNumber}
                          onChange={(e) => setLocalPaymentDetails((prev) => ({ ...prev, cardNumber: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={localPaymentDetails.expiryDate}
                            onChange={(e) =>
                              setLocalPaymentDetails((prev) => ({ ...prev, expiryDate: e.target.value }))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={localPaymentDetails.cvv}
                            onChange={(e) => setLocalPaymentDetails((prev) => ({ ...prev, cvv: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardholderName">Cardholder name *</Label>
                        <Input
                          id="cardholderName"
                          value={localPaymentDetails.cardholderName}
                          onChange={(e) =>
                            setLocalPaymentDetails((prev) => ({ ...prev, cardholderName: e.target.value }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Billing address</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="street">Street address</Label>
                        <Input
                          id="street"
                          value={localPaymentDetails.billingAddress.street}
                          onChange={(e) =>
                            setLocalPaymentDetails((prev) => ({
                              ...prev,
                              billingAddress: { ...prev.billingAddress, street: e.target.value },
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={localPaymentDetails.billingAddress.city}
                            onChange={(e) =>
                              setLocalPaymentDetails((prev) => ({
                                ...prev,
                                billingAddress: { ...prev.billingAddress, city: e.target.value },
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={localPaymentDetails.billingAddress.state}
                            onChange={(e) =>
                              setLocalPaymentDetails((prev) => ({
                                ...prev,
                                billingAddress: { ...prev.billingAddress, state: e.target.value },
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Secure payment</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your payment information is encrypted and secure. We accept all major credit cards.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Review your booking</h3>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {format(reservation.checkInDate, "MMM dd, yyyy")} -{" "}
                            {format(reservation.checkOutDate, "MMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-gray-600">{reservation.nights} nights</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {reservation.guests.adults + reservation.guests.children} guests
                          </p>
                          <p className="text-sm text-gray-600">
                            {reservation.guests.adults} adults
                            {reservation.guests.children > 0 && `, ${reservation.guests.children} children`}
                            {reservation.guests.infants > 0 && `, ${reservation.guests.infants} infants`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Guest details</h4>
                    <p className="text-sm text-gray-600">
                      {guestDetails?.firstName} {guestDetails?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{guestDetails?.email}</p>
                    <p className="text-sm text-gray-600">{guestDetails?.phone}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Payment method</h4>
                    <p className="text-sm text-gray-600">•••• •••• •••• {paymentDetails?.cardNumber.slice(-4)}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Free cancellation</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cancel before {format(reservation.checkInDate, "MMM dd")} for a full refund.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div></div>
              <div className="flex gap-3">
                {currentStep < 3 ? (
                  <Button onClick={handleNextStep} className="bg-rose-500 hover:bg-rose-600">
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleConfirmBooking}
                    disabled={isProcessing}
                    className="bg-rose-500 hover:bg-rose-600"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      `Confirm and pay $${reservation.total}`
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Booking summary */}
          <div className="w-80 bg-gray-50 p-6 border-l">
            <Card className="sticky top-0">
              <CardContent className="p-4">
                <div className="flex gap-3 mb-4">
                  <Image
                    src={reservation.propertyImage || "/placeholder.svg"}
                    alt={reservation.propertyTitle}
                    width={80}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{reservation.propertyTitle}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">4.9 (127 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{reservation.location}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>
                      ${reservation.propertyPrice} x {reservation.nights} nights
                    </span>
                    <span>${reservation.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>${reservation.cleaningFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>${reservation.serviceFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>${reservation.taxes}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total (USD)</span>
                    <span>${reservation.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
