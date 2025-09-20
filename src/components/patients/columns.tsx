import { ColumnDef } from "@tanstack/react-table"
import { Patient } from "@/lib/db/types"

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
]
