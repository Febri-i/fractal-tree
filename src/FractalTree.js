function lerp(start, end, amt) {
	return (1 - amt) * start + amt * end;
}
class FractalTree {
	constructor({
		totalChildBranch,
		presistance,
		lengthTreshold,
		maxLength,
		leafColor,
		woodColor,
		maxSize,
		sizeLoss,
		density,
	}) {
		this.density = density;
		this.sizeLoss = sizeLoss;
		this.maxSize = maxSize;
		this.leafColor = leafColor;
		this.woodColor = woodColor;
		this.lengthTreshold = lengthTreshold;
		this.totalChildBranch = totalChildBranch;
		this.presistance = presistance;
		this.fractalData = this.recursiveCreateTree(
			maxLength,
			0,
			{ x: 0, y: 0 },
			Math.PI / 2,
			this.totalChildBranch,
			maxSize
		);
	}

	recursiveCreateTree(length, totalBranch, parentPosition, angle, maxBranch, size) {
		const direction = { x: Math.cos(angle), y: Math.sin(angle) };
		let treeData = {
			endPosition: {
				x: parentPosition.x + direction.x * (length + size * this.presistance),
				y: parentPosition.y - direction.y * (length + size * this.presistance),
			},
			startPosition: parentPosition,
			size,
		};
		if (length < this.lengthTreshold) {
			treeData.color = this.leafColor;
			return treeData;
		}
		treeData.childBranch = [];
		const anglesize = Math.PI / maxBranch;
		for (let i = 0; i < maxBranch; i++) {
			const newangle =
				(anglesize * i - Math.PI / 2) * this.density + (anglesize / 2) * this.density;

			treeData.childBranch.push(
				this.recursiveCreateTree(
					length * this.presistance,
					totalBranch + maxBranch,
					{
						x: parentPosition.x + direction.x * length,
						y: parentPosition.y - direction.y * length,
					},
					angle + newangle,
					maxBranch + 1,
					size * this.sizeLoss
				)
			);
		}

		return treeData;
	}

	renderRecursive(offset, context, branches) {
		let nextBranches = [];
		for (let index = 0; index < branches.length; index++) {
			const branch = branches[index];
			context.lineWidth = branch.size;
			context.beginPath();
			context.strokeStyle = branch.color || this.woodColor;
			context.moveTo(offset.x + branch.startPosition.x, offset.y + branch.startPosition.y);
			context.lineTo(offset.x + branch.endPosition.x, offset.y + branch.endPosition.y);
			context.stroke();
			if (branch.childBranch) {
				for (let i = 0; i < branch.childBranch.length; i++) {
					nextBranches.push(branch.childBranch[i]);
				}
			}
			context.closePath();
			context.stroke();
		}
		if (nextBranches[0]) {
			return this.renderRecursive(offset, context, nextBranches);
		}
	}
	animationNeedStepUpdate = [];
	animationDuration = 0;
	animationStepDone = [];
	nextAnimation = [];
	step = 0;
	startAnimation(duration) {
		this.animationNeedStepUpdate = [
			{
				startPosition: this.fractalData.startPosition,
				endPosition: this.fractalData.endPosition,
				size: this.fractalData.size,
				color: this.fractalData.color,
			},
		];
		this.nextAnimation = [...this.fractalData.childBranch];
		this.animationDuration = duration;
		this.animationStepDone = [];
		this.step = 0;
	}

	stepAnimation(delta) {
		if (!this.animationNeedStepUpdate[0]) {
			return;
		}
		this.step += delta;
		if (this.step < this.animationDuration) {
			return;
		}
		for (let i = 0; i < this.animationNeedStepUpdate.length; i++) {
			this.animationStepDone.push(this.animationNeedStepUpdate[i]);
		}

		let newNextAnimation = [];
		this.animationNeedStepUpdate = [];
		for (let i = 0; i < this.nextAnimation.length; i++) {
			const { startPosition, endPosition, size, childBranch, color } = this.nextAnimation[i];
			this.animationNeedStepUpdate.push({ startPosition, endPosition, size, color });
			if (childBranch) {
				for (let k = 0; k < childBranch.length; k++) {
					newNextAnimation.push(childBranch[k]);
				}
			}
		}
		this.nextAnimation = newNextAnimation;
		this.step = 0;
	}

	renderAnimation(context, offset) {
		if (!this.animationNeedStepUpdate[0]) {
			this.stop = true;
		}

		for (let x = 0; x < this.animationStepDone.length; x++) {
			let { startPosition, endPosition, size, color } = this.animationStepDone[x];
			context.beginPath();

			context.strokeStyle = color || this.woodColor;
			context.lineWidth = size;
			context.moveTo(startPosition.x + offset.x, startPosition.y + offset.y);
			context.lineTo(endPosition.x + offset.x, endPosition.y + offset.y);
			context.stroke();
			context.closePath();
		}
		const amount = this.step / this.animationDuration;
		for (let x = 0; x < this.animationNeedStepUpdate.length; x++) {
			let { startPosition, endPosition, size, color } = this.animationNeedStepUpdate[x];
			const startOffsettedx = startPosition.x + offset.x;
			const startOffsettedy = startPosition.y + offset.y;
			const endOffsettedx = endPosition.x + offset.x;
			const endOffsettedy = endPosition.y + offset.y;

			context.beginPath();
			context.strokeStyle = color || this.woodColor;
			context.lineWidth = lerp(0, size, amount);
			context.moveTo(startOffsettedx, startOffsettedy);
			context.lineTo(
				lerp(startOffsettedx, endOffsettedx, amount),
				lerp(startOffsettedy, endOffsettedy, amount)
			);
			context.stroke();
			context.closePath();
		}
	}

	render(startPosition, context) {
		this.renderRecursive(startPosition, context, [this.fractalData]);
	}
}
