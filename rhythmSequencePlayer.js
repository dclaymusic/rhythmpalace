RhythmSequencePlayer = function(tileX, tileY, tileGrid) {
	// Notes on rhythm codes:
	// The available tiles have at least 5 renderings of the rhythms.
	// Logic elsewhere tends to use these 2-based codes, which have the benefit
	// of using tile and sound base indexes that are multiples of 10.
	// e.g. adding zero to these rhythm codes gives the white background tiles
	// adding 10 gives black background, 20 for red background, 120 for brick and 140 for ice
	// Similar for sounds, adding 160 to these rythm codes gives the "slow rhythms block" sounds
	// and adding 170 gives the "slow rhythms marimba" sounds.
	//
	// Puzzle code might typically avoid using some rhythms:
	//  e.g. 2 (rest), 9 (syncopated 8th), and 10,11 (dotted 8ths)
	// but this class is capable of handling the full range 2-11
	const minRhythmCode = 2; // rest
	const maxRhythmCode = 11; // 1/16th, 3/16th

	const whiteBackgroundTileBase = 0;
	const brickBackgroundTileBase = 120;
	const blockSoundBase = 160;
	const marimbaSoundBase = 170;

	const blackQuestionMark = 109;
	const redQuestionMark = 110;
	const brickWall = 0;


	this._nextFrameTime = 0;
	this._animationIndex = 0;
	this._isPlayingSequence = false;
	this._rhythmSequence = new Array();
	this._solvedLength = 0;
	// For errors that don't require the solution path to be re-routed, we allow the player to
	// continue working on the current rhythm sequence.  This should be less jarring than resetting
	// the current sequence.  The player doesn't get credit for completing a sequence where an error
	// was made (i.e. the next sequence length does not get incremented) but the error status does
	// get cleared
	this._indexOfLastPlayerError = -1;
	this._nextSolutionLength = 1;

	this.beginPlayingSequence = function() {
		if (this._isPlayingSequence) {
			// player has to wait until finished current playback before re-starting
			return;
		}
		if (this._rhythmSequence.length < 1) {
			// May happen if player has solved the last rhythm on the solution path but chooses to press
			// spacebar (to play the next rhythms) instead of just proceeding to the goal tile.
			return;
		}
		this._isPlayingSequence = true;
		this._nextFrameTime = 0;
	};

	this.setSequence = function(newSequence) {
		if (newSequence.constructor != Array) {
			throw new Error("Bad sequence data type.");
		}
		const newLen= newSequence.length;
		if (newLen > 8) {
			throw new Error(`new sequence is too long (${newLen}).`);
		}
		if (newLen < 2) {
			// Assume that if the new sequence is size 1 then the
			// player did not complete the last sequence successfully.
			this._nextSolutionLength = 1;
		}
		// TODO think about race conditions with playback
		this._rhythmSequence.length = 0; // clear / discard old values
		let x = tileX;
		for (let rhythmCode of newSequence) {
			if (rhythmCode < minRhythmCode || rhythmCode > maxRhythmCode) {
				throw new Error(`Bad rhythm code ${rhythmCode}.`);
			}
			this._rhythmSequence.push(rhythmCode);
			// TODO - fix so we can handle other y values than zero
			tileGrid[x] = blackQuestionMark;
			x++;
		}
		while (x < 10) {
			tileGrid[x] = brickWall;
			x++;
		}
		this._solvedLength = 0;
	};

	// Decrease the length of the solved rhythms by one and increase the length of the unsolved
	// rhythms by shifting everything left one and appending nextRhythmCode in last position.
	// This is a little bit like negative progress in that completion becomes more remote.  
	this.shiftOne = function(nextRhythmCode) {
		if (this._solvedLength < 1) {
			return;
		}
		this._rhythmSequence.splice(0, 1); // delete first item
		this._rhythmSequence.push(nextRhythmCode);
		this._solvedLength --;
		if (this._indexOfLastPlayerError >= 0) {
			this._indexOfLastPlayerError--;
		}
		// TODO consolidate tile setting logic into one place (currently 3 copies)
		const questionMark = this._indexOfLastPlayerError < 0 ? blackQuestionMark : redQuestionMark;
		let x = tileX;
		for (let i = 0; i < 10; i ++) {
			const rhythmCode = this._rhythmSequence[i];
			if (rhythmCode < minRhythmCode || rhythmCode > maxRhythmCode) {
				throw new Error(`Bad rhythm code ${rhythmCode}.`);
			}
			const tileValue =
					i <  this._solvedLength
							? this._rhythmSequence[i] :
									i < this._rhythmSequence.length ? questionMark : brickWall;
			tileGrid[tileX + i] = tileValue;
		}
	};

	this.getNextUnsolvedRhythm = function() {
		 if (this._solvedLength >=  this._rhythmSequence.length) {
			 throw new Error("No more unsolved rhythms to get.");
		 }
		 return this._rhythmSequence[this._solvedLength];
	};

	this.incrementOneRhythmSolved = function(rhythmCode) {
		const expectedRhythmCode = this._rhythmSequence[this._solvedLength];
		if (rhythmCode != expectedRhythmCode) {
			throw new Error(`Expected rhythm (${expectedRhythmCode}) but got  (${rhythmCode}).`);
		}
		const newLen = this._solvedLength + 1;
		if (newLen > this._rhythmSequence.length) {
			throw new Error(`Too many solved increments (${newLen}).`);
		}
		const x = tileX + this._solvedLength;
		tileGrid[x] = rhythmCode + brickBackgroundTileBase;
		if (newLen == this._rhythmSequence.length) {
			if (this._indexOfLastPlayerError >= 0) {
				this._nextSolutionLength = newLen;
				this._indexOfLastPlayerError = -1;
			} else {
				this._nextSolutionLength = newLen + 1;
			}
		}
		this._solvedLength = newLen;
	};

	// Returms true if they player has any solved rhythms in the sequence.
	// Note that progress can go backwards (to zero) via function shiftOne().
	this.hasSolvedAny = function() {
		return this._solvedLength > 0;
	};

	this.getRemainingLength = function() {
		return this._rhythmSequence.length - this._solvedLength;
	};

	this.countRemainingMatches = function(expectedRhythmCodes) {
		let result = 0;
		let j = 0;
		for (let i = this._solvedLength; i < this._rhythmSequence.length; i++) {
			const actualRhythmCode =  this._rhythmSequence[i];
			const expectedRhythmCode =  expectedRhythmCodes[j];
			if (actualRhythmCode != expectedRhythmCode) {
				break;
			}
			result ++;
			j++;
		}
		return result;
	};

	this.onPlayerError = function() {
		this._indexOfLastPlayerError = this._solvedLength;
		for (let i = this._solvedLength; i < this._rhythmSequence.length; i++) {
			tileGrid[tileX + i] = redQuestionMark;
		}
	};

	// Called (as a work around) for when the player navigates to a correct rhythm tile but not the
	// one expected by the MazeGrid.  If the new solution path still matches any of what this
	// RhythmSequencePlayer expects, those rhythms get preserved.  The player will only be able to
	// complete the remaining length and thus _lastCompletedSolutionLength is likely to decrease.
	// This is part of the difficulty of solving longer sequences. The player needs to look ahead.
	this.truncateRemaingLength = function(remainingLengthToKeep) {
		const newLen = this._solvedLength + remainingLengthToKeep;
		while (this._rhythmSequence.length > newLen) {
			this._rhythmSequence.pop();
		}
	};

	this.getNextSequenceLength = function() {
		return Math.min(8, this._nextSolutionLength);
	};

	this.isSolved = function() {
		 this._solvedLength >= this._rhythmSequence.length;
	};

	this.maybePlaySounds = function(currentFrameTime, currentSecond) {
		if (this._isPlayingSequence) {
			if (this._nextFrameTime == 0) {
				this._animationIndex = -1;
				this._nextFrameTime = currentFrameTime - 1;
			}
			if (currentFrameTime > this._nextFrameTime) {
				this._nextFrameTime += 125;
				this._animationIndex++;
				if (this._animationIndex % 8 == 0) {
					// +solvedLength here so as to not replay previously solved rhythms
					const rhythmIndex = this._solvedLength + Math.floor(this._animationIndex / 8);
					if (rhythmIndex >= this._rhythmSequence.length) {
						// done with this playback
						this._animationIndex = 0;
						this._isPlayingSequence = false;
						return;
					}
					const rhythmCode = this._rhythmSequence[rhythmIndex]
					const sndIx = rhythmCode + blockSoundBase;
					// console.log("Playing sound " + sndIx + " for rhythmIndex (" + rhythmIndex + ").");
					playSnd(sndIx);
				}
			}
		}
	};

	this.maybeAnimateDraw = function(currentFrameTime, currentSecond) {
		if (!this._isPlayingSequence) {
			return;
		}
		const startX = (tileX + this._solvedLength) * tileW;
		const endX = (tileX + this._solvedLength) * tileW + Math.floor(this._animationIndex * tileW / 8);
		const y = (tileY + 2) * tileH;
		ctx.beginPath();
		ctx.moveTo(startX, y + 2);
		ctx.lineTo(endX, y + 2);
		ctx.lineTo(endX, y + tileH - 3);
		ctx.lineTo(startX, y + tileH - 3);
		ctx.lineTo(startX, y + 2);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#777777"; // 50% gray
		ctx.stroke();
	};
};
