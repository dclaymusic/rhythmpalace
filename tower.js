function drawTower()
{
	title = 'Bell Tower';
    //resetting dungeon parameters
	ctx.fillStyle = "#000000";
	ctx.fillRect(0,  0,  viewport.screen[0], viewport.screen[1]);

    const towerMapW = 15;
	const towerMapH = 15;
	const towerGameMap = [46, 46, 46, 46, 0,   0,   0,  0,  0,  0,  0,  46, 46, 46, 46,
						  46, 46, 46, 0,  0,  62, 62, 62, 62, 62, 0,  0,  46, 46, 46, 
						  46, 46, 0,  0,  0,  64, 64, 64, 64, 64, 0,  0,  0,  46, 46,
						  46, 0,  0,  0,  1,  0,  0,  107,0,  0,  1,  56, 0,  0,  46,
						  0,  0,  0,  1,  1,  76, 1,  1,  1,  77, 1,  1,  0,  0,  0, 
						  0,  62, 64, 0,  75, 0,  0,  0,  0,  0,  75, 0,  64, 62, 0, 
						  0,  62, 64, 0,  1,  0,  0,  0,  0,  0,  1,  0,  64, 62, 0, 
						  0,  62, 64, 107,1,  0,  0,  96, 0,  0,  1,  107,64, 62, 0, 
						  0,  62, 64, 0,  1,  0,  0,  0,  0,  0,  1,  0,  64, 62, 0, 
						  0,  62, 64, 0,  74, 0,  0,  0,  0,  0,  74, 0,  64, 62, 0, 
						  0,  0,  0,  1,  1,  77, 1,  1,  1,  76, 1,  1,  0,  0,  0, 
						  46, 0,  0,  0,  1,  0,  0,  107,0,  0,  1,  0,  0,  0,  46,
						  46, 46, 0,  0,  0,  64, 64, 64, 64, 64, 0,  0,  0,  46, 46,
						  46, 46, 46, 0,  0,  62, 62, 62, 62, 62, 0,  0,  46, 46, 46,
						  46, 46, 46, 46, 0,  0,  0,  0,  0,  0,  0,  46, 46, 46, 46];
						  
	mapW = towerMapW;
	mapH = towerMapH;
	gameMap = towerGameMap;

	resetAlphaMap();

	// setTileTo(7,5,1);
	// setTileTo(7,6,1);

	starting_pos = [11,4]; //7,4
	viewport.endTile = [14,11];
	viewport.offset = [-225,75];
	viewport.startTile = [3,0];

	
	player.position[0] = starting_pos[0];
	player.position[1] = starting_pos[1];
	player.placeAt(player.position[0], player.position[1]);

	towerTick = false;
}



