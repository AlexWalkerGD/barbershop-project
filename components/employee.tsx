"use client"

interface EmployeeProps {
  employee: {
    id: string
    name: string | null
    image: string | null
    role: "EMPLOYEE"
  }
  isSelected: boolean
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onSelect: (employee: any) => void
}

const Employee = ({ employee, isSelected, onSelect }: EmployeeProps) => {
  return (
    <div
      onClick={() => onSelect(employee)}
      className={`flex w-24 cursor-pointer flex-col items-center rounded-md p-2 ${isSelected ? "ring-2 ring-primary" : "hover:bg-muted"} `}
    >
      <img
        src={employee.image ?? "/avatar.png"}
        className="h-12 w-12 rounded-full"
      />

      <span className="mt-1 text-center text-sm">{employee.name}</span>
    </div>
  )
}

export default Employee
