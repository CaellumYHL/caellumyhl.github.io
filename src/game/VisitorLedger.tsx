import { useEffect, useMemo, useState } from 'react'
import {
  CanvasTexture,
  LinearFilter,
  SRGBColorSpace,
} from 'three'

type LedgerStatus = 'loading' | 'ready' | 'preview' | 'unavailable'

interface GoatCounterResponse {
  readonly count?: unknown
}

const isLocalPreview =
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === 'localhost'

const DEFAULT_GOATCOUNTER_CODE = 'caellumyhl'

function goatCounterRoot(): string {
  const configured = import.meta.env.VITE_GOATCOUNTER_CODE?.trim() || DEFAULT_GOATCOUNTER_CODE
  if (configured.startsWith('https://')) return configured.replace(/\/$/, '')
  return `https://${configured.replace(/\.goatcounter\.com\/?$/, '')}.goatcounter.com`
}

function digitsOnly(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const parsed = Number.parseInt(String(value).replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(parsed) ? parsed : null
}

function useVisitorLedger(): { readonly count: number | null; readonly status: LedgerStatus } {
  const root = useMemo(goatCounterRoot, [])
  const [count, setCount] = useState<number | null>(null)
  const [status, setStatus] = useState<LedgerStatus>(() =>
    isLocalPreview ? 'preview' : 'loading',
  )

  useEffect(() => {
    if (isLocalPreview) return

    const controller = new AbortController()
    const timers: number[] = []
    const readCount = async (): Promise<void> => {
      try {
        const response = await fetch(`${root}/counter/TOTAL.json`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Visitor counter returned ${response.status}`)
        const payload = await response.json() as GoatCounterResponse
        const nextCount = digitsOnly(payload.count)
        if (nextCount === null) throw new Error('Visitor counter returned an invalid count')
        setCount(nextCount)
        setStatus('ready')
      } catch (error) {
        if (controller.signal.aborted) return
        console.warn('Visitor ledger is unavailable', error)
        setStatus('unavailable')
      }
    }

    // GoatCounter intentionally ignores localhost. In production it records one
    // canonical visit, regardless of which gallery query-string view was opened.
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-portfolio-counter]')
    if (!existingScript) {
      const globalWindow = window as typeof window & {
        goatcounter?: Record<string, unknown>
      }
      globalWindow.goatcounter = {
        ...(globalWindow.goatcounter ?? {}),
        path: () => '/',
      }
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://gc.zgo.at/count.js'
      script.dataset.goatcounter = `${root}/count`
      script.dataset.portfolioCounter = 'true'
      script.addEventListener('load', () => {
        timers.push(window.setTimeout(() => void readCount(), 1400))
        timers.push(window.setTimeout(() => void readCount(), 11000))
      }, { once: true })
      script.addEventListener('error', () => setStatus('unavailable'), { once: true })
      document.head.append(script)
    } else {
      timers.push(window.setTimeout(() => void readCount(), 250))
    }

    return () => {
      controller.abort()
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [root])

  return { count, status }
}

function groupedCount(count: number | null, status: LedgerStatus): string {
  if (status === 'preview') return '000 001'
  if (count === null) return '—'
  const digits = String(count).padStart(6, '0')
  return digits.replace(/(\d)(?=(\d{3})+$)/g, '$1 ')
}

function createLedgerTexture(count: number | null, status: LedgerStatus): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1400
  canvas.height = 560
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create the visitor ledger')

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  context.strokeStyle = 'rgba(229, 216, 185, .48)'
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(250, 118)
  context.lineTo(510, 118)
  context.moveTo(890, 118)
  context.lineTo(1150, 118)
  context.stroke()

  context.fillStyle = 'rgba(239, 226, 196, .78)'
  context.font = '800 36px Arial, sans-serif'
  context.letterSpacing = '10px'
  context.fillText('VISITOR LEDGER', 700, 120)

  context.fillStyle = 'rgba(247, 235, 205, .92)'
  context.shadowColor = 'rgba(24, 38, 53, .35)'
  context.shadowBlur = 18
  context.font = '500 204px Georgia, serif'
  context.letterSpacing = '13px'
  context.fillText(groupedCount(count, status), 700, 290)
  context.shadowBlur = 0

  const statusLine = status === 'preview'
    ? 'LOCAL PREVIEW'
    : status === 'ready'
      ? 'TOTAL SITE VISITS'
      : status === 'loading'
        ? 'LOADING VISITOR COUNT'
        : 'COUNT TEMPORARILY UNAVAILABLE'
  context.fillStyle = 'rgba(228, 216, 189, .62)'
  context.font = '700 31px Arial, sans-serif'
  context.letterSpacing = '7px'
  context.fillText(statusLine, 700, 440)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

export function VisitorLedger() {
  const { count, status } = useVisitorLedger()
  const texture = useMemo(() => createLedgerTexture(count, status), [count, status])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group position={[0, 0.086, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
        <planeGeometry args={[5.05, 2.02]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