function drawTowerTiles(currentFrameTime, currentSecond)
{

	if((currentFrameTime % 1000 <= 50) && 
     clickTick)
    {
		if(tower1Active) { 
			gameMap[toIndex(towerActiveX,towerActiveY)] = 109;
			if(towerActiveY == 9) {  
				towerActiveY = 5;
				puzzleInc = 0; 
				gameMap[toIndex(towerActiveX,towerActiveY)] = 110;
			}
			else { 
				towerActiveY++; 
				gameMap[toIndex(towerActiveX,towerActiveY)] = 110;
			}
			clickTick = false;
			playSnd(towerSolution1[puzzleInc] + 170);
			puzzleInc++;
			setTimeout(() => { clickTick = true; }, 200);
		}
		else if(tower2Active) { 
			gameMap[toIndex(towerActiveX,towerActiveY)] = 109;
			if(towerActiveX == 9) {  
				towerActiveX = 5;
				puzzleInc = 0; 
				gameMap[toIndex(towerActiveX,towerActiveY)] = 110;
			}
			else { 
				towerActiveX++; 
				gameMap[toIndex(towerActiveX,towerActiveY)] = 110;
			}
			clickTick = false;
			playSnd(towerSolution2[puzzleInc] + 170);
			puzzleInc++;
			setTimeout(() => { clickTick = true; }, 200);
		}
		else if(tower3Active) { 
			gameMap[toIndex(towerActiveX,towerActiveY)] = 109;
			if(towerActiveY == 9) {  
				towerActiveY = 5;
				puzzleInc = 0; 
				gameMap[toIndex(towerActiveX,towerActiveY)] = 110;
			}
			else { 
				towerActiveY++; 
				gameMap[toIndex(towerActiveX,towerActiveY)] = 110;
			}
			clickTick = false;
			playSnd(towerSolution3[puzzleInc] + 170);
			puzzleInc++;
			setTimeout(() => { clickTick = true; }, 200);
		}
		else if(tower4Active) { 
			gameMap[toIndex(towerActiveX,towerActiveY)] = 109;
			if(towerActiveX == 9) {  
				towerActiveX = 5;
				puzzleInc = 0; 
				gameMap[toIndex(towerActiveX,towerActiveY)] = 110;
			}
			else { 
				towerActiveX++; 
				gameMap[toIndex(towerActiveX,towerActiveY)] = 110;
			}
			clickTick = false;
			playSnd(towerSolution4[puzzleInc] + 170);
			puzzleInc++;
			setTimeout(() => { clickTick = true; }, 200);
		}
	}


	for(var y = viewport.startTile[1]; y <= viewport.endTile[1]; ++y)
	{
		for(var x = viewport.startTile[0]; x <= viewport.endTile[0]; ++x)
		{
			//draw gameMap
			var tile = tileTypes[gameMap[toIndex(x,y)]];
			ctx.drawImage(tileset, tile.sprite[0].x, tile.sprite[0].y, tile.sprite[0].w, tile.sprite[0].h,
				viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH), tileW, tileH);

			if(itemMap[toIndex(x,y)] >= 2)
			{
				var item = itemTypes[itemMap[toIndex(x,y)]];
				ctx.drawImage(tileset, item.sprite[0].x, item.sprite[0].y, item.sprite[0].w, item.sprite[0].h,
					viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH), tileW, tileH);
			}
            //draw glowing tiles (if puzzle solved)
            // if(towerPuzzleAlphaTick)
            // {
			if(alphaMap[toIndex(x,y)] > 0.0) { alphaMap[toIndex(x,y)] -= alphaReduction;
			ctx.fillStyle = `rgba(244,125,96,${alphaMap[toIndex(x,y)]})`;
			ctx.fillRect(viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH), tileW, tileH); }
			else { alphaMap[toIndex(x,y)] = 0.0; }
            // }
		}
	}

	drawGuards(0,0);

	//draw character
	sprite = player.sprites[player.direction];
	ctx.drawImage(tileset, sprite[0].x, sprite[0].y, sprite[0].w, sprite[0].h,
		viewport.offset[0] + player.position[0], viewport.offset[1] + player.position[1],
		player.dimensions[0], player.dimensions[1])
	
		
	if(hasEar)
	{
		for(var y = viewport.startTile[1]; y <= viewport.endTile[1]; ++y)
		{
			for(var x = viewport.startTile[0]; x <= viewport.endTile[0]; ++x)
			{
				if(x == playerX() && y == playerY()) { lightMap[toIndex(x,y)] = 0; }
				else { lightMap[toIndex(x,y)] = 1-(3-getDistance(playerX(),playerY(),x,y)); }
				// if(alphaMap[toIndex(x,y)] > 0.0) { alphaMap[toIndex(x,y)] -= alphaReduction;
				ctx.fillStyle = `rgba(0,0,0,${lightMap[toIndex(x,y)]})`;
				ctx.fillRect(viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH), tileW, tileH);
				// else { alphaMap[toIndex(x,y)] = 0.0; }
			}
		}
	}
	
}

