
//Viewport Scanning

var viewport = {

	//changed from 0,0
	endTile		: [17,24],
	startTile	: [-125, -875],
	screen		: [700,600],
	offset		: [1,16],
	update		: function(px, py) {
		this.offset[0] = Math.floor((this.screen[0]/2) - px);
		this.offset[1] = Math.floor((this.screen[1]/2) - py);

		var tile = [ Math.floor(px/tileW), Math.floor(py/tileH) ];

		this.startTile[0] = tile[0] - 1 - Math.ceil((this.screen[0]/2) / tileW);
		this.startTile[1] = tile[1] - 1 - Math.ceil((this.screen[1]/2) / tileH);

		if(this.startTile[0] < 0) { this.startTile[0] = 0; }
		if(this.startTile[1] < 0) { this.startTile[1] = 0; }

		this.endTile[0] = tile[0] + 1 + Math.ceil((this.screen[0]/2) / tileW);
		this.endTile[1] = tile[1] + 1 + Math.ceil((this.screen[1]/2) / tileH);

		if(this.endTile[0] >= mapW) { this.endTile[0] = mapW-1; }
		if(this.endTile[1] >= mapH) { this.endTile[1] = mapH-1; }
	}
};


//Window View
window.onload = function()
{

	canvas = document.getElementById('game');
    ctx = canvas.getContext("2d");
	
	requestAnimationFrame(drawGame);
	ctx.font = "bold 10pt sans-serif";

	

	window.addEventListener("keydown", function(e) {
		//add codes here
		if(soundsLoaded && openingTitleTick) { 
			openingTitleTick = false; updateTitle(''); 
			playSnd(144); playBgSnd(151,'bglobby');
			startTime = Date.now();
		}
		if(e.keyCode>=37 && e.keyCode<=40) { keyTick = true; }
		if((e.keyCode>=37 && e.keyCode<=40) || e.keyCode == 13 || e.keyCode == 32) { keysDown[e.keyCode] = true; }
		if((e.keyCode>=37 && e.keyCode<=40) || e.keyCode == 13 || e.keyCode == 32) { keysUp[e.keyCode] = false; }
		if(e.keyCode == 32)
		{
			spaceTick = true;
		}
	});
	window.addEventListener("keyup", function(e) {
		if(e.keyCode>=37 && e.keyCode<=40) { keyTick = false; }
		if((e.keyCode>=37 && e.keyCode<=40) || e.keyCode == 13 || e.keyCode == 32) { keysDown[e.keyCode] = false; }
		if((e.keyCode>=37 && e.keyCode<=40) || e.keyCode == 13 || e.keyCode == 32) { keysUp[e.keyCode] = true; }
		if(e.keyCode == 32 && spaceTick)
		{
			// console.log(player.position[0],player.position[1]);
			
			//LOBBY
			if(isLobby)
			{
				//unlocking puzzle room 1
				if(!puzzle1Solved) 
				{
					if(gameMap[toIndex(15,13)] != 50) { cycleTile([2,3]); playSnd([gameMap[toIndex(playerX(),playerY())]]);}
					if(lobbyPuzzle1State() == true && gameMap[toIndex(15,13)] != 50) { 
						for(let y = 15; y <= 17; y++) {
							for(let x = 8; x <= 10; x++) {
								// gameMap[toIndex(x,y)] += 10;
								alphaMap[toIndex(x,y)] = startingAlpha;
								lobbyPuzzleAlphaTick = true;
							}
						}
						allowLobbyRhythms = true;
						playSnd(95); playSnd(144);
						setTileTo(15,13,50); updateTextBar("You hear the click of a door nearby unlocking.");
					}
				}
				//unlocking puzzle room 2
				else if(!puzzle2Solved) 
				{
					if(gameMap[toIndex(3,13)] != 50) { cycleTile([2,3,4]); 
						if(thisTileIs() == 3) { playSnd(3); }
						else if(thisTileIs()==4) { playSnd(164); }
					}
					if(lobbyPuzzle2State() == true && gameMap[toIndex(3,13)] != 50) { 
						for(let y = 15; y <= 17; y++) {
							for(let x = 7; x <= 11; x++) {
								if(x != 9)
								{
									// gameMap[toIndex(x,y)] += 10;
									alphaMap[toIndex(x,y)] = startingAlpha;
									lobbyPuzzleAlphaTick = true;
								}
							}
						}
						allowLobbyRhythms = true;
						playSnd(95); playSnd(144);
						setTileTo(3,13,50); updateTextBar("You hear the click of a door nearby unlocking.");
					}
				}
				//unlocking puzzle room 3
				else if(!puzzle3Solved) 
				{
					if(gameMap[toIndex(15,19)] != 50) { cycleTile([3,4,6]); 
						if(thisTileIs() == 3) { playSnd(3); }
						else if(thisTileIs()==4) { playSnd(164); }
						else if(thisTileIs()==6) { playSnd(166); }
					}
					if(lobbyPuzzle3State() == true && gameMap[toIndex(15,19)] != 50) { 
						
						for(let x = 7; x <= 11; x++) {
							for(let y = 14; y <= 18; y++) {
								if(x != 8 && x != 10 && y != 16)
								{
									// gameMap[toIndex(x,y)] += 10;
									alphaMap[toIndex(x,y)] = startingAlpha;
									lobbyPuzzleAlphaTick = true;
								}
							}
						}
						allowLobbyRhythms = true;
						playSnd(95);playSnd(144);
						setTileTo(15,19,50); updateTextBar("You hear the click of a door nearby unlocking.");

					}
				}
			}

			//PUZZLE ROOM 1
			if(isPuzzleRoom1)
			{
				//PUZZLE ROOM 1
				if(thisTileIs() == 40) { setPlayerTile(41); dropPuzzle1(); playSnd(40); playSnd(146);  }
				if(!puzzle1Solved) { 
					switchTile(3,13,true);
					if(gameMap[toIndex(playerX(),playerY())] >= 2) { 
						if(thisTileIs() == 4) { playSnd(164); }
						else { playSnd([gameMap[toIndex(playerX(),playerY())]]); }
					} 
					puzzle1State(); 
				}
			}

			//PUZZLE ROOM 2
			if(isPuzzleRoom2)
			{
				if(!puzzle2Solved && gameMap[toIndex(11,1)] == 60 &&
					playerX() >= p2current[0] && playerX() <= p2current[1] && 
					playerY() >= p2current[2] && playerY() <= p2current[3])
				 { 
					switchTile(puzzle2Doors[puzzle2MiniRoom],puzzle2Doors[puzzle2MiniRoom]+10,true);
					if(thisTileIs() == 4) { playSnd(164); }
					else if(thisTileIs() == 14) { playSnd(174); }
					else { playSnd(gameMap[toIndex(playerX(),playerY())]); }
					puzzle2State(); 
				}
				if(thisTileIs() == 40) { setPlayerTile(41); dropPuzzle2(); setTileTo(11,1,60); playSnd(40); playSnd(146);  }
			}

			//PUZZLE ROOM 3
			if(isPuzzleRoom3)
			{
				if(thisTileIs() == 40) { setPlayerTile(41); dropPuzzle3(); playSnd(40); playSnd(146); }
				if(!puzzle3Solved) { 
					if(!puzzle3TilesUnlocked[0])
					{ switchTile(3,13,true); }
					else if(!puzzle3TilesUnlocked[1])
					{ switchTile(4,14,true); }
					else if(!puzzle3TilesUnlocked[2])
					{ switchTile(6,16,true); } 
					if(gameMap[toIndex(playerX(),playerY())] >= 3 && gameMap[toIndex(playerX(),playerY())] <= 16) 
					{
						if(thisTileIs() == 14) { playSnd(174); }
						else if(thisTileIs() == 16) { playSnd(176); }
						else { playSnd(gameMap[toIndex(playerX(),playerY())]); }
					}
					puzzle3State(); }
				// if(!puzzle3Solved && playerX() <= 10 &&
				// 	thisTileIs() != puzzle2Doors[puzzle2MiniRoom] && thisTileIs() != puzzle2Doors[puzzle2MiniRoom]+10) 
				// 	{
				// 		alphaMap[toIndex(playerX(),playerY())] = startingAlpha;
				// 	} 
			}

			//PUZZLE ROOM 4
			if(isPuzzleRoom4)
			{
				// sndTest();
				if(thisTileIs() == 40) { setPlayerTile(41); dropPuzzle4(); playSnd(40); playSnd(146);}
				if(!puzzle4Solved) { 
					if(playerY() == puzzle4Tier && playerY() != 2) 
					{ 
						cycleTile([p4Choices[puzzle4Tier][0],p4Choices[puzzle4Tier][1],p4Choices[puzzle4Tier][2]]);
						playSnd(gameMap[toIndex(playerX(),playerY())] + 170);
						puzzle4State(); 
					}
				}
			}
			//GALLERY
			if(isGallery)
			{						
				if(!galleryPuzzleSolved)
				{
					cycleTile([5,6,7,8]); 
					if(thisTileIs() > 4 && thisTileIs() < 10) { playSnd(gameMap[toIndex(playerX(),playerY())] + 160); }
					galleryPuzzleState();
				}
				
			}
			//PUZZLE ROOM 5
			if(isPuzzleRoom5)
			{
				if(thisTileIs() == 40) { setPlayerTile(41); dropPuzzle5(); playSnd(40); playSnd(146);}
				if(!puzzle5Solved) { 
					cycleTile([103,104,105]);
					puzzle5State(thisTileIs());
				}
			}
			//PUZZLE ROOM 6
			if(isPuzzleRoom6)
			{
				if(thisTileIs() == 40) { setPlayerTile(41); dropPuzzle6(); playSnd(40); playSnd(146);}
				else if(!puzzle6Solved && !gotPuzzle6Key) { 
				
					puzzle6State();
					// if(thisTileIs() >= 2 && thisTileIs() < 22) { playSnd(gameMap[toIndex(playerX(),playerY())] + 160); }
				}
				if(!puzzle6Solved && gotPuzzle6Key)
				{
					finalPuzzle6State();
					if(thisTileIs() > 11 && thisTileIs() < 22) { playSnd(gameMap[toIndex(playerX(),playerY())] + 160)}
					else { playSnd(40); }
				}
			}
			//PUZZLE ROOM 7
			if(isPuzzleRoom7)
			{
				if(thisTileIs() == 40) { setPlayerTile(41); dropPuzzle7(); playSnd(40); playSnd(146);}
			}
			//PUZZLE ROOM 8
			if(isPuzzleRoom8)
			{
				if(thisTileIs() == 40) { setPlayerTile(41); dropPuzzle8(); playSnd(40); playSnd(146);}
			}
			//TOWER STAIRS
			if(isTowerStairs)
			{
				if(thisTileIs() == 107) { setPlayerTile(108); dropTowerStairsPuzzle(); playSnd(40); }
				else { towerStairsState(); }			
			}
			//TOWER TOP
			if(isTower)
			{
				// 11,7 puzzle1
				// 7,11 puzzle2
				// 3,7 puzzle3
				// 7,3 puzzle4
				if(thisTileIs() == 107 && playerX() == 11 && playerY() == 7) { 
					setPlayerTile(108); dropTowerPuzzle1(); playSnd(40); tower1Active = true; towerActiveX = 13; towerActiveY = 9; clickTick = true;}
				else if(thisTileIs() == 107 && playerX() == 7 && playerY() == 11) { 
					setPlayerTile(108); dropTowerPuzzle2(); playSnd(40); tower2Active = true; towerActiveX = 9; towerActiveY = 13; clickTick = true;}
				else if(thisTileIs() == 107 && playerX() == 3 && playerY() == 7) { 
					setPlayerTile(108); dropTowerPuzzle3(); playSnd(40); tower3Active = true; towerActiveX = 1; towerActiveY = 9; clickTick = true;}
				else if(thisTileIs() == 107 && playerX() == 7 && playerY() == 3) { 
					setPlayerTile(108); dropTowerPuzzle4(); playSnd(40); tower4Active = true; towerActiveX = 9; towerActiveY = 1; clickTick = true;}

				if(playerY() >= 5 && playerY() <= 9 && playerX() == 12)
				{ cycleTile([3,4,5,6,7]); towerPuzzle1State(); playSnd(thisTileIs() + 160); }
				else if(playerX() >= 5 && playerX() <= 9 && playerY() == 12)
				{ cycleTile([4,5,6,7,8]); towerPuzzle2State(); playSnd(thisTileIs() + 160); }
				else if(playerY() >= 5 && playerY() <= 9 && playerX() == 2)
				{ cycleTile([5,6,7,8,3]); towerPuzzle3State(); playSnd(thisTileIs() + 160); }
				else if(playerX() >= 5 && playerX() <= 9 && playerY() == 2)
				{ cycleTile([6,7,8,3,4]); towerPuzzle4State(); playSnd(thisTileIs() + 160); }
				// else { towerStairsState(); }	 

			}
			puzzleRoomA.maybeTick();
			if(isLobby2)
			{

			}
			if(isPuzzleRoom9)
			{
				if(thisTileIs() == 107 && !freezeMovement) {
					dropPuzzle9();
					
				}
				// if((playerX() == 1 && playerY() == 3) && thisTileIs() == 108)
				// {
				// 	setPlayerTile(107);
				// 	for(let i = 2; i <= 11; i++)
				// 	{ gameMap[toIndex(i,1)] = 109; }
				// 	clearTimeout(aTime);
                //     setPlayerTile(107);
                //     freezeMovement = false;
				// }
				else if(thisTileIs() >= 2 && thisTileIs() <= 11)
				{
					cycleTile([3,4,5,6,7,8])
					playSnd(thisTileIs() + 160)
				}
			}
			if(isThrone)
			{
				if(playerX() == 5 && playerY() == 7 && gameMap[toIndex(3,2)] != 1 && !thronePuzzleSolved)
				{
					// gameEnd = true; //FOR TEST
					playSnd(randomInt(4) + 146);
					setTileTo(3,2,1);
					setTileTo(3,3,1);
					setTileTo(3,4,1);
					setTileTo(10,2,1);
					setTileTo(10,3,1);
					setTileTo(10,4,1);
	
				}
			}

			if(hasEar) { soundTileHandler(); }
			spaceTick = false;

		}
	});


	viewport.screen = [document.getElementById('game').width,
		document.getElementById('game').height];

	tileset = new Image();
	
	tileset.onerror = function()
	{
		ctx = null;
		alert("Failed loading tileset.");
	};

	tileset.onload = function() { tilesetLoaded = true; }
	tileset.src = tilesetURL;
	
	
};
