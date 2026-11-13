/* Avatar chữ cái đầu — dùng ĐÚNG quy tắc chung của mds-ui (giống DataTable): nền nhạt theo tên · chữ --text-primary · viền nhạt */
import { avatarInitials, avatarColor } from '@mds/utils/avatar.js'
export const initials = avatarInitials
export const avatarStyle = (name = '') => ({ background: avatarColor(name).bg })

/* ═══ Avatar con vật hoạt hình (Microsoft Fluent Emoji 3D — MIT, public/avatars/animals) cho người CHƯA tải ảnh đại diện ═══
   Gán CỐ ĐỊNH theo tài khoản (băm id): mỗi người luôn là 1 con, ở mọi chỗ trong app; tài khoản mới tự có con của mình.
   Đã tải ảnh lên → dùng ảnh đó. Nền pastel đã nướng sẵn trong ảnh (96×96). */
export const ANIMALS = ['owl', 'dog_face', 'cat_face', 'fox', 'panda', 'koala', 'tiger_face', 'rabbit_face', 'bear', 'frog', 'penguin',
  'monkey_face', 'hamster', 'mouse_face', 'lion', 'cow_face', 'pig_face', 'chicken', 'unicorn', 'hatching_chick', 'wolf', 'boar']
const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
export const animalAvatar = key => (key ? `/avatars/animals/${ANIMALS[hash(key) % ANIMALS.length]}.png` : '')
/** Ảnh đại diện để HIỂN THỊ: ảnh đã tải lên → ảnh đó · chưa có → con vật cố định theo tài khoản */
export const avatarOf = u => (u ? (u.picture || animalAvatar(u.id || u.code || u.name)) : '')
