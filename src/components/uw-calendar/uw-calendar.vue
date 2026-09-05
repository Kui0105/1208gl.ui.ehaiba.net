<template>
	<div class="mini-calendar">
		<!-- 周头 -->
		<div class="calendar-header">
			<div v-for="(day, index) in weekDays" :key="index" class="calendar-cell header-cell">
				{{ day }}
			</div>
		</div>

		<!-- 日期格 -->
		<div class="calendar-body">
			<div v-for="(dateObj, index) in calendarDays" :key="index" class="calendar-cell"
				:class="{ disabled: isDisabled(dateObj.date), today: isToday(dateObj.date) }"
				@click="selectDate(dateObj)">
				{{ dateObj.day }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, watch } from 'vue'

	// props
	interface Props {
		modelValue ?: Date | null
		disabledDates ?: Date[]
		year ?: number
		month ?: number
	}
	const props = defineProps<Props>()
	const emit = defineEmits<{ (e : 'update:modelValue', value : Date) : void }>()

	// state
	const selectedDate = ref<Date | null>(props.modelValue ?? null)

	// week labels
	const weekDays = ['日', '一', '二', '三', '四', '五', '六']

	// 当前显示的年月
	const today = new Date()
	const currentYear = ref(props.year ?? today.getFullYear())
	const currentMonth = ref(props.month ?? today.getMonth())

	// 计算日历格子
	const calendarDays = computed(() => {
		const firstDay = new Date(currentYear.value, currentMonth.value, 1)
		const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
		const days = []

		// 当月前空格填充
		const startWeekDay = firstDay.getDay()
		for (let i = 0; i < startWeekDay; i++) {
			days.push({ day: '', date: null })
		}

		// 当月实际日期
		for (let d = 1; d <= lastDay.getDate(); d++) {
			days.push({ day: d, date: new Date(currentYear.value, currentMonth.value, d) })
		}

		return days
	})

	// 判断禁用日期
	const isDisabled = (date : Date | null) => {
		if (!date) return true
		if (!props.disabledDates || props.disabledDates.length === 0) return false
		return props.disabledDates.some(d => d.toDateString() === date.toDateString())
	}

	// 判断今天
	const isToday = (date : Date | null) => {
		if (!date) return false
		const t = new Date()
		return date.toDateString() === t.toDateString()
	}

	// 点击选中
	const selectDate = (dateObj : { day : number; date : Date | null }) => {
		if (!dateObj.date || isDisabled(dateObj.date)) return
		selectedDate.value = dateObj.date
		emit('update:modelValue', dateObj.date)
	}

	// watch 外部传入
	watch(
		() => props.modelValue,
		newVal => {
			selectedDate.value = newVal ?? null
		}
	)
</script>

<style scoped lang="scss">
	.mini-calendar {
		width: 100%;
		border: 1px solid #e0e0e0;
		border-radius: 6px;
		font-size: 12px;
		user-select: none;
	}

	.calendar-header,
	.calendar-body {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	.calendar-cell {
		text-align: center;
		line-height: 72px;
		height: 72px;
		cursor: pointer;
	}

	.header-cell {
		font-weight: bold;
		background: #f5f5f5;
	}

	.calendar-cell.disabled {
		color: #c0c4cc;
		cursor: not-allowed;
	}

	.calendar-cell.today {
		border: 1px solid #209AFD;
		border-radius: 1px;
		color: #209AFD;
	}

	.calendar-cell:hover:not(.disabled) {
		background: #e6f7ff;
		border-radius: 1px;
	}
</style>