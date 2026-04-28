import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Employee } from '../../shared/types'

interface EmployeeState {
  currentEmployee: Employee | null
  setEmployee: (employee: Employee) => void
  logout: () => void
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      currentEmployee: null,
      setEmployee: (employee) => set({ currentEmployee: employee }),
      logout: () => set({ currentEmployee: null }),
    }),
    {
      name: 'myclock-employee-storage', // name of the item in the storage (must be unique)
    }
  )
)
