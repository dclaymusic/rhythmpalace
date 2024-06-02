// In this Puzzle Room player has to navigate a "maze" of rhythms.
//
// The initial setup is a grid of rhythm tiles with the player on one side and the goal tile on
// the other.  The player can press space bar anywhere in the grid to listen to a sequence of
// future rhythms.  The player can re-listen to the sequence of future rhythms as many times as
// needed.  There is no penalty for re-listening besides the time taken.
//
// When the player chooses to move between squares, if the destination square contains a rhythm
// that matches the expected next future rhythm, the character proceeds to move into the
// destination square.  The destination square gets cleared and that first rhythm is removed from
// the sequence of future rhythms.  Conversely if the destination square contains a rhythm that
// does *not* match the first future rhythm, the destination tile gets transformed into a wall tile
// (containing the same rhythm so as to help with error feedback to the player).
//
// Internally, the selection of next rhythms is governed by a "solution path" which is a randomly
// generated to snake around many of the remaining tiles.  Care must be taken (in the design of the
// logic here) to always make sure there is a valid solution path to the goal.
//
// The player does *not* have to move along the expected solution path.  When setting up the puzzle,
// the rhythms of the tiles adjacent to the solution path are selected so as to keep the solution
// path "preferred".  However it is *not* expected that the solution path will always be the only
// way.  If the player moves to a correct rhythm but not the expected tile according to the
// solution path, the solution path will get re-routed.  Being allowed to move anywhere (that is
// not an incorrect rhythm) also implies the player can move back across already cleared squares.
// The game should never give the player a next rhythm that isn't immediately adjacent, so it
// should never be necessary to move back to empty squares.  However if the player moves to an
// empty square the next expected rhythm remains unchanged.
//
// Adjusting length of future rhythm sequence:
// The length of the sequence of future rhythms depends on how well the player is doing.  The
// length starts at 1.  If the player completes a sequence of 1 OK, it increases to 2.  If the
// player completes the sequence of length 2 Ok it increases to 3, and so on to a max of 6(?).  If
// the player makes a mistake (resulting in a new wall tile) the future rhythm sequence length
// returns to 1.  The player can see the current rhythm sequence length as a count of question
// marks rendered near the top of the grid.  As individual rythms are solved, the question mark
// turns into a brick tile of the same rhythm.

// During solving of a future rhythm sequence, if the player presses space (to
// listen to the sequence) only the remaining rhythms are played.  TODO - is there any penalty for
// re-listening during?  Perhaps the reward is reduced to whatever the remaining sequence length 
// is.  Suggest probabilistically (e.g with 25% chance) dropping one of the solved rhythms and
// extending the unsolved rhythms (question marks) by one.
//
// There is also a lot of potential complexity for when the player moves to a valid rhythm but on
// an unexpected square.  If the future rhythm sequence is non-empty, and there is an alternate
// path that has the same rhythms *and* ends somewhere connected to the goal, then no action is
// needed.  In general it seems unlikely that there will be valid alternate path so this leaves
// some options.  The rhythm sequence could get reset (but it might be hard to communicate to the
// player that this has happened.  Some nearby rhythm could be flipped to provide a new valid path
// to complete the future rhythm sequence.  This is probably hard to code well and also could be
// too much of a hint for the player.  Other ways to avoid this problem might involve making
// calculations and adjustments at the time a new future rhythm sequence gets started.  One idea is
// to limit the current sequence length by how far the player can advance along that route before
// reaching a decision point.  This has added complexity for keeping track of the max length of the
// last solved sequence.  Another idea is to flip nearby rhythm tiles either to eliminate any
// invalid paths *or* to make an incomplete alternate path completely valid.
// Current (rough) plan for when the player deviates from the path:
//   - if a wrong rhythm, a wall tiles gets placed and the FRS gets reset.
//   - if the right rhythm but wrong square the FRS gets reset (not great - would like to impove).
//   - if moving to an empty tile from a solution tile no change to the FRS.
//   - if moving to an empty tile from another empty tile no change.
//
// Possible other design enhancements and questions:
// - Should it be possible for the player to make the maze unsolvable by making enough mistakes so
//   as to block the path to the destination?  Leaning "no".  If "yes" then there's the design
//   problem of how to communicate to the player what's happening.  Perhaps a text message could
//   explain this and the player presses space to regenerate a new puzzle.  If "no" the design
//   problem is that there are infrequent but definitely possible scenarios where the maze becomes
//   unsolvable when the mistake move transforms one of the future solution path tiles into a wall
//   and that tile was a solution path bottle-neck among the remaining tiles.  The best way to
//   solve this depends on whether moving over already cleared tiles is allowed.  If "yes", then
//   the new solution path can just cut across a cleared region before proceeding to the rhythm
//   tiles connected to the goal tile.  If "no", then some of the already cleared tiles can be
//   restored to rhythm tiles to connect the player to the goal region.  This could be a bit janky.
//   
// - Is it OK for the player to move to an already cleared tile? Leaning yes but it complicates
//   things a little.  How does the player get back on track?  Probably just navigate over 
//   non-rhythm tiles (empty or prize tiles) until finding a correct tile for the next rhythm.
// 
// - Is there any penalty for choosing a wrong rhythm tile?  The obvious answers are: loss of time
//   and resetting the future rhythm sequence back to 1.  Perhaps no other penalty is appropriate.
//
// - Prize tiles along the way.  These might be placed randomly within the grid.  If the player's
//   path happens to pass adjacent to one of these the player can divert there to pick up the item.