function processTowerTiles(tick)
{
	if(tick)
	{
		if(hasEar) { pickUpItem(); }
		if(thisTileIs() >= 3 && thisTileIs() <= 21) { player.delayMove = 500; } else { player.delayMove = 250; }
		if(thisTileIs() >= 3 && thisTileIs() <= 11) {
            playSnd(1);
        }
		else if(thisTileIs() >= 13 && thisTileIs() <= 21) { playSnd(gameMap[toIndex(playerX(),playerY())] + 160); }
        else { playSnd(gameMap[toIndex(playerX(),playerY())]); }
		if(thisTileIs() == 45)
		{
			updateTextBar('Some secrets are better kept than others. Are you sure you\'ve found the way out?')
		}
		if(thisTileIs() == 96) { 
			setPlayerTile(1); 
			hasEar = true;
			playSnd(143);
			dropFinalTowerPuzzle();
			dropGuards('tower');

		}

		if(thisTileIs() == 50)
		{
			playBgSnd(157,'slide1'); playBgSnd(158,'slide2'); 
			playBgSnd(159,'slide3'); playBgSnd(160,'slide4'); 
			secretSlideEntrance = true;
			isTower = false;
			puzzleRoomA.setActive();
		}
		if(thisTileIs() == 66)
		{
			isTower = false;
			puzzleRoomA.setActive();
		}
	}
}

function dropTowerPuzzle1() {
	let puzzleTiles = [];
	let scrambledTiles = [];
	puzzleTiles = scrambleArray([3,4,5,6,7]);
	towerSolution1 = puzzleTiles;

	for(let i = 0; i < puzzleTiles.length; i++)
	{ scrambledTiles.push(puzzleTiles[i]); }

	scrambledTiles = scrambleArray(scrambledTiles);
	
	for(let i = 0; i < 5; i++)
	{
		if(puzzleTiles[i] == scrambledTiles[i])
		{
			let t = scrambledTiles[i];
			let n = scrambledTiles[(i+1)%scrambledTiles.length];

			scrambledTiles[i] = n;
			scrambledTiles[(i+1)%scrambledTiles.length] = t;
		}
	}

	let j = 0;
	for(let y = playerY()-2; y <= playerY()+2; y++)
	{
		gameMap[toIndex(playerX()+1,y)] = scrambledTiles[j];
		// gameMap[toIndex(playerX()+2,y)] = puzzleTiles[j] + 80;
		gameMap[toIndex(playerX()+2,y)] = 109;
		j++;
	}
}

//3,4,7,8,9
function dropTowerPuzzle2() {
	let puzzleTiles = [];
	let scrambledTiles = [];
	puzzleTiles = scrambleArray([4,5,6,7,8]);
	towerSolution2 = puzzleTiles;

	for(let i = 0; i < puzzleTiles.length; i++)
	{ scrambledTiles.push(puzzleTiles[i]); }

	scrambledTiles = scrambleArray(scrambledTiles);
	
	for(let i = 0; i < 5; i++)
	{
		if(puzzleTiles[i] == scrambledTiles[i])
		{
			let t = scrambledTiles[i];
			let n = scrambledTiles[(i+1)%scrambledTiles.length];

			scrambledTiles[i] = n;
			scrambledTiles[(i+1)%scrambledTiles.length] = t;
		}
	}

	let j = 0;
	for(let x = playerX()-2; x <= playerX()+2; x++)
	{
		gameMap[toIndex(x,playerY()+1)] = scrambledTiles[j];
		// gameMap[toIndex(x,playerY()+2)] = puzzleTiles[j] + 80;
		gameMap[toIndex(x,playerY()+2)] = 109;
		j++;
	}
}

