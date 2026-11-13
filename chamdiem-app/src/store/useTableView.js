import { ref, computed, watch } from 'vue'
import { pageSizeStore } from './pageSizePref.js'

/**
 * Sắp xếp / lọc theo cột (nhận emit column-sort, column-filter của DataTable) + phân trang.
 * rows: computed mảng dòng hiển thị; sortValue(row, key) trả giá trị thô để so sánh.
 */
export function useTableView(rows, { sortValue = (r, k) => r[k], textValue, defaultSort = null } = {}) {
  const sort    = ref(defaultSort)     // { key, dir } — defaultSort: sắp xếp mặc định khi mở (VD điểm cao nhất lên đầu)
  const filters = ref({})              // { key: { condition, value } }
  const page     = ref(1)
  const saved    = pageSizeStore.get()
  const pageSize = ref([20, 50, 100].includes(saved) ? saved : 20)   // số dòng/trang chọn gần nhất của người dùng (khớp lựa chọn của TablePaging)

  const text = textValue ?? ((r, k) => {
    const v = r[k]
    if (v == null) return ''
    if (typeof v === 'object') return v.label ?? v.text ?? ''
    return String(v)
  })

  function match(r, key, { condition, value }) {
    const s = text(r, key).toLowerCase()
    const q = (value ?? '').toLowerCase()
    switch (condition) {
      case 'not-contains': return !s.includes(q)
      case 'equals':       return s === q
      case 'not-equals':   return s !== q
      case 'starts-with':  return s.startsWith(q)
      case 'ends-with':    return s.endsWith(q)
      case 'empty':        return !s
      case 'not-empty':    return !!s
      default:             return s.includes(q)
    }
  }

  const processed = computed(() => {
    let list = rows.value.filter(r => Object.entries(filters.value).every(([k, f]) => match(r, k, f)))
    if (sort.value) {
      const { key, dir } = sort.value
      list = [...list].sort((a, b) => {
        const va = sortValue(a, key), vb = sortValue(b, key)
        const c = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va ?? '').localeCompare(String(vb ?? ''), 'vi')
        return dir === 'asc' ? c : -c
      })
    }
    return list
  })

  const paged = computed(() => processed.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

  watch([() => processed.value.length, pageSize], () => {
    const max = Math.max(1, Math.ceil(processed.value.length / pageSize.value))
    if (page.value > max) page.value = max
  })

  function onSort(col, dir) { sort.value = dir ? { key: col.key, dir } : null }
  function onFilter(col, f) {
    const next = { ...filters.value }
    if (f.value || f.condition === 'empty' || f.condition === 'not-empty') next[col.key] = f
    else delete next[col.key]
    filters.value = next
    page.value = 1
  }

  return { processed, paged, page, pageSize, onSort, onFilter }
}
