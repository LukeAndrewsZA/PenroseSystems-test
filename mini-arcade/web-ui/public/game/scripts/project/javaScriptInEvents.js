

const scriptsInEvents = {

	async EventSheet1_Event5(runtime, localVars)
	{
		// On layout start
		window.parent.postMessage({ type: 'ready' }, '*');
		
		runtime.timeScale = 0; // idle in boot
		
		if (!window.__initStart) {
		  window.__initStart = true;
		  const p = runtime.objects.Player?.getFirstInstance();
		  window.__playerStartX = p?.x ?? 0;
		  window.__playerStartY = p?.y ?? 0;
		}
		
		window.addEventListener('message', (e) => {
		  const m = e.data || {};
		
		  if (m.type === 'start') {
		    // fresh run
		    runtime.globalVars.Score = 0;
		    runtime.globalVars.gameState = "playing";
		    runtime.timeScale = 1;                 // ✅ actually start running
		    // runtime.callFunction("StartRun");   // if you have a function to init timers/speeds
		  }
		
		  if (m.type === 'pause') {
		    runtime.timeScale = 0;
		  }
		
		  if (m.type === 'resume') {
		    runtime.timeScale = 1;
		  }
		
		  if (m.type === 'restart') {
		    // clear world
		    for (const o of (runtime.objects.ObstacleShort?.getAllInstances() ?? [])) o.destroy();
		    for (const g of (runtime.objects.trigger?.getAllInstances() ?? [])) g.destroy();
		
		    // reset globals
		    runtime.globalVars.Score        = 0;
		    runtime.globalVars.Difficulty   = 1;      
		    runtime.globalVars.spawnTimer   = 0;
		    runtime.globalVars.spawnInterval= 0;
		    runtime.globalVars.obstacleCount= 0;
		    runtime.globalVars.moveDown     = 0;
		
		    // reset player to saved spawn
		    const p = runtime.objects.Player?.getFirstInstance();
		    if (p) {
		      p.x = window.__playerStartX ?? p.x;
		      p.y = window.__playerStartY ?? p.y;
		      try { p.behaviors.Platform.setVectorX(0); } catch {}
		      try { p.behaviors.Platform.setVectorY(0); } catch {}
		    }
		
		    // back to boot, paused; parent will send 'start' again
		    runtime.globalVars.gameState = "boot";
		    runtime.timeScale = 0;
		
		    // make UI show 0 immediately
		    window.parent.postMessage({ type: 'score', value: 0 }, '*');
		  }
		
		  if (m.type === 'settings') {
		    // map UI → game
		    runtime.globalVars.Difficulty = (m.difficulty === 'hard') ? 2 : 1; 
		    runtime.globalVars.SoundOn    = m.sound ? 1 : 0;                    
		  }
		});
		
	},

	async EventSheet1_Event9(runtime, localVars)
	{
		// Get current score and diff
		const score = runtime.globalVars.Score | 0;
		console.log(score);
		const difficulty = 1 + Math.floor(score / 10);   // ramps every 10 points
		
		// Only update if it actually changed
		if (runtime.globalVars.Difficulty !== difficulty) {
		    
		    runtime.globalVars.Difficulty = difficulty;
		
		    // Adjust speed based on diff
		    runtime.globalVars.runSpeed = 10 + difficulty * 2;
		
		    // Adjust spawn interval with clamping included
		    const newInterval = 1.2 - difficulty * 0.12;
		    runtime.globalVars.spawnInterval = Math.max(0.35, newInterval);
		
		    console.log("Difficulty ramped to", difficulty,
		                "runSpeed:", runtime.globalVars.runSpeed,
		                "spawnInterval:", runtime.globalVars.spawnInterval);
		}
	},

	async EventSheet1_Event11(runtime, localVars)
	{
		window.parent.postMessage({ type: 'score', value: runtime.globalVars.Score }, '*');
	},

	async EventSheet1_Event4(runtime, localVars)
	{
		
	},

	async EventSheet1_Event13(runtime, localVars)
	{
		
		runtime.globalVars.gameState = "gameover";
		runtime.timeScale = 0;
		
		console.log("Difficulty is", runtime.globalVars.gameState );
		
		window.parent.postMessage({ 
		  type: 'state', 
		  value: 'gameover' 
		}, '*');
		
		window.parent.postMessage({ 
		  type: 'gameover', 
		  finalScore: runtime.globalVars.Score 
		}, '*');
	}
};

globalThis.C3.JavaScriptInEvents = scriptsInEvents;