function PuzzleRoomA() {
  const whiteBackgroundTileBase = 0;
  const brickBackgroundTileBase = 120;
  
  const startingPos = [1, 4];
  const goalSquarePos = [12, 4];
  const lobbyDoorPos = [0, 4];
  const gameMapToMazeGridOffset = [-1, -1]; 
  
  const G = 66; // Goal tile: warp white background
  const puzzleAGameMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
                          0, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 0,
                          0, 64, 64,64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 0,
                          0, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 0,
                          56,1 ,64, 64, 64, 64, 64, 64, 64, 64, 64, 64, G, 0,
                          0, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 0,
                          0, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 0,
                          0, 64, 64,64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 0,
                          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  

  this._isActive = false;
  this._hasInitialized = false;
  this._animationIndex = 0;
  this._mazeGrid = new MazeGrid(12, 7, [0,3], [11,3], [3, 4, 5, 6, 7, 8]);
  this._mazeGrid.generatePath([0,3]);
  this._rhythmSequencePlayer = new RhythmSequencePlayer(1, 0, puzzleAGameMap);
  this._rhythmSequencePlayer.setSequence(this._mazeGrid.getNextRhythmCodes(1));
  this._isSolved = false;
  
  const isPlayerAt = function (coords) {
    Coords.assertIsCoords(coords)
    return playerX() == coords[0] && playerY() == coords[1];
  }    
  
  this.isActive = function() {
    return this._isActive;
  };
  this.setActive = function() {
    this._isActive = true;
  };
  
  this.maybeDraw = function(currentFrameTime, currentSecond, playerPositionHasChanged) {
    if (!this._isActive) {
      return;
    }
		if(!this._hasInitialized) { 
      this.initialSetup(); 
      clearTextBar();
      playSnd(144);
      this._hasInitialized = true;
    }
		this.drawTiles(currentFrameTime, currentSecond);
		this.processTiles(playerPositionHasChanged);
  };

  
  this.initialSetup = function() {
    title = 'Rhythm Maze';
    //resetting dungeon parameters
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, mapW*tileW, mapH*tileH);

    mapW = 14;
    mapH = 9;
                            
    gameMap = puzzleAGameMap;
    this.copyRhythmTilesFromMazeGrid();

    resetItemMap();
    resetAlphaMap();

    starting_pos = startingPos;
    lastTileVisited = starting_pos;
    player.position[0] = starting_pos[0];
    player.position[1] = starting_pos[1];
    player.placeAt(player.position[0], player.position[1]);
    player.delayMove = 500; // move player slowly while solving
  };
  
  // Handler for when the player presses space bar
  this.maybeTick = function() {
    if (!this._isSolved) {
      // Player has requested the rhythm sequence gets played.
      // If the player has already solved some rhythms there should be a penalty for 
      // requesting playback too often. 33% of the time we "shift" the sequence by one.
      if (this._rhythmSequencePlayer.hasSolvedAny() && randomInt(2) == 0) {
        const oneLonger = this._rhythmSequencePlayer.getRemainingLength() + 1;
        const nextRhythms = this._mazeGrid.getNextRhythmCodes(oneLonger);
        if (nextRhythms.length = oneLonger) {
          const nextRhythmCode = nextRhythms.at(-1);
          // This effectively decreases the number of solved rhythms by one and adds nextRhythmCode
          // as the last unsolved rhythm.  The player will now have to solve one more rhythm to
          // complete the current sequence.
          this._rhythmSequencePlayer.shiftOne(nextRhythmCode);
        }
      }
      this._rhythmSequencePlayer.beginPlayingSequence();
    }
  }
  
  
	this.drawTiles = function(currentFrameTime, currentSecond) {
    this._rhythmSequencePlayer.maybePlaySounds(currentFrameTime, currentSecond);

    for(var y = 0; y < mapH; ++y)
    {
      for(var x = 0; x < mapW; ++x)
      {
        //draw gameMap
        var tile = tileTypes[gameMap[toIndex(x,y)]];
        ctx.drawImage(tileset, tile.sprite[0].x, tile.sprite[0].y, tile.sprite[0].w, tile.sprite[0].h,
          x*tileW, y*tileH + (tileH*2), tileW, tileH);


              //itemMap
              if(itemMap[toIndex(x,y)] >= 2)
              {
                  var item = itemTypes[itemMap[toIndex(x,y)]];
                  ctx.drawImage(tileset, item.sprite[0].x, item.sprite[0].y, item.sprite[0].w, item.sprite[0].h,
                      x*tileW, y*tileH + (tileH*2), tileW, tileH);
              }

              //draw glowing tiles (if puzzle solved)
              if(this._isSolved)
              {
                  if(alphaMap[toIndex(x,y)] > 0.0) { alphaMap[toIndex(x,y)] -= alphaReduction;
                  ctx.fillStyle = `rgba(244,125,96,${alphaMap[toIndex(x,y)]})`;
                  ctx.fillRect(x*tileW, y*tileH + (tileH*2), tileW, tileH); }
                  else { alphaMap[toIndex(x,y)] = 0.0; }
              }
              else
              {
                  if(alphaMap[toIndex(x,y)] > 0.0) { 
                      alphaMap[toIndex(x,y)] -= alphaReduction;
                      ctx.fillStyle = `rgba(0,0,0,${alphaMap[toIndex(x,y)]})`;
                      ctx.fillRect(x*tileW, y*tileH + (tileH*2), tileW, tileH);  
                  }
                  else { alphaMap[toIndex(x,y)] = 0.0; } 
              }
      }
    }
    this._rhythmSequencePlayer.maybeAnimateDraw(currentFrameTime, currentSecond);
     
    if (false && !this._isSolved) { // TODO - helpful drawing to show expected path
      const solutionPath = this._mazeGrid._solutionPath;
      if (solutionPath != null) {
        ctx.beginPath();
        let i = 0;
        for (let coord of solutionPath) {
          const x = (1+coord[0]) * tileW + tileW / 2;  
          const y = (3+coord[1]) * tileH + tileH / 2;  
          if (i == 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          i++;
        }
        ctx.strokeStyle = "#DD9900";
        ctx.lineWidth = 4;
        ctx.stroke();     
      }
    }
	  //draw character
	  sprite = player.sprites[player.direction];
	  ctx.drawImage(tileset, sprite[0].x, sprite[0].y, sprite[0].w, sprite[0].h,
		player.position[0], player.position[1]  + (tileH*2),
		player.dimensions[0], player.dimensions[1])
  };
  
  
	this.processTiles = function (playerPositionHasChanged) {
    if (!playerPositionHasChanged) {
      if (this._isSolved) {
        return;
      }
      const src = player.tileFrom;
      const dest = player.tileTo;
      if (Coords.areCoordsEqual(src, dest)) {
        return;
      }
      // else - player is in transition between 2 squares
      const destMazeCoord = Coords.addCoords(dest, gameMapToMazeGridOffset);
      const mapSquareIndex = toIndex(dest[0], dest[1]);
      const destTile = gameMap[mapSquareIndex];
      if (destTile == 1) { // cleared (already solved square)
        // Allow player to move to empty squares.
         return;
      }
      
      if (destTile >= 2 && destTile <= 11) {
        const rhythmCode = destTile - whiteBackgroundTileBase; 
        if (this._mazeGrid.isNextRhythmCode(rhythmCode)) {
          // Allow movement to proceed.
          // This will be completed on a subsequent call with playerPositionHasChanged true
          return;
        }
        player.tileTo = [src[0], src[1]];  // abort the player's in progress move
        this._mazeGrid.markSquarePermanentlyUnavailable(destMazeCoord);  // keep the maze up to date with unavailable squares
        // change the rhythm path tile to a wall with the same rhythm
        gameMap[mapSquareIndex] = brickBackgroundTileBase + destTile;
        // TODO move this code into MazeGrid to happen as a side-effect of markSquarePermanentlyUnavailable
        if (this._mazeGrid.isSquareOnFuturePath(destMazeCoord)) {
           const srcMazeCoord = Coords.addCoords(src, gameMapToMazeGridOffset);
           this._mazeGrid.generatePath(srcMazeCoord);
           // Reset the rhythm sequence if the solution path got re-routed.
           // This is conservative but not ideal.  If there was a way for the player to complete
           // the current rhythm sequence that would be easier than resetting the sequence.
           this._rhythmSequencePlayer.setSequence(this._mazeGrid.getNextRhythmCodes(1));
        } else {
          // else - just tell the rhythm sequence player that an error was made.
          // The player won't achieve a sequence length increase when complete but at least
          // they get to continue solving the rhythms they have already listened to.
          this._rhythmSequencePlayer.onPlayerError();
        }
        playSnd(135);  // vibesNo
      }
      return;
    }
    if (!this._isSolved) {
      const playerMazeCoord = Coords.addCoords(player.tileTo, gameMapToMazeGridOffset);
      const currentTile = thisTileIs();
      if (currentTile >= 2 && currentTile <= 11) {
        const rhythmCode = currentTile - whiteBackgroundTileBase;
        // Note the code above (when playerPositionHasChanged==false) should have verified this
        // destination rhythmCode was be correct.  The value is only used here as a sanity check.
        this._rhythmSequencePlayer.incrementOneRhythmSolved(rhythmCode);
        this._mazeGrid.advancePlayerToCoord(playerMazeCoord)
        setTileTo(player.tileTo[0], player.tileTo[1], 1); // clear the solved rhythm tile
        const rhythmSequenceRemainingLength = this._rhythmSequencePlayer.getRemainingLength();
        if (rhythmSequenceRemainingLength == 0) {
          // Successfully traversed the last rhythm sequence.  Allocate a new one, possibly longer.
          const nextRhythmSequenceLength = this._rhythmSequencePlayer.getNextSequenceLength();
          // console.log("Next rhythm sequence len = " + nextRhythmSequenceLength + ".");
          this._rhythmSequencePlayer.setSequence(
              this._mazeGrid.getNextRhythmCodes(nextRhythmSequenceLength));
        } else {
          // Still solving current rhythm sequence.
          // Note - the above call to MazeGrid.advancePlayerToCoord() may have caused the solution
          // path to get re-routed.  Confirm with the RhythmSequencePlayer that the expected codes
          // still match.
          const remainingCodes = this._mazeGrid.getNextRhythmCodes(rhythmSequenceRemainingLength);
          const matchingLength = this._rhythmSequencePlayer.countRemainingMatches(remainingCodes);
          if (matchingLength == 0) {
            // Need to re-allocate a new rhythm sequence. 
            const nextRhythmSequenceLength = this._rhythmSequencePlayer.getNextSequenceLength();
            // console.log("Next rhythm sequence len = " + nextRhythmSequenceLength + ".");
            this._rhythmSequencePlayer.setSequence(
                this._mazeGrid.getNextRhythmCodes(nextRhythmSequenceLength));
          } else {
            this._rhythmSequencePlayer.truncateRemaingLength(matchingLength);
          }
        }
        playSnd(rhythmCode + 160);
      }
    }      
//    console.log("processTiles(true) " + this._mazeGrid._solutionPathIndex);
    if(thisTileIs() >= 3 && thisTileIs() <= 22) {
        playSnd(gameMap[toIndex(playerX(),playerY())] + 160);  
    }
    else if(thisTileIs() == 2) { playSnd(1); }
    else { playSnd(gameMap[toIndex(playerX(),playerY())]); }

    if(this._isSolved) { pickUpItem(); }

    if(isPlayerAt(goalSquarePos) && !this._isSolved) {
      this._rhythmSequencePlayer.setSequence([]);
        this._isSolved = true;
        setPlayerTile(1); 
        player.delayMove = 250;
        playSnd(95);
        //playBgSnd(160,'key8');
        updateTextBar("Quickly collect your rhythms and leave!");
        rhythmsToItems();
        collectTimerOn(collectionTime);
        for(let x = 1; x <= 12; x++ ) {
            for(let y = 1; y <= 7; y++) { alphaMap[toIndex(x,y)] = startingAlpha;}
        }
        setTileTo(lobbyDoorPos[0], lobbyDoorPos[1], 50); //unlock lobby door
    }
		if(isPlayerAt(lobbyDoorPos) && this._isSolved) { 
			// //move to new level
          this._isActive = false;
          isSlide = true;
          slideTick = true;
		} 
 };
 
 
  this.copyRhythmTilesFromMazeGrid = function() {

    for(let y = 1; y < 8; y++) {
        const my = y + gameMapToMazeGridOffset[1];
        for(let x = 1; x < 13; x++) {
          const coord = [x, y];
          if (Coords.areCoordsEqual(coord, startingPos)
              || Coords.areCoordsEqual(coord, goalSquarePos)) {
            continue;
          }            
          const mx = x + gameMapToMazeGridOffset[0];
          const rhythmCode = this._mazeGrid.getRhythmCodeAt(mx, my);
          gameMap[toIndex(x,y)] = whiteBackgroundTileBase + rhythmCode;
        }
    }
};


}

window.puzzleRoomA = new PuzzleRoomA();
