import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export function AnimatedCounter({ value = 0, duration = 1.1, format = (v) => String(Math.round(v)) }) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 })
  const display = useTransform(spring, (current) => format(current))
  const [text, setText] = useState(format(0))
  const mounted = useRef(false)

  useEffect(() => {
    spring.set(Number(value) || 0)
  }, [spring, value])

  useEffect(() => {
    const unsub = display.on('change', (next) => setText(next))
    return () => unsub()
  }, [display])

  useEffect(() => {
    mounted.current = true
  }, [])

  return (
    <motion.span
      initial={mounted.current ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-live="polite"
    >
      {text}
    </motion.span>
  )
}
