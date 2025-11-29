<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let isDragging: boolean = false;
	let startX: number, startY: number;
	let offsetX: number = 0,
		offsetY: number = 0;
	let isInitialized: boolean = false;
	let backgroundImage: HTMLImageElement | null = null;

	type Image = {
		img: HTMLImageElement;
		x: number;
		y: number;
		width: number;
		height: number;
	};

	let images: Image[] = $state([]);

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);

		// Load background texture
		const bgImage = new Image();
		bgImage.onload = () => {
			backgroundImage = bgImage;
			draw();
		};
		bgImage.src = './bg.jpg';

		addImage('./logo.png', 0, 0, 400);

		return () => window.removeEventListener('resize', resizeCanvas);
	});

	function resizeCanvas(): void {
		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();

		// Set the canvas buffer size (accounting for DPR)
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;

		// Scale the context to match DPR
		ctx.scale(dpr, dpr);

		// Center the canvas on first initialization
		if (!isInitialized) {
			offsetX = rect.width / 2;
			offsetY = rect.height / 2;
			isInitialized = true;
		}

		if (ctx) draw();
	}

	function draw(): void {
		const dpr = window.devicePixelRatio || 1;
		const logicalWidth = canvas.width / dpr;
		const logicalHeight = canvas.height / dpr;
		ctx.clearRect(0, 0, logicalWidth, logicalHeight);
		ctx.save();
		ctx.translate(offsetX, offsetY);

		// Draw repeating background texture - only visible tiles
		if (backgroundImage) {
			const tileWidth = backgroundImage.width;
			const tileHeight = backgroundImage.height;

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
					ctx.drawImage(backgroundImage, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
				}
			}
		}

		for (const img of images) {
			ctx.drawImage(img.img, img.x, img.y, img.width, img.height);
		}

		ctx.restore();
	}

	function addImage(src: string, x: number, y: number, intendedWidth: number = 100): void {
		console.log('addImage', src);
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

	function handleMouseDown(e: MouseEvent): void {
		isDragging = true;
		startX = e.clientX - offsetX;
		startY = e.clientY - offsetY;
		canvas.style.cursor = 'grabbing';
	}

	function handleMouseMove(e: MouseEvent): void {
		if (!isDragging) return;

		offsetX = e.clientX - startX;
		offsetY = e.clientY - startY;
		draw();
	}

	function handleMouseUp(): void {
		isDragging = false;
		canvas.style.cursor = 'grab';
	}

	function handleMouseLeave(): void {
		if (isDragging) {
			isDragging = false;
			canvas.style.cursor = 'grab';
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
		draw();
	}

	function handleTouchEnd(e: TouchEvent): void {
		if (e.touches.length === 0) {
			isDragging = false;
		}
	}

	$effect(() => {
		images;
		draw();
	});
</script>

<canvas
	bind:this={canvas}
	class="h-full w-full"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
></canvas>

<style>
	canvas {
		border: 1px solid #ccc;
		display: block;
		width: 100%;
		cursor: grab;
	}

	canvas:active {
		cursor: grabbing;
	}
</style>
