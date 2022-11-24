function randRange(min, max) {
	return min + Math.random() * (max - min);
}

function getColor(brightness) {
	return `rgb(${5 + 70 * brightness},${5 + 70 * brightness},${5 + 70 * brightness})`;
}
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let trees = [];
const totalTree = 50;
for (let i = 0; i < totalTree; i++) {
	const brightness = (1 / totalTree) * i;
	const tree = new FractalTree({
		totalChildBranch: 4,
		presistance: randRange(0.55, 0.65),
		maxLength: randRange(76, 200),
		maxSize: randRange(20, 30),
		density: randRange(0.5, 1.5),
		sizeLoss: randRange(0.3, 0.7),
		lengthTreshold: randRange(30, 50),
		woodColor: getColor(brightness),
		leafColor: getColor(brightness),
	});
	tree.startAnimation(randRange(300, 600));
	trees.push({ offsetX: Math.random() * canvas.width, tree, delay: Math.random() * 5000 });
}

const context = canvas.getContext("2d");
let before;

const mainTree = new FractalTree({
	totalChildBranch: 6,
	presistance: 0.78,
	maxLength: 200,
	maxSize: 40,
	density: randRange(0.4, 0.8),
	sizeLoss: 0.5,
	lengthTreshold: 100,
	woodColor: "rgb(150,150,150)",
});

const fractalDefinition = document.getElementById("fractalDefinition");
let mainTreeXoffset =
	window.innerWidth - window.innerWidth / 4
mainTree.startAnimation(3000);
let finishRendering = false;
const animateCb = (timestamp) => {
	if (!before) {
		before = timestamp;
	}
	const deltatime = timestamp - before;
	let totalTreeFinished = 0;
	for (let i = 0; i < totalTree; i++) {
		if (trees[i].tree.stop) {
			totalTreeFinished++;
		}
		trees[i].tree.stepAnimation(deltatime);
		trees[i].tree.renderAnimation(context, { x: trees[i].offsetX, y: canvas.height });
	}
	mainTree.stepAnimation(deltatime);
	mainTree.renderAnimation(context, { x: mainTreeXoffset, y: canvas.height });
	if (finishRendering && mainTree.stop) {
		return;
	}

	if (totalTreeFinished >= totalTree) {
		finishRendering = true;
	}

	before = timestamp;
	return window.requestAnimationFrame(animateCb);
};

setTimeout(() => window.requestAnimationFrame(animateCb), 500);

window.addEventListener("resize", () => {
	const widthRatio = window.innerWidth / canvas.width;
	for (let i = 0; i < trees.length; i++) {
		trees[i].offsetX *= widthRatio;
	}
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	mainTreeXoffset = window.innerWidth - window.innerWidth / 4;
	if (finishRendering || mainTree.stop) {
		window.requestAnimationFrame(animateCb);
	}
});
