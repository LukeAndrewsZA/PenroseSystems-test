const C3 = self.C3;
self.C3_GetObjectRefTable = function () {
	return [
		C3.Plugins.Sprite,
		C3.Behaviors.Platform,
		C3.Behaviors.scrollto,
		C3.Behaviors.solid,
		C3.Plugins.Keyboard,
		C3.Behaviors.Bullet,
		C3.Behaviors.Pin,
		C3.Plugins.Keyboard.Cnds.OnKey,
		C3.Behaviors.Platform.Acts.SimulateControl,
		C3.Behaviors.Platform.Cnds.IsOnFloor,
		C3.Behaviors.Platform.Acts.SetVectorY,
		C3.Plugins.System.Cnds.OnLayoutStart,
		C3.Plugins.System.Acts.SetLayerScale,
		C3.JavaScriptInEvents.EventSheet1_Event4,
		C3.JavaScriptInEvents.EventSheet1_Event5,
		C3.Plugins.System.Cnds.EveryTick,
		C3.Plugins.System.Cnds.CompareVar,
		C3.Plugins.System.Acts.AddVar,
		C3.Plugins.System.Exps.dt,
		C3.Plugins.System.Cnds.Compare,
		C3.Plugins.System.Acts.CreateObject,
		C3.Plugins.System.Exps.layoutwidth,
		C3.Plugins.System.Exps.random,
		C3.Behaviors.Pin.Acts.PinByProperties,
		C3.Plugins.Sprite.Acts.SetAngle,
		C3.Plugins.System.Acts.SetVar,
		C3.Plugins.Sprite.Cnds.OnCollision,
		C3.JavaScriptInEvents.EventSheet1_Event9,
		C3.Plugins.System.Cnds.Every,
		C3.JavaScriptInEvents.EventSheet1_Event11,
		C3.JavaScriptInEvents.EventSheet1_Event13
	];
};
self.C3_JsPropNameTable = [
	{Platform: 0},
	{ScrollTo: 0},
	{Player: 0},
	{Solid: 0},
	{Keyboard: 0},
	{Bullet: 0},
	{ObstacleShort: 0},
	{ObstacleTall: 0},
	{Pin: 0},
	{trigger: 0},
	{gameState: 0},
	{Score: 0},
	{runSpeed: 0},
	{Difficulty: 0},
	{postTick: 0},
	{spawnTimer: 0},
	{randomSpawner: 0},
	{obstacleCount: 0},
	{moveDown: 0}
];

self.InstanceType = {
	Player: class extends self.ISpriteInstance {},
	Platform: class extends self.ISpriteInstance {},
	Keyboard: class extends self.IInstance {},
	ObstacleShort: class extends self.ISpriteInstance {},
	ObstacleTall: class extends self.ISpriteInstance {},
	trigger: class extends self.ISpriteInstance {}
}