//3,4,5,8,11
function dropTowerPuzzle3() {
	let puzzleTiles = [];
	let scrambledTiles = [];
	puzzleTiles = scrambleArray([5,6,7,8,3]);
	towerSolution3 = puzzleTiles;

	for(let i = 0; i < puzzleTiles.length; i++)
	{ scrambledTiles.push(puzzleTiles[i]); }

	scrambledTiles = scrambleArray(scrambledTiles);
	
	for(let i = 0; i < 5; i++)
	{
		if(puzzleTiles[i] == scrambledTiles[i])
		{
			let t = scrambledTiles[i];
			let n = scrambledTiles[(i+1)%scrambledTiles.length];

			scrambledTiles[i] = n;
			scrambledTiles[(i+1)%scrambledTiles.length] = t;
		}
	}

	let j = 0;
	for(let y = playerY()-2; y <= playerY()+2; y++)
	{
		gameMap[toIndex(playerX()-1,y)] = scrambledTiles[j];
		gameMap[toIndex(playerX()-2,y)] = 109;
		// gameMap[toIndex(playerX()-2,y)] = puzzleTiles[j] + 80;
		j++;
	}
}


//3,4,6,7,10
function dropTowerPuzzle4() {
	let puzzleTiles = [];
	let scrambledTiles = [];
	puzzleTiles = scrambleArray([6,7,8,3,4]);
	towerSolution4 = puzzleTiles;

	for(let i = 0; i < puzzleTiles.length; i++)
	{ scrambledTiles.push(puzzleTiles[i]); }

	scrambledTiles = scrambleArray(scrambledTiles);
	
	for(let i = 0; i < 5; i++)
	{
		if(puzzleTiles[i] == scrambledTiles[i])
		{
			let t = scrambledTiles[i];
			let n = scrambledTiles[(i+1)%scrambledTiles.length];

			scrambledTiles[i] = n;
			scrambledTiles[(i+1)%scrambledTiles.length] = t;
		}
	}

	let j = 0;
	for(let x = playerX()-2; x <= playerX()+2; x++)
	{
		gameMap[toIndex(x,playerY()-1)] = scrambledTiles[j];
		// gameMap[toIndex(x,playerY()-2)] = puzzleTiles[j] + 80;
		gameMap[toIndex(x,playerY()-2)] = 109;
		j++;
	}
}




function towerPuzzle1State()
{
	let state = 0; let i = 0;
	for(let y = 5; y <= 9; y++)
	{ if(gameMap[toIndex(12,y)] == towerSolution1[i]) { state++; } i++; }
	if(state == 5) { 
		puzzleInc = 0;
		for(let y = 5; y <= 9; y++)
		{ // alphaMap[toIndex(12,y)] = startingAlpha; 
			gameMap[toIndex(12,y)] += 10; 
			gameMap[toIndex(playerX()+1,y)] = towerSolution1[puzzleInc] + 80;
			puzzleInc++; 
			alphaMap[toIndex(playerX()+1,y)] = startingAlpha;
			alphaMap[toIndex(playerX(),y)] = startingAlpha;
		}
		tower1Active = false;
		playSnd(randomInt(4) + 146); 
		setTileTo(11,7,1);
		setTileTo(10,9,75);
	}
}

function towerPuzzle2State()
{
	let state = 0; let i = 0;
	for(let x = 5; x <= 9; x++)
	{ if(gameMap[toIndex(x,12)] == towerSolution2[i]) { state++; } i++; }
	if(state == 5) { 
		puzzleInc = 0;
		for(let x = 5; x <= 9; x++)
		{ // alphaMap
			gameMap[toIndex(x,12)] += 10; 
			gameMap[toIndex(x,playerY()+1)] = towerSolution2[puzzleInc] + 80;
			puzzleInc++; 
			alphaMap[toIndex(x,playerY()+1)] = startingAlpha;
			alphaMap[toIndex(x,playerY())] = startingAlpha;
		}
		tower2Active = false;
		playSnd(randomInt(4) + 146); 
		setTileTo(7,11,1);
		setTileTo(5,10,76);
	}
}

