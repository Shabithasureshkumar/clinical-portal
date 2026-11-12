export interface ClinicLocation {
  id: string
  name: string
  address: string
  online: boolean
  rooms: string
  providers: string
  hours: string
}

export interface ClinicData {
  counts: { locations: number; rooms: number; providers: number; serviceLines: number }
  locations: ClinicLocation[]
  serviceLines: string[]
}

export interface AddLocationInput {
  name: string
  address: string
}
