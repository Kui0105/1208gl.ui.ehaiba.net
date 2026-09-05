<template>
	<div class="map-content">
		<div class="map-title">
			<span>{{ title }}</span>
			<span class="map-subtitle">{{ subtitleText }}</span>
		</div>
		<div class="map-stage">
			<div ref="mapContainerRef" class="map-container" :class="{ 'is-fullscreen': isFullscreen }">
				<div ref="mapRef" class="tencent-map"></div>
				<button
					class="map-fullscreen-button"
					type="button"
					:aria-label="isFullscreen ? '退出全屏' : '全屏显示地图'"
					:title="isFullscreen ? '退出全屏' : '全屏显示地图'"
					@click.stop.prevent="toggleFullscreen"
					@pointerdown.stop
				>
					<icon :name="isFullscreen ? 'el-icon-Close' : 'el-icon-FullScreen'" :size="18" />
				</button>
				<div v-if="!mapReady && !mapError" class="map-placeholder map-overlay">
					<el-skeleton animated :rows="3"></el-skeleton>
				</div>
				<div v-if="mapError" class="map-empty map-overlay">
					<el-empty description="地图加载失败" />
				</div>
				<div v-if="mapReady && !mapError && !hasValidPositions" class="map-tip">
					暂无工程师定位数据，当前显示默认位置
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

	declare global {
		interface Window {
			TMap : any;
		}
	}

	interface EngineerPositionItem {
		id?: string | number;
		name?: string;
		mobile?: string;
		latitude?: string | number;
		longitude?: string | number;
	}

	const FALLBACK_MAP_KEY = 'OB4BZ-D4W3U-B7EVV-V2P6Z-XIWJW-KTBDQ'
	const DEFAULT_CENTER = {
		lat: 39.916527,
		lng: 116.397128
	}
	const MAP_SCRIPT_ID = 'tencent-map-gl-script'

	let tMapScriptPromise : Promise<void> | null = null

	const props = withDefaults(defineProps<{
		positions: EngineerPositionItem[];
		mapKey?: string;
		title?: string;
	}>(), {
		positions: () => [],
		mapKey: '',
		title: '工程师位置'
	})

	const mapRef = ref<HTMLDivElement | null>(null)
	const mapContainerRef = ref<HTMLDivElement | null>(null)
	const mapReady = ref(false)
	const mapError = ref('')
	const isFullscreen = ref(false)

	let mapInstance : any = null
	let markerLayer : any = null
	let infoWindow : any = null
	let originalBodyOverflow = ''
	let hasCapturedBodyOverflow = false

	const validPositions = computed(() => {
		return (props.positions || []).filter(item => {
			const lat = Number(item.latitude)
			const lng = Number(item.longitude)
			return Number.isFinite(lat) && Number.isFinite(lng)
		})
	})

	const hasValidPositions = computed(() => validPositions.value.length > 0)

	const subtitleText = computed(() => {
		if (!hasValidPositions.value) return '暂无定位'
		return `已定位 ${validPositions.value.length} 人`
	})

	const canInitMap = computed(() => {
		return Boolean(props.mapKey) || (typeof window !== 'undefined' && Boolean(window.TMap))
	})

	const handleFullscreenChange = () => {
		if (document.fullscreenElement !== mapContainerRef.value && !isFullscreen.value) {
			refreshMapSize()
		}
	}

	const refreshMapSize = async () => {
		await nextTick()

		await new Promise<void>(resolve => {
			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(() => resolve())
			})
		})

		mapInstance?.resize?.()
		if (hasValidPositions.value) {
			fitMapBounds()
		}
	}

	const setFullscreen = async (fullscreen: boolean) => {
		if (fullscreen && !isFullscreen.value) {
			originalBodyOverflow = document.body.style.overflow
			hasCapturedBodyOverflow = true
		}

		isFullscreen.value = fullscreen
		document.body.style.overflow = fullscreen
			? 'hidden'
			: (hasCapturedBodyOverflow ? originalBodyOverflow : document.body.style.overflow)

		await refreshMapSize()

		if (!fullscreen) {
			hasCapturedBodyOverflow = false
		}
	}

	const toggleFullscreen = () => {
		if (!mapContainerRef.value) {
			return
		}

		setFullscreen(!isFullscreen.value)
	}

	const handleFullscreenKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && isFullscreen.value) {
			setFullscreen(false)
		}
	}

	const resetMapScript = () => {
		const existingScript = document.getElementById(MAP_SCRIPT_ID)
		if (existingScript?.parentNode) {
			existingScript.parentNode.removeChild(existingScript)
		}
		tMapScriptPromise = null
	}

	const loadTencentMapScript = (mapKey : string) => {
		if (typeof window !== 'undefined' && window.TMap) {
			return Promise.resolve()
		}

		if (!mapKey) {
			return Promise.reject(new Error('腾讯地图 key 未就绪'))
		}

		if (tMapScriptPromise) {
			return tMapScriptPromise
		}

		tMapScriptPromise = new Promise<void>((resolve, reject) => {
			const waitForTMapReady = () => {
				const startTime = Date.now()
				const checkInterval = setInterval(() => {
					if (typeof window !== 'undefined' && window.TMap) {
						clearInterval(checkInterval)
						resolve()
						return
					}

					if (Date.now() - startTime > 10000) {
						clearInterval(checkInterval)
						tMapScriptPromise = null
						reject(new Error('腾讯地图 API 加载超时'))
					}
				}, 100)
			}

			const existingScript = document.getElementById(MAP_SCRIPT_ID) as HTMLScriptElement | null

			if (existingScript) {
				const expectedSrc = `https://map.qq.com/api/gljs?v=1.exp&key=${mapKey}`
				if (existingScript.src !== expectedSrc) {
					existingScript.parentNode?.removeChild(existingScript)
					tMapScriptPromise = null
					loadTencentMapScript(mapKey).then(resolve).catch(reject)
					return
				}
				waitForTMapReady()
				return
			}

			const script = document.createElement('script')
			script.id = MAP_SCRIPT_ID
			script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${mapKey || FALLBACK_MAP_KEY}`
			script.async = true
			script.defer = true
			script.onload = () => waitForTMapReady()
			script.onerror = () => {
				tMapScriptPromise = null
				reject(new Error('腾讯地图脚本加载失败'))
			}
			document.head.appendChild(script)
		})

		return tMapScriptPromise
	}

	const clearMapArtifacts = () => {
		if (infoWindow?.close) {
			infoWindow.close()
		}
		infoWindow = null

		if (markerLayer?.setMap) {
			markerLayer.setMap(null)
		}
		markerLayer = null

		if (mapInstance?.destroy) {
			mapInstance.destroy()
		}
		mapInstance = null

		if (mapRef.value) {
			mapRef.value.innerHTML = ''
		}
	}

	const getMapCenter = () => {
		if (hasValidPositions.value) {
			const firstPosition = validPositions.value[0]
			return new window.TMap.LatLng(Number(firstPosition.latitude), Number(firstPosition.longitude))
		}

		return new window.TMap.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
	}

	const calculateTargetZoom = (latSpan : number, lngSpan : number) => {
		const maxSpan = Math.max(latSpan, lngSpan)

		if (maxSpan < 0.01) return 16
		if (maxSpan < 0.05) return 14
		if (maxSpan < 0.1) return 12
		if (maxSpan < 0.5) return 10
		if (maxSpan < 1) return 8
		if (maxSpan < 3) return 6
		return 4
	}

	const fitMapBounds = () => {
		if (!mapInstance || !hasValidPositions.value) {
			return
		}

		if (validPositions.value.length === 1) {
			mapInstance.setCenter(getMapCenter())
			mapInstance.setZoom(13)
			return
		}

		let minLat = Number(validPositions.value[0].latitude)
		let maxLat = minLat
		let minLng = Number(validPositions.value[0].longitude)
		let maxLng = minLng

		validPositions.value.forEach(item => {
			const lat = Number(item.latitude)
			const lng = Number(item.longitude)
			minLat = Math.min(minLat, lat)
			maxLat = Math.max(maxLat, lat)
			minLng = Math.min(minLng, lng)
			maxLng = Math.max(maxLng, lng)
		})

		const bounds = new window.TMap.LatLngBounds(
			new window.TMap.LatLng(minLat, minLng),
			new window.TMap.LatLng(maxLat, maxLng)
		)

		const latSpan = maxLat - minLat
		const lngSpan = maxLng - minLng
		const targetZoom = calculateTargetZoom(latSpan, lngSpan)
		const center = new window.TMap.LatLng((minLat + maxLat) / 2, (minLng + maxLng) / 2)

		mapInstance.fitBounds(bounds, { padding: [80, 80, 80, 80] })

		window.setTimeout(() => {
			if (!mapInstance) {
				return
			}

			mapInstance.setCenter(center)

			if (typeof mapInstance.getZoom === 'function' && typeof mapInstance.setZoom === 'function') {
				const currentZoom = mapInstance.getZoom()
				if (!currentZoom || currentZoom > targetZoom) {
					mapInstance.setZoom(targetZoom)
				}
			}
		}, 300)
	}

	const renderMarkers = () => {
		if (!mapInstance) {
			return
		}

		if (!hasValidPositions.value) {
			mapInstance.setCenter(getMapCenter())
			mapInstance.setZoom(10)
			return
		}

		markerLayer = new window.TMap.MultiMarker({
			map: mapInstance,
			styles: {
				marker: new window.TMap.MarkerStyle({
					width: 28,
					height: 38,
					anchor: { x: 14, y: 38 },
					src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/markerDefault.png'
				})
			},
			geometries: validPositions.value.map((item, index) => ({
				id: String(item.id ?? index),
				position: new window.TMap.LatLng(Number(item.latitude), Number(item.longitude)),
				properties: {
					title: item.name || '未命名工程师',
					mobile: item.mobile || '暂无电话'
				}
			}))
		})

		markerLayer.on('click', (evt : any) => {
			const geometry = evt?.geometry
			if (!geometry?.properties) return

			if (!infoWindow) {
				infoWindow = new window.TMap.InfoWindow({
					map: mapInstance,
					position: geometry.position,
					enableClose: true,
					content: ''
				})
			}

			infoWindow.setPosition(geometry.position)
			infoWindow.setContent(`<div style="padding: 10px; min-width: 140px;"><div style="font-weight: bold; margin-bottom: 6px;">${geometry.properties.title}</div><div>电话：${geometry.properties.mobile}</div></div>`)
			infoWindow.open()
		})

		fitMapBounds()
	}

	const initMap = async () => {
		if (!mapRef.value) {
			return
		}

		if (!canInitMap.value) {
			mapReady.value = false
			mapError.value = ''
			return
		}

		mapReady.value = false
		mapError.value = ''

		try {
			await nextTick()
			await loadTencentMapScript(props.mapKey)

			if (!window.TMap || !mapRef.value) {
				throw new Error('腾讯地图 API 未就绪')
			}

			clearMapArtifacts()

			mapInstance = new window.TMap.Map(mapRef.value, {
				center: getMapCenter(),
				zoom: hasValidPositions.value ? 12 : 10,
				viewMode: '2D'
			})

			renderMarkers()
			mapReady.value = true
		} catch (error) {
			console.error('工程师位置地图初始化失败:', error)
			mapError.value = '地图加载失败'
		}
	}

	watch(() => props.mapKey, async (newKey, oldKey) => {
		if (newKey && newKey !== oldKey && typeof window === 'undefined') {
			return
		}

		if (newKey && newKey !== oldKey && typeof window !== 'undefined' && !window.TMap) {
			resetMapScript()
		}

		if (!mapRef.value) {
			return
		}

		await initMap()
	})

	watch(() => validPositions.value, async () => {
		if (!mapRef.value) {
			return
		}

		await initMap()
	}, { deep: true })

	onMounted(() => {
		document.addEventListener('fullscreenchange', handleFullscreenChange)
		document.addEventListener('keydown', handleFullscreenKeydown)
		initMap()
	})

	onUnmounted(() => {
		document.removeEventListener('fullscreenchange', handleFullscreenChange)
		document.removeEventListener('keydown', handleFullscreenKeydown)
		if (hasCapturedBodyOverflow) {
			document.body.style.overflow = originalBodyOverflow
		}
		clearMapArtifacts()
	})
</script>

<style scoped>
	.map-content {
		flex: 2;
		min-width: 0;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.map-title {
		display: flex;
		justify-content: space-between;
		margin-bottom: 16px;
		font-size: 16px;
		font-weight: bold;
	}

	.map-subtitle {
		font-size: 14px;
		font-weight: normal;
		color: #666;
	}

	.map-stage {
		position: relative;
		flex: 1;
		width: 100%;
		min-width: 0;
		min-height: 400px;
		overflow: hidden;
	}

	.map-container {
		position: absolute;
		inset: 0;
		isolation: isolate;
		border-radius: 8px;
		overflow: hidden;
		background: #f7f9fc;
	}

	.map-container.is-fullscreen {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		min-height: 100vh;
		border-radius: 0;
		z-index: 3000;
	}

	.map-fullscreen-button {
		position: absolute;
		top: 12px;
		left: 12px;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		border: 1px solid rgba(226, 232, 240, 0.95);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.96);
		color: #334155;
		cursor: pointer;
		pointer-events: auto;
		box-shadow: 0 4px 12px rgba(15, 23, 42, 0.14);
		transition: background-color 0.2s ease, color 0.2s ease;
	}

	.map-fullscreen-button:hover {
		background: #f1f5f9;
		color: #1677ff;
	}

	.map-placeholder,
	.map-empty {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		box-sizing: border-box;
	}

	.tencent-map {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;
	}

	.map-overlay {
		position: absolute;
		inset: 0;
		z-index: 3;
		background: #f7f9fc;
	}

	.map-tip {
		position: absolute;
		left: 16px;
		top: 16px;
		padding: 8px 12px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.92);
		color: #475569;
		font-size: 12px;
		box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
		z-index: 2;
	}
</style>