function towerPuzzle3State()
{
	let state = 0; let i = 0;
	for(let y = 5; y <= 9; y++)
	{ if(gameMap[toIndex(2,y)] == towerSolution3[i]) { state++; } i++; }
	if(state == 5) { 
		puzzleInc = 0;
		for(let y = 5; y <= 9; y++)
		{ // alphaMap
			gameMap[toIndex(2,y)] += 10; 
			gameMap[toIndex(playerX()-1,y)] = towerSolution3[puzzleInc] + 80;
			puzzleInc++; 
			alphaMap[toIndex(playerX()-1,y)] = startingAlpha;
			alphaMap[toIndex(playerX(),y)] = startingAlpha;
			 
		}
		tower3Active = false;
		playSnd(randomInt(4) + 146); 
		setTileTo(3,7,1);
		setTileTo(4,5,74);
		setTileTo(5,4,77);
		setTileTo(9,4,76);
	}
}

function towerPuzzle4State()
{
	let state = 0; let i = 0;
	for(let x = 5; x <= 9; x++)
	{ if(gameMap[toIndex(x,2)] == towerSolution4[i]) { state++; } i++; }
	if(state == 5) { 
		puzzleInc = 0;
		for(let x = 5; x <= 9; x++)
		{ // alphaMap
			gameMap[toIndex(x,2)] += 10; 
			gameMap[toIndex(x,playerY()-1)] = towerSolution4[puzzleInc] + 80;
			puzzleInc++; 
			alphaMap[toIndex(x,playerY()-1)] = startingAlpha;
			alphaMap[toIndex(x,playerY())] = startingAlpha;
		}
		tower4Active = false;
		playSnd(randomInt(4) + 146); 
		setTileTo(7,3,1);
		setTileTo(7,5,1);
		setTileTo(7,6,1);
		alphaMap[toIndex(7,5)] = startingAlpha;
		alphaMap[toIndex(7,6)] = startingAlpha;
	}
}


