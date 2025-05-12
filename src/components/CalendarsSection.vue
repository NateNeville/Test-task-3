<script setup lang="ts">
import { ref, useTemplateRef, onMounted, watch } from 'vue';
// Директива из библиотеки 'vueuse' для отслеживания клика за пределами элемента
import { vOnClickOutside } from '@vueuse/components';
import Calendar from './Calendar.vue';
import ThemeChangeButton from './ThemeChangeButton.vue';
import { store } from '../store.ts';
import '../slider.css';

/* Массив с названиями месяцев */
const months: string[] = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
];

/* Названия месяцев в родительном падеже для отображения при выборе дня в календаре */
const monthsNamesToDisplayOnDaySelection: string[] = [
	'Января',
	'Февраля',
	'Марта',
	'Апреля',
	'Мая',
	'Июня',
	'Июля',
	'Августа',
	'Сентября',
	'Октября',
	'Ноября',
	'Декабря',
];

/* Массив с названиями дней недели */
const weekDays: string[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/* Состояние для начального года */
const year = ref<number>(2021);

/* Функция для перехода к предыдущему месяцу */
const switchToPrevMonth = (): number =>
	month.value >= 1 ? month.value-- : ((month.value = 11), year.value--);

/* Функция для перехода к следующему месяцу */
const switchToNextMonth = (): number =>
	month.value <= 10 ? month.value++ : ((month.value = 0), year.value++);

/* Функция для перехода к предыдущему году */
const switchToPrevYear = (): number => year.value--;

/* Функция для перехода к следующему году */
const switchToNextYear = (): number => year.value++;

/* Новое ТЗ */
// Пункт #1

/* Состояние для контекстного меню с выбором месяцев */
const isMenuOpen = ref<boolean>(false);

/* Кэшированное значение состояния списка добавленных месяцев */
const cachedSelectedMonthsList = localStorage.getItem('selectedMonthsList');

/* Список добавленных месяцев для быстрого переключения через ссылки */
const selectedMonthsList = ref<string[]>(
	cachedSelectedMonthsList ? JSON.parse(cachedSelectedMonthsList) : []
);

/* Наблюдатель, для отслеживания состояния списка добавленных месяцев и обновления его кэшированного значения в localStorage */
watch(selectedMonthsList, (newValue: string[]) => {
	localStorage.setItem('selectedMonthsList', JSON.stringify(newValue));
});

/* Ссылка на элемент input(checkbox) для выбора всех месяцев сразу */
const allMonthsCheckboxRef = useTemplateRef<HTMLInputElement>('select-all-months');

/* Функция для добавления и удаления всех месяцев сразу внутри списка при переключении чекбокса */
const handleSelectAllMonthsCheckbox = (): string[] => {
	return allMonthsCheckboxRef.value?.checked
		? (selectedMonthsList.value = [...months])
		: (selectedMonthsList.value = []);
};

/* Функция для изменения состояния начального месяца, исходя из названия месяца внутри нажатой ссылки */
const selectMonth = (selectedMonth: string): void => {
	month.value = months.findIndex((month) => month === selectedMonth);
};

// Пункт #2

// 2.1.1
/* Кэшированное значение состояния выбранного дня */
const cachedSelectedDay = localStorage.getItem('selectedDay');

/* Состояние для выбранного дня */
const selectedDay = ref<number | undefined>(
	cachedSelectedDay ? JSON.parse(cachedSelectedDay) : undefined
);

/* Наблюдатель, для отслеживания состояния выбранного дня и обновления его кэшированного значения в localStorage */
watch(selectedDay, (newValue: number | undefined) => {
	if (typeof newValue === 'number') {
		localStorage.setItem('selectedDay', JSON.stringify(newValue));
	}

	if (typeof newValue === 'undefined') {
		localStorage.removeItem('selectedDay');
	}
});

/* Кэшированное значение состояния выбранного дня */
const cachedSelectedMonth = localStorage.getItem('selectedMonth');

/* Состояние для выбранного месяца */
const selectedMonth = ref<number | undefined>(
	cachedSelectedMonth ? JSON.parse(cachedSelectedMonth) : undefined
);

/* Наблюдатель, для отслеживания состояния выбранного месяца и обновления его кэшированного значения в localStorage */
watch(selectedMonth, (newValue: number | undefined) => {
	if (typeof newValue === 'number') {
		localStorage.setItem('selectedMonth', JSON.stringify(newValue));
	}

	if (typeof newValue === 'undefined') {
		localStorage.removeItem('selectedMonth');
	}
});

/* Состояние для начального месяца */
const month = ref<number>(
	typeof selectedMonth.value === 'number' ? (selectedMonth.value as number) : 2
);

/* Функция для выбора конкретной даты из календаря при клике на неё */
const setSelectedDay = (day: number, month: number): void => {
	if (day !== selectedDay.value || month !== selectedMonth.value) {
		selectedDay.value = day;
		selectedMonth.value = month;
	} else {
		selectedDay.value = undefined;
		selectedMonth.value = undefined;
	}
};

// 2.1.2
/* Кэшированное значение состояния ID выбранного календаря */
const cachedSelectedCalendarID = localStorage.getItem('selectedCalendarID');

/* Состояние для ID выбранного календаря */
const selectedCalendarID = ref<number>(
	cachedSelectedCalendarID ? JSON.parse(cachedSelectedCalendarID) : undefined
);

/* Наблюдатель, для отслеживания состояния ID выбранного календаря и обновления его кэшированного значения в localStorage */
watch(selectedCalendarID, (newValue: number) => {
	localStorage.setItem('selectedCalendarID', JSON.stringify(newValue));
});

/* Фукнция для выбора календаря при клике на него */
const selectCalendar = (id: number): void => {
	selectedCalendarID.value = id;
};

// 2.2
/* Импорт jQuery */
const $: any = (window as any)['jQuery'];

/* Инициализация слайдера */
onMounted(() => {
	$(document).ready(function () {
		$('.slider').slick({
			arrows: true,
			dots: true,
			slidesToShow: 1,
			slidesToScroll: 1,
			initialSlide: selectedCalendarID.value ? selectedCalendarID.value : 0,
			speed: 500,
			easing: 'ease',
			infinite: true,
			draggable: false,
			swipe: true,
		});
	});
});
</script>

<template>
	<!-- Секция с календарями -->
	<section class="calendars" :class="store.isDarkModeOn && 'dark'">
		<header class="task-header">
			<h2>Тестовое задание</h2>

			<!-- Кнопка смены цветовой темы -->
			<ThemeChangeButton />
		</header>

		<!-- Обертка для календарей -->
		<div class="calendars-wrapper">
			<!-- Поле с выбранной датой из календаря -->
			<div class="selected-day-field">
				<p v-show="selectedDay">
					{{
						`${selectedDay as number} ${
							monthsNamesToDisplayOnDaySelection[selectedMonth as number]
						}`
					}}
				</p>
			</div>

			<!-- Слайдер с календарями -->
			<div class="slider">
				<div class="slider-item">
					<Calendar
						@switch-to-prev-month="switchToPrevMonth"
						@switch-to-next-month="switchToNextMonth"
						@switch-to-prev-year="switchToPrevYear"
						@switch-to-next-year="switchToNextYear"
						@select-calendar="selectCalendar"
						@set-selected-day="setSelectedDay"
						:months="months"
						:week-days="weekDays"
						:month="month"
						:year="year"
						:id="0"
						:selected-calenar-id="(selectedCalendarID as number)"
						:selected-day="(selectedDay as number)"
						:selected-month="(selectedMonth as number)" />
				</div>

				<div class="slider-item">
					<Calendar
						@switch-to-prev-month="switchToPrevMonth"
						@switch-to-next-month="switchToNextMonth"
						@switch-to-prev-year="switchToPrevYear"
						@switch-to-next-year="switchToNextYear"
						@select-calendar="selectCalendar"
						@set-selected-day="setSelectedDay"
						:months="months"
						:week-days="weekDays"
						:month="month"
						:year="year"
						:id="1"
						:selected-calenar-id="(selectedCalendarID as number)"
						:selected-day="(selectedDay as number)"
						:selected-month="(selectedMonth as number)" />
				</div>

				<div class="slider-item">
					<Calendar
						@switch-to-prev-month="switchToPrevMonth"
						@switch-to-next-month="switchToNextMonth"
						@switch-to-prev-year="switchToPrevYear"
						@switch-to-next-year="switchToNextYear"
						@select-calendar="selectCalendar"
						@set-selected-day="setSelectedDay"
						:months="months"
						:week-days="weekDays"
						:month="month"
						:year="year"
						:id="2"
						:selected-calenar-id="(selectedCalendarID as number)"
						:selected-day="(selectedDay as number)"
						:selected-month="(selectedMonth as number)" />
				</div>
			</div>
		</div>

		<!-- Навигация для переключения месяцев календарей -->
		<nav class="months-navigation">
			<!-- Кнопка для вызова контекстного меню со списком доступных для выбора месяцев -->
			<button type="button" class="toggle-months-list-btn" @click="() => (isMenuOpen = true)">
				Месяцы
			</button>

			<!-- Список выбранных месяцев -->
			<ul
				class="month-navigation-links"
				:class="selectedMonthsList.length > 0 && 'visible'"
				v-show="selectedMonthsList.length > 0">
				<h3>Выбранные месяцы:</h3>
				<li v-for="(month, index) in selectedMonthsList" :key="index">
					<a
						href="#"
						class="month-nav-link"
						@click="
							(event) => {
								event.preventDefault();
								selectMonth(month);
							}
						"
						>{{ month }}</a
					>
				</li>
			</ul>

			<!-- Контекстное меню с доступными для выбора месяцами  -->
			<ul
				class="available-months-list"
				:class="isMenuOpen && 'visible'"
				v-show="isMenuOpen"
				v-on-click-outside="() => (isMenuOpen = false)">
				<!-- Чекбоксы для каждого отдельного месяца -->
				<li v-for="(month, index) in months" :key="index" class="select-single-month">
					<input
						type="checkbox"
						:id="month"
						:value="month"
						v-model="selectedMonthsList" />

					<label :for="month">{{ month }}</label>
				</li>

				<!-- Чекбокс для выбора всех месяцев сразу -->
				<li class="select-all-months">
					<input
						type="checkbox"
						id="all"
						ref="select-all-months"
						@click="handleSelectAllMonthsCheckbox" />

					<label for="all">Выбрать все</label>
				</li>
			</ul>
		</nav>
	</section>
</template>

<style lang="scss" scoped>
// Секция с календарями
.calendars {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2rem;

	padding: 3rem;
	transition: all 0.3s ease-in;

	// Шапка с заголовком задания и кнопкой для смены цветовой схемы
	.task-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		padding-left: 5px;

		h2 {
			font-size: 32px;
		}
	}

	// Обертка для календарей
	.calendars-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;

		// Поле с выбранной датой из календаря
		.selected-day-field {
			height: 22px;
			text-align: center;
			font-weight: 500;
		}

		// Слайдер
		.slider {
			position: relative;
			padding: 0 50px;
			width: 600px;

			.slider-item {
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}

	// Навигация для переключения месяцев календарей
	.months-navigation {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-evenly;
		gap: 25px;

		// Ссылки для переключения месяцев календарей
		.month-navigation-links {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
			gap: 1rem;

			padding-left: 5px;
			font-size: 18px;

			transition: all 0.5s ease;
		}

		// Кнопка для вызова контекстного меню со списком доступных для выбора месяцев
		.toggle-months-list-btn {
			width: 250px;
			padding: 10px;

			background-color: rgba(0, 0, 0, 0.65);
			border: 2px solid rgba(255, 255, 255, 0.75);
			border-radius: 5px;
			color: #fff;
			font-size: 22px;
			letter-spacing: 0.5px;

			cursor: pointer;

			transition: all 0.5s ease;

			&:hover {
				background-color: rgba(0, 0, 0, 0.95);
			}
		}

		// Контекстное меню с доступными для выбора месяцами
		.available-months-list {
			padding: 15px;

			display: flex;
			flex-direction: column;
			justify-content: space-evenly;
			gap: 7px;

			border: 1px solid rgba(0, 0, 0, 0.45);
			border-radius: 5px;

			transition: all 0.5s ease;

			li {
				display: flex;
				align-items: center;
				gap: 5px;

				label {
					cursor: pointer;
				}
			}

			li.select-all-months {
				font-weight: 600;
				margin-top: 10px;
			}
		}
	}

	// Изменения при добавлении для секции 'calendars' класса 'dark' при переключении цветовой схемы
	&.dark {
		background-color: #2c3649;
		color: #fff;

		.months-navigation {
			.toggle-months-list-btn {
				background-color: rgba(255, 255, 255, 0.3);
				border: 2px solid rgba(0, 0, 0, 0.45);

				&:hover {
					background-color: rgba(255, 255, 255, 0.65);
				}
			}

			.available-months-list {
				border: 1px solid rgba(255, 255, 255, 0.25);
			}
		}
	}

	// Адаптив для различных устройств
	@media screen and (max-width: 480px) {
		padding: 2rem;

		.task-header {
			h2 {
				font-size: 24px;
			}
		}

		.calendars-wrapper {
			.slider {
				padding: 0 20px;
				width: 340px;
			}
		}
	}

	@media screen and (min-width: 481px) and (max-width: 1024px) {
		.calendars-wrapper {
			.slider {
				padding: 0 40px;
				width: 450px;
			}
		}
	}

	@media screen and (max-width: 1024px) {
		.calendars-wrapper {
			justify-content: center;
			gap: 2rem;
		}

		.months-navigation {
			align-items: center;

			.month-navigation-links {
				justify-content: center;
			}
		}
	}

	@media screen and (min-width: 1281px) {
		justify-content: space-around;
	}
}
</style>
