export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
export const isPhone = (v: string): boolean => /^[+()\d\s.-]{7,20}$/.test(v.trim())
export const isUrlLike = (v: string): boolean => /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/.test(v.trim())
export const isNpi = (v: string): boolean => /^\d{10}$/.test(v.trim())
export const isZip = (v: string): boolean => /^[A-Za-z0-9 -]{3,10}$/.test(v.trim())

/** Returns true when v parses to a finite number within [min, max]. */
export const inRange = (v: number, min: number, max: number): boolean => Number.isFinite(v) && v >= min && v <= max
