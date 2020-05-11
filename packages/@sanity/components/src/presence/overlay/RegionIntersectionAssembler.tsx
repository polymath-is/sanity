/* eslint-disable react/no-multi-comp */
import * as React from 'react'
import {createIntersectionObserver} from './intersectionObserver'
import {tap} from 'rxjs/operators'
import {
  SNAP_TO_DOCK_DISTANCE_BOTTOM,
  SNAP_TO_DOCK_DISTANCE_TOP,
  DEBUG,
  INTERSECTION_ELEMENT_PADDING,
  INTERSECTION_THRESHOLDS
} from '../constants'

const OVERLAY_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  background: DEBUG ? 'rgba(255, 255, 0, 0.25)' : '',
  zIndex: 5
}

const OVERLAY_ITEM_STYLE: React.CSSProperties = {
  background: DEBUG ? 'rgba(255, 0, 0, 0.25)' : '',
  overflow: 'hidden',
  pointerEvents: 'none',
  outline: '1px solid #00b',
  position: 'absolute'
}

// TODO: type this
const WithIntersection = props => {
  const {onIntersection, io, id, ...rest} = props
  const element = React.useRef()
  React.useEffect(() => {
    const sub = io
      .observe(element.current)
      .pipe(tap(entry => onIntersection(id, entry)))
      .subscribe()
    return () => sub.unsubscribe()
  }, [io])

  return <div ref={element} {...rest} />
}

type Props = {
  regions: any[]
  render: (regionsWithIntersectionDetails: any[]) => React.ReactElement
  children: React.ReactElement
  trackerRef: React.RefObject<any>
}

export function RegionIntersectionAssembler(props: Props) {
  const {regions, render, children, trackerRef} = props

  const io = React.useMemo(
    () =>
      createIntersectionObserver({
        threshold: INTERSECTION_THRESHOLDS
      }),
    []
  )

  const [intersections, setIntersections] = React.useState({})

  const onIntersection = React.useCallback((id, entry) => {
    setIntersections(current => ({...current, [id]: entry}))
  }, [])

  const top = intersections['::top']
  const bottom = intersections['::bottom']
  const regionsWithIntersectionDetails =
    top && bottom
      ? regions
          .map(region => {
            const intersection = intersections[region.id]
            if (!intersection) {
              return null
            }

            const {bottom: boundsBottom, top: boundsTop} = intersection.boundingClientRect

            const aboveTop = intersection.boundingClientRect.top < top.boundingClientRect.bottom
            const belowBottom = intersection.boundingClientRect.top < bottom.boundingClientRect.top

            const distanceTop = intersection.isIntersecting
              ? boundsTop - (intersection.intersectionRect.top - INTERSECTION_ELEMENT_PADDING)
              : aboveTop
              ? -top.boundingClientRect.bottom
              : bottom.boundingClientRect.top

            const distanceBottom = intersection.isIntersecting
              ? -(
                  boundsBottom -
                  (intersection.intersectionRect.bottom + INTERSECTION_ELEMENT_PADDING)
                )
              : belowBottom
              ? bottom.boundingClientRect.top
              : -top.boundingClientRect.bottom

            const position =
              distanceTop < SNAP_TO_DOCK_DISTANCE_TOP
                ? 'top'
                : distanceBottom < SNAP_TO_DOCK_DISTANCE_BOTTOM
                ? 'bottom'
                : 'inside'
            return {
              distanceTop,
              distanceBottom,
              region,
              position
            }
          })
          .filter(Boolean)
      : []

  return (
    <div ref={trackerRef} style={{position: 'relative'}}>
      <WithIntersection
        io={io}
        id="::top"
        onIntersection={onIntersection}
        style={{
          position: 'sticky',
          top: 0,
          height: 1,
          backgroundColor: DEBUG ? 'red' : 'none'
        }}
      />
      <div>{children}</div>
      <div style={OVERLAY_STYLE}>{render(regionsWithIntersectionDetails)}</div>
      <div style={OVERLAY_STYLE}>
        {regions.map(region => {
          const forceWidth = region.rect.width === 0
          return (
            <WithIntersection
              io={io}
              onIntersection={onIntersection}
              key={region.id}
              id={region.id}
              style={{
                ...OVERLAY_ITEM_STYLE,
                width: forceWidth ? 1 : region.rect.width,
                left: region.rect.left - (forceWidth ? 1 : 0),
                top: region.rect.top - INTERSECTION_ELEMENT_PADDING,
                height: region.rect.height + INTERSECTION_ELEMENT_PADDING * 2,
                visibility: DEBUG ? 'visible' : 'hidden'
              }}
            />
          )
        })}
      </div>
      <div style={{padding: 20}} />
      <WithIntersection
        id="::bottom"
        io={io}
        onIntersection={onIntersection}
        style={{
          position: 'sticky',
          bottom: 0,
          height: 1,
          backgroundColor: DEBUG ? 'blue' : 'none'
        }}
      />
    </div>
  )
}
