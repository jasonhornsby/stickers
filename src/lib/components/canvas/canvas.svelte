<script lang="ts">
	import { onMount } from 'svelte';

	let bgCanvas: HTMLCanvasElement;
	let imgCanvas: HTMLCanvasElement;
	let bgCtx: CanvasRenderingContext2D;
	let imgCtx: CanvasRenderingContext2D;
	let isDragging: boolean = false;
	let startX: number, startY: number;
	let offsetX: number = 0,
		offsetY: number = 0;
	let isInitialized: boolean = false;
	let backgroundImage: HTMLImageElement | null = null;

	let dpr = $state(1);
	let logicalWidth = $state(0);
	let logicalHeight = $state(0);

	type Image = {
		img: HTMLImageElement;
		x: number;
		y: number;
		width: number;
		height: number;
	};

	let images: Image[] = $state([]);

	onMount(() => {
		bgCtx = bgCanvas.getContext('2d')!;
		imgCtx = imgCanvas.getContext('2d')!;

		dpr = window.devicePixelRatio || 1;
		logicalWidth = bgCanvas.width / dpr;
		logicalHeight = bgCanvas.height / dpr;

		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);

		// Load background texture
		const bgImage = new Image();
		bgImage.onload = () => {
			backgroundImage = bgImage;
			drawBackground();
		};
		bgImage.src = './bg.jpg';

		addImage('./logo.png', 0, 0, 400);

		return () => window.removeEventListener('resize', resizeCanvas);
	});

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

		// Center the canvas on first initialization
		if (!isInitialized) {
			offsetX = rect.width / 2;
			offsetY = rect.height / 2;
			isInitialized = true;
		}

		if (bgCtx && imgCtx) {
			drawBackground();
			drawImages();
		}
	}

	function drawBackground(): void {
		bgCtx.clearRect(0, 0, logicalWidth, logicalHeight);
		bgCtx.save();
		bgCtx.translate(offsetX, offsetY);

		// Draw repeating background texture - only visible tiles
		if (backgroundImage) {
			const tileWidth = backgroundImage.width * 0.7;
			const tileHeight = backgroundImage.height * 0.7;

			// Calculate visible area in world coordinates
			const visibleLeft = -offsetX;
			const visibleTop = -offsetY;
			const visibleRight = visibleLeft + logicalWidth;
			const visibleBottom = visibleTop + logicalHeight;

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

		for (const img of images) {
			imgCtx.drawImage(img.img, img.x, img.y, img.width, img.height);
		}

		imgCtx.restore();
	}

	function addImage(src: string, x: number, y: number, intendedWidth: number = 100): void {
		const img = new Image();
		img.onload = () => {
			const width = img.width;
			const height = img.height;
			const ratio = width / height;
			const newWidth = intendedWidth;
			const newHeight = newWidth / ratio;
			images.push({
				img,
				x: x - newWidth / 2,
				y: y - newHeight / 2,
				width: newWidth,
				height: newHeight
			});
		};
		img.src = src;
	}

	function getCanvasCoordinates(e: MouseEvent): { x: number; y: number } {
		const rect = imgCanvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left - offsetX,
			y: e.clientY - rect.top - offsetY
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

		for (const img of images) {
			if (x > img.x && x < img.x + img.width && y > img.y && y < img.y + img.height) {
				// Get pixel data at mouse position
				const pixel = getPixelAtMousePosition(e);
				const isTransparent = pixel[3] === 0;

				if (!isTransparent) {
					handleImageClick(img);
					return;
				}
			}
		}
	}

	function handleImageClick(img: Image): void {
		console.log('clicked on image', img);
	}

	function handleMouseDown(e: MouseEvent): void {
		isDragging = true;
		startX = e.clientX - offsetX;
		startY = e.clientY - offsetY;
		imgCanvas.style.cursor = 'grabbing';
	}

	function handleMouseMove(e: MouseEvent): void {
		if (!isDragging) return;

		offsetX = e.clientX - startX;
		offsetY = e.clientY - startY;
		drawBackground();
		drawImages();
	}

	function handleMouseUp(): void {
		isDragging = false;
		imgCanvas.style.cursor = 'grab';
	}

	function handleMouseLeave(): void {
		if (isDragging) {
			isDragging = false;
			imgCanvas.style.cursor = 'grab';
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
		}
	}

	function handleTouchMove(e: TouchEvent): void {
		if (!isDragging || e.touches.length !== 1) return;

		e.preventDefault();
		const touch = e.touches[0];
		offsetX = touch.clientX - startX;
		offsetY = touch.clientY - startY;
		drawBackground();
		drawImages();
	}

	function handleTouchEnd(e: TouchEvent): void {
		if (e.touches.length === 0) {
			isDragging = false;
		}
	}

	$effect(() => {
		images;
		drawImages();
	});
</script>

<div class="canvas-container">
	<canvas bind:this={bgCanvas} class="canvas-layer background-canvas"></canvas>
	<canvas
		bind:this={imgCanvas}
		class="canvas-layer images-canvas"
		onclick={handleClick}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseLeave}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	></canvas>
</div>

<style>
	.canvas-container {
		position: relative;
		width: 100%;
		height: 100%;
		border: 1px solid #ccc;
	}

	.canvas-layer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;
	}

	.background-canvas {
		z-index: 1;
	}

	.images-canvas {
		z-index: 2;
		cursor: grab;
	}

	.images-canvas:active {
		cursor: grabbing;
	}
</style>
