<script lang="ts">
	import { onMount } from 'svelte';
	import type { StoredImage } from '$lib/image';
	import type { LocalImageData, UserViewport } from './canvas.types';
	import { SvelteMap } from 'svelte/reactivity';

	let {
		initialImages,
		selectedImageId = $bindable(null),
		canvas = $bindable(null),
		onUserPositionChange,
		onBackgroundClick,
		initialZoom = undefined
	}: {
		initialImages: StoredImage[];
		selectedImageId: string | null;
		canvas: HTMLCanvasElement | null;
		onUserPositionChange?: (viewport: UserViewport) => void;
		onBackgroundClick?: (x: number, y: number) => void;
		initialZoom?: number;
	} = $props();

	let bgCanvas: HTMLCanvasElement;
	let imgCanvas: HTMLCanvasElement;
	let bgCtx: CanvasRenderingContext2D;
	let imgCtx: CanvasRenderingContext2D;
	let isDragging: boolean = false;
	let startX: number, startY: number;
	let mouseDownX: number, mouseDownY: number; // Track initial click position
	let hasMoved: boolean = false; // Track if mouse has moved during drag
	let offsetX: number = 0,
		offsetY: number = 0;
	// User viewport in stored coordinates (no DPI scaling) - matches coordinate system of stored images
	let userViewport = $state<UserViewport>({
		offsetX: 0,
		offsetY: 0,
		width: 0,
		height: 0
	});
	let isInitialized: boolean = false;
	let backgroundImage: HTMLImageElement | null = null;
	let cursor: 'grab' | 'grabbing' | 'pointer' = $state('grab');

	const CLICK_THRESHOLD = 5; // Pixels - movement below this is considered a click, not a drag

	let dpr = $state(1);
	let logicalWidth = $state(0);
	let logicalHeight = $state(0);
	let zoom = $state(1); // Zoom factor - lower values zoom out, higher values zoom in

	const imageElements = new SvelteMap<string, LocalImageData>();

	$inspect('selectedImageId:', selectedImageId);
	$inspect(imageElements);

	let images: StoredImage[] = $state(initialImages);

	onMount(() => {
		bgCtx = bgCanvas.getContext('2d')!;
		imgCtx = imgCanvas.getContext('2d')!;
		canvas = imgCanvas;

		dpr = window.devicePixelRatio || 1;
		logicalWidth = bgCanvas.width / dpr;
		logicalHeight = bgCanvas.height / dpr;

		// Set initial zoom based on screen width if not provided
		if (initialZoom !== undefined) {
			zoom = initialZoom;
		} else {
			zoom = calculateResponsiveZoom();
		}

		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);

		loadBackgroundImage();
		loadImages();

		return () => window.removeEventListener('resize', resizeCanvas);
	});

	/**
	 * Calculate zoom factor based on screen width for responsive display
	 * Desktop (>1024px): 1.0x (100%)
	 * Tablet (768-1024px): 0.7x (70%)
	 * Mobile (<768px): 0.5x (50%)
	 */
	function calculateResponsiveZoom(): number {
		const width = window.innerWidth;
		if (width > 1024) {
			return 1.0;
		} else if (width > 768) {
			return 0.7;
		} else {
			return 0.5;
		}
	}

	function loadImages(): void {
		for (const img of initialImages) {
			const localImageData: LocalImageData = {
				img: new Image(),
				isLoaded: false
			};
			imageElements.set(img.id, localImageData);
			localImageData.img.onload = () => {
				const width = localImageData.img.width;
				const height = localImageData.img.height;
				const ratio = width / height;
				const newWidth = 200;
				const newHeight = newWidth / ratio;

				imageElements.set(img.id, {
					isLoaded: true,
					img: localImageData.img,
					localX: img.x * dpr - (newWidth * dpr) / 2,
					localY: img.y * dpr - (newHeight * dpr) / 2,
					width: newWidth * dpr,
					height: newHeight * dpr
				});
			};
			localImageData.img.src = img.src;
		}
	}

	function updateStoredOffsets(): void {
		// offsetX, offsetY, logicalWidth, and logicalHeight are already in logical coordinates (CSS pixels)
		// which match the coordinate system of stored images (img.x, img.y)
		userViewport = {
			offsetX: offsetX,
			offsetY: offsetY,
			width: logicalWidth,
			height: logicalHeight
		};

		// Notify parent component of viewport change
		onUserPositionChange?.(userViewport);
	}

	function resizeCanvas(): void {
		const rect = bgCanvas.getBoundingClientRect();

		// Set the canvas buffer size (accounting for DPR) for both canvases
		bgCanvas.width = rect.width * dpr;
		bgCanvas.height = rect.height * dpr;
		imgCanvas.width = rect.width * dpr;
		imgCanvas.height = rect.height * dpr;

		// Update logical dimensions
		logicalWidth = rect.width;
		logicalHeight = rect.height;

		// Scale the context to match DPR for both canvases
		bgCtx.scale(dpr, dpr);
		imgCtx.scale(dpr, dpr);

		// Update zoom based on screen size if initialZoom was not provided
		if (initialZoom === undefined) {
			zoom = calculateResponsiveZoom();
		}

		// Center the canvas on first initialization
		if (!isInitialized) {
			offsetX = rect.width / 2;
			offsetY = rect.height / 2;
			isInitialized = true;
		}

		// Update stored coordinates whenever canvas is resized
		updateStoredOffsets();

		if (bgCtx && imgCtx) {
			drawBackground();
			drawImages();
		}
	}

	function loadBackgroundImage(): void {
		const bgImage = new Image();
		bgImage.onload = () => {
			backgroundImage = bgImage;
			drawBackground();
		};
		bgImage.src = './bg.jpg';
	}

	function drawBackground(): void {
		bgCtx.clearRect(0, 0, logicalWidth, logicalHeight);
		bgCtx.save();
		bgCtx.translate(offsetX, offsetY);
		bgCtx.scale(zoom, zoom);

		// Draw repeating background texture - only visible tiles
		if (backgroundImage) {
			const tileWidth = backgroundImage.width * 0.7;
			const tileHeight = backgroundImage.height * 0.7;

			// Calculate visible area in world coordinates (accounting for zoom)
			const visibleLeft = -offsetX / zoom;
			const visibleTop = -offsetY / zoom;
			const visibleRight = visibleLeft + logicalWidth / zoom;
			const visibleBottom = visibleTop + logicalHeight / zoom;

			// Calculate which tiles to draw
			const startCol = Math.floor(visibleLeft / tileWidth);
			const startRow = Math.floor(visibleTop / tileHeight);
			const endCol = Math.ceil(visibleRight / tileWidth);
			const endRow = Math.ceil(visibleBottom / tileHeight);

			// Draw only the visible tiles
			for (let row = startRow; row <= endRow; row++) {
				for (let col = startCol; col <= endCol; col++) {
					bgCtx.drawImage(
						backgroundImage,
						col * tileWidth,
						row * tileHeight,
						tileWidth,
						tileHeight
					);
				}
			}
		}

		bgCtx.restore();
	}

	function drawImages(): void {
		imgCtx.clearRect(0, 0, logicalWidth, logicalHeight);
		imgCtx.save();
		imgCtx.translate(offsetX, offsetY);
		imgCtx.scale(zoom, zoom);

		for (const img of images) {
			const localImageData = imageElements.get(img.id);
			if (!localImageData?.isLoaded) continue;

			const isSelected = selectedImageId === img.id;

			if (isSelected) {
				const centerX = localImageData.localX + localImageData.width / 2;
				const centerY = localImageData.localY + localImageData.height / 2;

				imgCtx.save();
				imgCtx.translate(centerX, centerY);
				imgCtx.scale(1.1, 1.1);
				imgCtx.drawImage(
					localImageData.img,
					-localImageData.width / 2,
					-localImageData.height / 2,
					localImageData.width,
					localImageData.height
				);
				imgCtx.restore();
			} else {
				imgCtx.drawImage(
					localImageData.img,
					localImageData.localX,
					localImageData.localY,
					localImageData.width,
					localImageData.height
				);
			}
		}

		imgCtx.restore();
	}

	function getCanvasCoordinates(e: MouseEvent): { x: number; y: number } {
		const rect = imgCanvas.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left - offsetX) / zoom,
			y: (e.clientY - rect.top - offsetY) / zoom
		};
	}

	function getPixelAtMousePosition(e: MouseEvent): Uint8ClampedArray {
		const rect = imgCanvas.getBoundingClientRect();
		const screenX = (e.clientX - rect.left) * dpr;
		const screenY = (e.clientY - rect.top) * dpr;
		return imgCtx.getImageData(screenX, screenY, 1, 1).data;
	}

	function handleClick(e: MouseEvent): void {
		const { x, y } = getCanvasCoordinates(e);

		for (const [id, localImageData] of imageElements) {
			if (!localImageData.isLoaded) continue;
			if (
				x > localImageData.localX &&
				x < localImageData.localX + localImageData.width &&
				y > localImageData.localY &&
				y < localImageData.localY + localImageData.height
			) {
				// Get pixel data at mouse position
				const pixel = getPixelAtMousePosition(e);
				const isTransparent = pixel[3] === 0;

				if (!isTransparent) {
					handleImageClick(id);
					return;
				}
			}
		}

		handleBackgroundClick(x, y);
	}

	function handleImageClick(id: string): void {
		if (selectedImageId === id) {
			selectedImageId = null;
			return;
		}
		selectedImageId = id;
	}

	function handleBackgroundClick(x: number, y: number): void {
		selectedImageId = null;
		onBackgroundClick?.(x, y);
	}

	function handleMouseDown(e: MouseEvent): void {
		isDragging = true;
		startX = e.clientX - offsetX;
		startY = e.clientY - offsetY;
		mouseDownX = e.clientX;
		mouseDownY = e.clientY;
		hasMoved = false;
		cursor = 'grabbing';
	}

	function handleMouseMove(e: MouseEvent): void {
		if (!isDragging) return;

		// Check if mouse has moved beyond threshold
		const deltaX = Math.abs(e.clientX - mouseDownX);
		const deltaY = Math.abs(e.clientY - mouseDownY);
		if (deltaX > CLICK_THRESHOLD || deltaY > CLICK_THRESHOLD) {
			hasMoved = true;
		}

		offsetX = e.clientX - startX;
		offsetY = e.clientY - startY;
		updateStoredOffsets();
		drawBackground();
		drawImages();
		e.preventDefault();
	}

	function handleMouseUp(e: MouseEvent): void {
		// Only trigger click if the mouse didn't move significantly
		if (!hasMoved) {
			handleClick(e);
		}

		isDragging = false;
		hasMoved = false;
		cursor = 'grab';
	}

	function handleMouseLeave(): void {
		if (isDragging) {
			isDragging = false;
			cursor = 'grab';
		}
	}

	// Touch event handlers for mobile
	function handleTouchStart(e: TouchEvent): void {
		if (e.touches.length === 1) {
			e.preventDefault();
			isDragging = true;
			const touch = e.touches[0];
			startX = touch.clientX - offsetX;
			startY = touch.clientY - offsetY;
			mouseDownX = touch.clientX;
			mouseDownY = touch.clientY;
			hasMoved = false;
			cursor = 'grabbing';
		}
	}

	function handleTouchMove(e: TouchEvent): void {
		if (!isDragging || e.touches.length !== 1) return;

		e.preventDefault();
		const touch = e.touches[0];

		// Check if touch has moved beyond threshold
		const deltaX = Math.abs(touch.clientX - mouseDownX);
		const deltaY = Math.abs(touch.clientY - mouseDownY);
		if (deltaX > CLICK_THRESHOLD || deltaY > CLICK_THRESHOLD) {
			hasMoved = true;
		}

		offsetX = touch.clientX - startX;
		offsetY = touch.clientY - startY;
		updateStoredOffsets();
		drawBackground();
		drawImages();
	}

	function handleTouchEnd(e: TouchEvent): void {
		if (e.touches.length === 0) {
			// Only trigger click if touch didn't move significantly
			if (!hasMoved && e.changedTouches.length > 0) {
				// Convert touch event to mouse-like coordinates for handleClick
				const touch = e.changedTouches[0];
				const mouseEvent = new MouseEvent('click', {
					clientX: touch.clientX,
					clientY: touch.clientY,
					bubbles: true,
					cancelable: true,
					view: window
				});
				handleClick(mouseEvent);
			}

			isDragging = false;
			hasMoved = false;
			cursor = 'grab';
		}
	}

	$effect(() => {
		// Redraw the images when the images, selected image id, or zoom changes
		images;
		selectedImageId;
		zoom;
		drawImages();
	});

	$effect(() => {
		// Redraw background when zoom changes
		zoom;
		drawBackground();
	});

	// Export function to manually set zoom (useful for zoom controls)
	export function setZoom(newZoom: number): void {
		zoom = Math.max(0.1, Math.min(3, newZoom)); // Clamp between 0.1x and 3x
		drawBackground();
		drawImages();
	}

	// Export function to get current zoom
	export function getZoom(): number {
		return zoom;
	}
</script>

<div class="relative h-full w-full" style="touch-action: none; overscroll-behavior: none;">
	<canvas
		bind:this={bgCanvas}
		class="background-canvas absolute top-0 left-0 z-0 h-full w-full"
		style="cursor: {cursor}; touch-action: none;"
	></canvas>
	<canvas
		bind:this={imgCanvas}
		class="images-canvas absolute top-0 left-0 z-1 h-full w-full"
		style="touch-action: none;"
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseLeave}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	></canvas>
</div>
