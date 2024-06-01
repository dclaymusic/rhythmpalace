// TODO kinda want a namespace without a variable but 'var Coords' creates a variable
// Consider whether complex solution from https://stackoverflow.com/questions/2504568
// is worthwhile since it seems to allow private members.
var Coords = {};

// Notes on use of JSON.stringify() and JSON.parse()
// Several important parts of this code require checking for presence of coords in Set objects.
// This code mostly uses Arrays of length 2 to represent coords but these do not get de-duped by
// Set objects. i.e. 'new Set([[1,2]]).has([1,2])' is false.
// Creating our own custom datatype won't help. See https://stackoverflow.com/questions/2975948
// The work-around is to convert the 2-arrays to strings whenever we need to do Set-like logic and
// in some cases we need to convert those strings back to 2-arrays when we need the coord x, y
// values.  This code currently uses JSON.stringify() and JSON.parse() for this purpose but due to
// the lack of compile time type checking, it's possible for the developer to make a mistake and
// either forget to stringify or parse or perhaps do it twice.  There are a lots of calls to
// `Coords.assertIsCoords()` to help reduce these coding errors.
// There may be small advantages in introducing a dedicated type for coords but there's currently
// no way around the need to convert to and from string (to make the Sets work). Furthermore, the
// JSON.stringify() function is supposed to be very fast.  Not sure about JSON.parse() though.

Coords.assertIsCoords = function (coords) {
	if (coords.constructor !== Array) {
		throw new Error("Specified coords is not an array as expected.");
	}
	if (coords.length != 2) {
		throw new Error("Specified coords is not of length 2 as expected.");
	}
}

Coords.areCoordsEqual = function(a, b) {
	Coords.assertIsCoords(a);
	Coords.assertIsCoords(b);
	return a[0] == b[0] && a[1] == b[1];
};

Coords.addCoords = function(a, b) {
	Coords.assertIsCoords(a);
	Coords.assertIsCoords(b);
	return [a[0] + b[0], a[1] + b[1]];
};

Coords.isAdjacent = function(a, b) {
	Coords.assertIsCoords(a);
	Coords.assertIsCoords(b);
	if (a[0] == b[0]) {
		const diff = a[1] - b[1];
		return diff == 1 || diff == -1;
	}
	if (a[1] != b[1]) {
		return false;
	}
	const diff = a[0] - b[0];
	return diff == 1 || diff == -1;
};

// TODO find better home for getOnlyElement
Coords.getOnlyElement = function(collection) {
	const factory = collection.constructor;
	if (factory == Set) {
		const size = collection.size;
		console.assert(size == 1, "Unexpected size " + size + ".");
		return collection.values().next().value
	}
	console.assert(factory == Array, "Unexpected collection type " + factory + ".");
	const size = collection.length;
	console.assert(size == 1, "Unexpected size " + size + ".");
	return collection.at(0);
};


