import {MAX_AVATARS} from './constants'

// export const splitRight = <T>(array: T[]): T[] => {
//   const indexFromMax = array.length > MAX_AVATARS ? MAX_AVATARS - 1 : MAX_AVATARS
//   const idx = Math.max(0, array.length - indexFromMax)
//   return [array.slice(0, idx), array.slice(idx)]
// }

export const splitRight = <T>(array: T[], index: number): [T[], T[]] => {
  const idx = Math.max(0, array.length - index)
  return [array.slice(0, idx), array.slice(idx)]
}
