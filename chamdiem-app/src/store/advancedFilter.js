import { ref, computed, watch } from 'vue'
import { currentUser } from './db.js'
import { readPref, writePref } from './userPrefs.js'
import { formatDate } from './scoring.js'

/* ═══ Lọc nâng cao — điều kiện theo kiểu dữ liệu của trường ═══
   field: { key, label, type: 'text' | 'enum' | 'number' | 'date', options?: [{value,label}] | string[], get(row) } */

import { OPERATORS, NO_VALUE_OPS, RANGE_OPS, optionsOf, hasValue, isComplete, matchCondition, newCondition, describe as describeBase } from '@mds/utils/advancedFilter.js'
export { OPERATORS, NO_VALUE_OPS, RANGE_OPS, optionsOf, hasValue, isComplete, matchCondition, newCondition }
/** Mô tả điều kiện cho chip — ngày theo định dạng của app */
export const describe = (c, field) => describeBase(c, field, formatDate)

/** Bộ lọc nâng cao của 1 bảng, lưu localStorage theo `key` */
export function useAdvancedFilter(key, fields) {
  // Lưu theo TỪNG NGƯỜI DÙNG (khóa cũ lưu chung 'chamdiem-filter-…' → chuyển sang người dùng hiện tại)
  const PREF = 'filter-' + key
  const filter = ref(readPref(PREF, { mode: 'all', conditions: [] }, 'chamdiem-filter-' + key))
  watch(() => currentUser.value?.id, () => { filter.value = readPref(PREF, { mode: 'all', conditions: [] }) })

  const fieldOf = k => fields.value.find(f => f.key === k)
  const active = computed(() => filter.value.conditions.filter(c => isComplete(c) && fieldOf(c.key)))

  function apply(next) {
    filter.value = JSON.parse(JSON.stringify(next))
    writePref(PREF, filter.value)
  }
  const remove = id => apply({ ...filter.value, conditions: filter.value.conditions.filter(c => c.id !== id) })
  const clear  = () => apply({ ...filter.value, conditions: [] })

  function test(row) {
    if (!active.value.length) return true
    const hits = active.value.map(c => matchCondition(row, c, fieldOf(c.key)))
    return filter.value.mode === 'any' ? hits.some(Boolean) : hits.every(Boolean)
  }

  return { filter, active, fieldOf, apply, remove, clear, test }
}