function dropFinalTowerPuzzle()
{

	updateTextBar('You got the King\'s HEADPHONES! Seek paths heard, not seen, by pushing SPACE.')
	starting_pos = [7,7];
	let d1=[]; let d2=[]; let d3=[]; let d4=[]; let d5=[]; let d6=[]; 
	let d7=[]; let d8=[]; let d9=[]; let d10=[];

	for(let i = 1; i < 11; i++)
	{
		let r;
		if(i == 1) { r = randomInt(1); if(r == 1) { d1 = [138,0]; t1 = [137,1]; } else { d1 = [0,138]; t1 = [1,137]; }}
		if(i == 2) { r = randomInt(2); 
						if(r == 2) { d2 = [138,0,0]; t2 = [137,1,1]; } 
						else if(r==1) { d2 = [0,138,0]; t2 = [1,137,1]; }  
						else { d2 = [0,0,138]; t2 = [1,1,137]; } }
		if(i == 3) { r = randomInt(1); if(r == 1) { d3 = [138,0]; t3 = [137,1]; } else { d3 = [0,138]; t3 = [1,137]; }}
		if(i == 4) { r = randomInt(1); if(r == 1) { d4 = [138,0]; t4 = [137,1]; } else { d4 = [0,138]; t4 = [1,137]; }}
		if(i == 5) { r = randomInt(1); if(r == 1) { d5 = [138,0]; t5 = [137,1]; } else { d5 = [0,138]; t5 = [1,137]; }}
		if(i == 6) { r = randomInt(1); if(r == 1) { d6 = [138,0]; t6 = [137,1]; } else { d6 = [0,138]; t6 = [1,137]; }}
		if(i == 7) { r = randomInt(1); if(r == 1) { d7 = [138,0]; t7 = [137,1]; } else { d7 = [0,138]; t7 = [1,137]; }}
		if(i == 8) { r = randomInt(1); if(r == 1) { d8 = [138,0]; t8 = [137,1]; } else { d8 = [0,138]; t8 = [1,137]; }}
		if(i == 9) { r = randomInt(1); if(r == 1) { d9 = [138,0]; t9 = [137,1]; } else { d9 = [0,138]; t9 = [1,137]; }}
		if(i == 10) { r = randomInt(2); 
			if(r == 2) { d10 = [139,0,0]; t10 = [137,1,1]; } 
			else if(r==1) { d10 = [0,139,0]; t10 = [1,137,1]; }  
			else { d10 = [0,0,139]; t10 = [1,1,137]; } }
	}

	gameMap = [ 46, 46, 46, 46, 0,  0,  0,  0,  0,  0,  0,  46, 46, 46, 46, 
				46, 46, 46, 0,  0,  0,  0,  0,  0,  0,  0,  0,  46, 46, 46, 
				46, 46, 0,  0,  1,  d9[0],t9[0],1,  1,  d8[0],t8[0],0,  0,  46, 46, 
				46, 0,  0,  66, 1,  d9[1],t9[1],1,  1,  d8[1],t8[1],1,  0,  0,  46, 
				0,  0,  45,  1,  1,  0,  1,  137,1,  0,  1,  1,  1,  0,  0,  
				0,  0,  0,  0,  0,  0,  0,  138,0,  0,  0,  d7[0],d7[1],0,  0,  
				0,  d10[0],t10[0],1,  t6[0],d6[0],1,  1,  t1[0],d1[0],1,  t7[0],t7[1],0,  0,  
				0,  d10[1],t10[1],1,  t6[1],d6[1],1,  1,  t1[1],d1[1],1,  1,  1,  0,  0,  
				0,  d10[2],t10[2],1,  1,  0,  1,  1,  1,  0,  t2[0],t2[1],t2[2],0,  0,  
				0,  0,  0,  d5[0],d5[1],0,  0,  0,  0,  0,  d2[0],d2[1],d2[2],0,  0,  
				0,  0,  1,  t5[0],t5[1],0,  1,  1,  1,  0,  1,  1,  1,  0,  0,  
				46, 0,  0,  1,  1,  d4[0],t4[0],1,  1,  d3[0],t3[0],1,  0,  0,  46, 
				46, 46, 0,  0,  1,  d4[1],t4[1],1,  1,  d3[1],t3[1],0,  0,  46, 46, 
				46, 46, 46, 0,  0,  0,  0,  0,  0,  0,  0,  0,  46, 46, 46, 
				46, 46, 46, 46, 0,  0,  0,  0,  0,  0,  0,  46, 46, 46, 46]; 

	let r = randomInt(3);
	let newMap = []; 
	if(r == 0) 
	{ 
		newMap = gameMap;
	}
	else if(r == 1) 
	{ 
		let i = mapW-1;
		for(let x = 0; x < mapW; x++)
		{
			for(let y = 0; y < mapW; y++)
			{
				newMap[toIndex(x,y)] = gameMap[toIndex(i,y)];
			}
			i--;
		}
	}
	else if(r == 2)
	{
		let x = 0;
		for(let y = gameMap.length-1; y >= 0; y--)
		{
			newMap[y] = gameMap[x];
			x++;
		}
	}
	else if(r == 3)
	{
		let i = mapH-1;
		for(let y = 0; y < mapH; y++)
		{
			for(let x = 0; x < mapW; x++)
			{
				newMap[toIndex(x,y)] = gameMap[toIndex(x,i)];
			}
			i--;
		}
	}
	gameMap = newMap;

	if(firstFinalPuzzleDrop)
	{
		for(let x = 0; x < mapW; x++)
		{
			for(let y = 0; y < mapH; y++)
			{
				if(x == 7 && y == 7) {}
				else if(gameMap[toIndex(x,y)] == 1 || (gameMap[toIndex(x,y)] >= 136 && gameMap[toIndex(x,y)] <= 137 )) { itemMap[toIndex(x,y)] = randomInt(6) + 2; }
			}
		}
		firstFinalPuzzleDrop = false;
	}
	else
	{
		for(let i = 0; i < gameMap.length; i++)
		{ 
			if(gameMap[i] != 1 && gameMap[i] != 136 && gameMap[i] != 137) { itemMap[i] = 0; }
		}
	}
}
