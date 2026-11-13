<template>
  <!-- Bài hướng dẫn mẫu đặt trong slot của AppHelpPanel (dùng chung: trang /ds/help + màn hình mẫu panel phải).
       Class .help-article__* của mds-ui: đầu bài (tiêu đề + dòng thông tin) · đoạn mở đầu · video + chú thích · mục H3 · link dạng dòng · khối lưu ý -->
  <template v-if="!q">
    <header class="help-article__head">
      <h1 class="help-article__title">Thu, chi tiền mặt</h1>
      <span class="help-article__meta">Phân hệ Tiền mặt · 3 phút đọc · Cập nhật 05/11/2026</span>
    </header>
    <p class="help-article__lead">Lập phiếu thu, phiếu chi tiền mặt cho các nghiệp vụ thường gặp. Bấm vào từng nghiệp vụ để xem các bước chi tiết.</p>
    <figure class="help-article__figure">
      <img :src="video" alt="Video hướng dẫn: Phân hệ Tiền mặt — Bài 9" class="help-article__media" />
      <figcaption class="help-article__caption"><TIcon name="player-play" />Video · Phân hệ Tiền mặt — Bài 9</figcaption>
    </figure>
  </template>

  <section v-for="g in groups" :key="g.title" class="help-article__section">
    <h2 class="help-article__h">{{ g.title }} <span class="help-article__count">{{ g.items.length }}</span></h2>
    <ul class="help-article__links">
      <li v-for="t in g.items" :key="t"><a href="#" @click.prevent><TIcon name="file-text" />{{ t }}</a></li>
    </ul>
  </section>

  <AppInlineAlert v-if="!q" type="info" title="Lưu ý">Số tồn quỹ tính theo ngày hạch toán — trong cùng một ngày nên lập phiếu thu trước phiếu chi để quỹ không bị âm.</AppInlineAlert>
  <p v-if="q && !groups.length" class="help-article__empty">Không có bài viết khớp “{{ q }}”.</p>
</template>

<script setup>
import { computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppInlineAlert from '@mds/components/AppInlineAlert.vue'
import { matchText } from '@mds/utils/search.js'
import video from '../../assets/help/video-tien-mat.jpg'

const props = defineProps({ q: { type: String, default: '' } })   // từ khóa ô tìm kiếm của panel → lọc nghiệp vụ
const HELP = [
  { title: 'Thu tiền mặt', items: ['Rút tiền gửi ngân hàng về nhập quỹ', 'Thu tiền khách hàng', 'Thu tiền theo hóa đơn',
    'Thu tiền theo hóa đơn nhiều khách hàng', 'Thu hoàn ứng sau khi quyết toán tạm ứng', 'Thu khác'] },
  { title: 'Chi tiền mặt', items: ['Mang tiền mặt gửi vào ngân hàng', 'Trả trước tiền hàng cho nhà cung cấp', 'Trả tiền nhà cung cấp theo hóa đơn',
    'Tạm ứng cho nhân viên', 'Nộp thuế GTGT hàng nhập khẩu', 'Nộp các loại thuế khác (GTGT, TNDN, TTĐB…)', 'Trả lương',
    'Chi mua ngoài có hóa đơn', 'Chuyển tiền cho chi nhánh khác', 'Chi khác'] },
]
const groups = computed(() => HELP.map(g => ({ ...g, items: g.items.filter(t => !props.q || matchText(t, props.q)) })).filter(g => g.items.length))
</script>
