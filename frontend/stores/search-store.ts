import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface GuestCounts {
  adults: number
  children: number
  infants: number
  pets: number
}

interface SearchState {
  location: string
  checkInDate: Date | undefined
  checkOutDate: Date | undefined
  guests: GuestCounts
  totalGuests: number
  setLocation: (location: string) => void
  setCheckInDate: (date: Date | undefined) => void
  setCheckOutDate: (date: Date | undefined) => void
  setGuests: (guests: Partial<GuestCounts>) => void
  incrementGuest: (type: keyof GuestCounts) => void
  decrementGuest: (type: keyof GuestCounts) => void
  getTotalGuests: () => number
  clearSearch: () => void
  setSearchFromParams: (params: URLSearchParams) => void
}

const calculateTotalGuests = (guests: GuestCounts) => {
  return guests.adults + guests.children
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      location: "",
      checkInDate: undefined,
      checkOutDate: undefined,
      guests: {
        adults: 2,
        children: 0,
        infants: 0,
        pets: 0,
      },
      totalGuests: 2,

      setLocation: (location) => set({ location }),

      setCheckInDate: (date) => set({ checkInDate: date }),

      setCheckOutDate: (date) => set({ checkOutDate: date }),

      setGuests: (newGuests) =>
        set((state) => {
          const updatedGuests = { ...state.guests, ...newGuests }
          const totalGuests = calculateTotalGuests(updatedGuests)
          return { guests: updatedGuests, totalGuests }
        }),

      incrementGuest: (type) =>
        set((state) => {
          const newGuests = { ...state.guests }
          const currentTotal = calculateTotalGuests(newGuests)

          if (type === "adults" && newGuests.adults < 16) {
            newGuests.adults += 1
          } else if (type === "children" && newGuests.children < 5 && currentTotal < 16) {
            newGuests.children += 1
          } else if (type === "infants" && newGuests.infants < 5) {
            newGuests.infants += 1
          } else if (type === "pets" && newGuests.pets < 5) {
            newGuests.pets += 1
          } else {
            return state // No change if limits are reached
          }

          const totalGuests = calculateTotalGuests(newGuests)
          return { guests: newGuests, totalGuests }
        }),

      decrementGuest: (type) =>
        set((state) => {
          const newGuests = { ...state.guests }

          if (type === "adults" && newGuests.adults > 1) {
            newGuests.adults -= 1
          } else if (type === "children" && newGuests.children > 0) {
            newGuests.children -= 1
          } else if (type === "infants" && newGuests.infants > 0) {
            newGuests.infants -= 1
          } else if (type === "pets" && newGuests.pets > 0) {
            newGuests.pets -= 1
          } else {
            return state // No change if limits are reached
          }

          const totalGuests = calculateTotalGuests(newGuests)
          return { guests: newGuests, totalGuests }
        }),

      getTotalGuests: () => {
        const { guests } = get()
        return calculateTotalGuests(guests)
      },

      clearSearch: () =>
        set({
          location: "",
          checkInDate: undefined,
          checkOutDate: undefined,
          guests: { adults: 2, children: 0, infants: 0, pets: 0 },
          totalGuests: 2,
        }),

      setSearchFromParams: (params) => {
        const currentState = get()
        const location = params.get("location") || ""
        const checkIn = params.get("checkIn")
        const checkOut = params.get("checkOut")
        const adults = Math.max(1, Math.min(16, Number.parseInt(params.get("adults") || "2")))
        const children = Math.max(0, Math.min(5, Number.parseInt(params.get("children") || "0")))

        // Only update if values have actually changed
        const newCheckInDate = checkIn ? new Date(checkIn) : undefined
        const newCheckOutDate = checkOut ? new Date(checkOut) : undefined

        const hasLocationChanged = currentState.location !== location
        const hasCheckInChanged = (currentState.checkInDate?.getTime() || 0) !== (newCheckInDate?.getTime() || 0)
        const hasCheckOutChanged = (currentState.checkOutDate?.getTime() || 0) !== (newCheckOutDate?.getTime() || 0)
        const hasGuestsChanged = currentState.guests.adults !== adults || currentState.guests.children !== children

        if (hasLocationChanged || hasCheckInChanged || hasCheckOutChanged || hasGuestsChanged) {
          const newGuests = { adults, children, infants: 0, pets: 0 }
          const totalGuests = calculateTotalGuests(newGuests)

          set({
            location,
            checkInDate: newCheckInDate,
            checkOutDate: newCheckOutDate,
            guests: newGuests,
            totalGuests,
          })
        }
      },
    }),
    {
      name: "search-store",
      partialize: (state) => ({
        location: state.location,
        checkInDate: state.checkInDate,
        checkOutDate: state.checkOutDate,
        guests: state.guests,
        totalGuests: state.totalGuests,
      }),
    },
  ),
)
