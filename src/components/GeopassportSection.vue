<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } from '../lib/ymaps';
import type { YMapLocationRequest, LngLat } from 'ymaps3';
import { store } from '../store.ts';

/* Новое ТЗ */
// Пункт #3

// 3.1 - 3.2
/* Ссылка на параграф с редактируемым текстом */
const descriptionText = useTemplateRef<HTMLParagraphElement>('description-text');

/* Функция для копирования текста в буфер обмена */
const copyText = (): void => {
	if (descriptionText.value) {
		navigator.clipboard
			.writeText(descriptionText.value.innerText)
			.then(() => console.log('Text copied to clipboard'))
			.catch((err) => console.error('Error: ', err));
	}
};

/* Кэшированное значение состояния текста-описания */
const cachedGeopassportDescription = localStorage.getItem('desriptionText');

/* Состояние для текста-описания */
const geopassportDescription = ref<string>(
	cachedGeopassportDescription
		? JSON.parse(cachedGeopassportDescription)
		: 'Платформа управления геопространственными данными "Геопаспорт" - это инновационный продукт, представляющий собой набор программных решений и позволяющий создавать современное прикладное программное обесепчение в области управления данными территории и региона. Программа включена в единый реестр российских программ для ЭВМ и баз данных.'
);

/* Наблюдатель, для отслеживания состояния текста-описания и обновления его кэшированного значения в localStorage */
watch(geopassportDescription, (newValue: string) => {
	localStorage.setItem('desriptionText', JSON.stringify(newValue));
});

/* Функция для изменения состояния текста-описания при потере фокуса элементом, внутри которого он находится */
const handleTextEditOnBlur = (event: FocusEvent): void => {
	const textContainer = event.target as HTMLParagraphElement;
	geopassportDescription.value = textContainer.innerText;
};

// 3.3
/* Начальные параметры локации для карты */
const LOCATION: YMapLocationRequest = {
	center: [41.975381, 45.049131],
	zoom: 15,
	duration: 200,
	easing: 'ease-in-out',
};

/* Кэшированное значение состояния координат маркера */
const cachedMarkerCoordinates = localStorage.getItem('markerCoordinates');

/* Состояние для координат маркера */
const markerCoordinates = ref<LngLat>(
	cachedMarkerCoordinates ? JSON.parse(cachedMarkerCoordinates) : LOCATION.center
);

/* Наблюдатель, для отслеживания состояния координат маркера и обновления их кэшированного значения в localStorage */
watch(markerCoordinates, (newValue: LngLat) => {
	localStorage.setItem('markerCoordinates', JSON.stringify(newValue));
});

/* Кэшированное значение состояния адреса */
const cachedAdress = localStorage.getItem('adress');

/* Состояние для адреса, полученного из координат маркера */
const adress = ref<string>(cachedAdress ? JSON.parse(cachedAdress) : '');

/* Наблюдатель, для отслеживания состояния адреса и обновления его кэшированного значения в localStorage */
watch(adress, (newValue: string) => {
	localStorage.setItem('adress', JSON.stringify(newValue));
});

/* Функция для определения адреса с помощью обратного геокодирования */
const getAdress = async (coordinates: LngLat): Promise<void> => {
	// Отправка запроса адреса по координатам маркера
	const geocodeRequest = await fetch(
		`https://geocode-maps.yandex.ru/v1/?apikey=9db2e5b8-a016-4608-8603-464d00018a0c&geocode=${coordinates[0]},${coordinates[1]}&lang=ru_RU&format=json`
	);

	// Обработка результата геокодирования и изменение состояния адреса
	let result = geocodeRequest.json();

	result
		.then(
			(data) =>
				(adress.value =
					data.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.text)
		)
		.catch((err) => console.log('Error: ', err));
};

/* Функция для изменения координат маркера при его перемещении */
const onDragMoveHandler = (coordinates: LngLat): void => {
	markerCoordinates.value = coordinates;

	// После изменения состояния координат маркера, вызываем функцию для определения адреса с новыми координатами
	getAdress(coordinates);
};

/* Функция для возврата маркера к изначальному положению */
const resetMarkerLocation = (): void => {
	markerCoordinates.value = LOCATION.center;
	adress.value = '';
};
</script>

