const log = console.log;

const _ = require('lodash');

const MODE_PLAYER   = 'player';
const MODE_MONSTER  = 'monster';

const EFFECT_NORMAL = 96;
const EFFECT_HASTE  = 126;
const EFFECT_SLOW   = 48;

const MAX_GAUGE     = 65536;
const TIME_SLICE    = 33;

const getPercentage = (gauge) =>
{
	return gauge / MAX_GAUGE;
};

const characterTick = (effect, speed, gauge)=>
{
	const result = (((effect * (speed + 20)) / 16));
	gauge += Math.round(result);
    return gauge;
};
// Normal speed:

// ((96 * (Speed + 20)) * (255 - ((Battle Speed - 1) * 24))) / 16

// If Hasted:

// ((126 * (Speed + 20)) * (255 - ((Battle Speed - 1) * 24))) / 16

// If Slowed:

// ((48 * (Speed + 20)) * (255 - ((Battle Speed - 1) * 24))) / 16

// export function *timerBrowserNotNode()
// {
// 	let time = performance.now();
// 	let lastTick = time;
// 	yield {time, difference: 0};
// 	while(true)
// 	{
// 		time = performance.now();
// 		yield {time, difference: time - lastTick};
// 	}
// }

class Timer
{
	constructor(window, performance)
	{
		const me = this;
		me.window = window;
		me.performance = performance;
		me.running = false;
		me.tickBound = me.tick.bind(me);
	}

	tick(time)
	{
		const me = this;
		const now = me.performance.now();
		const previousTick = me.lastTick;
		me.difference = now - me.lastTick;
		me.lastTick = now;
		if(me.running === true)
		{
			me.window.requestAnimationFrame(me.tickBound);
			if(me.tickCallback)
			{
				me.tickCallback(time, me.difference, now, previousTick);
			}
		}
	}

	startTimer(callback)
	{
		const me = this;
		me.running = true;
		me.tickCallback = callback;
		me.lastTick = me.performance.now();
		me.window.requestAnimationFrame(me.tickBound);
	}

	stopTimer()
	{
		const me = this;
		me.running = false;
	}

	resume()
	{
		const me = this;
		me.running = true;
		me.window.requestAnimationFrame(me.tickBound);
	}
}

// TODO: make monster mode work, I don't get the algo man
class BattleTimer
{
	constructor(window, performance, counter=0, gauge=0, effect=EFFECT_NORMAL, mode=MODE_PLAYER, speed=1)
	{
		const me = this;
		me.window = window;
		me.performance = performance;
		me.timer = new Timer(me.window, me.performance);
		me.counter = counter;
		me.gauge = gauge;
		me.effect = effect;
		me.mode = mode;
		me.speed = speed;
	}

	startTimer(doneCallback, progressCallback)
	{
		const me = this;
		me.doneCallback = doneCallback;
		me.progressCallback = progressCallback;
		const THIRTY_TIMES_A_SECOND = 1000 / 30;
		if(_.isNil(me.thirtyMillisecondCounter))
		{
			me.thirtyMillisecondCounter = 0;
		}
		me.timer.startTimer((time, difference, now, previousTick)=>
		{
			me.thirtyMillisecondCounter += difference;
			if(me.thirtyMillisecondCounter >= THIRTY_TIMES_A_SECOND)
			{
				me.thirtyMillisecondCounter = 0;
				me.counter++;
				me.gauge = characterTick(me.effect, me.speed, me.gauge);
				if(me.progressCallback)
				{
					me.progressCallback(getPercentage(me.gauge), me.gauge);
				}
				if(me.gauge >= MAX_GAUGE)
				{
					me.gauge = MAX_GAUGE;
					me.stopTimer();
					me.doneCallback(1, me.gauge);
				}
			}
		});
	}

	stopTimer()
	{
		const me = this;
		me.timer.stopTimer();
	}
}

module.exports = {
	MODE_PLAYER,
	MODE_MONSTER,
	EFFECT_HASTE,
	EFFECT_NORMAL,
	EFFECT_SLOW,
	MAX_GAUGE,
	getPercentage,
	characterTick,
	Timer,
	BattleTimer
};
