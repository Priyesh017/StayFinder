import { create } from "zustand"
import type { GuestCounts } from "./search-store"

export interface ReservationDetails {
  propertyId: string
  propertyTitle: string
  propertyImage: string
  propertyPrice: number
  hostName: string
  location: string
  checkInDate: Date
  checkOutDate: Date
  guests: GuestCounts
  nights: number
  subtotal: number
  cleaningFee: number
  serviceFee: number
  taxes: number
  total: number
}

export interface PaymentDetails {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  billingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface GuestDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests?: string
}

interface ReservationState {
  currentStep: number
  reservation: ReservationDetails | null
  guestDetails: GuestDetails | null
  paymentDetails: PaymentDetails | null
  isProcessing: boolean

  // Actions
  setCurrentStep: (step: number) => void
  setReservation: (reservation: ReservationDetails) => void
  setGuestDetails: (details: GuestDetails) => void
  setPaymentDetails: (details: PaymentDetails) => void
  setProcessing: (processing: boolean) => void
  nextStep: () => void
  prevStep: () => void
  resetReservation: () => void
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  currentStep: 1,
  reservation: null,
  guestDetails: null,
  paymentDetails: null,
  isProcessing: false,

  setCurrentStep: (step) => set({ currentStep: step }),

  setReservation: (reservation) => set({ reservation }),

  setGuestDetails: (details) => set({ guestDetails: details }),

  setPaymentDetails: (details) => set({ paymentDetails: details }),

  setProcessing: (processing) => set({ isProcessing: processing }),

  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),

  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  resetReservation: () =>
    set({
      currentStep: 1,
      reservation: null,
      guestDetails: null,
      paymentDetails: null,
      isProcessing: false,
    }),
}))
