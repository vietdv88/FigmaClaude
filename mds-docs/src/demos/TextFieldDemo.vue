<template>
  <div class="demo-grid">
    <AppInput label="Họ và tên" required>
      <AppTextbox v-model="name" placeholder="Nhập họ và tên" />
    </AppInput>
    <AppInput label="Email" :message="emailOk ? '' : 'Email chưa đúng định dạng'">
      <AppTextbox v-model="email" type="email" placeholder="ten@congty.vn" />
    </AppInput>
    <AppInput label="Số tiền">
      <AppNumberbox v-model="amount" :stepper="false" />
    </AppInput>
    <AppInput label="Tìm kiếm">
      <AppSearchbox v-model="q" placeholder="Tìm theo tên, mã" />
    </AppInput>
    <AppInput label="Ghi chú" class="demo-field--wide">
      <AppTextarea v-model="note" placeholder="Nhập ghi chú" :min-height="72" autosize />
    </AppInput>
    <AppInput label="Chỉ đọc">
      <AppTextbox model-value="MS-00125" readonly />
    </AppInput>
    <AppInput label="Không sửa được">
      <AppTextbox model-value="Đã khóa" disabled />
    </AppInput>
  </div>
</template>

<script setup>
import AppInput from '@mds/components/AppInput.vue'
import { ref, computed } from 'vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
const name = ref('Nguyễn Văn An'), email = ref('an@'), amount = ref(1250000), q = ref(''), note = ref('')
const emailOk = computed(() => !email.value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value))
</script>
