import { useContext } from 'react'
import { DesignContext } from '../context/DesignContextBase'

export function useDesign() {
  const value = useContext(DesignContext)
  if (!value) throw new Error('useDesign must be used inside DesignProvider')
  return value
}