<template>
	<!-- Секция "Геопаспорт" -->
	<section class="geopassport">
		<!-- Контейнер с Яндекс картой -->
		<div class="ymap-container">
			<YMap
				:location="LOCATION"
				zoomStrategy="zoomToPointer"
				:showScaleInCopyrights="true"
				:theme="store.isDarkModeOn ? 'dark' : 'light'">
				<YMapDefaultSchemeLayer />
				<YMapDefaultFeaturesLayer />

				<!-- Маркер -->
				<YMapMarker
					:coordinates="markerCoordinates"
					:draggable="true"
					:mapFollowsOnDrag="true"
					:onDragEnd="onDragMoveHandler">
					<div
						class="ymap-location-marker"
						:title="adress ? adress : 'Россия, Ставрополь, улица Суворова, 7'">
						<i class="fa-solid fa-location-dot"></i>
					</div>
				</YMapMarker>
			</YMap>
		</div>

		<!-- Блок с заголовком и описанием "Геопаспорта"  -->
		<article class="geopassport-description">
			<header class="geopassport-header">
				<!-- Кнопка возврата маркера в изначальное положение -->
				<button
					title="Вернуть маркер в изначальное положение"
					id="resetMarkerLocationButton"
					@click="resetMarkerLocation">
					<i class="fa-solid fa-xmark"></i>
				</button>

				<h1>ЗАГОЛОВОК</h1>

				<!-- Кнопка для копирования текста из описания -->
				<button title="Скопировать текст снизу" id="copyTextButton" @click="copyText">
					<i class="fa-solid fa-copy"></i>
				</button>
			</header>

			<!-- Область с текстом, доступным для копирования и редактирования -->
			<p
				id="descriptionText"
				ref="description-text"
				:contenteditable="adress.length === 0"
				spellcheck="false"
				@blur="(event) => handleTextEditOnBlur(event)">
				<!-- Описание "Геопаспорта" (по умолчанию), либо адрес маркера на карте (в случае если маркер был сдвинут) -->
				{{ adress.length > 0 ? adress : geopassportDescription }}
			</p>
		</article>
	</section>
</template>

<style lang="scss" scoped>
// Секция "Геопаспорт"
.geopassport {
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	align-items: stretch;

	background-color: #2c3649;
	color: #fff;

	// Контейнер с Яндекс картой
	.ymap-container {
		width: 50vw;
		height: 400px;
		padding: 10px;

		&:active {
			cursor: move;
		}

		// Маркер локации
		.ymap-location-marker {
			.fa-location-dot {
				cursor: grab;
				font-size: 30px;
				color: rgba(220, 20, 60, 1);

				&:active {
					cursor: grabbing;
					color: rgba(220, 20, 60, 0.4);
				}
			}
		}
	}

	// Блок с заголовком и описанием "Геопаспорта"
	.geopassport-description {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2rem;
		flex: 2;

		padding: 25px;

		// Заголовок
		.geopassport-header {
			display: flex;
			align-items: center;

			position: relative;
			padding: 0 65px 0 60px;
			background-color: #6f45e0;

			font-size: 42px;
			font-weight: 800;
			letter-spacing: 1px;

			&::before {
				content: '';
				position: absolute;
				width: 30px;
				height: 100%;
				top: 0;
				left: 15px;
				background-color: #000;
			}

			&::after {
				content: '';
				position: absolute;
				width: 50px;
				height: 100%;
				top: 0;
				right: 0;
				background-color: #f73373;
			}

			// Кнопка возврата к значениям положения маркера и текста по умочанию
			#resetMarkerLocationButton {
				z-index: 2;
				position: relative;
				transform: translateX(-39px);
				background-color: transparent;
				cursor: pointer;

				.fa-xmark {
					font-size: 24px;
					color: #fff;
					transition: all 0.25s ease-in;

					&:hover {
						color: #e27b9d;
					}
					&:active {
						cursor: progress;
					}
				}
			}

			// Кнопка для копирования текста
			#copyTextButton {
				z-index: 2;
				position: relative;
				transform: translateX(50px);
				background-color: transparent;
				cursor: pointer;

				.fa-copy {
					font-size: 24px;
					color: #fff;
					transition: all 0.25s ease-in;

					&:hover {
						color: #2c3649;
					}
					&:active {
						cursor: copy;
					}
				}
			}
		}

		// Область с тестом описания "Геопаспорта", доступным для копирования и редактирования
		#descriptionText {
			font-size: 16px;
			line-height: 24px;
			text-align: justify;

			border: 1px solid rgba(255, 255, 255, 0.05);
			border-radius: 5px;
			padding: 7px 10px;

			cursor: text;

			&:focus {
				border: 1px solid rgba(255, 255, 255, 0);
				outline: 1px dashed rgba(255, 255, 255, 0.25);
				color: rgba(0, 0, 0, 0.85);
			}
		}
	}

	// Адаптив для различных устройств
	@media screen and (max-width: 480px) {
		.geopassport-description {
			align-items: center;

			.geopassport-header {
				font-size: 32px;
				font-weight: 700;

				padding: 0 55px 0 45px;

				&::before {
					height: 100%;
					top: 0;
					left: 0;
				}

				&::after {
					width: 35px;
				}
			}

			p {
				font-size: 14px;
				text-align: center;
			}
		}
	}

	@media screen and (max-width: 1024px) {
		flex-direction: column;
		flex-wrap: nowrap;

		.ymap-container {
			width: 100%;
		}
	}
}
</style>