MazeGrid = function(width, height, initialStartCoord, endCoord, availableRhythmCodes) {
	Coords.assertIsCoords(initialStartCoord);
	Coords.assertIsCoords(endCoord);
	if (availableRhythmCodes.constructor != Array) {throw new Error("Expected array for availableRhythmCodes.");}
	if (availableRhythmCodes.length < 1) {throw new Error("availableRhythmCodes must not be empty.");}
	if (availableRhythmCodes.length > 10) {throw new Error("Too many availableRhythmCodes.");}
	// The generated solution path is always prohibited from using these squares.
	// Values in this set are `JSON.stringify(coord)`.
	const permanentlyUnavailableSquares = new Set();
	// playerVisitedSquares are the squares the player has successfully passed through.
	// Whenever the solution path needs to be regenerated, the logic in this class will try to avoid
	// passing through any already visited squares.  If no connected path can be found via unvisited
	// squares, the startCoord of the generated solution path will be chosen nearby the player (thus
	// requiring a short traversal through already visited squares).
	// Values in this set are `JSON.stringify(coord)`.
	const playerVisitedSquares = new Set();

	const rhythmCodesByCoord = new Map();

	this.width = width;
	this.height = height;
	this._solutionPath = null;
	this._solutionPathIndex = 0;
	// Promote to instance fields, just to help debugging (easily inspectable):
	this.permanentlyUnavailableSquares = permanentlyUnavailableSquares;
	this.playerVisitedSquares = playerVisitedSquares;
	
	{
		const randMax = availableRhythmCodes.length - 1;  // non-standard randomInt() func.
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const coord = [x, y];
				if (Coords.areCoordsEqual(coord, initialStartCoord)
						|| Coords.areCoordsEqual(coord, endCoord)) {
					continue;
				}
				// Assign rhythms to every other square.
				const textCoord = JSON.stringify(coord);
				const rhythmCode = availableRhythmCodes[randomInt(randMax)];
				rhythmCodesByCoord.set(textCoord, rhythmCode);
			}
		}
	}

	// Used to avoid future re-routing of the solution path to squares that the player has already
	// visited (/solved).  Only if needed will the resetToShortestPath() logic assume the player can
	// move across these squares.
	this.markSquareVisitedByPlayer = function(coord) {
		Coords.assertIsCoords(coord);
		playerVisitedSquares.add(JSON.stringify(coord));
	};

	this.markSquareVisitedByPlayer(initialStartCoord);

	// Used when blocking the player's path due to an incorrect choice.
	this.markSquarePermanentlyUnavailable = function(coord) {
		Coords.assertIsCoords(coord);
		permanentlyUnavailableSquares.add(JSON.stringify(coord));
	};

	this.getRhythmCodeAt = function(x, y) {
		if (x < 0 || x > width) { throw new Error(`x value (${x}) out of range.`);}
		if (y < 0 || y > height) { throw new Error(`y value (${y}) out of range.`);}
		return getRhythmCodeForCoord([x, y]);
	};

	const getRhythmCodeForCoord = function(coord) {
		Coords.assertIsCoords(coord);
		const textCoord = JSON.stringify(coord);
		const result = rhythmCodesByCoord.get(textCoord);
		if (result == undefined) {
			throw new Error(`No rhythm for (${x}, ${y}).`);
		}
		return result;
	};

	this.getNextRhythmCodes = function(count) {
		const result = new Array();
		const maxPath = this._solutionPath.length - 1; // -1 to exclude destination square
		const startIx = this._solutionPathIndex + 1; // +1 to exclude last solved square
		for (let i = startIx; i < maxPath; i++) {
			const rhythmCode = getRhythmCodeForCoord(this._solutionPath[i]);
			result.push(rhythmCode);
			if (result.length >= count) {
				break;
			}
		}
		return result;
	};

	this.isNextRhythmCode = function(proposedRhythmCode) {
		const pathIndex = this._solutionPathIndex + 1;
		if (pathIndex >= this._solutionPath.length - 1) {
			// pathIndex is pointing to the goal tile (which is not a rhythm tile)
			return false;
		}
		const expectedRhythmCode = getRhythmCodeForCoord(this._solutionPath[pathIndex]);
		return proposedRhythmCode == expectedRhythmCode;
	};

	this.advancePlayerToCoord = function(playerCoord) {
		Coords.assertIsCoords(playerCoord);
		const rhythmCode = getRhythmCodeForCoord(playerCoord);
		if (!this.isNextRhythmCode(rhythmCode)) {
			throw new Error(`Unexpected rhythm ${rhythmCode}. Bad player coords (${playerCoord})?`);
		}
		this.markSquareVisitedByPlayer(playerCoord);
		if (Coords.areCoordsEqual(this._solutionPath[this._solutionPathIndex+1], playerCoord)) {
			// This is exactly where we expected the player to go.
			this._solutionPathIndex++;
			return;
		}
		// else - player chose a valid rhythm but not on the expected path.
		this.generatePath(playerCoord);
	};

	this.isSquareOnFuturePath = function(coord) {
		for (let i = this._solutionPath.length - 1; i > this._solutionPathIndex; i--) {
			if (Coords.areCoordsEqual(coord, this._solutionPath[i])) {
				return true;
			}
		}
		return false;
	};

	const isAvailableSquareFunc = function(x, y) {
		if (x < 0 || y < 0 || x >= width || y >= height) {
			return false;
		}
		const textCoord = JSON.stringify([x, y]);
		return !permanentlyUnavailableSquares.has(textCoord)
				&& !playerVisitedSquares.has(textCoord);
	};

	//
	// Finds the (actually "a") shortest path from startCoord to endCoord.
	//
	// Typically the startCoord has changed since the last call (because the player has solved some
	// of the maze but the solution needs re-routing due to a player mistake).  If a valid solution
	// path can be found (one going only through available squares) this will be chosen.  In this
	// case the first coord along the new solution path will be startCoord.  If it is required that
	// the player move through adjacent empty (already visited) squares to get to a valid solution
	// path then the new solution path will *not* start with startCoord.  In either case the first
	// square of the solution path is *always* a visited square.
	//
	getShortestPath = function(startCoord) {
		Coords.assertIsCoords(startCoord);
		if (!playerVisitedSquares.has(JSON.stringify(startCoord))) {
			throw new Error("Bad startCoord: " + startCoord + ".");
		}
		if (Coords.areCoordsEqual(startCoord, endCoord)) {
			// degenerative case: start==end
			// Not sure if this will ever happen
			// but also not sure if code below is general enough to handle this
			return [startCoord];
		}

		// TODO temp hard code
		if (false && this.playerVisitedSquares.size < 2) {
			// This is an example of the solution path where it is possible for a player's mistake to
			// cut off all valid paths to the goal.  If from [2,1] or [1,1] the player tries to go up,
			// tiles [2,0] or [1,0] become a wall and block off possible paths.
			this._solutionPath = [
			[0,3],[1,3],[2,3],[3,3], // forward (normal unmodified)
			[3,2], [3,1],  // up toward boundary but 1 short
			[2,1], [1, 1], [0,1], // backwards close to boundary
			[0,0], // up
			[1,0], [2,0], [3,0], [4,0], // along boundary (through bottle neck) 
			[4,1], [4,2], // back down
			[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3]];  // forward (normal unmodified)
			return true;
		}
		const textEndCoord = JSON.stringify(endCoord);
		const matchesEndCoordFunc = function(textCoord) {
			return textCoord == textEndCoord;
		}

		let forwardLevels =
				getBreadthFirstLevels(startCoord, matchesEndCoordFunc, isAvailableSquareFunc);
		if (forwardLevels == null) {
			// path is not connected from the specified startCoord (player's position)
			// Now do a fallback algorithm:
			//  - Find all available squares reachable from endCoord. Call this "goalSet"
			//  - BFS from the startCoord via "playerVisitedSquares" to anything in goalSet
			//  - use the last path coord returned by that BFS as the new startCoord for another BFS
			// Design note - a seemingly more obvious approach might be to simply BFS from startCoord
			// to endCoord avoiding only permanentlyUnavailableSquares.  Then choose the new startCoord
			// as the square after the last "mostly" unavailable square the path goes through.  The
			// disadvantage of this approach is that this newStartCoord might actually be far from the
			// player (initial startCoord) and that could be confusing to the player.  The advantage of
			// the chosen approach is that the new startCode is very likely to be close to the player.
//      console.log("searching goal set levels");
			const goalSetLevels = getBreadthFirstLevels(endCoord, null, isAvailableSquareFunc);
			const goalSet = new Set();
			for (let levelSet of goalSetLevels) {
				for (let textCoord of levelSet) {
					if (textCoord.constructor != String) {
						throw new Error("Unexpected textCoord type (" + textCoord.constructor + ")");
					}
					// insanity check
					const reparsedCoord = JSON.parse(textCoord);
					Coords.assertIsCoords(reparsedCoord);
					goalSet.add(textCoord);
				}
			}
			const isInGoalSetFunc = function(textCoord) {
				return goalSet.has(textCoord);
			};
			const isPlayerVisitedOrInGoalSetFunc = function(x, y) {
				const textCoord = JSON.stringify([x, y]);
				return playerVisitedSquares.has(textCoord) || goalSet.has(textCoord);
			};
			const playerVisitedSetLevels =
					getBreadthFirstLevels(startCoord, isInGoalSetFunc, isPlayerVisitedOrInGoalSetFunc);
			if (playerVisitedSetLevels == null) {
				throw Error("Did not find connected path across cleared squares to the uncleared squares connected to the goal.");
			}
			if (playerVisitedSetLevels.size < 3) {
				throw Error("Too few playerVisitedSetLevels.");
			}
			const lastLevelSet = playerVisitedSetLevels.at(-1);
			const firstNonvisitedCoord = JSON.parse(Coords.getOnlyElement(lastLevelSet));
			const secondLastSet = playerVisitedSetLevels.at(-2);
			const newStartCoord = findAnyAdjacentInSet(firstNonvisitedCoord, secondLastSet);
			if (!playerVisitedSquares.has(JSON.stringify(newStartCoord))) {
				throw new Error("Bad new startCoord: " + newStartCoord + ".");
			}
			forwardLevels =
				getBreadthFirstLevels(newStartCoord, matchesEndCoordFunc, isAvailableSquareFunc);
		}
		const pathLen = forwardLevels.length;
		const result = new Array(pathLen);

		let nextNode = null;
		for (let i = pathLen - 1; i >= 0; i--) {
			let prev;
			if (nextNode == null) {
				prev = JSON.parse(Coords.getOnlyElement(forwardLevels.at(-1)));
			} else {
				prev = null;
				for (let textCandidate of forwardLevels.at(i)) {
					const coordCandidate = JSON.parse(textCandidate);
					if (Coords.isAdjacent(coordCandidate, nextNode)) {
						//console.log(`${coordCandidate} is next to ${nextNode}.`)
						prev = coordCandidate;
						break;
					}
				}
			}
			console.assert(prev != null, "Did not find adjacent square.");
			result[i] = prev;
			nextNode = prev;
		}
		return result;
	};

	// Returns the 2-tuple coord of any square in textCoordsSet that is adjacent to targetCoord.
	// textCoordsSet is a set of strings of format `JSON.stringify(coord)`.
	//
	// Throws an Error if no adjacent square is found.
	const findAnyAdjacentInSet = function(targetCoord, textCoordsSet) {
		for (let textCandidate of textCoordsSet) {
			const coordCandidate = JSON.parse(textCandidate);
			if (Coords.isAdjacent(coordCandidate, targetCoord)) {
				//console.log(`${coordCandidate} is next to ${nextNode}.`)
				return coordCandidate;
			}
		}
		throw new Error(`Did not find square adjacent to ${coord} in ${candidateSet}.`);
	};


	// Gets all squares reachable from startCoord in a standard "breadth first" search toward some
	// target square(s).  The returned data structure is an Array of Sets containing 
	// JSON.stringify(coord) of the squares' coordinates.
	// Each item in the Array represents the successive levels searched.  The first Set contains
	// squares adjacent to startCoord.  The next set contains squares ajacent to those and so on.
	// If targetFunc is null, all reachable squares are returned.  When targetFunc is present (non-
	// null), it must be a function which takes a single arg (being the JSON.stringify() of a
	// square's coord) and returning boolean.  In this scenario if the algorithm succeeds, the last
	// Set in the result will contain just one square coordinate and this will be the only square in
	// the result that satisfies targetFunc.
	//
	// startCoord - where to start searching from
	// targetFunc - optional function taking single string which is JSON.stringify(coord) where coord
	//     is a 2-item Array.  returns true if coords are of a "target" square.
	// isAvailableSquareFunc - function taking (x, y) returning true if the square is available to
	//     traverse
	//
	const getBreadthFirstLevels = function(startCoord, targetFunc, isAvailableSquareFunc) {
		Coords.assertIsCoords(startCoord);
		const generateAdjacentSquares = function(coord,  isAvailableSquareFunc) {
			Coords.assertIsCoords(coord);
			const result = new Array();

			const addIfAvailable = function(deltaX, deltaY) {
				const x = coord[0] + deltaX;
				const y = coord[1] + deltaY;
				if (isAvailableSquareFunc(x, y)) {
					result.push([x, y]);
				}
			};
			addIfAvailable( 0, -1);
			addIfAvailable( 1,  0);
			addIfAvailable( 0,  1);
			addIfAvailable(-1,  0);
			return result;
		};

		const result = new Array();

		const startTextKeys = [JSON.stringify(startCoord)];
		const visited = new Set(startTextKeys);
		let currentSet = new Set(startTextKeys);
		while (currentSet.size > 0) {
			result.push(currentSet);
//      console.log("Level " + result.length + ": " + Array.from(currentSet).join("', '"));
			const nextSet = new Set();
			for (let textCurrent of currentSet) {
				const currentCoord = JSON.parse(textCurrent);
				Coords.assertIsCoords(currentCoord);
				const adjacentSquares = generateAdjacentSquares(currentCoord, isAvailableSquareFunc);
//        console.log("For " + textCurrent + ", got adjacentSquares " + JSON.stringify(adjacentSquares));
				for (let next of adjacentSquares) {
					Coords.assertIsCoords(next);
					const textKey = JSON.stringify(next);
					if (visited.has(textKey)) {
						continue;
					}
					if (targetFunc != null && targetFunc(textKey)) {
						result.push(new Set([textKey]));
						return result;
					}
					visited.add(textKey);
					nextSet.add(textKey);
				}
			}
			currentSet = nextSet;
		}
		if (targetFunc == null) {
			// Returning all reachable squares.
			return result;
		}
		// TODO - maybe suppress this logging
		console.log("Did not find any target square. visited = "
				+ JSON.stringify(Array.from(visited)) 
				+ " result = " + JSON.stringify(Array.from(result)));
		return null;
	};

	// Design note - using prototype inheritance here because a lot of instances of PathMutation get created
	const PathMutation = function(insertionIndex, deletionCount, newCoords, gapCount) {
		this.insertionIndex = insertionIndex;
		this.deletionCount = deletionCount;
		this.newCoords = newCoords;
		this.gapCount = gapCount;
	};
	PathMutation.prototype.getInsertionIndex = function() {
		return this.insertionIndex;
	};
	PathMutation.prototype.getNewCoords = function() {
		return this.newCoords;
	};
	PathMutation.prototype.getGapCount = function() {
		return this.gapCount;
	};

	PathMutation.prototype.apply = function(path) {
		 path.splice(this.insertionIndex, this.deletionCount, ...this.newCoords);
	};


	this.generatePath = function(startCoord) {
		let currentSolutionPath = getShortestPath(startCoord);
		
		// Count the max number of squares we *could* go through.
		// This is the count of squares connected to the endCoord.
		const goalSetLevels = getBreadthFirstLevels(endCoord, null, isAvailableSquareFunc);
		let goalSetSize = 0;
		for (let levelSet of goalSetLevels) {
			goalSetSize += levelSet.size;
		}
		// Aim to make the solution path snake through roughly half the available squares
		const idealSolutionLength = goalSetSize / 3;
		while (currentSolutionPath.length < idealSolutionLength) {
		
			const allMutations = generatePathMutations(currentSolutionPath);
			if (allMutations.length < 1) {
				console.log(
						`Ran out of potential path mutations. `
						+ `Target was ${idealSolutionLength} but got ${currentSolutionPath.length}.`);
				break;
			}
			const expectedMutationCount = 1 + currentSolutionPath.length / 10;  // TODO is this a good hueristic?
			const mutations = randomSelectCompatibleMutations(allMutations, expectedMutationCount);
//      console.log(
//          `Applied ${mutations.length} mutations. `
//          + `Solution path length is now ${currentSolutionPath.length}.`);
			currentSolutionPath = applyMutations(currentSolutionPath, mutations);
		}
//    console.log("Setting this._solutionPath to " + JSON.stringify(this._solutionPath));
		this._solutionPath = currentSolutionPath;
		this._solutionPathIndex = 0;
	}

	// Proposes mutations to the basePath to make it more wriggly.
	const generatePathMutations = function(basePath) {

		// unavailableSquaresSet is the union of permanently and mostly
		// unavailable squares along with the squares of the base path.
		const unavailableSquaresSet = new Set(permanentlyUnavailableSquares);
		for (let coord of playerVisitedSquares) {
			unavailableSquaresSet.add(coord);
		}
		for (let coord of basePath) {
			unavailableSquaresSet.add(JSON.stringify(coord));
		}
		// Sanity check that none of the entries have been double stringified
		// What a mess. See file-level note on JSON.parse() / JSON.stringify()
		for (let textCoord of unavailableSquaresSet) {
			Coords.assertIsCoords(JSON.parse(textCoord));
		}
		const isAvailableSquareFunc = function(coord) {
			const [x, y] = coord;
			if (x < 0 || y < 0 || x >= width || y >= height) {
				return false;
			}
			return !unavailableSquaresSet.has(JSON.stringify([x, y]));
		};

		const getDiversionDeltas = function(a, d) {
			if (a[0] == d[0]) {
				// vertical
				// divert on left, right
				return [[-1, 0], [+1, 0]];
			}
			// horizontal
			// divert on top, bottom
			return [[0, -1], [0, +1]];
		};
		const coordsTwoAMinusB = function(a, b) {
			const twoA = Coords.addCoords(a, a);
			return [twoA[0] - b[0], twoA[1] - b[1]];
		};

		const result = new Array();
		const pathLen = basePath.length;
		for (let i = 0; i < pathLen-1; i++) {
			const a = basePath[i];
			const d = basePath[i+1];
			const diversionDeltas = getDiversionDeltas(a, d);
			for (let diversionDelta of diversionDeltas) {
				const b = Coords.addCoords(a, diversionDelta);
				const c = Coords.addCoords(d, diversionDelta);

				if (isAvailableSquareFunc(b) && isAvailableSquareFunc(c)) {
					// gapCount tells how close the diverted path will be to unavailable squares
					let gapCount = 0;
					// First two gaps: could the diversion go further in the same direction?
					gapCount += isAvailableSquareFunc(Coords.addCoords(b, diversionDelta)) ? 1 : 0;
					gapCount += isAvailableSquareFunc(Coords.addCoords(c, diversionDelta)) ? 1 : 0;
					// Next two gaps: could the diversion be wider?
					gapCount += isAvailableSquareFunc(coordsTwoAMinusB(b, c)) ? 1 : 0;
					gapCount += isAvailableSquareFunc(coordsTwoAMinusB(c, b)) ? 1 : 0;
					result.push(new PathMutation(i + 1, 0, [b, c], gapCount));
				}
			}
		}
		return result;
	};

	const randomSelectCompatibleMutations = function(mutations, expectedCount) {
		const rankedMutations = new Array();
		for (let mutation of mutations) {
			const rank = 10 - randomInt(6) - mutation.getGapCount();
			rankedMutations.push([rank, mutation]);
		}
		rankedMutations.sort(function(a,b) { return a[0]-b[0];});
		
		const result = new Array();
		let lastInsertionIndex = -1;
		const usedPathIndexes = new Set();
		const usedCoordinates = new Set();
		for (let rankedMutation of rankedMutations) {
			const mutation = rankedMutation[1];
			if (usedPathIndexes.has(mutation.getInsertionIndex())) {
				continue;
			}
			const [b, c] = mutation.getNewCoords();
			const textB = JSON.stringify(b);
			const textC = JSON.stringify(c);
			if (usedCoordinates.has(textB) || usedCoordinates.has(textC)) {
				continue;
			}
			usedPathIndexes.add(mutation.getInsertionIndex());
			usedCoordinates.add(textB);
			usedCoordinates.add(textC);
			result.push(mutation);
			if (result.length >= expectedCount) {
				break;
			}
		}
		return result;
	};

	const randomSelectCompatibleMutationsOld = function(mutations) {
		const result = new Array();
		const usedPathIndexes = new Set();
		const usedCoordinates = new Set();
		for (let mutation of mutations) {
			if (usedPathIndexes.has(mutation.getInsertionIndex())) {
				continue;
			}
			if (randomInt(4) != 0) { // TODO param
				continue;
			}
			const [b, c] = mutation.getNewCoords();
			const textB = JSON.stringify(b);
			const textC = JSON.stringify(c);
			if (usedCoordinates.has(textB) || usedCoordinates.has(textC)) {
				continue;
			}
			usedPathIndexes.add(mutation.getInsertionIndex());
			usedCoordinates.add(textB);
			usedCoordinates.add(textC);
			result.push(mutation);
		}
		return result;
	};

	const applyMutations = function(basePath, mutations) {
		// Order the mutations by insertion index but reversed.
		// This is needed because the 'apply()' operation below mutates basePath and thus disturbs the
		// item indexes after the insertion point.  Applying mutations in reverse order is OK.
		const reversedMutations = Array.from(mutations);
		reversedMutations.sort(function(a, b) { return b.getInsertionIndex() - a.getInsertionIndex(); });
		const result = Array.from(basePath);
		for (let mutation of reversedMutations) {
			mutation.apply(result);
		}
		return result;
	};
};
